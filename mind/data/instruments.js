/* 量表元数据、题目版本、授权记录与计分规则。
 * 只放数据，不放界面逻辑。修改任何题目或阈值必须同步更新 version 与 changelog。 */
(function (root) {
  var FREQ4 = [
    { label: "完全不会", value: 0 },
    { label: "好几天", value: 1 },
    { label: "一半以上的天数", value: 2 },
    { label: "几乎每天", value: 3 }
  ];
  var FREQ4_GAD = [
    { label: "完全不会", value: 0 },
    { label: "几天", value: 1 },
    { label: "一半以上的日子", value: 2 },
    { label: "几乎每天", value: 3 }
  ];
  var IMPAIR = {
    text: "如果你在上面任何一题选了“完全不会”以外的选项，这些问题让你在工作、学习、处理家务或与他人相处时有多困难？",
    options: [
      { label: "毫无困难", value: 0 },
      { label: "有些困难", value: 1 },
      { label: "非常困难", value: 2 },
      { label: "极度困难", value: 3 }
    ],
    scored: false
  };

  var INSTRUMENTS = {
    phq9: {
      id: "phq9", domain: "情绪与压力",
      nameZh: "抑郁症状自评",
      abbr: "PHQ-9",
      fullName: "Patient Health Questionnaire-9",
      measures: "过去两周与抑郁相关的 9 项症状出现的频率。",
      notMeasures: "不能诊断抑郁症，不能区分单相抑郁、双相障碍或其他原因（如身体疾病、哀伤）引起的类似症状。",
      population: "成年人（18 岁及以上）",
      recall: "过去两周",
      minutes: 2,
      textVersion: {
        id: "phq9-zh-common-2026-11-16",
        status: "common",
        note: "采用国内通行的 PHQ-9 简体中文版：9 个条目和 4 个选项与上海市精神卫生中心、问卷网、调查派等多个公开来源逐字核对一致（2026-11-16）。辉瑞官方中文 PDF 原件未能直接取得比对；PHQ 系列声明无需许可即可复制、翻译和展示。"
      },
      license: {
        holder: "Pfizer Inc.（开发：Spitzer、Williams、Kroenke 等）",
        terms: "无需许可即可复制、翻译、展示或分发。",
        source: "https://www.phqscreeners.com",
        commercialDisplay: "允许（按声明无版权限制）",
        status: "verified",
        verifiedOn: "2026-11-13"
      },
      evidence: {
        original: "Kroenke K, Spitzer RL, Williams JBW. The PHQ-9: validity of a brief depression severity measure. J Gen Intern Med. 2001;16(9):606–613.",
        chinese: "Wang W, et al. Reliability and validity of the Chinese version of the PHQ-9 in the general population. Gen Hosp Psychiatry. 2014;36(5):539–544.（上海社区 1045 名成人；α=0.86；该研究建议社区人群以 ≥7 分为筛查分界）",
        limits: "原始分界来自美国初级保健人群；中国社区研究推荐的分界更低。自评分数受近期事件、身体疾病、睡眠等影响。",
        status: "verified"
      },
      stem: "过去两周里，你有多经常被以下问题困扰？",
      options: FREQ4,
      items: [
        "做事时提不起劲或没有兴趣",
        "感到心情低落、沮丧或绝望",
        "入睡困难、睡不安稳或睡眠过多",
        "感觉疲倦或没有活力",
        "食欲不振或吃太多",
        "觉得自己很糟，或觉得自己很失败，或让自己或家人失望",
        "对事物专注有困难，例如阅读报纸或看电视时",
        "动作或说话速度缓慢到别人已经察觉？或正好相反——烦躁或坐立不安、动来动去的情况更胜于平常",
        "有不如死掉或用某种方式伤害自己的念头"
      ],
      reverse: [],
      scoring: { method: "sum", min: 0, max: 27, missing: "no_total" },
      bands: [
        { min: 0, max: 4, key: "minimal", label: "0–4 分区间" },
        { min: 5, max: 9, key: "mild", label: "5–9 分区间" },
        { min: 10, max: 14, key: "moderate", label: "10–14 分区间" },
        { min: 15, max: 19, key: "modsevere", label: "15–19 分区间" },
        { min: 20, max: 27, key: "severe", label: "20–27 分区间" }
      ],
      thresholds: [
        { score: 10, dir: "ge", who: "原始研究（美国初级保健）", meaning: "常用作建议进一步专业评估的分界" },
        { score: 7, dir: "ge", who: "Wang 等 2014（上海社区成人）", meaning: "该研究在社区人群中推荐的筛查分界" }
      ],
      riskItems: [{ index: 8, minValue: 1, flag: "self_harm_thoughts" }],
      impairment: IMPAIR
    },

    gad7: {
      id: "gad7", domain: "情绪与压力",
      nameZh: "焦虑症状自评",
      abbr: "GAD-7",
      fullName: "Generalized Anxiety Disorder-7",
      measures: "过去两周担忧、紧张、难以放松等焦虑症状出现的频率。",
      notMeasures: "主要针对广泛性焦虑；对惊恐障碍、社交焦虑、创伤后应激等其他问题的识别能力有限，也不能诊断任何焦虑障碍。",
      population: "成年人（18 岁及以上）",
      recall: "过去两周",
      minutes: 2,
      textVersion: {
        id: "gad7-zh-common-2026-11-16",
        status: "common",
        note: "采用国内通行的 GAD-7 简体中文版：7 个条目与问卷星、MedSci、调查派等多个公开来源逐字核对一致（2026-11-16）。各来源的选项措辞不完全统一，本站采用最常见的“完全不会 / 几天 / 一半以上的日子 / 几乎每天”。中文验证研究（何筱衍等，2010）原文与辉瑞官方中文 PDF 未能直接取得比对。"
      },
      license: {
        holder: "Pfizer Inc.（开发：Spitzer、Kroenke、Williams、Löwe）",
        terms: "无需许可即可复制、翻译、展示或分发。",
        source: "https://www.phqscreeners.com",
        commercialDisplay: "允许（按声明无版权限制）",
        status: "verified",
        verifiedOn: "2026-11-13"
      },
      evidence: {
        original: "Spitzer RL, Kroenke K, Williams JBW, Löwe B. A brief measure for assessing generalized anxiety disorder: the GAD-7. Arch Intern Med. 2006;166(10):1092–1097.",
        chinese: "何筱衍, 李春波, 钱洁, 等. 广泛性焦虑量表在综合性医院的信度和效度研究. 上海精神医学. 2010;22(4):200–203.（综合医院人群；本轮未核实其推荐分界）",
        limits: "对广泛性焦虑以外的焦虑类型识别力有限（韩国社区研究亦提示须谨慎用于其他焦虑障碍）。中文版主要在医院/学生样本中验证。",
        status: "verified"
      },
      stem: "过去两周里，你有多经常被以下问题困扰？",
      options: FREQ4_GAD,
      items: [
        "感觉紧张、焦虑或急切",
        "不能够停止或控制担忧",
        "对各种各样的事情担忧过多",
        "很难放松下来",
        "由于不安而无法静坐",
        "变得容易烦恼或急躁",
        "感到似乎将有可怕的事情发生而害怕"
      ],
      reverse: [],
      scoring: { method: "sum", min: 0, max: 21, missing: "no_total" },
      bands: [
        { min: 0, max: 4, key: "minimal", label: "0–4 分区间" },
        { min: 5, max: 9, key: "mild", label: "5–9 分区间" },
        { min: 10, max: 14, key: "moderate", label: "10–14 分区间" },
        { min: 15, max: 21, key: "severe", label: "15–21 分区间" }
      ],
      thresholds: [
        { score: 10, dir: "ge", who: "原始研究（美国初级保健）", meaning: "常用作建议进一步专业评估的分界" }
      ],
      riskItems: [],
      impairment: IMPAIR
    },

    who5: {
      id: "who5", domain: "情绪与压力",
      nameZh: "心理幸福感指数",
      abbr: "WHO-5",
      fullName: "World Health Organization-Five Well-Being Index",
      measures: "过去两周积极心理状态（愉快、平静、有活力、休息好、有兴趣）的程度。",
      notMeasures: "不是症状量表，不能诊断任何疾病；分数高也不排除存在困扰。",
      population: "成年人（18 岁及以上）",
      recall: "过去两周",
      minutes: 1,
      textVersion: {
        id: "who5-zh-working-2026-11",
        status: "working",
        note: "本站工作译本。WHO 许可允许非商业改编（须注明出处，且衍生作品以相同许可发布）；已验证中文版（Fung 等，2022）论文只列出英文条目，没有公布中文原文（2026-11-16 核对），需向作者索取后才能比对。"
      },
      license: {
        holder: "World Health Organization",
        terms: "CC BY-NC-SA 3.0 IGO：可非商业复制、改编，须注明出处并以相同许可发布。",
        source: "https://iris.who.int/handle/10665/349766",
        commercialDisplay: "不允许商业使用（付费功能中不得包含）",
        status: "verified",
        verifiedOn: "2026-11-13"
      },
      evidence: {
        original: "World Health Organization. The WHO-5. Geneva: WHO; 2024. Topp CW, Østergaard SD, Søndergaard S, Bech P. The WHO-5 Well-Being Index: a systematic review of the literature. Psychother Psychosom. 2015;84(3):167–176.",
        chinese: "Fung S-f, et al. Validity and psychometric evaluation of the Chinese version of the 5-item WHO Well-Being Index. Front Public Health. 2022;10:872436.（中国大陆大学样本 1414 人；α=0.85/0.81）",
        limits: "中文验证样本为大学人群，未在社区成人中验证分界。",
        status: "verified"
      },
      stem: "过去两周里，下面的描述有多符合你？",
      options: [
        { label: "所有时间", value: 5 },
        { label: "大部分时间", value: 4 },
        { label: "一半以上时间", value: 3 },
        { label: "不到一半时间", value: 2 },
        { label: "偶尔", value: 1 },
        { label: "从来没有", value: 0 }
      ],
      items: [
        "我感到快乐，心情舒畅",
        "我感到平静和放松",
        "我感到有活力、精力充沛",
        "我醒来时感觉清爽，休息得很好",
        "我的日常生活里充满了让我感兴趣的事"
      ],
      reverse: [],
      scoring: { method: "sum", multiplier: 4, min: 0, max: 100, missing: "no_total" },
      bands: [
        { min: 0, max: 50, key: "low", label: "50 分及以下" },
        { min: 51, max: 100, key: "above", label: "高于 50 分" }
      ],
      thresholds: [
        { score: 50, dir: "le", who: "Topp 等 2015 系统综述", meaning: "用于抑郁筛查时，≤50 分提示值得进一步评估" }
      ],
      riskItems: [],
      impairment: null
    },

    k10: {
      id: "k10", domain: "情绪与压力", nameZh: "心理困扰程度", abbr: "K10", fullName: "Kessler Psychological Distress Scale",
      measures: "过去四周焦虑、抑郁相关的非特异性心理困扰程度。",
      notMeasures: "不区分具体是哪一种问题，也不能诊断。",
      population: "成年人（18 岁及以上）", recall: "过去四周", minutes: 2,
      textVersion: { status: "working", note: "本站工作译本。作者允许翻译；已发布的中文译本尚未取得比对。" },
      license: { holder: "Ronald C. Kessler（Harvard Medical School）", terms: "免费使用，无需正式许可；须注明版权并引用原文。", source: "https://www.hcp.med.harvard.edu/ncs/k6_scales.php", commercialDisplay: "允许（须保留版权声明）", status: "verified", verifiedOn: "2026-11-13" },
      evidence: { original: "Kessler RC, et al. Short screening scales to monitor population prevalences and trends in non-specific psychological distress. Psychol Med. 2002;32(6):959–976.", chinese: "本轮未核验中文验证研究。", limits: "分档来自澳大利亚统计局（ABS）的人口调查惯例，并非诊断分界；ABS 指出不存在公认统一的分档。", status: "partial" },
      stem: "过去四周里，你有多经常……",
      options: [{ label: "从不", value: 1 }, { label: "很少", value: 2 }, { label: "有时", value: 3 }, { label: "大部分时间", value: 4 }, { label: "一直", value: 5 }],
      items: ["无缘无故感到疲惫不堪", "感到紧张", "紧张到怎样都平静不下来", "感到没有希望", "感到坐立不安", "不安到坐都坐不住", "感到抑郁", "感到做什么都很费力", "难过到什么都无法让你开心起来", "感到自己没有价值"],
      reverse: [], scoring: { method: "sum", min: 10, max: 50, missing: "no_total" },
      bands: [{ min: 10, max: 15, key: "low", label: "10–15（低）" }, { min: 16, max: 21, key: "moderate", label: "16–21（中）" }, { min: 22, max: 29, key: "high", label: "22–29（高）" }, { min: 30, max: 50, key: "veryhigh", label: "30–50（很高）" }],
      thresholds: [{ score: 30, dir: "ge", who: "澳大利亚统计局（ABS）人口调查分档", meaning: "“很高”档，ABS 认为可能需要专业帮助" }],
      riskItems: [], impairment: null
    },

    pss10: {
      id: "pss10", domain: "情绪与压力", nameZh: "压力感知", abbr: "PSS-10", fullName: "Perceived Stress Scale-10",
      measures: "过去一个月你觉得生活有多不可预测、不可控、超负荷。",
      notMeasures: "不是诊断工具，作者明确说明没有“高/中/低”分界。",
      population: "成年人（18 岁及以上）", recall: "过去一个月", minutes: 2,
      textVersion: { status: "working", note: "本站工作译本。各语言译本归译者所有，已发表的中文版尚未取得比对。" },
      license: { holder: "Sheldon Cohen", terms: "非营利学术研究和教育用途无需许可；营利用途需申请。", source: "https://www.cmu.edu/dietrich/psychology/stress-immunity-disease-lab/scales", commercialDisplay: "需另行申请（付费功能不得包含）", status: "verified", verifiedOn: "2026-11-13" },
      evidence: { original: "Cohen S, Kamarck T, Mermelstein R. A global measure of perceived stress. J Health Soc Behav. 1983;24(4):385–396.", chinese: "本轮未核验中文验证研究。", limits: "无诊断分界，最适合和自己过去的分数比较。", status: "partial" },
      stem: "过去一个月里，你有多经常……",
      options: [{ label: "从不", value: 0 }, { label: "几乎不", value: 1 }, { label: "有时", value: 2 }, { label: "比较经常", value: 3 }, { label: "非常经常", value: 4 }],
      items: ["因为发生了意料之外的事而心烦", "感到无法掌控生活中重要的事", "感到紧张、“压力很大”", "对自己处理个人问题的能力有信心", "感到事情在按你希望的方向发展", "发现自己应付不了所有必须做的事", "能够控制生活中让你烦躁的事", "觉得一切尽在掌握", "因为无法控制的事情而生气", "感到困难越积越多，多到无法克服"],
      reverse: [3, 4, 6, 7], scoring: { method: "sum", min: 0, max: 40, missing: "no_total" },
      bands: [{ min: 0, max: 40, key: "any", label: "0–40（无官方分档）" }],
      thresholds: [], riskItems: [], impairment: null
    },

    rses: {
      id: "rses", domain: "自我", nameZh: "自尊", abbr: "RSES", fullName: "Rosenberg Self-Esteem Scale",
      measures: "你整体上如何看待自己的价值。",
      notMeasures: "不是心理健康筛查工具；没有官方分界。",
      population: "成年人（18 岁及以上）", recall: "无特定时间", minutes: 2,
      textVersion: { status: "working", note: "本站工作译本。已发表的中文版尚未取得比对。" },
      license: { holder: "Morris Rosenberg（已进入公有领域）", terms: "公有领域，可免费使用。", source: "https://socy.umd.edu/about-us/using-rosenberg-self-esteem-scale", commercialDisplay: "允许", status: "verified", verifiedOn: "2026-11-13" },
      evidence: { original: "Rosenberg M. Society and the Adolescent Self-Image. Princeton University Press; 1965.", chinese: "本轮未核验中文验证研究。", limits: "常见的 15–25 为“常见范围”的说法来自教学材料，不是官方分界。", status: "partial" },
      stem: "你对下面这句话的同意程度是？",
      options: [{ label: "非常同意", value: 3 }, { label: "同意", value: 2 }, { label: "不同意", value: 1 }, { label: "非常不同意", value: 0 }],
      items: ["总的来说，我对自己是满意的", "有时我觉得自己一无是处", "我觉得自己有不少优点", "我能像大多数人一样把事情做好", "我觉得自己没有多少值得骄傲的地方", "有时我确实觉得自己没用", "我觉得自己是个有价值的人，至少和别人一样", "我希望自己能更尊重自己一些", "总的来说，我倾向于觉得自己是个失败者", "我对自己持积极的态度"],
      reverse: [1, 4, 5, 7, 8], scoring: { method: "sum", min: 0, max: 30, missing: "no_total" },
      bands: [{ min: 0, max: 14, key: "low", label: "0–14" }, { min: 15, max: 30, key: "typical", label: "15–30" }],
      thresholds: [], riskItems: [], impairment: null
    },

    mdq: {
      id: "mdq", domain: "双相相关", nameZh: "情绪高涨经历", abbr: "MDQ", fullName: "Mood Disorder Questionnaire",
      measures: "一生中是否有过与躁狂/轻躁狂相关的经历（精力异常旺盛、睡得少却不累、冲动等）。",
      notMeasures: "不能诊断双相障碍。在普通人群中它会漏掉很多真正的双相患者，所以“未达到”不代表可以排除。",
      population: "成年人（18 岁及以上）", recall: "一生中任何一段时间", minutes: 3,
      preNote: "这份问卷问的是你一生中是否有过“不像平常的自己”的一段时间，不是最近两周。",
      textVersion: { status: "working", note: "本站工作译本。原问卷第 4、5 题（家族史、既往诊断）不参与计分，本站未收集。" },
      license: { holder: "The University of Texas Medical Branch（作者 Hirschfeld 等）", terms: "版权所有；常见发布渠道注明仅限研究或教育用途、不得商用。本轮未取得作者对网页自测的明确许可。", source: "https://www.ldh.la.gov/assets/oph/Center-PHCH/Center-PH/maternal/PPCL/MoodDisorderQuestionnaire.pdf", commercialDisplay: "不允许", status: "pending", verifiedOn: "2026-11-13" },
      evidence: { original: "Hirschfeld RMA, et al. Development and validation of a screening instrument for bipolar spectrum disorder: the MDQ. Am J Psychiatry. 2000;157(11):1873–1875.", chinese: "香港社区有粤语中文版研究（Lee 等 2011）；本轮未核验简体中文版。", limits: "一般人群研究中灵敏度约 0.28、特异度约 0.97：阳性较可靠，阴性很不可靠。", status: "partial" },
      stem: "在你的一生中，是否有过一段时间，你不像平常的自己，并且……",
      options: [{ label: "是", value: 1 }, { label: "否", value: 0 }],
      items: [
        "感觉非常好或非常亢奋，以至于别人觉得你不像平时的你，或者你因为太亢奋而惹了麻烦",
        "非常易怒，以至于对人大吼大叫，或与人争吵、打架",
        "比平时自信得多",
        "睡得比平时少得多，却并不觉得缺觉",
        "比平时健谈得多，或说话快得多",
        "思绪飞快地跳来跳去，或者脑子停不下来",
        "很容易被周围的事物分心，难以集中注意力或坚持做一件事",
        "精力比平时多得多",
        "比平时活跃得多，或做的事情多得多",
        "比平时更爱社交、更外向，例如半夜给朋友打电话",
        "对性的兴趣比平时大得多",
        "做了一些平时不会做、或别人可能觉得过分、愚蠢或有风险的事",
        "花钱让你或你的家人陷入了麻烦",
        { text: "如果上面不止一题回答了“是”，其中几项是否曾在同一段时间内出现？", stem: "补充问题", options: [{ label: "是", value: 1 }, { label: "否 / 不适用", value: 0 }] },
        { text: "这些情况给你带来了多大的问题——比如无法工作，家庭、金钱或法律上的麻烦，与人争吵或打架？", stem: "补充问题", options: [{ label: "没有问题", value: 0 }, { label: "小问题", value: 1 }, { label: "中等问题", value: 2 }, { label: "严重问题", value: 3 }] }
      ],
      reverse: [], scoring: { method: "mdq", min: 0, max: 13, missing: "no_total" },
      bands: [{ key: "positive", label: "达到问卷阳性标准" }, { key: "negative", label: "未达到阳性标准" }],
      thresholds: [], riskItems: [], impairment: null
    },

    pcl5: {
      id: "pcl5", domain: "创伤相关", nameZh: "创伤后应激症状（PTSD）", abbr: "PCL-5", fullName: "PTSD Checklist for DSM-5",
      measures: "过去一个月与一次非常有压力的经历相关的 20 项 PTSD 症状（DSM-5 标准）。",
      notMeasures: "不能诊断 PTSD；分数也会因抑郁、哀伤等原因升高。不评估复杂性 PTSD（见 ITQ）。",
      population: "成年人（18 岁及以上），且有过非常有压力或创伤性的经历", recall: "过去一个月", minutes: 6,
      preNote: "请想着最困扰你的那段经历作答。你不需要写下、说出或回想它的细节。如果答题时感到难受，可以随时停下，先做几次慢呼吸，看看身边的五样东西，让自己回到当下。",
      textVersion: { status: "working", note: "本站工作译本。美国国家 PTSD 中心未提供官方简体中文版，已发表中文版尚未比对。" },
      license: { holder: "美国退伍军人事务部国家 PTSD 中心", terms: "公有领域，不受版权保护；官方说明该工具面向合格专业人员和研究者使用。", source: "https://www.ptsd.va.gov/professional/assessment/adult-sr/ptsd-checklist.asp", commercialDisplay: "版权上允许；但官方定位为专业使用", status: "verified", verifiedOn: "2026-11-13" },
      evidence: { original: "Weathers FW, Litz BT, Keane TM, et al. The PTSD Checklist for DSM-5 (PCL-5). National Center for PTSD; 2013. Bovin MJ, et al. Psychol Assess. 2016;28(11):1379–1391.", chinese: "本轮未核验中文验证研究。", limits: "国家 PTSD 中心指出分界取决于人群与目的；31–33 分为常引用的“可能 PTSD”范围。", status: "partial" },
      stem: "过去一个月里，以下问题让你困扰的程度是？",
      options: [{ label: "一点也不", value: 0 }, { label: "有一点", value: 1 }, { label: "中等", value: 2 }, { label: "相当多", value: 3 }, { label: "极其严重", value: 4 }],
      items: [
        "反复出现、令人不安且不想要的关于那段经历的记忆", "反复做与那段经历有关的令人不安的梦", "突然感觉或表现得好像那段经历又在发生（仿佛又回到当时）",
        "当有事情让你想起那段经历时，感到非常难过", "当有事情让你想起那段经历时，出现强烈的身体反应（如心跳加快、呼吸困难、出汗）",
        "回避与那段经历有关的记忆、想法或感受", "回避会让你想起那段经历的外部事物（如人、地方、谈话、活动、物品或情境）",
        "难以记起那段经历的重要部分", "对自己、他人或世界有强烈的负面信念（如“我很坏”“谁都不能信”“世界非常危险”）",
        "为那段经历或之后发生的事责怪自己或他人", "有强烈的负面情绪，如恐惧、惊骇、愤怒、内疚或羞耻", "对过去喜欢的活动失去兴趣",
        "感到与他人疏远或隔绝", "难以体验到积极的感受（如无法感到快乐，或对亲近的人产生不了爱意）", "易怒、爆发愤怒或有攻击性的行为",
        "冒过多的风险，或做可能伤害自己的事", "处于“超级警觉”、警惕或戒备状态", "容易心惊肉跳或被吓到", "难以集中注意力", "入睡困难或睡不安稳"
      ],
      reverse: [], scoring: { method: "sum", min: 0, max: 80, missing: "no_total" },
      bands: [{ min: 0, max: 30, key: "below", label: "0–30" }, { min: 31, max: 80, key: "above", label: "31–80" }],
      thresholds: [{ score: 31, dir: "ge", who: "美国国家 PTSD 中心（31–33 分）", meaning: "常引用的“可能存在 PTSD、值得专业评估”的范围下限" }],
      riskItems: [{ index: 15, minValue: 3, flag: "risky_behavior" }], impairment: null
    },

    itq: {
      id: "itq", domain: "创伤相关", nameZh: "PTSD 与复杂性 PTSD（ICD-11）", abbr: "ITQ", fullName: "International Trauma Questionnaire",
      measures: "按世界卫生组织 ICD-11 标准，评估 PTSD 的核心症状，以及复杂性 PTSD 特有的“自我组织困扰”（情绪调节、负面自我概念、人际关系困难）。",
      notMeasures: "不能诊断 PTSD 或复杂性 PTSD；不评估创伤经历本身。",
      population: "成年人（18 岁及以上），且有过非常有压力或创伤性的经历", recall: "过去一个月", minutes: 5,
      preNote: "请想着最困扰你的那段经历作答。你不需要写下、说出或回想它的细节。如果答题时感到难受，可以随时停下，先做几次慢呼吸，看看身边的五样东西，让自己回到当下。",
      textVersion: { status: "working", note: "本站工作译本。原作者要求不得改动问卷；正式使用前须替换为官方中文译本。" },
      license: { holder: "Cloitre M, Shevlin M, Brewin CR 等", terms: "公开免费供所有人使用，但不得做任何改动。", source: "https://doi.org/10.1111/acps.12956", commercialDisplay: "允许（不得改动）", status: "verified", verifiedOn: "2026-11-13" },
      evidence: { original: "Cloitre M, et al. The International Trauma Questionnaire: development of a self-report measure of ICD-11 PTSD and complex PTSD. Acta Psychiatr Scand. 2018;138(6):536–546.", chinese: "本轮未核验中文验证研究。", limits: "开发样本来自英国；临床样本来自创伤专科，未必代表一般求助人群。", status: "partial" },
      stem: "过去一个月里，以下问题让你困扰的程度是？",
      options: [{ label: "一点也不", value: 0 }, { label: "有一点", value: 1 }, { label: "中等", value: 2 }, { label: "相当多", value: 3 }, { label: "极其严重", value: 4 }],
      items: [
        "做与那段经历有关的令人不安的梦", "关于那段经历的强烈画面或记忆闯入脑海，让你感觉好像又发生在此时此地",
        "回避会让你想起那段经历的内在提醒（如想法、感受或身体感觉）", "回避会让你想起那段经历的外部事物（如人、地方、谈话、物品、活动或情境）",
        "处于“超级警觉”、警惕或戒备状态", "感到心惊肉跳或容易受惊",
        { text: "上面这些问题影响了你的人际关系或社交生活", stem: "过去一个月里，上面这些问题……" },
        { text: "上面这些问题影响了你的工作或工作能力", stem: "过去一个月里，上面这些问题……" },
        { text: "上面这些问题影响了你生活中其他重要方面（如照顾孩子、学业或其他重要活动）", stem: "过去一个月里，上面这些问题……" },
        { text: "当我心烦时，需要很长时间才能平静下来", stem: "下面描述的是一些人在经历压力或创伤后可能出现的情况。它们在多大程度上符合你通常的感受、想法和与人相处的方式？" },
        { text: "我感到麻木，或情感上“关闭”了", stem: "它们在多大程度上符合你通常的状态？" },
        { text: "我觉得自己是个失败者", stem: "它们在多大程度上符合你通常的状态？" },
        { text: "我觉得自己没有价值", stem: "它们在多大程度上符合你通常的状态？" },
        { text: "我感到与他人疏远或隔绝", stem: "它们在多大程度上符合你通常的状态？" },
        { text: "我觉得很难与人保持情感上的亲近", stem: "它们在多大程度上符合你通常的状态？" },
        { text: "上面这些情况影响了你的人际关系或社交生活", stem: "过去一个月里，上面这些情况……" },
        { text: "上面这些情况影响了你的工作或工作能力", stem: "过去一个月里，上面这些情况……" },
        { text: "上面这些情况影响了你生活中其他重要方面（如照顾孩子、学业或其他重要活动）", stem: "过去一个月里，上面这些情况……" }
      ],
      reverse: [], scoring: { method: "itq", missing: "no_total" },
      bands: [{ key: "cptsd", label: "符合问卷的复杂性 PTSD 判定规则" }, { key: "ptsd", label: "符合问卷的 PTSD 判定规则" }, { key: "none", label: "未达到任一判定规则" }],
      thresholds: [], riskItems: [], impairment: null
    },

    des2: {
      id: "des2", domain: "解离相关", nameZh: "解离体验", abbr: "DES-II", fullName: "Dissociative Experiences Scale-II",
      measures: "日常生活中解离体验（记忆空白、人格解体/现实解体、沉浸）出现的时间比例。",
      notMeasures: "不能诊断解离障碍（包括解离性身份障碍）。PTSD、睡眠不足、高压时分数也会升高；沉浸类体验在一般人中也很常见。",
      population: "成年人（18 岁及以上）", recall: "日常生活中（不在酒精或药物影响下）", minutes: 8,
      textVersion: { status: "working", note: "本站工作译本，依据原版内容翻译；已发表中文版尚未比对。" },
      license: { holder: "Eve B. Carlson、Frank W. Putnam", terms: "作者许可为研究或临床用途复制、分发。", source: "https://emdria.org/resource/dissociative-experiences-scale-ii", commercialDisplay: "未明确，需向作者确认", status: "pending", verifiedOn: "2026-11-13" },
      evidence: { original: "Carlson EB, Putnam FW. An update on the Dissociative Experiences Scale. Dissociation. 1993;6(1):16–27.", chinese: "本轮未核验中文验证研究。", limits: "30 分为原作者建议的进一步评估分界；研究汇总中一般成人平均约 5.4 分。", status: "partial" },
      stem: "以下经历在你（不在酒精或药物影响下时）的生活中占多大比例的时间？",
      options: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(function (v) { return { label: v + "%", value: v }; }),
      items: [
        "开车或坐车时，突然意识到不记得这段路程中的部分或全部经过", "听别人说话时，突然意识到没听到对方说的部分或全部内容", "发现自己身处某个地方，却不知道是怎么到那里的",
        "发现自己穿着不记得穿上的衣服", "在自己的物品中发现不记得买过的新东西", "被不认识的人走上前来用别的名字称呼你，或坚称以前见过你",
        "感觉自己像是站在身体旁边，看着自己做事，好像在看另一个人", "被告知你有时认不出朋友或家人", "对生活中某些重要事件（如婚礼或毕业）完全没有记忆",
        "被指责说谎，而你认为自己并没有说谎", "照镜子时认不出自己", "感到其他人、物体和周围的世界不真实", "感到自己的身体好像不属于自己",
        "回忆过去的某件事时，感觉非常逼真，好像在重新经历它", "不确定自己记得的事情是真的发生过，还是只是做梦", "身处熟悉的地方，却觉得那里陌生、不熟悉",
        "看电视或电影时太投入，以至于意识不到周围发生的事", "过于沉浸在幻想或白日梦中，以至于感觉那像是真的在发生", "有时能够忽略疼痛",
        "盯着前方发呆，什么也没想，也没意识到时间流逝", "独处时会大声自言自语", "在不同情境中表现差异很大，以至于感觉自己像是两个不同的人",
        "在某些情境中，能异常轻松自如地做通常对你来说很难的事（如运动、工作、社交）", "分不清某件事是自己真的做了，还是只是想过要做",
        "发现证据表明自己做过一些不记得做过的事", "在自己的物品中发现自己肯定写过或画过、却不记得写过画过的东西",
        "在脑海中听到声音，让你去做某些事，或评论你正在做的事", "感觉像隔着一层雾看世界，人和物显得遥远或模糊"
      ],
      reverse: [], scoring: { method: "mean", min: 0, max: 100, missing: "no_total" },
      bands: [{ min: 0, max: 29.99, key: "below", label: "低于 30" }, { min: 30, max: 100, key: "above", label: "30 及以上" }],
      thresholds: [{ score: 30, dir: "ge", who: "Carlson & Putnam 1993", meaning: "建议进一步专业评估的分界" }],
      riskItems: [], impairment: null
    },

    msi: {
      id: "msi", domain: "人格与关系", nameZh: "边缘型人格相关特征", abbr: "MSI-BPD", fullName: "McLean Screening Instrument for Borderline Personality Disorder",
      measures: "与边缘型人格障碍相关的 10 项特征（情绪剧烈波动、关系动荡、冲动、空虚感、害怕被抛弃等）。",
      notMeasures: "不能诊断人格障碍；这些特征也常见于创伤后应激、情绪障碍和高压时期。人格障碍只能由临床访谈判断。",
      population: "成年人（18 岁及以上）", recall: "无特定时间（通常的情况）", minutes: 2,
      textVersion: { status: "working", note: "本站工作译本；已发表中文版尚未比对。" },
      license: { holder: "Mary C. Zanarini 等（McLean Hospital）", terms: "本轮未找到作者对网页自测的使用条款。", source: "https://pubmed.ncbi.nlm.nih.gov/14744082/", commercialDisplay: "未知", status: "pending", verifiedOn: "2026-11-13" },
      evidence: { original: "Zanarini MC, et al. A screening measure for BPD: the MSI-BPD. J Pers Disord. 2003;17(6):568–573.（200 名有治疗史者；7 分为最佳分界）", chinese: "本轮未核验中文验证研究。", limits: "原始验证样本为有治疗史的成年人；在普通人群中假阳性会增多。", status: "partial" },
      stem: "请回答“是”或“否”：",
      options: [{ label: "是", value: 1 }, { label: "否", value: 0 }],
      items: [
        "你最亲密的关系是否因为大量争吵或反复分手而受到困扰？", "你是否曾故意伤害自己的身体（如割伤、烫伤、抓伤），或曾尝试自杀？",
        "你是否至少有两种其他的冲动问题（如暴食、冲动消费、饮酒过量、言语爆发）？", "你是否情绪变化极大？",
        "你是否很多时候感到非常愤怒，或常常表现出愤怒或尖刻？", "你是否常常不信任他人？", "你是否经常感到不真实，或觉得周围的事物不真实？",
        "你是否长期感到空虚？", "你是否常常觉得不知道自己是谁，或觉得没有自我认同？",
        "你是否曾拼命努力避免被抛弃或感到被抛弃（如反复打电话确认对方还在乎你、恳求对方不要离开、紧紧抓住对方不放）？"
      ],
      reverse: [], scoring: { method: "sum", min: 0, max: 10, missing: "no_total" },
      bands: [{ min: 0, max: 6, key: "below", label: "0–6" }, { min: 7, max: 10, key: "above", label: "7–10" }],
      thresholds: [{ score: 7, dir: "ge", who: "Zanarini 等 2003（有治疗史的成年人）", meaning: "研究中区分有无边缘型人格障碍的最佳分界" }],
      riskItems: [{ index: 1, minValue: 1, flag: "self_harm_history" }], impairment: null
    },

    npi16: {
      id: "npi16", domain: "人格与关系", nameZh: "自恋特质（亚临床）", abbr: "NPI-16", fullName: "Narcissistic Personality Inventory-16",
      measures: "一般人群中普遍存在的自恋特质（自我欣赏、追求关注、领导欲等）的程度。",
      notMeasures: "不能诊断自恋型人格障碍（NPD）。这是对你自己的特质描述，不能用来评判他人。",
      population: "成年人（18 岁及以上）", recall: "无特定时间", minutes: 3,
      preNote: "每题有两句话，选更接近你的那一句。没有对错，也没有“好”或“坏”的答案。",
      textVersion: { status: "working", note: "本站工作译本；两句话的左右顺序为本站固定排列，已发表中文版尚未比对。" },
      license: { holder: "Ames, Rose & Anderson（2006）；原 NPI 为 Raskin & Terry", terms: "作者公开发布供研究使用；本轮未取得网页自测的明确许可。", source: "https://www.columbia.edu/~da358/npi16/", commercialDisplay: "未知", status: "pending", verifiedOn: "2026-11-13" },
      evidence: { original: "Ames DR, Rose P, Anderson CP. The NPI-16 as a short measure of narcissism. J Res Pers. 2006;40:440–450.", chinese: "本轮未核验中文验证研究。", limits: "研究工具，没有临床分界；主要在美国大学生样本中验证。", status: "partial" },
      stem: "选择更符合你的一句：",
      options: [],
      items: [
        { text: "", options: [{ label: "我知道自己很优秀，因为大家总这么说", value: 1 }, { label: "别人夸我时，我有时会不好意思", value: 0 }] },
        { text: "", options: [{ label: "我更喜欢融入人群", value: 0 }, { label: "我喜欢成为众人关注的焦点", value: 1 }] },
        { text: "", options: [{ label: "我认为自己是个特别的人", value: 1 }, { label: "我不比大多数人好，也不比他们差", value: 0 }] },
        { text: "", options: [{ label: "我不介意听从命令", value: 0 }, { label: "我喜欢拥有支配他人的权力", value: 1 }] },
        { text: "", options: [{ label: "我觉得操纵别人很容易", value: 1 }, { label: "当我发现自己在操纵别人时，我会不喜欢", value: 0 }] },
        { text: "", options: [{ label: "我通常能得到我应得的尊重", value: 0 }, { label: "我坚持要得到我应得的尊重", value: 1 }] },
        { text: "", options: [{ label: "一有机会我就爱炫耀", value: 1 }, { label: "我尽量不炫耀", value: 0 }] },
        { text: "", options: [{ label: "有时我也不确定自己在做什么", value: 0 }, { label: "我总是知道自己在做什么", value: 1 }] },
        { text: "", options: [{ label: "大家都喜欢听我讲故事", value: 1 }, { label: "有时我能讲出好故事", value: 0 }] },
        { text: "", options: [{ label: "我喜欢为别人做事", value: 0 }, { label: "我对别人期望很高", value: 1 }] },
        { text: "", options: [{ label: "我真的很喜欢成为关注的中心", value: 1 }, { label: "成为关注的中心让我不自在", value: 0 }] },
        { text: "", options: [{ label: "成为权威对我来说没那么重要", value: 0 }, { label: "人们似乎总是认可我的权威", value: 1 }] },
        { text: "", options: [{ label: "我将会成为一个伟大的人", value: 1 }, { label: "我希望自己会成功", value: 0 }] },
        { text: "", options: [{ label: "人们有时会相信我说的话", value: 0 }, { label: "我能让任何人相信任何我想让他们相信的事", value: 1 }] },
        { text: "", options: [{ label: "我比别人更有能力", value: 1 }, { label: "我可以从别人身上学到很多", value: 0 }] },
        { text: "", options: [{ label: "我和其他人差不多", value: 0 }, { label: "我是一个非凡的人", value: 1 }] }
      ],
      reverse: [], scoring: { method: "sum", min: 0, max: 16, missing: "no_total" },
      bands: [{ min: 0, max: 16, key: "any", label: "0–16（无临床分界）" }],
      thresholds: [], riskItems: [], impairment: null
    },

    ecrr: {
      id: "ecrr", domain: "人格与关系", nameZh: "成人依恋（亲密关系）", abbr: "ECR-R", fullName: "Experiences in Close Relationships-Revised",
      measures: "在亲密关系中的两个维度：依恋焦虑（担心被抛弃、不被爱）和依恋回避（不习惯亲近和依赖）。",
      notMeasures: "不把人分成“类型”，也不是心理健康筛查。没有恋爱经历的人可能觉得题目不贴切。",
      population: "成年人（18 岁及以上）", recall: "在亲密关系中通常的感受（不只是当前这段关系）", minutes: 8,
      textVersion: { status: "working", note: "本站工作译本；已发表中文版尚未比对。" },
      license: { holder: "R. Chris Fraley、Niels Waller、Kelly Brennan", terms: "作者实验室公开发布；非商业研究可免费使用，商业用途需作者许可（据二手资料，本轮未在作者页找到正式条款）。", source: "https://labs.psychology.illinois.edu/~rcfraley/measures/ecrritems.htm", commercialDisplay: "需作者许可", status: "pending", verifiedOn: "2026-11-13" },
      evidence: { original: "Fraley RC, Waller NG, Brennan KA. An item response theory analysis of self-report measures of adult attachment. J Pers Soc Psychol. 2000;78(2):350–365.", chinese: "本轮未核验中文验证研究。", limits: "只报告两个连续维度；没有分界和“类型”。", status: "partial" },
      stem: "想想你在亲密关系中通常的感受。你对下面这句话的同意程度是？",
      options: [{ label: "1 非常不同意", value: 1 }, { label: "2", value: 2 }, { label: "3", value: 3 }, { label: "4 中立", value: 4 }, { label: "5", value: 5 }, { label: "6", value: 6 }, { label: "7 非常同意", value: 7 }],
      items: [
        "我害怕会失去伴侣的爱", "我常常担心伴侣不愿意和我在一起", "我常常担心伴侣并不是真的爱我", "我担心恋人对我的在乎不如我对他/她的在乎",
        "我常常希望伴侣对我的感情能像我对他/她的感情一样强烈", "我很担心我的感情关系", "伴侣不在身边时，我担心他/她可能会对别人产生兴趣",
        "当我向恋人表达感情时，我害怕对方不会有同样的感觉", "我很少担心伴侣会离开我", "我的伴侣让我怀疑自己", "我不常担心被抛弃",
        "我发现伴侣不愿意像我希望的那样亲近我", "有时恋人会无缘无故地改变对我的感情", "我渴望非常亲密，这有时会把别人吓跑",
        "我害怕一旦恋人真正了解我，就不会喜欢真实的我", "得不到伴侣的关心和支持时，我会很生气", "我担心自己比不上别人", "伴侣似乎只有在我生气时才会注意到我",
        "我不喜欢让伴侣知道我内心深处的感受", "我很自在地和伴侣分享私密的想法和感受", "我很难允许自己依赖恋人", "和恋人亲近让我感到很自在",
        "我不太愿意向恋人敞开心扉", "我不喜欢和恋人太亲近", "当恋人想要非常亲近时，我会感到不舒服", "我觉得和伴侣亲近相对容易", "和伴侣亲近对我来说并不难",
        "我通常会和伴侣讨论我的问题和担忧", "需要帮助时，向恋人求助对我很有帮助", "我几乎什么都会告诉伴侣", "我会和伴侣把事情谈开",
        "当伴侣太靠近我时，我会紧张", "依赖恋人让我感到自在", "我觉得依赖恋人很容易", "对伴侣表达亲昵对我来说很容易", "我的伴侣真正理解我和我的需要"
      ],
      reverse: [8, 10, 19, 21, 25, 26, 27, 28, 29, 30, 32, 33, 34, 35],
      scoring: { method: "subscales", missing: "no_total", subs: [{ key: "anxiety", label: "依恋焦虑", from: 0, to: 17 }, { key: "avoidance", label: "依恋回避", from: 18, to: 35 }] },
      bands: [], thresholds: [], riskItems: [], impairment: null
    },

    asrs: {
      id: "asrs", domain: "其他", nameZh: "成人注意力缺陷/多动（ADHD）筛查", abbr: "ASRS v1.1", fullName: "Adult ADHD Self-Report Scale v1.1 Screener",
      measures: "过去六个月与成人 ADHD 相关的 6 项表现。",
      notMeasures: "不能诊断 ADHD；焦虑、抑郁、睡眠不足、物质使用都可能导致类似表现。诊断需要了解童年起的情况。",
      population: "成年人（18 岁及以上）", recall: "过去六个月", minutes: 2,
      textVersion: { status: "working", note: "本站工作译本。作者要求使用未经改动的版本；正式使用前须取得官方中文版或作者确认。" },
      license: { holder: "World Health Organization / New York University & Harvard（Kessler 等）", terms: "6 题筛查版免费使用、无需正式许可；须引用原文、保留版权声明、不得改动。", source: "https://www.hcp.med.harvard.edu/ncs/asrs.php", commercialDisplay: "允许（须保留版权声明、不得改动）", status: "verified", verifiedOn: "2026-11-13" },
      evidence: { original: "Kessler RC, et al. The World Health Organization Adult ADHD Self-Report Scale (ASRS). Psychol Med. 2005;35(2):245–256.", chinese: "本轮未核验中文验证研究。", limits: "在抑郁或物质使用人群中阳性预测值较低（假阳性较多）。", status: "partial" },
      stem: "过去六个月里……",
      options: [{ label: "从不", value: 0 }, { label: "很少", value: 1 }, { label: "有时", value: 2 }, { label: "经常", value: 3 }, { label: "非常频繁", value: 4 }],
      items: [
        "当一项工作中最有挑战性的部分完成后，你有多经常难以完成最后的细节收尾？", "当你必须做一件需要条理的工作时，你有多经常难以把事情安排得井井有条？",
        "你有多经常难以记住约会或必须做的事？", "当一项任务需要大量思考时，你有多经常回避或拖延开始？",
        "当你需要长时间坐着时，你有多经常坐不住，手或脚动来动去？", "你有多经常感到过度活跃、不得不做事情，好像被马达驱动一样？"
      ],
      reverse: [], scoring: { method: "count_ge", cuts: [2, 2, 2, 3, 3, 3], min: 0, max: 6, missing: "no_total" },
      bands: [{ min: 0, max: 3, key: "below", label: "0–3 项" }, { min: 4, max: 6, key: "above", label: "4–6 项" }],
      thresholds: [{ score: 4, dir: "ge", who: "ASRS 筛查版说明", meaning: "表现与成人 ADHD 高度一致，建议进一步评估" }],
      riskItems: [], impairment: null
    },

    audit: {
      id: "audit", domain: "其他", nameZh: "饮酒情况", abbr: "AUDIT", fullName: "Alcohol Use Disorders Identification Test",
      measures: "过去一年的饮酒量、饮酒依赖迹象和饮酒带来的问题。",
      notMeasures: "不能诊断酒精使用障碍；不评估其他物质。",
      population: "成年人（18 岁及以上）", recall: "过去一年", minutes: 3,
      preNote: "一“标准杯”约含 10 克纯酒精。不喝酒的人第 1 题选“从不”后，其余题目按实际情况作答即可。",
      textVersion: { status: "working", note: "本站工作译本。WHO 手册附有翻译与改编指南；已发表中文版尚未比对。" },
      license: { holder: "World Health Organization", terms: "WHO 发布，量表与手册可免费获取使用。", source: "https://www.who.int/publications/i/item/who-msd-msb-01.6a", commercialDisplay: "本轮未核实 WHO 对商业展示的具体条款", status: "partial", verifiedOn: "2026-11-13" },
      evidence: { original: "Babor TF, Higgins-Biddle JC, Saunders JB, Monteiro MG. AUDIT: Guidelines for Use in Primary Care. 2nd ed. WHO; 2001.", chinese: "本轮未核验中文验证研究。", limits: "分界在不同国家、性别和年龄中不同；低收入和中等收入国家的研究提示分界可能需要调整。", status: "partial" },
      stem: "关于你过去一年的饮酒情况：",
      options: [],
      items: (function () {
        var F = ["从不", "每月少于一次", "每月", "每周", "每天或几乎每天"].map(function (l, i) { return { label: l, value: i }; });
        var Y = [{ label: "没有", value: 0 }, { label: "有，但不是在过去一年", value: 2 }, { label: "有，在过去一年中", value: 4 }];
        return [
          { text: "你多久喝一次含酒精的饮料？", options: ["从不", "每月一次或更少", "每月 2–4 次", "每周 2–3 次", "每周 4 次或以上"].map(function (l, i) { return { label: l, value: i }; }) },
          { text: "在喝酒的日子里，你通常喝多少“标准杯”？", options: ["1–2 杯", "3–4 杯", "5–6 杯", "7–9 杯", "10 杯或以上"].map(function (l, i) { return { label: l, value: i }; }) },
          { text: "你多久会有一次在一个场合喝 6 杯或以上？", options: F },
          { text: "过去一年中，你多久会发现自己一开始喝酒就停不下来？", options: F },
          { text: "过去一年中，你多久会因为喝酒而没能做到平时应该做的事？", options: F },
          { text: "过去一年中，你多久会在大量饮酒后的早上，需要先喝一杯才能“缓过来”？", options: F },
          { text: "过去一年中，你多久会在喝酒后感到内疚或后悔？", options: F },
          { text: "过去一年中，你多久会因为喝酒而记不起前一晚发生的事？", options: F },
          { text: "你或其他人是否曾因为你喝酒而受伤？", options: Y },
          { text: "是否有亲友、医生或其他医务人员担心你喝酒，或建议你少喝？", options: Y }
        ];
      })(),
      reverse: [], scoring: { method: "sum", min: 0, max: 40, missing: "no_total" },
      bands: [{ min: 0, max: 7, key: "z1", label: "0–7" }, { min: 8, max: 15, key: "z2", label: "8–15" }, { min: 16, max: 19, key: "z3", label: "16–19" }, { min: 20, max: 40, key: "z4", label: "20–40" }],
      thresholds: [{ score: 8, dir: "ge", who: "WHO AUDIT 手册", meaning: "提示危险或有害饮酒的常用分界" }],
      riskItems: [], impairment: null
    },

    scoff: {
      id: "scoff", domain: "其他", nameZh: "饮食困扰筛查", abbr: "SCOFF", fullName: "SCOFF Questionnaire",
      measures: "与进食障碍相关的 5 个核心迹象。",
      notMeasures: "不能诊断进食障碍，也不评估体重或营养状况。",
      population: "成年人（18 岁及以上）", recall: "近期", minutes: 1,
      textVersion: { status: "working", note: "本站工作译本；原题体重以英石（约 6.35 公斤）表述，本站按“约 6 公斤”表述。已发表中文版尚未比对。" },
      license: { holder: "Morgan JF, Reid F, Lacey JH（BMJ 1999）", terms: "本轮未核验使用条款。", source: "https://doi.org/10.1136/bmj.319.7223.1467", commercialDisplay: "未知", status: "pending", verifiedOn: "2026-11-13" },
      evidence: { original: "Morgan JF, Reid F, Lacey JH. The SCOFF questionnaire: assessment of a new screening tool for eating disorders. BMJ. 1999;319(7223):1467–1468.", chinese: "本轮未核验中文验证研究。", limits: "本轮未核验原文的验证样本与分界细节；2 分及以上为常用分界。", status: "pending" },
      stem: "请回答“是”或“否”：",
      options: [{ label: "是", value: 1 }, { label: "否", value: 0 }],
      items: ["你是否曾因为吃得太饱、感到不舒服而让自己呕吐？", "你是否担心自己无法控制吃多少？", "你最近三个月内体重是否下降超过约 6 公斤？", "当别人说你太瘦时，你是否仍觉得自己胖？", "你是否觉得食物主宰了你的生活？"],
      reverse: [], scoring: { method: "sum", min: 0, max: 5, missing: "no_total" },
      bands: [{ min: 0, max: 1, key: "below", label: "0–1" }, { min: 2, max: 5, key: "above", label: "2–5" }],
      thresholds: [{ score: 2, dir: "ge", who: "SCOFF 常用分界", meaning: "建议进一步专业评估" }],
      riskItems: [], impairment: null
    },

    sci: {
      id: "sci", domain: "睡眠", nameZh: "睡眠状况（失眠筛查）", abbr: "SCI", fullName: "Sleep Condition Indicator",
      measures: "按 DSM-5 失眠障碍的标准，评估过去一个月的入睡、夜醒、频率、睡眠质量、白天影响和持续时间。",
      notMeasures: "不能诊断失眠障碍，不评估睡眠呼吸暂停等其他睡眠疾病。如果有打鼾憋气、白天极度嗜睡，请直接就医。",
      population: "成年人（18 岁及以上）", recall: "过去一个月", minutes: 2,
      textVersion: { status: "working", note: "本站工作译本；已发表中文版尚未比对。分数越高表示睡眠越好。" },
      license: { holder: "Espie CA 等（2014）", terms: "随 BMJ Open 论文以 CC BY-NC（署名-非商业）许可发布，注明出处、非商业使用可复制。", source: "https://doi.org/10.1136/bmjopen-2013-004183", commercialDisplay: "不允许（非商业许可）", status: "verified", verifiedOn: "2026-11-13" },
      evidence: { original: "Espie CA, Kyle SD, Hames P, Gardani M, Fleming L, Cape J. The Sleep Condition Indicator: a clinical screening tool to evaluate insomnia disorder. BMJ Open. 2014;4(3):e004183.（5 个样本共 30941 人，α≥0.86）", chinese: "本轮未核验中文验证研究。", limits: "作者指出 16 分分界仍需与临床评估进一步核对；验证数据来自网络招募样本。", status: "partial" },
      stem: "想想过去一个月的睡眠情况：",
      options: [],
      items: (function () {
        var T = ["0–15 分钟", "16–30 分钟", "31–45 分钟", "46–60 分钟", "61 分钟以上"].map(function (l, i) { return { label: l, value: 4 - i }; });
        var E = ["完全没有", "有一点", "有些", "很大", "非常大"].map(function (l, i) { return { label: l, value: 4 - i }; });
        return [
          { text: "你通常需要多长时间才能入睡？", options: T },
          { text: "夜里醒来后，你总共醒着多长时间？", options: T },
          { text: "每周有几个晚上存在睡眠问题？", options: ["0–1 晚", "2 晚", "3 晚", "4 晚", "5–7 晚"].map(function (l, i) { return { label: l, value: 4 - i }; }) },
          { text: "你如何评价自己的睡眠质量？", options: ["很好", "好", "一般", "差", "很差"].map(function (l, i) { return { label: l, value: 4 - i }; }) },
          { text: "睡不好在多大程度上影响了你的情绪、精力或人际关系？", options: E },
          { text: "睡不好在多大程度上影响了你的注意力、工作效率或白天保持清醒的能力？", options: E },
          { text: "总的来说，睡不好在多大程度上困扰着你？", options: E },
          { text: "你的睡眠问题持续多久了？", options: ["没有问题，或不到 1 个月", "1–2 个月", "3–6 个月", "7–12 个月", "超过 1 年"].map(function (l, i) { return { label: l, value: 4 - i }; }) }
        ];
      })(),
      reverse: [], scoring: { method: "sum", min: 0, max: 32, missing: "no_total" },
      bands: [{ min: 0, max: 16, key: "below", label: "0–16" }, { min: 17, max: 32, key: "above", label: "17–32" }],
      thresholds: [{ score: 16, dir: "le", who: "Espie 等 2014", meaning: "提示可能存在失眠障碍（作者说明仍需临床确认）" }],
      riskItems: [], impairment: null
    },

    ocir: {
      id: "ocir", domain: "焦虑相关", nameZh: "强迫症状", abbr: "OCI-R", fullName: "Obsessive-Compulsive Inventory-Revised",
      measures: "过去一个月 6 类强迫相关体验带来的困扰：清洗、检查、排序、强迫思维、囤积、中和。",
      notMeasures: "不能诊断强迫症。爱整洁、做事仔细不等于强迫症；囤积题分数高时也可能是囤积障碍。",
      population: "成年人（18 岁及以上）", recall: "过去一个月", minutes: 4,
      textVersion: { status: "working", note: "本站工作译本；已发表中文版尚未比对。" },
      license: { holder: "Edna B. Foa", terms: "版权属于 Foa；多个公共卫生机构免费分发，商业部署前应取得书面许可。本轮未取得作者对网页自测的明确许可。", source: "https://pubmed.ncbi.nlm.nih.gov/12501574/", commercialDisplay: "需书面许可", status: "pending", verifiedOn: "2026-11-13" },
      evidence: { original: "Foa EB, Huppert JD, Leiberg S, et al. The Obsessive-Compulsive Inventory: development and validation of a short version. Psychol Assess. 2002;14(4):485–496.（215 名强迫症患者、243 名其他焦虑障碍患者、677 名非焦虑者）", chinese: "本轮未核验中文验证研究。", limits: "21 分分界来自原始研究；在普通人群中假阳性可能较多。", status: "partial" },
      stem: "以下体验在过去一个月让你困扰的程度是？",
      options: [{ label: "一点也不", value: 0 }, { label: "有一点", value: 1 }, { label: "中等", value: 2 }, { label: "相当多", value: 3 }, { label: "极其严重", value: 4 }],
      items: [
        "我攒了太多东西，以至于它们碍事", "我检查东西的次数比必要的多", "如果东西没有摆放得当，我会心烦", "做事时我会不由自主地数数",
        "当我知道某样东西被陌生人或某些人碰过时，我很难去碰它", "我很难控制自己的想法", "我收集一些我不需要的东西", "我会反复检查门、窗、抽屉等",
        "如果别人改变了我摆放东西的方式，我会心烦", "我觉得必须重复某些数字", "有时仅仅因为觉得自己被污染了，我就必须洗澡或清洁自己",
        "违背我意愿闯入脑海的不愉快想法让我心烦", "我不愿扔掉东西，因为怕以后会用到", "关掉煤气、水龙头和电灯开关后，我会反复检查",
        "我需要东西按特定的方式摆放", "我觉得数字有好坏之分", "我洗手的次数比必要的多、时间比必要的长", "我经常有很糟糕的念头，而且很难摆脱"
      ],
      reverse: [], scoring: { method: "sum", min: 0, max: 72, missing: "no_total",
        subSums: [{ label: "囤积", items: [0, 6, 12] }, { label: "检查", items: [1, 7, 13] }, { label: "排序", items: [2, 8, 14] }, { label: "中和", items: [3, 9, 15] }, { label: "清洗", items: [4, 10, 16] }, { label: "强迫思维", items: [5, 11, 17] }] },
      bands: [{ min: 0, max: 20, key: "below", label: "0–20" }, { min: 21, max: 72, key: "above", label: "21–72" }],
      thresholds: [{ score: 21, dir: "ge", who: "Foa 等 2002", meaning: "提示可能存在强迫症、值得专业评估的分界" }],
      riskItems: [], impairment: null
    },

    sias: {
      id: "sias", domain: "焦虑相关", nameZh: "社交焦虑", abbr: "SIAS", fullName: "Social Interaction Anxiety Scale",
      measures: "在与人交往的情境中（说话、认识新朋友、在群体中）感到的焦虑。",
      notMeasures: "不能诊断社交焦虑障碍；内向、不爱社交不等于社交焦虑。",
      population: "成年人（18 岁及以上）", recall: "通常的情况", minutes: 4,
      textVersion: { status: "working", note: "本站工作译本；第 14 题原文为“与有吸引力的异性交谈”，本站按原意翻译。已发表中文版尚未比对。" },
      license: { holder: "Mattick RP, Clarke JC（1998）", terms: "美国北卡罗来纳州卫生与公众服务部发布的版本注明属于公有领域，可为个人或团体使用复制。", source: "https://ncdhhs.gov/documents/files/social-interaction-anxiety-scale/open", commercialDisplay: "本轮未核实", status: "verified", verifiedOn: "2026-11-13" },
      evidence: { original: "Mattick RP, Clarke JC. Development and validation of measures of social phobia scrutiny fear and social interaction anxiety. Behav Res Ther. 1998;36(4):455–470.", chinese: "本轮未核验中文验证研究。", limits: "34 和 43 分为常引用的分界，本轮只在二手资料中见到，未在原始文献中核实。第 5、9、11 题按惯例反向计分。", status: "partial" },
      stem: "这句话在多大程度上符合你？",
      options: [{ label: "完全不符合", value: 0 }, { label: "有点符合", value: 1 }, { label: "中等符合", value: 2 }, { label: "非常符合", value: 3 }, { label: "完全符合", value: 4 }],
      items: [
        "如果必须和有权威的人（如老师、上司）说话，我会紧张", "我很难和别人进行眼神接触", "如果必须谈论自己或自己的感受，我会变得紧张", "我很难自在地和同事相处",
        "我觉得和同龄人交朋友很容易", "如果在街上遇到熟人，我会紧张起来", "在社交场合中，我感到不自在", "如果只和另一个人单独相处，我会感到紧张",
        "在聚会等场合认识新朋友时，我很自在", "我很难和别人交谈", "我觉得很容易想到可以聊的话题", "我担心表达自己时会显得笨拙",
        "我很难反对别人的观点", "我很难和有吸引力的异性交谈", "我发现自己会担心在社交场合不知道该说什么", "和不太熟的人相处时，我会紧张",
        "我觉得自己说话时会说出让人尴尬的话", "在群体中时，我会担心自己被忽视", "在群体中时，我会感到紧张", "遇到只是略微认识的人，我不确定要不要打招呼"
      ],
      reverse: [4, 8, 10], scoring: { method: "sum", min: 0, max: 80, missing: "no_total" },
      bands: [{ min: 0, max: 33, key: "below", label: "0–33" }, { min: 34, max: 42, key: "mid", label: "34–42" }, { min: 43, max: 80, key: "high", label: "43–80" }],
      thresholds: [{ score: 34, dir: "ge", who: "常引用分界（二手资料）", meaning: "社交焦虑较明显" }, { score: 43, dir: "ge", who: "常引用分界（二手资料）", meaning: "社交焦虑很明显，值得专业评估" }],
      riskItems: [], impairment: null
    },

    phqpd: {
      id: "phqpd", domain: "焦虑相关", nameZh: "惊恐发作", abbr: "PHQ-PD", fullName: "Patient Health Questionnaire – Panic Disorder module",
      measures: "过去四周是否有过突然的焦虑发作（惊恐发作），以及发作时的身体症状。",
      notMeasures: "不能诊断惊恐障碍。心慌、胸痛、喘不上气等症状也可能来自身体疾病，需要医生排除。",
      population: "成年人（18 岁及以上）", recall: "过去四周", minutes: 2,
      preNote: "如果你此刻正在经历胸痛、呼吸困难等症状，请先就医或拨打急救电话，不要做问卷。",
      textVersion: { status: "working", note: "本站工作译本；Pfizer 提供官方中文版，正式使用前须替换。第一题回答“否”时，其余题目自动跳过（与原问卷的跳题规则一致）。" },
      license: { holder: "Pfizer Inc.（PHQ 开发者 Spitzer、Williams、Kroenke 等）", terms: "PHQ 系列无需许可即可复制、翻译、展示或分发。", source: "https://www.phqscreeners.com", commercialDisplay: "允许", status: "verified", verifiedOn: "2026-11-13" },
      evidence: { original: "Spitzer RL, Kroenke K, Williams JBW. Validation and utility of a self-report version of PRIME-MD: the PHQ primary care study. JAMA. 1999;282(18):1737–1744.", chinese: "本轮未核验中文验证研究。", limits: "在高风险初级保健人群中表现中等；合并其他精神问题时灵敏度升高、特异度下降。判定规则（前四题均为“是”且身体症状 ≥4 种）依据 PHQ 使用手册，本轮未逐字核对手册原文。", status: "partial" },
      stem: "关于焦虑发作：",
      options: [{ label: "是", value: 1 }, { label: "否", value: 0 }],
      items: [
        "过去四周里，你是否有过焦虑发作——突然感到恐惧或惊慌？", "这种情况以前发生过吗？", "其中是否有些发作是突然出现的——在你并不预期会紧张或不舒服的情境下？", "这些发作是否让你非常困扰，或者你担心再次发作？",
        { text: "呼吸急促", stem: "想想你最近一次严重的焦虑发作，当时你是否有：" }, { text: "心跳加快、怦怦直跳或漏跳", stem: "最近一次严重发作时，是否有：" },
        { text: "胸痛或胸闷", stem: "最近一次严重发作时，是否有：" }, { text: "出汗", stem: "最近一次严重发作时，是否有：" }, { text: "感觉像要窒息", stem: "最近一次严重发作时，是否有：" },
        { text: "潮热或发冷", stem: "最近一次严重发作时，是否有：" }, { text: "恶心、胃部不适，或感觉要腹泻", stem: "最近一次严重发作时，是否有：" },
        { text: "头晕、站不稳或要晕倒", stem: "最近一次严重发作时，是否有：" }, { text: "身体某些部位刺痛或麻木", stem: "最近一次严重发作时，是否有：" },
        { text: "颤抖或发抖", stem: "最近一次严重发作时，是否有：" }, { text: "害怕自己快要死了", stem: "最近一次严重发作时，是否有：" }
      ],
      reverse: [], scoring: { method: "phqpd", min: 0, max: 11, missing: "no_total" },
      bands: [{ key: "positive", label: "符合问卷的惊恐综合征判定规则" }, { key: "attacks", label: "有焦虑发作，未达到判定规则" }, { key: "noattack", label: "过去四周没有焦虑发作" }],
      thresholds: [], riskItems: [], impairment: null
    }
  };

  var api = { INSTRUMENTS: INSTRUMENTS };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.INSTRUMENTS = INSTRUMENTS;
})(this);
