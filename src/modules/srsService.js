/**
 * HánNgữ Pro - Spaced Repetition System (SRS Engine)
 * Implements SuperMemo SM-2 Algorithm & Ebbinghaus Forgetting Curve Modeling
 * Quản lý hàng đợi ôn tập cá nhân hóa, dự đoán tỷ lệ quên và ghi nhớ lâu dài vào SQLite
 */

import { sqliteService } from './sqliteDb.js';
import { storageService } from './storageService.js';
import { HSK_VOCABULARY } from '../data/hskData.js';

class SrsService {
  constructor() {
    this.defaultEaseFactor = 2.5;
    this.minEaseFactor = 1.3;
  }

  /**
   * SuperMemo SM-2 core calculation
   * @param {Object} item - SRS item { repetitions, interval_days, ease_factor }
   * @param {number} grade - User score (0 = Blank, 1 = Fail, 2 = Hard, 3 = Pass with effort, 4 = Good, 5 = Perfect recall)
   * @returns {Object} { repetitions, interval_days, ease_factor, due_timestamp, last_reviewed }
   */
  calculateNextReview(item, grade) {
    let repetitions = item.repetitions || 0;
    let interval = item.interval_days || 1;
    let easeFactor = item.ease_factor || this.defaultEaseFactor;

    // Grade validation
    grade = Math.max(0, Math.min(5, Math.round(grade)));

    if (grade >= 3) {
      // Correct recall
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 3; // Optimized for language acquisition (3 days)
      } else if (repetitions === 2) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions += 1;
    } else {
      // Failed recall - reset streak
      repetitions = 0;
      interval = 1;
    }

    // Update Ease Factor
    // EF' = EF + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
    easeFactor = easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
    if (easeFactor < this.minEaseFactor) {
      easeFactor = this.minEaseFactor;
    }

    const now = Date.now();
    const dueTimestamp = now + interval * 24 * 60 * 60 * 1000;

