/* 界面与流程。依赖 INSTRUMENTS / Scoring / Analysis / COPY / RESOURCES / CATALOG（均为本地文件）。
 * 不发起任何网络请求；不把答案写入 URL；默认不保存任何数据。 */
(function () {
  var I = window.INSTRUMENTS, S = window.Scoring, A = window.Analysis, C = window.COPY, R = window.RESOURCES;
  var STORE_KEY = "xj2_saved_results", LEGACY_KEYS = ["xj_hist"];
  var state = { view: "home", ageOk: false, inst: null, idx: 0, answers: [], impair: null, phase: "items", region: null, lastResult: null, consent: false, session: {}, attempts: {}, queue: [], queueOn: false, persist: false };
  var SESSION_KEY = "xj2_session";
  function loadPersisted() {
    try { var d = JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); if (d && d.session) { state.session = d.session; state.attempts = d.attempts || {}; state.persist = true; } } catch (e) {}
  }
  function persist() {
    if (!state.persist) return;
    try { localStorage.setItem(SESSION_KEY, JSON.stringify({ session: state.session, attempts: state.attempts })); } catch (e) {}
  }
  function localDate() { var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function lateNight() { var h = new Date().getHours(); return h < 5; }

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function ul(list) { return "<ul>" + list.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul>"; }

  /* ---------- 存储（仅在用户明确同意后写入） ---------- */
  function readSaved() { try { return JSON.parse(localStorage.getItem(STORE_KEY) || "[]"); } catch (e) { return []; } }
  function writeSaved(list) { try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); return true; } catch (e) { return false; } }
  function hasLegacy() { try { return LEGACY_KEYS.some(function (k) { return localStorage.getItem(k) !== null; }); } catch (e) { return false; } }
  function deleteAll() { try { localStorage.removeItem(STORE_KEY); localStorage.removeItem(SESSION_KEY); LEGACY_KEYS.forEach(function (k) { localStorage.removeItem(k); }); return true; } catch (e) { return false; } }

  function scoreText(x, r) {
    if (!r.valid) return "未计分";
    if (x.scoring.method === "subscales") return x.scoring.subs.map(function (s) { return s.label + " " + r.subs[s.key].toFixed(2); }).join(" · ");
    if (x.scoring.method === "itq") return (x.bands.filter(function (b) { return b.key === r.band; })[0] || {}).label;
    if (x.scoring.method === "mdq") return (r.band === "positive" ? "阳性" : "未达阳性") + "（" + r.total + "/13 项）";
    if (x.scoring.method === "phqpd") return (x.bands.filter(function (b) { return b.key === r.band; })[0] || {}).label;
    if (x.scoring.method === "mean") return r.total + " / 100（平均）";
    return r.total + " / " + x.scoring.max;
  }

  /* ---------- 路由与操作 ---------- */
  function go(view) { state.view = view; render(); window.scrollTo(0, 0); }
  var busy = false;
  window.App = {
    go: go,
    setAge: function (ok) { state.ageOk = ok; go(ok ? "choose" : "minor"); },
    open: function (id) { state.inst = I[id]; state.consent = false; go("intro"); },
    toggleConsent: function (el) { state.consent = el.checked; $("startBtn").disabled = !el.checked; },
    start: function () { if (!state.consent) return; state.idx = 0; state.answers = new Array(state.inst.items.length).fill(null); state.impair = null; state.phase = "items"; go("quiz"); },
    answer: function (v) {
      if (busy) return; busy = true; setTimeout(function () { busy = false; }, 420);
      // 星辰版：先让选中的选项亮一下，再进入下一题（只影响动画，不影响计分）
      var bs = document.querySelectorAll(".opts .opt");
      for (var i = 0; i < bs.length; i++) bs[i].classList.toggle("sel", bs[i].getAttribute("onclick") === "App.answer(" + v + ")");
      setTimeout(function () {
        if (state.phase === "items") {
          state.answers[state.idx] = v;
          if (state.inst.scoring.method === "phqpd" && state.idx === 0 && v === 0) { finish(); return; }
          App.next();
        } else { state.impair = v; finish(); }
      }, 320);
    },
    skip: function () { if (state.phase === "items") { state.answers[state.idx] = null; App.next(); } else { state.impair = null; finish(); } },
    next: function () {
      if (state.idx < state.inst.items.length - 1) { state.idx++; render(); window.scrollTo(0, 0); }
      else if (state.inst.impairment) { state.phase = "impair"; render(); }
      else finish();
    },
    prev: function () {
      if (state.phase === "impair") { state.phase = "items"; state.idx = state.inst.items.length - 1; render(); }
      else if (state.idx > 0) { state.idx--; render(); }
    },
    exit: function () { state.answers = []; state.impair = null; go("choose"); },
    region: function (r) { state.region = r; render(); },
    save: function () {
      var r = state.lastResult; if (!r || !r.valid) return;
      var list = readSaved();
      list.push({ id: r.instrument, total: r.total, band: r.band, subs: r.subs, date: localDate() });
      var ok = writeSaved(list);
      $("saveMsg").textContent = ok ? "已保存在这台设备的浏览器中，可随时在“隐私”里删除。" : "保存失败：这个浏览器不允许本地存储。";
      $("saveBtn").disabled = true;
    },
    clearSession: function () { state.session = {}; state.attempts = {}; state.queue = []; state.queueOn = false; try { localStorage.removeItem(SESSION_KEY); } catch (e) {} go("choose"); },
    togglePersist: function (el) {
      state.persist = el.checked;
      if (state.persist) persist(); else { try { localStorage.removeItem(SESSION_KEY); } catch (e) {} }
      var m = $("persistMsg"); if (m) m.textContent = state.persist ? "已开启：本次结果会保存在这台设备上，刷新也不会丢，可随时关闭或删除。" : "已关闭：本次结果只在当前页面中，刷新即消失。";
    },
    queueStart: function () { state.queue = A.ORDER.filter(function (id) { return !state.session[id]; }); state.queueOn = false; go("queue"); },
    queueGo: function () { if (!state.queue.length) return go("analysis"); state.queueOn = true; state.inst = I[state.queue[0]]; state.consent = true; go("intro"); },
    queueSkip: function () { state.queue.shift(); if (state.queue.length) App.queueGo(); else { state.queueOn = false; go("analysis"); } },
    queueNext: function () { App.queueGo(); },
    queueStop: function () { state.queueOn = false; state.queue = []; go(Object.keys(state.session).length >= 2 ? "analysis" : "choose"); },
    copyDoctor: function () {
      var txt = $("docText").value;
      try { navigator.clipboard.writeText(txt).then(function () { $("copyMsg").textContent = "已复制，可以粘贴到备忘录或发给医生。"; }, function () { $("docText").select(); $("copyMsg").textContent = "无法自动复制，请长按上面的文字手动复制。"; }); }
      catch (e) { $("docText").select(); $("copyMsg").textContent = "无法自动复制，请长按上面的文字手动复制。"; }
    },
    deleteAll: function () { var ok = deleteAll(); render(); var m = $("delMsg"); if (m) m.textContent = ok ? "已删除本站在这台设备上保存的全部数据。" : "删除失败，请在浏览器设置中清除本站数据。"; }
  };

  function finish() {
    var r = S.score(state.inst, state.answers);
    r.impair = state.impair;
    state.lastResult = r;
    // 本次访问内保留（仅内存，关闭页面即消失），用于综合分析
    state.session[state.inst.id] = { result: r, answers: state.answers.slice(), time: Date.now() };
    (state.attempts[state.inst.id] = state.attempts[state.inst.id] || []).push({ valid: r.valid, band: r.band, total: r.total, time: Date.now() });
    if (state.queueOn && state.queue[0] === state.inst.id) state.queue.shift();
    persist();
    go("result");
  }

  /* ---------- 共用片段 ---------- */
  function regionPicker() {
    var keys = Object.keys(R.regions);
    var h = '<div class="chips">' + keys.map(function (k) {
      return '<button class="chip' + (state.region === k ? " on" : "") + '" onclick="App.region(\'' + k + '\')">' + esc(R.regions[k].name) + "</button>";
    }).join("") + "</div>";
    if (state.region) {
      var g = R.regions[state.region];
      h += g.lines.map(function (l) { return '<div class="line"><div class="num">' + esc(l.number) + '</div><div><b>' + esc(l.name) + '</b><br><span class="muted">' + esc(l.note) + "</span></div></div>"; }).join("");
      h += '<p class="emer">' + esc(g.emergency) + "</p>";
    } else h += '<p class="muted">请选择你现在所在的地区，我们只显示核验过的号码。</p>';
    return h + '<p class="tiny">号码核验日期：' + R.verifiedOn + "。如有变更，请以当地官方信息为准。</p>";
  }
  var SAFETY = {
    self_harm_thoughts: "你在一道题里表示，最近有过“不如死掉”或伤害自己的念头。谢谢你如实回答。有这样的念头时，你不需要一个人扛着，现在就可以找人说说。",
    self_harm_history: "你在一道题里表示，曾经伤害过自己或尝试过自杀。谢谢你愿意回答。如果现在也有这样的念头或冲动，请现在就联系下面的人；如果没有，也欢迎在需要的时候回来找这些资源。",
    risky_behavior: "你表示最近常常冒很大的风险，或做可能伤害自己的事。你的安全很重要，如果你需要有人一起想办法，可以联系下面的资源。"
  };
  function safetyBox(flags) {
    if (!flags.length) return "";
    return '<div class="safety"><h3>先停一下，关心一下你</h3>' + flags.map(function (f) { return "<p>" + esc(SAFETY[f]) + "</p>"; }).join("") + regionPicker() + "<p>也可以现在给一个你信任的人发消息，告诉他/她你需要陪伴。</p></div>";
  }
  function badge(x) {
    var ok = x.license.status === "verified";
    return '<span class="st ' + (ok ? "prototype" : "pending") + '">' + (ok ? "授权已核验" : "授权待核验") + "</span>";
  }
  function backBtn() { return '<button class="ghostbtn" onclick="App.go(\'' + (state.ageOk ? "choose" : "home") + '\')">返回</button>'; }

  /* ---------- 视图 ---------- */
  var V = {};
  V.home = function () {
    return '<section class="hero"><h1>了解自己最近的状态</h1><p>这里提供多份经过研究验证的自评问卷，涵盖情绪、创伤、解离、人格与关系、注意力、饮酒和饮食。每次做一份，做完两份以上可以看综合分析。</p></section>' +
      '<div class="card"><h3>开始之前</h3><ul class="plain"><li>这些问卷是<b>筛查</b>，不是诊断。</li><li>' + esc(C.notRealtime) + "</li><li>回答只在这台设备上计算，不上传，默认不保存。</li><li>每题都可以跳过，随时可以退出。</li></ul>" +
      '<h3 style="margin-top:16px">你的年龄是？</h3><p class="muted">这些问卷只适用于成年人。</p><div class="row2"><button class="primary" onclick="App.setAge(true)">18 岁及以上</button><button class="ghostbtn" onclick="App.setAge(false)">未满 18 岁</button></div></div>';
  };
  V.minor = function () {
    return '<section class="hero"><h1>谢谢你愿意了解自己</h1><p>这里的问卷是为成年人设计和验证的，用在未成年人身上结果可能不准确，所以暂时不对你开放。</p></section>' +
      '<div class="card"><h3>你可以这样做</h3><ul class="plain"><li>和家长、老师或学校心理老师聊聊最近的感受</li><li>如果你觉得很难受，或想伤害自己，请马上联系下面的求助电话</li></ul>' + regionPicker() + "</div>" +
      '<button class="ghostbtn" onclick="App.go(\'home\')">返回</button>';
  };
  V.choose = function () {
    var done = Object.keys(state.session).length, groups = {}, order = [];
    A.ORDER.forEach(function (id) { var d = I[id].domain; if (!groups[d]) { groups[d] = []; order.push(d); } groups[d].push(id); });
    var left = A.ORDER.filter(function (id) { return !state.session[id]; });
    var leftMin = left.reduce(function (t, id) { return t + I[id].minutes; }, 0);
    var h = '<section class="hero"><h1>选择一个方面</h1><p class="muted">可以只做你关心的，也可以按推荐顺序连续做。分组只是帮你找到问卷，<b>本身不是筛查</b>。</p></section>';
    h += '<div class="prog"><div class="row3"><b>已完成 ' + done + " / " + A.ORDER.length + '</b><span class="muted">剩余约 ' + leftMin + " 分钟</span></div>" + '<div class="bar"><b style="width:' + Math.round(done / A.ORDER.length * 100) + '%"></b></div>' +
      '<div class="row2">' + (left.length ? '<button class="primary" onclick="App.queueStart()">' + (done ? "继续连续做（剩 " + left.length + " 份）" : "按推荐顺序连续做") + "</button>" : "") +
      (done >= 2 ? '<button class="primary alt" onclick="App.go(\'analysis\')">查看综合分析</button>' : "") + "</div>" +
      '<label class="toggle"><input type="checkbox" ' + (state.persist ? "checked" : "") + ' onchange="App.togglePersist(this)"> 在这台设备上保留本次结果（刷新不丢失，可随时删除）</label><div id="persistMsg" class="tiny"></div></div>';
    if (lateNight()) h += '<div class="card note2">现在是深夜。疲惫时，焦虑和低落的自评通常会偏高；如果觉得累，可以先休息，明天白天再做。</div>';
    order.forEach(function (d) {
      h += '<h2 class="sec">' + esc(d) + '</h2><div class="grid">' + groups[d].map(function (id) {
        var x = I[id], s = state.session[id];
        return '<button class="tcard" onclick="App.open(\'' + id + '\')"><h3>' + esc(x.nameZh) + "</h3><p>" + esc(x.measures) + '</p><div class="meta">' + x.abbr + " · " + x.items.length + " 题 · 约 " + x.minutes + " 分钟 " + badge(x) + "</div>" +
          (s ? '<div class="done">本次已完成：' + esc(scoreText(x, s.result)) + "</div>" : "") + "</button>";
      }).join("") + "</div>";
    });
    h += '<h2 class="sec">说明</h2><button class="tcard soft" onclick="App.go(\'other\')"><h3>本站不提供的内容</h3><p>不提供诊断、用药建议，也不提供“鉴定他人”的工具</p><div class="meta">查看说明</div></button>';
    return h;
  };
  V.other = function () {
    var topics = [
      ["不提供诊断", "所有问卷都是筛查或自我了解工具。是否患有某种障碍，只能由精神科医生或临床心理专业人员通过面谈判断。"],
      ["不提供“鉴定他人”的工具", "本站所有问卷都只用于了解你自己，不提供判断伴侣、家人是否有某种障碍（如自恋型人格障碍）的工具。"],
      ["不提供用药建议", "结果页不会建议你开始、调整或停止任何药物。药物相关问题请咨询医生。"]
    ];
    return '<section class="hero"><h1>本站不提供的内容</h1></section>' + topics.map(function (t) { return '<div class="card"><h3>' + esc(t[0]) + "</h3><p>" + esc(t[1]) + "</p></div>"; }).join("") +
      '<div class="card"><h3>如果你现在很难受</h3>' + regionPicker() + "</div>" + backBtn();
  };
  V.queue = function () {
    var mins = state.queue.reduce(function (t, id) { return t + I[id].minutes; }, 0);
    return '<section class="hero"><h1>连续模式</h1><p class="muted">将按推荐顺序依次做剩下的 ' + state.queue.length + " 份问卷，约 " + mins + " 分钟。可以随时跳过某一份，或中途停下看综合分析。</p></section>" +
      '<div class="card"><ol class="qlist">' + state.queue.map(function (id) { return "<li>" + esc(I[id].nameZh) + ' <span class="muted">' + I[id].abbr + " · " + I[id].items.length + " 题</span></li>"; }).join("") + "</ol>" +
      '<label class="consent"><input type="checkbox" onchange="App.toggleConsent(this)"> 我明白：这些都是自评筛查，不是诊断；本站不是急救服务，没有人实时查看回答；我可以跳过任何问题、任何一份问卷，或随时退出。这一确认适用于接下来的所有问卷。</label>' +
      '<button id="startBtn" class="primary" disabled onclick="App.queueGo()">开始</button></div>' + backBtn();
  };
  V.intro = function () {
    var x = state.inst;
    if (state.queueOn) {
      var pos = A.ORDER.length - state.queue.length + 1;
      return '<div class="qhead"><span>连续模式</span><span>还剩 ' + state.queue.length + " 份</span></div>" +
        '<section class="hero"><h1>' + esc(x.nameZh) + '</h1><p class="muted">' + x.abbr + " · " + x.items.length + " 题 · 约 " + x.minutes + " 分钟 · 回顾" + esc(x.recall) + " " + badge(x) + "</p></section>" +
        (x.preNote ? '<div class="card note2">' + esc(x.preNote) + "</div>" : "") +
        '<div class="card"><p>' + esc(x.measures) + '</p><p class="muted">' + esc(x.notMeasures) + "</p></div>" +
        '<div class="row2"><button id="startBtn" class="primary" onclick="App.start()">开始这一份</button><button class="ghostbtn" onclick="App.queueSkip()">跳过这一份</button><button class="ghostbtn" onclick="App.queueStop()">停止连续模式</button></div>';
    }
    return '<section class="hero"><h1>' + esc(x.nameZh) + '</h1><p class="muted">' + x.abbr + " · " + esc(x.fullName) + " " + badge(x) + "</p></section>" +
      (x.preNote ? '<div class="card note2">' + esc(x.preNote) + "</div>" : "") +
      '<div class="card"><dl class="dl"><dt>它测什么</dt><dd>' + esc(x.measures) + "</dd><dt>它不能做什么</dt><dd>" + esc(x.notMeasures) + "</dd>" +
      "<dt>适用人群</dt><dd>" + esc(x.population) + "</dd><dt>回顾时间</dt><dd>" + esc(x.recall) + "</dd><dt>题目与耗时</dt><dd>" + x.items.length + " 题，约 " + x.minutes + " 分钟</dd>" +
      "<dt>隐私</dt><dd>回答只在本设备计算，不上传、不写入网址、默认不保存。</dd>" +
      "<dt>版本与授权</dt><dd>" + esc(x.textVersion.note) + (x.license.status !== "verified" ? " 授权情况：" + esc(x.license.terms) : "") + "</dd></dl>" +
      '<label class="consent"><input type="checkbox" onchange="App.toggleConsent(this)"> 我明白：这是自评筛查，不是诊断；本站不是急救服务，没有人实时查看回答；我可以跳过任何问题或随时退出。</label>' +
      '<button id="startBtn" class="primary" disabled onclick="App.start()">开始</button></div>' + backBtn();
  };
  V.quiz = function () {
    var x = state.inst, imp = state.phase === "impair", n = x.items.length;
    var q = imp ? x.impairment.text : (S.itemText(x, state.idx) || "");
    var stem = imp ? "" : S.itemStem(x, state.idx);
    var opts = imp ? x.impairment.options : S.itemOptions(x, state.idx);
    var cur = imp ? state.impair : state.answers[state.idx];
    return '<div class="qhead"><span>' + esc(x.nameZh) + "</span><span>" + (imp ? "补充问题（不计分）" : "第 " + (state.idx + 1) + " / " + n + " 题") + "</span></div>" +
      '<div class="bar"><b style="width:' + Math.round((imp ? n : state.idx) / n * 100) + '%"></b></div>' +
      (stem ? '<div class="stem">' + esc(stem) + "</div>" : "") + (q ? '<div class="q">' + esc(q) + "</div>" : '<div style="height:8px"></div>') +
      '<div class="opts' + (opts.length > 7 ? " many" : "") + '">' + opts.map(function (o) {
        return '<button class="opt' + (cur === o.value ? " sel" : "") + '" onclick="App.answer(' + o.value + ')">' + esc(o.label) + "</button>";
      }).join("") + "</div>" +
      '<div class="navrow"><button class="ghostbtn" onclick="App.prev()"' + (!imp && state.idx === 0 ? " disabled" : "") + '>上一题</button><button class="ghostbtn" onclick="App.skip()">跳过此题</button><button class="ghostbtn" onclick="App.exit()">退出</button></div>';
  };
  V.result = function () {
    var x = state.inst, r = state.lastResult, h = safetyBox(r.flags), sec = 0;
    var nextBar = "";
    if (state.queueOn) nextBar = state.queue.length ? '<div class="nextbar"><button class="primary" onclick="App.queueNext()">下一份：' + esc(I[state.queue[0]].nameZh) + "（还剩 " + state.queue.length + ' 份）</button><button class="ghostbtn" onclick="App.queueStop()">停下，看综合分析</button></div>'
      : '<div class="nextbar"><button class="primary" onclick="App.queueStop()">全部完成，查看综合分析</button></div>';
    h += nextBar;
    var S2 = function (t) { sec++; return '<div class="card"><h3>' + sec + ". " + t + "</h3>"; };
    h += '<section class="hero"><h1>本次结果</h1><p>' + esc(C.encourage) + '</p><p class="muted">' + esc(x.nameZh) + " · " + x.abbr + " · 适用于成年人 · 回顾" + esc(x.recall) + "</p></section>";
    h += S2("结果摘要");
    if (!r.valid) h += "<p>你跳过了 " + r.missing.length + " 题（共 " + x.items.length + " 题）。原问卷要求全部作答才能计分，所以<b>本次不计算结果</b>。</p><p class=\"muted\">如果某些题让你不舒服，跳过是完全可以的。</p>";
    else if (x.scoring.method === "subscales") h += "<p>依恋焦虑和依恋回避是两个独立的维度，分数范围都是 1–7，越高表示该维度越明显。这份问卷不把人分成“类型”，也没有分界。</p>";
    else h += "<p>" + esc(C.bands[x.id][r.band]) + "</p>";
    if (r.flags.length) h += "<p><b>无论分数多少，你对涉及安全的那道题的回答，都值得认真对待。</b></p>";
    h += '<p class="muted">' + esc(C.disclaimerShort) + "</p></div>";

    if (r.valid) {
      h += S2("分数与计分依据") + '<div class="score"><span class="n small">' + esc(scoreText(x, r)) + "</span></div>";
      if (x.scoring.method === "subscales") {
        h += x.scoring.subs.map(function (s) { var v = r.subs[s.key]; return '<div class="prow"><span>' + s.label + '</span><div class="ptrack"><b style="width:' + ((v - 1) / 6 * 100) + '%;background:var(--accent)"></b></div><span class="v">' + v.toFixed(2) + "</span></div>"; }).join("");
        h += '<p class="muted">计分：前 18 题平均为依恋焦虑，后 18 题平均为依恋回避（其中 14 题反向计分）。</p>';
      } else if (x.scoring.method === "itq") {
        var dt = r.detail, Y = function (b) { return b ? "✓ 存在" : "— 未达"; };
        h += "<ul><li>再体验：" + Y(dt.re) + "</li><li>回避：" + Y(dt.av) + "</li><li>威胁感：" + Y(dt.th) + "</li><li>PTSD 相关功能受损：" + Y(dt.ptsdImpair) + "</li>" +
          "<li>情绪调节困难：" + Y(dt.ad) + "</li><li>负面自我概念：" + Y(dt.nsc) + "</li><li>人际关系困扰：" + Y(dt.dr) + "</li><li>上述困扰相关功能受损：" + Y(dt.dsoImpair) + "</li></ul>" +
          '<p class="muted">计分：每项症状评分达到“中等”（2 分）及以上视为存在。每组两题中有一题存在即该组存在。PTSD 需三组核心症状加功能受损；复杂性 PTSD 需全部六组加两类功能受损。两者互斥。PTSD 症状总分 ' + r.subs.ptsdSum + "/24，自我组织困扰总分 " + r.subs.dsoSum + "/24。</p>";
      } else if (x.scoring.method === "mdq") {
        h += "<ul><li>13 项表现中回答“是”：" + r.detail.count + " 项（标准：7 项及以上）</li><li>曾在同一段时间出现：" + (r.detail.sameTime ? "是" : "否") + "</li><li>带来的问题：" + ["没有", "小问题", "中等问题", "严重问题"][r.detail.problem] + "（标准：中等或严重）</li></ul>" +
          '<p class="muted">三项都满足才算阳性。一般人群研究中，这份问卷灵敏度约 0.28、特异度约 0.97：达到标准时比较有参考价值；没达到时也可能有遗漏，所以以你自己的感受为准。</p>';
      } else if (x.scoring.method === "phqpd") {
        h += r.detail.attacks ? "<ul><li>突然发作、以前也发生过、出乎意料、让你困扰或担心再发作：" + (r.detail.core ? "四项都是" : "并非四项都是") + "</li><li>最近一次严重发作时的身体症状：" + r.detail.symptoms + " 种（标准：4 种及以上）</li></ul>" : "<p>过去四周没有焦虑发作，其余题目按原问卷规则跳过。</p>";
        h += '<p class="muted">判定规则：前四题都回答“是”，且身体症状 4 种及以上，即符合问卷的惊恐综合征判定规则。</p>';
      } else {
        var met = S.meetsThreshold(x, r.total);
        h += '<p class="muted">计分：' + ({ sum: "各题得分相加" + (x.scoring.multiplier ? "后乘以 " + x.scoring.multiplier : "") + (x.reverse.length ? "（其中 " + x.reverse.length + " 题反向计分）" : ""), mean: "28 题百分比的平均值", count_ge: "统计达到标记程度的题数（前 3 题“有时”及以上、后 3 题“经常”及以上）" })[x.scoring.method] + "。</p>";
        if (x.thresholds.length) h += "<p><b>研究中使用的分界（不同人群不同）：</b></p><ul>" + x.thresholds.map(function (t) {
          return "<li>" + esc(t.who) + "：" + (t.dir === "le" ? "≤" : "≥") + t.score + "，" + esc(t.meaning) + (met.indexOf(t) !== -1 ? "（你的结果达到这一分界）" : "（你的结果未达到）") + "</li>";
        }).join("") + "</ul>"; else h += '<p class="muted">这份问卷没有官方分界。</p>';
        if (r.subs && r.subs.length) h += '<p class="muted">各类别得分：' + r.subs.map(function (g) { return g.label + " " + g.sum + "/" + g.max; }).join("，") + "。</p>";
        if (x.id === "sci") h += '<p class="muted">注意：这份问卷分数越高表示睡眠越好。</p>';
        if (x.id === "npi16") h += '<p class="muted">你在 16 对句子中选了 ' + r.total + " 句较偏向自恋特质的表述。</p>";
      }
      h += '<p class="muted">不确定性：本站使用的是工作译本，研究分界来自特定人群，不一定完全适用于你；单次结果会受最近事件、睡眠和答题时状态影响。' + esc(C.lowScoreNote) + "</p></div>";
    }
    if (x.impairment) h += S2("对日常生活的影响") + "<p>" + (r.impair == null ? "你没有回答这个问题。" : esc(C.impairment[r.impair])) + "</p></div>";
    h += S2("今天就可以试试的小事") + ul(C.support[x.id]) + "</div>";
    h += S2("什么时候可以找人聊聊") + ul(C.seekHelp) + "</div>";
    if (C.askDoctor[x.id][0].charAt(0) !== "（") h += S2("就诊时可以讨论的问题") + ul(C.askDoctor[x.id]) + '<p class="muted">可以把本页截图或记下结果带去。药物相关问题请只听从医生的建议。</p></div>';
    if (r.valid) h += '<div class="card"><h3>要保存这次结果吗？</h3><p class="muted">默认不保存。若保存，只在这台设备的浏览器里存问卷名称、结果和日期，不存逐题答案，不上传，保留到你删除为止。单次或短期内的分数变化不能说明好转或变差。</p><button id="saveBtn" class="ghostbtn" onclick="App.save()">保存到本设备</button> <span id="saveMsg" class="muted"></span></div>';
    if (state.queueOn) return h + nextBar;
    var done = Object.keys(state.session).length;
    h += '<div class="row2"><button class="primary" onclick="App.go(\'choose\')">做另一份问卷</button>' + (done >= 2 ? '<button class="primary alt" onclick="App.go(\'analysis\')">查看综合分析（' + done + " 份）</button>" : "") + '<button class="ghostbtn" onclick="App.go(\'help\')">求助资源</button></div>';
    return h;
  };
  V.analysis = function () {
    var out = A.analyze(state.session, I, C, state.attempts);
    var h = '<section class="hero"><h1>综合分析</h1><p class="muted">把你本次完成的 ' + out.count + " 份问卷放在一起看。这不是诊断，而是帮你理清哪些方面最值得关注、和专业人员沟通时可以说什么。</p></section>";
    if (out.safety.length) h += safetyBox(out.safety);
    var hl = out.headline;
    h += '<div class="card headline"><h3>一眼看懂</h3><p>完成 <b>' + hl.done + "</b> 份，其中 <b>" + hl.reached + "</b> 份达到研究分界。" + (hl.top.length ? "最值得先关注：<b>" + hl.top.map(esc).join("、") + "</b>。" : "") + "</p>" +
      '<div class="row2"><a class="ghostbtn" href="#docbox" onclick="event.preventDefault();document.getElementById(\'docbox\').scrollIntoView({behavior:\'smooth\'})">复制给医生的摘要 ↓</a></div></div>';
    h += '<div class="card"><h3>1. 结果总览</h3>' + out.overview.map(function (o) {
      var lab = { reached: '<span class="st unsuitable">达到研究分界</span>', notReached: '<span class="st prototype">未达到分界</span>', partial: '<span class="st partial">达到部分分界</span>', noCut: '<span class="st pending">无分界·描述性</span>', incomplete: '<span class="st pending">未完整作答</span>' }[o.status];
      return '<div class="cat"><div><b>' + esc(o.name) + "</b> " + o.abbr + " " + lab + '</div><div class="muted">' + esc(o.domain) + " · " + esc(scoreText(I[o.id], o.result)) + "</div></div>";
    }).join("") + "</div>";
    h += '<div class="card"><h3>2. 最值得优先关注的方面</h3>' + (out.priorities.length ? "<ol>" + out.priorities.map(function (p) { return "<li><b>" + esc(p.name) + "</b>：" + esc(p.text || "") + "</li>"; }).join("") + "</ol>" :
      "<p>本次完成的问卷中，没有达到研究分界的方面。" + esc(C.lowScoreNote) + "</p>") + "</div>";
    h += '<div class="card"><h3>3. 交叉提示</h3>' + (out.notes.length ? out.notes.map(function (n) { return '<div class="pat"><h4>' + esc(n.title) + "</h4><p>" + esc(n.body) + "</p></div>"; }).join("") : '<p class="muted">这几份结果之间没有需要特别说明的交叉情况。</p>') + "</div>";
    var desc = out.overview.filter(function (o) { return o.status === "noCut" && o.result.valid; });
    if (desc.length) h += '<div class="card"><h3>4. 描述性结果（没有分界）</h3>' + desc.map(function (o) {
      var r = o.result;
      if (o.id === "ecrr") return "<p><b>依恋</b>：焦虑 " + r.subs.anxiety.toFixed(2) + "，回避 " + r.subs.avoidance.toFixed(2) + "（1–7）。两者都是连续维度，越高越明显；它描述你在亲密关系中的倾向，不是类型或问题。</p>";
      if (o.id === "npi16") return "<p><b>自恋特质</b>：16 对句子中选了 " + r.total + " 句偏向自恋特质的表述。这是普通人格特质的描述，不涉及人格障碍。</p>";
      if (o.id === "pss10") return "<p><b>压力感知</b>：" + r.total + "/40。没有官方分档，适合与自己日后的结果比较。</p>";
      return "";
    }).join("") + "</div>";
    if (out.askDoctor.length) h += '<div class="card"><h3>' + (desc.length ? 5 : 4) + ". 带去就诊时可以讨论的问题</h3>" + ul(out.askDoctor) + '<p class="muted">可以截图本页带去。只要有一项让你担心，就值得去聊，不需要等到“够严重”。</p></div>';
    var doc = A.doctorText(out, I, localDate());
    h += '<div class="card" id="docbox"><h3>给医生的摘要</h3><p class="muted">一段纯文字，方便发给医生或存进备忘录。不包含逐题答案。</p><textarea id="docText" readonly rows="10">' + esc(doc) + '</textarea><button class="primary" onclick="App.copyDoctor()">复制摘要</button> <span id="copyMsg" class="muted"></span></div>';
    h += '<div class="card"><h3>这份分析的局限</h3>' + ul(out.limits) + "</div>";
    h += '<div class="row2"><button class="primary" onclick="App.go(\'choose\')">继续做其他问卷</button><button class="ghostbtn" onclick="App.clearSession()">清除本次结果</button><button class="ghostbtn" onclick="App.go(\'help\')">求助资源</button></div>';
    h += '<p class="tiny">本次结果只保存在当前页面的内存中，关闭或刷新页面后就会消失。</p>';
    return h;
  };
  V.help = function () {
    return '<section class="hero"><h1>需要帮助</h1><p>如果你正在经历难以承受的痛苦，或有伤害自己的念头，请现在联系专业的人。你不需要先“证明”自己够严重。</p></section><div class="card">' + regionPicker() + "</div>" + backBtn();
  };
  V.research = function () {
    var h = '<section class="hero"><h1>研究目录与证据卡</h1><p class="muted">核验日期 2026-11-13。检索范围：WHO、政府与学会网站、量表作者官网、PubMed 收录论文；未系统检索中文数据库全文，可能有遗漏。</p></section>';
    h += A.ORDER.map(function (k) {
      var x = I[k];
      return '<div class="card"><h3>' + esc(x.nameZh) + "（" + x.abbr + "） " + badge(x) + '</h3><dl class="dl"><dt>原始来源</dt><dd>' + esc(x.evidence.original) + "</dd><dt>中文版</dt><dd>" + esc(x.evidence.chinese) + "</dd>" +
        "<dt>局限</dt><dd>" + esc(x.evidence.limits) + "</dd><dt>授权</dt><dd>" + esc(x.license.terms) + " 商业展示：" + esc(x.license.commercialDisplay) + '<br><span class="muted">' + esc(x.license.source) + "</span></dd><dt>文本版本</dt><dd>" + esc(x.textVersion.note) + "</dd></dl></div>";
    }).join("");
    return h + backBtn();
  };
  V.privacy = function () {
    var saved = readSaved(), legacy = hasLegacy();
    return '<section class="hero"><h1>隐私与数据</h1></section><div class="card"><ul class="plain">' +
      "<li>不需要注册，不收集姓名、联系方式等身份信息。</li><li>所有计分在你的浏览器里完成，回答不会上传，也不会出现在网址里。</li><li>本站不使用统计、广告或错误上报服务。</li><li>综合分析只使用当前页面内存中的本次结果，关闭页面即消失。</li><li>默认不保存。只有你在结果页点“保存”，才会在这台设备上存下问卷名称、结果和日期，保留到你删除为止。</li></ul></div>" +
      '<div class="card"><h3>这台设备上保存的数据</h3>' + (saved.length ? "<ul>" + saved.map(function (s) { return "<li>" + esc(s.date) + " · " + esc(I[s.id] ? I[s.id].nameZh : s.id) + " · " + (s.total != null ? s.total : "") + "</li>"; }).join("") + "</ul>" : '<p class="muted">没有保存的结果。</p>') +
      (legacy ? '<p class="muted">检测到旧版网站在未经确认的情况下自动保存的记录，建议删除。</p>' : "") +
      '<button class="ghostbtn" onclick="App.deleteAll()">删除全部数据</button> <span id="delMsg" class="muted"></span></div>' + backBtn();
  };

  function render() { $("main").innerHTML = (V[state.view] || V.home)(); $("helpTop").classList.toggle("on", state.view === "help"); }
  document.addEventListener("DOMContentLoaded", function () { loadPersisted(); render(); });
})();
