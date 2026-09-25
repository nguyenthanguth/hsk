/**
 * HánNgữ Pro - Game & Challenge Data
 * Daily Challenge, Word Puzzle, Speed Reading, Vocab Quiz Bank
 */

export const DAILY_CHALLENGES = [
  {
    id: 'dc_001', type: 'tone_match', title: '🎵 Thách Thức Thanh Điệu',
    description: 'Chọn thanh điệu đúng cho mỗi từ hiển thị',
    hskLevel: 1,
    pairs: [
      { hanzi: '买', tone: 3, meaning: 'Mua', pinyin: 'mǎi' },
      { hanzi: '卖', tone: 4, meaning: 'Bán', pinyin: 'mài' },
      { hanzi: '马', tone: 3, meaning: 'Ngựa', pinyin: 'mǎ' },
      { hanzi: '骂', tone: 4, meaning: 'Mắng', pinyin: 'mà' },
      { hanzi: '妈', tone: 1, meaning: 'Mẹ', pinyin: 'māo' },
      { hanzi: '麻', tone: 2, meaning: 'Cây gai / Tê liệt', pinyin: 'má' }
    ],
    timeLimit: 90, reward: 60
  },
  {
    id: 'dc_002', type: 'meaning_match', title: '🧩 Ghép Nghĩa Nhanh',
    description: 'Ghép chữ Hán với nghĩa tiếng Việt trước khi hết giờ',
    hskLevel: 1,
    pairs: [
      { hanzi: '学习', meaning: 'Học tập' },
      { hanzi: '工作', meaning: 'Công việc' },
      { hanzi: '朋友', meaning: 'Bạn bè' },
      { hanzi: '时间', meaning: 'Thời gian' },
      { hanzi: '高兴', meaning: 'Vui vẻ' },
      { hanzi: '问题', meaning: 'Vấn đề' }
    ],
    timeLimit: 45, reward: 40
  },
  {
    id: 'dc_003', type: 'arrange', title: '🔀 Xếp Câu Đúng Thứ Tự',
    description: 'Bấm các từ theo thứ tự để tạo câu hoàn chỉnh',
    hskLevel: 2,
    questions: [
      { words: ['我', '是', '学生', '。'], answer: '我是学生。', meaning: 'Tôi là học sinh.' },
      { words: ['喝', '我', '茶', '要', '一杯'], answer: '我要喝一杯茶。', meaning: 'Tôi muốn uống một tách trà.' },
      { words: ['今天', '比', '昨天', '冷', '一点儿', '。'], answer: '今天比昨天冷一点儿。', meaning: 'Hôm nay lạnh hơn hôm qua một chút.' }
    ],
    timeLimit: 60, reward: 50
  }
];

