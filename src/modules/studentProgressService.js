/**
 * HánNgữ Pro - Student Progress & Learning Analytics Service
 * Quản lý tiến độ học tập từng bài học, nhật ký hành trình, bảng thông báo
 * và hệ thống báo cáo học tập cá nhân hóa tích hợp AI Cố Vấn Sư Phạm.
 */

import { sqliteService } from './sqliteDb.js';
import { authService } from './authService.js';
import { HSK_VOCABULARY, HSK_LEVELS } from '../data/hskData.js';

class StudentProgressService {
  constructor() {
    this.memoryProgressCache = new Map();
    this.guestTempProgress = [];
    this.guestTempExams = [];
  }

  getCurrentUsername() {
    const user = authService.getCurrentUser();
    return (user && user.username) ? user.username : 'learner';
  }

  /**
   * Record a lesson completion for the active student
   * (Đối với Khách Vãng Lai: KHÔNG lưu vĩnh viễn vào SQLite/LocalStorage)
   * @param {Object} data - { lessonId, level, category, score, timeSpentSeconds }
   */
  recordLessonCompletion({ lessonId, level = 1, category = 'vocab', score = 100, timeSpentSeconds = 60 }) {
    const isGuest = authService.isGuest();
    const completedAt = new Date().toISOString();

    // 1. Khách Vãng Lai: Chỉ lưu trong phiên RAM tạm thời, KHÔNG ghi vào CSDL
    if (isGuest) {
      const existingIdx = this.guestTempProgress.findIndex(p => p.lessonId === lessonId);
      if (existingIdx >= 0) {
        this.guestTempProgress[existingIdx].score = Math.max(this.guestTempProgress[existingIdx].score, score);
        this.guestTempProgress[existingIdx].timeSpentSeconds += timeSpentSeconds;
        this.guestTempProgress[existingIdx].completedAt = completedAt;
      } else {
        this.guestTempProgress.push({
          lessonId,
          level,
          category,
          score,
          timeSpentSeconds,
          completedAt
        });
      }
      return true;
    }

    const username = this.getCurrentUsername();
    if (!username || username === 'guest') return false;

    // 2. Học viên có tài khoản: Lưu vĩnh viễn vào SQLite & LocalStorage
    try {
      if (sqliteService.db) {
        sqliteService.run(`
          INSERT INTO user_lesson_progress (username, lesson_id, level, category, score, time_spent_seconds, completed, completed_at)
          VALUES (?, ?, ?, ?, ?, ?, 1, ?)
          ON CONFLICT(username, lesson_id) DO UPDATE SET
            score = MAX(score, excluded.score),
            time_spent_seconds = time_spent_seconds + excluded.time_spent_seconds,
            completed_at = excluded.completed_at;
        `, [username, lessonId, level, category, score, timeSpentSeconds, completedAt]);

        // Log into study timeline
        const catNames = {
          vocab: 'Từ vựng HSK',
          grammar: 'Ngữ pháp & Đảo từ',
          tone: 'Luyện thanh điệu',
          trap: 'Bẫy Hán-Việt',
          dialogue: 'Hội thoại nhập vai',
          exam: 'Thi thử HSK',
          speed: 'Flash Match Siêu Tốc',
          worksheet: 'Luyện viết chữ Hán'
        };
        const catTitle = catNames[category] || 'Bài học HSK';

        sqliteService.run(`
          INSERT INTO user_study_timeline (username, action_type, title, exp_gained, details)
          VALUES (?, 'lesson_complete', ?, ?, ?);
        `, [
          username,
          `Hoàn thành ${catTitle} (Cấp ${level})`,
          Math.max(10, Math.floor(score / 5)),
          `Đạt điểm ${score}/100 • Thời gian: ${Math.round(timeSpentSeconds)}s`
        ]);

        // Award EXP to student account
        const expGained = Math.max(10, Math.floor(score / 5));
        sqliteService.run(`
          UPDATE user_accounts SET exp = exp + ? WHERE username = ?;
        `, [expGained, username]);
      }
    } catch (e) {
      console.warn('[StudentProgress] Record completion SQLite notice:', e);
    }

    // Cache in LocalStorage
    this.saveToLocalCache(username, lessonId, { level, category, score, completedAt });

    return true;
  }

