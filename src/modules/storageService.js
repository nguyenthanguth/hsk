/**
 * HánNgữ Pro - Storage Service with SQLite Integration
 * Đồng bộ hóa dữ liệu người học với SQLite Database quan hệ chuẩn mực,
 * đồng thời giữ bộ đệm nhanh cho render tức thì.
 */

import { sqliteService } from './sqliteDb.js';

const STORAGE_KEYS = {
  USER_PROFILE: 'hanngu_user_profile',
  ERROR_NOTEBOOK: 'hanngu_error_notebook',
  EXAM_HISTORY: 'hanngu_exam_history',
  FAVORITES: 'hanngu_favorites'
};

class StorageService {
  constructor() {
    this.initDefaultData();
    this.syncWithSqlite();
  }

  async syncWithSqlite() {
    await sqliteService.ensureReady();

    // Pull from SQLite to sync memory cache
    const userRow = sqliteService.query("SELECT * FROM users LIMIT 1;")[0];
    if (userRow) {
      const profile = {
        name: userRow.name,
        targetLevel: userRow.target_level,
        exp: userRow.exp,
        level: userRow.level,
        streakDays: userRow.streak_days,
        lastActiveDate: userRow.last_active_date || new Date().toISOString().split('T')[0]
      };
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    }

    const errorRows = sqliteService.query("SELECT * FROM error_notebook ORDER BY updated_at DESC;");
    if (errorRows.length > 0) {
      const mapped = errorRows.map(r => ({
        id: r.id,
        title: r.title,
        category: r.category,
        categoryName: r.category_name,
        mistakeNote: r.mistake_note,
        correction: r.correction,
        exampleSentence: r.example_sentence,
        errorCount: r.error_count,
        masteryLevel: r.mastery_level,
        nextReviewDate: r.next_review_date,
        timestamp: new Date(r.created_at).getTime()
      }));
      localStorage.setItem(STORAGE_KEYS.ERROR_NOTEBOOK, JSON.stringify(mapped));
    }
  }

