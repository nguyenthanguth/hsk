import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import initSqlJs from 'sql.js';

const SERVER_DIR = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(SERVER_DIR, 'data');
const DB_FILE = path.join(DATA_DIR, 'hanngu.server.sqlite');

const clampInt = (value, min, max, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
};

const levelFromExp = (exp) => Math.floor(Math.sqrt(Math.max(0, exp) / 50)) + 1;

export class ServerDatabase {
  constructor() {
    this.db = null;
    this.saveTimer = null;
    this.savePromise = Promise.resolve();
  }

  async init() {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const SQL = await initSqlJs({
      locateFile: file => fileURLToPath(new URL(`../node_modules/sql.js/dist/${file}`, import.meta.url))
    });

    let savedBinary = null;
    try {
      savedBinary = await fs.readFile(DB_FILE);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }

    this.db = savedBinary?.length ? new SQL.Database(savedBinary) : new SQL.Database();
    this.migrate();
    await this.persist();
    return this;
  }

  migrate() {
    this.db.run(`
      PRAGMA foreign_keys = ON;
      PRAGMA journal_mode = DELETE;
      CREATE TABLE IF NOT EXISTS schema_meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        display_name TEXT NOT NULL DEFAULT 'Học Viên',
        avatar TEXT NOT NULL DEFAULT '🎓',
        target_level INTEGER NOT NULL DEFAULT 1,
        learning_goal TEXT NOT NULL DEFAULT 'conversation',
        theme TEXT NOT NULL DEFAULT 'light',
        exp INTEGER NOT NULL DEFAULT 0,
        level INTEGER NOT NULL DEFAULT 1,
        streak_days INTEGER NOT NULL DEFAULT 1,
        last_active_date TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS sessions (
        token_hash TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at);
      CREATE TABLE IF NOT EXISTS lesson_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        lesson_id TEXT NOT NULL,
        level INTEGER NOT NULL DEFAULT 1,
        category TEXT NOT NULL DEFAULT 'vocab',
        score INTEGER NOT NULL DEFAULT 0,
        time_spent_seconds INTEGER NOT NULL DEFAULT 0,
        completed INTEGER NOT NULL DEFAULT 0,
        completed_at TEXT,
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE(user_id, lesson_id)
      );
      CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON lesson_progress(user_id, updated_at DESC);
      CREATE TABLE IF NOT EXISTS srs_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        hanzi TEXT NOT NULL,
        pinyin TEXT,
        meaning TEXT,
        level INTEGER NOT NULL DEFAULT 1,
        ease_factor REAL NOT NULL DEFAULT 2.5,
        interval_days INTEGER NOT NULL DEFAULT 0,
        repetitions INTEGER NOT NULL DEFAULT 0,
        due_at TEXT NOT NULL,
        correct_count INTEGER NOT NULL DEFAULT 0,
        incorrect_count INTEGER NOT NULL DEFAULT 0,
        last_reviewed_at TEXT,
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE(user_id, hanzi)
      );
      CREATE INDEX IF NOT EXISTS idx_srs_due ON srs_items(user_id, due_at);
      CREATE TABLE IF NOT EXISTS study_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        event_type TEXT NOT NULL,
        entity_id TEXT,
        exp_gained INTEGER NOT NULL DEFAULT 0,
        payload_json TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_study_events_user ON study_events(user_id, created_at DESC);
      INSERT OR REPLACE INTO schema_meta(key, value) VALUES ('schema_version', '1');
    `);
    this.cleanupExpiredSessions();
  }

  query(sql, params = []) {
    const statement = this.db.prepare(sql);
    statement.bind(params);
    const rows = [];
    while (statement.step()) rows.push(statement.getAsObject());
    statement.free();
    return rows;
  }

  queryOne(sql, params = []) {
    return this.query(sql, params)[0] || null;
  }

  run(sql, params = []) {
    this.db.run(sql, params);
    this.schedulePersist();
  }

  transaction(callback) {
    this.db.run('BEGIN TRANSACTION;');
    try {
      const result = callback();
      this.db.run('COMMIT;');
      this.schedulePersist();
      return result;
    } catch (error) {
      try { this.db.run('ROLLBACK;'); } catch {}
      throw error;
    }
  }

