/* 综合分析：把多个模块的结果并排呈现，并给出有研究依据的“交叉提示”。
 * 规则全部写死在这里、可测试；不生成诊断、不推断概率、不给类型标签。 */
(function (root) {
  var ORDER = ["phq9", "gad7", "k10", "pss10", "who5", "rses", "mdq", "pcl5", "itq", "des2", "msi", "npi16", "ecrr", "asrs", "audit", "scoff", "sci", "ocir", "sias", "phqpd"];
  // 达到分界/阳性 → 需要关注；数字越小越优先
  var CONCERN = {
    phq9: function (r) { return r.total >= 10; }, gad7: function (r) { return r.total >= 10; }, k10: function (r) { return r.total >= 30; },
    who5: function (r) { return r.total <= 50; }, mdq: function (r) { return r.band === "positive"; }, pcl5: function (r) { return r.total >= 31; },
    itq: function (r) { return r.band !== "none"; }, des2: function (r) { return r.total >= 30; }, msi: function (r) { return r.total >= 7; },
    asrs: function (r) { return r.total >= 4; }, audit: function (r) { return r.total >= 8; }, scoff: function (r) { return r.total >= 2; },
    rses: function (r) { return r.total <= 14; }, sci: function (r) { return r.total <= 16; }, ocir: function (r) { return r.total >= 21; },
    sias: function (r) { return r.total >= 34; }, phqpd: function (r) { return r.band === "positive"; }
  };
  var PRIORITY = { itq: 1, pcl5: 1, phq9: 2, mdq: 2, scoff: 2, audit: 3, gad7: 3, k10: 3, des2: 4, msi: 4, who5: 5, asrs: 5, rses: 6, sci: 4, ocir: 3, sias: 4, phqpd: 3 };

  var PARTIAL = { phq9: function (r) { return r.total >= 7 && r.total < 10; } };
  function analyze(session, I, COPY, attempts) {
    var R = {}, ids = ORDER.filter(function (id) { return session[id] && session[id].result; });
    ids.forEach(function (id) { R[id] = session[id].result; });
    var ok = function (id) { return R[id] && R[id].valid; };
    var tot = function (id) { return ok(id) ? R[id].total : null; };
    var out = { count: ids.length, overview: [], safety: [], priorities: [], notes: [], askDoctor: [], limits: [] };

    ids.forEach(function (id) {
      var r = R[id], x = I[id], status;
      if (!r.valid) status = "incomplete";
      else if (!CONCERN[id]) status = "noCut";
      else status = CONCERN[id](r) ? "reached" : (PARTIAL[id] && PARTIAL[id](r) ? "partial" : "notReached");
      out.overview.push({ id: id, domain: x.domain, name: x.nameZh, abbr: x.abbr, result: r, status: status });
      if (status === "reached") out.priorities.push({ id: id, name: x.nameZh, rank: (id === "audit" && r.total >= 20) ? 0 : (PRIORITY[id] || 9), text: COPY.bands[id] && COPY.bands[id][r.band] });
      r.flags.forEach(function (f) { if (out.safety.indexOf(f) === -1) out.safety.push(f); });
    });
    out.priorities.sort(function (a, b) { return a.rank - b.rank; });

    var N = function (t, b) { out.notes.push({ title: t, body: b }); };
    var p = tot("phq9"), g = tot("gad7"), pc = tot("pcl5"), d = tot("des2"), ms = tot("msi"), au = tot("audit"), as = tot("asrs"), w = tot("who5"), k = tot("k10");
    var itq = ok("itq") ? R.itq.band : null, mdq = ok("mdq") ? R.mdq.band : null;
    var trauma = (pc != null && pc >= 31) || itq === "ptsd" || itq === "cptsd";

    if (p != null && g != null && p >= 10 && g >= 10)
      N("抑郁和焦虑症状同时较多", "两类症状经常一起出现。就诊时请把两方面都说出来，专业人员会判断哪一方面更主要。");
    if (p != null && g != null && g >= 10 && session.phq9 && session.phq9.answers) {
      var a = session.phq9.answers, soma = a[2] + a[3] + a[4] + a[6], core = a[0] + a[1] + a[5];
      N("抑郁问卷中身体类与情绪类题目的分布", "PHQ-9 中睡眠、疲劳、食欲、注意力 4 题共 " + soma + " 分；兴趣减退、情绪低落、自我否定 3 题共 " + core + " 分。" +
        (soma > core * 1.5 ? "身体类题目明显更多。焦虑也会引起这些身体症状，所以抑郁分数中可能有一部分与焦虑有关，需要专业人员区分。" : "情绪核心题目的分数也不低，情绪低落本身同样值得关注。"));
    }
    if (trauma && p != null && p >= 10)
      N("创伤后应激症状与抑郁症状有重叠", "失去兴趣、难以感到快乐、睡眠和注意力问题在创伤问卷和抑郁问卷中都会出现，创伤问卷的分数也会因抑郁而升高。哪一方面更主要，需要专业人员判断。");
    if (d != null && d >= 30 && trauma)
      N("解离体验与创伤后应激症状同时较高", "解离体验在创伤后应激中很常见，DES-II 高分本身也常见于 PTSD。建议找有创伤与解离评估经验的专业人员。");
    if (pc != null && itq) {
      var pHigh = pc >= 31, iHigh = itq !== "none";
      if (pHigh !== iHigh) N("两份创伤问卷的结果不一致", "PCL-5 依据美国 DSM-5 标准（20 项症状），ITQ 依据世界卫生组织 ICD-11 标准（PTSD 定义更窄，只看核心症状）。标准不同，结果不一致是可能的，不代表某一份“测错了”。");
    }
    if (itq === "cptsd" && ms != null && ms >= 7)
      N("复杂性 PTSD 的困扰与边缘型人格相关特征有部分重叠", "情绪难以平复、负面自我看法、人际关系困难在两者中都会出现。两者如何区分是专业上仍在研究的问题，需要由有经验的专业人员通过详细访谈判断。");
    if (ms != null && ms >= 7 && !trauma)
      N("边缘型人格相关特征的分数较高", "这些特征也常见于创伤后应激、情绪障碍和长期高压。一份 10 题问卷不能判断人格障碍。");
    if (mdq === "positive" && p != null && p >= 10)
      N("既有情绪低落，也有过情绪高涨的经历", "如果你因为情绪低落去就医，请一定告诉医生你有过的情绪高涨经历。这会影响医生对问题的判断和治疗选择。");
    if (mdq === "negative")
      N("关于情绪高涨问卷的“未达到”", "MDQ 在普通人群中会漏掉大多数真正的双相患者，所以“未达到”不能排除双相相关问题。如果你有过持续几天精力异常旺盛、几乎不睡也不累的经历，仍请告诉医生。");
    if (au != null && au >= 8 && ((p != null && p >= 10) || (g != null && g >= 10) || (k != null && k >= 22)))
      N("饮酒与情绪困扰同时存在", "饮酒可能加重情绪低落、焦虑和睡眠问题，有时也是在用酒应对难受的情绪。就诊时请如实告诉医生饮酒情况。");
    if (as != null && as >= 4 && ((g != null && g >= 10) || (p != null && p >= 10)))
      N("注意力困扰与情绪困扰同时存在", "焦虑和抑郁也会让人难以集中、拖延、坐立不安。ADHD 的评估需要了解童年起的情况，并排除情绪、睡眠等原因。");
    if (w != null && w > 50 && ((p != null && p >= 10) || (g != null && g >= 10)))
      N("积极状态和困扰同时存在", "幸福感在 50 分以上，同时有较多抑郁或焦虑症状。这常见于状态起伏的时期：有不错的时候，也有难受的时候。两种结果记录的是同一段时间的两面。");
    var sc = tot("sci"), oc = tot("ocir"), si = tot("sias"), pd = ok("phqpd") ? R.phqpd.band : null;
    if (sc != null && sc <= 16 && ((p != null && p >= 10) || (g != null && g >= 10)))
      N("睡眠问题与情绪困扰同时存在", "失眠和焦虑、抑郁常常互相加重。研究支持单独针对失眠进行治疗（如失眠认知行为疗法），这往往也有助于改善情绪。就诊时请把睡眠问题单独提出来。");
    if (pd === "positive" && g != null && g >= 10)
      N("惊恐发作与持续担忧同时存在", "GAD-7 反映的是持续的担忧和紧张，惊恐问卷反映的是突然的发作。两者可以同时存在，治疗重点会有所不同，就诊时请分别描述。");
    if (pd === "positive")
      N("关于惊恐发作的身体症状", "心慌、胸痛、喘不上气也可能来自心脏、甲状腺等身体问题。请先让医生排除身体原因，再考虑惊恐障碍。");
    if (oc != null && oc >= 21 && g != null && g >= 10)
      N("强迫症状与焦虑同时较高", "强迫症常伴随明显焦虑，GAD-7 分数也会因此升高。两者的治疗方法不同，需要专业人员区分。");
    if (si != null && si >= 34 && p != null && p >= 10)
      N("社交焦虑与情绪低落同时存在", "长期的社交回避可能让人更孤立、更低落。就诊时请把社交方面的困难也说出来。");
    if (ok("mdq") && R.mdq.band === "negative" && R.mdq.detail.count >= 7 && R.mdq.detail.sameTime && R.mdq.detail.problem < 2)
      N("情绪高涨问卷：只差“带来问题”这一条", "你有 " + R.mdq.detail.count + " 项情绪高涨相关表现，并且曾在同一段时间出现，只是因为你认为它们没有带来中等以上的问题，才没有达到阳性标准。研究者指出，轻躁狂按定义并不涉及明显的功能损害，所以这一条规则可能会漏掉这类情况。这不代表你有双相障碍，但请把这段经历当面告诉医生。");
    if (p != null && p >= 7 && p < 10)
      N("抑郁分数处在两条分界之间", "PHQ-9 为 " + p + " 分：未达到原始研究（美国初级保健）的 10 分，但达到了中国上海社区研究建议的 7 分筛查分界。不同人群的分界不同，可以把这一点告诉专业人员。");
    if (au != null && au >= 20)
      N("关于饮酒的安全提醒", "AUDIT 20 分以上，WHO 手册认为提示可能存在酒精依赖。如果你平时喝得多、喝得频繁，不要自己突然完全停酒，先咨询医生，因为骤停可能带来身体风险。");
    if (attempts) Object.keys(attempts).forEach(function (id) {
      var v = attempts[id].filter(function (a) { return a.valid; }), bands = {};
      v.forEach(function (a) { bands[a.band] = 1; });
      if (v.length >= 2 && Object.keys(bands).length > 1)
        N(I[id].nameZh + "：多次作答结果不一致", "你本次做了 " + v.length + " 次，结果落在不同的区间。综合分析使用最近一次。短时间内结果变化，常与疲惫、当时的情绪和对题目的理解有关，不能说明好转或变差。");
    });
    var late = ids.filter(function (id) { var h = new Date(session[id].time).getHours(); return h < 5; }).length;
    if (late) N("注意答题时间", "有 " + late + " 项是在凌晨（0–5 点）完成的。夜里疲惫时，焦虑和低落的自评通常会偏高。建议过一两周，在白天再做一次对比。");

    var seen = {};
    out.priorities.forEach(function (pr) { (COPY.askDoctor[pr.id] || []).forEach(function (q) { if (!seen[q] && q.charAt(0) !== "（") { seen[q] = 1; out.askDoctor.push(q); } }); });
    out.askDoctor = out.askDoctor.slice(0, 10);

    out.limits = [
      "每份问卷都是单独开发和验证的；把多份结果放在一起看，这种做法本身没有经过验证。",
      "“交叉提示”来自研究中已知的症状重叠和问卷局限，只用于帮助你和专业人员沟通，不是诊断。",
      "未达到分界不代表没有问题；达到分界也不代表一定有某种障碍。"
    ];
    var reached = out.overview.filter(function (o) { return o.status === "reached"; }).length;
    out.headline = { done: ids.length, reached: reached, top: out.priorities.slice(0, 3).map(function (p) { return p.name; }) };
    return out;
  }

  function scoreLabel(x, r) {
    if (!r.valid) return "未完整作答";
    if (r.subs && !Array.isArray(r.subs) && x.scoring.method === "subscales") return x.scoring.subs.map(function (s) { return s.label + " " + r.subs[s.key].toFixed(2); }).join("，");
    if (r.total == null || ["itq", "mdq", "phqpd"].indexOf(x.scoring.method) !== -1) return ((x.bands.filter(function (b) { return b.key === r.band; })[0] || {}).label || "") + (x.scoring.method === "mdq" ? "（" + r.total + "/13 项）" : "");
    return r.total + "/" + x.scoring.max;
  }
  var STATUS = { reached: "达到研究分界", partial: "达到部分研究分界", notReached: "未达到分界", noCut: "无分界", incomplete: "未完整作答" };
  function doctorText(out, I, dateStr) {
    var L = ["【自评问卷结果摘要】" + (dateStr || ""), "说明：以下为网上自评筛查结果，不是诊断；PHQ-9、GAD-7 采用国内通行中文版，其余题目为工作译本。", ""];
    out.overview.forEach(function (o) { L.push("· " + o.name + "（" + o.abbr + "）：" + scoreLabel(I[o.id], o.result) + " —— " + STATUS[o.status]); });
    if (out.priorities.length) { L.push("", "希望重点讨论："); out.priorities.forEach(function (p, i) { L.push((i + 1) + ". " + p.name); }); }
    if (out.notes.length) { L.push("", "需要说明的情况："); out.notes.forEach(function (n) { L.push("· " + n.title); }); }
    if (out.askDoctor.length) { L.push("", "我想问的问题："); out.askDoctor.forEach(function (q) { L.push("· " + q); }); }
    return L.join("\n");
  }

  var api = { analyze: analyze, ORDER: ORDER, doctorText: doctorText, scoreLabel: scoreLabel, STATUS: STATUS };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Analysis = api;
})(this);
