/* 求助资源。按用户主动选择的地区显示。只收录本轮核验过的号码。 */
(function (root) {
  var RESOURCES = {
    verifiedOn: "2026-11-16",
    regions: {
      cn: {
        name: "中国大陆",
        lines: [
          { name: "全国统一心理援助热线", number: "12356", note: "国家卫生健康委设置，2025 年 5 月 1 日起全国 31 个省份均已接通。", source: "https://www.news.cn/politics/20250508/b45e439c15bb4732858ad5c7640e9ba9/c.html" }
        ],
        emergency: "有立即危险：拨打 120（急救）或 110（报警），或前往最近医院急诊。"
      },
      kr: {
        name: "韩国",
        lines: [
          { name: "自杀预防咨询电话（자살예방상담전화）", number: "109", note: "24 小时、全年无休；2024 年 1 月起取代 1393 等旧号码。", source: "https://www.korea.kr/news/policyNewsView.do?newsId=148921684" }
        ],
        emergency: "有立即危险：拨打 119（急救）或 112（报警），或前往最近医院急诊。"
      },
      hk: {
        name: "中国香港",
        lines: [
          { name: "香港撒瑪利亞防止自殺會", number: "2389 2222", note: "24 小时，粤语。", source: "https://www.sbhk.org.hk/" },
          { name: "撒瑪利亞會（多语言）", number: "2896 0000", note: "24 小时，粤语、普通话、英语。", source: "https://samaritans.org.hk/" },
          { name: "生命熱線", number: "2382 0000", note: "24 小时，粤语。", source: "https://www.sps.org.hk/" },
          { name: "「情緒通」精神健康支援熱線", number: "18111", note: "24 小时，香港特区政府设立。", source: "https://www.shallwetalk.hk/" }
        ],
        emergency: "有立即危险：拨打 999，或前往最近医院急诊。"
      },
      mo: {
        name: "中国澳门",
        lines: [
          { name: "澳門明愛生命熱線", number: "2852 5222", note: "24 小时，中文。", source: "https://www.macaubusiness.com/macau-mental-health-and-suicide-prevention-assistance-readily-accessible-in-macau-caritas/" },
          { name: "生命熱線外語熱線（英语、葡语）", number: "2852 5777", note: "非 24 小时，服务时段请以官方公布为准。", source: "https://macaonews.org/" }
        ],
        emergency: "有立即危险：拨打 999，或前往最近医院急诊。"
      },
      tw: {
        name: "中国台湾",
        lines: [
          { name: "安心专线（卫福部）", number: "1925", note: "24 小时，免费。", source: "https://www.mohw.gov.tw/" },
          { name: "生命线协谈专线", number: "1995", note: "情绪支持与协谈。", source: "https://www.life1995.org.tw/" },
          { name: "张老师专线", number: "1980", note: "情绪支持与协谈。", source: "https://www.1980.org.tw/" }
        ],
        emergency: "有立即危险：拨打 119（急救）或 110（报警），或前往最近医院急诊。"
      },
      jp: {
        name: "日本",
        lines: [
          { name: "よりそいホットライン", number: "0120-279-338", note: "24 小时，免费，语音引导中可选择外语服务。", source: "https://www.mhlw.go.jp/mamorouyokokoro/soudan/tel/index.html" },
          { name: "#いのちSOS", number: "0120-061-338", note: "24 小时，免费，日语。", source: "https://www.mhlw.go.jp/mamorouyokokoro/soudan/tel/index.html" }
        ],
        emergency: "有立即危险：拨打 119（急救）或 110（报警），或前往最近医院急诊。"
      },
      sg: {
        name: "新加坡",
        lines: [
          { name: "Samaritans of Singapore（SOS）", number: "1767", note: "24 小时；也可 WhatsApp 文字联系 9151 1767。", source: "https://www.sos.org.sg/" },
          { name: "national mindline", number: "1771", note: "24 小时，全国心理健康热线。", source: "https://www.imh.com.sg/" }
        ],
        emergency: "有立即危险：拨打 995（急救）或 999（报警），或前往最近医院急诊。"
      },
      my: {
        name: "马来西亚",
        lines: [
          { name: "Befrienders Kuala Lumpur", number: "03-7627 2929", note: "24 小时，免费保密。", source: "https://www.befrienders.org.my/" },
          { name: "Talian Kasih", number: "15999", note: "24 小时，政府热线，支持马来语、英语、华语。", source: "https://befrienders.org.my/" },
          { name: "Talian HEAL（卫生部）", number: "15555", note: "每天 8:00–24:00。", source: "https://befrienders.org.my/" }
        ],
        emergency: "有立即危险：拨打 999，或前往最近医院急诊。"
      },
      us: {
        name: "美国",
        lines: [
          { name: "988 Suicide & Crisis Lifeline", number: "988", note: "24 小时，可打电话或发短信；可要求翻译服务。", source: "https://www.samhsa.gov/" }
        ],
        emergency: "有立即危险：拨打 911，或前往最近医院急诊。"
      },
      ca: {
        name: "加拿大",
        lines: [
          { name: "9-8-8 Suicide Crisis Helpline", number: "988", note: "24 小时，可打电话或发短信，英语、法语。", source: "https://988.ca/" }
        ],
        emergency: "有立即危险：拨打 911，或前往最近医院急诊。"
      },
      uk: {
        name: "英国 / 爱尔兰",
        lines: [
          { name: "Samaritans", number: "116 123", note: "24 小时，免费，英国和爱尔兰均可拨打。", source: "https://www.samaritans.org/" }
        ],
        emergency: "有立即危险：英国拨打 999，爱尔兰拨打 112 或 999，或前往最近医院急诊。"
      },
      au: {
        name: "澳大利亚",
        lines: [
          { name: "Lifeline Australia", number: "13 11 14", note: "24 小时；需要中文翻译可先拨 13 14 50（TIS），再请对方转接 13 11 14。", source: "https://www.lifeline.org.au/" }
        ],
        emergency: "有立即危险：拨打 000，或前往最近医院急诊。"
      },
      nz: {
        name: "新西兰",
        lines: [
          { name: "Need to talk?", number: "1737", note: "24 小时，免费，可打电话或发短信。", source: "https://mentalhealth.org.nz/helplines" }
        ],
        emergency: "有立即危险：拨打 111，或前往最近医院急诊。"
      },
      other: {
        name: "其他国家/地区",
        lines: [],
        emergency: "可以在 findahelpline.com 查找你所在国家或地区的免费求助热线（支持中文界面）。如有立即危险，请拨打当地急救电话或前往最近医院急诊，也可以联系你信任的人陪伴你。"
      }
    }
  };
  if (typeof module !== "undefined" && module.exports) module.exports = { RESOURCES: RESOURCES };
  else root.RESOURCES = RESOURCES;
})(this);
