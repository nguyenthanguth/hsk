import http from 'node:http';
import crypto from 'node:crypto';
import { database } from './database.js';

const HOST = process.env.HSK_HOST || '127.0.0.1';
const PORT = Number.parseInt(process.env.HSK_PORT, 10) || 8787;
const SESSION_COOKIE = 'hsk_session';
const SESSION_DAYS = 30;
const MAX_BODY_BYTES = 1_500_000;
const authAttempts = new Map();

const allowedOrigins = new Set([
  'http://127.0.0.1:5173',
  'http://localhost:5173',
  'http://127.0.0.1:4173',
  'http://localhost:4173'
]);

const sendJson = (response, status, payload, request) => {
  const origin = request.headers.origin;
  if (origin && allowedOrigins.has(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.writeHead(status);
  response.end(JSON.stringify(payload));
};

const setCookie = (response, token, maxAgeSeconds = SESSION_DAYS * 86400) => {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  response.setHeader('Set-Cookie', `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`);
};

const parseCookies = (request) => Object.fromEntries(
  String(request.headers.cookie || '').split(';').map(part => part.trim()).filter(Boolean).map(part => {
    const index = part.indexOf('=');
    const name = index >= 0 ? part.slice(0, index) : part;
    const rawValue = index >= 0 ? part.slice(index + 1) : '';
    let value = rawValue;
    try { value = decodeURIComponent(rawValue); } catch { /* Ignore malformed non-auth cookies. */ }
    return [name, value];
  })
);

const hashToken = token => crypto.createHash('sha256').update(token).digest('hex');
const createToken = () => crypto.randomBytes(32).toString('base64url');
const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) => {
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${derived}`;
};
const verifyPassword = (password, stored) => {
  const [scheme, salt, expected] = String(stored || '').split(':');
  if (scheme !== 'scrypt' || !salt || !expected) return false;
  const actual = crypto.scryptSync(password, salt, 64).toString('hex');
  const left = Buffer.from(actual, 'hex');
  const right = Buffer.from(expected, 'hex');
  return left.length === right.length && crypto.timingSafeEqual(left, right);
};

const normalizeEmail = value => String(value || '').trim().toLowerCase();
const validEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 190;
const publicUser = user => database.toPublicUser(user);

const readJson = request => new Promise((resolve, reject) => {
  let total = 0;
  let body = '';
  request.setEncoding('utf8');
  request.on('data', chunk => {
    total += Buffer.byteLength(chunk);
    if (total > MAX_BODY_BYTES) {
      reject(Object.assign(new Error('Payload quá lớn.'), { statusCode: 413 }));
      request.destroy();
      return;
    }
    body += chunk;
  });
  request.on('end', () => {
    if (!body.trim()) return resolve({});
    try { resolve(JSON.parse(body)); } catch { reject(Object.assign(new Error('JSON không hợp lệ.'), { statusCode: 400 })); }
  });
  request.on('error', reject);
});

const publicError = (message, status = 400, code = 'BAD_REQUEST') => Object.assign(new Error(message), { statusCode: status, code });

const authUser = request => {
  const token = parseCookies(request)[SESSION_COOKIE];
  if (!token) return null;
  const session = database.queryOne(`
    SELECT s.user_id, s.expires_at FROM sessions s
    WHERE s.token_hash = ? AND julianday(s.expires_at) > julianday('now');
  `, [hashToken(token)]);
  return session ? database.getUserById(session.user_id) : null;
};

const requireUser = request => authUser(request) || (() => { throw publicError('Bạn cần đăng nhập để thực hiện thao tác này.', 401, 'UNAUTHENTICATED'); })();

const checkRateLimit = request => {
  const ip = request.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = authAttempts.get(ip) || { count: 0, resetAt: now + 15 * 60 * 1000 };
  if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + 15 * 60 * 1000; }
  entry.count += 1;
  authAttempts.set(ip, entry);
  if (entry.count > 20) throw publicError('Có quá nhiều lần thử. Vui lòng thử lại sau ít phút.', 429, 'RATE_LIMITED');
};

const createSession = (response, userId) => {
  const token = createToken();
  const expires = new Date(Date.now() + SESSION_DAYS * 86400000).toISOString();
  database.run('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?);', [hashToken(token), userId, expires]);
  setCookie(response, token);
};

const clearSession = (request, response) => {
  const token = parseCookies(request)[SESSION_COOKIE];
  if (token) database.run('DELETE FROM sessions WHERE token_hash = ?;', [hashToken(token)]);
  setCookie(response, '', 0);
};

const validateGoal = value => ['conversation', 'exam', 'reading', 'writing'].includes(value) ? value : 'conversation';

const handleRequest = async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || `${HOST}:${PORT}`}`);
  const method = request.method || 'GET';
  const route = url.pathname.replace(/\/+$/, '') || '/';

  if (method === 'OPTIONS') {
    const origin = request.headers.origin;
    if (origin && allowedOrigins.has(origin)) response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
    response.writeHead(204);
    response.end();
    return;
  }

  if (route === '/api/health' && method === 'GET') {
    sendJson(response, 200, { ok: true, service: 'hanngu-api', database: 'sqlite-wasm', time: new Date().toISOString() }, request);
    return;
  }

  if (!route.startsWith('/api/')) {
    sendJson(response, 404, { error: 'API route không tồn tại.' }, request);
    return;
  }

  const body = ['POST', 'PATCH', 'PUT'].includes(method) ? await readJson(request) : {};

  if (route === '/api/auth/register' && method === 'POST') {
    checkRateLimit(request);
    const email = normalizeEmail(body.email);
    const password = String(body.password || '');
    if (!validEmail(email)) throw publicError('Email không hợp lệ.', 422, 'INVALID_EMAIL');
    if (password.length < 8 || password.length > 128) throw publicError('Mật khẩu cần từ 8 đến 128 ký tự.', 422, 'INVALID_PASSWORD');
    if (database.getUserByEmail(email)) throw publicError('Email này đã được đăng ký.', 409, 'EMAIL_EXISTS');
    const displayName = String(body.displayName || 'Học Viên').trim().slice(0, 80) || 'Học Viên';
    const user = database.createUser({ email, passwordHash: hashPassword(password), displayName, targetLevel: body.targetLevel, learningGoal: validateGoal(body.learningGoal) });
    createSession(response, user.id);
    sendJson(response, 201, { user: publicUser(user) }, request);
    return;
  }

  if (route === '/api/auth/login' && method === 'POST') {
    checkRateLimit(request);
    const email = normalizeEmail(body.email);
    const user = database.getUserByEmail(email);
    if (!user || !verifyPassword(String(body.password || ''), user.password_hash)) throw publicError('Email hoặc mật khẩu không đúng.', 401, 'INVALID_CREDENTIALS');
    createSession(response, user.id);
    sendJson(response, 200, { user: publicUser(user) }, request);
    return;
  }

  if (route === '/api/auth/logout' && method === 'POST') {
    clearSession(request, response);
    sendJson(response, 200, { ok: true }, request);
    return;
  }

  if (route === '/api/me' && method === 'GET') {
    sendJson(response, 200, { user: publicUser(requireUser(request)) }, request);
    return;
  }

  if (route === '/api/me' && method === 'PATCH') {
    const user = requireUser(request);
    const updated = database.updateUser(user.id, {
      displayName: body.displayName,
      avatar: body.avatar,
      targetLevel: body.targetLevel,
      learningGoal: body.learningGoal,
      theme: body.theme
    });
    sendJson(response, 200, { user: publicUser(updated) }, request);
    return;
  }

  if (route === '/api/dashboard' && method === 'GET') {
    const user = requireUser(request);
    const completed = database.queryOne('SELECT COUNT(*) AS count FROM lesson_progress WHERE user_id = ? AND completed = 1;', [user.id]);
    const due = database.queryOne("SELECT COUNT(*) AS count FROM srs_items WHERE user_id = ? AND julianday(due_at) <= julianday('now');", [user.id]);
    const events = database.query('SELECT event_type, entity_id, exp_gained, created_at FROM study_events WHERE user_id = ? ORDER BY id DESC LIMIT 20;', [user.id]);
    sendJson(response, 200, { user: publicUser(user), stats: { completedLessons: completed?.count || 0, dueCards: due?.count || 0 }, recentEvents: events }, request);
    return;
  }

  if (route === '/api/sync/pull' && method === 'GET') {
    const user = requireUser(request);
    sendJson(response, 200, {
      user: publicUser(user),
      lessons: database.query('SELECT lesson_id, level, category, score, time_spent_seconds, completed, completed_at, updated_at FROM lesson_progress WHERE user_id = ? ORDER BY updated_at DESC LIMIT 2000;', [user.id]),
      srs: database.query('SELECT hanzi, pinyin, meaning, level, ease_factor, interval_days, repetitions, due_at, correct_count, incorrect_count, last_reviewed_at FROM srs_items WHERE user_id = ? ORDER BY due_at ASC LIMIT 5000;', [user.id])
    }, request);
    return;
  }

  if (route === '/api/sync/push' && method === 'POST') {
    const user = requireUser(request);
    const lessons = Array.isArray(body.lessons) ? body.lessons.slice(0, 2000) : [];
    const srs = Array.isArray(body.srs) ? body.srs.slice(0, 5000) : [];
    const profile = body.profile && typeof body.profile === 'object' ? body.profile : {};
    database.transaction(() => {
      database.updateUser(user.id, {
        displayName: profile.displayName,
        avatar: profile.avatar,
        targetLevel: profile.targetLevel,
        learningGoal: profile.learningGoal,
        theme: profile.theme
      });
      database.mergeProgressSnapshot(user.id, profile);
      for (const lesson of lessons) {
        const lessonId = String(lesson.lesson_id || lesson.lessonId || '').trim().slice(0, 180);
        if (!lessonId) continue;
        database.db.run(`
          INSERT INTO lesson_progress (user_id, lesson_id, level, category, score, time_spent_seconds, completed, completed_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
          ON CONFLICT(user_id, lesson_id) DO UPDATE SET
            level = excluded.level, category = excluded.category, score = excluded.score,
            time_spent_seconds = excluded.time_spent_seconds, completed = excluded.completed,
            completed_at = excluded.completed_at, updated_at = datetime('now');
        `, [user.id, lessonId, Math.min(9, Math.max(1, Number.parseInt(lesson.level, 10) || 1)), String(lesson.category || 'vocab').slice(0, 40), Math.min(100, Math.max(0, Number.parseInt(lesson.score, 10) || 0)), Math.max(0, Number.parseInt(lesson.time_spent_seconds, 10) || 0), lesson.completed ? 1 : 0, lesson.completed_at || null]);
      }
      for (const card of srs) {
        const hanzi = String(card.hanzi || '').trim().slice(0, 120);
        if (!hanzi) continue;
        database.db.run(`
          INSERT INTO srs_items (user_id, hanzi, pinyin, meaning, level, ease_factor, interval_days, repetitions, due_at, correct_count, incorrect_count, last_reviewed_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
          ON CONFLICT(user_id, hanzi) DO UPDATE SET
            pinyin = excluded.pinyin, meaning = excluded.meaning, level = excluded.level,
            ease_factor = excluded.ease_factor, interval_days = excluded.interval_days,
            repetitions = excluded.repetitions, due_at = excluded.due_at,
            correct_count = excluded.correct_count, incorrect_count = excluded.incorrect_count,
            last_reviewed_at = excluded.last_reviewed_at, updated_at = datetime('now');
        `, [user.id, hanzi, String(card.pinyin || '').slice(0, 160), String(card.meaning || '').slice(0, 500), Math.min(9, Math.max(1, Number.parseInt(card.level, 10) || 1)), Math.min(5, Math.max(1.3, Number(card.ease_factor) || 2.5)), Math.max(0, Number.parseInt(card.interval_days, 10) || 0), Math.max(0, Number.parseInt(card.repetitions, 10) || 0), card.due_at || new Date().toISOString(), Math.max(0, Number.parseInt(card.correct_count, 10) || 0), Math.max(0, Number.parseInt(card.incorrect_count, 10) || 0), card.last_reviewed_at || null]);
      }
      database.db.run('UPDATE users SET updated_at = datetime(\'now\') WHERE id = ?;', [user.id]);
    });
    sendJson(response, 200, { user: publicUser(database.getUserById(user.id)), lessonsSaved: lessons.length, srsSaved: srs.length }, request);
    return;
  }

  const dueMatch = route.match(/^\/api\/srs\/due$/);
  if (dueMatch && method === 'GET') {
    const user = requireUser(request);
    const limit = Math.min(100, Math.max(1, Number.parseInt(url.searchParams.get('limit'), 10) || 30));
    const level = Number.parseInt(url.searchParams.get('level'), 10) || 0;
    const params = [user.id];
    let sql = "SELECT hanzi, pinyin, meaning, level, ease_factor, interval_days, repetitions, due_at, correct_count, incorrect_count, last_reviewed_at FROM srs_items WHERE user_id = ? AND julianday(due_at) <= julianday('now')";
    if (level >= 1 && level <= 9) { sql += ' AND level = ?'; params.push(level); }
    sql += ' ORDER BY due_at ASC LIMIT ?;';
    params.push(limit);
    sendJson(response, 200, { items: database.query(sql, params) }, request);
    return;
  }

  const reviewMatch = route.match(/^\/api\/srs\/review$/);
  if (reviewMatch && method === 'POST') {
    const user = requireUser(request);
    const hanzi = String(body.hanzi || '').trim().slice(0, 120);
    const quality = Math.min(5, Math.max(0, Number.parseInt(body.quality, 10) || 0));
    if (!hanzi) throw publicError('Thiếu chữ Hán cần ôn.', 422);
    const existing = database.queryOne('SELECT * FROM srs_items WHERE user_id = ? AND hanzi = ?;', [user.id, hanzi]);
    const now = new Date();
    let ease = Number(existing?.ease_factor) || 2.5;
    let repetitions = Number(existing?.repetitions) || 0;
    let interval = Number(existing?.interval_days) || 0;
    if (quality < 3) { repetitions = 0; interval = 0; } else { repetitions += 1; interval = repetitions === 1 ? 1 : repetitions === 2 ? 6 : Math.max(1, Math.round(interval * ease)); }
    ease = Math.max(1.3, ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    const dueAt = new Date(now.getTime() + Math.max(0, interval) * 86400000).toISOString();
    database.run(`
      INSERT INTO srs_items (user_id, hanzi, pinyin, meaning, level, ease_factor, interval_days, repetitions, due_at, correct_count, incorrect_count, last_reviewed_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(user_id, hanzi) DO UPDATE SET ease_factor = excluded.ease_factor, interval_days = excluded.interval_days,
        repetitions = excluded.repetitions, due_at = excluded.due_at, correct_count = srs_items.correct_count + excluded.correct_count,
        incorrect_count = srs_items.incorrect_count + excluded.incorrect_count, last_reviewed_at = excluded.last_reviewed_at, updated_at = datetime('now');
    `, [user.id, hanzi, String(body.pinyin || existing?.pinyin || '').slice(0, 160), String(body.meaning || existing?.meaning || '').slice(0, 500), Math.min(9, Math.max(1, Number.parseInt(body.level || existing?.level, 10) || 1)), ease, interval, repetitions, dueAt, quality >= 3 ? 1 : 0, quality >= 3 ? 0 : 1, now.toISOString()]);
    const gained = quality >= 5 ? 35 : quality >= 4 ? 25 : quality >= 3 ? 15 : 0;
    const updatedUser = gained ? database.addExp(user.id, gained, 'srs_review') : database.getUserById(user.id);
    sendJson(response, 200, { item: database.queryOne('SELECT * FROM srs_items WHERE user_id = ? AND hanzi = ?;', [user.id, hanzi]), user: publicUser(updatedUser), expGained: gained }, request);
    return;
  }

  const lessonMatch = route.match(/^\/api\/progress\/lessons$/);
  if (lessonMatch && method === 'POST') {
    const user = requireUser(request);
    const lessonId = String(body.lessonId || '').trim().slice(0, 180);
    if (!lessonId) throw publicError('Thiếu lessonId.', 422);
    database.run(`
      INSERT INTO lesson_progress (user_id, lesson_id, level, category, score, time_spent_seconds, completed, completed_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(user_id, lesson_id) DO UPDATE SET level = excluded.level, category = excluded.category, score = excluded.score,
        time_spent_seconds = excluded.time_spent_seconds, completed = excluded.completed, completed_at = excluded.completed_at, updated_at = datetime('now');
    `, [user.id, lessonId, Math.min(9, Math.max(1, Number.parseInt(body.level, 10) || 1)), String(body.category || 'vocab').slice(0, 40), Math.min(100, Math.max(0, Number.parseInt(body.score, 10) || 0)), Math.max(0, Number.parseInt(body.timeSpentSeconds, 10) || 0), body.completed === false ? 0 : 1, body.completedAt || new Date().toISOString()]);
    const updatedUser = database.addExp(user.id, Math.min(100, Math.max(0, Number.parseInt(body.expGained, 10) || 10)), 'lesson_completed');
    sendJson(response, 200, { user: publicUser(updatedUser), lessonId }, request);
    return;
  }

  sendJson(response, 404, { error: 'API route không tồn tại.' }, request);
};

const server = http.createServer((request, response) => {
  handleRequest(request, response).catch(error => {
    if ((error.statusCode || 500) >= 500) console.error('[HánNgữ API]', error);
    if (!response.headersSent) sendJson(response, error.statusCode || 500, { error: error.message || 'Lỗi máy chủ.', code: error.code || 'SERVER_ERROR' }, request);
    else response.destroy();
  });
});

await database.init();
server.listen(PORT, HOST, () => {
  console.log(`[HánNgữ API] http://${HOST}:${PORT}`);
  console.log(`[HánNgữ API] SQLite: server/data/hanngu.server.sqlite`);
});

const shutdown = async signal => {
  console.log(`[HánNgữ API] ${signal}, saving database...`);
  server.close(async () => {
    try { await database.persist(); } finally { process.exit(0); }
  });
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
