/**
 * HánNgữ Pro - Bilingual Translation Arena Data
 * Multi-tiered translation challenges from HSK 1 to HSK 9 with model answers,
 * acceptable alternatives, syntactic structure breakdowns, and Vietnamese-Chinese transfer tips.
 */

export const TRANSLATION_CHALLENGES = [
  {
    id: "trans_elem_01",
    level: 2,
    tier: "Sơ Cấp (HSK 1-3)",
    topic: "Giao tiếp sinh hoạt & Mua sắm",
    direction: "vi_to_zh", // Translate from Vietnamese to Chinese
    prompt: "Xin hỏi, quả táo này bao nhiêu tiền một cân? Có thể bớt chút được không?",
    referenceZh: "请问，这个苹果多少钱一斤？能便宜一点儿吗？",
    pinyin: "Qǐngwèn, zhège píngguǒ duōshao qián yì jīn? Néng piányi yìdiǎnr ma?",
    acceptableAnswers: [
      "请问，这个苹果多少钱一斤？可以便宜一点吗？",
      "请问，这苹果一斤多少钱？能便宜点儿吗？",
      "请问，苹果多少钱一斤？便宜一点行吗？"
    ],
    pedagogicalNotes: "Trong tiếng Trung, đơn vị cân truyền thống (斤 - jīn) bằng 500 gram (nửa kg). Cấu trúc hỏi giá phổ biến: '多少钱一斤'. Cụm 'bớt chút được không' dùng '便宜一点儿' (piányi yìdiǎnr) đi với năng nguyện động từ 能 hoặc 可以.",
    keywords: ["请问", "苹果", "多少钱", "一斤", "便宜"]
  },
  {
    id: "trans_elem_02",
    level: 3,
    tier: "Sơ Cấp (HSK 1-3)",
    topic: "Lịch hẹn & Phương tiện giao thông",
    direction: "vi_to_zh",
    prompt: "Ngày mai tôi phải cùng bạn cùng phòng đi thư viện mượn sách.",
    referenceZh: "明天我要跟室友一起去图书馆借书。",
    pinyin: "Míngtiān wǒ yào gēn shìyǒu yìqǐ qù túshūguǎn jiè shū.",
    acceptableAnswers: [
      "明天我和室友一起去图书馆借书。",
      "明天我要同室友一起到图书馆借书。"
    ],
    pedagogicalNotes: "Trật tự câu tiếng Hán: Trạng ngữ thời gian (明天) đứng trước hoặc sau chủ ngữ. Cụm giới từ chỉ đối tượng liên kết '跟/和 + Ai + 一起' bắt buộc phải đứng TRƯỚC động từ hành vi (去图书馆借书). Người Việt hay nhầm đặt 'cùng bạn' ở cuối câu giống tiếng Việt.",
    keywords: ["明天", "室友", "一起", "图书馆", "借书"]
  },
  {
    id: "trans_inter_03",
    level: 4,
    tier: "Trung Cấp (HSK 4-6)",
    topic: "Phỏng vấn & Trải nghiệm công việc",
    direction: "vi_to_zh",
    prompt: "Dù công việc này có nhiều áp lực, nhưng tôi tin rằng nó có thể giúp tôi tích lũy được nhiều kinh nghiệm quý báu.",
    referenceZh: "虽然这份工作压力很大，但是我相信它能帮我积累很多宝贵的经验。",
    pinyin: "Suīrán zhè fèn gōngzuò yālì hěn dà, dànshì wǒ xiāngxìn tā néng bāng wǒ jīlěi hěn duō bǎoguì de jīngyàn.",
    acceptableAnswers: [
      "尽管这份工作有很多压力，但我相信它能够让我积累许多宝贵的经验。",
      "虽然工作压力不小，但我坚信这可以帮助我积累宝贵经验。"
    ],
    pedagogicalNotes: "Cặp liên từ biểu thị quan hệ nhượng bộ '虽然...但是...'. Lượng từ cho công việc là 份 (fèn: 这份工作). Cụm động tân kinh điển: 积累经验 (tích lũy kinh nghiệm), định ngữ đứng trước trung tâm ngữ: 宝贵的经验 (kinh nghiệm quý báu).",
    keywords: ["虽然", "压力", "相信", "积累", "宝贵", "经验"]
  },
  {
    id: "trans_inter_04",
    level: 5,
    tier: "Trung Cấp (HSK 4-6)",
    topic: "Bảo vệ môi trường & Đời sống xanh",
    direction: "vi_to_zh",
    prompt: "Chúng ta cần giảm thiểu việc sử dụng đồ nhựa dùng một lần để bảo vệ môi trường sinh thái của Trái Đất.",
    referenceZh: "我们应该减少一次性塑料制品的使用，以保护地球的生态环境。",
    pinyin: "Wǒmen yīnggāi jiǎnshǎo yícìxìng sùliào zhìpǐn de shǐyòng, yǐ bǎohù dìqiú de shēngtài huánjìng.",
    acceptableAnswers: [
      "我们要尽量少用一次性塑料制品，来保护地球生态环境。",
      "我们必须减少使用一次性塑料制品，以便保护地球的生态环境。"
    ],
    pedagogicalNotes: "Cụm danh từ 'đồ nhựa dùng một lần' là '一次性塑料制品' (yícìxìng sùliào zhìpǐn). Liên từ liên kết mục đích hành động '以 / 以便 / 来' (để làm gì) nối hai phân câu chuẩn văn phong nghị luận HSK 5.",
    keywords: ["减少", "一次性", "塑料", "保护", "地球", "生态环境"]
  },
  {
    id: "trans_adv_05",
    level: 7,
    tier: "Cao Cấp (HSK 7-9)",
    topic: "Kinh tế số & Toàn cầu hóa",
    direction: "zh_to_vi", // Translate Chinese to Vietnamese
    prompt: "随着人工智能与大数据技术的迅猛发展，传统制造业正经历着前所未有的全方位数字化重构与转型升级。",
    referenceVi: "Cùng với sự phát triển nhanh chóng của công nghệ trí tuệ nhân tạo và dữ liệu lớn, ngành chế tạo truyền thống đang trải qua một cuộc tái cấu trúc và chuyển đổi số hóa toàn diện chưa từng có.",
    pinyin: "Suízhe réngōng zhìnéng yǔ dà shùjù jìshù de xùnměng fāzhǎn, chuántǒng zhìzàoyè zhèng jīnglì zhe qiánsuǒwèiyǒu de quánfāngwèi shùzìhuà chónggòu yǔ zhuǎnxíng shēngjí.",
    acceptableAnswers: [
      "Với sự phát triển vũ bão của trí tuệ nhân tạo và dữ liệu lớn, ngành sản xuất truyền thống đang trải qua quá trình tái cơ cấu và nâng cấp số hóa toàn diện chưa từng thấy."
    ],
    pedagogicalNotes: "Các thuật ngữ chuyên ngành kinh tế công nghệ cao: 人工智能 (AI), 大数据 (Big Data), 迅猛发展 (phát triển vũ bão/nhanh chóng), 传统制造业 (ngành chế tạo truyền thống), 前所未有 (chưa từng có), 数字化重构 (tái cấu trúc số hóa), 转型升级 (chuyển đổi và nâng cấp).",
    keywords: ["trí tuệ nhân tạo", "dữ liệu lớn", "chế tạo truyền thống", "chuyển đổi số", "tái cấu trúc", "chưa từng có"]
  },
  {
    id: "trans_adv_06",
    level: 8,
    tier: "Cao Cấp (HSK 7-9)",
    topic: "Văn hóa & Ngoại giao song phương",
    direction: "zh_to_vi",
    prompt: "深化人文交流与文明互鉴，不仅有助于增进两国人民的相互理解，更是推动全面战略合作伙伴关系行稳致远的坚实基石。",
    referenceVi: "Làm sâu sắc thêm giao lưu nhân văn và học hỏi lẫn nhau giữa các nền văn minh không chỉ giúp tăng cường sự hiểu biết lẫn nhau giữa nhân dân hai nước, mà còn là nền tảng vững chắc để thúc đẩy quan hệ đối tác hợp tác chiến lược toàn diện tiến bước vững chắc và lâu dài.",
    pinyin: "Shēnhuà rénwén jiāoliú yǔ wénmíng hùjiàn, bùjǐn yǒuzhùyú zēngjìn liǎng guó rénmín de xiānghù lǐjiě, gèng shì tuīdòng quánmiàn zhànlüè hézuò huǒbàn guānxì xíng wěn zhì yuǎn de jiānshí jīshí.",
    acceptableAnswers: [
      "Đi sâu giao lưu nhân văn và trao đổi văn minh không những có lợi cho việc tăng cường hiểu biết lẫn nhau giữa nhân dân hai nước, mà còn là hòn đá tảng vững bền thúc đẩy quan hệ đối tác hợp tác chiến lược toàn diện phát triển ổn định, vươn xa."
    ],
    pedagogicalNotes: "Văn phong chính luận ngoại giao HSK 7-9: 人文交流 (giao lưu nhân văn), 文明互鉴 (học hỏi lẫn nhau giữa các nền văn minh), 有助于 (có lợi cho / giúp ích cho), 全面战略合作伙伴关系 (quan hệ đối tác hợp tác chiến lược toàn diện), 行稳致远 (tiến bước vững chắc và vươn xa), 坚实基石 (nền tảng vững chắc / hòn đá tảng vững bền).",
    keywords: ["giao lưu nhân văn", "hiểu biết lẫn nhau", "đối tác chiến lược", "vững chắc", "lâu dài"]
  }
];