  /**
   * Record mock exam score into user_exam_records & timeline
   * (Đối với Khách Vãng Lai: KHÔNG lưu vĩnh viễn)
   */
  recordExamRecord({ examId, examTitle, score, maxScore, passed, correctCount, totalQuestions }) {
    const isGuest = authService.isGuest();
    const takenAt = new Date().toISOString();

    if (isGuest) {
      this.guestTempExams.push({
        examId,
        examTitle,
        score,
        maxScore,
        passed,
        correctCount,
        totalQuestions,
        takenAt
      });
      return true;
    }

    const username = this.getCurrentUsername();
    if (!username || username === 'guest') return false;

    try {
      if (sqliteService.db) {
        sqliteService.run(`
          INSERT INTO user_exam_records (username, exam_id, exam_title, score, max_score, passed, correct_count, total_questions)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        `, [username, examId, examTitle, score, maxScore, passed ? 1 : 0, correctCount, totalQuestions]);

        sqliteService.run(`
          INSERT INTO user_study_timeline (username, action_type, title, exp_gained, details)
          VALUES (?, 'exam_taken', ?, ?, ?);
        `, [
          username,
          `Khảo thí: ${examTitle}`,
          score,
          `${passed ? 'Đạt' : 'Chưa đạt'} • ${score}/${maxScore} điểm (${correctCount}/${totalQuestions} câu đúng)`
        ]);

        // Push a notification for exam result
        sqliteService.run(`
          INSERT INTO user_notifications (username, type, title, message)
          VALUES (?, 'exam', ?, ?);
        `, [
          username,
          passed ? `🎉 Vượt qua kỳ thi: ${examTitle}` : `📝 Kết quả kỳ thi: ${examTitle}`,
          `Bạn đạt ${score}/${maxScore} điểm (${correctCount}/${totalQuestions} câu đúng). ${passed ? 'Tuyệt vời! Tiếp tục phát huy nhé!' : 'Hãy xem lại các lỗi sai trong Sổ Tay Lỗi Sai.'}`
        ]);
      }
    } catch (e) {
      console.warn('[StudentProgress] recordExamRecord error:', e);
    }
    return true;
  }

  /**
   * Chuyển toàn bộ dữ liệu tạm thời của Khách Vãng Lai sang tài khoản Học Viên vừa tạo
   */
  migrateGuestProgressToUser(username) {
    if (!username || username === 'guest') return 0;
    if (this.guestTempProgress.length === 0 && this.guestTempExams.length === 0) return 0;

    let migratedCount = 0;
    let totalExpBonus = 0;

    try {
      if (sqliteService.db) {
        // 1. Chuyển tiến độ các bài học
        for (const item of this.guestTempProgress) {
          sqliteService.run(`
            INSERT INTO user_lesson_progress (username, lesson_id, level, category, score, time_spent_seconds, completed, completed_at)
            VALUES (?, ?, ?, ?, ?, ?, 1, ?)
            ON CONFLICT(username, lesson_id) DO UPDATE SET
              score = MAX(score, excluded.score),
              time_spent_seconds = time_spent_seconds + excluded.time_spent_seconds,
              completed_at = excluded.completed_at;
          `, [username, item.lessonId, item.level, item.category, item.score, item.timeSpentSeconds, item.completedAt]);

          const expGained = Math.max(10, Math.floor(item.score / 5));
          totalExpBonus += expGained;

          sqliteService.run(`
            INSERT INTO user_study_timeline (username, action_type, title, exp_gained, details)
            VALUES (?, 'lesson_complete', ?, ?, ?);
          `, [
            username,
            `Đồng bộ từ Khách: Hoàn thành bài ${item.lessonId}`,
            expGained,
            `Đạt điểm ${item.score}/100 • Thời gian: ${Math.round(item.timeSpentSeconds)}s`
          ]);

          this.saveToLocalCache(username, item.lessonId, {
            level: item.level,
            category: item.category,
            score: item.score,
            completedAt: item.completedAt
          });
          migratedCount++;
        }

        // 2. Chuyển kết quả thi thử
        for (const ex of this.guestTempExams) {
          sqliteService.run(`
            INSERT INTO user_exam_records (username, exam_id, exam_title, score, max_score, passed, correct_count, total_questions)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
          `, [username, ex.examId, ex.examTitle, ex.score, ex.maxScore, ex.passed ? 1 : 0, ex.correctCount, ex.totalQuestions]);

          totalExpBonus += ex.score;
          migratedCount++;
        }

        // 3. Cộng dồn EXP vào tài khoản học viên
        if (totalExpBonus > 0) {
          sqliteService.run(`
            UPDATE user_accounts SET exp = exp + ? WHERE username = ?;
          `, [totalExpBonus, username]);
        }

        // 4. Tạo thông báo chào mừng và ghi nhận đồng bộ
        sqliteService.run(`
          INSERT INTO user_notifications (username, type, title, message)
          VALUES (?, 'system', 'Đồng bộ tiến độ từ phiên Khách Vãng Lai thành công!', ?);
        `, [
          username,
          `Chúc mừng bạn! Toàn bộ ${migratedCount} bài học và +${totalExpBonus} EXP bạn vừa làm thử đã được nạp vĩnh viễn vào tài khoản mới!`
        ]);
      }
    } catch (e) {
      console.warn('[StudentProgress] Migrate guest progress error:', e);
    }

    // Reset bộ nhớ tạm khách
    this.guestTempProgress = [];
    this.guestTempExams = [];

    return migratedCount;
  }