export const WORD_PUZZLES = [
  {
    id: 'puzzle_001', level: 'HSK 1', title: '📝 Điền Bính Âm',
    type: 'pinyin_fill',
    questions: [
      { hanzi: '你好', correctPinyin: 'nǐ hǎo', options: ['nǐ hǎo', 'nì hào', 'nǐ hào', 'nì hǎo'], meaning: 'Xin chào' },
      { hanzi: '谢谢', correctPinyin: 'xièxie', options: ['xièxie', 'xiēxiē', 'xiéxié', 'xiěxiě'], meaning: 'Cảm ơn' },
      { hanzi: '对不起', correctPinyin: 'duìbuqǐ', options: ['duìbuqǐ', 'duìbùqī', 'duíbuqì', 'duìbùqǐ'], meaning: 'Xin lỗi' },
      { hanzi: '老师', correctPinyin: 'lǎoshī', options: ['lǎoshí', 'lǎoshī', 'làoshī', 'lǎoshì'], meaning: 'Giáo viên' }
    ]
  },
  {
    id: 'puzzle_002', level: 'HSK 2', title: '🧠 Đoán Nghĩa Từ Bộ Thủ',
    type: 'radical_guess',
    questions: [
      {
        radical: '氵 (Ba chấm thủy)',
        chars: ['河', '海', '游', '泡'],
        commonMeaning: 'Liên quan đến nước',
        question: 'Chữ nào KHÔNG chứa bộ thủ Thủy (氵)?',
        chars_full: [
          { char: '河', hasRadical: true, meaning: 'Sông' },
          { char: '海', hasRadical: true, meaning: 'Biển' },
          { char: '游', hasRadical: true, meaning: 'Bơi lội' },
          { char: '朋', hasRadical: false, meaning: 'Bạn bè (bộ 月)' }
        ],
        answer: 3
      },
      {
        radical: '讠 (Ngôn - Lời nói)',
        chars: ['说', '话', '读', '语'],
        commonMeaning: 'Liên quan đến ngôn ngữ / lời nói',
        question: 'Các chữ sau đều chứa bộ Ngôn (讠). Đâu là nghĩa đúng của 语?',
        chars_full: [
          { char: '语', meaning: 'Ngôn ngữ, lời nói' }
        ],
        options: ['Viết văn', 'Ngôn ngữ, lời nói', 'Đọc sách', 'Kể chuyện'],
        answer: 1
      }
    ]
  },
  {
    id: 'puzzle_003', level: 'HSK 3', title: '📌 Điền Từ Ngữ Pháp',
    type: 'fill',
    questions: [
      {
        sentence: '这道菜_____不好吃，我很喜欢。',
        options: ['虽然', '但是', '所以', '因为'],
        answer: 0,
        explanation: 'Cấu trúc 虽然...但是... — đây là vế trước "tuy nhiên"'
      },
      {
        sentence: '他学习很努力，_____每次考试都得第一名。',
        options: ['所以', '虽然', '但是', '如果'],
        answer: 0,
        explanation: '所以 = vì vậy — biểu thị quan hệ nhân quả'
      },
      {
        sentence: '你_____早点睡觉，对身体好。',
        options: ['应该', '要是', '虽然', '因为'],
        answer: 0,
        explanation: '应该 = nên, phải — biểu thị lời khuyên hợp lý'
      },
      {
        sentence: '我们_____努力学习，_____将来能找到好工作。',
        options: ['只有...才...', '虽然...但是...', '因为...所以...', '如果...就...'],
        answer: 0,
        explanation: '只有...才... = chỉ có... mới... — điều kiện duy nhất'
      }
    ]
  }
];

