/**
 * SyntaxAnalyzerService - Hệ thống bóc tách cú pháp câu & Cây ngữ pháp chữ Hán (Syntax Tree & Grammar Deconstructor)
 * Giúp người học làm chủ trật tự câu tiếng Trung, giải quyết triệt để lỗi "nói tiếng Trung theo ngữ pháp tiếng Việt".
 */

export const SAMPLE_SYNTAX_SENTENCES = [
  {
    id: 'syn_01',
    chinese: '我 昨天 在图书馆 认真地 看了 三个小时的 汉语书。',
    pinyin: 'Wǒ zuótiān zài túshūguǎn rènzhēn de kàn le sān gè xiǎoshí de hànyǔ shū.',
    meaning: 'Hôm qua tôi đã chăm chỉ đọc sách tiếng Hán trong thư viện suốt ba tiếng đồng hồ.',
    level: 'HSK 3 - Cấu trúc chuẩn mực',
    tokens: [
      { role: 'subject', roleName: 'Chủ ngữ (主语)', text: '我', pinyin: 'Wǒ', color: '#3b82f6', desc: 'Chủ thể thực hiện hành động (Tôi)' },
      { role: 'adverbial_time', roleName: 'Trạng ngữ thời gian (时间状语)', text: '昨天', pinyin: 'zuótiān', color: '#10b981', desc: 'Đứng trước vị ngữ hoặc đầu câu (Hôm qua)' },
      { role: 'adverbial_place', roleName: 'Giới từ địa điểm (介词短语)', text: '在图书馆', pinyin: 'zài túshūguǎn', color: '#06b6d4', desc: 'Tiếng Trung: Ở ĐÂU rồi mới LÀM GÌ (Ở thư viện)' },
      { role: 'adverbial_manner', roleName: 'Trạng ngữ phương thức (情态状语)', text: '认真地', pinyin: 'rènzhēn de', color: '#8b5cf6', desc: 'Bổ nghĩa cho động từ: Một cách chăm chỉ' },
      { role: 'predicate', roleName: 'Vị ngữ động từ (谓语动词)', text: '看', pinyin: 'kàn', color: '#ef4444', desc: 'Hành động trung tâm của câu (Đọc, xem)' },
      { role: 'aspect', roleName: 'Trợ từ động thái (动态助词)', text: '了', pinyin: 'le', color: '#f59e0b', desc: 'Biểu thị hành động đã hoàn tất' },
      { role: 'complement', roleName: 'Bổ ngữ thời lượng (时量补语)', text: '三个小时的', pinyin: 'sān gè xiǎoshí de', color: '#ec4899', desc: 'Độ dài thời gian diễn ra hành động: Suốt 3 tiếng' },
      { role: 'object', roleName: 'Tân ngữ danh từ (宾语)', text: '汉语书', pinyin: 'hànyǔ shū', color: '#14b8a6', desc: 'Đối tượng tiếp nhận hành động (Sách tiếng Hán)' }
    ],
    contrastNote: '⚠️ Khác biệt cốt lõi với tiếng Việt: Tiếng Việt nói "Tôi đọc sách Ở THƯ VIỆN", nhưng tiếng Trung BẮT BUỘC phải đặt địa điểm trước hành động: "Tôi Ở THƯ VIỆN đọc sách" (我 在图书馆 看书).'
  },
  {
    id: 'syn_02',
    chinese: '请 你 把 桌子上的 那些 文件 送到 经理办公室 去。',
    pinyin: 'Qǐng nǐ bǎ zhuōzi shàng de nàxiē wénjiàn sòng dào jīnglǐ bàngōngshì qù.',
    meaning: 'Xin bạn hãy mang những tài liệu trên bàn đó gửi đến văn phòng giám đốc.',
    level: 'HSK 4 - Câu chữ 把 (处置句)',
    tokens: [
      { role: 'polite', roleName: 'Từ lịch sự (礼貌用语)', text: '请', pinyin: 'Qǐng', color: '#64748b', desc: 'Xin mời, làm ơn' },
      { role: 'subject', roleName: 'Chủ ngữ (主语)', text: '你', pinyin: 'nǐ', color: '#3b82f6', desc: 'Bạn' },
      { role: 'ba_prep', roleName: 'Giới từ 把 (把字介词)', text: '把', pinyin: 'bǎ', color: '#ef4444', desc: 'Đưa đối tượng lên trước để xử lý tác động' },
      { role: 'disposal_object', roleName: 'Đối tượng bị xử lý (处置对象)', text: '桌子上的那些文件', pinyin: 'zhuōzi shàng de nàxiē wénjiàn', color: '#06b6d4', desc: 'Những tài liệu trên bàn (Đã xác định cụ thể)' },
      { role: 'predicate', roleName: 'Vị ngữ động từ (谓语动词)', text: '送', pinyin: 'sòng', color: '#f59e0b', desc: 'Hành động: Gửi, đưa' },
      { role: 'complement_result', roleName: 'Bổ ngữ kết quả / Nơi chốn (结果/处所补语)', text: '到 经理办公室', pinyin: 'dào jīnglǐ bàngōngshì', color: '#8b5cf6', desc: 'Đích đến của hành động: Tới văn phòng giám đốc' },
      { role: 'complement_direction', roleName: 'Bổ ngữ xu hướng (趋向补语)', text: '去', pinyin: 'qù', color: '#10b981', desc: 'Đi xa khỏi vị trí người nói' }
    ],
    contrastNote: '⚠️ Câu chữ 把 dùng khi muốn nhấn mạnh sự xử lý, làm thay đổi trạng thái hoặc vị trí của một vật thể đã xác định rõ.'
  },
  {
    id: 'syn_03',
    chinese: '这篇 复杂的 经贸报告 被 他 翻译得 非常准确。',
    pinyin: 'Zhè piān fùzá de jīngmào bàogào bèi tā fānyì de fēicháng zhǔnquè.',
    meaning: 'Bản báo cáo kinh mậu phức tạp này đã được anh ấy dịch vô cùng chuẩn xác.',
    level: 'HSK 5 - Câu bị động 被 (被动句)',
    tokens: [
      { role: 'subject_patient', roleName: 'Chủ ngữ chịu tác động (受事主语)', text: '这篇复杂的经贸报告', pinyin: 'Zhè piān fùzá de jīngmào bàogào', color: '#06b6d4', desc: 'Bản báo cáo kinh mậu phức tạp này' },
      { role: 'bei_prep', roleName: 'Giới từ bị động 被 (被字介词)', text: '被', pinyin: 'bèi', color: '#ef4444', desc: 'Bị, được' },
      { role: 'agent', roleName: 'Tác nhân gây hành động (施事者)', text: '他', pinyin: 'tā', color: '#3b82f6', desc: 'Anh ấy' },
      { role: 'predicate', roleName: 'Động từ vị ngữ (谓语动词)', text: '翻译', pinyin: 'fānyì', color: '#f59e0b', desc: 'Dịch thuật' },
      { role: 'particle', roleName: 'Trợ từ kết cấu 得 (结构助词)', text: '得', pinyin: 'de', color: '#64748b', desc: 'Nối động từ với phần đánh giá trình độ' },
      { role: 'complement_degree', roleName: 'Bổ ngữ trạng thái / Trình độ (状态补语)', text: '非常准确', pinyin: 'fēicháng zhǔnquè', color: '#10b981', desc: 'Đánh giá mức độ: Vô cùng chuẩn xác' }
    ],
    contrastNote: '⚠️ Trong tiếng Trung, sau động từ nếu có bổ ngữ đánh giá (như "dịch RẤT CHUẨN") thì bắt buộc phải dùng trợ từ 得 (de).'
  }
];

