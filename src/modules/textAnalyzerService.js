/**
 * HánNgữ Pro - Text Analyzer & Smart Pinyin Ruby Segmenter
 * Phân tích cú pháp văn bản tiếng Trung, tách từ thông minh,
 * gán Bính âm Ruby và tra cứu âm Hán-Việt, ngữ nghĩa từ SQLite.
 */

import { sqliteService } from './sqliteDb.js';
import { HSK_VOCABULARY } from '../data/hskData.js';

class TextAnalyzerService {
  constructor() {
    this.vocabMap = new Map();
    this.initVocabMap();
  }

  initVocabMap() {
    // Populate with curriculum vocabulary
    Object.keys(HSK_VOCABULARY).forEach(lvl => {
      const list = HSK_VOCABULARY[lvl] || [];
      list.forEach(item => {
        if (!this.vocabMap.has(item.hanzi)) {
          this.vocabMap.set(item.hanzi, {
            hanzi: item.hanzi,
            pinyin: item.pinyin,
            hanviet: item.hanviet || '',
            meaning: item.meaning,
            level: parseInt(lvl, 10)
          });
        }
      });
    });
  }

  /**
   * Maximum Forward Matching (FMM) Tokenizer for Chinese text
   * Tách từ tiếng Trung theo thuật toán đối sánh cực đại phía trước
   */
  async tokenize(text) {
    await sqliteService.ensureReady();
    const cleanText = text.trim();
    if (!cleanText) return [];

    const tokens = [];
    let i = 0;
    const maxLen = 6; // Max Chinese word length

    while (i < cleanText.length) {
      const char = cleanText[i];

      // Non-Chinese characters (punctuation, space, latin)
      if (!/[\u4e00-\u9fa5]/.test(char)) {
        tokens.push({
          text: char,
          isChinese: false
        });
        i++;
        continue;
      }

      // Try matching longest word from maxLen down to 1
      let matched = false;
      for (let len = Math.min(maxLen, cleanText.length - i); len >= 1; len--) {
        const sub = cleanText.substring(i, i + len);

        // Check in memory vocab
        let info = this.vocabMap.get(sub);

        // If not in memory and len > 1, check SQLite dictionary
        if (!info && sqliteService.db && len > 1) {
          const dbRows = sqliteService.query("SELECT * FROM dictionary WHERE hanzi = ? LIMIT 1;", [sub]);
          if (dbRows.length > 0) {
            info = dbRows[0];
            this.vocabMap.set(sub, info);
          }
        }

        if (info || len === 1) {
          // If len === 1 and not found, try 1-char lookup in SQLite
          if (!info && len === 1 && sqliteService.db) {
            const singleRows = sqliteService.query("SELECT * FROM dictionary WHERE hanzi = ? LIMIT 1;", [sub]);
            if (singleRows.length > 0) info = singleRows[0];
          }

          tokens.push({
            text: sub,
            isChinese: true,
            pinyin: info?.pinyin || '',
            hanviet: info?.hanviet || '',
            meaning: info?.meaning || '',
            level: info?.level || 1
          });

          i += len;
          matched = true;
          break;
        }
      }

      if (!matched) {
        i++;
      }
    }

    return tokens;
  }

  /**
   * Generate HTML with Ruby annotations for Pinyin display
   */
  async generateRubyHtml(text) {
    const tokens = await this.tokenize(text);
    return tokens.map(token => {
      if (!token.isChinese) {
        return token.text === '\n' ? '<br/>' : `<span>${token.text}</span>`;
      }
      return `
        <ruby class="ruby-word" data-hanzi="${token.text}" data-pinyin="${token.pinyin}" data-meaning="${token.meaning || ''}" data-hanviet="${token.hanviet || ''}" data-level="${token.level || 1}">
          <rb class="hanzi">${token.text}</rb>
          <rt>${token.pinyin || ''}</rt>
        </ruby>
      `;
    }).join(' ');
  }
}

export const textAnalyzerService = new TextAnalyzerService();