  schedulePersist() {
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      this.saveTimer = null;
      this.persist().catch(error => console.error('[Server DB] Persist error:', error));
    }, 150);
  }

  async persist() {
    if (!this.db) return;
    const binary = this.db.export();
    this.savePromise = this.savePromise.then(async () => {
      const tempFile = `${DB_FILE}.tmp`;
      await fs.writeFile(tempFile, Buffer.from(binary));
      await fs.rename(tempFile, DB_FILE);
    });
    await this.savePromise;
  }

  cleanupExpiredSessions() {
    this.db.run("DELETE FROM sessions WHERE julianday(expires_at) <= julianday('now');");
  }

  createUser({ email, passwordHash, displayName, targetLevel, learningGoal }) {
    const now = new Date().toISOString();
    this.db.run(`
      INSERT INTO users (email, password_hash, display_name, target_level, learning_goal, last_active_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `, [email, passwordHash, displayName, clampInt(targetLevel, 1, 9, 1), learningGoal, now.slice(0, 10), now, now]);
    const user = this.queryOne('SELECT * FROM users WHERE email = ?;', [email]);
    this.schedulePersist();
    return user;
  }

  getUserByEmail(email) {
    return this.queryOne('SELECT * FROM users WHERE email = ?;', [email]);
  }

  getUserById(id) {
    return this.queryOne('SELECT * FROM users WHERE id = ?;', [id]);
  }

  updateUser(id, changes) {
    const allowed = {
      displayName: ['display_name', value => String(value || '').trim().slice(0, 80)],
      avatar: ['avatar', value => String(value || '🎓').slice(0, 8)],
      targetLevel: ['target_level', value => clampInt(value, 1, 9, 1)],
      learningGoal: ['learning_goal', value => ['conversation', 'exam', 'reading', 'writing'].includes(value) ? value : 'conversation'],
      theme: ['theme', value => value === 'dark' ? 'dark' : 'light']
    };
    const updates = [];
    const params = [];
    for (const [key, value] of Object.entries(changes || {})) {
      if (!allowed[key] || value === undefined) continue;
      const [column, normalize] = allowed[key];
      const normalized = normalize(value);
      if (key === 'displayName' && !normalized) continue;
      updates.push(`${column} = ?`);
      params.push(normalized);
    }
    if (updates.length === 0) return this.getUserById(id);
    updates.push("updated_at = datetime('now')");
    params.push(id);
    this.db.run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?;`, params);
    this.schedulePersist();
    return this.getUserById(id);
  }

  mergeProgressSnapshot(id, snapshot = {}) {
    const user = this.getUserById(id);
    if (!user) return null;
    const incomingExp = Number.parseInt(snapshot.exp, 10);
    const currentExp = Math.max(0, Number(user.exp) || 0);
    const nextExp = Number.isFinite(incomingExp) ? Math.max(currentExp, Math.min(1_000_000_000, Math.max(0, incomingExp))) : currentExp;
    const incomingStreak = clampInt(snapshot.streakDays, 1, 100_000, Number(user.streak_days) || 1);
    const currentDate = /^\d{4}-\d{2}-\d{2}$/.test(String(user.last_active_date || '')) ? user.last_active_date : '';
    const candidateDate = String(snapshot.lastActiveDate || '').slice(0, 10);
    const incomingDate = /^\d{4}-\d{2}-\d{2}$/.test(candidateDate) ? candidateDate : currentDate;
    const lastActiveDate = currentDate && incomingDate ? (incomingDate > currentDate ? incomingDate : currentDate) : incomingDate || currentDate || null;
    const streakDays = Math.max(Number(user.streak_days) || 1, incomingStreak);
    this.db.run(`
      UPDATE users
      SET exp = ?, level = ?, streak_days = ?, last_active_date = ?, updated_at = datetime('now')
      WHERE id = ?;
    `, [nextExp, levelFromExp(nextExp), streakDays, lastActiveDate, id]);
    this.schedulePersist();
    return this.getUserById(id);
  }

  addExp(userId, amount, eventType = 'study') {
    const gained = Math.min(1000, Math.max(0, Number.parseInt(amount, 10) || 0));
    const user = this.getUserById(userId);
    if (!user) return null;
    const today = new Date().toISOString().slice(0, 10);
    let streak = Number(user.streak_days) || 1;
    if (user.last_active_date !== today) {
      const previous = user.last_active_date ? new Date(`${user.last_active_date}T00:00:00Z`) : null;
      const current = new Date(`${today}T00:00:00Z`);
      const days = previous && !Number.isNaN(previous.getTime()) ? Math.round((current - previous) / 86400000) : Infinity;
      streak = days === 1 ? streak + 1 : 1;
    }
    const nextExp = Math.max(0, Number(user.exp) || 0) + gained;
    const nextLevel = levelFromExp(nextExp);
    this.transaction(() => {
      this.db.run(`UPDATE users SET exp = ?, level = ?, streak_days = ?, last_active_date = ?, updated_at = datetime('now') WHERE id = ?;`, [nextExp, nextLevel, streak, today, userId]);
      this.db.run(`INSERT INTO study_events (user_id, event_type, exp_gained, payload_json) VALUES (?, ?, ?, ?);`, [userId, eventType, gained, '{}']);
    });
    return this.getUserById(userId);
  }

  toPublicUser(user) {
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      avatar: user.avatar,
      targetLevel: user.target_level,
      learningGoal: user.learning_goal,
      theme: user.theme,
      exp: user.exp,
      level: user.level,
      streakDays: user.streak_days,
      lastActiveDate: user.last_active_date,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
  }
}

export const database = new ServerDatabase();
