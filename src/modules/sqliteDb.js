/**
 * HánNgữ Pro - SQLite WebAssembly Database Engine (sql.js)
 * Quản trị cơ sở dữ liệu quan hệ SQLite thực tế chạy trực tiếp trên trình duyệt,
 * hỗ trợ lưu trữ nhị phân bền vững (IndexedDB / LocalStorage), truy vấn SQL đầy đủ
 * và tính năng Xuất / Nhập tệp .sqlite chuẩn quốc tế.
 */

import { HSK_VOCABULARY } from '../data/hskData.js';
import { HSK_EXPANDED_VOCABULARY } from '../data/hskExpandedVocab.js';
import { SITUATIONAL_DIALOGUES } from '../data/dialoguesData.js';

// Robust resolver for initSqlJs: supports window global or dynamic script injection
async function resolveSqlJsLoader() {
  if (typeof window !== 'undefined' && window.initSqlJs) {
    return window.initSqlJs;
  }

  if (typeof window !== 'undefined') {
    return new Promise((resolve) => {
      let script = document.querySelector('script[src*="sql-wasm.js"]');
      if (!script) {
        script = document.createElement('script');
        // Resolve relative to the deployed document so the app also works
        // when hosted below a sub-path (for example /hsk/).
        script.src = new URL('sql-wasm.js', document.baseURI).href;
        document.head.appendChild(script);
      }
      if (window.initSqlJs) {
        return resolve(window.initSqlJs);
      }
      script.addEventListener('load', () => {
        resolve(window.initSqlJs || null);
      });
      script.addEventListener('error', () => {
        resolve(null);
      });
      setTimeout(() => {
        resolve(window.initSqlJs || null);
      }, 1500);
    });
  }

  return null;
}

const DB_STORAGE_KEY = 'hanngu_sqlite_blob';
const IDB_NAME = 'HanNguPro_DB';
const IDB_STORE = 'sqlite_storage';
const IDB_SNAPSHOTS_KEY = 'hanngu_sqlite_snapshots_index';

class SqliteService {
  constructor() {
    this.db = null;
    this.SQL = null;
    this.isReady = false;
    this.initPromise = this.init();
  }

  async init() {
    try {
      const loader = await resolveSqlJsLoader();
      if (!loader) {
        throw new Error('SQLite WebAssembly loader not available');
      }
      this.SQL = await loader({
        locateFile: file => new URL(file, document.baseURI).href
      });

      const savedBinary = await this.loadBinaryFromStorage();
      if (savedBinary && savedBinary.length > 0) {
        try {
          this.db = new this.SQL.Database(savedBinary);
          console.log('[SQLite] Loaded existing database from storage.');
        } catch (e) {
          console.warn('[SQLite] Failed to load existing database, creating fresh one:', e);
          this.db = new this.SQL.Database();
        }
      } else {
        this.db = new this.SQL.Database();
      }

      this.createTablesIfNotExist();
      this.isReady = true;
      return true;
    } catch (err) {
      console.warn('[SQLite] WebAssembly init notice:', err);
      if (this.SQL) {
        this.db = new this.SQL.Database();
        this.createTablesIfNotExist();
        this.isReady = true;
      }
      return false;
    }
  }

  async ensureReady() {
    if (!this.isReady) {
      await this.initPromise;
    }
  }

