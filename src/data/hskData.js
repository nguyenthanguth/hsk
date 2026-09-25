/**
 * HánNgữ Pro - HSK 1-9 Curriculum Data
 * Standardized according to Chinese Proficiency Grading Standards (HSK 3.0)
 */

export const HSK_LEVELS = [
  {
    id: 1,
    level: 'HSK 1',
    tier: 'Sơ Cấp (初级)',
    band: 'Cấp độ 1',
    standardWords: 500,
    charactersCount: 300,
    desc: 'Làm quen nền tảng: Bính âm (Pinyin), thanh điệu, chào hỏi, số đếm, gia đình và sinh hoạt cơ bản.',
    color: '#10B981', // Emerald
    badge: 'Khởi động',
    overview: 'Thí sinh có thể hiểu và sử dụng một số từ ngữ, câu đơn giản nhất để đáp ứng nhu cầu giao tiếp cụ thể, bước đầu xây dựng nền tảng học tiếp.',
    examStructure: 'Nghe (20 câu - 15 phút) | Đọc hiểu (20 câu - 17 phút). Điểm tối đa: 200 điểm (Qua: 120).'
  },
  {
    id: 2,
    level: 'HSK 2',
    tier: 'Sơ Cấp (初级)',
    band: 'Cấp độ 2',
    standardWords: 1272,
    charactersCount: 600,
    desc: 'Giao tiếp hàng ngày: Mua sắm, hỏi đường, thời tiết, phương tiện giao thông và thói quen sinh hoạt.',
    color: '#06B6D4', // Cyan
    badge: 'Tự tin giao tiếp cơ bản',
    overview: 'Thí sinh có thể trao đổi trực tiếp và đơn giản về các chủ đề quen thuộc hàng ngày, đạt mức sơ cấp vững chắc.',
    examStructure: 'Nghe (35 câu - 25 phút) | Đọc hiểu (25 câu - 22 phút). Điểm tối đa: 200 điểm (Qua: 120).'
  },
  {
    id: 3,
    level: 'HSK 3',
    tier: 'Sơ Cấp (初级)',
    band: 'Cấp độ 3',
    standardWords: 2245,
    charactersCount: 900,
    desc: 'Tự lập ngôn ngữ: Du lịch, công sở cơ bản, thảo luận sở thích, bày tỏ cảm xúc và suy nghĩ cá nhân.',
    color: '#3B82F6', // Blue
    badge: 'Độc lập giao tiếp',
    overview: 'Thí sinh có thể dùng tiếng Trung hoàn thành các nhiệm vụ giao tiếp cơ bản trong học tập, công việc và đời sống, tự tin du lịch khắp Trung Quốc.',
    examStructure: 'Nghe (40 câu - 35 phút) | Đọc (30 câu - 30 phút) | Viết (10 câu - 15 phút). Điểm tối đa: 300 điểm (Qua: 180).'
  },
  {
    id: 4,
    level: 'HSK 4',
    tier: 'Trung Cấp (中级)',
    band: 'Cấp độ 4',
    standardWords: 3245,
    charactersCount: 1200,
    desc: 'Trung cấp thực thụ: Bàn luận các chủ đề xã hội, văn hóa, kinh tế cơ bản; diễn đạt lưu loát với người bản xứ.',
    color: '#8B5CF6', // Purple
    badge: 'Du học & Làm việc',
    overview: 'Thí sinh có thể thảo luận bằng tiếng Trung về phạm vi chủ đề tương đối rộng, giao lưu tương đối trôi chảy với người bản xứ.',
    examStructure: 'Nghe (45 câu - 30 phút) | Đọc (40 câu - 40 phút) | Viết (15 câu - 25 phút). Điểm tối đa: 300 điểm (Qua: 180).'
  },
  {
    id: 5,
    level: 'HSK 5',
    tier: 'Trung Cấp (中级)',
    band: 'Cấp độ 5',
    standardWords: 4316,
    charactersCount: 1500,
    desc: 'Làm chủ ngôn ngữ: Đọc báo chí, xem phim không phụ đề, viết bài luận và thuyết trình chuyên nghiệp.',
    color: '#EC4899', // Pink
    badge: 'Chuyên nghiệp',
    overview: 'Thí sinh có thể đọc hiểu báo chí, tạp chí tiếng Trung, thưởng thức phim ảnh tiếng Trung, diễn thuyết trọn vẹn bằng tiếng Trung.',
    examStructure: 'Nghe (45 câu - 30 phút) | Đọc (45 câu - 45 phút) | Viết (10 câu - 40 phút). Điểm tối đa: 300 điểm (Qua: 180).'
  },
  {
    id: 6,
    level: 'HSK 6',
    tier: 'Trung Cấp (中级)',
    band: 'Cấp độ 6',
    standardWords: 5456,
    charactersCount: 1800,
    desc: 'Thành thạo cao cấp: Sử dụng thành ngữ điêu luyện, phân tích phong cách văn học, tranh luận các vấn đề trừu tượng.',
    color: '#F59E0B', // Amber
    badge: 'Thành thạo tự nhiên',
    overview: 'Thí sinh có thể dễ dàng hiểu mọi thông tin tiếng Trung nghe hoặc đọc được, diễn đạt trôi chảy, linh hoạt bằng văn viết lẫn văn nói.',
    examStructure: 'Nghe (50 câu - 35 phút) | Đọc (50 câu - 50 phút) | Viết (Tóm tắt bài văn 1000 chữ thành 400 chữ - 45 phút). Điểm tối đa: 300.'
  },
  {
    id: 7,
    level: 'HSK 7',
    tier: 'Cao Cấp (高级 HSK 3.0)',
    band: 'Cấp độ 7 - Chuyên gia',
    standardWords: 7500,
    charactersCount: 2200,
    desc: 'Nghiên cứu & Học thuật: Đọc tài liệu chuyên ngành, phân tích báo cáo tài chính, ngoại giao và chính sách.',
    color: '#EF4444', // Red
    badge: 'Học thuật & Chuyên ngành',
    overview: 'Cấp độ 7 trong chuẩn HSK 3.0 mới: Thí sinh tham gia nghiên cứu học thuật, dịch thuật tài liệu chuyên ngành, đàm phán thương mại quốc tế.',
    examStructure: 'Thi chung HSK 7-9: Nghe, Đọc, Viết, Dịch thuật song ngữ (Trung-Việt/Anh) và Phỏng vấn nói chuyên sâu.'
  },
  {
    id: 8,
    level: 'HSK 8',
    tier: 'Cao Cấp (高级 HSK 3.0)',
    band: 'Cấp độ 8 - Bậc thầy',
    standardWords: 9500,
    charactersCount: 2600,
    desc: 'Văn hóa & Xã luận: Hiểu sâu cổ văn, triết học phương Đông, các xu thế kinh tế - công nghệ mang tính toàn cầu.',
    color: '#DC2626', // Deep Red
    badge: 'Biên dịch viên Cao cấp',
    overview: 'Khả năng phân tích tư tưởng, phản biện văn hóa, xử lý các bài phát biểu ngoại giao tinh vi và dịch thuật văn học phức tạp.',
    examStructure: 'Đánh giá toàn diện 5 kỹ năng: Nghe hiểu học thuật, Đọc hiểu văn bản sâu, Viết luận nghị luận, Dịch nói & Dịch viết chuyên sâu.'
  },
  {
    id: 9,
    level: 'HSK 9',
    tier: 'Cao Cấp (高级 HSK 3.0)',
    band: 'Cấp độ 9 - Đỉnh cao Ngôn ngữ',
    standardWords: 11092,
    charactersCount: 3000,
    desc: 'Bản ngữ chuyên gia: Khả năng làm chủ ngôn ngữ ở cấp độ nhà nghiên cứu, cố vấn chính sách, thông dịch viên cabin quốc tế.',
    color: '#991B1B', // Imperial Crimson
    badge: 'Đỉnh cao HSK 3.0',
    overview: 'Đỉnh cao của hệ thống HSK 3.0 mới: Thông thạo cả Hán ngữ cổ đại lẫn hiện đại, tư duy phản biện sắc sảo, giao tiếp không ranh giới.',
    examStructure: 'Bài kiểm tra tiêu chuẩn quốc gia phân hạng 7, 8 hoặc 9 dựa trên tổng điểm và mức độ làm chủ dịch thuật cabin, luận học thuật.'
  }
];