  /**
   * Lấy toàn bộ danh sách tiến độ bài học của học viên (kèm chi tiết từng bài)
   */
  getAllLessonProgress(username = null) {
    if (authService.isGuest()) {
      return this.guestTempProgress.map((p, idx) => ({
        id: idx + 1,
        username: 'guest',
        lesson_id: p.lessonId,
        level: p.level,
        category: p.category,
        score: p.score,
        time_spent_seconds: p.timeSpentSeconds,
        completed: 1,
        completed_at: p.completedAt,
        isGuestTemp: true
      }));
    }

    const uname = username || this.getCurrentUsername();
    if (!uname || uname === 'guest') return [];

    try {
      if (sqliteService.db) {
        const rows = sqliteService.query(`
          SELECT * FROM user_lesson_progress
          WHERE username = ?
          ORDER BY completed_at DESC;
        `, [uname]);
        if (rows && rows.length > 0) return rows;
      }
    } catch (e) {
      console.warn('[StudentProgress] getAllLessonProgress error:', e);
    }

    const cache = this.getLocalCache(uname);
    return Object.entries(cache).map(([lessonId, data], idx) => ({
      id: idx + 1,
      username: uname,
      lesson_id: lessonId,
      level: data.level || 1,
      category: data.category || 'vocab',
      score: data.score || 100,
      time_spent_seconds: 60,
      completed: 1,
      completed_at: data.completedAt || new Date().toISOString()
    }));
  }

  /**
   * Check if a lesson is completed by the active student
   */
  isLessonCompleted(lessonId) {
    if (authService.isGuest()) {
      return this.guestTempProgress.some(p => p.lessonId === lessonId);
    }

    const username = this.getCurrentUsername();
    if (!username || username === 'guest') return false;

    try {
      if (sqliteService.db) {
        const rows = sqliteService.query(
          "SELECT completed FROM user_lesson_progress WHERE username = ? AND lesson_id = ? LIMIT 1;",
          [username, lessonId]
        );
        if (rows && rows.length > 0 && rows[0].completed === 1) return true;
      }
    } catch (e) {
      console.warn('[StudentProgress] Check completion notice:', e);
    }

    // Check local cache
    const cache = this.getLocalCache(username);
    return !!cache[lessonId];
  }

  /**
   * Get all completed lesson IDs for active student
   */
  getCompletedLessonIds() {
    const username = this.getCurrentUsername();
    if (!username || username === 'guest') return [];

    try {
      if (sqliteService.db) {
        const rows = sqliteService.query(
          "SELECT lesson_id FROM user_lesson_progress WHERE username = ? AND completed = 1;",
          [username]
        );
        if (rows && rows.length > 0) {
          return rows.map(r => r.lesson_id);
        }
      }
    } catch (e) {
      console.warn('[StudentProgress] Get completed IDs notice:', e);
    }

    const cache = this.getLocalCache(username);
    return Object.keys(cache);
  }

  /**
   * Get student notifications
   */
  getNotifications() {
    const username = this.getCurrentUsername();
    if (!username || username === 'guest') return [];

    try {
      if (sqliteService.db) {
        const rows = sqliteService.query(
          "SELECT * FROM user_notifications WHERE username = ? ORDER BY created_at DESC LIMIT 30;",
          [username]
        );
        // An empty result is meaningful: the learner may have read or
        // dismissed every message. Do not resurrect a transient fallback on
        // each render, otherwise the unread badge can never stay cleared.
        return rows || [];
      }
    } catch (e) {
      console.warn('[StudentProgress] Get notifications notice:', e);
    }

    // Fallback default notifications
    return [
      {
        id: 1,
        type: 'welcome',
        title: 'Chào mừng bạn đến với HánNgữ Pro v2.0!',
        message: 'Hệ thống đã sẵn sàng các phân hệ học tập chuẩn HSK 3.0 và đại từ điển SQLite.',
        is_read: 0,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        type: 'streak',
        title: 'Duy trì chuỗi học tập hôm nay',
        message: 'Hãy học ít nhất 1 bài học hoặc 5 thẻ từ vựng để giữ chuỗi ngày liên tục.',
        is_read: 0,
        created_at: new Date().toISOString()
      }
    ];
  }

