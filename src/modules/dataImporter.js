/**
 * HánNgữ Pro - Data Importer & Dynamic Lexicon Manager
 * Quản lý đồng bộ kho dữ liệu HSK, nạp hàng loạt (bulk import),
 * tìm kiếm động thời gian thực và cho phép người dùng tự thêm từ vựng mới vào SQLite.
 */

import { sqliteService } from './sqliteDb.js';

class DataImporterService {
  /**
   * Search dictionary dynamically via SQLite Engine
   */
  async searchWords({ query = '', level = 0, limit = 50, offset = 0 } = {}) {
    await sqliteService.ensureReady();
    return sqliteService.searchDictionary({ query, level, limit, offset });
  }

  /**
   * Add a custom word directly into SQLite
   */
  async addCustomWord(wordData) {
    await sqliteService.ensureReady();
    const hanzi = String(wordData?.hanzi || '').trim();
    const pinyin = String(wordData?.pinyin || '').trim();
    const meaning = String(wordData?.meaning || '').trim();
    const level = Math.min(9, Math.max(1, parseInt(wordData?.level, 10) || 1));
    if (!hanzi || !pinyin || !meaning) {
      throw new Error('Chữ Hán, Pinyin và nghĩa tiếng Việt là bắt buộc.');
    }
    const sql = `
      INSERT INTO dictionary (hanzi, pinyin, pinyin_search, hanviet, meaning, level, radical, stroke_count, example_zh, example_pinyin, example_vi, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(hanzi) DO UPDATE SET
        pinyin = excluded.pinyin,
        pinyin_search = excluded.pinyin_search,
        hanviet = excluded.hanviet,
        meaning = excluded.meaning,
        level = excluded.level,
        radical = excluded.radical,
        stroke_count = excluded.stroke_count,
        example_zh = excluded.example_zh,
        example_pinyin = excluded.example_pinyin,
        example_vi = excluded.example_vi,
        notes = excluded.notes;
    `;
    const params = [
      hanzi,
      pinyin,
      sqliteService.normalizePinyin(pinyin),
      wordData.hanviet?.trim() || '',
      meaning,
      level,
      wordData.radical?.trim() || '',
      parseInt(wordData.stroke_count, 10) || 0,
      wordData.example_zh?.trim() || '',
      wordData.example_pinyin?.trim() || '',
      wordData.example_vi?.trim() || '',
      wordData.notes?.trim() || ''
    ];
    return sqliteService.run(sql, params);
  }

  /**
   * Delete word from SQLite dictionary
   */
  async deleteWord(id) {
    await sqliteService.ensureReady();
    return sqliteService.run("DELETE FROM dictionary WHERE id = ?;", [id]);
  }

  /**
   * Bulk import words from uploaded JSON file or object with progress reporting
   */
  async importJsonCorpus(jsonData, onProgress = null) {
    await sqliteService.ensureReady();
    if (!Array.isArray(jsonData)) {
      throw new Error('Dữ liệu JSON phải là một mảng (Array) các mục từ vựng.');
    }
    if (onProgress) {
      return await sqliteService.bulkInsertWordsChunked(jsonData, onProgress, 400);
    }
    return sqliteService.bulkInsertWords(jsonData);
  }

  /**
   * Fetch and sync corpus from static file with progress reporting
   */
  async syncFromStaticCorpus(url = 'data/hsk_vocab_corpus.json', onProgress = null) {
    try {
      const source = /^https?:\/\//i.test(String(url))
        ? String(url)
        : (typeof document !== 'undefined'
          ? new URL(String(url).replace(/^\/+/, ''), document.baseURI).href
          : String(url));
      const res = await fetch(source);
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const data = await res.json();
      return await this.importJsonCorpus(data, onProgress);
    } catch (e) {
      console.error('[Corpus Sync Error]:', e);
      throw e;
    }
  }

  /**
   * Fetch live TSV lists from GitHub Raw (krmanik/HSK-3.0) and sync directly into SQLite
   */
  async syncFromGithubRaw(onProgress = null) {
    const TSV_BASE = 'https://raw.githubusercontent.com/krmanik/HSK-3.0/main/Scripts%20and%20data/tsv/';
    const levels = [
      { file: 'HSK 1.tsv', lvl: 1 },
      { file: 'HSK 2.tsv', lvl: 2 },
      { file: 'HSK 3.tsv', lvl: 3 },
      { file: 'HSK 4.tsv', lvl: 4 },
      { file: 'HSK 5.tsv', lvl: 5 },
      { file: 'HSK 6.tsv', lvl: 6 },
      { file: 'HSK 7-9.tsv', lvl: 7 }
    ];

    const collected = [];
    const seen = new Set();

    for (let i = 0; i < levels.length; i++) {
      const { file, lvl } = levels[i];
      if (onProgress) {
        onProgress({ phase: 'downloading', file, level: lvl, progress: Math.round(((i) / levels.length) * 50) });
      }

      try {
        const res = await fetch(TSV_BASE + encodeURIComponent(file));
        if (!res.ok) continue;
        const text = await res.text();
        const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);

        for (const line of lines) {
          const parts = line.split('\t');
          if (parts.length < 3) continue;
          const trad = parts[0]?.trim() || '';
          const simp = parts[1]?.trim() || parts[0]?.trim() || '';
          const py = parts[2]?.trim() || '';
          const meaning = parts[3]?.trim() || '';

          if (!simp || seen.has(simp)) continue;
          seen.add(simp);

          collected.push({
            hanzi: simp,
            pinyin: py,
            meaning: meaning,
            level: lvl,
            stroke_count: simp.length * 6,
            notes: trad && trad !== simp ? `Phồn thể: ${trad}` : ''
          });
        }
      } catch (err) {
        console.warn(`[Github Raw Download Warning for ${file}]:`, err);
      }
    }

    if (onProgress) {
      onProgress({ phase: 'saving', current: 0, total: collected.length });
    }

    return await this.importJsonCorpus(collected, (curr, tot) => {
      if (onProgress) {
        onProgress({ phase: 'saving', current: curr, total: tot });
      }
    });
  }

  /**
   * Export all dictionary records as JSON file
   */
  async exportDictionaryAsJson() {
    await sqliteService.ensureReady();
    const words = sqliteService.query("SELECT * FROM dictionary ORDER BY level ASC, id ASC;");
    const jsonStr = JSON.stringify(words, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hanngu_pro_dictionary_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Get dictionary summary statistics
   */
  async getDictionaryStats() {
    await sqliteService.ensureReady();
    const totalRes = sqliteService.query("SELECT COUNT(*) AS total FROM dictionary;");
    const totalWords = totalRes[0]?.total || 0;

    const levelStats = sqliteService.query(`
      SELECT level, COUNT(*) AS count 
      FROM dictionary 
      GROUP BY level 
      ORDER BY level ASC;
    `);

    return {
      totalWords,
      levelStats
    };
  }
}

export const dataImporterService = new DataImporterService();
