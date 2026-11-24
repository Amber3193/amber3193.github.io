/* 确定性计分。纯函数，不依赖界面，可在 Node 中测试。 */
(function (root) {
  function isNum(v) { return typeof v === "number" && !isNaN(v); }
  function itemOptions(instr, i) { var it = instr.items[i]; return (it && typeof it === "object" && it.options) ? it.options : instr.options; }
  function itemText(instr, i) { var it = instr.items[i]; return typeof it === "string" ? it : it.text; }
  function itemStem(instr, i) { var it = instr.items[i]; return (it && typeof it === "object" && it.stem) ? it.stem : instr.stem; }

  function score(instr, answers) {
    var n = instr.items.length;
    if (!Array.isArray(answers)) answers = [];
    // PHQ 惊恐模块：第一题回答“否”时，其余题目按原问卷规则跳过
    if (instr.scoring.method === "phqpd" && answers[0] === 0) {
      return { instrument: instr.id, answered: 1, total: 0, band: "noattack", subs: null, detail: { attacks: false }, valid: true, missing: [], invalid: [], flags: [], reason: null };
    }
    var missing = [], invalid = [], vals = [];
    for (var i = 0; i < n; i++) {
      var v = answers[i], opts = itemOptions(instr, i).map(function (o) { return o.value; });
      if (!isNum(v)) { missing.push(i); vals.push(null); continue; }
      if (opts.indexOf(v) === -1) { invalid.push(i); vals.push(null); continue; }
      if (instr.reverse && instr.reverse.indexOf(i) !== -1) v = Math.max.apply(null, opts) + Math.min.apply(null, opts) - v;
      vals.push(v);
    }
    var flags = [];
    (instr.riskItems || []).forEach(function (r) {
      var v = answers[r.index];
      if (isNum(v) && v >= r.minValue && flags.indexOf(r.flag) === -1) flags.push(r.flag);
    });
    var res = { instrument: instr.id, answered: n - missing.length - invalid.length, total: null, band: null, subs: null, detail: null,
      valid: missing.length === 0 && invalid.length === 0, missing: missing, invalid: invalid, flags: flags, reason: null };
    if (!res.valid) { res.reason = invalid.length ? "invalid_answer" : "missing_answers"; return res; }

    var sum = function (a, b) { return a + b; };
    var m = instr.scoring.method;
    if (m === "sum") res.total = vals.reduce(sum, 0) * (instr.scoring.multiplier || 1);
    else if (m === "mean") res.total = Math.round(vals.reduce(sum, 0) / n * 10) / 10;
    else if (m === "count_ge") res.total = vals.filter(function (v, i) { return v >= instr.scoring.cuts[i]; }).length;
    else if (m === "subscales") {
      res.subs = {};
      instr.scoring.subs.forEach(function (s) {
        var part = vals.slice(s.from, s.to + 1);
        res.subs[s.key] = Math.round(part.reduce(sum, 0) / part.length * 100) / 100;
      });
    } else if (m === "mdq") {
      var count = vals.slice(0, 13).reduce(sum, 0), same = vals[13], problem = vals[14];
      res.total = count;
      res.detail = { count: count, sameTime: same === 1, problem: problem };
      res.band = (count >= 7 && same === 1 && problem >= 2) ? "positive" : "negative";
      return res;
    } else if (m === "phqpd") {
      var core = vals[0] === 1 && vals[1] === 1 && vals[2] === 1 && vals[3] === 1, sym = vals.slice(4).reduce(sum, 0);
      res.total = sym; res.detail = { attacks: true, core: core, symptoms: sym };
      res.band = (core && sym >= 4) ? "positive" : "attacks";
      return res;
    } else if (m === "itq") {
      var p = function (i) { return vals[i] >= 2; };
      var re = p(0) || p(1), av = p(2) || p(3), th = p(4) || p(5), fp = p(6) || p(7) || p(8);
      var ad = p(9) || p(10), nsc = p(11) || p(12), dr = p(13) || p(14), fd = p(15) || p(16) || p(17);
      var ptsd = re && av && th && fp, dso = ad && nsc && dr && fd;
      res.subs = { ptsdSum: vals.slice(0, 6).reduce(sum, 0), dsoSum: vals.slice(9, 15).reduce(sum, 0) };
      res.detail = { re: re, av: av, th: th, ptsdImpair: fp, ad: ad, nsc: nsc, dr: dr, dsoImpair: fd };
      res.band = (ptsd && dso) ? "cptsd" : (ptsd ? "ptsd" : "none"); // 互斥：符合 CPTSD 时不再报告 PTSD
      return res;
    }
    if (instr.scoring.subSums) res.subs = instr.scoring.subSums.map(function (g) { return { label: g.label, sum: g.items.reduce(function (t, i) { return t + vals[i]; }, 0), max: g.items.length * 4 }; });
    if (res.total !== null) {
      for (var b = 0; b < instr.bands.length; b++) {
        var bd = instr.bands[b];
        if (res.total >= bd.min && res.total <= bd.max) { res.band = bd.key; break; }
      }
    }
    return res;
  }

  function meetsThreshold(instr, total) {
    if (total == null) return [];
    return (instr.thresholds || []).filter(function (t) { return t.dir === "le" ? total <= t.score : total >= t.score; });
  }
  function ageEligible(age) { return typeof age === "number" && age >= 18 && age <= 120; }

  var api = { score: score, meetsThreshold: meetsThreshold, ageEligible: ageEligible, itemOptions: itemOptions, itemText: itemText, itemStem: itemStem };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Scoring = api;
})(this);
