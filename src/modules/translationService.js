/**
 * HánNgữ Pro - Translation Arena Service
 * Evaluates bilingual Chinese-Vietnamese translation submissions,
 * checks key terminology preservation, calculates similarity,
 * and provides syntactic feedback.
 */

import { TRANSLATION_CHALLENGES } from '../data/translationData.js';
import { sqliteService } from './sqliteDb.js';

class TranslationService {
  constructor() {
    this.challenges = TRANSLATION_CHALLENGES;
    this.initTable();
  }

  initTable() {
    try {
      if (!sqliteService.isReady) return;
      sqliteService.run(`
        CREATE TABLE IF NOT EXISTS translation_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          challenge_id TEXT NOT NULL,
          user_submission TEXT NOT NULL,
          score INTEGER NOT NULL,
          feedback TEXT,
          created_at TEXT DEFAULT (datetime('now', 'localtime'))
        );
      `);
    } catch (e) {
      console.warn('[TranslationService] Init table notice:', e);
    }
  }

  ensureTable() {
    this.initTable();
  }

  getAllChallenges(tierFilter = 'all') {
    if (tierFilter === 'all') return this.challenges;
    return this.challenges.filter(c => c.tier.includes(tierFilter));
  }

  getChallengeById(id) {
    return this.challenges.find(c => c.id === id) || null;
  }

  /**
   * Evaluates a user translation.
   * Compares with reference translation, alternative answers, and key terms.
   */
  evaluateTranslation(challengeId, userText) {
    const ch = this.getChallengeById(challengeId);
    if (!ch) {
      return { success: false, message: 'Không tìm thấy bài luyện dịch.' };
    }

    const cleanInput = (userText || '').trim();
    if (!cleanInput) {
      return { success: false, message: 'Vui lòng nhập câu dịch của bạn.' };
    }

    // Reference targets
    const targets = [
      ch.direction === 'vi_to_zh' ? ch.referenceZh : ch.referenceVi,
      ...(ch.acceptableAnswers || [])
    ];

    // Check exact or near match
    let maxSimilarity = 0;
    targets.forEach(tgt => {
      const sim = this.calculateSimilarity(cleanInput, tgt);
      if (sim > maxSimilarity) maxSimilarity = sim;
    });

    // Check keyword hits
    const keywords = ch.keywords || [];
    let hits = 0;
    const lowerInput = cleanInput.toLowerCase();
    keywords.forEach(kw => {
      if (lowerInput.includes(kw.toLowerCase())) hits++;
    });
    const keywordRatio = keywords.length > 0 ? (hits / keywords.length) : 1;

    // Composite score
    let finalScore = Math.round((maxSimilarity * 0.7 + keywordRatio * 0.3) * 100);
    if (finalScore > 100) finalScore = 100;
    if (finalScore < 20 && cleanInput.length > 3) finalScore = 30; // Effort credit

    let grade = 'Cần Cố Gắng';
    let feedback = 'Bản dịch cần chú ý thêm về trật tự từ và lựa chọn thuật ngữ tương đương.';
    if (finalScore >= 85) {
      grade = 'Xuất Sắc (Thần Bút)';
      feedback = 'Bản dịch vô cùng lưu loát, chuẩn xác về mặt ngữ nghĩa và phong cách ngôn ngữ!';
    } else if (finalScore >= 70) {
      grade = 'Tốt (Đạt Chuẩn)';
      feedback = 'Bản dịch diễn đạt rõ ràng, nắm bắt tốt các ý chính và từ khóa then chốt.';
    } else if (finalScore >= 50) {
      grade = 'Khá';
      feedback = 'Đã nắm được cấu trúc cơ bản, cần chau chuốt thêm từ vựng chuyên ngành.';
    }

    // Save to SQLite
    try {
      this.ensureTable();
      sqliteService.run(`
        INSERT INTO translation_logs (challenge_id, user_submission, score, feedback)
        VALUES (?, ?, ?, ?);
      `, [challengeId, cleanInput, finalScore, feedback]);
    } catch (e) {
      console.warn('[TranslationService] Save log notice:', e);
    }

    return {
      success: true,
      score: finalScore,
      grade,
      feedback,
      referenceTarget: ch.direction === 'vi_to_zh' ? ch.referenceZh : ch.referenceVi,
      pinyin: ch.pinyin || '',
      pedagogicalNotes: ch.pedagogicalNotes,
      keywordHits: `${hits}/${keywords.length} từ khóa chuẩn`
    };
  }

  calculateSimilarity(s1, s2) {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    if (longer.length === 0) return 1.0;
    
    // Levenshtein
    const costs = [];
    for (let i = 0; i <= longer.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= shorter.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (longer.charAt(i - 1) !== shorter.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[shorter.length] = lastValue;
    }
    return (longer.length - costs[shorter.length]) / parseFloat(longer.length);
  }
}

export const translationService = new TranslationService();