  createTablesIfNotExist() {
    if (!this.db) return;

    // Users table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL DEFAULT 'Học Viên Xuất Sắc',
        target_level INTEGER DEFAULT 1,
        exp INTEGER DEFAULT 240,
        level INTEGER DEFAULT 3,
        streak_days INTEGER DEFAULT 5,
        last_active_date TEXT,
        created_at TEXT DEFAULT (datetime('now', 'localtime'))
      );
    `);

    // Ensure default user exists
    const userRes = this.db.exec("SELECT COUNT(*) AS cnt FROM users;");
    if (userRes.length === 0 || userRes[0].values[0][0] === 0) {
      const today = new Date().toISOString().split('T')[0];
      this.db.run(
        "INSERT INTO users (name, target_level, exp, level, streak_days, last_active_date) VALUES (?, ?, ?, ?, ?, ?);",
        ['Học Viên Xuất Sắc', 1, 240, 3, 5, today]
      );
    }

    // Dynamic Dictionary table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS dictionary (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hanzi TEXT NOT NULL,
        pinyin TEXT NOT NULL,
        pinyin_search TEXT,
        hanviet TEXT,
        meaning TEXT NOT NULL,
        level INTEGER DEFAULT 1,
        radical TEXT,
        stroke_count INTEGER DEFAULT 0,
        example_zh TEXT,
        example_pinyin TEXT,
        example_vi TEXT,
        notes TEXT,
        created_at TEXT DEFAULT (datetime('now', 'localtime'))
      );
    `);
    // Databases created by older versions do not have the normalized search
    // column. Migrate them before adding the unique index below.
    try {
      const columns = this.query("PRAGMA table_info(dictionary);").map(c => c.name);
      if (!columns.includes('pinyin_search')) {
        this.db.run('ALTER TABLE dictionary ADD COLUMN pinyin_search TEXT;');
      }
    } catch (e) {
      console.warn('[SQLite] Dictionary search migration notice:', e);
    }
    this.db.run("CREATE INDEX IF NOT EXISTS idx_dict_hanzi ON dictionary(hanzi);");
    this.db.run("CREATE INDEX IF NOT EXISTS idx_dict_pinyin ON dictionary(pinyin);");
    this.db.run("CREATE INDEX IF NOT EXISTS idx_dict_level ON dictionary(level);");

    // Seed initial dictionary if empty
    const dictCount = this.query("SELECT COUNT(*) AS total FROM dictionary;")[0]?.total || 0;
    if (dictCount === 0) {
      this.seedInitialDictionary();
    }
    // Ensure rich expanded vocabulary is always present
    this.seedExpandedDictionary();

    // A corpus sync must be safe to run repeatedly. Older builds did not
    // enforce uniqueness, so remove historical duplicates before creating the
    // constraint. Keep the earliest row so existing favorites and references
    // remain as stable as possible.
    try {
      this.db.run(`
        DELETE FROM dictionary
        WHERE id NOT IN (SELECT MIN(id) FROM dictionary GROUP BY hanzi);
      `);
      this.db.run("CREATE UNIQUE INDEX IF NOT EXISTS idx_dict_hanzi_unique ON dictionary(hanzi);");
      this.refreshDictionarySearchIndex();
    } catch (e) {
      console.warn('[SQLite] Dictionary uniqueness migration notice:', e);
    }

    // Dynamic Dialogues table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS dialogues_library (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        level_badge TEXT,
        location TEXT,
        description TEXT,
        turns_json TEXT NOT NULL,
        challenge_json TEXT,
        created_at TEXT DEFAULT (datetime('now', 'localtime'))
      );
    `);
    const dialCount = this.query("SELECT COUNT(*) AS total FROM dialogues_library;")[0]?.total || 0;
    if (dialCount === 0) {
      this.seedInitialDialogues();
    }

    // Error Notebook table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS error_notebook (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        category_name TEXT,
        mistake_note TEXT,
        correction TEXT,
        example_sentence TEXT,
        error_count INTEGER DEFAULT 1,
        mastery_level INTEGER DEFAULT 0,
        next_review_date TEXT,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        updated_at TEXT DEFAULT (datetime('now', 'localtime'))
      );
    `);

    // Preload initial errors if empty
    const errCount = this.query("SELECT COUNT(*) AS total FROM error_notebook;")[0]?.total || 0;
    if (errCount === 0) {
      const today = new Date().toISOString().split('T')[0];
      this.db.run(`
        INSERT INTO error_notebook (id, title, category, category_name, mistake_note, correction, example_sentence, error_count, mastery_level, next_review_date)
        VALUES 
          ('err_convenient_01', '方便 (fāngbiàn)', 'hanviet_trap', 'Bẫy Hán-Việt', 'Dịch nhầm thành "phương tiện giao thông"', 'Nghĩa đúng: Thuận tiện, tiện lợi / Đi vệ sinh', '你现在说话方便吗？', 2, 1, '${today}'),
          ('err_tone_maimai', '买 (mǎi) vs 卖 (mài)', 'tone', 'Thanh Điệu', 'Phát âm nhầm thanh 4 (卖 - bán) khi muốn mua đồ', '买 là thanh 3 (mǎi - mua, trầm lượn); 卖 là thanh 4 (mài - bán, dứt khoát)', '我想买两斤新鲜苹果。', 3, 2, '${today}');
      `);
    }

    // Exam History table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS exam_history (
        id TEXT PRIMARY KEY,
        exam_title TEXT NOT NULL,
        score INTEGER NOT NULL,
        max_score INTEGER NOT NULL,
        passed INTEGER NOT NULL,
        correct_count INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        taken_at TEXT DEFAULT (datetime('now', 'localtime'))
      );
    `);

    // Favorites table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS favorites (
        hanzi TEXT PRIMARY KEY,
        added_at TEXT DEFAULT (datetime('now', 'localtime'))
      );
    `);

    // Study logs table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS study_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        exp_gained INTEGER DEFAULT 0,
        notes TEXT,
        logged_at TEXT DEFAULT (datetime('now', 'localtime'))
      );
    `);

    // Student Lesson Progress table (Lưu tiến độ từng bài học của học viên)
    this.db.run(`
      CREATE TABLE IF NOT EXISTS user_lesson_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        lesson_id TEXT NOT NULL,
        level INTEGER DEFAULT 1,
        category TEXT DEFAULT 'vocab',
        score INTEGER DEFAULT 100,
        time_spent_seconds INTEGER DEFAULT 60,
        completed INTEGER DEFAULT 1,
        completed_at TEXT DEFAULT (datetime('now', 'localtime')),
        UNIQUE(username, lesson_id)
      );
    `);
    this.db.run("CREATE INDEX IF NOT EXISTS idx_progress_user ON user_lesson_progress(username);");

    // Student Study Timeline (Nhật ký hành trình học tập chi tiết của học viên)
    this.db.run(`
      CREATE TABLE IF NOT EXISTS user_study_timeline (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        action_type TEXT NOT NULL,
        title TEXT NOT NULL,
        exp_gained INTEGER DEFAULT 10,
        details TEXT,
        created_at TEXT DEFAULT (datetime('now', 'localtime'))
      );
    `);
    this.db.run("CREATE INDEX IF NOT EXISTS idx_timeline_user ON user_study_timeline(username);");

    // Student Notifications Center (Bảng thông báo cá nhân hóa từng học viên)
    this.db.run(`
      CREATE TABLE IF NOT EXISTS user_notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        type TEXT DEFAULT 'info',
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now', 'localtime'))
      );
    `);
    this.db.run("CREATE INDEX IF NOT EXISTS idx_notif_user ON user_notifications(username);");
    // Provide a small, real inbox for a first-time learner. Keeping these
    // rows in SQLite (instead of returning a transient fallback array) means
    // “đã đọc” survives reloads and can be cleared permanently.
    this.db.run(`
      INSERT INTO user_notifications (username, type, title, message, is_read)
      SELECT 'learner', 'welcome', 'Chào mừng bạn đến với HánNgữ Pro', 'Chọn một bài học ngắn hôm nay để duy trì nhịp học.', 0
      WHERE NOT EXISTS (
        SELECT 1 FROM user_notifications WHERE username = 'learner' AND title = 'Chào mừng bạn đến với HánNgữ Pro'
      );
    `);
    this.db.run(`
      INSERT INTO user_notifications (username, type, title, message, is_read)
      SELECT 'learner', 'tip', 'Mẹo học hôm nay', 'Ôn lại các thẻ sắp đến hạn trước khi mở bài mới để nhớ lâu hơn.', 0
      WHERE NOT EXISTS (
        SELECT 1 FROM user_notifications WHERE username = 'learner' AND title = 'Mẹo học hôm nay'
      );
    `);

    // Student Exam Records (Lịch sử điểm số khảo thí mô phỏng của học viên)
    this.db.run(`
      CREATE TABLE IF NOT EXISTS user_exam_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        exam_id TEXT NOT NULL,
        exam_title TEXT NOT NULL,
        score INTEGER NOT NULL,
        max_score INTEGER NOT NULL,
        passed INTEGER NOT NULL,
        correct_count INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        taken_at TEXT DEFAULT (datetime('now', 'localtime'))
      );
    `);
    this.db.run("CREATE INDEX IF NOT EXISTS idx_exam_user ON user_exam_records(username);");

    // Speech history is read when the Speech Lab opens, before a learner has
    // necessarily made their first attempt. Create it with the base schema so
    // the initial render is silent and deterministic.
    this.db.run(`
      CREATE TABLE IF NOT EXISTS speech_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        target_text TEXT NOT NULL,
        spoken_text TEXT NOT NULL,
        score INTEGER NOT NULL,
        feedback TEXT,
        logged_at TEXT DEFAULT (datetime('now', 'localtime'))
      );
    `);

    this.saveToStorage();
  }

  seedInitialDictionary() {
    try {
      this.db.run("BEGIN TRANSACTION;");
      const insertStmt = this.db.prepare(`
        INSERT INTO dictionary (hanzi, pinyin, hanviet, meaning, level, radical, stroke_count, example_zh, example_pinyin, example_vi, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `);

      Object.keys(HSK_VOCABULARY).forEach(lvlKey => {
        const lvl = parseInt(lvlKey, 10);
        const list = HSK_VOCABULARY[lvl] || [];
        list.forEach(item => {
          insertStmt.run([
            item.hanzi,
            item.pinyin,
            item.hanviet || '',
            item.meaning,
            lvl,
            item.radical || '',
            item.stroke_count || item.hanzi.length * 5,
            item.example || '',
            item.examplePinyin || '',
            item.exampleMeaning || '',
            item.notes || ''
          ]);
        });
      });

      insertStmt.free();
      this.db.run("COMMIT;");
      console.log('[SQLite] Seeded initial dictionary from HSK curriculum.');
    } catch (e) {
      this.db.run("ROLLBACK;");
      console.error('[SQLite] Seed dictionary error:', e);
    }
  }

  seedExpandedDictionary() {
    if (!this.db) return 0;
    try {
      this.db.run("BEGIN TRANSACTION;");
      let count = 0;
      const stmt = this.db.prepare(`
        INSERT INTO dictionary (hanzi, pinyin, hanviet, meaning, level, radical, stroke_count, example_zh, example_pinyin, example_vi, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `);

      for (const item of HSK_EXPANDED_VOCABULARY) {
        const check = this.query("SELECT COUNT(*) AS total FROM dictionary WHERE hanzi = ?;", [item.hanzi]);
        if (!check[0] || check[0].total === 0) {
          stmt.run([
            item.hanzi,
            item.pinyin,
            item.hanviet || '',
            item.meaning,
            item.level || 1,
            item.radical || '',
            item.stroke_count || 10,
            item.example_zh || '',
            item.examplePinyin || '',
            item.example_vi || '',
            item.notes || ''
          ]);
          count++;
        }
      }

      stmt.free();
      this.db.run("COMMIT;");
      if (count > 0) {
        this.saveToStorage();
        console.log(`[SQLite] Seeded ${count} new expanded HSK words.`);
      }
      return count;
    } catch (e) {
      try { this.db.run("ROLLBACK;"); } catch {}
      console.error('[SQLite] Seed expanded vocabulary error:', e);
      return 0;
    }
  }

  seedInitialDialogues() {
    try {
      this.db.run("BEGIN TRANSACTION;");
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO dialogues_library (id, title, level_badge, location, description, turns_json, challenge_json)
        VALUES (?, ?, ?, ?, ?, ?, ?);
      `);

      SITUATIONAL_DIALOGUES.forEach(d => {
        stmt.run([
          d.id,
          d.title,
          d.levelBadge,
          d.location,
          d.description,
          JSON.stringify(d.turns),
          JSON.stringify(d.challenge)
        ]);
      });

      stmt.free();
      this.db.run("COMMIT;");
    } catch (e) {
      this.db.run("ROLLBACK;");
      console.error('[SQLite] Seed dialogues error:', e);
    }
  }

  /**
   * Bulk insert words inside a single atomic transaction
   */
  bulkInsertWords(wordsArray) {
    if (!this.db || !Array.isArray(wordsArray) || wordsArray.length === 0) return 0;
    let inserted = 0;
    try {
      this.db.run("BEGIN TRANSACTION;");
      const stmt = this.db.prepare(`
        INSERT OR IGNORE INTO dictionary (hanzi, pinyin, pinyin_search, hanviet, meaning, level, radical, stroke_count, example_zh, example_pinyin, example_vi, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `);

      wordsArray.forEach(w => {
        const level = Math.min(9, Math.max(1, Number.parseInt(w.level, 10) || 1));
        const hanzi = String(w.hanzi || '').trim();
        const pinyin = String(w.pinyin || '').trim();
        const meaning = String(w.meaning || '').trim();
        if (!hanzi || !pinyin || !meaning) return;
        stmt.run([
          hanzi,
          pinyin,
          this.normalizePinyin(pinyin),
          w.hanviet || '',
          meaning,
          level,
          w.radical || '',
          w.stroke_count || 0,
          w.example_zh || w.example || '',
          w.example_pinyin || w.examplePinyin || '',
          w.example_vi || w.exampleMeaning || '',
          w.notes || ''
        ]);
        if (this.db.getRowsModified() > 0) inserted += 1;
      });

      stmt.free();
      this.db.run("COMMIT;");
      this.saveToStorage();
    } catch (e) {
      this.db.run("ROLLBACK;");
      console.error('[SQLite Bulk Insert Error]:', e);
    }
    return inserted;
  }

  /**
   * Bulk insert words in asynchronous chunks with progress reporting
   */
  async bulkInsertWordsChunked(wordsArray, onProgress, chunkSize = 500) {
    if (!this.db || !Array.isArray(wordsArray) || wordsArray.length === 0) return 0;
    const total = wordsArray.length;
    let totalInserted = 0;

    for (let i = 0; i < total; i += chunkSize) {
      const chunk = wordsArray.slice(i, i + chunkSize);
      try {
        this.db.run("BEGIN TRANSACTION;");
        const stmt = this.db.prepare(`
          INSERT OR IGNORE INTO dictionary (hanzi, pinyin, pinyin_search, hanviet, meaning, level, radical, stroke_count, example_zh, example_pinyin, example_vi, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `);

        chunk.forEach(w => {
          const level = Math.min(9, Math.max(1, Number.parseInt(w.level, 10) || 1));
          const hanzi = String(w.hanzi || '').trim();
          const pinyin = String(w.pinyin || '').trim();
          const meaning = String(w.meaning || '').trim();
          if (!hanzi || !pinyin || !meaning) return;
          stmt.run([
            hanzi,
            pinyin,
            this.normalizePinyin(pinyin),
            w.hanviet || '',
            meaning,
            level,
            w.radical || '',
            w.stroke_count || 0,
            w.example_zh || w.example || '',
            w.example_pinyin || w.examplePinyin || '',
            w.example_vi || w.exampleMeaning || '',
            w.notes || ''
          ]);
          if (this.db.getRowsModified() > 0) totalInserted += 1;
        });

        stmt.free();
        this.db.run("COMMIT;");
      } catch (e) {
        this.db.run("ROLLBACK;");
        console.error('[SQLite Bulk Chunk Error]:', e);
      }

      if (onProgress) {
        onProgress(Math.min(total, i + chunkSize), total);
      }

      // Small async tick so UI stays responsive
      await new Promise(r => setTimeout(r, 0));
    }

    this.saveToStorage();
    return totalInserted;
  }

  /**
   * Search dictionary dynamically via SQL
   */
  searchDictionary({ query = '', level = 0, limit = 50, offset = 0 } = {}) {
    if (!this.db) return [];
    let sql = "SELECT * FROM dictionary WHERE 1=1";
    const params = [];

    if (level > 0) {
      sql += " AND level = ?";
      params.push(level);
    }

    if (query && query.trim()) {
      const q = `%${query.trim()}%`;
      const pinyinQuery = `%${this.normalizePinyin(query)}%`;
      sql += " AND (hanzi LIKE ? OR pinyin LIKE ? OR pinyin_search LIKE ? OR hanviet LIKE ? OR meaning LIKE ?)";
      params.push(q, q, pinyinQuery, q, q);
    }

    sql += " ORDER BY level ASC, id ASC LIMIT ? OFFSET ?;";
    params.push(limit, offset);

    return this.query(sql, params);
  }

  query(sql, params = []) {
    if (!this.db) return [];
    try {
      const stmt = this.db.prepare(sql);
      stmt.bind(params);
      const results = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();
      return results;
    } catch (e) {
      console.error('[SQLite Query Error]:', e, sql);
      return [];
    }
  }

  normalizePinyin(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[üÜ]/g, 'u')
      .replace(/[1-5]/g, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  refreshDictionarySearchIndex() {
    if (!this.db) return;
    try {
      const rows = this.query('SELECT id, pinyin FROM dictionary WHERE pinyin_search IS NULL OR pinyin_search = "";');
      if (rows.length === 0) return;
      this.db.run('BEGIN TRANSACTION;');
      const stmt = this.db.prepare('UPDATE dictionary SET pinyin_search = ? WHERE id = ?;');
      rows.forEach(row => stmt.run([this.normalizePinyin(row.pinyin), row.id]));
      stmt.free();
      this.db.run('COMMIT;');
      this.saveToStorage();
    } catch (e) {
      try { this.db.run('ROLLBACK;'); } catch {}
      console.warn('[SQLite] Dictionary search index refresh notice:', e);
    }
  }

  run(sql, params = []) {
    if (!this.db) return false;
    try {
      this.db.run(sql, params);
      this.saveToStorage();
      return true;
    } catch (e) {
      console.error('[SQLite Run Error]:', e, sql);
      return false;
    }
  }

  executeRaw(sql) {
    if (!this.db) return { columns: [], values: [], error: 'Cơ sở dữ liệu chưa sẵn sàng' };
    try {
      const res = this.db.exec(sql);
      this.saveToStorage();
      if (res.length > 0) {
        return { columns: res[0].columns, values: res[0].values, error: null };
      }
      return { columns: [], values: [], message: 'Lệnh thực thi thành công (0 dòng trả về)', error: null };
    } catch (e) {
      return { columns: [], values: [], error: e.message };
    }
  }

  getTablesInfo() {
    if (!this.db) return [];
    const tables = this.query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
    return tables.map(t => {
      const countRes = this.query(`SELECT COUNT(*) AS total FROM ${t.name};`);
      return {
        name: t.name,
        rowCount: countRes[0]?.total || 0
      };
    });
  }

  exportDatabaseFile() {
    if (!this.db) return;
    const binaryArray = this.db.export();
    const blob = new Blob([binaryArray], { type: 'application/x-sqlite3' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hanngu_pro_database_${new Date().toISOString().split('T')[0]}.sqlite`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // =========================================================================
  // TIME-MACHINE SNAPSHOTS & AN TOÀN DỮ LIỆU
  // =========================================================================

  async createDatabaseSnapshot(name = 'Bản sao lưu thủ công') {
    if (!this.db) return null;
    try {
      const binary = this.db.export();
      const id = 'snap_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      const dictCount = this.query("SELECT COUNT(*) AS total FROM dictionary;")[0]?.total || 0;
      const userCount = this.query("SELECT COUNT(*) AS total FROM user_accounts;")[0]?.total || 0;

      const snapshotMeta = {
        id,
        name,
        timestamp: new Date().toISOString(),
        formattedTime: new Date().toLocaleString('vi-VN'),
        sizeBytes: binary.byteLength,
        sizeKb: Math.round(binary.byteLength / 1024),
        wordCount: dictCount,
        userCount: userCount
      };

      // Store binary in IndexedDB
      await this.saveSnapshotBinary(id, binary);

      // Save metadata to index
      const snapshots = this.getSnapshotIndex();
      snapshots.unshift(snapshotMeta);
      if (snapshots.length > 8) {
        const removed = snapshots.pop();
        if (removed) this.deleteSnapshotBinary(removed.id);
      }
      localStorage.setItem(IDB_SNAPSHOTS_KEY, JSON.stringify(snapshots));
      return snapshotMeta;
    } catch (e) {
      console.error('[SQLite] Create snapshot failed:', e);
      return null;
    }
  }

  getSnapshotIndex() {
    try {
      const str = localStorage.getItem(IDB_SNAPSHOTS_KEY);
      return str ? JSON.parse(str) : [];
    } catch {
      return [];
    }
  }

  async restoreDatabaseSnapshot(snapshotId) {
    if (!this.SQL) return { success: false, message: 'SQLite engine chưa sẵn sàng.' };
    try {
      const binary = await this.loadSnapshotBinary(snapshotId);
      if (!binary) {
        return { success: false, message: 'Không tìm thấy dữ liệu nhị phân của snapshot này!' };
      }

      // Auto backup current before restoring
      await this.createDatabaseSnapshot('Tự động sao lưu trước khi hoàn nguyên');

      if (this.db) {
        try { this.db.close(); } catch {}
      }
      this.db = new this.SQL.Database(binary);
      this.createTablesIfNotExist();
      this.saveToStorage();

      return {
        success: true,
        message: 'Đã hoàn nguyên CSDL thành công về snapshot đã chọn!'
      };
    } catch (e) {
      console.error('[SQLite] Restore snapshot failed:', e);
      return { success: false, message: 'Lỗi khôi phục: ' + e.message };
    }
  }

  async deleteDatabaseSnapshot(snapshotId) {
    try {
      const snapshots = this.getSnapshotIndex().filter(s => s.id !== snapshotId);
      localStorage.setItem(IDB_SNAPSHOTS_KEY, JSON.stringify(snapshots));
      await this.deleteSnapshotBinary(snapshotId);
      return true;
    } catch {
      return false;
    }
  }

  async saveSnapshotBinary(id, uint8) {
    return new Promise((resolve) => {
      try {
        const request = indexedDB.open(IDB_NAME, 1);
        request.onsuccess = (e) => {
          const idb = e.target.result;
          if (!idb.objectStoreNames.contains(IDB_STORE)) return resolve(false);
          const tx = idb.transaction(IDB_STORE, 'readwrite');
          tx.objectStore(IDB_STORE).put(uint8, 'snapshot_' + id);
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => resolve(false);
        };
        request.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  async loadSnapshotBinary(id) {
    return new Promise((resolve) => {
      try {
        const request = indexedDB.open(IDB_NAME, 1);
        request.onsuccess = (e) => {
          const idb = e.target.result;
          if (!idb.objectStoreNames.contains(IDB_STORE)) return resolve(null);
          const tx = idb.transaction(IDB_STORE, 'readonly');
          const req = tx.objectStore(IDB_STORE).get('snapshot_' + id);
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => resolve(null);
        };
        request.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  async deleteSnapshotBinary(id) {
    return new Promise((resolve) => {
      try {
        const request = indexedDB.open(IDB_NAME, 1);
        request.onsuccess = (e) => {
          const idb = e.target.result;
          if (!idb.objectStoreNames.contains(IDB_STORE)) return resolve(false);
          const tx = idb.transaction(IDB_STORE, 'readwrite');
          tx.objectStore(IDB_STORE).delete('snapshot_' + id);
          tx.oncomplete = () => resolve(true);
        };
        request.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  /**
   * Nhập tệp .sqlite với cơ chế An Toàn 3 Lớp (Triple-Shield):
   * 1. Xác thực chữ ký header SQLite 3
   * 2. Tự động chụp Snapshot khẩn cấp trước khi nạp
   * 3. Khởi tạo sandbox và kiểm tra cấu trúc schema hợp lệ
   */
  async importDatabaseFile(file) {
    if (!file || !this.SQL) {
      return { success: false, message: 'Dịch vụ SQLite chưa sẵn sàng hoặc không tìm thấy tệp.' };
    }
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);

      // 1. Kiểm tra chữ ký tiêu đề file SQLite
      const headerStr = String.fromCharCode(...uint8.slice(0, 16));
      if (!headerStr.startsWith('SQLite format 3')) {
        return {
          success: false,
          message: 'Tệp tải lên không phải là tệp SQLite 3 hợp lệ (Thiếu chữ ký tiêu đề chuẩn).'
        };
      }

      // 2. Chụp Snapshot dự phòng trước khi nạp tệp
      await this.createDatabaseSnapshot(`Tự động sao lưu trước khi nạp (${file.name})`);

      // 3. Khởi tạo thử nghiệm trong sandbox
      const testDb = new this.SQL.Database(uint8);

      // 4. Kiểm tra cấu trúc các bảng bắt buộc
      const tableRes = testDb.exec("SELECT name FROM sqlite_master WHERE type='table';");
      const tableNames = (tableRes[0]?.values || []).map(r => r[0]);

      if (!tableNames.includes('dictionary') && !tableNames.includes('user_accounts')) {
        testDb.close();
        return {
          success: false,
          message: 'Tệp CSDL không chứa các bảng hệ thống bắt buộc (cần có dictionary hoặc user_accounts). Đã hủy bỏ thao tác để bảo vệ an toàn dữ liệu.'
        };
      }

      // 5. Nạp an toàn vào hệ thống
      if (this.db) {
        try { this.db.close(); } catch {}
      }
      this.db = testDb;
      this.createTablesIfNotExist();
      this.saveToStorage();

      return {
        success: true,
        message: `Đã nạp thành công cơ sở dữ liệu từ "${file.name}"! (${tableNames.length} bảng dữ liệu). Hệ thống đã tự động tạo một điểm sao lưu dự phòng.`
      };
    } catch (e) {
      console.error('[SQLite Import Error]:', e);
      return {
        success: false,
        message: 'Lỗi nạp tệp SQLite: ' + (e.message || 'Cấu trúc tệp bị lỗi hoặc không tương thích.')
      };
    }
  }

  saveToStorage() {
    if (!this.db) return;
    try {
      const binary = this.db.export();
      this.saveBinaryToStorage(binary);
    } catch (e) {
      console.warn('[SQLite Export Warning]:', e);
    }
  }

  saveBinaryToStorage(uint8Array) {
    try {
      const request = indexedDB.open(IDB_NAME, 1);
      request.onupgradeneeded = (e) => {
        const idb = e.target.result;
        if (!idb.objectStoreNames.contains(IDB_STORE)) {
          idb.createObjectStore(IDB_STORE);
        }
      };
      request.onsuccess = (e) => {
        const idb = e.target.result;
        const tx = idb.transaction(IDB_STORE, 'readwrite');
        tx.objectStore(IDB_STORE).put(uint8Array, DB_STORAGE_KEY);
      };
    } catch (e) {
      try {
        let binaryString = '';
        const len = uint8Array.byteLength;
        for (let i = 0; i < len; i++) {
          binaryString += String.fromCharCode(uint8Array[i]);
        }
        localStorage.setItem(DB_STORAGE_KEY, btoa(binaryString));
      } catch (err) {
        console.warn('Persistence fallback notice:', err);
      }
    }
  }

  async loadBinaryFromStorage() {
    return new Promise((resolve) => {
      try {
        const request = indexedDB.open(IDB_NAME, 1);
        request.onupgradeneeded = (e) => {
          const idb = e.target.result;
          if (!idb.objectStoreNames.contains(IDB_STORE)) {
            idb.createObjectStore(IDB_STORE);
          }
        };
        request.onsuccess = (e) => {
          const idb = e.target.result;
          const tx = idb.transaction(IDB_STORE, 'readonly');
          const getReq = tx.objectStore(IDB_STORE).get(DB_STORAGE_KEY);
          getReq.onsuccess = () => {
            if (getReq.result) {
              resolve(getReq.result);
            } else {
              resolve(this.loadFromLocalStorageFallback());
            }
          };
          getReq.onerror = () => resolve(this.loadFromLocalStorageFallback());
        };
        request.onerror = () => resolve(this.loadFromLocalStorageFallback());
      } catch {
        resolve(this.loadFromLocalStorageFallback());
      }
    });
  }

  loadFromLocalStorageFallback() {
    try {
      const b64 = localStorage.getItem(DB_STORAGE_KEY);
      if (!b64) return null;
      const binStr = atob(b64);
      const len = binStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binStr.charCodeAt(i);
      }
      return bytes;
    } catch {
      return null;
    }
  }
}

export const sqliteService = new SqliteService();