export const SPEED_PASSAGES = [
  {
    id: 'sp_001', level: 'HSK 2', title: '🌅 Một Ngày Thường Nhật',
    timeLimit: 120,
    wordCount: 78,
    text: '我每天早上六点半起床，然后洗脸、吃早饭。早饭以后，我坐地铁去上班。我在一家公司工作，工作很忙，但是我很喜欢我的工作。下班以后，我一般去超市买菜，然后回家做饭。晚上我喜欢看书或者看电视。我觉得我的生活很丰富。',
    questions: [
      { q: '他几点起床？', options: ['A. 六点', 'B. 六点半', 'C. 七点', 'D. 七点半'], answer: 1 },
      { q: '他用什么方式上班？', options: ['A. 开车', 'B. 骑车', 'C. 坐地铁', 'D. 走路'], answer: 2 },
      { q: '他下班以后去哪里？', options: ['A. 超市', 'B. 学校', 'C. 公园', 'D. 餐厅'], answer: 0 }
    ],
    translation: 'Mỗi sáng tôi dậy lúc 6 rưỡi, rửa mặt, ăn sáng. Sau đó đi tàu điện ngầm đến chỗ làm. Công việc bận rộn nhưng tôi rất yêu thích. Tan làm tôi ghé siêu thị mua rau về nấu. Tối tôi thích đọc sách hoặc xem tivi. Cuộc sống của tôi rất phong phú.'
  },
  {
    id: 'sp_002', level: 'HSK 3', title: '✉️ Bức Thư Từ Bắc Kinh',
    timeLimit: 150,
    wordCount: 112,
    text: '你好！我是刘明，来自北京。现在我在越南河内学习越南语，已经学了半年了。越南语很难，但是很有趣。我在这里认识了很多朋友，他们都对我很友好。河内的食物也非常好吃，我最喜欢吃越南米粉。我打算在这里再住一年，然后回北京工作。如果你有机会来北京，我一定请你吃烤鸭！',
    questions: [
      { q: '刘明来自哪里？', options: ['A. 上海', 'B. 广州', 'C. 北京', 'D. 深圳'], answer: 2 },
      { q: '他学越南语学了多长时间？', options: ['A. 三个月', 'B. 半年', 'C. 一年', 'D. 两年'], answer: 1 },
      { q: '他最喜欢吃什么？', options: ['A. 烤鸭', 'B. 包子', 'C. 饺子', 'D. 越南米粉'], answer: 3 }
    ],
    translation: 'Xin chào! Mình là Lưu Minh từ Bắc Kinh. Mình đang học tiếng Việt ở Hà Nội được nửa năm. Tiếng Việt khó nhưng thú vị. Mình quen nhiều bạn bè tốt bụng. Đồ ăn Hà Nội ngon lắm, mình mê nhất phở. Mình dự định ở thêm một năm rồi về Bắc Kinh làm việc. Nếu bạn có dịp đến Bắc Kinh, mình mời bạn ăn vịt quay nhé!'
  },
  {
    id: 'sp_003', level: 'HSK 4', title: '🤖 Công Nghệ & Tương Lai',
    timeLimit: 180,
    wordCount: 140,
    text: '随着人工智能技术的快速发展，越来越多的行业开始受到影响。在医疗领域，人工智能可以帮助医生更快速、更准确地诊断疾病。在教育领域，智能学习系统能够根据每个学生的特点制定个性化的学习方案。然而，这些技术的发展也带来了一些挑战。有人担心人工智能会取代部分传统工作岗位，导致失业问题。专家们认为，人类应该积极学习新技术，提高自身能力，才能在未来的社会中保持竞争力。',
    questions: [
      { q: '在医疗领域，人工智能能做什么？', options: ['A. 做手术', 'B. 帮助诊断疾病', 'C. 照顾病人', 'D. 研发新药'], answer: 1 },
      { q: '有人担心人工智能会带来什么问题？', options: ['A. 技术落后', 'B. 环境污染', 'C. 失业问题', 'D. 教育下降'], answer: 2 },
      { q: '专家认为人类应该怎么做？', options: ['A. 抵制新技术', 'B. 学习新技术', 'C. 减少工作', 'D. 移民他国'], answer: 1 }
    ],
    translation: 'Cùng với sự phát triển nhanh chóng của công nghệ trí tuệ nhân tạo, ngày càng nhiều ngành bắt đầu bị ảnh hưởng. Trong y tế, AI giúp bác sĩ chẩn đoán bệnh nhanh hơn và chính xác hơn. Trong giáo dục, hệ thống học tập thông minh lập kế hoạch cá nhân hóa cho từng học sinh. Tuy nhiên, các công nghệ này cũng mang theo thách thức. Nhiều người lo ngại AI sẽ thay thế các vị trí công việc truyền thống, gây thất nghiệp. Các chuyên gia cho rằng con người cần chủ động học công nghệ mới để duy trì sức cạnh tranh.'
  }
];

