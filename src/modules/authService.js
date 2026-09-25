/**
 * HánNgữ Pro v2.0 - Local-First Profile & Learning Management Service
 * Ứng dụng hoàn toàn miễn phí, chạy độc lập trên máy cục bộ của người dùng (Offline-ready, Zero Barrier).
 * Không yêu cầu tài khoản hay mật khẩu: Mở ứng dụng là học ngay tức thì, dữ liệu được tự động lưu bền vững vào SQLite & IndexedDB.
 */

import { sqliteService } from './sqliteDb.js';
import { storageService } from './storageService.js';

const PROFILE_STORAGE_KEY = 'hanngu_user_local_profile';

export class AuthService {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  async init() {
    this.loadProfileFromStorage();
    this.initDatabaseTable();
  }

  initDatabaseTable() {
    try {
      if (!sqliteService.isReady) {
        sqliteService.ensureReady().then(() => this.setupSqliteTables());
        return;
      }
      this.setupSqliteTables();
    } catch (e) {
      console.warn('[ProfileService] Init table warning:', e);
    }
  }

  setupSqliteTables() {
    try {
      if (!sqliteService.db) return;

      sqliteService.run(`
        CREATE TABLE IF NOT EXISTS user_accounts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT DEFAULT '',
          role TEXT DEFAULT 'admin',
          display_name TEXT NOT NULL,
          target_level INTEGER DEFAULT 3,
          exp INTEGER DEFAULT 120,
          level INTEGER DEFAULT 1,
          streak_days INTEGER DEFAULT 1,
          avatar TEXT DEFAULT '🎓',
          last_active_date TEXT,
          created_at TEXT DEFAULT (datetime('now', 'localtime'))
        );
      `);

      // Khởi tạo hồ sơ người dùng cục bộ mặc định nếu chưa có
      const today = new Date().toISOString().split('T')[0];
      const rows = sqliteService.query("SELECT * FROM user_accounts WHERE username = 'learner' LIMIT 1;");
      if (!rows || rows.length === 0) {
        sqliteService.run(
          `INSERT INTO user_accounts (username, password, role, display_name, target_level, exp, level, streak_days, avatar, last_active_date)
           VALUES ('learner', '', 'admin', 'Học Viên', 3, 120, 1, 1, '🎓', ?);`,
          [today]
        );
      }
    } catch (e) {
      console.warn('[ProfileService] Setup sqlite tables notice:', e);
    }
  }

  loadProfileFromStorage() {
    try {
      const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (saved) {
        this.currentUser = JSON.parse(saved);
        return;
      }
    } catch {}

    // Hồ sơ mặc định của người học
    this.currentUser = {
      username: 'learner',
      displayName: 'Học Viên',
      role: 'admin', // Người dùng sở hữu toàn quyền trên máy cục bộ của họ
      targetLevel: 3,
      level: 1,
      exp: 120,
      streakDays: 1,
      avatar: '🎓',
      lastActiveDate: new Date().toISOString().split('T')[0],
      isGuest: false
    };
    this.saveProfileToStorage();
  }