  initDefaultData() {
    if (!localStorage.getItem(STORAGE_KEYS.USER_PROFILE)) {
      const defaultProfile = {
        name: 'Học Viên Xuất Sắc',
        targetLevel: 1,
        exp: 240,
        level: 3,
        streakDays: 5,
        lastActiveDate: new Date().toISOString().split('T')[0],
        completedLessons: ['hsk1_vocab_1', 'trap_1', 'pair_1'],
        toneAccuracyRate: 88,
        theme: 'dark'
      };
      this.saveProfile(defaultProfile);
    }

    if (!localStorage.getItem(STORAGE_KEYS.ERROR_NOTEBOOK)) {
      const initialErrors = [
        {
          id: 'err_convenient_01',
          title: '方便 (fāngbiàn)',
          category: 'hanviet_trap',
          categoryName: 'Bẫy Hán-Việt',
          mistakeNote: 'Dịch nhầm thành "phương tiện giao thông"',
          correction: 'Nghĩa đúng: Thuận tiện, tiện lợi / Đi vệ sinh',
          exampleSentence: '你现在说话方便吗？',
          errorCount: 2,
          masteryLevel: 1,
          nextReviewDate: new Date().toISOString().split('T')[0],
          timestamp: Date.now() - 86400000
        },
        {
          id: 'err_tone_maimai',
          title: '买 (mǎi) vs 卖 (mài)',
          category: 'tone',
          categoryName: 'Thanh Điệu',
          mistakeNote: 'Phát âm nhầm thanh 4 (卖 - bán) khi muốn mua đồ',
          correction: '买 là thanh 3 (mǎi - mua, trầm lượn); 卖 là thanh 4 (mài - bán, dứt khoát)',
          exampleSentence: '我想买两斤新鲜苹果。',
          errorCount: 3,
          masteryLevel: 2,
          nextReviewDate: new Date().toISOString().split('T')[0],
          timestamp: Date.now() - 172800000
        }
      ];
      this.saveErrors(initialErrors);
    }

    if (!localStorage.getItem(STORAGE_KEYS.EXAM_HISTORY)) {
      localStorage.setItem(STORAGE_KEYS.EXAM_HISTORY, JSON.stringify([]));
    }

    if (!localStorage.getItem(STORAGE_KEYS.FAVORITES)) {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(['你好', '解决', '关键', '潜移默化', '韬光养晦']));
    }
  }

  getProfile() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : { name: 'Học Viên', level: 1, exp: 0, streakDays: 1, targetLevel: 1 };
    } catch {
      return { name: 'Học Viên', level: 1, exp: 0, streakDays: 1, targetLevel: 1 };
    }
  }

  saveProfile(profile) {
    const previous = this.getProfile();
    const normalized = {
      ...previous,
      ...profile,
      name: String(profile?.name ?? previous.name ?? 'Học Viên').trim() || 'Học Viên',
      targetLevel: Math.min(9, Math.max(1, Number.parseInt(profile?.targetLevel ?? previous.targetLevel, 10) || 1)),
      exp: Math.max(0, Number.parseInt(profile?.exp ?? previous.exp, 10) || 0),
      level: Math.max(1, Number.parseInt(profile?.level ?? previous.level, 10) || 1),
      streakDays: Math.max(1, Number.parseInt(profile?.streakDays ?? previous.streakDays, 10) || 1),
      lastActiveDate: profile?.lastActiveDate || previous.lastActiveDate || new Date().toISOString().split('T')[0]
    };
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(normalized));

    // Save to SQLite
    sqliteService.run(
      "UPDATE users SET name = ?, target_level = ?, exp = ?, level = ?, streak_days = ?, last_active_date = ? WHERE id = 1;",
      [normalized.name, normalized.targetLevel, normalized.exp, normalized.level, normalized.streakDays, normalized.lastActiveDate]
    );
    return normalized;
  }

  addExp(amount) {
    const profile = this.getProfile();
    const gained = Math.max(0, Number.parseInt(amount, 10) || 0);
    const previousLevel = Math.max(1, Number.parseInt(profile.level, 10) || 1);
    profile.exp = Math.max(0, Number.parseInt(profile.exp, 10) || 0) + gained;
    const newLevel = Math.floor(Math.sqrt(profile.exp / 50)) + 1;
    profile.level = newLevel;

    const today = new Date().toISOString().split('T')[0];
    if (profile.lastActiveDate !== today) {
      const previousDate = profile.lastActiveDate ? new Date(`${profile.lastActiveDate}T00:00:00Z`) : null;
      const todayDate = new Date(`${today}T00:00:00Z`);
      const daysSinceActivity = previousDate && !Number.isNaN(previousDate.getTime())
        ? Math.round((todayDate - previousDate) / 86400000)
        : Infinity;
      profile.streakDays = daysSinceActivity === 1
        ? Math.max(1, Number.parseInt(profile.streakDays, 10) || 1) + 1
        : 1;
      profile.lastActiveDate = today;
    }

    this.saveProfile(profile);

    // Log study activity into SQLite
    sqliteService.run(
      "INSERT INTO study_logs (action, exp_gained, notes) VALUES (?, ?, ?);",
      ['Học tập hoàn thành', gained, `Đạt cấp độ ${profile.level}`]
    );

    return { profile, leveledUp: newLevel > previousLevel };
  }

  getErrors() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ERROR_NOTEBOOK);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveErrors(errors) {
    localStorage.setItem(STORAGE_KEYS.ERROR_NOTEBOOK, JSON.stringify(errors));
  }

  recordError(errorItem) {
    const errors = this.getErrors();
    const existingIndex = errors.findIndex(e => e.id === errorItem.id || e.title === errorItem.title);

    const now = new Date().toISOString();
    const today = now.split('T')[0];

    if (existingIndex >= 0) {
      errors[existingIndex].errorCount += 1;
      errors[existingIndex].masteryLevel = Math.max(0, errors[existingIndex].masteryLevel - 1);
      errors[existingIndex].nextReviewDate = today;

      // Update in SQLite
      sqliteService.run(`
        UPDATE error_notebook 
        SET error_count = error_count + 1, mastery_level = MAX(0, mastery_level - 1), next_review_date = ?, updated_at = ?
        WHERE id = ?;
      `, [today, now, errors[existingIndex].id]);
    } else {
      const newErr = {
        id: errorItem.id || 'err_' + Date.now(),
        title: errorItem.title,
        category: errorItem.category || 'vocab',
        categoryName: errorItem.categoryName || 'Từ Vựng',
        mistakeNote: errorItem.mistakeNote || 'Trả lời chưa chính xác',
        correction: errorItem.correction || '',
        exampleSentence: errorItem.exampleSentence || '',
        errorCount: 1,
        masteryLevel: 0,
        nextReviewDate: today,
        timestamp: Date.now()
      };
      errors.unshift(newErr);

      // Insert into SQLite
      sqliteService.run(`
        INSERT OR REPLACE INTO error_notebook (id, title, category, category_name, mistake_note, correction, example_sentence, error_count, mastery_level, next_review_date, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0, ?, ?, ?);
      `, [newErr.id, newErr.title, newErr.category, newErr.categoryName, newErr.mistakeNote, newErr.correction, newErr.exampleSentence, today, now, now]);
    }

    this.saveErrors(errors);
  }

  updateErrorMastery(errorId, isSuccess) {
    const errors = this.getErrors();
    const item = errors.find(e => e.id === errorId);
    if (!item) return;

    if (isSuccess) {
      item.masteryLevel = Math.min(5, (item.masteryLevel || 0) + 1);
      const intervals = [1, 2, 4, 7, 15, 30];
      const daysToAdd = intervals[item.masteryLevel] || 30;
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + daysToAdd);
      item.nextReviewDate = nextDate.toISOString().split('T')[0];
    } else {
      item.masteryLevel = Math.max(0, (item.masteryLevel || 0) - 1);
      item.errorCount += 1;
      item.nextReviewDate = new Date().toISOString().split('T')[0];
    }

    this.saveErrors(errors);

    // Sync with SQLite
    sqliteService.run(`
      UPDATE error_notebook 
      SET mastery_level = ?, error_count = ?, next_review_date = ?, updated_at = datetime('now', 'localtime')
      WHERE id = ?;
    `, [item.masteryLevel, item.errorCount, item.nextReviewDate, errorId]);
  }

  saveExamResult(result) {
    try {
      const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXAM_HISTORY) || '[]');
      const newExam = {
        ...result,
        id: 'res_' + Date.now(),
        date: new Date().toLocaleString('vi-VN')
      };
      history.unshift(newExam);
      localStorage.setItem(STORAGE_KEYS.EXAM_HISTORY, JSON.stringify(history.slice(0, 25)));

      // Save into SQLite
      sqliteService.run(`
        INSERT INTO exam_history (id, exam_title, score, max_score, passed, correct_count, total_questions)
        VALUES (?, ?, ?, ?, ?, ?, ?);
      `, [newExam.id, newExam.examTitle, newExam.score, newExam.maxScore, newExam.passed ? 1 : 0, newExam.correctCount, newExam.totalQuestions]);
    } catch (e) {
      console.error(e);
    }
  }

  getExamHistory() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.EXAM_HISTORY) || '[]');
    } catch {
      return [];
    }
  }

  getFavorites() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES) || '[]');
    } catch {
      return [];
    }
  }

  toggleFavorite(word) {
    const favs = this.getFavorites();
    const index = favs.indexOf(word);
    let isFav = false;
    if (index >= 0) {
      favs.splice(index, 1);
      sqliteService.run("DELETE FROM favorites WHERE hanzi = ?;", [word]);
    } else {
      favs.push(word);
      sqliteService.run("INSERT OR REPLACE INTO favorites (hanzi) VALUES (?);", [word]);
      isFav = true;
    }
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
    return isFav;
  }
}

export const storageService = new StorageService();