export const QUIZ_BANK = {
  1: [
    { hanzi: '你好', pinyin: 'nǐ hǎo', meaning: 'Xin chào', options: ['Tạm biệt', 'Xin chào', 'Cảm ơn', 'Xin lỗi'] },
    { hanzi: '谢谢', pinyin: 'xièxie', meaning: 'Cảm ơn', options: ['Xin chào', 'Tạm biệt', 'Cảm ơn', 'Không có gì'] },
    { hanzi: '对不起', pinyin: 'duìbuqǐ', meaning: 'Xin lỗi', options: ['Cảm ơn', 'Xin lỗi', 'Không có gì', 'Chào'] },
    { hanzi: '学生', pinyin: 'xuésheng', meaning: 'Học sinh', options: ['Giáo viên', 'Học sinh', 'Bác sĩ', 'Kỹ sư'] },
    { hanzi: '老师', pinyin: 'lǎoshī', meaning: 'Giáo viên', options: ['Học sinh', 'Bác sĩ', 'Giáo viên', 'Kỹ sư'] },
    { hanzi: '喜欢', pinyin: 'xǐhuān', meaning: 'Thích', options: ['Ghét', 'Thích', 'Yêu', 'Muốn'] },
    { hanzi: '漂亮', pinyin: 'piàoliang', meaning: 'Đẹp', options: ['Xấu', 'Đẹp', 'Cao', 'Thấp'] },
    { hanzi: '工作', pinyin: 'gōngzuò', meaning: 'Làm việc / Công việc', options: ['Học tập', 'Nghỉ ngơi', 'Làm việc', 'Vui chơi'] },
    { hanzi: '朋友', pinyin: 'péngyǒu', meaning: 'Bạn bè', options: ['Gia đình', 'Bạn bè', 'Đồng nghiệp', 'Người lạ'] },
    { hanzi: '医院', pinyin: 'yīyuàn', meaning: 'Bệnh viện', options: ['Trường học', 'Siêu thị', 'Bệnh viện', 'Công ty'] },
    { hanzi: '天气', pinyin: 'tiānqì', meaning: 'Thời tiết', options: ['Thời gian', 'Thời tiết', 'Mùa', 'Nhiệt độ'] },
    { hanzi: '再见', pinyin: 'zàijiàn', meaning: 'Tạm biệt', options: ['Xin chào', 'Tạm biệt', 'Cảm ơn', 'Xin lỗi'] }
  ],
  2: [
    { hanzi: '努力', pinyin: 'nǔlì', meaning: 'Cố gắng', options: ['Lười biếng', 'Cố gắng', 'Thất bại', 'Giỏi giang'] },
    { hanzi: '经常', pinyin: 'jīngcháng', meaning: 'Thường xuyên', options: ['Đôi khi', 'Thường xuyên', 'Hiếm khi', 'Không bao giờ'] },
    { hanzi: '认为', pinyin: 'rènwéi', meaning: 'Cho rằng', options: ['Thấy rằng', 'Cho rằng', 'Biết rằng', 'Muốn rằng'] },
    { hanzi: '影响', pinyin: 'yǐngxiǎng', meaning: 'Ảnh hưởng', options: ['Giúp đỡ', 'Cản trở', 'Ảnh hưởng', 'Thay đổi'] },
    { hanzi: '环境', pinyin: 'huánjìng', meaning: 'Môi trường', options: ['Thiên nhiên', 'Môi trường', 'Thời tiết', 'Địa hình'] },
    { hanzi: '发展', pinyin: 'fāzhǎn', meaning: 'Phát triển', options: ['Suy thoái', 'Phát triển', 'Tăng trưởng', 'Biến đổi'] }
  ],
  3: [
    { hanzi: '参加', pinyin: 'cānjiā', meaning: 'Tham gia', options: ['Rời đi', 'Tham gia', 'Từ chối', 'Đồng ý'] },
    { hanzi: '安全', pinyin: 'ānquán', meaning: 'An toàn', options: ['Nguy hiểm', 'An toàn', 'Yên tĩnh', 'Sạch sẽ'] },
    { hanzi: '选择', pinyin: 'xuǎnzé', meaning: 'Chọn lựa', options: ['Từ chối', 'Chọn lựa', 'Quyết định', 'Phân vân'] },
    { hanzi: '历史', pinyin: 'lìshǐ', meaning: 'Lịch sử', options: ['Địa lý', 'Lịch sử', 'Văn học', 'Nghệ thuật'] }
  ]
};