export const HSK_VOCABULARY = {
  1: [
    {
      hanzi: '你好',
      pinyin: 'nǐ hǎo',
      hanviet: 'nhĩ hảo',
      meaning: 'Xin chào',
      radical: '亻 (Nhân đứng)',
      level: 1,
      example: '你好！很高兴认识你。',
      examplePinyin: 'Nǐ hǎo! Hěn gāoxìng rènshí nǐ.',
      exampleMeaning: 'Xin chào! Rất vui được quen biết bạn.',
      notes: 'Lời chào phổ biến nhất. Khi chào người lớn tuổi hoặc kính trọng thì dùng 您好 (nín hǎo).'
    },
    {
      hanzi: '谢谢',
      pinyin: 'xièxie',
      hanviet: 'tạ tạ',
      meaning: 'Cảm ơn',
      radical: '讠 (Ngôn)',
      level: 1,
      example: '太谢谢你了，帮了我大忙。',
      examplePinyin: 'Tài xièxie nǐ le, bāng le wǒ dà máng.',
      exampleMeaning: 'Rất cảm ơn bạn, đã giúp tôi việc lớn.',
      notes: 'Người Việt chú ý thanh nhẹ ở chữ thứ hai (xièxie, không đọc xiè xiè).'
    },
    {
      hanzi: '再见',
      pinyin: 'zàijiàn',
      hanviet: 'tái kiến',
      meaning: 'Tạm biệt, hẹn gặp lại',
      radical: '冂 (Quynh) / 见 (Kiến)',
      level: 1,
      example: '明天见，老师再见！',
      examplePinyin: 'Míngtiān jiàn, lǎoshī zàijiàn!',
      exampleMeaning: 'Ngày mai gặp lại, tạm biệt thầy cô!',
      notes: '再 (lại) + 见 (gặp) = gặp lại lần sau.'
    },
    {
      hanzi: '吃',
      pinyin: 'chī',
      hanviet: 'ngật',
      meaning: 'Ăn',
      radical: '口 (Khẩu)',
      level: 1,
      example: '你吃中国菜吗？',
      examplePinyin: 'Nǐ chī Zhōngguó cài ma?',
      exampleMeaning: 'Bạn có ăn món ăn Trung Quốc không?',
      notes: 'Âm cong lưỡi "ch", phân biệt với "c" (không cong lưỡi).'
    },
    {
      hanzi: '喝',
      pinyin: 'hē',
      hanviet: 'hát',
      meaning: 'Uống',
      radical: '口 (Khẩu)',
      level: 1,
      example: '我想喝一杯热茶。',
      examplePinyin: 'Wǒ xiǎng hē yī bēi rè chá.',
      exampleMeaning: 'Tôi muốn uống một ly trà nóng.',
      notes: 'Thanh 1 (âm cao, bằng phẳng 5-5). Hán Việt là "hát" nhưng nghĩa tiếng Trung là "uống".'
    },
    {
      hanzi: '苹果',
      pinyin: 'píngguǒ',
      hanviet: 'bình quả',
      meaning: 'Quả táo',
      radical: '艹 (Thảo đầu)',
      level: 1,
      example: '这个红苹果非常甜。',
      examplePinyin: 'Zhège hóng píngguǒ fēicháng tián.',
      exampleMeaning: 'Quả táo đỏ này rất ngọt.',
      notes: 'Thường kết hợp với lượng từ 个 (gè): 一个苹果.'
    },
    {
      hanzi: '多少',
      pinyin: 'duōshao',
      hanviet: 'đa thiểu',
      meaning: 'Bao nhiêu',
      radical: '夕 (Tịch) / 小 (Tiểu)',
      level: 1,
      example: '请问这个多少钱？',
      examplePinyin: 'Qǐngwèn zhège duōshao qián?',
      exampleMeaning: 'Xin hỏi cái này bao nhiêu tiền?',
      notes: 'Dùng hỏi số lượng trên 10; dưới 10 thường dùng 几 (jǐ).'
    },
    {
      hanzi: '喜欢',
      pinyin: 'xǐhuan',
      hanviet: 'hỉ hoan',
      meaning: 'Thích, yêu thích',
      radical: '士 (Sĩ) / 欠 (Khiếm)',
      level: 1,
      example: '我很喜欢学中文。',
      examplePinyin: 'Wǒ hěn xǐhuan xué Zhōngwén.',
      exampleMeaning: 'Tôi rất thích học tiếng Trung.',
      notes: 'Hán Việt: "hỷ hoan" (vui vẻ, thích thú).'
    }
  ],

  2: [
    {
      hanzi: '准备',
      pinyin: 'zhǔnbèi',
      hanviet: 'chuẩn bị',
      meaning: 'Chuẩn bị, sẵn sàng',
      radical: '冫 (Băng) / 夂 (Truy)',
      level: 2,
      example: '你考试准备得怎么样了？',
      examplePinyin: 'Nǐ kǎoshì zhǔnbèi de zěnmeyàng le?',
      exampleMeaning: 'Bạn chuẩn bị cho kỳ thi thế nào rồi?',
      notes: 'Có thể làm động từ hoặc danh từ (lời chuẩn bị).'
    },
    {
      hanzi: '帮助',
      pinyin: 'bāngzhù',
      hanviet: 'bang trợ',
      meaning: 'Giúp đỡ, sự trợ giúp',
      radical: '巾 (Cân) / 力 (Lực)',
      level: 2,
      example: '感谢大家对我的热情帮助。',
      examplePinyin: 'Gǎnxiè dàjiā duì wǒ de rèqíng bāngzhù.',
      exampleMeaning: 'Cảm ơn sự giúp đỡ nhiệt tình của mọi người dành cho tôi.',
      notes: 'Khác với 帮忙 (bāngmáng - ly hợp từ, không mang tân ngữ trực tiếp).'
    },
    {
      hanzi: '便宜',
      pinyin: 'piányi',
      hanviet: 'tiện nghi',
      meaning: 'Rẻ, giá hời',
      radical: '亻 (Nhân đứng) / 宀 (Miên)',
      level: 2,
      example: '太贵了，能不能便宜一点儿？',
      examplePinyin: 'Tài guì le, néng bù néng piányi yīdiǎnr?',
      exampleMeaning: 'Đắt quá, có thể rẻ hơn một chút không?',
      notes: 'Bẫy Hán-Việt: "Tiện nghi" trong tiếng Việt là đồ dùng tiện lợi, nhưng tiếng Trung là "giá rẻ".'
    },
    {
      hanzi: '已经',
      pinyin: 'yǐjīng',
      hanviet: 'dĩ kinh',
      meaning: 'Đã, đã... rồi',
      radical: '己 (Kỷ) / 纟 (Mịch)',
      level: 2,
      example: '我已经学了六个月汉语了。',
      examplePinyin: 'Wǒ yǐjīng xué le liù gè yuè Hànyǔ le.',
      exampleMeaning: 'Tôi đã học tiếng Hán được sáu tháng rồi.',
      notes: 'Thường đi kèm trợ từ 了 ở cuối câu biểu thị hành động đã hoàn tất.'
    }
  ],

  3: [
    {
      hanzi: '解决',
      pinyin: 'jiějué',
      hanviet: 'giải quyết',
      meaning: 'Giải quyết, xử lý (vấn đề)',
      radical: '角 (Giác) / 冫 (Băng)',
      level: 3,
      example: '只要我们团结，任何问题都能解决。',
      examplePinyin: 'Zhǐyào wǒmen tuánjié, rènhé wèntí dōu néng jiějué.',
      exampleMeaning: 'Chỉ cần chúng ta đoàn kết, mọi vấn đề đều có thể giải quyết.',
      notes: 'Thường đi với tân ngữ: 解决问题 (giải quyết vấn đề), 解决困难 (tháo gỡ khó khăn).'
    },
    {
      hanzi: '习惯',
      pinyin: 'xíguàn',
      hanviet: 'tập quán',
      meaning: 'Thói quen; quen với',
      radical: '羽 (Vũ) / 心 (Tâm)',
      level: 3,
      example: '我习惯了早上喝一杯黑咖啡。',
      examplePinyin: 'Wǒ xíguàn le zǎoshang hē yī bēi hēi kāfēi.',
      exampleMeaning: 'Tôi đã quen với việc uống một ly cà phê đen vào buổi sáng.',
      notes: 'Vừa là động từ (quen với), vừa là danh từ (thói quen tốt/xấu: 好习惯 / 坏习惯).'
    },
    {
      hanzi: '提高',
      pinyin: 'tígāo',
      hanviet: 'đề cao',
      meaning: 'Nâng cao, cải thiện',
      radical: '扌 (Thủ) / 高 (Cao)',
      level: 3,
      example: '每天听录音能有效提高听力水平。',
      examplePinyin: 'Měitiān tīng lùyīn néng yǒuxiào tígāo tīnglì shuǐpíng.',
      exampleMeaning: 'Mỗi ngày nghe băng ghi âm có thể nâng cao trình độ nghe hiệu quả.',
      notes: 'Thường kết hợp với 水平 (trình độ), 效率 (hiệu suất).'
    },
    {
      hanzi: '关系',
      pinyin: 'guānxi',
      hanviet: 'quan hệ',
      meaning: 'Mối quan hệ; liên quan',
      radical: '门 (Môn) / 扌 (Thủ)',
      level: 3,
      example: '这件事跟我没有任何关系。',
      examplePinyin: 'Zhè jiàn shì gēn wǒ méiyǒu rènhé guānxi.',
      exampleMeaning: 'Việc này không có bất kỳ liên quan nào tới tôi.',
      notes: 'Trong văn hóa kinh doanh Trung Quốc, "关系" còn mang ý nghĩa mạng lưới quan hệ xã hội kết nối mật thiết.'
    }
  ],

  4: [
    {
      hanzi: '关键',
      pinyin: 'guānjiàn',
      hanviet: 'quan kiện',
      meaning: 'Mấu chốt, then chốt, cốt lõi',
      radical: '门 (Môn) / 金 (Kim)',
      level: 4,
      example: '坚持是学好一门外语的关键所在。',
      examplePinyin: 'Jiānchí shì xué hǎo yī mén wàiyǔ de guānjiàn suǒzài.',
      exampleMeaning: 'Kiên trì là mấu chốt then chốt để học giỏi một ngoại ngữ.',
      notes: 'Thường dùng trong cấu trúc: 关键时刻 (thời khắc then chốt), 关键问题 (vấn đề then chốt).'
    },
    {
      hanzi: '积累',
      pinyin: 'jīlěi',
      hanviet: 'tích lũy',
      meaning: 'Tích lũy, tích cóp (kinh nghiệm, kiến thức)',
      radical: '禾 (Hòa) / 纟 (Mịch)',
      level: 4,
      example: '工作经验是靠每天点滴积累起来的。',
      examplePinyin: 'Gōngzuò jīngyàn shì kào měitiān diǎndī jīlěi qǐlai de.',
      exampleMeaning: 'Kinh nghiệm làm việc dựa vào sự tích lũy từng chút một mỗi ngày.',
      notes: 'Chữ 累 có 3 âm đọc: lěi (tích lũy), lèi (mệt mỏi), léi (trĩu quả). Ở đây đọc là lěi.'
    },
    {
      hanzi: '尽管',
      pinyin: 'jǐnguǎn',
      hanviet: 'tẫn quản',
      meaning: 'Cho dù, mặc dù; cứ việc',
      radical: '亻 (Nhân) / 竹 (Trúc)',
      level: 4,
      example: '尽管天气很冷，他还是坚持跑步。',
      examplePinyin: 'Jǐnguǎn tiānqì hěn lěng, tā háishì jiānchí pǎobù.',
      exampleMeaning: 'Mặc dù thời tiết rất lạnh, anh ấy vẫn kiên trì chạy bộ.',
      notes: 'Thường phối hợp với 但是 / 还是 / 却 để lập thành câu phức biểu thị nhượng bộ.'
    }
  ],

  5: [
    {
      hanzi: '逻辑',
      pinyin: 'luóji',
      hanviet: 'la tập (logic)',
      meaning: 'Tư duy logic, tính mạch lạc',
      radical: '纟 (Mịch) / 禾 (Hòa)',
      level: 5,
      example: '这篇文章结构严谨，逻辑非常清晰。',
      examplePinyin: 'Zhè piān wénzhāng jiégòu yánjǐn, luóji fēicháng qīngxī.',
      exampleMeaning: 'Bài viết này kết cấu chặt chẽ, tư duy logic rất rõ ràng.',
      notes: 'Từ ngoại lai (phiên âm từ tiếng Anh "logic"). Rất hay gặp trong đề đọc hiểu HSK 5.'
    },
    {
      hanzi: '坦率',
      pinyin: 'tǎnshuài',
      hanviet: 'thản suất',
      meaning: 'Thẳng thắn, bộc trực',
      radical: '土 (Thổ) / 玄 (Huyền)',
      level: 5,
      example: '坦率地说，我们目前的预算还不充足。',
      examplePinyin: 'Tǎnshuài de shuō, wǒmen mùqián de yùsuàn hái bù chōngzú.',
      exampleMeaning: 'Thẳng thắn mà nói, ngân sách hiện tại của chúng ta vẫn chưa đầy đủ.',
      notes: 'Thường đứng đầu câu: 坦率地说... (Thẳng thắn mà nói...).'
    },
    {
      hanzi: '矛盾',
      pinyin: 'máodùn',
      hanviet: 'mâu thuẫn',
      meaning: 'Mâu thuẫn, xung đột',
      radical: '矛 (Mâu) / 目 (Mục)',
      level: 5,
      example: '他的言行前后矛盾，令人产生怀疑。',
      examplePinyin: 'Tā de yánxíng qiánhòu máodùn, lìng rén chǎnshēng huáiyí.',
      exampleMeaning: 'Lời nói và hành động của anh ta tiền hậu mâu thuẫn, khiến người khác sinh nghi.',
      notes: 'Bắt nguồn từ điển tích "ngọn giáo và chiếc khiên" trong văn học cổ đại Trung Quốc.'
    }
  ],

  6: [
    {
      hanzi: '潜移默化',
      pinyin: 'qián yí mò huà',
      hanviet: 'tiềm di mặc hóa',
      meaning: 'Ảnh hưởng dần dà, thấm nhuần sâu sắc một cách vô thức',
      radical: 'Thành ngữ (成语)',
      level: 6,
      example: '父母的言传身教对孩子的性格起着潜移默化的作用。',
      examplePinyin: 'Fùmǔ de yánchuán shēnjiào duì háizi de xìnggé qǐzhe qiányímòhuà de zuòyòng.',
      exampleMeaning: 'Lời dạy và tấm gương của cha mẹ tác động thẩm thấu tự nhiên đến tính cách của con cái.',
      notes: 'Thành ngữ HSK 6 kinh điển mô tả sự tác động vô hình nhưng sâu rộng qua năm tháng.'
    },
    {
      hanzi: '未雨绸缪',
      pinyin: 'wèi yǔ chóu móu',
      hanviet: 'vị vũ trù mâu',
      meaning: 'Lo trước chu tất, phòng bệnh hơn chữa bệnh',
      radical: 'Thành ngữ (成语)',
      level: 6,
      example: '企业在顺境中更应未雨绸缪，制定危机应对方案。',
      examplePinyin: 'Qǐyè zài shùnjìng zhōng gèng yīng wèiyǔchóumóu, zhìdìng wēijī yìngduì fāng\'àn.',
      exampleMeaning: 'Doanh nghiệp khi thuận lợi càng phải lo liệu từ sớm, lập kế hoạch ứng phó khủng hoảng.',
      notes: 'Nghĩa gốc: Đan rào sửa tổ chim trước khi trời đổ mưa giông.'
    },
    {
      hanzi: '络绎不绝',
      pinyin: 'luò yì bù jué',
      hanviet: 'lạc dịch bất tuyệt',
      meaning: 'Nườm nượp không ngớt, liên miên không dứt (người, xe cộ)',
      radical: 'Thành ngữ (成语)',
      level: 6,
      example: '春节期间，前来寺庙祈福的香客络绎不绝。',
      examplePinyin: 'Chūnjié qījiān, qiánlái sìmiào qífú de xiāngkè luòyìbùjué.',
      exampleMeaning: 'Trong dịp Tết Nguyên Đán, khách hành hương đến chùa cầu phúc nườm nượp không ngớt.',
      notes: 'Mô tả dòng người hoặc phương tiện qua lại tấp nập kéo dài không gián đoạn.'
    }
  ],

  7: [
    {
      hanzi: '韬光养晦',
      pinyin: 'tāo guāng yǎng huì',
      hanviet: 'thao quang dưỡng hối',
      meaning: 'Giấu mình chờ thời, ẩn nhẫn bồi đắp thực lực',
      radical: 'Học thuật HSK 7',
      level: 7,
      example: '国家在崛起初期采取了韬光养晦的外交战略。',
      examplePinyin: 'Guójiā zài juéqǐ chūqī cǎiqǔ le tāoguāngyǎnghuì de wàijiāo zhànlüè.',
      exampleMeaning: 'Quốc gia trong giai đoạn đầu trỗi dậy đã áp dụng chiến lược ngoại giao giấu mình chờ thời.',
      notes: 'Thường dùng trong văn kiện chính sách đối ngoại và phân tích địa chính trị quan trọng.'
    },
    {
      hanzi: '宏观调控',
      pinyin: 'hóngguān tiáokòng',
      hanviet: 'hoành quan điều khống',
      meaning: 'Điều tiết vĩ mô (chính sách kinh tế nhà nước)',
      radical: 'Kinh tế học',
      level: 7,
      example: '央行通过调整利率实施精准的宏观调控。',
      examplePinyin: 'Yāngháng tōngguò tiáozhěng lìlǜ shíshī jīngzhǔn de hóngguān tiáokòng.',
      exampleMeaning: 'Ngân hàng Trung ương thông qua điều chỉnh lãi suất thực thi điều tiết vĩ mô chuẩn xác.',
      notes: 'Thuật ngữ xuất hiện dày đặc trong báo cáo thường niên và chuyên đề kinh tế HSK 7-9.'
    },
    {
      hanzi: '颠覆性创新',
      pinyin: 'diānfùxìng chuàngxīn',
      hanviet: 'điên phúc tính sáng tân',
      meaning: 'Đổi mới đột phá mang tính đảo lộn trật tự cũ (Disruptive innovation)',
      radical: 'Công nghệ & Kinh tế',
      level: 7,
      example: '人工智能大模型的演进被视为具有颠覆性创新的科技革命。',
      examplePinyin: 'Réngōng zhìnéng dà móxíng de yǎnjìn bèi shìwéi jùyǒu diānfùxìng chuàngxīn de kējì gémìng.',
      exampleMeaning: 'Sự tiến hóa của các mô hình AI lớn được xem là cuộc cách mạng công nghệ mang tính đổi mới đảo lộn.',
      notes: 'Từ vựng cốt lõi trong các bài thi đọc hiểu công nghệ cao HSK 3.0.'
    }
  ],

  8: [
    {
      hanzi: '融会贯通',
      pinyin: 'róng huì guàn tōng',
      hanviet: 'dung hội quán thông',
      meaning: 'Thấu suốt am tường, đúc kết kết hợp nhuần nhuyễn mọi phương diện',
      radical: 'Học thuật HSK 8',
      level: 8,
      example: '学者唯有融会贯通东西方哲学，方能提出具有普世价值的新见解。',
      examplePinyin: 'Xuézhě wéiyǒu rónghuìguàntōng dōng-xīfāng zhéxué, fāng néng tíchū jùyǒu pǔshì jiàzhí de xīn jiànjiě.',
      exampleMeaning: 'Học giả chỉ khi am tường nhuần nhuyễn triết học Đông - Tây mới có thể đưa ra kiến giải mới mang giá trị phổ quát.',
      notes: 'Đòi hỏi sự am hiểu sâu sắc ở bậc nghiên cứu học thuật liên ngành.'
    },
    {
      hanzi: '博弈',
      pinyin: 'bóyì',
      hanviet: 'bác dịch',
      meaning: 'Trò chơi đấu trí, ván cờ giằng co chiến lược (Game theory)',
      radical: 'Chính trị & Ngoại giao',
      level: 8,
      example: '大国博弈的本质在于规则制定权与产业链制高点的争夺。',
      examplePinyin: 'Dàguó bóyì de běnzhì zàiyú guīzé zhìdìngquán yǔ chǎnyèliàn zhìgāodiǎn de zhēngduó.',
      exampleMeaning: 'Bản chất của ván cờ chiến lược giữa các nước lớn nằm ở cuộc tranh giành quyền thiết lập luật chơi và cứ điểm chuỗi cung ứng.',
      notes: 'Nghĩa gốc là chơi cờ vây; nghĩa mở rộng là cuộc đấu trí chính trị - thương mại vĩ mô.'
    },
    {
      hanzi: '诠释',
      pinyin: 'quánshì',
      hanviet: 'thuyên thích',
      meaning: 'Cắt nghĩa sâu sắc, giải thích thông diễn học',
      radical: 'Triết học & Ngôn ngữ',
      level: 8,
      example: '这部史学巨著以现代唯物史观对古典礼法作出了全新诠释。',
      examplePinyin: 'Zhè bù shǐxué jùzhù yǐ xiàndài wéiwù shǐguān duì gǔdiǎn lǐfǎ zuòchū le quánxīn quánshì.',
      exampleMeaning: 'Bộ cự tác sử học này dựa trên quan điểm duy vật lịch sử hiện đại đã đưa ra diễn giải hoàn toàn mới về lễ pháp cổ điển.',
      notes: 'Được dùng thay cho 解释 (giải thích đơn giản) trong các văn cảnh học thuật trang trọng.'
    }
  ],

  9: [
    {
      hanzi: '举足轻重',
      pinyin: 'jǔ zú qīng zhòng',
      hanviet: 'cử túc khinh trọng',
      meaning: 'Có vị thế then chốt sinh tử, nhất cử nhất động đều làm nghiêng lệch cục diện',
      radical: 'Đỉnh cao HSK 9',
      level: 9,
      example: '半导体供应链的核心节点在当今地缘政治格局中占据着举足轻重的地位。',
      examplePinyin: 'Bàndǎotǐ gōngyìngliàn de héxīn jiédiǎn zài dāngjīn dìyuán zhèngzhì géjú zhōng zhànjù zhe jǔzúqīngzhòng de dìwèi.',
      exampleMeaning: 'Các mắt xích cốt lõi trong chuỗi cung ứng bán dẫn đang nắm giữ vị thế mang tính quyết định then chốt trong cục diện địa chính trị đương đại.',
      notes: 'Thành ngữ văn phong ngoại giao cấp nhà nước.'
    },
    {
      hanzi: '赋能',
      pinyin: 'fùnéng',
      hanviet: 'phú năng',
      meaning: 'Tiếp sức trao quyền, nâng tầm năng lực phát triển (Empower)',
      radical: 'Chính sách & Công nghệ',
      level: 9,
      example: '数字经济应深度赋能实体产业，推动传统制造业智能化转型升级。',
      examplePinyin: 'Shùzì jīngjì yīng shēndù fùnéng shítǐ chǎnyè, tuīdòng chuántǒng zhìzàoyè zhìnénghuà zhuǎnxíng shēngjí.',
      exampleMeaning: 'Kinh tế số cần tiếp sức sâu rộng cho ngành công nghiệp thực thể, thúc đẩy chuyển đổi thông minh và nâng cấp ngành chế tạo truyền thống.',
      notes: 'Từ thời thượng xuất hiện trong mọi văn kiện chiến lược quốc gia và hội nghị thượng đỉnh kinh tế.'
    },
    {
      hanzi: '契机',
      pinyin: 'qìjī',
      hanviet: 'khế cơ',
      meaning: 'Thời cơ bước ngoặt, thời điểm then chốt để tạo ra biến chuyển',
      radical: 'Chính trị & Đổi mới',
      level: 9,
      example: '两国建交五十周年为深化双边全面战略伙伴关系提供了重要契机。',
      examplePinyin: 'Liǎng guó jiànjiāo wǔshí zhōunián wèi shēnhuà shuāngbiān quánmiàn zhànlüè huǒbàn guānxi tígōng le zhòngyào qìjī.',
      exampleMeaning: 'Lễ kỷ niệm 50 năm thiết lập quan hệ ngoại giao hai nước đã tạo nên thời cơ bước ngoặt quan trọng để làm sâu sắc thêm quan hệ đối tác chiến lược toàn diện.',
      notes: 'Được sử dụng trong các bài tuyên bố thông cáo báo chí chung và diễn văn ngoại giao song phương.'
    }
  ]
};

