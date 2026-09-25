/**
 * HánNgữ Pro - Sentence Evolution & Lifecycle Engine (Vòng Đời Câu HSK)
 * Trực quan hóa tiến trình mở rộng câu từ Sơ cấp HSK 1 đến Cao cấp Học thuật HSK 7-9
 */

export const SENTENCE_CHAINS = [
  {
    id: 'chain_1',
    theme: 'Học tập & Hội nhập Văn hóa (学中文)',
    rootKeyword: '学中文 (Xué Zhōngwén)',
    steps: [
      {
        level: 'HSK 1',
        sentenceZh: '我学中文。',
        pinyin: 'Wǒ xué Zhōngwén.',
        translation: 'Tôi học tiếng Trung.',
        structure: 'Chủ ngữ + Động từ + Tân ngữ',
        note: 'Câu đơn giản cơ bản nhất gồm 3 thành phần chính.'
      },
      {
        level: 'HSK 2',
        sentenceZh: '我在大学学中文。',
        pinyin: 'Wǒ zài dàxué xué Zhōngwén.',
        translation: 'Tôi học tiếng Trung ở trường đại học.',
        structure: 'Chủ ngữ + 在 (Trạng ngữ địa điểm) + Động từ + Tân ngữ',
        note: 'Thêm trạng từ chỉ nơi chốn đứng trước động từ.'
      },
      {
        level: 'HSK 3',
        sentenceZh: '我已经学了一年中文，能说一点儿日常对话。',
        pinyin: 'Wǒ yǐjīng xué le yī nián Zhōngwén, néng shuō yīdiǎnr rìcháng duìhuà.',
        translation: 'Tôi đã học tiếng Trung được một năm rồi, có thể nói một chút hội thoại hàng ngày.',
        structure: 'Bổ ngữ thời lượng + Năng nguyện động từ (能)',
        note: 'Biểu thị sự tích lũy thời gian và năng lực sử dụng thực tế.'
      },
      {
        level: 'HSK 4',
        sentenceZh: '尽管学中文很有挑战性，但我每天都坚持听录音和背生词。',
        pinyin: 'Jǐnguǎn xué Zhōngwén hěn yǒu tiǎozhànxìng, dàn wǒ měitiān dōu jiānchí tīng lùyīn hé bèi shēngcí.',
        translation: 'Mặc dù học tiếng Trung có nhiều thách thức, nhưng tôi mỗi ngày đều kiên trì nghe ghi âm và học từ mới.',
        structure: 'Câu phức biểu thị nhượng bộ: 尽管... 但/还是...',
        note: 'Sử dụng liên từ nối 2 mệnh đề có tính tương phản logic.'
      },
      {
        level: 'HSK 5-6',
        sentenceZh: '熟练掌握中文不仅拓宽了我的跨文化视野，更为今后的职业发展奠定了坚实的基石。',
        pinyin: 'Shúliàn zhǎngwò Zhōngwén bùjǐn tuòkuān le wǒ de kuà wénhuà shìyě, gèng wèi jīnhòu de zhíyè fāzhǎn diàndìng le jiānshí de jīshí.',
        translation: 'Thành thạo tiếng Trung không chỉ mở rộng tầm nhìn xuyên văn hóa, mà còn đặt nền móng vững chắc cho sự phát triển nghề nghiệp sau này.',
        structure: 'Cặp liên từ tăng tiến: 不仅... 更为... 奠定基石',
        note: 'Văn phong nghị luận chuyên nghiệp với từ ngữ trừu tượng.'
      },
      {
        level: 'HSK 7-9',
        sentenceZh: '通晓汉学义理与现代规范，不仅彰显了文明互鉴之深邃内涵，更是构建高水平区域协同格局的重要战略纽带。',
        pinyin: 'Tōngxiǎo hànxué yìlǐ yǔ xiàndài guīfàn, bùjǐn zhāngxiǎn le wénmíng hùjiàn zhī shēnsuì nèihán, gèng shì gòujiàn gāoshuǐpíng qūyù xiétóng géjú de zhòngyào zhànlüè niǔdài.',
        translation: 'Am tường đạo lý Hán học và quy chuẩn hiện đại không chỉ làm nổi bật nội hàm sâu sắc của sự tương tác giao lưu văn minh, mà còn là sợi dây chiến lược trọng yếu để kiến tạo cục diện hiệp đồng khu vực trình độ cao.',
        structure: 'Cấu trúc chính luận - ngoại giao học thuật tích hợp từ vựng triết học & thể chế',
        note: 'Cấp độ dịch thuật cabin và học giả phân tích chính sách.'
      }
    ]
  },
  {
    id: 'chain_2',
    theme: 'Văn hóa Ẩm thực & Triết lý Trà đạo (喝茶)',
    rootKeyword: '喝茶 (Hē chá)',
    steps: [
      {
        level: 'HSK 1',
        sentenceZh: '我想喝茶。',
        pinyin: 'Wǒ xiǎng hē chá.',
        translation: 'Tôi muốn uống trà.',
        structure: 'Chủ ngữ + Năng nguyện (想) + Động từ + Tân ngữ',
        note: 'Diễn tả nguyện vọng trực tiếp.'
      },
      {
        level: 'HSK 2',
        sentenceZh: '他喜欢一边喝热茶，一边看书。',
        pinyin: 'Tā xǐhuan yībiān hē rè chá, yībiān kàn shū.',
        translation: 'Anh ấy thích vừa uống trà nóng vừa đọc sách.',
        structure: 'Cấu trúc song hành: 一边... 一边...',
        note: 'Diễn tả hai hành động diễn ra cùng lúc.'
      },
      {
        level: 'HSK 4',
        sentenceZh: '品茶不仅能解渴提神，更能让人在快节奏的都市生活中寻得内心的宁静。',
        pinyin: 'Pǐnchá bùjǐn néng jiěkě tíshén, gèng néng ràng rén zài kuài jiézòu de dūshì shēnghuó zhōng xúndé nèixīn de níngjìng.',
        translation: 'Thưởng trà không chỉ giúp giải khát tỉnh táo, mà còn giúp con người tìm lại sự thanh tịnh trong tâm hồn giữa nhịp sống đô thị hối hả.',
        structure: 'Động từ chuyển thể 品茶 (thưởng trà) + Cấu trúc làm chủ ngữ',
        note: 'Nâng cấp từ "hē" thành "pǐn" (thưởng thức).'
      },
      {
        level: 'HSK 7-9',
        sentenceZh: '茶马古道所承载的商贸流转与文化交融，生动印证了东方文明“和而不同、求同存异”的精神内核。',
        pinyin: 'Chámǎ Gǔdào suǒ chéngzài de shāngmào liúzhuǎn yǔ wénhuà jiāoróng, shēngdòng yìngzhèng le dōngfāng wénmíng “hé ér bù tóng, qiú tóng cún yì” de jīngshén nèihé.',
        translation: 'Dòng chảy thương mại và sự giao thoa văn hóa được chuyên chở trên con đường Trà Mã Cổ Đạo đã chứng minh sống động cho hạt nhân tinh thần "hòa hợp nhưng không đồng hóa, tìm kiếm điểm chung bảo tồn dị biệt" của văn minh phương Đông.',
        structure: 'Mệnh đề danh ngữ phức hợp "所承载的..." + Trích dẫn triết học cổ Luận Ngữ',
        note: 'Đỉnh cao của văn học sử và tư tưởng triết học HSK 8-9.'
      }
    ]
  }
];