export const GRAMMAR_PATTERNS = [
  {
    id: 'gp_001', level: 1, category: 'Cơ bản',
    pattern: 'A + 是 + B',
    name: 'Câu phán đoán với 是',
    explanation: 'Dùng để xác định hoặc phân loại, tương đương "A là B" trong tiếng Việt.',
    examples: [
      { zh: '我是学生。', pinyin: 'Wǒ shì xuésheng.', vi: 'Tôi là học sinh.' },
      { zh: '这是我的书。', pinyin: 'Zhè shì wǒ de shū.', vi: 'Đây là sách của tôi.' }
    ],
    traps: ['Phủ định KHÔNG phải là "不是很" mà là "不是": 我不是老师', 'Câu hỏi thêm 吗: 你是学生吗？'],
    exercises: [
      { prompt: 'Anh ấy là bác sĩ.', answer: '他是医生。' },
      { prompt: 'Cô ấy không phải là học sinh.', answer: '她不是学生。' }
    ]
  },
  {
    id: 'gp_002', level: 1, category: 'Cơ bản',
    pattern: 'A + 有 + B',
    name: 'Câu biểu thị sở hữu với 有',
    explanation: 'Biểu thị việc sở hữu, tồn tại. Phủ định dùng 没有, không dùng 不有.',
    examples: [
      { zh: '我有一个哥哥。', pinyin: 'Wǒ yǒu yī gè gēgē.', vi: 'Tôi có một người anh trai.' },
      { zh: '桌子上有很多书。', pinyin: 'Zhuōzi shàng yǒu hěn duō shū.', vi: 'Trên bàn có rất nhiều sách.' }
    ],
    traps: ['Phủ định: 我没有钱 (không: 我不有钱)', 'Câu hỏi: 你有没有时间？ (có...không)'],
    exercises: [
      { prompt: 'Tôi có một cái điện thoại.', answer: '我有一部手机。' },
      { prompt: 'Tôi không có tiền.', answer: '我没有钱。' }
    ]
  },
  {
    id: 'gp_003', level: 2, category: 'So sánh',
    pattern: 'A + 比 + B + Tính từ',
    name: 'Câu so sánh hơn với 比',
    explanation: 'So sánh A hơn B về một phương diện. Không được thêm 很/非常 trước tính từ.',
    examples: [
      { zh: '今天比昨天冷。', pinyin: 'Jīntiān bǐ zuótiān lěng.', vi: 'Hôm nay lạnh hơn hôm qua.' },
      { zh: '他比我高一点儿。', pinyin: 'Tā bǐ wǒ gāo yīdiǎnr.', vi: 'Anh ấy cao hơn tôi một chút.' }
    ],
    traps: ['SAI: 他比我很高 ❌', 'ĐÚNG: 他比我高很多 ✅ (nhiều hơn)', 'Phủ định: 他没有我高 (không dùng 不比)'],
    exercises: [
      { prompt: 'Tiếng Trung khó hơn tiếng Anh.', answer: '中文比英文难。' },
      { prompt: 'Anh ấy trẻ hơn tôi ba tuổi.', answer: '他比我小三岁。' }
    ]
  },
  {
    id: 'gp_004', level: 2, category: 'Thời gian',
    pattern: 'Chủ ngữ + 已经 + Động từ + 了',
    name: 'Đã + hành động (已经...了)',
    explanation: '已经 = đã, biểu thị hành động đã hoàn thành. 了 ở cuối nhấn mạnh sự thay đổi trạng thái.',
    examples: [
      { zh: '我已经吃饭了。', pinyin: 'Wǒ yǐjīng chīfàn le.', vi: 'Tôi đã ăn cơm rồi.' },
      { zh: '他已经走了。', pinyin: 'Tā yǐjīng zǒu le.', vi: 'Anh ấy đã đi rồi.' }
    ],
    traps: ['Phủ định: 我还没(有)吃饭 (chưa ăn) — bỏ 已经, thêm 还没有'],
    exercises: [
      { prompt: 'Tôi đã học xong rồi.', answer: '我已经学完了。' },
      { prompt: 'Bài tập đã làm xong chưa?', answer: '作业做完了吗？' }
    ]
  },
  {
    id: 'gp_005', level: 3, category: 'Điều nhượng',
    pattern: '虽然...但是/可是...',
    name: 'Tuy...nhưng... (虽然...但是...)',
    explanation: 'Biểu thị quan hệ điều nhượng. 虽然 ở vế trước, 但是/可是 ở vế sau.',
    examples: [
      { zh: '虽然天气很冷，但是他还是坚持跑步。', pinyin: 'Suīrán tiānqì hěn lěng, dànshì tā háishì jiānchí pǎobù.', vi: 'Tuy thời tiết rất lạnh nhưng anh ấy vẫn kiên trì chạy bộ.' }
    ],
    traps: ['虽然 và 但是 không dùng cùng một chủ ngữ như tiếng Anh although/but', '可是 mang tính khẩu ngữ hơn 但是'],
    exercises: [
      { prompt: 'Tuy bận nhưng tôi vẫn học mỗi ngày.', answer: '虽然很忙，但是我还是每天学习。' }
    ]
  }
];
