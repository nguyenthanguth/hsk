/**
 * HánNgữ Pro - Tones & Minimal Pairs Engine
 * Hệ thống trực quan hóa 5 mức cao độ thanh điệu và cặp âm tối thiểu dễ gây hiểu lầm
 */

export const TONE_CONTOURS = [
  {
    tone: 1,
    name: 'Thanh 1 (Âm Bình - 阴平)',
    mark: 'ˉ (mā)',
    contour: '5-5',
    pitchName: 'Cao - Phẳng',
    freqStart: 340,
    freqEnd: 340,
    duration: 0.6,
    description: 'Bắt đầu ở cao độ 5 (cao nhất) và giữ nguyên không đổi suốt âm tiết. Giống như kéo dài một nốt nhạc cao, ngân đều, không ngắt quãng.',
    vietnameseTip: 'Tương tự thanh ngang trong tiếng Việt nhưng cần đẩy tông giọng cao hơn một bậc và giữ thật phẳng.',
    exampleWords: [
      { hanzi: '妈', pinyin: 'mā', meaning: 'Mẹ' },
      { hanzi: '书', pinyin: 'shū', meaning: 'Sách' },
      { hanzi: '吃', pinyin: 'chī', meaning: 'Ăn' }
    ]
  },
  {
    tone: 2,
    name: 'Thanh 2 (Dương Bình - 阳平)',
    mark: 'ˊ (má)',
    contour: '3-5',
    pitchName: 'Vút lên cao',
    freqStart: 250,
    freqEnd: 340,
    duration: 0.55,
    description: 'Khởi đầu ở cao độ 3 (trung bình), sau đó vút thẳng lên độ cao 5. Âm sắc bay bổng, có lực đẩy lên phía trên.',
    vietnameseTip: 'Gần giống dấu sắc tiếng Việt nhưng khởi phát mềm mại hơn từ quãng trung, không gắt ngay từ đầu.',
    exampleWords: [
      { hanzi: '麻', pinyin: 'má', meaning: 'Cây gai, tê' },
      { hanzi: '来', pinyin: 'lái', meaning: 'Đến' },
      { hanzi: '国', pinyin: 'guó', meaning: 'Đất nước' }
    ]
  },
  {
    tone: 3,
    name: 'Thanh 3 (Thượng Thanh - 上声)',
    mark: 'ˇ (mǎ)',
    contour: '2-1-4',
    pitchName: 'Trầm sâu rồi lượn lên',
    freqStart: 230,
    freqMid: 175,
    freqEnd: 270,
    duration: 0.7,
    description: 'Bắt đầu từ độ cao 2, hạ xuống đáy vực độ cao 1 (trầm nhất), rồi hơi lượn nhẹ lên mức 4 khi đọc đơn lẻ.',
    vietnameseTip: 'Lưu ý quy tắc biến điệu: Hai thanh 3 đứng liền nhau thì thanh đầu tiên biến thành thanh 2 (nǐ hǎo -> ní hǎo). Khi đứng trước thanh 1, 2, 4 chỉ đọc nửa đầu (2-1 - nửa thanh 3).',
    exampleWords: [
      { hanzi: '马', pinyin: 'mǎ', meaning: 'Con ngựa' },
      { hanzi: '好', pinyin: 'hǎo', meaning: 'Tốt' },
      { hanzi: '买', pinyin: 'mǎi', meaning: 'Mua' }
    ]
  },
  {
    tone: 4,
    name: 'Thanh 4 (Khứ Thanh - 去声)',
    mark: 'ˋ (mà)',
    contour: '5-1',
    pitchName: 'Rơi thẳng xuống đáy',
    freqStart: 350,
    freqEnd: 170,
    duration: 0.45,
    description: 'Xuất phát từ đỉnh cao nhất 5 và rơi dứt khoát như một nhát búa xuống mức 1. Ngắn, mạnh, dứt khoát, không kéo dài.',
    vietnameseTip: 'Khác dấu huyền tiếng Việt (huyền đi từ 3 xuống 2 êm dịu). Thanh 4 rơi từ 5 xuống 1 cực kỳ dứt khoát và mạnh mẽ.',
    exampleWords: [
      { hanzi: '骂', pinyin: 'mà', meaning: 'Mắng chửi' },
      { hanzi: '看', pinyin: 'kàn', meaning: 'Xem, nhìn' },
      { hanzi: '去', pinyin: 'qù', meaning: 'Đi' }
    ]
  },
  {
    tone: 0,
    name: 'Thanh Nhẹ (Khinh Thanh - 轻声)',
    mark: 'Không dấu (ma)',
    contour: '2/3',
    pitchName: 'Nhẹ - Ngắn',
    freqStart: 240,
    freqEnd: 220,
    duration: 0.25,
    description: 'Âm đọc lướt nhanh, nhẹ, hơi hạ giọng. Cao độ phụ thuộc vào thanh điệu của từ đứng ngay trước nó.',
    vietnameseTip: 'Đọc thật nhẹ như một nốt phụ lướt qua, không nhấn trọng âm vào âm tiết này.',
    exampleWords: [
      { hanzi: '吗', pinyin: 'ma', meaning: 'Trợ từ hỏi' },
      { hanzi: '的', pinyin: 'de', meaning: 'Của' },
      { hanzi: '爸爸', pinyin: 'bàba', meaning: 'Bố' }
    ]
  }
];

