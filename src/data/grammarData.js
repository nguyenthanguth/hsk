/**
 * HánNgữ Pro - HSK Grammar Matrix & Interactive Pattern Master
 * Comprehensive grammar points covering HSK 1 to HSK 9 with 
 * formulas, explanations, common pitfalls for Vietnamese learners, 
 * contextual examples, and sentence scramble exercises.
 */

export const HSK_GRAMMAR_POINTS = [
  {
    id: "gram_ba_01",
    level: 3,
    title: "Câu chữ 把 (把字句) - Cấu trúc xử lý đối tượng",
    pinyinFormula: "S + 把 + O + V + Thành phần khác",
    category: "Cấu trúc câu đặc biệt",
    summary: "Dùng để nhấn mạnh hành động tác động lên một đối tượng xác định và làm đối tượng đó phát sinh biến hóa, dời chỗ hoặc thay đổi trạng thái.",
    formula: "Chủ ngữ + 把 + Tân ngữ (xác định) + Động từ + [Bổ ngữ / 了 / Lặp lại]",
    vietnamesePitfall: "Người Việt hay dịch theo lối xuôi 'Tôi ăn xong cơm rồi' thành '我吃完饭了', nhưng nếu muốn nhấn mạnh kết quả xử lý đối tượng (ví dụ: 'mau ăn hết bát cơm này đi') thì phải dùng 把: '快把这碗饭吃了'. Tuyệt đối không được để động từ đứng trơ trọi một mình mà không có thành phần bổ trợ phía sau!",
    examples: [
      {
        zh: "请把门关上，外面风很大。",
        pinyin: "Qǐng bǎ mén guān shàng, wàimiàn fēng hěn dà.",
        vi: "Xin hãy đóng cửa lại, bên ngoài gió rất to.",
        analysis: "Chủ ngữ (请) + 把 + Tân ngữ (门) + Động từ (关) + Bổ ngữ xu hướng (上)"
      },
      {
        zh: "他把老师布置的作业做完了。",
        pinyin: "Tā bǎ lǎoshī bùzhì de zuòyè zuò wán le.",
        vi: "Anh ấy đã làm xong bài tập thầy giáo giao rồi.",
        analysis: "Chủ ngữ (他) + 把 + Tân ngữ (作业) + Động từ (做) + Bổ ngữ kết quả (完) + 了"
      },
      {
        zh: "你能把那本词典借给我用一下吗？",
        pinyin: "Nǐ néng bǎ nà běn cídiǎn jiè gěi wǒ yòng yíxià ma?",
        vi: "Bạn có thể cho tôi mượn cuốn từ điển đó dùng một chút được không?",
        analysis: "Năng nguyện động từ (能) đứng trước 把 + Tân ngữ xác định (那本词典) + 借给"
      }
    ],
    exercise: {
      prompt: "Sắp xếp các khối từ sau để tạo thành câu chữ 把 hoàn chỉnh:",
      meaning: "Tôi đã gửi tài liệu đó cho giám đốc rồi.",
      tokens: ["我", "已经", "把", "那份文件", "发给", "经理了"],
      correctOrder: ["我", "已经", "把", "那份文件", "发给", "经理了"]
    }
  },
  {
    id: "gram_bei_02",
    level: 4,
    title: "Câu chữ 被 (被字句) - Thể bị động trong tiếng Hán",
    pinyinFormula: "S + 被 / 叫 / 让 + (Tác nhân) + V + Thành phần khác",
    category: "Cấu trúc câu đặc biệt",
    summary: "Biểu thị chủ ngữ tiếp nhận tác động từ người hoặc sự vật khác. Trong tiếng Trung truyền thống, câu chữ 被 thường mang sắc thái không mong muốn, gặp bất lợi hoặc biến cố.",
    formula: "Chủ ngữ (kẻ chịu tác động) + 被 (叫 / 让) + [Tác nhân] + Động từ + Thành phần khác",
    vietnamesePitfall: "Trong tiếng Việt có thể dùng 'bị' (tiêu cực) hoặc 'được' (tích cực), nhưng câu chữ 被 trong tiếng Hán chủ yếu dùng cho nghĩa bị động tiêu cực hoặc trung tính. Khi dùng 叫 hoặc 让 thay cho 被 trong khẩu ngữ, bắt buộc PHẢI có tác nhân hành động (không được lược bỏ tác nhân như 被).",
    examples: [
      {
        zh: "我的自行车被小偷偷走了。",
        pinyin: "Wǒ de zìxíngchē bèi xiǎotōu tōu zǒu le.",
        vi: "Xe đạp của tôi bị kẻ trộm lấy đi mất rồi.",
        analysis: "Chủ thể chịu tác động (我的自行车) + 被 + Tác nhân (小偷) + Động từ (偷) + Bổ ngữ xu hướng (走) + 了"
      },
      {
        zh: "那个秘密终于被大家知道了。",
        pinyin: "Nàge mìmì zhōngyú bèi dàjiā zhīdào le.",
        vi: "Bí mật đó cuối cùng cũng bị mọi người biết rồi.",
        analysis: "Biểu thị trạng thái bị động đã phát sinh kết quả"
      }
    ],
    exercise: {
      prompt: "Sắp xếp các khối từ sau thành câu bị động chính xác:",
      meaning: "Bánh ngọt trên bàn bị em trai ăn hết rồi.",
      tokens: ["桌子上的", "蛋糕", "被", "弟弟", "吃光了"],
      correctOrder: ["桌子上的", "蛋糕", "被", "弟弟", "吃光了"]
    }
  },
  {
    id: "gram_bi_03",
    level: 2,
    title: "Câu so sánh 比 (比字句) & Biểu thị mức độ chênh lệch",
    pinyinFormula: "A + 比 + B + Tính từ / (Động từ + 得 + Tính từ)",
    category: "Cấu trúc so sánh",
    summary: "Dùng giới từ 比 để so sánh mức độ, tính chất giữa hai sự vật A và B.",
    formula: "A + 比 + B + Tính từ + (一点儿 / 得多 / 多了 / Số lượng cụ thể)",
    vietnamesePitfall: "LỖI KINH ĐIỂN: Rất nhiều người Việt nói nhầm 'A 比 B 很 高' (SAI). Trong câu so sánh 比, KHÔNG ĐƯỢC dùng các phó từ chỉ mức độ như 很, 非常, 太 trước tính từ. Nếu muốn nhấn mạnh hơn nữa, phải dùng 更 (càng) hoặc 还!",
    examples: [
      {
        zh: "今天比昨天冷多了。",
        pinyin: "Jīntiān bǐ zuótiān lěng duō le.",
        vi: "Hôm nay lạnh hơn hôm qua nhiều.",
        analysis: "A (今天) + 比 + B (昨天) + Tính từ (冷) + Mức độ chênh lệch (多了)"
      },
      {
        zh: "他中文说得比我流利得多。",
        pinyin: "Tā zhōngwén shuō de bǐ wǒ liúlì de duō.",
        vi: "Anh ấy nói tiếng Trung lưu loát hơn tôi rất nhiều.",
        analysis: "So sánh kết quả hành vi: V + 得 + 比 + B + Tính từ"
      }
    ],
    exercise: {
      prompt: "Sắp xếp các khối từ so sánh đúng quy tắc ngữ pháp:",
      meaning: "Anh ấy cao hơn tôi tận 5 centimet.",
      tokens: ["他", "比", "我", "高", "五公分"],
      correctOrder: ["他", "比", "我", "高", "五公分"]
    }
  },
  {
    id: "gram_result_04",
    level: 3,
    title: "Bổ ngữ kết quả (结果补语) & Bổ ngữ khả năng (可能补语)",
    pinyinFormula: "V + 见 / 懂 / 完 / 到 vs V + 得/不 + 懂",
    category: "Hệ thống bổ ngữ",
    summary: "Bổ ngữ kết quả biểu thị hành động đã đạt tới kết quả nào đó; Bổ ngữ khả năng biểu thị trong điều kiện khách quan hoặc chủ quan có thể đạt tới kết quả đó hay không.",
    formula: "Khẳng định: V + 得 + Bổ ngữ | Phủ định: V + 不 + Bổ ngữ",
    vietnamesePitfall: "Người Việt hay dùng '能 / 不能' để diễn đạt khả năng trong mọi ngữ cảnh. Nhưng trong tiếng Trung, khi nói về khả năng nghe hiểu, nhìn thấy tại thời điểm nói thì chuẩn xác nhất là dùng Bổ ngữ khả năng: '听得懂' (nghe hiểu được) / '听不懂' (nghe không hiểu), '看得见' (nhìn thấy được) / '看不见' (không nhìn thấy).",
    examples: [
      {
        zh: "老师说得太快了，我听不懂。",
        pinyin: "Lǎoshī shuō de tài kuài le, wǒ tīng bù dǒng.",
        vi: "Thầy giáo nói nhanh quá, tôi nghe không hiểu được.",
        analysis: "Bổ ngữ khả năng phủ định: 听 (Động từ) + 不 + 懂 (Bổ ngữ)"
      },
      {
        zh: "你准备好去北京留学了吗？",
        pinyin: "Nǐ zhǔnbèi hǎo qù Běijīng liúxué le ma?",
        vi: "Bạn đã chuẩn bị xong xuôi để đi Bắc Kinh du học chưa?",
        analysis: "Bổ ngữ kết quả: 准备 (V) + 好 (kết quả sẵn sàng, chu đáo)"
      }
    ],
    exercise: {
      prompt: "Sắp xếp các khối từ bổ ngữ khả năng sau:",
      meaning: "Chữ viết trên bảng đen quá nhỏ, tôi nhìn không thấy rõ.",
      tokens: ["黑板上的字", "太小了，", "我", "看不清楚"],
      correctOrder: ["黑板上的字", "太小了，", "我", "看不清楚"]
    }
  },
  {
    id: "gram_exist_05",
    level: 4,
    title: "Câu tồn hiện (存现句) - Miêu tả sự tồn tại, xuất hiện, biến mất",
    pinyinFormula: "Từ chỉ nơi chốn + Động từ + 着 / 了 + Danh từ",
    category: "Cấu trúc câu đặc biệt",
    summary: "Dùng để biểu thị ở một địa điểm nào đó đang tồn tại, vừa xuất hiện hoặc vừa biến mất một người hoặc sự vật nào đó.",
    formula: "Từ chỉ nơi chốn (không có giới từ 在) + Động từ + [着 / 了] + Danh từ (thường là bất định)",
    vietnamesePitfall: "Người Việt thường thêm giới từ 'Ở' (在) ở đầu câu, ví dụ: '在桌子上放着一本书' (SAI hoặc tối nghĩa). Trong câu tồn hiện tiếng Hán, vị ngữ là động từ tồn tại nên từ chỉ nơi chốn đứng trực tiếp làm chủ ngữ, KHÔNG ĐƯỢC thêm 在 ở đầu câu!",
    examples: [
      {
        zh: "门前停着两辆崭新的小汽车。",
        pinyin: "Mén qián tíng zhe liǎng liàng zhǎnxīn de xiǎo qìchē.",
        vi: "Trước cửa đang đỗ hai chiếc ô tô con mới toanh.",
        analysis: "Từ chỉ nơi chốn (门前) + Động từ (停) + Trợ từ trạng thái (着) + Danh từ (两辆小汽车)"
      },
      {
        zh: "前面走过来一位满头白发的老爷爷。",
        pinyin: "Qiánmiàn zǒu guòlái yí wèi mǎntóu báifà de lǎoyéye.",
        vi: "Phía trước đi lại một cụ ông mái tóc bạc trắng.",
        analysis: "Tồn hiện dạng xuất hiện: Nơi chốn + Động từ xu hướng + Danh từ"
      }
    ],
    exercise: {
      prompt: "Sắp xếp câu tồn hiện theo đúng quy tắc:",
      meaning: "Trên tường treo một bức tranh phong cảnh Trung Quốc rất đẹp.",
      tokens: ["墙上", "挂着", "一幅美丽的", "中国山水画"],
      correctOrder: ["墙上", "挂着", "一幅美丽的", "中国山水画"]
    }
  },
  {
    id: "gram_correlative_06",
    level: 4,
    title: "Liên từ phức: 不但...而且... / 无论...都... / 既然...就...",
    pinyinFormula: "Liên từ 1 + Mệnh đề A, Liên từ 2 + Mệnh đề B",
    category: "Liên từ & Câu phức",
    summary: "Các cấu trúc câu phức biểu thị quan hệ tăng tiến, vô điều kiện, hoặc nhân quả tiền đề.",
    formula: "不但 (không những) A 而且 (mà còn) B | 无论 (bất kể) A 都/也 (đều) B | 既然 (nếu đã/một khi đã) A 就 (thì) B",
    vietnamesePitfall: "Khi hai phân câu có cùng chủ ngữ, chủ ngữ đứng TRƯỚC 不但 ('他不但会说中文，而且说得很棒'); khi hai phân câu có chủ ngữ khác nhau, chủ ngữ phải đứng SAU 不但 ('不但他喜欢，而且我也喜欢').",
    examples: [
      {
        zh: "无论遇到什么困难，我们都要坚持下去。",
        pinyin: "Wúlùn yù dào shénme kùnnan, wǒmen dōu yào jiānchí xiàqù.",
        vi: "Bất kể gặp phải khó khăn gì, chúng ta đều phải kiên trì tới cùng.",
        analysis: "Cấu trúc vô điều kiện: 无论...都..."
      },
      {
        zh: "既然你已经决定了，就全力以赴去拼搏吧。",
        pinyin: "Jìrán nǐ yǐjīng juédìng le, jiù quánlì yǐ fù qù pīnbó ba.",
        vi: "Một khi bạn đã quyết định rồi, thì hãy dốc toàn lực chiến đấu đi.",
        analysis: "Cấu trúc nhân quả tiền đề: 既然...就..."
      }
    ],
    exercise: {
      prompt: "Sắp xếp câu phức tăng tiến sau:",
      meaning: "Cô ấy không những thông minh, mà còn đặc biệt chăm chỉ.",
      tokens: ["她", "不但", "非常聪明，", "而且", "十分努力"],
      correctOrder: ["她", "不但", "非常聪明，", "而且", "十分努力"]
    }
  },
  {
    id: "gram_shide_07",
    level: 2,
    title: "Cấu trúc nhấn mạnh 是...的 (强调句)",
    pinyinFormula: "S + (是) + [Thời gian / Địa điểm / Phương thức] + V + 的",
    category: "Cấu trúc câu đặc biệt",
    summary: "Dùng khi hành động ĐÃ XẢY RA trong quá khứ và người nói muốn nhấn mạnh vào: thời gian, địa điểm, phương thức, mục đích hoặc tác nhân thực hiện hành động.",
    formula: "Chủ ngữ + (是) + [Thời gian / Nơi chốn / Phương tiện] + Động từ + 的",
    vietnamesePitfall: "Rất nhiều người nhầm '是...的' với câu chữ 是 chỉ bản chất sự vật (Tôi là học sinh). Chú ý: '是...的' chỉ dùng cho hành động ĐÃ XẢY RA, không dùng cho hành động chưa phát sinh!",
    examples: [
      {
        zh: "我是去年九月坐飞机来北京的。",
        pinyin: "Wǒ shì qùnián jiǔ yuè zuò fēijī lái Běijīng de.",
        vi: "Tôi đến Bắc Kinh vào tháng 9 năm ngoái bằng máy bay (Nhấn mạnh thời gian & phương tiện).",
        analysis: "Hành động đã hoàn thành trong quá khứ, nhấn mạnh thời gian (去年九月) và phương thức (坐飞机)"
      },
      {
        zh: "这本书不是在书店买的，是我朋友送的。",
        pinyin: "Zhè běn shū bú shì zài shūdiàn mǎi de, shì wǒ péngyǒu sòng de.",
        vi: "Quyển sách này không phải mua ở hiệu sách, mà là do bạn tôi tặng.",
        analysis: "Dạng phủ định: 不是 + Địa điểm / Tác nhân + V + 的"
      }
    ],
    exercise: {
      prompt: "Sắp xếp cấu trúc nhấn mạnh 是...的:",
      meaning: "Chúng tôi quen biết nhau tại trường đại học.",
      tokens: ["我们", "是", "在大学里", "认识的"],
      correctOrder: ["我们", "是", "在大学里", "认识的"]
    }
  },
  {
    id: "gram_hsk79_08",
    level: 7,
    title: "Ngữ pháp cao cấp HSK 7-9: 鉴于...特此... & 纵使...亦...",
    pinyinFormula: "鉴于...，特此... | 纵使...，亦...",
    category: "Ngữ pháp chính luận & Văn ngôn",
    summary: "Cấu trúc mang phong cách văn kiện ngoại giao, kinh tế thương mại và học thuật cao cấp trong HSK 3.0 bậc 7-9.",
    formula: "鉴于 + [Nguyên nhân / Căn cứ pháp lý / Tình hình khách quan], 特此 + [Công bố quyết định / Thông báo]; 纵使 + [Giả thuyết cực đoan], 亦 + [Kết quả không đổi]",
    vietnamesePitfall: "Trong văn phong giao tiếp hàng ngày không dùng các mẫu câu này, nhưng trong bài thi đọc hiểu và dịch thuật HSK 7-9 thì đây là các cấu trúc cốt lõi phân loại học viên xuất sắc.",
    examples: [
      {
        zh: "鉴于双方在数字经济领域的互补优势，特此签署战略合作框架协议。",
        pinyin: "Jiànyú shuāngfāng zài shùzì jīngjì lǐngyù de hùbǔ yōushì, tècǐ qiānshǔ zhànlüè hézuò kuàngjià xiéyì.",
        vi: "Xét thấy ưu thế bổ trợ lẫn nhau của hai bên trong lĩnh vực kinh tế số, nay trân trọng ký kết thỏa thuận khung hợp tác chiến lược.",
        analysis: "Văn phong công văn thương mại chính quy chuẩn mực HSK 7-9"
      }
    ],
    exercise: {
      prompt: "Sắp xếp văn kiện hợp tác theo chuẩn ngữ pháp HSK 7-9:",
      meaning: "Xét thấy tình hình thị trường biến động, nay đặc biệt thông báo quy tắc mới.",
      tokens: ["鉴于", "市场形势发生变化，", "特此", "通知新的规则"],
      correctOrder: ["鉴于", "市场形势发生变化，", "特此", "通知新的规则"]
    }
  }
];