export class SyntaxAnalyzerService {
  constructor() {
    this.history = [];
  }

  getSamples() {
    return SAMPLE_SYNTAX_SENTENCES;
  }

  /**
   * Phân tích câu nhập tự do dựa trên nhận diện từ loại và quy tắc ngữ pháp HSK
   */
  analyzeCustomSentence(text = '') {
    const clean = text.trim();
    if (!clean) return null;

    // Phân tích sơ bộ từ loại và cấu trúc cơ bản
    const words = clean.split(/\s+/);
    const tokens = words.map((w, idx) => {
      let role = 'element';
      let roleName = 'Thành phần câu';
      let color = '#3b82f6';
      let desc = 'Thành phần biểu đạt';

      if (idx === 0) {
        role = 'subject';
        roleName = 'Chủ ngữ (主语)';
        color = '#3b82f6';
        desc = 'Chủ thể câu';
      } else if (w.includes('在') || w.includes('从') || w.includes('向') || w.includes('对') || w.includes('跟')) {
        role = 'preposition';
        roleName = 'Giới từ kết cấu (介词短语)';
        color = '#06b6d4';
        desc = 'Chỉ địa điểm / phương hướng / đối tượng';
      } else if (w === '把') {
        role = 'ba_prep';
        roleName = 'Giới từ 把';
        color = '#ef4444';
        desc = 'Cấu trúc câu xử lý 把';
      } else if (w === '被') {
        role = 'bei_prep';
        roleName = 'Giới từ bị động 被';
        color = '#ef4444';
        desc = 'Cấu trúc câu bị động 被';
      } else if (w === '了' || w === '着' || w === '过') {
        role = 'aspect';
        roleName = 'Trợ từ động thái (动态助词)';
        color = '#f59e0b';
        desc = 'Biểu thị trạng thái hành động';
      } else if (w === '的' || w === '地' || w === '得') {
        role = 'structural_particle';
        roleName = `Trợ từ kết cấu ${w}`;
        color = '#8b5cf6';
        desc = 'Nối định ngữ / trạng ngữ / bổ ngữ';
      } else if (idx === words.length - 1) {
        role = 'object';
        roleName = 'Tân ngữ (宾语)';
        color = '#14b8a6';
        desc = 'Đối tượng chịu tác động';
      } else {
        role = 'predicate';
        roleName = 'Vị ngữ / Bổ ngữ';
        color = '#f97316';
        desc = 'Hành động hoặc trạng thái';
      }

      return {
        role,
        roleName,
        text: w,
        color,
        desc
      };
    });

    return {
      chinese: clean,
      tokens,
      summary: `Câu bao gồm ${tokens.length} khối thành phần cú pháp chính.`
    };
  }
}

export const syntaxAnalyzerService = new SyntaxAnalyzerService();
export default syntaxAnalyzerService;