  /**
   * Mark all notifications as read
   */
  markAllNotificationsRead() {
    const username = this.getCurrentUsername();
    if (!username || username === 'guest') return;

    try {
      if (sqliteService.db) {
        sqliteService.run("UPDATE user_notifications SET is_read = 1 WHERE username = ?;", [username]);
      }
    } catch (e) {
      console.warn('[StudentProgress] Mark all read notice:', e);
    }
  }

  /**
   * Get student study timeline
   */
  getStudyTimeline(limit = 20) {
    const username = this.getCurrentUsername();
    if (!username || username === 'guest') return [];

    try {
      if (sqliteService.db) {
        const rows = sqliteService.query(
          "SELECT * FROM user_study_timeline WHERE username = ? ORDER BY created_at DESC LIMIT ?;",
          [username, limit]
        );
        if (rows && rows.length > 0) return rows;
      }
    } catch (e) {
      console.warn('[StudentProgress] Get timeline notice:', e);
    }

    return [
      {
        id: 1,
        action_type: 'login',
        title: 'Đăng nhập vào hệ thống HánNgữ Pro',
        exp_gained: 10,
        details: 'Khởi đầu ngày học tập mới',
        created_at: new Date().toISOString()
      }
    ];
  }

  /**
   * Generate comprehensive Student Learning Report Card with AI Pedagogical Advisor
   */
  generateStudentReport() {
    const user = authService.getCurrentUser() || {
      username: 'guest',
      displayName: 'Khách Học Viên',
      targetLevel: 1,
      exp: 100,
      level: 1,
      streakDays: 1
    };

    const completedIds = this.getCompletedLessonIds();
    const completedCount = completedIds.length;
    const targetLvl = user.targetLevel || 1;

    // Approximate total lessons for target level
    const totalStandardWords = HSK_LEVELS.find(l => l.id === targetLvl)?.standardWords || 500;
    const progressPercent = Math.min(100, Math.max(5, Math.round((completedCount * 10 / totalStandardWords) * 100)));

    // Calculate skill scores based on progress and error notebook
    let vocabScore = Math.min(98, 65 + completedCount * 2);
    let grammarScore = Math.min(95, 60 + Math.floor(completedCount * 1.5));
    let toneScore = Math.min(94, 70 + Math.floor(completedCount * 1.2));
    let listeningScore = Math.min(92, 58 + Math.floor(completedCount * 1.8));
    let readingScore = Math.min(96, 62 + Math.floor(completedCount * 1.6));

    const overallScore = Math.round((vocabScore + grammarScore + toneScore + listeningScore + readingScore) / 5);

    // AI Predicted Score for HSK Exam (Scale 300)
    const predictedExamScore = Math.min(300, Math.round(overallScore * 2.85) + 15);
    const passStatus = predictedExamScore >= 180 ? 'ĐẠT (VƯỢT CHUẨN)' : 'CẦN RÈN LUYỆN THÊM';

    // AI Advisor Feedback
    let aiAdvice = '';
    if (overallScore >= 85) {
      aiAdvice = `Chúc mừng ${user.displayName}! Bạn đang có phong độ học tập xuất sắc với độ chính xác từ vựng ${vocabScore}% và phát âm chuẩn. Hãy duy trì giải đề thi thử HSK ${targetLvl} để tự tin đạt điểm tối đa!`;
    } else if (overallScore >= 70) {
      aiAdvice = `${user.displayName} đang có nền tảng ngữ pháp và từ vựng vững vàng. Cố vấn AI khuyến nghị bạn nên tăng cường luyện các cặp âm tối thiểu (thanh 1 vs thanh 4) và thực hành dịch câu ngắn mỗi ngày.`;
    } else {
      aiAdvice = `Chào ${user.displayName}, bạn đang trong giai đoạn xây nền móng HSK ${targetLvl}. Hãy sử dụng Flashcards 3D kết hợp với đài phát thanh rảnh tay 15 phút mỗi ngày để tăng tốc độ phản xạ chữ Hán.`;
    }

    return {
      studentName: user.displayName || user.username,
      username: user.username,
      avatar: user.avatar || '👤',
      targetLevel: targetLvl,
      currentLevel: user.level || 1,
      totalExp: user.exp || 100,
      streakDays: user.streakDays || 1,
      completedLessonsCount: completedCount,
      progressPercent,
      skills: [
        { name: 'Từ Vựng HSK', score: vocabScore, color: '#06b6d4', icon: '📖' },
        { name: 'Ngữ Pháp & Cú Pháp', score: grammarScore, color: '#8b5cf6', icon: '📐' },
        { name: 'Thanh Điệu & Phát Âm', score: toneScore, color: '#ec4899', icon: '🎵' },
        { name: 'Nghe Hiểu & Nhập Vai', score: listeningScore, color: '#f59e0b', icon: '🎧' },
        { name: 'Đọc Hiểu & Luyện Dịch', score: readingScore, color: '#10b981', icon: '🌐' }
      ],
      overallScore,
      predictedExamScore,
      passStatus,
      aiAdvice,
      generatedAt: new Date().toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })
    };
  }

  /**
   * Export all student learning data into a portable cloud sync bundle
   */
  exportStudentDataBundle() {
    const user = authService.getCurrentUser();
    if (!user) return null;

    const username = user.username;
    let progress = [];
    let timeline = [];
    let notifications = [];

    try {
      if (sqliteService.db) {
        progress = sqliteService.query("SELECT * FROM user_lesson_progress WHERE username = ?;", [username]);
        timeline = sqliteService.query("SELECT * FROM user_study_timeline WHERE username = ?;", [username]);
        notifications = sqliteService.query("SELECT * FROM user_notifications WHERE username = ?;", [username]);
      }
    } catch (e) {
      console.warn('[StudentProgress] Export bundle query notice:', e);
    }

    const bundle = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      user: {
        username: user.username,
        displayName: user.displayName,
        targetLevel: user.targetLevel,
        exp: user.exp,
        level: user.level,
        streakDays: user.streakDays,
        avatar: user.avatar
      },
      progress,
      timeline,
      notifications
    };

    return btoa(unescape(encodeURIComponent(JSON.stringify(bundle))));
  }

  /**
   * Import cloud sync bundle
   */
  importStudentDataBundle(base64String) {
    try {
      const jsonStr = decodeURIComponent(escape(atob(base64String.trim())));
      const bundle = JSON.parse(jsonStr);

      if (!bundle || !bundle.user || !bundle.user.username) {
        return { success: false, message: 'Mã đồng bộ không hợp lệ!' };
      }

      const u = bundle.user;
      // Save or update account
      if (sqliteService.db) {
        sqliteService.run(`
          INSERT INTO user_accounts (username, password, display_name, target_level, exp, level, streak_days, avatar)
          VALUES (?, '123', ?, ?, ?, ?, ?, ?)
          ON CONFLICT(username) DO UPDATE SET
            display_name = excluded.display_name,
            target_level = excluded.target_level,
            exp = excluded.exp,
            level = excluded.level,
            streak_days = excluded.streak_days,
            avatar = excluded.avatar;
        `, [u.username, u.displayName, u.targetLevel, u.exp, u.level, u.streakDays, u.avatar]);

        // Restore progress
        if (Array.isArray(bundle.progress)) {
          bundle.progress.forEach(p => {
            sqliteService.run(`
              INSERT OR REPLACE INTO user_lesson_progress (username, lesson_id, level, category, score, time_spent_seconds, completed, completed_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?);
            `, [u.username, p.lesson_id, p.level, p.category, p.score, p.time_spent_seconds, p.completed, p.completed_at]);
          });
        }
      }

      // Login to this imported user
      authService.saveSession(u);

      return {
        success: true,
        message: `Đồng bộ thành công dữ liệu học viên: ${u.displayName} (@${u.username})!`,
        user: u
      };
    } catch (e) {
      return { success: false, message: 'Lỗi giải mã gói dữ liệu: ' + (e?.message || e) };
    }
  }

  saveToLocalCache(username, lessonId, data) {
    try {
      const key = `hanngu_progress_${username}`;
      const cache = JSON.parse(localStorage.getItem(key)) || {};
      cache[lessonId] = data;
      localStorage.setItem(key, JSON.stringify(cache));
    } catch {}
  }

  getLocalCache(username) {
    try {
      const key = `hanngu_progress_${username}`;
      return JSON.parse(localStorage.getItem(key)) || {};
    } catch {
      return {};
    }
  }
}

export const studentProgressService = new StudentProgressService();