export const MINIMAL_PAIRS = [
  {
    id: 'pair_1',
    title: '买 (mǎi) vs 卖 (mài) - Mua hay Bán?',
    dangerLevel: 'Rất Cao',
    story: 'Nhầm lẫn thanh 3 (mǎi - mua) và thanh 4 (mài - bán) trong thương mại sẽ khiến giá cả và vai trò giao dịch đảo lộn 180 độ!',
    wordA: {
      hanzi: '买',
      pinyin: 'mǎi',
      tone: 3,
      contour: '2-1-4 (Trầm - Vòng)',
      meaning: 'Mua',
      sentence: '我想买两斤新鲜水果。',
      sentenceVi: 'Tôi muốn mua hai cân hoa quả tươi.'
    },
    wordB: {
      hanzi: '卖',
      pinyin: 'mài',
      tone: 4,
      contour: '5-1 (Rơi mạnh dứt khoát)',
      meaning: 'Bán',
      sentence: '这家店卖的茶叶质量很好。',
      sentenceVi: 'Trà mà cửa hàng này bán chất lượng rất tốt.'
    },
    practiceQuiz: {
      audioPrompt: 'mài',
      question: 'Từ bạn vừa nghe là Mua hay Bán?',
      options: ['买 (mǎi - Mua)', '卖 (mài - Bán)'],
      correctIndex: 1
    }
  },
  {
    id: 'pair_2',
    title: '问 (wèn) vs 吻 (wěn) - Hỏi hay Hôn?',
    dangerLevel: 'Cực Kỳ Ngại Ngùng',
    story: 'Một học viên muốn nói "Cho tôi hỏi bạn một câu" (我想问你一下 - wèn), nhưng phát âm thành thanh 3 (我想吻你一下 - wěn), nghĩa là "Cho tôi hôn bạn một cái"!',
    wordA: {
      hanzi: '问',
      pinyin: 'wèn',
      tone: 4,
      contour: '5-1 (Rơi dứt khoát)',
      meaning: 'Hỏi',
      sentence: '请问去火车站怎么走？',
      sentenceVi: 'Xin hỏi đến ga tàu hỏa đi như thế nào?'
    },
    wordB: {
      hanzi: '吻',
      pinyin: 'wěn',
      tone: 3,
      contour: '2-1-4 (Trầm lượn lên)',
      meaning: 'Hôn',
      sentence: '母亲轻轻吻了孩子的额头。',
      sentenceVi: 'Người mẹ nhẹ nhàng hôn lên trán đứa con.'
    },
    practiceQuiz: {
      audioPrompt: 'wèn',
      question: 'Phát âm chuẩn để hỏi đường là âm nào?',
      options: ['问 (wèn - Thanh 4)', '吻 (wěn - Thanh 3)'],
      correctIndex: 0
    }
  },
  {
    id: 'pair_3',
    title: '睡觉 (shuìjiào) vs 水饺 (shuǐjiǎo) - Ngủ hay Sủi cảo?',
    dangerLevel: 'Hài Hước Trong Nhà Hàng',
    story: 'Vào quán ăn gọi món: "我要一碗水饺" (shuǐjiǎo - sủi cảo thanh 3), nếu nói nhầm thành thanh 4 "我要一晚睡觉" (shuìjiào) thì phục vụ sẽ vô cùng bối rối!',
    wordA: {
      hanzi: '水饺',
      pinyin: 'shuǐjiǎo',
      tone: 3,
      contour: 'Hai thanh 3 biến điệu (shuí jiǎo)',
      meaning: 'Bánh sủi cảo',
      sentence: '老板，请给我来一份猪肉水饺。',
      sentenceVi: 'Chủ quán, cho tôi một phần sủi cảo thịt lợn.'
    },
    wordB: {
      hanzi: '睡觉',
      pinyin: 'shuìjiào',
      tone: 4,
      contour: 'Hai thanh 4 (shuì jiào rơi mạnh)',
      meaning: 'Đi ngủ',
      sentence: '时间不早了，大家早点去睡觉吧。',
      sentenceVi: 'Thời gian không còn sớm nữa, mọi người đi ngủ sớm đi nhé.'
    },
    practiceQuiz: {
      audioPrompt: 'shuǐjiǎo',
      question: 'Cụm từ phát âm để gọi món bánh sủi cảo là gì?',
      options: ['水饺 (shuǐjiǎo)', '睡觉 (shuìjiào)'],
      correctIndex: 0
    }
  },
  {
    id: 'pair_4',
    title: '知道 (zhīdao) vs 迟到 (chídào) - Biết hay Đến muộn?',
    dangerLevel: 'Trung bình',
    story: 'Phân biệt thanh 1 của âm đầu cuốn lưỡi "zhī" với thanh 2 bật hơi "chí".',
    wordA: {
      hanzi: '知道',
      pinyin: 'zhīdao',
      tone: 1,
      contour: '5-5 + Thanh nhẹ',
      meaning: 'Biết, nắm rõ',
      sentence: '这件事只有王经理知道。',
      sentenceVi: 'Việc này chỉ có giám đốc Vương biết.'
    },
    wordB: {
      hanzi: '迟到',
      pinyin: 'chídào',
      tone: 2,
      contour: '3-5 + 5-1',
      meaning: 'Đến muộn, đi trễ',
      sentence: '今天路上堵车，所以我迟到了十分钟。',
      sentenceVi: 'Hôm nay trên đường tắc xe nên tôi đã đến muộn 10 phút.'
    },
    practiceQuiz: {
      audioPrompt: 'chídào',
      question: 'Từ chỉ hành động "đi trễ, đến muộn" là:',
      options: ['知道 (zhīdao)', '迟到 (chídào)'],
      correctIndex: 1
    }
  }
];