    return {
      repetitions,
      interval_days: interval,
      ease_factor: parseFloat(easeFactor.toFixed(2)),
      due_timestamp: dueTimestamp,
      last_reviewed: new Date().toISOString()
    };
  }

  /**
   * Calculate predicted retention rate using Ebbinghaus curve: R = exp(-t / S)
   * @param {Object} item 
   * @returns {number} percentage (0 - 100)
   */
  calculateRetention(item) {
    if (!item.due_timestamp || !item.last_reviewed) return 100;
    const now = Date.now();
    const lastTime = new Date(item.last_reviewed).getTime();
    const daysSince = Math.max(0, (now - lastTime) / (24 * 60 * 60 * 1000));
    const stability = Math.max(1, item.interval_days || 1);

    // Retention formula: R = e^(-t / (stability * 1.5))
    const retention = Math.exp(-daysSince / (stability * 1.5)) * 100;
    return Math.max(5, Math.min(100, Math.round(retention)));
  }

  /**
   * Ensure SRS table exists and initial cards are seeded
   */
  async ensureReady() {
    await sqliteService.ensureReady();
    if (!sqliteService.db) return;

    // Create table if not exists
    sqliteService.run(`
      CREATE TABLE IF NOT EXISTS srs_items (
        id TEXT PRIMARY KEY,
        hanzi TEXT NOT NULL,
        pinyin TEXT NOT NULL,
        hanviet TEXT,
        meaning TEXT NOT NULL,
        level INTEGER DEFAULT 1,
        repetitions INTEGER DEFAULT 0,
        interval_days INTEGER DEFAULT 1,
        ease_factor REAL DEFAULT 2.5,
        due_timestamp INTEGER DEFAULT 0,
        last_reviewed TEXT,
        history_json TEXT,
        created_at TEXT DEFAULT (datetime('now', 'localtime'))
      );
    `);
    sqliteService.run("CREATE INDEX IF NOT EXISTS idx_srs_due ON srs_items(due_timestamp);");

    // Check count, seed if empty from HSK curriculum
    const countRes = sqliteService.query("SELECT COUNT(*) AS total FROM srs_items;");
    const total = countRes[0]?.total || 0;
    if (total === 0) {
      await this.seedInitialSrsItems();
    }
  }

  /**
   * Seed SRS items from initial vocabulary
   */
  async seedInitialSrsItems() {
    try {
      const now = Date.now();
      const insertSql = `
        INSERT OR IGNORE INTO srs_items (id, hanzi, pinyin, hanviet, meaning, level, repetitions, interval_days, ease_factor, due_timestamp, last_reviewed, history_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `;

      Object.keys(HSK_VOCABULARY).forEach(lvl => {
        const list = HSK_VOCABULARY[lvl] || [];
        list.forEach((v, index) => {
          // Spread due dates slightly
          const dueOffset = (index % 4) * 86400000;
          sqliteService.run(insertSql, [
            `srs_${v.hanzi}`,
            v.hanzi,
            v.pinyin,
            v.hanviet || '',
            v.meaning,
            parseInt(lvl, 10),
            0,
            1,
            2.5,
            now - (86400000) + dueOffset, // some due right away
            new Date(now - 86400000).toISOString(),
            JSON.stringify([])
          ]);
        });
      });
      sqliteService.saveToStorage();
    } catch (e) {
      console.warn('[SRS Seed Warning]:', e);
    }
  }

  /**
   * Get queue of items due for review
   */
  async getDueQueue(limit = 20, level = 0) {
    await this.ensureReady();
    const now = Date.now();
    let sql = "SELECT * FROM srs_items WHERE due_timestamp <= ?";
    const params = [now];

    if (level > 0) {
      sql += " AND level = ?";
      params.push(level);
    }

    sql += " ORDER BY due_timestamp ASC LIMIT ?;";
    params.push(limit);

    let items = sqliteService.query(sql, params);

    // If queue has few due items, fetch some unlearned or upcoming items
    if (items.length < limit) {
      let extraSql = "SELECT * FROM srs_items WHERE due_timestamp > ?";
      const extraParams = [now];
      if (level > 0) {
        extraSql += " AND level = ?";
        extraParams.push(level);
      }
      extraSql += " ORDER BY repetitions ASC, due_timestamp ASC LIMIT ?;";
      extraParams.push(limit - items.length);

      const extraItems = sqliteService.query(extraSql, extraParams);
      items = items.concat(extraItems);
    }

    return items;
  }

  /**
   * Submit review for an SRS item
   */
  async recordReview(hanzi, grade) {
    await this.ensureReady();
    const rows = sqliteService.query("SELECT * FROM srs_items WHERE hanzi = ? LIMIT 1;", [hanzi]);
    if (rows.length === 0) return null;

    const item = rows[0];
    const nextStats = this.calculateNextReview(item, grade);

    let history = [];
    try {
      history = JSON.parse(item.history_json || '[]');
    } catch (e) {
      history = [];
    }
    history.push({
      date: new Date().toISOString(),
      grade,
      interval: nextStats.interval_days,
      ef: nextStats.ease_factor
    });

    const updateSql = `
      UPDATE srs_items
      SET repetitions = ?,
          interval_days = ?,
          ease_factor = ?,
          due_timestamp = ?,
          last_reviewed = ?,
          history_json = ?
      WHERE hanzi = ?;
    `;

    sqliteService.run(updateSql, [
      nextStats.repetitions,
      nextStats.interval_days,
      nextStats.ease_factor,
      nextStats.due_timestamp,
      nextStats.last_reviewed,
      JSON.stringify(history),
      hanzi
    ]);

    sqliteService.saveToStorage();

    // Reward EXP based on recall quality
    const expMap = [5, 10, 15, 20, 25, 35];
    const gainedExp = expMap[grade] || 15;
    storageService.addExp(gainedExp);

    return {
      ...item,
      ...nextStats,
      gainedExp,
      retention: this.calculateRetention(nextStats)
    };
  }

  /**
   * Get overall SRS statistics
   */
  async getStats() {
    await this.ensureReady();
    const now = Date.now();
    const total = sqliteService.query("SELECT COUNT(*) AS c FROM srs_items;")[0]?.c || 0;
    const dueCount = sqliteService.query("SELECT COUNT(*) AS c FROM srs_items WHERE due_timestamp <= ?;", [now])[0]?.c || 0;
    const masteredCount = sqliteService.query("SELECT COUNT(*) AS c FROM srs_items WHERE repetitions >= 4;")[0]?.c || 0;
    const learningCount = sqliteService.query("SELECT COUNT(*) AS c FROM srs_items WHERE repetitions > 0 AND repetitions < 4;")[0]?.c || 0;
    const newCount = sqliteService.query("SELECT COUNT(*) AS c FROM srs_items WHERE repetitions = 0;")[0]?.c || 0;

    return {
      total,
      dueCount,
      masteredCount,
      learningCount,
      newCount
    };
  }
}

export const srsService = new SrsService();