export const HSK_GRAMMAR = {
  1: [
    {
      title: 'Cấu trúc câu chữ "是" (Câu phán đoán)',
      formula: 'Chủ ngữ + 是 + Tân ngữ',
      explanation: 'Dùng để khẳng định một người hay vật là cái gì đó. Phủ định dùng "不是".',
      exampleZh: '我是越南人，他是中国老师。',
      exampleVi: 'Tôi là người Việt Nam, anh ấy là thầy giáo Trung Quốc.',
      trapNote: 'Không dùng "是" trước tính từ! Tránh nói: "我是一个很好" (Sai) -> "我很好" (Đúng).'
    },
    {
      title: 'Câu hỏi dùng trợ từ nghi vấn "吗"',
      formula: 'Câu trần thuật + 吗？',
      explanation: 'Đặt ở cuối câu khẳng định để biến thành câu hỏi Đúng/Sai (Yes/No Question).',
      exampleZh: '你喜欢喝中国茶吗？',
      exampleVi: 'Bạn có thích uống trà Trung Quốc không?',
      trapNote: 'Nếu trong câu đã có đại từ nghi vấn (什么, 谁, 哪儿, 多少) thì TUYỆT ĐỐI không thêm 吗 ở cuối.'
    }
  ],
  2: [
    {
      title: 'Trợ từ động thái "了" biểu thị sự thay đổi hoặc hoàn thành',
      formula: 'Động từ + 了 (+ Tân ngữ)',
      explanation: 'Biểu thị hành động đã hoàn tất hoặc trạng thái mới xuất hiện.',
      exampleZh: '我已经买了两本汉语书了。',
      exampleVi: 'Tôi đã mua hai quyển sách tiếng Trung rồi.',
      trapNote: 'Phủ định của hành động đã hoàn tất dùng "没有 + Động từ" (bỏ "了"), không dùng "不 + Động từ + 了".'
    },
    {
      title: 'Câu so sánh chữ "比"',
      formula: 'A + 比 + B + Tính từ (+ Số lượng/Một chút)',
      explanation: 'Biểu thị mức độ của A cao hơn B về một phương diện nào đó.',
      exampleZh: '今天比昨天冷一点儿。',
      exampleVi: 'Hôm nay lạnh hơn hôm qua một chút.',
      trapNote: 'Không được thêm 很, 非常, 特别 trước tính từ trong câu chữ 比 (Ví dụ sai: A比B很好).'
    }
  ],
  3: [
    {
      title: 'Câu chữ "把" (Câu xử lý tân ngữ)',
      formula: 'Chủ ngữ + 把 + Tân ngữ + Động từ + Thành phần khác',
      explanation: 'Dùng khi muốn nhấn mạnh sự xử lý, tác động làm thay đổi vị trí, trạng thái của sự vật.',
      exampleZh: '请你把作业交给老师。',
      exampleVi: 'Xin bạn hãy nộp bài tập cho thầy giáo.',
      trapNote: 'Động từ trong câu chữ 把 không được đứng trơ trọi một mình, bắt buộc phải có kết quả/bổ ngữ/lặp lại.'
    },
    {
      title: 'Bổ ngữ kết quả (Động từ + 完 / 到 / 见 / 懂 / 错)',
      formula: 'Động từ + Bổ ngữ kết quả',
      explanation: 'Chỉ rõ kết quả mà hành động mang lại sau khi diễn ra.',
      exampleZh: '这篇课文你听懂了吗？',
      exampleVi: 'Bài khóa này bạn đã nghe hiểu chưa?',
      trapNote: 'Phủ định luôn đặt "没(有)" trước động từ: "我没听懂", không nói "我不听懂".'
    }
  ],
  4: [
    {
      title: 'Câu chữ "被" (Câu bị động)',
      formula: 'Tân ngữ (chịu tác động) + 被 (+ Tác nhân) + Động từ + Thành phần khác',
      explanation: 'Biểu thị thể bị động, thường mang sắc thái tiêu cực hoặc không mong muốn trong ngữ cảnh cổ, nhưng hiện đại dùng rộng rãi.',
      exampleZh: '我的手机在地铁上被小偷偷走了。',
      exampleVi: 'Điện thoại của tôi đã bị kẻ trộm lấy mất trên tàu điện ngầm.',
      trapNote: 'Nếu không muốn nêu tác nhân thì có thể trực tiếp nói: 手机被偷走了.'
    },
    {
      title: 'Cấu trúc liên từ "连...都/也..." (Thậm chí... cũng...)',
      formula: '连 + Thành phần nhấn mạnh + 都/也 + Vị ngữ',
      explanation: 'Dùng để nhấn mạnh một trường hợp cực đoan để suy ra các trường hợp bình thường khác.',
      exampleZh: '这个字太生僻了，连老师都不认识。',
      exampleVi: 'Chữ này quá hiếm gặp, đến cả giáo viên cũng không nhận ra.',
      trapNote: 'Thành phần nhấn mạnh được chuyển lên ngay sau chữ 连.'
    }
  ],
  5: [
    {
      title: 'Phân biệt "从而" và "进而" trong văn bản nghị luận',
      formula: 'Mệnh đề 1 + ，从而 / 进而 + Mệnh đề 2',
      explanation: '"从而" biểu thị kết quả tất yếu hoặc phương thức dẫn đến mục đích; "进而" biểu thị bước tiến sâu hơn một tầng nữa.',
      exampleZh: '优化产业链配置，从而大幅降低企业运营成本。',
      exampleVi: 'Tối ưu hóa bố trí chuỗi cung ứng, nhờ đó giảm mạnh chi phí vận hành của doanh nghiệp.',
      trapNote: 'HSK 5 rất hay bẫy thí sinh ở các câu điền liên từ biểu thị quan hệ tiếp diễn và nhân quả.'
    }
  ],
  6: [
    {
      title: 'Cấu trúc cổ văn thường dùng trong đề HSK 6: "鉴于...", "无异于..."',
      formula: '鉴于 + Tình hình thực tế, ... / A + 无异于 + B',
      explanation: '"鉴于" mang nghĩa "xét thấy, bởi vì"; "无异于" mang nghĩa "không khác gì, chẳng khác nào".',
      exampleZh: '鉴于当前市场风险激增，此类投机行为无异于饮鸩止渴。',
      exampleVi: 'Xét thấy rủi ro thị trường hiện tại tăng vọt, hành vi đầu cơ này chẳng khác nào uống rượu độc giải khát.',
      trapNote: 'Thường kết hợp với các thành ngữ bốn chữ để tạo văn phong trang trọng (书面语).'
    }
  ],
  7: [
    {
      title: 'Ngữ pháp văn phong tài chính & học thuật: "致力于...", "旨在..."',
      formula: 'Chủ ngữ + 致力于 + Lĩnh vực / Mục tiêu / 旨在 + Hành động',
      explanation: 'Biểu thị sự cống hiến toàn tâm toàn ý cho một mục tiêu chiến lược lâu dài hoặc làm rõ tôn chỉ.',
      exampleZh: '该科研团队长期致力于突破第三代半导体材料的制造瓶颈。',
      exampleVi: 'Đội ngũ nghiên cứu khoa học đó lâu nay luôn dốc sức vào việc tạo bước đột phá cho nút thắt cổ chai sản xuất vật liệu bán dẫn thế hệ thứ ba.',
      trapNote: 'Không đi kèm với các danh từ cụ thể tầm thường; phải đi kèm các mục tiêu trừu tượng, tầm vĩ mô.'
    }
  ],
  8: [
    {
      title: 'Cấu trúc đảo ngữ nhấn mạnh và biền ngẫu trong dịch luận HSK 8',
      formula: '非...不足以... (Không... thì không đủ để...)',
      explanation: 'Cấu trúc song phủ định có tính chất khẳng định tuyệt đối cực mạnh, dùng trong xã luận và nghị luận cấp cao.',
      exampleZh: '非深化体制机制改革，不足以彻底激发全社会的科技创新活力。',
      exampleVi: 'Nếu không đi sâu cải cách cơ chế thể chế, thì không đủ để khơi dậy triệt để sức sống đổi mới sáng tạo công nghệ của toàn xã hội.',
      trapNote: 'Yêu cầu khả năng chuyển ngữ sang tiếng Việt linh hoạt, tránh dịch thô máy móc.'
    }
  ],
  9: [
    {
      title: 'Cấu trúc ngoại giao & Cổ ngữ tích hợp HSK 9: "有鉴于此...", "毋庸置疑"',
      formula: 'Đầu đoạn văn + 有鉴于此 / 毋庸置疑 + Mệnh đề luận điểm',
      explanation: '"有鉴于此" tương đương "Xuất phát từ thực tế đó / Do vậy"; "毋庸置疑" mang nghĩa "Không còn nghi ngờ gì nữa, một sự thật hiển nhiên".',
      exampleZh: '毋庸置疑，多边主义仍是解决当今全球性挑战的最有效路径；有鉴于此，各方亟需强化信任。',
      exampleVi: 'Không còn nghi ngờ gì nữa, chủ nghĩa đa phương vẫn là con đường hữu hiệu nhất để giải quyết các thách thức mang tính toàn cầu ngày nay; xuất phát từ nhận thức đó, các bên cấp thiết phải tăng cường lòng tin.',
      trapNote: 'Đây là các mẫu câu chuẩn chỉ trong các bài diễn văn tại các diễn đàn LHQ, APEC, Davos.'
    }
  ]
};