  saveProfileToStorage() {
    try {
      if (this.currentUser) {
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(this.currentUser));
      }
    } catch {}
  }

  /**
   * Ứng dụng miễn phí mở hoàn toàn: luôn xác thực thành công để vào học ngay
   */
  isAuthenticated() {
    return true;
  }

  /**
   * Cấp toàn quyền quản trị CSDL SQLite của máy cục bộ cho người dùng
   */
  isAdmin() {
    return true;
  }

  isGuest() {
    return false;
  }

  getCurrentUser() {
    if (!this.currentUser) {
      this.loadProfileFromStorage();
    }
    // Progress is awarded by the local-first storage service (for example by
    // SRS and pronunciation practice). Merge those counters on read so every
    // surface reflects the same learner state immediately.
    const profile = storageService.getProfile() || {};
    this.currentUser.exp = Math.max(0, Number.parseInt(profile.exp ?? this.currentUser.exp, 10) || 0);
    this.currentUser.level = Math.max(1, Number.parseInt(profile.level ?? this.currentUser.level, 10) || 1);
    this.currentUser.streakDays = Math.max(1, Number.parseInt(profile.streakDays ?? this.currentUser.streakDays, 10) || 1);
    this.currentUser.targetLevel = Math.min(9, Math.max(1, Number.parseInt(profile.targetLevel ?? this.currentUser.targetLevel, 10) || 1));
    this.currentUser.lastActiveDate = profile.lastActiveDate || this.currentUser.lastActiveDate;
    return this.currentUser;
  }

  /**
   * Restore a local profile from an exported/imported bundle. Kept as a
   * public compatibility method because the student progress importer calls
   * it after restoring SQLite lesson rows.
   */
  saveSession(user = {}) {
    const current = this.getCurrentUser() || {};
    this.currentUser = {
      ...current,
      ...user,
      username: String(user.username || current.username || 'learner'),
      displayName: String(user.displayName || user.name || current.displayName || 'Học Viên').trim() || 'Học Viên',
      targetLevel: Math.min(9, Math.max(1, Number.parseInt(user.targetLevel ?? current.targetLevel, 10) || 1)),
      exp: Math.max(0, Number.parseInt(user.exp ?? current.exp, 10) || 0),
      level: Math.max(1, Number.parseInt(user.level ?? current.level, 10) || 1),
      streakDays: Math.max(1, Number.parseInt(user.streakDays ?? current.streakDays, 10) || 1),
      avatar: user.avatar || current.avatar || '🎓',
      lastActiveDate: user.lastActiveDate || current.lastActiveDate || new Date().toISOString().split('T')[0],
      isGuest: false
    };
    this.saveProfileToStorage();
    storageService.saveProfile({
      name: this.currentUser.displayName,
      targetLevel: this.currentUser.targetLevel,
      exp: this.currentUser.exp,
      level: this.currentUser.level,
      streakDays: this.currentUser.streakDays,
      lastActiveDate: this.currentUser.lastActiveDate
    });
    if (sqliteService.db) {
      sqliteService.run(
        `UPDATE user_accounts
         SET display_name = ?, target_level = ?, exp = ?, level = ?, streak_days = ?, avatar = ?, last_active_date = ?
         WHERE username = ?;`,
        [this.currentUser.displayName, this.currentUser.targetLevel, this.currentUser.exp, this.currentUser.level, this.currentUser.streakDays, this.currentUser.avatar, this.currentUser.lastActiveDate, this.currentUser.username]
      );
    }
    return this.currentUser;
  }

  /**
   * Cập nhật hồ sơ cá nhân hóa (Tên hiển thị, Mục tiêu HSK, Biểu tượng Avatar) - Không cần mật khẩu
   */
  updateProfile({ displayName, targetLevel, avatar }) {
    if (!this.currentUser) {
      this.loadProfileFromStorage();
    }

    if (displayName && displayName.trim()) {
      this.currentUser.displayName = displayName.trim();
    }
    if (targetLevel) {
      this.currentUser.targetLevel = parseInt(targetLevel, 10) || 3;
    }
    if (avatar) {
      this.currentUser.avatar = avatar;
    }

    this.saveProfileToStorage();

    // Đồng bộ vào storageService của app
    storageService.saveProfile({
      name: this.currentUser.displayName,
      targetLevel: this.currentUser.targetLevel,
      exp: this.currentUser.exp || 120,
      level: this.currentUser.level || 1,
      streakDays: this.currentUser.streakDays || 1,
      avatar: this.currentUser.avatar || '🎓'
    });

    // Đồng bộ vào CSDL SQLite cục bộ
    try {
      if (sqliteService.db) {
        sqliteService.run(
          `UPDATE user_accounts SET display_name = ?, target_level = ?, avatar = ? WHERE username = ?;`,
          [this.currentUser.displayName, this.currentUser.targetLevel, this.currentUser.avatar, this.currentUser.username]
        );
      }
    } catch (e) {
      console.warn('[ProfileService] Update SQLite notice:', e);
    }

    return {
      success: true,
      message: 'Đã cập nhật hồ sơ cá nhân thành công!',
      user: this.currentUser
    };
  }

  /**
   * Các hàm tương thích ngược (nếu có module khác gọi đến)
   */
  login(credentials) {
    return { success: true, message: 'Đăng nhập thành công!', user: this.currentUser };
  }

  register(data) {
    if (data.displayName) {
      this.updateProfile({ displayName: data.displayName, targetLevel: data.targetLevel });
    }
    return { success: true, message: 'Đã lưu thông tin người học!', user: this.currentUser };
  }

  loginAsGuest() {
    return { success: true, user: this.currentUser };
  }

  logout() {
    // Không cần thoát, chỉ thông báo làm mới phiên
    return { success: true, message: 'Đã làm mới phiên học.' };
  }

  getAllUsers() {
    try {
      if (sqliteService.db) {
        return sqliteService.query("SELECT id, username, role, display_name, target_level, exp, level, streak_days, avatar, last_active_date, created_at FROM user_accounts ORDER BY id ASC;");
      }
    } catch {}
    return [this.currentUser];
  }

  adminResetUserPassword() {
    return { success: true, message: 'Ứng dụng chạy cục bộ không sử dụng mật khẩu.' };
  }

  adminDeleteUser() {
    return { success: true, message: 'Thao tác thành công.' };
  }

  adminBroadcastNotification({ title, message, type = 'info' }) {
    try {
      if (sqliteService.db) {
        sqliteService.run(
          "INSERT INTO user_notifications (username, type, title, message, is_read) VALUES (?, ?, ?, ?, 0);",
          [this.currentUser.username, type, title, message]
        );
      }
      return { success: true, message: 'Đã phát sóng thông báo học tập thành công!' };
    } catch (e) {
      return { success: false, message: 'Lỗi phát thông báo: ' + e.message };
    }
  }
}

export const authService = new AuthService();
export default authService;
