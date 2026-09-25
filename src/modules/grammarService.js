/**
 * HánNgữ Pro - HSK Grammar Service
 * Manages grammar curriculum, sentence scramble evaluation,
 * and tracks learning mastery in SQLite database.
 */

import { HSK_GRAMMAR_POINTS } from '../data/grammarData.js';
import { sqliteService } from './sqliteDb.js';

class GrammarService {
  constructor() {
    this.grammarPoints = HSK_GRAMMAR_POINTS;
    this.initTable();
  }

  initTable() {
    try {
      if (!sqliteService.isReady) return;
      sqliteService.run(`
        CREATE TABLE IF NOT EXISTS grammar_progress (
          grammar_id TEXT PRIMARY KEY,
          level INTEGER,
          completed INTEGER DEFAULT 0,
          score INTEGER DEFAULT 0,
          last_practiced TEXT DEFAULT (datetime('now', 'localtime'))
        );
      `);
    } catch (e) {
      console.warn('[GrammarService] Init table notice:', e);
    }
  }

  ensureTable() {
    this.initTable();
  }

  getAllPoints(filterLevel = null) {
    if (!filterLevel || filterLevel === 'all') {
      return this.grammarPoints;
    }
    const lvl = parseInt(filterLevel, 10);
    return this.grammarPoints.filter(p => p.level === lvl);
  }

  getPointById(id) {
    return this.grammarPoints.find(p => p.id === id) || null;
  }

  evaluateScramble(grammarId, userOrderTokens) {
    const point = this.getPointById(grammarId);
    if (!point || !point.exercise) {
      return { success: false, message: 'Không tìm thấy bài tập ngữ pháp này.' };
    }

    const { correctOrder, meaning } = point.exercise;
    const isCorrect = JSON.stringify(userOrderTokens) === JSON.stringify(correctOrder);

    // Save progress to SQLite
    try {
      this.ensureTable();
      const today = new Date().toISOString().split('T')[0];
      const score = isCorrect ? 100 : 50;
      sqliteService.run(`
        INSERT INTO grammar_progress (grammar_id, level, completed, score, last_practiced)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(grammar_id) DO UPDATE SET
          completed = completed + 1,
          score = MAX(score, excluded.score),
          last_practiced = excluded.last_practiced;
      `, [grammarId, point.level, 1, score, today]);
    } catch (err) {
      console.warn('[GrammarService] Save progress notice:', err);
    }

    if (isCorrect) {
      return {
        isCorrect: true,
        score: 100,
        expGained: 25,
        title: '🎉 Hoàn Toàn Chính Xác!',
        message: `Tuyệt vời! Bạn đã sắp xếp câu đúng chuẩn ngữ pháp Hán ngữ. Nghĩa: "${meaning}"`,
        correctSentence: correctOrder.join('')
      };
    } else {
      return {
        isCorrect: false,
        score: 40,
        expGained: 5,
        title: '⚠️ Chưa Đúng Trật Tự Từ',
        message: `Đáp án đúng là: "${correctOrder.join(' ')}". Nghĩa: "${meaning}". Hãy chú ý vị trí bổ ngữ và trạng ngữ!`,
        correctSentence: correctOrder.join('')
      };
    }
  }

  getProgressStats() {
    try {
      this.ensureTable();
      const rows = sqliteService.query("SELECT COUNT(*) as total, SUM(CASE WHEN score >= 80 THEN 1 ELSE 0 END) as mastered FROM grammar_progress;");
      const totalPracticed = rows[0]?.total || 0;
      const mastered = rows[0]?.mastered || 0;
      return {
        totalPracticed,
        mastered,
        totalPoints: this.grammarPoints.length
      };
    } catch {
      return { totalPracticed: 0, mastered: 0, totalPoints: this.grammarPoints.length };
    }
  }
}

export const grammarService = new GrammarService();