export const INITIAL_CONSONANTS_GUIDE = [
  {
    group: 'Âm mặt lưỡi (舌面前音)',
    initials: ['j', 'q', 'x'],
    mechanics: 'Mặt trước của lưỡi dính sát vào ngạc cứng, đầu lưỡi hạ thấp đặt sau răng dưới.',
    vietnameseNotes: 'q là âm bật hơi mạnh (giống chữ ch nhưng bật luồng hơi mạnh ra). Tuyệt đối không cong lưỡi!'
  },
  {
    group: 'Âm đầu lưỡi quặt / Cuốn lưỡi (舌尖后音)',
    initials: ['zh', 'ch', 'sh', 'r'],
    mechanics: 'Đầu lưỡi cong lên chạm vào ngạc cứng phía trước vòm họng.',
    vietnameseNotes: 'zh giống "tr" miền Nam nhưng không bật hơi; ch giống "tr" bật luồng hơi cực mạnh; sh giống âm "s" nặng; r là âm rung xát đầu lưỡi.'
  },
  {
    group: 'Âm đầu lưỡi trước (舌尖前音)',
    initials: ['z', 'c', 's'],
    mechanics: 'Đầu lưỡi thẳng ra tì vào mặt sau của răng cửa trên.',
    vietnameseNotes: 'z giống chữ "gi/d" hoặc "t" nhẹ; c bật luồng hơi mạnh tì răng; s phát âm như chữ "x" nhẹ của tiếng Việt.'
  }
];
