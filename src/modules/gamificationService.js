/**
 * HánNgữ Pro - Gamification, Badges & National Leaderboard Service
 * Hệ thống huy hiệu thành tựu, bảng xếp hạng thi đua phân hạng giải đấu
 * và chuỗi nhiệm vụ thử thách hàng ngày.
 */

import { storageService } from './storageService.js';
import { sqliteService } from './sqliteDb.js';

export const BADGES_CONFIG = [
  {
    id: 'badge_first_step',
    title: 'Khởi Đầu Nan',
    icon: '🌱',
    description: 'Bắt đầu bài học đầu tiên và đạt 100 EXP',
    reqType: 'exp',
    reqValue: 100
  },
  {
    id: 'badge_tone_master',
    title: 'Đại Sư Thanh Điệu',
    icon: '🎵',
    description: 'Luyện tập các cặp âm tối thiểu và phân biệt thanh 1-4',
    reqType: 'tones',
    reqValue: 5
  },
  {
    id: 'badge_khanghy_scholar',
    title: 'Học Giả Khang Hy',
    icon: '📜',
    description: 'Tra cứu và nghiên cứu chiết tự trên 30 bộ thủ Khang Hy',
    reqType: 'radicals',
    reqValue: 30
  },
  {
    id: 'badge_srs_knight',
    title: 'Kỵ Sĩ Ký Ức SRS',
    icon: '🧠',
    description: 'Ôn tập 20 lượt thẻ từ vựng theo thuật toán SuperMemo SM-2',
    reqType: 'srs',
    reqValue: 20
  },
  {
    id: 'badge_speech_ace',
    title: 'Phát Âm Chuẩn Bản Xứ',
    icon: '🎙️',
    description: 'Đạt điểm nhận diện giọng nói AI từ 90 điểm trở lên',
    reqType: 'speech',
    reqValue: 90
  },
  {
    id: 'badge_hsk_warrior',
    title: 'Chiến Binh Khảo Thí',
    icon: '📝',
    description: 'Hoàn thành bài thi thử chuẩn hóa trong phòng thi HSK',
    reqType: 'exam',
    reqValue: 1
  },
  {
    id: 'badge_hanzi_artist',
    title: 'Bút Lực Thần Kỳ',
    icon: '✍️',
    description: 'Viết thành công các nét cơ bản trên lưới 米字格',
    reqType: 'canvas',
    reqValue: 5
  },
  {
    id: 'badge_speed_reader',
    title: 'Tốc Độc Thần Điêu',
    icon: '⚡',
    description: 'Đọc hiểu nhanh đoạn văn HSK với tốc độ > 150 ký tự/phút',
    reqType: 'speed',
    reqValue: 1
  },
  {
    id: 'badge_vocab_titan',
    title: 'Kho Tàng Vạn Chữ',
    icon: '📚',
    description: 'Tích lũy vốn từ đạt trên 500 từ vựng trong Đại Từ Điển',
    reqType: 'dict',
    reqValue: 500
  },
  {
    id: 'badge_streak_fire',
    title: 'Ngọn Lửa Bất Diệt',
    icon: '🔥',
    description: 'Duy trì chuỗi học liên tục (Streak) từ 7 ngày trở lên',
    reqType: 'streak',
    reqValue: 7
  },
  {
    id: 'badge_puzzle_master',
    title: 'Bậc Thầy Ghép Câu',
    icon: '🧩',
    description: 'Ghép đúng 5 câu văn HSK không mắc lỗi ngữ pháp',
    reqType: 'puzzle',
    reqValue: 5
  },
  {
    id: 'badge_sqlite_architect',
    title: 'Kiến Trúc Sư SQLite',
    icon: '💾',
    description: 'Xuất bản sao lưu cơ sở dữ liệu SQLite chuẩn .sqlite',
    reqType: 'db',
    reqValue: 1
  }
];

class GamificationService {
  constructor() {
    this.storageKey = 'hanngu_unlocked_badges';
  }

  /**
   * Get user badges with unlock status
   */
  getBadges() {
    const profile = storageService.getProfile();
    let unlockedIds = [];
    try {
      unlockedIds = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    } catch (e) {
      unlockedIds = [];
    }

    return BADGES_CONFIG.map(b => {
      let isUnlocked = unlockedIds.includes(b.id);
      let progress = 0;

      // Auto-unlock based on current profile metrics
      if (b.reqType === 'exp') {
        progress = Math.min(100, Math.round((profile.exp / b.reqValue) * 100));
        if (profile.exp >= b.reqValue) isUnlocked = true;
      } else if (b.reqType === 'streak') {
        progress = Math.min(100, Math.round((profile.streakDays / b.reqValue) * 100));
        if (profile.streakDays >= b.reqValue) isUnlocked = true;
      } else if (isUnlocked) {
        progress = 100;
      }

      if (isUnlocked && !unlockedIds.includes(b.id)) {
        unlockedIds.push(b.id);
        localStorage.setItem(this.storageKey, JSON.stringify(unlockedIds));
      }

      return {
        ...b,
        unlocked: isUnlocked,
        progress: isUnlocked ? 100 : progress
      };
    });
  }

  /**
   * Explicitly unlock a badge
   */
  unlockBadge(badgeId) {
    let unlocked = [];
    try {
      unlocked = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    } catch (e) {
      unlocked = [];
    }

    if (!unlocked.includes(badgeId)) {
      unlocked.push(badgeId);
      localStorage.setItem(this.storageKey, JSON.stringify(unlocked));
      storageService.addExp(50); // Bonus 50 EXP
      return true;
    }
    return false;
  }

  /**
   * Get national leaderboard data with realistic peer learners
   */
  getLeaderboard() {
    const profile = storageService.getProfile();
    const userExp = profile.exp || 240;

    const peerLearners = [
      { id: 'p1', name: 'Trần Minh Đức', city: 'Hà Nội', exp: Math.max(userExp + 620, 1850), streak: 28, level: 6, avatar: 'M' },
      { id: 'p2', name: 'Nguyễn Thảo Linh', city: 'TP. Hồ Chí Minh', exp: Math.max(userExp + 380, 1420), streak: 21, level: 5, avatar: 'L' },
      { id: 'p3', name: 'Lê Hoàng Long', city: 'Đà Nẵng', exp: Math.max(userExp + 190, 1180), streak: 15, level: 4, avatar: 'H' },
      { id: 'p4', name: 'Phạm Thu Trang', city: 'Hải Phòng', exp: Math.max(userExp + 50, 890), streak: 12, level: 4, avatar: 'T' },
      { id: 'p5', name: 'Vũ Quốc Bảo', city: 'Cần Thơ', exp: Math.max(userExp - 40, 680), streak: 8, level: 3, avatar: 'B' },
      { id: 'p6', name: 'Đỗ Quỳnh Anh', city: 'Huế', exp: Math.max(userExp - 110, 520), streak: 6, level: 3, avatar: 'Q' },
      { id: 'p7', name: 'Bùi Gia Huy', city: 'Nha Trang', exp: Math.max(userExp - 180, 410), streak: 5, level: 2, avatar: 'G' },
      { id: 'p8', name: 'Hoàng Yến Nhi', city: 'Bình Dương', exp: Math.max(userExp - 260, 310), streak: 4, level: 2, avatar: 'Y' }
    ];

    // Insert current user into ranking
    const currentUserEntry = {
      id: 'current_user',
      name: `${profile.name} (Bạn)`,
      city: 'Việt Nam',
      exp: userExp,
      streak: profile.streakDays || 5,
      level: profile.targetLevel || 1,
      isCurrentUser: true,
      avatar: profile.name.charAt(0) || 'B'
    };

    const all = [...peerLearners, currentUserEntry].sort((a, b) => b.exp - a.exp);

    return all.map((item, index) => ({
      ...item,
      rank: index + 1,
      league: this.getLeague(item.exp)
    }));
  }

  getLeague(exp) {
    if (exp >= 1500) return { name: 'Thách Đấu', color: '#ef4444', icon: '👑' };
    if (exp >= 1000) return { name: 'Kim Cương', color: '#06b6d4', icon: '💎' };
    if (exp >= 600) return { name: 'Bạch Kim', color: '#8b5cf6', icon: '🏆' };
    if (exp >= 300) return { name: 'Vàng', color: '#f59e0b', icon: '🥇' };
    return { name: 'Bạc', color: '#10b981', icon: '🥈' };
  }

  /**
   * Get dynamic daily quests
   */
  getDailyQuests() {
    const today = new Date().toISOString().split('T')[0];
    const key = `hanngu_quests_${today}`;
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem(key));
    } catch (e) {}

    if (!saved) {
      saved = [
        { id: 'q1', text: 'Ôn tập 5 thẻ từ vựng SRS', target: 5, current: 2, rewardExp: 30, completed: false },
        { id: 'q2', text: 'Thực hành phát âm chuẩn AI 1 lần', target: 1, current: 0, rewardExp: 25, completed: false },
        { id: 'q3', text: 'Luyện viết 1 chữ Hán trên lưới 米字格', target: 1, current: 1, rewardExp: 20, completed: true }
      ];
      localStorage.setItem(key, JSON.stringify(saved));
    }
    return saved;
  }
}

export const gamificationService = new GamificationService();
