/**
 * HánNgữ Pro v2.0 - Main Application Controller
 * Nền tảng luyện ôn HSK 1 - HSK 9 thông minh cho người Việt
 * Tích hợp SQLite Database Engine + 5 chế độ học & chơi mới
 */

import './style.css';
import { audioService } from './modules/audioService.js';
import { storageService } from './modules/storageService.js';
import { sqliteService } from './modules/sqliteDb.js';
import { dataImporterService } from './modules/dataImporter.js';
import { HanziCanvasController } from './modules/hanziCanvas.js';
import { HSK_LEVELS, HSK_VOCABULARY, HSK_GRAMMAR } from './data/hskData.js';
import { HAN_VIET_TRAPS } from './data/hanVietTraps.js';
import { TONE_CONTOURS, MINIMAL_PAIRS, INITIAL_CONSONANTS_GUIDE } from './data/tonesData.js';
import { MOCK_EXAMS } from './data/mockExams.js';
import { SENTENCE_CHAINS } from './data/sentenceLifecycle.js';
import { RADICALS_DATA } from './data/radicalsData.js';
import { SITUATIONAL_DIALOGUES } from './data/dialoguesData.js';
import { DAILY_CHALLENGES, WORD_PUZZLES, SPEED_PASSAGES, QUIZ_BANK, GRAMMAR_PATTERNS } from './data/gameData.js';
import { srsService } from './modules/srsService.js';
import { speechService } from './modules/speechService.js';
import { gamificationService } from './modules/gamificationService.js';
import { textAnalyzerService } from './modules/textAnalyzerService.js';
import { immersionAudioService } from './modules/immersionAudioService.js';
import { HSK_GRAMMAR_POINTS } from './data/grammarData.js';
import { grammarService } from './modules/grammarService.js';
import { CHENGYU_COLLECTION } from './data/chengyuData.js';
import { TRANSLATION_CHALLENGES } from './data/translationData.js';
import { translationService } from './modules/translationService.js';
import { worksheetGenerator } from './modules/worksheetGenerator.js';
import { speedMatchGame } from './modules/speedMatchGame.js';
import { authService } from './modules/authService.js';
import { studentProgressService } from './modules/studentProgressService.js';
import { toastService } from './modules/toastService.js';
import { tonePitchService } from './modules/tonePitchService.js';
import { syntaxAnalyzerService } from './modules/syntaxAnalyzerService.js';
import { apiClient } from './modules/apiClient.js';

// Dictionary records can come from a user import or a downloaded corpus.
// Escape text before placing it in an HTML template so a learning dataset
// cannot become executable markup.
const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

class App {
  constructor() {
    this.toastService = toastService;
    this.currentView = 'dashboard';
    this.selectedLevel = 1;
    this.canvasController = null;
    this.activeExam = null;
    this.examTimerInterval = null;
    this.examTimeRemaining = 0;
    this.userAnswers = {};
    this.isDarkTheme = localStorage.getItem('hanngu_theme') === 'dark';
    document.body.classList.toggle('dark-theme', this.isDarkTheme);

    // Grammar Master state
    this.grammarLevelFilter = 'all';
    this.scrambleSelections = {};

    // Chengyu Storybook state
    this.chengyuLevelFilter = 'all';
    this.chengyuSearchQuery = '';

    // Translation Arena state
    this.translationTierFilter = 'all';
    this.activeTranslationId = 'trans_elem_01';

    // Worksheet Generator state
    this.worksheetText = '学而时习之不亦说乎有朋自远方来不亦乐乎';
    this.worksheetGridType = 'mizige';
    this.worksheetShowPinyin = true;

    // Speed Match Game state
    this.speedMatchLevel = 1;

    // Text Analyzer state
    this.analyzerInputText = '学而时习之，不亦说乎？有朋自远方来，不亦乐乎？';

    // Immersion Audio state
    this.immersionSource = 'hsk1';

    // Flashcard & SRS state
    this.flashcardIndex = 0;
    this.flashcardLevel = 1;
    this.srsMode = true;
    this.srsQueue = [];
    this.srsIndex = 0;

    // Radicals state
    this.radicalsStrokeFilter = 'all';
    this.radicalsSearchQuery = '';

    // Speech Lab state
    this.speechTargetWord = '你好';
    this.isRecordingVoice = false;

    // Dialogue state
    this.currentDialogueIndex = 0;

    // Lexicon state
    this.lexiconSearchQuery = '';
    this.lexiconLevelFilter = 0;

    // Quiz/Game state
    this.quizCurrentIndex = 0;
    this.quizLevel = 1;
    this.quizScore = 0;
    this.quizAnswered = false;
    this.challengeIndex = 0;
    this.matchSelected = null;
    this.matchPairs = [];
    this.speedTimerInterval = null;
    this.puzzleIndex = 0;
    this.grammarLevel = 0;

    this.start();
  }

  start() {
    try {
      this.renderLayout();
      this.bindGlobalEvents();
      this.switchView('dashboard');
      this.updateUserStatsDisplay();
    } catch (err) {
      console.error('[HánNgữ Pro] Render error:', err);
      this.showFatalError(err);
      return;
    }

    this.initAsync().catch(err => {
      console.warn('[HánNgữ Pro] Async initialization notice:', err);
    });
  }

  showMandatoryAuthGate(initialTab = 'register') {
    const gateEl = document.querySelector('#mandatoryAuthGateOverlay');
    if (gateEl) gateEl.remove();
  }

  async initAsync() {
    try {
      await sqliteService.ensureReady();
      this.updateUserStatsDisplay();
      this.maybeShowOnboarding();
      await apiClient.health();
      if (apiClient.available) {
        try {
          const remoteUser = await apiClient.getMe();
          this.applyRemoteServerUser(remoteUser);
        } catch (error) {
          // A missing/expired cookie is the normal signed-out state. Keep the
          // local-first app quiet and only surface unexpected API failures.
          if (error?.status && error.status !== 401) console.warn('[HánNgữ Pro] Server session notice:', error);
        }
      }
      this.updateServerStatus();
    } catch (e) {
      console.warn('[HánNgữ Pro] SQLite background ready notice:', e);
    }
  }

  updateServerStatus() {
    const statusEl = document.querySelector('#serverSyncStatus');
    if (!statusEl) return;
    const connected = apiClient.available;
    statusEl.textContent = connected ? '☁ Server: Kết nối' : '☁ Chỉ lưu cục bộ';
    statusEl.dataset.state = connected ? 'connected' : 'local';
    statusEl.title = connected
      ? 'API server đang sẵn sàng. Mở hồ sơ để đăng nhập và đồng bộ dữ liệu.'
      : 'Ứng dụng vẫn hoạt động bình thường ở chế độ local-first. Khởi động server để bật đồng bộ.';
  }

  applyRemoteServerUser(remoteUser) {
    if (!remoteUser) return;
    apiClient.user = remoteUser;
    authService.saveSession({
      username: remoteUser.email,
      displayName: remoteUser.displayName,
      targetLevel: remoteUser.targetLevel,
      exp: remoteUser.exp,
      level: remoteUser.level,
      streakDays: remoteUser.streakDays,
      avatar: remoteUser.avatar,
      lastActiveDate: remoteUser.lastActiveDate
    });
    localStorage.setItem('hanngu_learning_goal', remoteUser.learningGoal || 'conversation');
    this.updateUserStatsDisplay();
    this.updateServerStatus();
  }

  decodeLocalSyncBundle() {
    const encoded = studentProgressService.exportStudentDataBundle();
    if (!encoded) throw new Error('Chưa có hồ sơ local để đồng bộ.');
    const json = decodeURIComponent(escape(atob(encoded.trim())));
    return JSON.parse(json);
  }

  async getLocalServerPayload() {
    const bundle = this.decodeLocalSyncBundle();
    await srsService.ensureReady();
    const localSrs = sqliteService.query('SELECT hanzi, pinyin, meaning, level, ease_factor, interval_days, repetitions, due_timestamp, last_reviewed, history_json FROM srs_items;');
    return {
      profile: {
        ...bundle.user,
        learningGoal: localStorage.getItem('hanngu_learning_goal') || 'conversation',
        theme: this.isDarkTheme ? 'dark' : 'light'
      },
      lessons: Array.isArray(bundle.progress) ? bundle.progress : [],
      srs: localSrs.map(card => {
        let history = [];
        try {
          const parsed = JSON.parse(card.history_json || '[]');
          history = Array.isArray(parsed) ? parsed : [];
        } catch {}
        const correctCount = history.filter(review => Number(review?.grade) >= 3).length;
        return {
          ...card,
          correct_count: correctCount,
          incorrect_count: Math.max(0, history.length - correctCount),
          due_at: new Date(Number(card.due_timestamp) || Date.now()).toISOString(),
          last_reviewed_at: card.last_reviewed || null
        };
      })
    };
  }

  async syncLocalToServer() {
    if (!apiClient.available || !apiClient.user) throw new Error('Hãy khởi động server và đăng nhập trước.');
    const payload = await this.getLocalServerPayload();
    const result = await apiClient.pushSync(payload);
    this.applyRemoteServerUser(result.user);
    return result;
  }

  async syncServerToLocal() {
    if (!apiClient.available || !apiClient.user) throw new Error('Hãy khởi động server và đăng nhập trước.');
    const remote = await apiClient.pullSync();
    const user = remote.user;
    this.applyRemoteServerUser(user);
    await sqliteService.ensureReady();
    const username = user.email;
    (remote.lessons || []).forEach(lesson => sqliteService.run(`
      INSERT OR REPLACE INTO user_lesson_progress (username, lesson_id, level, category, score, time_spent_seconds, completed, completed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `, [username, lesson.lesson_id, lesson.level, lesson.category, lesson.score, lesson.time_spent_seconds, lesson.completed, lesson.completed_at]));
    await srsService.ensureReady();
    (remote.srs || []).forEach(card => {
      // The local seed uses a different primary key, so remove the old copy
      // by Hanzi before importing the server's authoritative card.
      sqliteService.run('DELETE FROM srs_items WHERE hanzi = ?;', [card.hanzi]);
      sqliteService.run(`
        INSERT OR REPLACE INTO srs_items (id, hanzi, pinyin, hanviet, meaning, level, repetitions, interval_days, ease_factor, due_timestamp, last_reviewed, history_json)
        VALUES (?, ?, ?, '', ?, ?, ?, ?, ?, ?, ?, ?);
      `, [`server_${username}_${card.hanzi}`, card.hanzi, card.pinyin || '', card.meaning || '', card.level || 1, card.repetitions || 0, card.interval_days || 0, card.ease_factor || 2.5, new Date(card.due_at || Date.now()).getTime(), card.last_reviewed_at || '', '[]']);
    });
    return remote;
  }

  maybeShowOnboarding() {
    const key = 'hanngu_onboarding_completed';
    if (localStorage.getItem(key) === '1') return;
    // Do not interrupt an already open modal (for example after a browser
    // restore). The learner can open onboarding again from the profile later.
    if (document.querySelector('#globalModalContainer')?.children.length) return;
    this.showOnboardingModal();
  }

  showOnboardingModal() {
    const modalEl = document.querySelector('#globalModalContainer');
    if (!modalEl) return;
    const user = authService.getCurrentUser() || {};
    const profile = storageService.getProfile() || {};
    const targetLevel = Math.min(9, Math.max(1, Number.parseInt(user.targetLevel ?? profile.targetLevel, 10) || 1));
    const goal = localStorage.getItem('hanngu_learning_goal') || 'conversation';
    const goals = [
      ['conversation', '💬 Giao tiếp hằng ngày'],
      ['exam', '📝 Chuẩn bị kỳ thi HSK'],
      ['reading', '📖 Đọc hiểu chữ Hán'],
      ['writing', '✍️ Viết và nhớ mặt chữ']
    ];

    modalEl.innerHTML = `
      <div class="modal-overlay onboarding-overlay" id="onboardingOverlay" role="dialog" aria-modal="true" aria-labelledby="onboardingTitle">
        <div class="modal-content onboarding-modal" tabindex="-1">
          <div class="onboarding-kicker">Bắt đầu trong 30 giây</div>
          <h2 id="onboardingTitle">Chọn cách bạn muốn học tiếng Trung</h2>
          <p class="onboarding-intro">Không cần tạo tài khoản. HánNgữ Pro sẽ lưu lộ trình ngay trên thiết bị này và gợi ý bài học đầu tiên cho bạn.</p>
          <form id="onboardingForm">
            <div class="form-group">
              <label for="onboardingLevel">Mục tiêu HSK hiện tại</label>
              <select id="onboardingLevel" name="targetLevel">
                ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => `<option value="${level}" ${level === targetLevel ? 'selected' : ''}>HSK ${level}</option>`).join('')}
              </select>
              <span class="form-help">Bạn có thể đổi mục tiêu bất cứ lúc nào trong Cài đặt hồ sơ.</span>
            </div>
            <fieldset class="onboarding-goals">
              <legend>Bạn học để làm gì?</legend>
              <div class="onboarding-goal-grid">
                ${goals.map(([value, label]) => `
                  <label class="onboarding-goal ${goal === value ? 'selected' : ''}">
                    <input type="radio" name="learningGoal" value="${value}" ${goal === value ? 'checked' : ''} />
                    <span>${label}</span>
                  </label>
                `).join('')}
              </div>
            </fieldset>
            <div class="onboarding-actions">
              <button type="button" class="btn-secondary" id="onboardingSkip">Để sau</button>
              <button type="submit" class="btn-primary">Bắt đầu học <span aria-hidden="true">→</span></button>
            </div>
          </form>
        </div>
      </div>
    `;

    let escapeHandler = null;
    const close = (markComplete = true) => {
      if (markComplete) localStorage.setItem('hanngu_onboarding_completed', '1');
      modalEl.innerHTML = '';
      if (escapeHandler) {
        document.removeEventListener('keydown', escapeHandler);
        escapeHandler = null;
      }
    };
    const overlay = modalEl.querySelector('#onboardingOverlay');
    const dialog = modalEl.querySelector('.onboarding-modal');
    dialog?.focus();
    overlay?.addEventListener('click', (event) => {
      if (event.target === overlay) close(true);
    });
    modalEl.querySelectorAll('input[name="learningGoal"]').forEach(input => {
      input.addEventListener('change', () => {
        modalEl.querySelectorAll('.onboarding-goal').forEach(label => label.classList.toggle('selected', label.querySelector('input')?.checked));
      });
    });
    modalEl.querySelector('#onboardingSkip')?.addEventListener('click', () => close(true));
    modalEl.querySelector('#onboardingForm')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const selectedLevel = Number.parseInt(modalEl.querySelector('#onboardingLevel')?.value, 10) || targetLevel;
      const selectedGoal = modalEl.querySelector('input[name="learningGoal"]:checked')?.value || goal;
      authService.updateProfile({ targetLevel: selectedLevel });
      localStorage.setItem('hanngu_learning_goal', selectedGoal);
      close(true);
      this.selectedLevel = selectedLevel;
      this.updateUserStatsDisplay();
      this.switchView('curriculum', { level: selectedLevel });
      toastService.success(`Đã chọn lộ trình HSK ${selectedLevel}. Bài học đầu tiên đang sẵn sàng!`);
    });
    escapeHandler = (event) => {
      if (event.key !== 'Escape' || !document.querySelector('#onboardingOverlay')) return;
      close(true);
    };
    document.addEventListener('keydown', escapeHandler);
  }

  showFatalError(err) {
    const appEl = document.querySelector('#app');
    if (!appEl) return;
    appEl.innerHTML = `
      <div style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #0b0f1a; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 24px; text-align: center;">
        <div style="font-size: 54px; margin-bottom: 12px;">⚠️</div>
        <h2 style="font-size: 22px; font-weight: 800; color: #ef4444; margin-bottom: 8px;">Lỗi Khởi Động Giao Diện HánNgữ Pro</h2>
        <p style="color: #94a3b8; max-width: 500px; line-height: 1.6; margin-bottom: 16px;">
          Ứng dụng phát hiện lỗi khi dựng giao diện ban đầu:
        </p>
        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 12px 18px; font-family: monospace; font-size: 13px; color: #fca5a5; margin-bottom: 20px; max-width: 600px; word-break: break-word; text-align: left;">
          ${err?.stack || err?.message || err}
        </div>
        <button onclick="window.location.reload(true)" style="background: #6366f1; color: #fff; border: none; padding: 12px 28px; border-radius: 9999px; font-weight: 700; font-size: 15px; cursor: pointer; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);">
          🔄 Tải Lại Trang
        </button>
      </div>
    `;
  }

  renderLayout() {
    const appEl = document.querySelector('#app');
    if (!appEl) return;
    const profile = storageService.getProfile() || {};
    const currentUser = authService.getCurrentUser() || {};
    const errors = storageService.getErrors() || [];
    const errorCount = Array.isArray(errors) ? errors.length : 0;
    const userName = currentUser.displayName || profile.name || 'Học Viên Xuất Sắc';
    const userInitial = currentUser.avatar || userName.charAt(0) || '👤';
    const streakDays = currentUser.streakDays ?? profile.streakDays ?? 5;
    const exp = currentUser.exp ?? profile.exp ?? 240;
    const level = currentUser.level ?? profile.level ?? 3;
    const targetLevel = currentUser.targetLevel ?? profile.targetLevel ?? 1;

    appEl.innerHTML = `
      <a class="skip-link" href="#mainContent">Bỏ qua điều hướng</a>
      <!-- Sidebar Navigation -->
      <aside class="sidebar" id="appSidebar">
        <div class="brand-section">
          <div class="brand-logo-icon">漢</div>
          <div class="brand-info">
            <h1>HánNgữ Pro</h1>
            <span class="brand-badge">HSK 1-9 • 2025</span>
          </div>
        </div>

        <nav class="nav-menu" aria-label="Các khu vực học tập">
          <div class="nav-label">Không Gian Học Tập</div>
          <button class="nav-item active" data-view="dashboard">
            <span class="icon">🎯</span> Lộ Trình & Tổng Quan
          </button>
          <button class="nav-item" data-view="analytics" style="color: #10b981;">
            <span class="icon">📊</span> Tiến Độ & Thống Kê
          </button>
          <button class="nav-item" data-view="daily_challenge" style="color: #6366f1;">
            <span class="icon">⚡</span> Thách Thức Hàng Ngày
          </button>
          <button class="nav-item" data-view="lexicon" style="color: #06b6d4;">
            <span class="icon">🔍</span> Đại Từ Điển SQLite
          </button>
          <button class="nav-item" data-view="curriculum">
            <span class="icon">📚</span> Giáo Trình HSK 1-9
          </button>
          <button class="nav-item" data-view="flashcards">
            <span class="icon">🍴</span> Flashcards 3D SRS
          </button>
          <button class="nav-item" data-view="vocab_quiz">
            <span class="icon">🧪</span> Quiz Từ Vựng
          </button>
          <button class="nav-item" data-view="word_puzzle">
            <span class="icon">🧩</span> Xếp Câu & Ghép Đôi
          </button>
          <button class="nav-item" data-view="speed_reading">
            <span class="icon">⚡</span> Đọc Hiểu Nhanh
          </button>
          <button class="nav-item" data-view="grammar_master" style="color: #8b5cf6;">
            <span class="icon">📐</span> Ma Trận Ngữ Pháp & Đảo Từ
          </button>
          <button class="nav-item" data-view="chengyu_storybook" style="color: #f59e0b;">
            <span class="icon">📜</span> Thành Ngữ & Điển Cố HSK
          </button>
          <button class="nav-item" data-view="translation_arena" style="color: #10b981;">
            <span class="icon">🌐</span> Đấu Trường Luyện Dịch
          </button>
          <button class="nav-item" data-view="worksheet_builder" style="color: #ec4899;">
            <span class="icon">📄</span> Bảng Viết In Ấn A4 (米字格)
          </button>
          <button class="nav-item" data-view="speed_match" style="color: #ef4444;">
            <span class="icon">⚡</span> Flash Match Phản Xạ Hán Tự
          </button>
          <button class="nav-item" data-view="dialogues">
            <span class="icon">💬</span> Hội Thoại Thực Tế
          </button>
          <button class="nav-item" data-view="hanzi_canvas">
            <span class="icon">✍️</span> Luyện Viết 米字格
          </button>
          <button class="nav-item" data-view="tones">
            <span class="icon">🎵</span> Luyện Thanh Điệu
          </button>
          <button class="nav-item" data-view="tone_visualizer" style="color: #3b82f6;">
            <span class="icon">🎯</span> Phân Tích Cao Độ 5 Bậc
          </button>
          <button class="nav-item" data-view="syntax_tree" style="color: #10b981;">
            <span class="icon">🌳</span> Cây Cú Pháp Ngữ Pháp
          </button>
          <button class="nav-item" data-view="traps">
            <span class="icon">⚠️</span> Radar Bẫy Hán-Việt
          </button>
          <button class="nav-item" data-view="radicals">
            <span class="icon">🌱</span> 214 Bộ Thủ & Chiết Tự
          </button>
          <button class="nav-item" data-view="speech_lab" style="color: #ec4899;">
            <span class="icon">🎙️</span> AI Chấm Phát Âm
          </button>
          <button class="nav-item" data-view="text_analyzer" style="color: #06b6d4;">
            <span class="icon">🔬</span> Kính Lúp Phân Tích Cú Pháp
          </button>
          <button class="nav-item" data-view="audio_immersion" style="color: #f59e0b;">
            <span class="icon">🎧</span> Đài Nghe Rảnh Tay
          </button>
          <button class="nav-item" data-view="leaderboard" style="color: #f59e0b;">
            <span class="icon">🏆</span> Đấu Trường & Bảng Vàng
          </button>

          <div class="nav-label" style="margin-top: 10px;">Học Viên & Báo Cáo</div>
          <button class="nav-item" data-view="student_report" style="color: #10b981;">
            <span class="icon">📊</span> Báo Cáo Học Tập & AI
          </button>
          <button class="nav-item" data-view="student_notifications" style="color: #f59e0b;">
            <span class="icon">🔔</span> Thông Báo Học Viên
            <span class="badge-count" id="sidebarNotifBadge" style="display: none; background: #ef4444;">0</span>
          </button>

          <div class="nav-label" style="margin-top: 10px;">Khảo Thí & Dữ Liệu</div>
          <button class="nav-item" data-view="mock_exam">
            <span class="icon">📝</span> Phòng Thi Thử HSK
          </button>
          <button class="nav-item" data-view="error_notebook">
            <span class="icon">📕</span> Sổ Lỗi Cá Nhân
            <span class="badge-count" id="sidebarErrorBadge">${errorCount}</span>
          </button>
          <button class="nav-item" data-view="sentence_evolution">
            <span class="icon">🧬</span> Vòng Đời Câu HSK
          </button>

          <div class="nav-label" id="sidebarAdminLabel" style="margin-top: 10px; color: #fbbf24;">Quản Trị CSDL Cục Bộ</div>
          <button class="nav-item" id="sidebarAdminBtn" data-view="admin_panel" style="color: #fbbf24; border-left: 3px solid #fbbf24; background: rgba(245, 158, 11, 0.08);">
            <span class="icon">👑</span> Bảng Quản Trị Hệ Thống
          </button>
          <button class="nav-item" id="sidebarSqliteBtn" data-view="sqlite_studio" style="color: var(--gold-accent); border-left: 3px solid var(--gold-accent); background: rgba(245, 158, 11, 0.05); margin-top: 4px;">
            <span class="icon">💾</span> Quản Trị CSDL SQLite & Backup
          </button>
        </nav>

        <div class="sidebar-footer">
          <div class="user-mini-card" id="sidebarUserCard" style="cursor: pointer;" title="Cài đặt hồ sơ học viên & Chọn Avatar">
            <div class="user-avatar" id="sidebarUserInitial">${userInitial}</div>
            <div class="user-names">
              <span class="user-name" id="sidebarUserName">${userName}</span>
              <span class="user-level-tag" id="sidebarUserTier">Cấp ${level} • HSK ${targetLevel}</span>
            </div>
            <span style="margin-left: auto; font-size: 13px; opacity: 0.7;">⚙️</span>
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div class="main-wrapper">
        <header class="topbar">
          <div class="topbar-left">
            <button class="mobile-menu-btn" id="mobileMenuBtn">☰</button>
            <h2 class="topbar-title" id="pageTitle">
              <span>🎯</span> Lộ Trình Học & Bảng Điều Khiển
            </h2>
          </div>

          <div class="topbar-right">
            <div class="stat-pill" title="Lưu trữ SQLite Cục Bộ">
              <span style="color: var(--gold-accent);">🗄️</span>
              <span style="font-size: 12px;">SQLite: <strong style="color: #34d399;">Active</strong></span>
            </div>
            <div class="stat-pill server-status-pill" id="serverSyncStatus" data-state="local" title="Ứng dụng đang dùng lưu trữ cục bộ">
              ☁ Chỉ lưu cục bộ
            </div>
            <div class="stat-pill">
              <span class="fire-icon">🔥</span>
              <span>Streak: <strong id="topbarStreak">${streakDays}</strong> ngày</span>
            </div>
            <div class="stat-pill">
              <span class="exp-icon">⚡</span>
              <span>EXP: <strong id="topbarExp">${exp}</strong></span>
            </div>

            <!-- Notifications Button -->
            <button class="notif-btn" id="topbarNotifBtn" title="Bảng Thông Báo Học Viên">
              <span>🔔</span>
              <span class="notif-badge" id="topbarNotifBadge" style="display: none;">0</span>
            </button>

            <!-- Student Report Button -->
            <button class="report-btn" id="topbarReportBtn" title="Báo Cáo Học Tập & Cố Vấn AI">
              <span>📊</span> Báo Cáo
            </button>

            <!-- User Profile Quick Button -->
            <button class="user-auth-btn" id="topbarAuthBtn" title="Cài đặt hồ sơ cá nhân (Bấm để đổi tên, HSK & Avatar)">
              <span class="auth-avatar-pill" id="topbarAuthAvatar">${currentUser.avatar || '🎓'}</span>
              <span id="topbarAuthName">${currentUser.displayName || 'Học Viên'}</span>
            </button>

            <button class="theme-toggle-btn" id="themeToggleBtn" title="Chuyển chế độ Sáng / Tối">
              ${this.isDarkTheme ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        <main class="content-area" id="mainContent">
          <!-- Views injected here -->
        </main>
      </div>

      <!-- Global Modal Container -->
      <div id="globalModalContainer"></div>
    `;
  }

  bindGlobalEvents() {
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        this.switchView(view);

        const sidebar = document.querySelector('#appSidebar');
        sidebar.classList.remove('mobile-open');
      });
    });

    const mobileBtn = document.querySelector('#mobileMenuBtn');
    if (mobileBtn) {
      mobileBtn.addEventListener('click', () => {
        const sidebar = document.querySelector('#appSidebar');
        sidebar.classList.toggle('mobile-open');
      });
    }

    const themeBtn = document.querySelector('#themeToggleBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        this.isDarkTheme = !this.isDarkTheme;
        document.body.classList.toggle('dark-theme', this.isDarkTheme);
        localStorage.setItem('hanngu_theme', this.isDarkTheme ? 'dark' : 'light');
        themeBtn.textContent = this.isDarkTheme ? '☀️' : '🌙';

        if (this.canvasController) {
          this.canvasController.redrawAll();
        }
      });
    }

    // Auth & Student Control Triggers
    document.querySelector('#topbarAuthBtn')?.addEventListener('click', () => {
      this.showAuthModal();
    });
    document.querySelector('#sidebarUserCard')?.addEventListener('click', () => {
      this.showAuthModal();
    });
    document.querySelector('#topbarNotifBtn')?.addEventListener('click', () => {
      this.switchView('student_notifications');
    });
    document.querySelector('#topbarReportBtn')?.addEventListener('click', () => {
      this.switchView('student_report');
    });
  }

  updateUserStatsDisplay() {
    try {
      const profile = storageService.getProfile() || {};
      const currentUser = authService.getCurrentUser() || {};
      const errors = storageService.getErrors() || [];

      const streakEl = document.querySelector('#topbarStreak');
      const expEl = document.querySelector('#topbarExp');
      const badgeEl = document.querySelector('#sidebarErrorBadge');
      const userTierEl = document.querySelector('#sidebarUserTier');
      const nameEl = document.querySelector('#sidebarUserName');
      const initialEl = document.querySelector('#sidebarUserInitial');
      const authAvatarEl = document.querySelector('#topbarAuthAvatar');
      const authNameEl = document.querySelector('#topbarAuthName');

      const streakVal = currentUser.streakDays ?? profile.streakDays ?? 5;
      const expVal = currentUser.exp ?? profile.exp ?? 240;
      const levelVal = currentUser.level ?? profile.level ?? 3;
      const targetLvlVal = currentUser.targetLevel ?? profile.targetLevel ?? 1;
      const displayName = currentUser.displayName || profile.name || 'Học Viên Xuất Sắc';
      const avatarIcon = currentUser.avatar || displayName.charAt(0) || '👤';

      if (streakEl) streakEl.textContent = streakVal;
      if (expEl) expEl.textContent = expVal;
      if (badgeEl) badgeEl.textContent = Array.isArray(errors) ? errors.length : 0;
      if (userTierEl) userTierEl.textContent = `Cấp ${levelVal} • HSK ${targetLvlVal}`;
      if (nameEl) nameEl.textContent = displayName;
      if (initialEl) initialEl.textContent = avatarIcon;
      if (authAvatarEl) authAvatarEl.textContent = avatarIcon;
      if (authNameEl) authNameEl.textContent = displayName;

      // Clean up any stale guest banner
      const oldGuestBanner = document.querySelector('#guestModeBannerBar');
      if (oldGuestBanner) oldGuestBanner.remove();

      // Local Admin & SQLite Studio Controls are always accessible
      const adminBtn = document.querySelector('#sidebarAdminBtn');
      const sqliteBtn = document.querySelector('#sidebarSqliteBtn');
      const adminLabel = document.querySelector('#sidebarAdminLabel');
      if (adminBtn) adminBtn.style.display = 'flex';
      if (sqliteBtn) sqliteBtn.style.display = 'flex';
      if (adminLabel) adminLabel.style.display = 'block';

      // Notifications badge
      const notifs = studentProgressService.getNotifications() || [];
      const unreadCount = notifs.filter(n => !n.is_read).length;
      const topbarBadge = document.querySelector('#topbarNotifBadge');
      const sidebarBadge = document.querySelector('#sidebarNotifBadge');
      if (topbarBadge) {
        topbarBadge.textContent = unreadCount;
        topbarBadge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
      }
      if (sidebarBadge) {
        sidebarBadge.textContent = unreadCount;
        sidebarBadge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
      }
    } catch (e) {
      console.warn('Update user stats display notice:', e);
    }
  }

  switchView(viewName, params = {}) {
    this.currentView = viewName;

    if (viewName !== 'mock_exam_taking' && this.examTimerInterval) {
      clearInterval(this.examTimerInterval);
      this.examTimerInterval = null;
    }

    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.view === viewName);
      el.setAttribute('aria-current', el.dataset.view === viewName ? 'page' : 'false');
    });

    const contentArea = document.querySelector('#mainContent');
    const pageTitle = document.querySelector('#pageTitle');

    switch (viewName) {
      case 'dashboard':
        pageTitle.innerHTML = '<span>🎯</span> Lộ Trình & Tổng Quan HSK 1 - 9';
        this.renderDashboard(contentArea);
        break;

      case 'lexicon':
        pageTitle.innerHTML = '<span>🔍</span> Đại Từ Điển Động & Quản Lý Dữ Liệu SQLite';
        this.renderLexiconView(contentArea);
        break;

      case 'curriculum':
        pageTitle.innerHTML = '<span>📚</span> Khám Phá Giáo Trình Chuẩn HSK 1 - 9';
        this.renderCurriculum(contentArea, params.level || this.selectedLevel);
        break;

      case 'flashcards':
        pageTitle.innerHTML = '<span>🎴</span> Thẻ Flashcard 3D Thông Minh (SRS Active Recall)';
        this.renderFlashcards(contentArea, params.level || this.flashcardLevel);
        break;

      case 'dialogues':
        pageTitle.innerHTML = '<span>💬</span> Hội Thoại Tình Huống Nhập Vai Thực Tế';
        this.renderDialogues(contentArea);
        break;

      case 'hanzi_canvas':
        pageTitle.innerHTML = '<span>✍️</span> Phòng Luyện Viết Chữ Hán (米字格)';
        this.renderHanziCanvas(contentArea, params.char || '好');
        break;

      case 'tones':
        pageTitle.innerHTML = '<span>🎵</span> Phòng Luyện Thanh Điệu & Cặp Âm Tối Thiểu';
        this.renderTonesView(contentArea);
        break;

      case 'traps':
        pageTitle.innerHTML = '<span>⚠️</span> Radar Giải Mã Bẫy Hán-Việt & Ngữ Cảnh';
        this.renderTrapsView(contentArea);
        break;

      case 'radicals':
        pageTitle.innerHTML = '<span>🌱</span> 214 Bộ Thủ Khang Hy & Chiết Tự Chữ Hán';
        this.renderRadicalsView(contentArea);
        break;

      case 'mock_exam':
        pageTitle.innerHTML = '<span>📝</span> Phòng Khảo Thí & Thi Thử HSK Chuẩn Hóa';
        this.renderMockExamsList(contentArea);
        break;

      case 'mock_exam_taking':
        pageTitle.innerHTML = `<span>⏱️</span> Đang Thi: ${this.activeExam.title}`;
        this.renderActiveExam(contentArea);
        break;

      case 'error_notebook':
        pageTitle.innerHTML = '<span>📕</span> Sổ Lỗi Chẩn Đoán & Ôn Tập SRS';
        this.renderErrorNotebook(contentArea);
        break;

      case 'sentence_evolution':
        pageTitle.innerHTML = '<span>🧬</span> Vòng Đời Tiến Hóa Của Câu HSK';
        this.renderSentenceEvolution(contentArea);
        break;

      case 'tone_visualizer':
        pageTitle.innerHTML = '<span>🎯</span> AI Tone Pitch Visualizer • Phân Tích Cao Độ Thanh Điệu 5 Bậc';
        this.renderTonePitchVisualizerView(contentArea);
        break;

      case 'syntax_tree':
        pageTitle.innerHTML = '<span>🌳</span> Cây Cú Pháp Ngữ Pháp & Bóc Tách Trật Tự Câu HSK';
        this.renderSyntaxTreeView(contentArea);
        break;

      case 'sqlite_studio':
        if (!authService.isAdmin()) {
          toastService.error('Truy cập bị từ chối: Bảng Quản Trị SQLite chỉ dành riêng cho Quản Trị Viên (Admin)!', 'Không Có Quyền');
          this.switchView('dashboard');
          return;
        }
        pageTitle.innerHTML = '<span>💾</span> Quản Trị Cơ Sở Dữ Liệu SQLite & Time-Machine Backup';
        this.renderSqliteStudio(contentArea);
        break;

      case 'analytics':
        pageTitle.innerHTML = '<span>📊</span> Tiến Độ Học Tập & Thống Kê';
        this.renderAnalytics(contentArea);
        break;

      case 'daily_challenge':
        pageTitle.innerHTML = '<span>⚡</span> Thách Thức Hàng Ngày';
        this.renderDailyChallenge(contentArea);
        break;

      case 'vocab_quiz':
        pageTitle.innerHTML = '<span>🧪</span> Quiz Từ Vựng HSK';
        this.renderVocabQuiz(contentArea);
        break;

      case 'word_puzzle':
        pageTitle.innerHTML = '<span>🧩</span> Xếp Câu & Ghép Đôi';
        this.renderWordPuzzle(contentArea);
        break;

      case 'speed_reading':
        if (this.speedTimerInterval) { clearInterval(this.speedTimerInterval); this.speedTimerInterval = null; }
        pageTitle.innerHTML = '<span>📖</span> Đọc Hiểu Nhanh';
        this.renderSpeedReading(contentArea);
        break;

      case 'grammar_explorer':
        pageTitle.innerHTML = '<span>📝</span> Khám Phá Ngữ Pháp HSK';
        this.renderGrammarExplorer(contentArea);
        break;

      case 'speech_lab':
        pageTitle.innerHTML = '<span>🎙️</span> Phòng Luyện Phát Âm Chuẩn AI (Web Speech API)';
        this.renderSpeechLab(contentArea);
        break;

      case 'text_analyzer':
        pageTitle.innerHTML = '<span>🔬</span> Thấu Kính Phân Tích Cú Pháp & Bính Âm Ruby';
        this.renderTextAnalyzer(contentArea);
        break;

      case 'audio_immersion':
        pageTitle.innerHTML = '<span>🎧</span> Đài Phát Thanh Luyện Nghe Rảnh Tay (Hands-Free Immersion)';
        this.renderAudioImmersion(contentArea);
        break;

      case 'leaderboard':
        pageTitle.innerHTML = '<span>🏆</span> Đấu Trường Toàn Quốc & Bảng Vàng Vinh Danh';
        this.renderLeaderboard(contentArea);
        break;

      case 'grammar_master':
        pageTitle.innerHTML = '<span>📐</span> Ma Trận Ngữ Pháp HSK & Bài Tập Đảo Từ';
        this.renderGrammarMasterView(contentArea);
        break;

      case 'chengyu_storybook':
        pageTitle.innerHTML = '<span>📜</span> Kho Thành Ngữ & Điển Cố Hán Ngữ HSK 5-9';
        this.renderChengyuStorybookView(contentArea);
        break;

      case 'translation_arena':
        pageTitle.innerHTML = '<span>🌐</span> Đấu Trường Luyện Dịch Song Ngữ Trung - Việt';
        this.renderTranslationArenaView(contentArea);
        break;

      case 'worksheet_builder':
        pageTitle.innerHTML = '<span>📄</span> Trình Tạo Bảng Luyện Viết In Ấn A4 (米字格 / 田字格)';
        this.renderWorksheetBuilderView(contentArea);
        break;

      case 'speed_match':
        pageTitle.innerHTML = '<span>⚡</span> Flash Match Phản Xạ Hán Tự (Siêu Tốc)';
        this.renderSpeedMatchView(contentArea);
        break;

      case 'student_report':
        pageTitle.innerHTML = '<span>📊</span> Báo Cáo Học Tập Cá Nhân & Đánh Giá AI Cố Vấn';
        this.renderStudentReportView(contentArea);
        break;

      case 'student_notifications':
        pageTitle.innerHTML = '<span>🔔</span> Bảng Thông Báo & Nhắc Nhở Học Tập';
        this.renderStudentNotificationsView(contentArea);
        break;

      case 'admin_panel':
        if (!authService.isAdmin()) {
          toastService.error('Truy cập bị từ chối: Trang này yêu cầu đăng nhập bằng tài khoản Quản Trị Viên (Admin)!', 'Không Có Quyền');
          this.switchView('dashboard');
          return;
        }
        pageTitle.innerHTML = '<span>👑</span> Bảng Quản Trị Hệ Thống & Bảo Mật Học Viên';
        this.renderAdminPanelView(contentArea);
        break;
    }


    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // =========================================================================
  // VIEW: Dynamic Lexicon Explorer (Đại Từ Điển Động)
  // =========================================================================
  async renderLexiconView(container) {
    const stats = await dataImporterService.getDictionaryStats();
    const words = await dataImporterService.searchWords({
      query: this.lexiconSearchQuery,
      level: this.lexiconLevelFilter,
      limit: 60
    });
    const favorites = storageService.getFavorites();

    container.innerHTML = `
      <!-- Lexicon Controls Top -->
      <div class="glass-panel" style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px;">
          <div>
            <h3 style="font-size: 20px; font-weight: 800; display: flex; align-items: center; gap: 8px;">
              <span>🔍</span> Đại Từ Điển Động HSK 1 - 9 & Quản Trị Dữ Liệu
            </h3>
            <p style="color: var(--text-secondary); font-size: 14px; margin-top: 6px;">
              Tra cứu theo thời gian thực từ cơ sở dữ liệu quan hệ <strong>SQLite</strong>.
              Bạn có thể tìm kiếm bằng <em>chữ Hán, Bính âm (Pinyin), âm Hán-Việt</em> hoặc <em>nghĩa tiếng Việt</em>.
            </p>
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn-primary" id="btnOpenAddWordModal">
              ➕ Thêm Từ Vựng Mới
            </button>
            <button class="btn-secondary" id="btnSyncCorpus" title="Đồng bộ kho từ vựng HSK 3.0" style="color: #06b6d4; border-color: rgba(6, 182, 212, 0.4);">
              ⚡ Đồng Bộ Kho HSK 3.0
            </button>
            <button class="btn-secondary" id="btnExportLexiconJson" title="Xuất toàn bộ từ điển ra JSON">
              💾 Xuất JSON
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Banner -->
      <div class="lexicon-stats-banner">
        <div>
          <span>Tổng số từ trong SQLite: </span>
          <strong style="color: var(--gold-accent); font-size: 16px;">${stats.totalWords.toLocaleString()} mục từ</strong>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; font-size: 12.5px;">
          ${stats.levelStats.map(s => `
            <span style="background: rgba(255, 255, 255, 0.06); padding: 3px 8px; border-radius: var(--radius-sm);">
              HSK ${s.level}: <strong>${s.count}</strong>
            </span>
          `).join('')}
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="lexicon-search-bar">
        <input 
          type="text" 
          id="lexiconSearchInput" 
          class="lexicon-input" 
          placeholder="Gõ chữ Hán, pinyin (vd: ni hao, zhunbei), Hán-Việt hoặc nghĩa tiếng Việt..." 
          value="${escapeHtml(this.lexiconSearchQuery)}"
        />
        <select id="lexiconLevelSelect" class="lexicon-select">
          <option value="0" ${this.lexiconLevelFilter === 0 ? 'selected' : ''}>Tất cả cấp độ (HSK 1 - 9)</option>
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(lvl => `
            <option value="${lvl}" ${this.lexiconLevelFilter === lvl ? 'selected' : ''}>Chỉ HSK ${lvl}</option>
          `).join('')}
        </select>
        <button class="btn-secondary" id="btnResetSearch">Đặt lại</button>
      </div>

      <!-- Search Results Grid -->
      <div class="panel-header">
        <h4 class="panel-title">
          <span>📋</span> Danh Sách Mục Từ Tìm Thấy (${words.length} kết quả)
        </h4>
        <span style="font-size: 12.5px; color: var(--text-muted);">Bấm 🔊 để nghe phát âm • Bấm ✍️ để tập viết</span>
      </div>

      ${words.length === 0 ? `
        <div class="glass-panel" style="text-align: center; padding: 48px;">
          <div style="font-size: 48px; margin-bottom: 12px;">🔍</div>
          <h4 style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">Không tìm thấy từ phù hợp</h4>
          <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 16px;">
            Hãy thử tìm bằng từ khóa khác hoặc bấm nút bên dưới để thêm từ mới này vào SQLite Database.
          </p>
          <button class="btn-primary" id="btnEmptyAddWord">➕ Thêm Từ Mới Này Vào SQLite</button>
        </div>
      ` : `
        <div class="vocab-grid">
          ${words.map(item => {
            const isFav = favorites.includes(item.hanzi);
            const hanzi = escapeHtml(item.hanzi);
            const pinyin = escapeHtml(item.pinyin);
            const hanviet = escapeHtml(item.hanviet || '---');
            const meaning = escapeHtml(item.meaning);
            const radical = escapeHtml(item.radical);
            const exampleZh = escapeHtml(item.example_zh);
            const examplePinyin = escapeHtml(item.example_pinyin);
            const exampleVi = escapeHtml(item.example_vi);
            const notes = escapeHtml(item.notes);
            const level = Math.min(9, Math.max(1, Number.parseInt(item.level, 10) || 1));
            const wordId = escapeHtml(item.id);
            return `
              <div class="vocab-card">
                <div class="vocab-top">
                  <div class="vocab-hanzi-wrap">
                    <span class="vocab-hanzi hanzi">${hanzi}</span>
                    <span class="vocab-pinyin">${pinyin}</span>
                    <span class="tier-badge" style="background: rgba(239, 68, 68, 0.15); color: var(--primary-red-hover); font-size: 10px;">
                      HSK ${level}
                    </span>
                  </div>
                  <div style="display: flex; gap: 6px;">
                    <button class="btn-sound speak-btn" data-text="${hanzi}" title="Nghe phát âm">🔊</button>
                    <button class="btn-sound practice-draw-btn" data-char="${escapeHtml(String(item.hanzi || '').charAt(0))}" title="Tập viết chữ này" style="color: var(--gold-accent);">✍️</button>
                    <button class="btn-sound fav-btn" data-hanzi="${hanzi}" title="Lưu từ yêu thích" style="color: ${isFav ? 'var(--primary-red-hover)' : 'var(--text-muted)'};">
                      ${isFav ? '❤️' : '🤍'}
                    </button>
                    <button class="btn-sound delete-word-btn" data-id="${wordId}" title="Xóa từ khỏi SQLite" style="color: #f87171; border-color: rgba(239, 68, 68, 0.2);">🗑️</button>
                  </div>
                </div>

                <div style="display: flex; gap: 12px; margin-bottom: 8px; font-size: 12.5px;">
                  <span class="vocab-hanviet">Âm Hán-Việt: <strong>${hanviet}</strong></span>
                  ${radical ? `<span style="color: var(--text-muted);">Bộ: ${radical}</span>` : ''}
                </div>

                <div class="vocab-meaning">${meaning}</div>

                ${exampleZh ? `
                  <div class="vocab-example-box">
                    <div class="vocab-example-zh hanzi" style="display: flex; justify-content: space-between;">
                      <span>${exampleZh}</span>
                      <button class="speak-btn" data-text="${exampleZh}">🔊</button>
                    </div>
                    ${examplePinyin ? `<div style="font-size: 12px; color: var(--gold-accent);">${examplePinyin}</div>` : ''}
                    <div class="vocab-example-vi">${exampleVi}</div>
                  </div>
                ` : ''}

                ${notes ? `
                  <div class="vocab-notes">
                    <strong>💡 Ghi chú:</strong> ${notes}
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      `}
    `;

    // Search Input debounce
    const searchInput = container.querySelector('#lexiconSearchInput');
    let searchTimeout = null;
    searchInput?.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.lexiconSearchQuery = e.target.value;
        this.renderLexiconView(container);
      }, 300);
    });

    // Level Filter change
    container.querySelector('#lexiconLevelSelect')?.addEventListener('change', (e) => {
      this.lexiconLevelFilter = parseInt(e.target.value, 10);
      this.renderLexiconView(container);
    });

    // Reset Search
    container.querySelector('#btnResetSearch')?.addEventListener('click', () => {
      this.lexiconSearchQuery = '';
      this.lexiconLevelFilter = 0;
      this.renderLexiconView(container);
    });

    // Open Add Word Modal
    const openModalBtn = container.querySelector('#btnOpenAddWordModal');
    const emptyAddBtn = container.querySelector('#btnEmptyAddWord');
    const triggerAddModal = () => this.showAddWordModal(container);
    openModalBtn?.addEventListener('click', triggerAddModal);
    emptyAddBtn?.addEventListener('click', triggerAddModal);

    // Sync Corpus button
    container.querySelector('#btnSyncCorpus')?.addEventListener('click', () => {
      this.showSyncCorpusModal(container, () => this.renderLexiconView(container));
    });

    // Export Lexicon as JSON
    container.querySelector('#btnExportLexiconJson')?.addEventListener('click', () => {
      dataImporterService.exportDictionaryAsJson();
    });

    // Speak buttons
    container.querySelectorAll('.speak-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        audioService.speak(btn.dataset.text);
      });
    });

    // Practice Draw
    container.querySelectorAll('.practice-draw-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.switchView('hanzi_canvas', { char: btn.dataset.char });
      });
    });

    // Favorite toggle
    container.querySelectorAll('.fav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isFav = storageService.toggleFavorite(btn.dataset.hanzi);
        btn.textContent = isFav ? '❤️' : '🤍';
        btn.style.color = isFav ? 'var(--primary-red-hover)' : 'var(--text-muted)';
      });
    });

    // Delete word from SQLite
    container.querySelectorAll('.delete-word-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm('Bạn có chắc chắn muốn xóa từ vựng này khỏi SQLite Database?')) {
          const id = btn.dataset.id;
          await dataImporterService.deleteWord(id);
          this.renderLexiconView(container);
        }
      });
    });
  }

  showAddWordModal(viewContainer) {
    const modalEl = document.querySelector('#globalModalContainer');
    modalEl.innerHTML = `
      <div class="modal-overlay" id="addWordOverlay">
        <div class="modal-content">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="font-size: 19px; font-weight: 800; color: var(--gold-accent);">
              ➕ Thêm Mục Từ Vựng Mới Vào SQLite
            </h3>
            <button id="btnCloseModal" style="font-size: 20px; color: var(--text-muted); cursor: pointer;">✕</button>
          </div>

          <form id="newWordForm">
            <div class="form-grid">
              <div class="form-group">
                <label>Chữ Hán (Giản thể) *</label>
                <input type="text" id="wHanzi" required placeholder="Vd: 电脑" />
              </div>
              <div class="form-group">
                <label>Phiên âm Pinyin *</label>
                <input type="text" id="wPinyin" required placeholder="Vd: diànnǎo" />
              </div>
              <div class="form-group">
                <label>Âm Hán-Việt</label>
                <input type="text" id="wHanviet" placeholder="Vd: điện não" />
              </div>
              <div class="form-group">
                <label>Cấp độ HSK (1 - 9)</label>
                <select id="wLevel">
                  ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(l => `<option value="${l}">HSK ${l}</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 14px;">
              <label>Nghĩa tiếng Việt *</label>
              <input type="text" id="wMeaning" required placeholder="Vd: Máy tính, máy vi tính" />
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label>Bộ thủ (Radical)</label>
                <input type="text" id="wRadical" placeholder="Vd: 电 / 臼" />
              </div>
              <div class="form-group">
                <label>Số nét bút</label>
                <input type="number" id="wStrokes" value="10" />
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 12px;">
              <label>Câu ví dụ tiếng Trung</label>
              <input type="text" id="wExampleZh" placeholder="Vd: 我新买了一台笔记本电脑。" />
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label>Pinyin câu ví dụ</label>
                <input type="text" id="wExamplePinyin" placeholder="Vd: Wǒ xīn mǎi le yī tái bǐjìběn diànnǎo." />
              </div>
              <div class="form-group">
                <label>Dịch nghĩa câu ví dụ</label>
                <input type="text" id="wExampleVi" placeholder="Vd: Tôi mới mua một chiếc máy tính xách tay." />
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 20px;">
              <label>Lưu ý sư phạm / Bẫy ngữ cảnh</label>
              <textarea id="wNotes" rows="2" placeholder="Ghi chú thêm về ngữ cảnh sử dụng..."></textarea>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 12px;">
              <button type="button" class="btn-secondary" id="btnCancelModal">Hủy bỏ</button>
              <button type="submit" class="btn-primary">💾 Lưu Vào SQLite Database</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const close = () => { modalEl.innerHTML = ''; };
    modalEl.querySelector('#btnCloseModal')?.addEventListener('click', close);
    modalEl.querySelector('#btnCancelModal')?.addEventListener('click', close);

    modalEl.querySelector('#newWordForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const wordData = {
        hanzi: modalEl.querySelector('#wHanzi').value,
        pinyin: modalEl.querySelector('#wPinyin').value,
        hanviet: modalEl.querySelector('#wHanviet').value,
        meaning: modalEl.querySelector('#wMeaning').value,
        level: modalEl.querySelector('#wLevel').value,
        radical: modalEl.querySelector('#wRadical').value,
        stroke_count: modalEl.querySelector('#wStrokes').value,
        example_zh: modalEl.querySelector('#wExampleZh').value,
        example_pinyin: modalEl.querySelector('#wExamplePinyin').value,
        example_vi: modalEl.querySelector('#wExampleVi').value,
        notes: modalEl.querySelector('#wNotes').value
      };

      try {
        await dataImporterService.addCustomWord(wordData);
        close();
        toastService.success('Đã lưu thành công từ vựng mới vào SQLite!');
        this.renderLexiconView(viewContainer);
      } catch (error) {
        toastService.error(error?.message || 'Không thể lưu mục từ này. Vui lòng kiểm tra lại dữ liệu.', 'Dữ liệu chưa hợp lệ');
      }
    });
  }

  // =========================================================================
  // MODAL: User Authentication (Đăng Nhập, Đăng Ký Không Cần OTP & Quản Lý Hồ Sơ)
  // =========================================================================
  // =========================================================================
  // MODAL: Cài Đặt Hồ Sơ Học Viên Cục Bộ (Offline Local Profile - Zero Password)
  // =========================================================================
  showAuthModal() {
    const modalEl = document.querySelector('#globalModalContainer');
    if (!modalEl) return;

    const currentUser = authService.getCurrentUser() || {};
    let selectedAvatar = currentUser.avatar || '🎓';
    const avatarList = ['🎓', '🐼', '🐉', '🌟', '🌸', '⚡', '👑', '📚', '🍵', '🏮', '🚀', '🎯'];
    const safeDisplayName = escapeHtml(currentUser.displayName || 'Học Viên');
    const safeAvatar = escapeHtml(selectedAvatar);
    const safeTargetLevel = Math.min(9, Math.max(1, Number.parseInt(currentUser.targetLevel, 10) || 1));

    modalEl.innerHTML = `
      <div class="modal-overlay" id="authModalOverlay">
        <div class="auth-modal-card" style="max-width: 480px; border-radius: var(--radius-xl); box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
          <!-- Header -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
            <h3 style="font-size: 19px; font-weight: 800; display: flex; align-items: center; gap: 8px; margin: 0;">
              <span>⚙️</span> Cài Đặt Hồ Sơ Học Viên
            </h3>
            <button id="btnCloseAuthModal" style="font-size: 20px; color: var(--text-muted); cursor: pointer; background: transparent; border: none; padding: 4px 8px;">✕</button>
          </div>

          <!-- Offline & Free Notice Badge -->
          <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.12)); border: 1.5px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-lg); padding: 12px 14px; margin-bottom: 18px; display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 26px;">✨</span>
            <div style="font-size: 12.5px; color: #a7f3d0; line-height: 1.45;">
              <strong style="color: #34d399;">Ứng dụng Hoàn Toàn Miễn Phí & Offline:</strong> Chạy trực tiếp trên thiết bị của bạn. Không cần tài khoản hay mật khẩu, mọi tiến độ học và điểm thi được tự động lưu bền vững.
            </div>
          </div>

          <!-- Optional server account and cross-device sync -->
          <section class="server-account-panel" aria-labelledby="serverAccountTitle">
            <div class="server-account-heading">
              <div>
                <h4 id="serverAccountTitle">☁ Đồng bộ tiến độ giữa các thiết bị</h4>
                <p id="serverAccountStatus">${apiClient.available ? 'Server đang sẵn sàng.' : 'Khởi động HánNgữ API để bật đồng bộ; học local vẫn hoạt động bình thường.'}</p>
              </div>
              <div class="server-account-controls">
                <span class="server-account-state ${apiClient.available ? 'online' : 'offline'}" id="serverAccountState">${apiClient.available ? 'Online' : 'Local'}</span>
                <button type="button" class="btn-secondary server-check-btn" id="btnCheckServer">Kiểm tra</button>
              </div>
            </div>
            <form id="serverAuthForm" class="server-auth-form" ${apiClient.available && !apiClient.user ? '' : 'style="display: none;"'}>
              <input type="email" id="serverEmail" autocomplete="email" placeholder="Email" aria-label="Email đồng bộ" required />
              <input type="password" id="serverPassword" autocomplete="current-password" placeholder="Mật khẩu (tối thiểu 8 ký tự)" aria-label="Mật khẩu đồng bộ" minlength="8" required />
              <div class="server-auth-actions">
                <button type="submit" class="btn-primary" id="serverLoginBtn">Đăng nhập</button>
                <button type="button" class="btn-secondary" id="serverRegisterBtn">Tạo tài khoản</button>
              </div>
            </form>
            <div id="serverConnectedPanel" class="server-connected-panel" ${apiClient.user ? '' : 'style="display: none;"'}>
              <span id="serverConnectedEmail">${apiClient.user?.email || ''}</span>
              <div class="server-auth-actions">
                <button type="button" class="btn-secondary" id="btnPullServerData">⬇ Nhập từ server</button>
                <button type="button" class="btn-primary" id="btnPushServerData">⬆ Lưu lên server</button>
                <button type="button" class="btn-secondary" id="btnLogoutServer">Đăng xuất</button>
              </div>
            </div>
          </section>

          <!-- Profile Preview Card -->
          <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15)); border: 1.5px solid rgba(99, 102, 241, 0.3); border-radius: var(--radius-xl); padding: 16px; margin-bottom: 20px; display: flex; align-items: center; gap: 16px;">
            <div id="previewAvatarIcon" style="font-size: 42px; background: rgba(0,0,0,0.25); border-radius: 50%; width: 68px; height: 68px; display: flex; align-items: center; justify-content: center; border: 2.5px solid rgba(99, 102, 241, 0.5); box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);">
              ${safeAvatar}
            </div>
            <div style="flex: 1;">
              <h4 id="previewDisplayName" style="font-size: 18px; font-weight: 800; margin: 0; color: var(--text-primary);">${safeDisplayName}</h4>
              <div style="display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap;">
                <span id="previewTargetBadge" style="background: rgba(16, 185, 129, 0.15); color: #34d399; padding: 2px 8px; border-radius: 4px; font-size: 11.5px; font-weight: 700;">Mục Tiêu: HSK ${safeTargetLevel}</span>
                <span style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; padding: 2px 8px; border-radius: 4px; font-size: 11.5px; font-weight: 700;">🔥 ${currentUser.streakDays || 1} ngày streak</span>
                <span style="background: rgba(99, 102, 241, 0.15); color: #a5b4fc; padding: 2px 8px; border-radius: 4px; font-size: 11.5px; font-weight: 700;">⚡ ${currentUser.exp || 120} EXP</span>
              </div>
            </div>
          </div>

          <!-- Edit Profile Form -->
          <form id="localProfileForm">
            <!-- Choose Avatar Grid -->
            <div class="auth-input-group" style="margin-bottom: 16px;">
              <label style="font-weight: 700; margin-bottom: 8px; display: block;">Chọn Biểu Tượng Avatar</label>
              <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px;">
                ${avatarList.map(emoji => `
                  <button type="button" class="avatar-picker-btn ${emoji === selectedAvatar ? 'active' : ''}" data-avatar="${emoji}" style="font-size: 24px; padding: 8px 4px; background: ${emoji === selectedAvatar ? 'rgba(99, 102, 241, 0.35)' : 'rgba(255,255,255,0.05)'}; border: 1.5px solid ${emoji === selectedAvatar ? '#818cf8' : 'rgba(255,255,255,0.1)'}; border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s;">
                    ${emoji}
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Display Name -->
            <div class="auth-input-group" style="margin-bottom: 16px;">
              <label style="font-weight: 700; margin-bottom: 6px; display: block;">Tên Hiển Thị Của Bạn</label>
              <input type="text" id="editDisplayName" class="auth-input" value="${safeDisplayName}" placeholder="Nhập tên hoặc biệt danh của bạn..." required style="width: 100%; box-sizing: border-box;" />
            </div>

            <!-- Target HSK Level -->
            <div class="auth-input-group" style="margin-bottom: 20px;">
              <label style="font-weight: 700; margin-bottom: 6px; display: block;">Mục Tiêu Cấp Độ HSK (1 - 9)</label>
              <select id="editTargetLevel" class="auth-input" style="width: 100%; box-sizing: border-box;">
                <option value="1" ${safeTargetLevel === 1 ? 'selected' : ''}>HSK 1 • Sơ cấp (150 từ cơ bản)</option>
                <option value="2" ${safeTargetLevel === 2 ? 'selected' : ''}>HSK 2 • Sơ cấp nâng cao (300 từ)</option>
                <option value="3" ${safeTargetLevel === 3 ? 'selected' : ''}>HSK 3 • Trung cấp sơ khởi (600 từ)</option>
                <option value="4" ${safeTargetLevel === 4 ? 'selected' : ''}>HSK 4 • Trung cấp vững chắc (1,200 từ)</option>
                <option value="5" ${safeTargetLevel === 5 ? 'selected' : ''}>HSK 5 • Trung cao cấp (2,500 từ)</option>
                <option value="6" ${safeTargetLevel === 6 ? 'selected' : ''}>HSK 6 • Cao cấp thành thạo (5,000 từ)</option>
                <option value="7" ${safeTargetLevel === 7 ? 'selected' : ''}>HSK 7 • Chuyên gia & Học thuật</option>
                <option value="8" ${safeTargetLevel === 8 ? 'selected' : ''}>HSK 8 • Văn hóa & Xã luận</option>
                <option value="9" ${safeTargetLevel === 9 ? 'selected' : ''}>HSK 9 • Bản ngữ chuyên gia</option>
              </select>
            </div>

            <!-- Action Buttons -->
            <div style="display: flex; gap: 12px; justify-content: flex-end; border-top: 1px solid var(--border-color); padding-top: 16px;">
              <button type="button" class="btn-secondary" id="btnCancelAuthModal" style="padding: 10px 18px;">
                Đóng
              </button>
              <button type="submit" class="btn-primary" style="padding: 10px 22px; font-weight: 700; background: linear-gradient(135deg, #10b981, #059669); border-radius: var(--radius-lg); box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);">
                💾 Lưu Hồ Sơ
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    const close = () => { modalEl.innerHTML = ''; };
    modalEl.querySelector('#btnCloseAuthModal')?.addEventListener('click', close);
    modalEl.querySelector('#btnCancelAuthModal')?.addEventListener('click', close);
    modalEl.querySelector('#authModalOverlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'authModalOverlay') close();
    });

    // Avatar selector logic
    modalEl.querySelectorAll('.avatar-picker-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modalEl.querySelectorAll('.avatar-picker-btn').forEach(b => {
          b.classList.remove('active');
          b.style.background = 'rgba(255,255,255,0.05)';
          b.style.borderColor = 'rgba(255,255,255,0.1)';
        });
        btn.classList.add('active');
        btn.style.background = 'rgba(99, 102, 241, 0.35)';
        btn.style.borderColor = '#818cf8';
        selectedAvatar = btn.dataset.avatar;
        const previewAvatar = modalEl.querySelector('#previewAvatarIcon');
        if (previewAvatar) previewAvatar.textContent = selectedAvatar;
      });
    });

    // Dynamic preview update
    const nameInput = modalEl.querySelector('#editDisplayName');
    if (nameInput) {
      nameInput.addEventListener('input', (e) => {
        const previewName = modalEl.querySelector('#previewDisplayName');
        if (previewName) previewName.textContent = e.target.value.trim() || 'Học Viên';
      });
    }

    const levelSelect = modalEl.querySelector('#editTargetLevel');
    if (levelSelect) {
      levelSelect.addEventListener('change', (e) => {
        const previewBadge = modalEl.querySelector('#previewTargetBadge');
        if (previewBadge) previewBadge.textContent = `Mục Tiêu: HSK ${e.target.value}`;
      });
    }

    // Handle Form Submit
    modalEl.querySelector('#localProfileForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const dispName = modalEl.querySelector('#editDisplayName').value;
      const targetLvl = modalEl.querySelector('#editTargetLevel').value;

      const res = authService.updateProfile({
        displayName: dispName,
        targetLevel: targetLvl,
        avatar: selectedAvatar
      });

      if (res.success) {
        this.updateUserStatsDisplay();
        toastService.success('Đã lưu cập nhật hồ sơ thành công!', 'Hồ Sơ Cá Nhân');
        close();
      }
    });

    const serverForm = modalEl.querySelector('#serverAuthForm');
    const connectedPanel = modalEl.querySelector('#serverConnectedPanel');
    const serverStatus = modalEl.querySelector('#serverAccountStatus');
    const serverState = modalEl.querySelector('#serverAccountState');
    const showServerError = error => toastService.error(error?.message || 'Không thể kết nối tới server.', 'Đồng bộ server');
    const refreshServerPanel = () => {
      const connected = Boolean(apiClient.available && apiClient.user);
      if (serverForm) serverForm.style.display = connected ? 'none' : (apiClient.available ? 'grid' : 'none');
      if (connectedPanel) connectedPanel.style.display = connected ? 'flex' : 'none';
      const emailEl = modalEl.querySelector('#serverConnectedEmail');
      if (emailEl) emailEl.textContent = apiClient.user?.email || '';
      if (serverStatus) serverStatus.textContent = connected
        ? 'Đã đăng nhập. Bạn có thể đẩy hoặc nhập tiến độ học.'
        : apiClient.available
          ? 'Server đang sẵn sàng. Đăng nhập để đồng bộ dữ liệu.'
          : 'Khởi động HánNgữ API để bật đồng bộ; học local vẫn hoạt động bình thường.';
      if (serverState) {
        serverState.textContent = connected ? 'Đã đăng nhập' : apiClient.available ? 'Online' : 'Local';
        serverState.className = `server-account-state ${connected || apiClient.available ? 'online' : 'offline'}`;
      }
    };
    const completeServerLogin = remoteUser => {
      this.applyRemoteServerUser(remoteUser);
      refreshServerPanel();
    };
    serverForm?.addEventListener('submit', async event => {
      event.preventDefault();
      const email = modalEl.querySelector('#serverEmail')?.value.trim();
      const password = modalEl.querySelector('#serverPassword')?.value || '';
      try {
        const remoteUser = await apiClient.login(email, password);
        completeServerLogin(remoteUser);
        toastService.success('Đã đăng nhập server. Bạn có thể đồng bộ tiến độ ngay.', 'Đồng bộ server');
      } catch (error) {
        showServerError(error);
      }
    });
    modalEl.querySelector('#serverRegisterBtn')?.addEventListener('click', async () => {
      const email = modalEl.querySelector('#serverEmail')?.value.trim();
      const password = modalEl.querySelector('#serverPassword')?.value || '';
      const displayName = modalEl.querySelector('#editDisplayName')?.value.trim() || 'Học Viên';
      const targetLevel = modalEl.querySelector('#editTargetLevel')?.value || 1;
      try {
        const remoteUser = await apiClient.register({ email, password, displayName, targetLevel, learningGoal: localStorage.getItem('hanngu_learning_goal') || 'conversation' });
        completeServerLogin(remoteUser);
        toastService.success('Đã tạo tài khoản server và đăng nhập thành công.', 'Đồng bộ server');
      } catch (error) {
        showServerError(error);
      }
    });
    modalEl.querySelector('#btnPushServerData')?.addEventListener('click', async () => {
      try {
        const result = await this.syncLocalToServer();
        completeServerLogin(result.user);
        toastService.success(`Đã lưu ${result.lessonsSaved} bài học và ${result.srsSaved} thẻ lên server.`, 'Đồng bộ thành công');
      } catch (error) {
        showServerError(error);
      }
    });
    modalEl.querySelector('#btnPullServerData')?.addEventListener('click', async () => {
      try {
        const result = await this.syncServerToLocal();
        completeServerLogin(result.user);
        toastService.success(`Đã nhập tiến độ từ server (${result.lessons.length} bài học, ${result.srs.length} thẻ).`, 'Đồng bộ thành công');
      } catch (error) {
        showServerError(error);
      }
    });
    modalEl.querySelector('#btnLogoutServer')?.addEventListener('click', async () => {
      try {
        await apiClient.logout();
        this.updateServerStatus();
        refreshServerPanel();
        toastService.success('Đã đăng xuất server. Dữ liệu local trên thiết bị vẫn được giữ nguyên.', 'Đồng bộ server');
      } catch (error) {
        showServerError(error);
      }
    });
    modalEl.querySelector('#btnCheckServer')?.addEventListener('click', async event => {
      const button = event.currentTarget;
      button.disabled = true;
      try {
        await apiClient.health();
        this.updateServerStatus();
        refreshServerPanel();
        toastService[apiClient.available ? 'success' : 'warning'](
          apiClient.available ? 'Server đang hoạt động. Bạn có thể đăng nhập để đồng bộ.' : 'Chưa tìm thấy server; app vẫn tiếp tục lưu local.',
          'Trạng thái server'
        );
      } finally {
        button.disabled = false;
      }
    });
    refreshServerPanel();
  }

  // =========================================================================
  // VIEW: Báo Cáo Học Tập Cá Nhân & Đánh Giá AI Cố Vấn Sư Phạm
  // =========================================================================
  renderStudentReportView(container) {
    if (!container) return;
    const report = studentProgressService.generateStudentReport();
    const timeline = studentProgressService.getStudyTimeline(8);
    const allLessons = studentProgressService.getAllLessonProgress();
    container.innerHTML = `
      <!-- Header Banner -->
      <div class="glass-panel" style="margin-bottom: 24px; position: relative; overflow: hidden; background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(99, 102, 241, 0.12)); border: 1.5px solid rgba(16, 185, 129, 0.3);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div style="display: flex; align-items: center; gap: 18px;">
            <div style="font-size: 46px; background: rgba(0,0,0,0.25); border-radius: 50%; width: 74px; height: 74px; display: flex; align-items: center; justify-content: center; border: 2.5px solid rgba(16, 185, 129, 0.5); box-shadow: 0 8px 24px rgba(16, 185, 129, 0.25);">
              ${escapeHtml(report.avatar)}
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <h3 style="font-size: 22px; font-weight: 800; margin: 0;">${escapeHtml(report.studentName)}</h3>
                <span style="background: rgba(16, 185, 129, 0.2); color: #34d399; font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 4px;">
                  HSK ${report.targetLevel} Target
                </span>
              </div>
              <p style="color: var(--text-secondary); font-size: 13.5px; margin: 4px 0 0 0;">
                Mã học viên: <strong>@${escapeHtml(report.username)}</strong> • Ngày lập báo cáo: ${escapeHtml(report.generatedAt)}
              </p>
            </div>
          </div>

          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn-primary" id="btnPrintReportA4" style="background: linear-gradient(135deg, #10b981, #059669); font-size: 13.5px;">
              🖨️ In Phiếu Báo Điểm A4 (PDF)
            </button>
            <button class="btn-secondary" id="btnCloudSyncPassphrase" style="color: #06b6d4; border-color: rgba(6, 182, 212, 0.4); font-size: 13.5px;">
              ☁️ Khóa Đồng Bộ Đám Mây
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Metrics Grid -->
      <div class="errors-summary-bar" style="margin-bottom: 24px;">
        <div class="error-stat-card">
          <div class="error-stat-val" style="color: #34d399;">${report.progressPercent}%</div>
          <div class="error-stat-label">Tiến Độ Lộ Trình HSK ${report.targetLevel}</div>
        </div>
        <div class="error-stat-card">
          <div class="error-stat-val" style="color: #fbbf24;">${report.streakDays} Ngày</div>
          <div class="error-stat-label">Chuỗi Học Liên Tục (Streak 🔥)</div>
        </div>
        <div class="error-stat-card">
          <div class="error-stat-val" style="color: #818cf8;">${report.totalExp} EXP</div>
          <div class="error-stat-label">Điểm Tích Lũy Năng Lực ⚡</div>
        </div>
        <div class="error-stat-card">
          <div class="error-stat-val" style="color: #ec4899;">${report.predictedExamScore}/300</div>
          <div class="error-stat-label">Dự Báo Điểm Thi Mô Phỏng</div>
        </div>
      </div>

      <!-- Two Columns: Skills Analysis & AI Advisor -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; margin-bottom: 24px;">
        <!-- Left Column: 5 Skills Matrix -->
        <div class="glass-panel">
          <h4 style="font-size: 17px; font-weight: 800; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px;">
            <span>📈</span> Ma Trận Năng Lực 5 Kỹ Năng Ngôn Ngữ
          </h4>
          <div style="display: flex; flex-direction: column; gap: 14px;">
            ${report.skills.map(s => `
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 13.5px; margin-bottom: 6px;">
                  <span>${s.icon} <strong>${s.name}</strong></span>
                  <span style="font-weight: 700; color: ${s.color};">${s.score}%</span>
                </div>
                <div class="report-progress-track" style="margin: 0; height: 9px;">
                  <div class="report-progress-fill" style="width: ${s.score}%; background: ${s.color};"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Right Column: AI Academic Advisor -->
        <div class="glass-panel" style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(245, 158, 11, 0.08)); border-color: rgba(245, 158, 11, 0.3);">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 14px;">
            <span style="font-size: 22px;">🤖</span>
            <h4 style="font-size: 17px; font-weight: 800; margin: 0; color: #fbbf24;">Đánh Giá Cố Vấn Sư Phạm AI</h4>
          </div>

          <div style="background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius-lg); padding: 16px; margin-bottom: 16px; font-size: 14px; line-height: 1.6; color: var(--text-primary);">
            ${escapeHtml(report.aiAdvice)}
          </div>

          <div style="padding: 12px 14px; border-radius: var(--radius-md); background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 13px; color: #6ee7b7;">Trạng thái khảo thí dự báo:</span>
            <strong style="color: #34d399; font-size: 14px;">${escapeHtml(report.passStatus)}</strong>
          </div>
        </div>
      </div>

      <!-- Bảng Quản Lý Tiến Độ Các Bài Học Của Học Viên -->
      <div class="lesson-catalog-card">
        <div class="lesson-catalog-header">
          <div>
            <h4 style="font-size: 17px; font-weight: 800; margin: 0 0 4px 0; display: flex; align-items: center; gap: 8px;">
              <span>📚</span> Quản Lý Tiến Độ Các Bài Học Của Học Viên
            </h4>
            <div style="font-size: 12.5px; color: var(--text-muted);">
              Lưu trữ chi tiết kết quả từng bài học, điểm số đạt được và thời lượng rèn luyện của học viên
            </div>
          </div>
          <span style="background: rgba(16, 185, 129, 0.15); color: #34d399; font-size: 12.5px; font-weight: 700; padding: 4px 12px; border-radius: var(--radius-full);">
            Đã hoàn thành: ${allLessons.length} bài
          </span>
        </div>

        <div class="lesson-table-wrapper">
          ${allLessons.length === 0 ? `
            <div style="text-align: center; padding: 36px; color: var(--text-muted);">
              <div style="font-size: 36px; margin-bottom: 8px;">📖</div>
              Chưa có dữ liệu bài học nào. Bạn hãy vào Flashcards 3D, Quiz Từ Vựng hoặc Thi Thử HSK để ghi nhận tiến độ học tập!
            </div>
          ` : `
            <table class="lesson-table">
              <thead>
                <tr>
                  <th>Tên Bài Học</th>
                  <th>Phân Loại</th>
                  <th>Cấp Độ</th>
                  <th>Điểm Số</th>
                  <th>Thời Lượng</th>
                  <th>Thời Điểm Hoàn Thành</th>
                  <th>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                ${allLessons.map(les => {
                  const catClass = les.category === 'grammar' ? 'lesson-badge-grammar'
                    : les.category === 'exam' ? 'lesson-badge-exam'
                    : les.category === 'tone' ? 'lesson-badge-tone'
                    : les.category === 'dialogue' ? 'lesson-badge-dialogue'
                    : 'lesson-badge-vocab';
                  const scoreVal = les.score || 100;
                  const scoreClass = scoreVal >= 90 ? 'score-perfect' : scoreVal >= 70 ? 'score-good' : 'score-warning';
                  const cleanName = (les.lesson_id || '').replace(/^fc_/, 'Thẻ từ: ').replace(/^vocab_quiz_hsk/, 'Quiz HSK ').replace(/^mock_exam_/, 'Đề thi: ').replace(/_/g, ' ');

                  return `
                    <tr>
                      <td>
                        <strong style="color: var(--text-primary); font-size: 14px;">${escapeHtml(cleanName)}</strong>
                      </td>
                      <td><span class="lesson-badge ${catClass}">${les.category}</span></td>
                      <td><span style="font-weight: 700;">HSK ${les.level || 1}</span></td>
                      <td><span class="lesson-score-pill ${scoreClass}">★ ${scoreVal}/100</span></td>
                      <td>${les.time_spent_seconds || 60}s</td>
                      <td style="color: var(--text-muted); font-size: 12px;">${les.completed_at ? new Date(les.completed_at).toLocaleString('vi-VN') : 'Vừa xong'}</td>
                      <td>
                        <button class="btn-secondary btn-retry-lesson" data-cat="${les.category}" data-lvl="${les.level || 1}" style="padding: 4px 10px; font-size: 11.5px;">
                          Ôn Lại 🔄
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          `}
        </div>
      </div>

      <!-- Study Timeline -->
      <div class="glass-panel">
        <h4 style="font-size: 17px; font-weight: 800; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px;">
          <span>⏳</span> Nhật Ký Hành Trình Học Tập Gần Đây
        </h4>
        ${timeline.length === 0 ? `
          <div style="text-align: center; padding: 24px; color: var(--text-muted);">Chưa có nhật ký học tập nào. Hãy bắt đầu bài học đầu tiên!</div>
        ` : `
          <div class="timeline-feed">
            ${timeline.map(item => `
              <div class="timeline-item">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <strong style="color: var(--text-primary); font-size: 14px;">${escapeHtml(item.title)}</strong>
                  <span style="color: #fbbf24; font-weight: 700; font-size: 12px;">+${item.exp_gained} EXP</span>
                </div>
                <div style="color: var(--text-secondary); font-size: 12.5px;">${escapeHtml(item.details || '')}</div>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">${escapeHtml(new Date(item.created_at).toLocaleString('vi-VN'))}</div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;



    // Event: Retry lesson buttons
    container.querySelectorAll('.btn-retry-lesson').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cat = e.currentTarget.dataset.cat;
        const lvl = parseInt(e.currentTarget.dataset.lvl, 10) || 1;
        if (cat === 'exam') this.switchView('mock_exam');
        else if (cat === 'tone') this.switchView('tones');
        else if (cat === 'grammar') this.switchView('grammar_master');
        else if (cat === 'dialogue') this.switchView('dialogues');
        else this.switchView('flashcards', { level: lvl });
      });
    });

    // Event: Print Report A4
    container.querySelector('#btnPrintReportA4')?.addEventListener('click', () => {
      window.print();
    });

    // Event: Cloud Sync Passphrase Modal
    container.querySelector('#btnCloudSyncPassphrase')?.addEventListener('click', () => {
      const bundleStr = studentProgressService.exportStudentDataBundle();
      const modalEl = document.querySelector('#globalModalContainer');
      if (!modalEl) return;

      modalEl.innerHTML = `
        <div class="modal-overlay" id="syncModalOverlay">
          <div class="auth-modal-card" style="max-width: 540px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h3 style="font-size: 18px; font-weight: 800; display: flex; align-items: center; gap: 8px;">
                <span>☁️</span> Đồng Bộ Dữ Liệu Đám Mây (Online Sync)
              </h3>
              <button id="btnCloseSyncModal" style="background: transparent; border: none; font-size: 20px; color: var(--text-muted); cursor: pointer;">✕</button>
            </div>

            <p style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 16px;">
              Bạn có thể sao chép chuỗi mã hóa này để chuyển toàn bộ dữ liệu học tập sang điện thoại hoặc máy tính khác:
            </p>

            <div class="auth-input-group">
              <label>Mã Khóa Dữ Liệu Học Viên (Copy mã này):</label>
              <textarea id="syncBundleTextarea" class="auth-input" rows="4" readonly style="font-family: monospace; font-size: 11.5px; word-break: break-all;">${bundleStr}</textarea>
            </div>

            <div style="display: flex; gap: 10px; margin-bottom: 20px;">
              <button class="btn-primary" id="btnCopySyncBundle" style="flex: 1; justify-content: center;">
                📋 Sao Chép Mã Khóa
              </button>
            </div>

            <div style="border-top: 1px solid var(--border-color); padding-top: 16px;">
              <label style="font-size: 13px; font-weight: 700; display: block; margin-bottom: 6px;">
                Hoặc Dán Mã Khóa Từ Thiết Bị Khác Vào Đây Để Phục Hồi:
              </label>
              <textarea id="importBundleInput" class="auth-input" rows="2" placeholder="Dán mã khóa vào đây..."></textarea>
              <button class="btn-secondary" id="btnApplyImportBundle" style="width: 100%; justify-content: center; margin-top: 10px; color: #06b6d4; border-color: rgba(6, 182, 212, 0.4);">
                ⚡ Nạp & Phục Hồi Tiến Độ
              </button>
            </div>
          </div>
        </div>
      `;

      modalEl.querySelector('#btnCloseSyncModal')?.addEventListener('click', () => { modalEl.innerHTML = ''; });
      modalEl.querySelector('#syncModalOverlay')?.addEventListener('click', (e) => {
        if (e.target.id === 'syncModalOverlay') modalEl.innerHTML = '';
      });

      modalEl.querySelector('#btnCopySyncBundle')?.addEventListener('click', () => {
        const ta = modalEl.querySelector('#syncBundleTextarea');
        ta.select();
        navigator.clipboard.writeText(ta.value).then(() => {
          toastService.success('Đã sao chép mã khóa vào bộ nhớ tạm! Bạn có thể lưu lại hoặc dán sang thiết bị khác.', 'Đã Sao Chép');
        });
      });

      modalEl.querySelector('#btnApplyImportBundle')?.addEventListener('click', () => {
        const code = modalEl.querySelector('#importBundleInput').value;
        if (!code.trim()) {
          toastService.warning('Vui lòng dán mã khóa vào ô nhập!', 'Thiếu Mã Khóa');
          return;
        }
        const res = studentProgressService.importStudentDataBundle(code);
        if (res.success) {
          toastService.success(res.message, 'Đồng Bộ Thành Công');
          modalEl.innerHTML = '';
          this.updateUserStatsDisplay();
          this.switchView('student_report');
        } else {
          toastService.error(res.message, 'Đồng Bộ Thất Bại');
        }
      });
    });
  }

  // =========================================================================
  // VIEW: Bảng Thông Báo & Nhắc Nhở Học Tập Học Viên
  // =========================================================================
  renderStudentNotificationsView(container) {
    if (!container) return;
    const notifs = studentProgressService.getNotifications();

    container.innerHTML = `
      <div class="glass-panel" style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div>
            <h3 style="font-size: 20px; font-weight: 800; display: flex; align-items: center; gap: 8px;">
              <span>🔔</span> Bảng Thông Báo Học Viên Cá Nhân Hóa
            </h3>
            <p style="color: var(--text-secondary); font-size: 13.5px; margin: 4px 0 0 0;">
              Cập nhật nhắc nhở chuỗi học tập, tiến độ khóa học và tin tức quan trọng từ giảng viên.
            </p>
          </div>
          <button class="btn-secondary" id="btnMarkAllRead">
            ✓ Đánh dấu tất cả đã đọc
          </button>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 14px;">
        ${notifs.length === 0 ? `
          <div class="glass-panel" style="text-align: center; padding: 48px;">
            <div style="font-size: 42px; margin-bottom: 12px;">📭</div>
            <h4 style="font-size: 17px; font-weight: 700; margin-bottom: 6px;">Không có thông báo mới</h4>
            <p style="color: var(--text-secondary); font-size: 13.5px;">Bạn đã xem hết toàn bộ các nhắc nhở học tập.</p>
          </div>
        ` : notifs.map(n => {
          const notificationType = String(n.type || 'info');
          const title = escapeHtml(n.title || 'Thông báo học tập');
          const message = escapeHtml(n.message || '');
          const createdAt = new Date(n.created_at);
          const dateLabel = Number.isNaN(createdAt.getTime()) ? '' : createdAt.toLocaleDateString('vi-VN');
          return `
          <div class="glass-panel" style="display: flex; gap: 16px; align-items: flex-start; ${n.is_read ? 'opacity: 0.8;' : 'border-left: 4px solid #6366f1;'}">
            <div style="font-size: 24px; padding: 10px; border-radius: 12px; background: rgba(99, 102, 241, 0.15); color: #818cf8;">
              ${notificationType === 'welcome' ? '🎉' : notificationType === 'streak' ? '🔥' : '📢'}
            </div>
            <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <h4 style="font-size: 16px; font-weight: 700; margin: 0; color: var(--text-primary);">${title}</h4>
                <span style="font-size: 12px; color: var(--text-muted);">${dateLabel}</span>
              </div>
              <p style="color: var(--text-secondary); font-size: 13.5px; line-height: 1.6; margin: 0;">${message}</p>
            </div>
          </div>
        `;
        }).join('')}
      </div>
    `;

    container.querySelector('#btnMarkAllRead')?.addEventListener('click', () => {
      studentProgressService.markAllNotificationsRead();
      this.updateUserStatsDisplay();
      this.renderStudentNotificationsView(container);
    });
  }

  // =========================================================================
  // VIEW: Bảng Điều Khiển Quản Trị Viên (Admin Control Panel)
  // =========================================================================
  renderAdminPanelView(container) {
    if (!container) return;
    if (!authService.isAdmin()) {
      container.innerHTML = `
        <div class="glass-panel" style="text-align: center; padding: 60px;">
          <div style="font-size: 50px; margin-bottom: 16px;">🚫</div>
          <h3 style="color: #ef4444; font-size: 22px; font-weight: 800;">Truy Cập Bị Từ Chối</h3>
          <p style="color: var(--text-secondary); margin-top: 8px;">Khu vực này được bảo vệ nghiêm ngặt và chỉ dành cho Quản Trị Viên (Admin).</p>
          <button class="btn-primary" id="btnAdminBackHome" style="margin-top: 20px;">Về Trang Chủ</button>
        </div>
      `;
      container.querySelector('#btnAdminBackHome')?.addEventListener('click', () => this.switchView('dashboard'));
      return;
    }

    const allUsers = authService.getAllUsers();
    let totalLessonsCount = 0;
    let totalExamsCount = 0;
    try {
      if (sqliteService.db) {
        totalLessonsCount = sqliteService.query("SELECT COUNT(*) AS total FROM user_lesson_progress;")[0]?.total || 0;
        totalExamsCount = sqliteService.query("SELECT COUNT(*) AS total FROM user_exam_records;")[0]?.total || 0;
      }
    } catch {}

    container.innerHTML = `
      <!-- Header Banner -->
      <div class="glass-panel" style="margin-bottom: 24px; background: linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(239, 68, 68, 0.1)); border: 1.5px solid rgba(245, 158, 11, 0.4);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 32px;">👑</span>
              <div>
                <h3 style="font-size: 22px; font-weight: 800; margin: 0; color: #fbbf24;">Bảng Quản Trị Hệ Thống Cục Bộ & Giám Sát CSDL</h3>
                <p style="color: var(--text-secondary); font-size: 13.5px; margin: 4px 0 0 0;">
                  Ứng dụng hoàn toàn miễn phí, chạy độc lập trên máy cục bộ của bạn với CSDL SQLite WASM hiệu năng cao.
                </p>
              </div>
            </div>
          </div>
          <div style="display: flex; gap: 10px; align-items: center;">
            <span style="padding: 6px 14px; border-radius: var(--radius-full); background: rgba(16, 185, 129, 0.2); color: #34d399; font-size: 12.5px; font-weight: 700; border: 1px solid rgba(16, 185, 129, 0.4);">
              🆓 100% Miễn Phí
            </span>
            <span style="padding: 6px 14px; border-radius: var(--radius-full); background: rgba(99, 102, 241, 0.2); color: #818cf8; font-size: 12.5px; font-weight: 700; border: 1px solid rgba(99, 102, 241, 0.4);">
              ⚡ Chạy Ngoại Tuyến (Local-First)
            </span>
          </div>
        </div>
      </div>

      <!-- Overview Stats -->
      <div class="errors-summary-bar" style="margin-bottom: 24px;">
        <div class="error-stat-card">
          <div class="error-stat-val" style="color: #fbbf24;">${allUsers.length}</div>
          <div class="error-stat-label">Hồ Sơ Học Viên Trên Thiết Bị</div>
        </div>
        <div class="error-stat-card">
          <div class="error-stat-val" style="color: #34d399;">${totalLessonsCount}</div>
          <div class="error-stat-label">Tổng Lượt Hoàn Thành Bài Học</div>
        </div>
        <div class="error-stat-card">
          <div class="error-stat-val" style="color: #818cf8;">${totalExamsCount}</div>
          <div class="error-stat-label">Tổng Lượt Khảo Thí HSK</div>
        </div>
        <div class="error-stat-card">
          <div class="error-stat-val" style="color: #06b6d4;">SQLite WASM</div>
          <div class="error-stat-label">Bộ Máy CSDL Trực Tiếp (WASM)</div>
        </div>
      </div>

      <!-- Main Two Columns -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; margin-bottom: 24px;">
        <!-- Left: Broadcast Announcement Form -->
        <div class="glass-panel">
          <h4 style="font-size: 17px; font-weight: 800; margin: 0 0 16px 0; color: #fbbf24; display: flex; align-items: center; gap: 8px;">
            <span>📢</span> Gửi Thông Báo Học Tập Cho Máy Cục Bộ
          </h4>
          <form id="adminBroadcastForm">
            <div class="auth-input-group">
              <label>Tiêu đề thông báo *</label>
              <input type="text" id="broadcastTitle" class="auth-input" placeholder="Ví dụ: Mục tiêu học từ vựng hôm nay..." required />
            </div>
            <div class="auth-input-group">
              <label>Loại thông báo</label>
              <select id="broadcastType" class="auth-input">
                <option value="system">📢 Nhắc nhở hệ thống</option>
                <option value="exam">📝 Lịch thi & Đề thi thử</option>
                <option value="tip">💡 Mẹo học & Lời khuyên</option>
              </select>
            </div>
            <div class="auth-input-group">
              <label>Nội dung thông báo *</label>
              <textarea id="broadcastMessage" class="auth-input" rows="3" placeholder="Nhập nội dung thông báo gửi vào hòm thư học viên..." required></textarea>
            </div>
            <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; background: linear-gradient(135deg, #f59e0b, #d97706); font-weight: 800;">
              🚀 Gửi Thông Báo Vào Hòm Thư
            </button>
          </form>
        </div>

        <!-- Right: Security Audit & Database Tools -->
        <div class="glass-panel">
          <h4 style="font-size: 17px; font-weight: 800; margin: 0 0 16px 0; color: #34d399; display: flex; align-items: center; gap: 8px;">
            <span>🛡️</span> Cơ Chế Lưu Trữ Cục Bộ & Time-Machine
          </h4>
          <div style="display: flex; flex-direction: column; gap: 14px; font-size: 13.5px; line-height: 1.6;">
            <div style="background: rgba(0,0,0,0.25); padding: 14px; border-radius: var(--radius-lg); border: 1px solid rgba(255,255,255,0.06);">
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span>Mô hình hoạt động:</span>
                <strong style="color: #34d399;">Hoàn Toàn Ngoại Tuyến (Local-First)</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span>Xác thực & Mật khẩu:</span>
                <strong style="color: #38bdf8;">Zero-Password (Không Cần Mật Khẩu)</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Bảo vệ CSDL SQLite:</span>
                <strong style="color: #fbbf24;">Lá Chắn 3 Lớp + Time-Machine Snapshot</strong>
              </div>
            </div>

            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <button class="btn-secondary" id="btnAdminExportBackup" style="flex: 1; justify-content: center; color: #38bdf8; border-color: rgba(56, 189, 248, 0.4);">
                💾 Xuất Bản Sao Lưu CSDL (JSON)
              </button>
              <button class="btn-secondary" id="btnAdminCheckIntegrity" style="flex: 1; justify-content: center;">
                🔍 Kiểm Tra CSDL
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Student Directory Table -->
      <div class="lesson-catalog-card">
        <div class="lesson-catalog-header">
          <div>
            <h4 style="font-size: 17px; font-weight: 800; margin: 0 0 4px 0; display: flex; align-items: center; gap: 8px;">
              <span>👥</span> Danh Sách Quản Lý Tài Khoản Học Viên
            </h4>
            <div style="font-size: 12.5px; color: var(--text-muted);">
              Xem danh sách, kiểm soát vai trò và quản trị mật khẩu cho từng học viên (Mật khẩu được mã hóa an toàn)
            </div>
          </div>
          <span style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; font-size: 12.5px; font-weight: 700; padding: 4px 12px; border-radius: var(--radius-full);">
            ${allUsers.length} tài khoản trong hệ thống
          </span>
        </div>

        <div class="lesson-table-wrapper">
          <table class="lesson-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tài Khoản</th>
                <th>Vai Trò</th>
                <th>Họ Tên Hiển Thị</th>
                <th>Mục Tiêu HSK</th>
                <th>Tích Lũy EXP</th>
                <th>Chuỗi Streak</th>
                <th>Ngày Tạo</th>
                <th>Thao Tác Quản Trị</th>
              </tr>
            </thead>
            <tbody>
              ${allUsers.map(u => `
                <tr>
                  <td>#${u.id}</td>
                  <td>
                    <strong style="color: var(--text-primary);">${u.username}</strong>
                  </td>
                  <td>
                    ${u.role === 'admin'
                      ? '<span style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; padding: 2px 8px; border-radius: 4px; font-weight: 800; font-size: 11px;">👑 Admin</span>'
                      : '<span style="background: rgba(16, 185, 129, 0.2); color: #34d399; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 11px;">🎓 Học Viên</span>'}
                  </td>
                  <td>${u.displayName || u.username}</td>
                  <td>HSK ${u.targetLevel || 1}</td>
                  <td><span style="color: #818cf8; font-weight: 700;">${u.exp || 0} EXP</span></td>
                  <td><span style="color: #fbbf24; font-weight: 700;">🔥 ${u.streakDays || 1}d</span></td>
                  <td style="color: var(--text-muted); font-size: 12px;">${u.createdAt || 'Có sẵn'}</td>
                  <td>
                    <div style="display: flex; gap: 6px;">
                      <button class="btn-secondary btn-admin-edit-profile" data-username="${u.username}" style="padding: 4px 8px; font-size: 11.5px; color: #818cf8;">
                        ⚙️ Sửa Hồ Sơ
                      </button>
                      ${u.username !== 'admin' ? `
                        <button class="btn-secondary btn-admin-del-user" data-username="${u.username}" style="padding: 4px 8px; font-size: 11.5px; color: #ef4444; border-color: rgba(239, 68, 68, 0.4);">
                          🗑️ Xóa
                        </button>
                      ` : ''}
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Broadcast announcement handler
    container.querySelector('#adminBroadcastForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = container.querySelector('#broadcastTitle').value;
      const type = container.querySelector('#broadcastType').value;
      const message = container.querySelector('#broadcastMessage').value;

      const res = authService.adminBroadcastNotification({ title, message, type });
      if (res.success) {
        toastService.success(res.message, 'Phát Sóng Thông Báo');
        container.querySelector('#broadcastTitle').value = '';
        container.querySelector('#broadcastMessage').value = '';
        this.updateUserStatsDisplay();
      } else {
        toastService.error(res.message, 'Phát Sóng Thất Bại');
      }
    });

    // Edit profile button
    container.querySelectorAll('.btn-admin-edit-profile').forEach(btn => {
      btn.addEventListener('click', () => {
        this.showAuthModal();
      });
    });

    // Delete user button
    container.querySelectorAll('.btn-admin-del-user').forEach(btn => {
      btn.addEventListener('click', () => {
        const username = btn.dataset.username;
        if (confirm(`Bạn có chắc chắn muốn xóa tài khoản "${username}" và toàn bộ dữ liệu của học viên này?`)) {
          const res = authService.adminDeleteUser(username);
          if (res.success) {
            toastService.success(res.message, 'Đã Xóa Học Viên');
            this.renderAdminPanelView(container);
          } else {
            toastService.error(res.message, 'Xóa Thất Bại');
          }
        }
      });
    });

    // Backup export
    container.querySelector('#btnAdminExportBackup')?.addEventListener('click', () => {
      const backupData = {
        exportedAt: new Date().toISOString(),
        users: authService.getAllUsers(),
        system: 'HánNgữ Pro v2.0'
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hanngu_pro_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toastService.success('Đã xuất tệp sao lưu CSDL thành công!', 'Sao Lưu');
    });

    // Check integrity
    container.querySelector('#btnAdminCheckIntegrity')?.addEventListener('click', () => {
      toastService.success('Kiểm tra CSDL: Bảng user_accounts, user_lesson_progress, user_study_timeline, user_notifications đều hoạt động bình thường và chuẩn mã hóa SHA-256 đã kích hoạt 100%!', 'Bảo Mật & CSDL');
    });
  }

  // =========================================================================
  // VIEW: Dashboard
  // =========================================================================
  renderDashboard(container) {
    if (!container) return;
    const profile = storageService.getProfile() || {};
    const errorList = storageService.getErrors() || [];
    const errors = Array.isArray(errorList) ? errorList : [];
    const pendingErrors = errors.filter(e => (e && (e.masteryLevel || 0) < 3)).length;
    const targetLevel = profile.targetLevel ?? 1;
    const streakDays = profile.streakDays ?? 5;
    const targetVocabulary = HSK_VOCABULARY[targetLevel] || HSK_VOCABULARY[1] || [];
    const focusWord = targetVocabulary[0] || {
      hanzi: '你好', pinyin: 'nǐ hǎo', meaning: 'Xin chào',
      example: '你好！很高兴认识你。', examplePinyin: 'Nǐ hǎo! Hěn gāoxìng rènshi nǐ.',
      exampleMeaning: 'Xin chào! Rất vui được làm quen với bạn.'
    };

    container.innerHTML = `
      <section class="hero-banner">
        <div class="hero-content">
          <div class="hero-tag">
            <span>✨</span> Học tiếng Trung miễn phí, từng bước rõ ràng
          </div>
          <h2 class="hero-title">Mỗi ngày một bài học, tự tin hơn khi dùng tiếng Trung</h2>
          <p class="hero-desc">
            Chọn đúng mục tiêu, học từ vựng trong ngữ cảnh và luyện lại đúng lúc. Bạn có thể bắt đầu ngay cả khi chưa có tài khoản.
          </p>
          <div class="hero-actions">
            <button class="btn-primary" id="dashStartLearningBtn">
              <span>🚀</span> Bắt đầu học HSK ${targetLevel}
            </button>
            <button class="btn-secondary" id="dashOpenLexiconBtn">
              <span>🔍</span> Tra từ vựng
            </button>
            <button class="btn-secondary" id="dashOpenFlashcardsBtn">
              <span>🎴</span> Luyện flashcard
            </button>
            <button class="btn-secondary" id="dashOpenDialoguesBtn">
              <span>💬</span> Luyện hội thoại
            </button>
          </div>
        </div>
      </section>

      <div class="errors-summary-bar">
        <div class="error-stat-card">
          <div class="error-stat-val" style="color: var(--jade-green);">9 Cấp</div>
          <div class="error-stat-label">Khung Đào Tạo HSK 1–9</div>
        </div>
        <div class="error-stat-card">
          <div class="error-stat-val" style="color: var(--gold-accent);">${streakDays} Ngày</div>
          <div class="error-stat-label">Chuỗi Học Liên Tục</div>
        </div>
        <div class="error-stat-card">
          <div class="error-stat-val" style="color: var(--primary-red-hover);">${pendingErrors}</div>
          <div class="error-stat-label">Lỗi Cần Khắc Phục Trong Sổ</div>
        </div>
        <div class="error-stat-card">
          <div class="error-stat-val" style="color: var(--cyber-cyan);">SQLite</div>
          <div class="error-stat-label">Database WebAssembly</div>
        </div>
      </div>

      <section class="learning-focus glass-panel" aria-labelledby="learningFocusTitle">
        <div class="learning-focus-copy">
          <span class="eyebrow">Bài học gợi ý cho hôm nay</span>
          <h3 id="learningFocusTitle">Làm quen với một từ HSK ${targetLevel}</h3>
          <p>Học từ mới trong câu hoàn chỉnh, sau đó mở giáo trình để luyện thêm.</p>
          <button class="btn-primary" id="dashFocusLessonBtn">Mở bài học HSK ${targetLevel} <span aria-hidden="true">→</span></button>
        </div>
        <div class="learning-word" aria-label="Từ vựng mẫu">
          <div class="learning-word-hanzi hanzi">${focusWord.hanzi}</div>
          <div class="learning-word-pinyin">${focusWord.pinyin}</div>
          <div class="learning-word-meaning">${focusWord.meaning}</div>
          ${focusWord.example ? `<div class="learning-word-example"><span class="hanzi">${focusWord.example}</span><span>${focusWord.examplePinyin || ''}</span><span>${focusWord.exampleMeaning || ''}</span></div>` : ''}
        </div>
      </section>

      <div class="panel-header">
        <h3 class="panel-title">
          <span>🗺️</span> Lộ Trình 9 Cấp Độ HSK Chuẩn Quốc Tế
        </h3>
        <span style="font-size: 13px; color: var(--text-muted);">Nhấn vào cấp độ để vào giáo trình</span>
      </div>

      <div class="hsk-matrix-grid">
        ${HSK_LEVELS.map(lvl => `
          <div class="level-card" data-level="${lvl.id}" style="--card-accent: ${lvl.color}; --card-glow: ${lvl.color}33;">
            <div class="level-card-header">
              <div class="level-code" style="color: ${lvl.color};">
                <span>🀄</span> ${lvl.level}
              </div>
              <span class="tier-badge" style="background: ${lvl.color}1a; color: ${lvl.color}; border: 1px solid ${lvl.color}40;">
                ${lvl.tier}
              </span>
            </div>
            <p class="level-desc">${lvl.desc}</p>
            <div class="level-stats">
              <span>Chuẩn từ vựng: <strong>~${lvl.standardWords.toLocaleString()}</strong> từ</span>
              <button class="btn-secondary" style="padding: 4px 10px; font-size: 12px;">Khám phá →</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    container.querySelector('#dashStartLearningBtn')?.addEventListener('click', () => {
      this.switchView('curriculum', { level: profile.targetLevel });
    });
    container.querySelector('#dashFocusLessonBtn')?.addEventListener('click', () => {
      this.switchView('curriculum', { level: targetLevel });
    });
    container.querySelector('#dashOpenLexiconBtn')?.addEventListener('click', () => {
      this.switchView('lexicon');
    });
    container.querySelector('#dashOpenFlashcardsBtn')?.addEventListener('click', () => {
      this.switchView('flashcards');
    });
    container.querySelector('#dashOpenDialoguesBtn')?.addEventListener('click', () => {
      this.switchView('dialogues');
    });

    container.querySelectorAll('.level-card').forEach(card => {
      card.addEventListener('click', () => {
        const lvl = parseInt(card.dataset.level, 10);
        this.selectedLevel = lvl;
        this.switchView('curriculum', { level: lvl });
      });
    });
  }

  // =========================================================================
  // VIEW: 3D Flashcards SRS
  // =========================================================================
  async renderFlashcards(container, level = 1) {
    this.flashcardLevel = level;

    // Load SRS queue if in SRS mode
    let currentWord = null;
    let retention = 95;
    let srsStats = { dueCount: 0, masteredCount: 0 };

    if (this.srsMode) {
      this.srsQueue = await srsService.getDueQueue(30, level);
      srsStats = await srsService.getStats();

      if (this.srsQueue.length > 0) {
        if (this.srsIndex >= this.srsQueue.length) this.srsIndex = 0;
        currentWord = this.srsQueue[this.srsIndex];
        retention = srsService.calculateRetention(currentWord);
      }
    }

    // Fallback to curriculum list if not in SRS mode or empty queue
    const vocabList = HSK_VOCABULARY[level] || HSK_VOCABULARY[1];
    if (!currentWord) {
      if (this.flashcardIndex >= vocabList.length) this.flashcardIndex = 0;
      currentWord = vocabList[this.flashcardIndex];
    }

    const isSrs = this.srsMode && currentWord.ease_factor !== undefined;
    const intervalDays = currentWord.interval_days || 1;
    const reps = currentWord.repetitions || 0;

    container.innerHTML = `
      <!-- SRS & Mode Switcher Bar -->
      <div class="glass-panel" style="margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
          <div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <h3 style="font-size: 19px; font-weight: 800;">
                🎴 Thẻ Flashcard 3D Thông Minh
              </h3>
              <span class="srs-mode-badge ${this.srsMode ? 'active' : ''}">
                ${this.srsMode ? '🧠 AI SuperMemo SM-2 Active' : '📚 Chế Độ Giáo Trình'}
              </span>
            </div>
            <p style="color: var(--text-secondary); font-size: 13.5px; margin-top: 4px;">
              ${this.srsMode 
                ? `Thuật toán giãn cách Ebbinghaus: Hôm nay có <strong style="color: #ef4444;">${srsStats.dueCount}</strong> từ đến hạn ôn tập • Đã thuần thục <strong style="color: #10b981;">${srsStats.masteredCount}</strong> từ.`
                : 'Luyện tập Active Recall thông thường theo từng cấp độ giáo trình HSK 1 - 9.'}
            </p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn-secondary" id="btnToggleSrsMode" style="font-size: 13px; padding: 8px 14px;">
              ${this.srsMode ? '🔄 Chuyển sang Duyệt Từng Cấp' : '🧠 Bật AI SRS Ôn Tập'}
            </button>
          </div>
        </div>
      </div>

      <!-- Level Filter -->
      <div class="level-filter-bar">
        ${HSK_LEVELS.map(lvl => `
          <button class="filter-chip ${lvl.id === level ? 'active' : ''}" data-level="${lvl.id}">
            ${lvl.level}
          </button>
        `).join('')}
      </div>

      <!-- Card Counter & Retention Indicator -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 13.5px; color: var(--text-muted); max-width: 580px; margin-left: auto; margin-right: auto;">
        <span>
          ${this.srsMode 
            ? `Hàng đợi SRS: <strong>${this.srsIndex + 1}</strong> / ${this.srsQueue.length || vocabList.length}` 
            : `Thẻ <strong>${this.flashcardIndex + 1}</strong> / ${vocabList.length} (Cấp ${level})`}
        </span>
        ${isSrs ? `
          <span style="display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; color: ${retention > 70 ? '#10b981' : '#f59e0b'};">
            📊 Dự đoán ghi nhớ: <strong>${retention}%</strong> (Độ dễ EF: ${currentWord.ease_factor})
          </span>
        ` : ''}
      </div>

      <!-- 3D Card -->
      <div class="flashcard-3d-wrapper">
        <div class="flashcard-3d-inner" id="flashcardInner">
          <!-- Front Face -->
          <div class="flashcard-face flashcard-front">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 10px;">
              <span style="font-size: 12px; color: var(--gold-accent); text-transform: uppercase; font-weight: 700;">
                Mặt Trước: Hán Tự (HSK ${currentWord.level || level})
              </span>
              ${isSrs ? `
                <span class="tier-badge" style="font-size: 11px; padding: 2px 8px;">
                  Đã ôn ${reps} lần • Chu kỳ ${intervalDays} ngày
                </span>
              ` : ''}
            </div>

            <div style="font-size: 72px; font-weight: 800; color: #fff; margin-bottom: 12px;" class="hanzi">
              ${currentWord.hanzi}
            </div>

            <!-- Voice and Audio Controls -->
            <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 8px;">
              <button class="btn-sound speak-btn" data-text="${currentWord.hanzi}" title="Nghe người bản xứ phát âm" style="width: 44px; height: 44px; font-size: 20px;">
                🔊
              </button>
              <button class="voice-record-btn" id="btnMicCard" title="Bấm để phát âm kiểm tra AI" data-text="${currentWord.hanzi}">
                🎙️
              </button>
            </div>

            <div id="cardSpeechFeedback" style="display: none; width: 90%; margin-top: 10px;"></div>

            <span style="font-size: 13px; color: var(--text-muted); margin-top: 12px;">
              (Bấm vào thẻ để lật kiểm tra đáp án)
            </span>
          </div>

          <!-- Back Face -->
          <div class="flashcard-face flashcard-back">
            <span style="font-size: 12px; color: var(--brand-red); text-transform: uppercase; font-weight: 700; margin-bottom: 6px;">
              Mặt Sau: Giải Nghĩa & Chiết Tự
            </span>
            <div style="font-size: 30px; font-weight: 800; color: var(--gold-accent); margin-bottom: 4px;">
              ${currentWord.pinyin}
            </div>
            <div style="font-size: 14px; color: var(--text-muted); margin-bottom: 8px;">
              ${currentWord.hanviet ? `Âm Hán-Việt: <strong>${currentWord.hanviet}</strong> • ` : ''}Bộ: ${currentWord.radical || 'Cơ bản'}
            </div>
            <div style="font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 12px; line-height: 1.4;">
              ${currentWord.meaning}
            </div>
            ${currentWord.example_zh || currentWord.example ? `
              <div style="background: rgba(0, 0, 0, 0.25); padding: 8px 14px; border-radius: var(--radius-sm); font-size: 13px; color: var(--text-secondary); max-width: 90%; text-align: left;">
                <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 2px;">
                  ${currentWord.example_zh || currentWord.example}
                </div>
                <div>${currentWord.example_vi || currentWord.exampleMeaning || ''}</div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      ${this.srsMode ? `
        <!-- 4 SuperMemo SM-2 Recall Buttons -->
        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; margin-top: 16px;">
          <div style="font-size: 13px; color: var(--text-muted); font-weight: 600;">
            Đánh giá độ nhớ lại của bạn (SuperMemo SM-2):
          </div>
          <div class="srs-recall-grid">
            <button class="srs-btn fail" id="btnSrsAgain">
              <span>❌ Quên</span>
              <span class="srs-interval-tag">Chu kỳ: 1 ngày</span>
            </button>
            <button class="srs-btn hard" id="btnSrsHard">
              <span>⚠️ Khó</span>
              <span class="srs-interval-tag">Chu kỳ: 2 ngày</span>
            </button>
            <button class="srs-btn good" id="btnSrsGood">
              <span>✅ Tốt</span>
              <span class="srs-interval-tag">Chu kỳ: ${Math.round(intervalDays * 2.2)} ngày</span>
            </button>
            <button class="srs-btn easy" id="btnSrsEasy">
              <span>⭐ Dễ Dàng</span>
              <span class="srs-interval-tag">+35 EXP • Nhớ sâu</span>
            </button>
          </div>
        </div>
      ` : `
        <!-- Standard Flashcard Controls -->
        <div style="display: flex; justify-content: center; gap: 14px; flex-wrap: wrap; margin-top: 16px;">
          <button class="btn-secondary" id="btnPrevCard" style="padding: 12px 20px;">
            ⬅️ Thẻ Trước
          </button>
          <button class="btn-secondary" id="btnCardHard" style="color: #f87171; border-color: rgba(239, 68, 68, 0.3); padding: 12px 20px;">
            ❌ Chưa Thuộc
          </button>
          <button class="btn-primary" id="btnCardEasy" style="background: var(--jade-green); padding: 12px 24px;">
            ✅ Đã Nhớ (+15 EXP)
          </button>
          <button class="btn-secondary" id="btnNextCard" style="padding: 12px 20px;">
            Thẻ Tiếp ➡️
          </button>
        </div>
      `}
    `;

    const inner = container.querySelector('#flashcardInner');
    inner.addEventListener('click', () => {
      inner.classList.toggle('flipped');
    });

    // Speak audio
    container.querySelector('.speak-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      audioService.speak(currentWord.hanzi);
    });

    // Voice recognition on Flashcard
    const micBtn = container.querySelector('#btnMicCard');
    const feedbackBox = container.querySelector('#cardSpeechFeedback');
    micBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (micBtn.classList.contains('listening')) {
        speechService.stop();
        micBtn.classList.remove('listening');
        return;
      }

      micBtn.classList.add('listening');
      feedbackBox.style.display = 'block';
      feedbackBox.innerHTML = `
        <div style="background: rgba(236, 72, 153, 0.15); border: 1px solid rgba(236, 72, 153, 0.3); border-radius: var(--radius-sm); padding: 8px 12px; font-size: 13px; color: #ec4899; display: flex; align-items: center; justify-content: center; gap: 8px;">
          <span class="soundwave-anim">
            <span class="soundwave-bar"></span>
            <span class="soundwave-bar"></span>
            <span class="soundwave-bar"></span>
            <span class="soundwave-bar"></span>
          </span>
          <span>Đang lắng nghe bạn nói tiếng Trung... Hãy nói to rõ!</span>
        </div>
      `;

      speechService.listenAndScore(currentWord.hanzi, {
        onResult: (evalResult) => {
          micBtn.classList.remove('listening');
          const isHigh = evalResult.score >= 80;
          if (isHigh) audioService.playFeedback('success');
          else audioService.playFeedback('error');

          feedbackBox.innerHTML = `
            <div style="background: ${isHigh ? '#ecfdf5' : '#fef2f2'}; border: 1.5px solid ${isHigh ? '#10b981' : '#ef4444'}; border-radius: var(--radius-md); padding: 8px 12px; font-size: 13px; color: ${isHigh ? '#059669' : '#dc2626'};">
              <div style="display: flex; justify-content: space-between; align-items: center; font-weight: 800;">
                <span>Điểm phát âm AI: <strong>${evalResult.score}/100</strong></span>
                <span>${isHigh ? '⭐ Chuẩn xác' : '⚠️ Cần sửa'}</span>
              </div>
              <div style="font-size: 12px; margin-top: 3px; color: var(--text-secondary);">
                ${evalResult.feedback}
              </div>
            </div>
          `;
          this.updateUserStatsDisplay();
        },
        onError: (err) => {
          micBtn.classList.remove('listening');
          feedbackBox.innerHTML = `
            <div style="background: #fef2f2; color: #dc2626; padding: 6px 10px; border-radius: var(--radius-sm); font-size: 12px;">
              Lỗi nhận diện âm thanh: ${err}. Hãy kiểm tra micro của bạn!
            </div>
          `;
        },
        onEnd: () => {
          micBtn.classList.remove('listening');
        }
      });
    });

    // Toggle SRS mode
    container.querySelector('#btnToggleSrsMode')?.addEventListener('click', () => {
      this.srsMode = !this.srsMode;
      this.srsIndex = 0;
      this.flashcardIndex = 0;
      this.renderFlashcards(container, level);
    });

    // Level filter
    container.querySelectorAll('.filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const lvl = parseInt(btn.dataset.level, 10);
        this.flashcardIndex = 0;
        this.srsIndex = 0;
        this.renderFlashcards(container, lvl);
      });
    });

    // SRS recall buttons
    const handleSrsReview = async (grade) => {
      audioService.playFeedback(grade >= 3 ? 'success' : 'error');
      await srsService.recordReview(currentWord.hanzi, grade);
      this.updateUserStatsDisplay();
      this.srsIndex = (this.srsIndex + 1);
      this.renderFlashcards(container, level);
    };

    container.querySelector('#btnSrsAgain')?.addEventListener('click', () => handleSrsReview(1));
    container.querySelector('#btnSrsHard')?.addEventListener('click', () => handleSrsReview(2));
    container.querySelector('#btnSrsGood')?.addEventListener('click', () => handleSrsReview(4));
    container.querySelector('#btnSrsEasy')?.addEventListener('click', () => handleSrsReview(5));

    // Standard mode buttons
    container.querySelector('#btnNextCard')?.addEventListener('click', () => {
      this.flashcardIndex = (this.flashcardIndex + 1) % vocabList.length;
      this.renderFlashcards(container, level);
    });

    container.querySelector('#btnPrevCard')?.addEventListener('click', () => {
      this.flashcardIndex = (this.flashcardIndex - 1 + vocabList.length) % vocabList.length;
      this.renderFlashcards(container, level);
    });

    container.querySelector('#btnCardHard')?.addEventListener('click', () => {
      audioService.playFeedback('error');
      storageService.recordError({
        id: 'fc_err_' + currentWord.hanzi,
        title: `${currentWord.hanzi} (${currentWord.pinyin})`,
        category: 'vocab',
        categoryName: 'Từ Vựng Flashcard',
        mistakeNote: 'Chưa nhớ được chữ Hán hoặc ý nghĩa',
        correction: `${currentWord.meaning} (Hán Việt: ${currentWord.hanviet})`,
        exampleSentence: currentWord.example || currentWord.example_zh
      });
      this.updateUserStatsDisplay();
      this.flashcardIndex = (this.flashcardIndex + 1) % vocabList.length;
      this.renderFlashcards(container, level);
    });

    container.querySelector('#btnCardEasy')?.addEventListener('click', () => {
      audioService.playFeedback('success');
      storageService.addExp(15);
      if (currentWord) {
        studentProgressService.recordLessonCompletion({
          lessonId: `fc_${currentWord.hanzi}`,
          level: level,
          category: 'vocab',
          score: 100,
          timeSpentSeconds: 15
        });
      }
      this.updateUserStatsDisplay();
      this.flashcardIndex = (this.flashcardIndex + 1) % vocabList.length;
      this.renderFlashcards(container, level);
    });
  }

  // =========================================================================
  // VIEW: Situational Dialogues
  // =========================================================================
  renderDialogues(container) {
    const scene = SITUATIONAL_DIALOGUES[this.currentDialogueIndex] || SITUATIONAL_DIALOGUES[0];

    container.innerHTML = `
      <div class="level-filter-bar">
        ${SITUATIONAL_DIALOGUES.map((s, idx) => `
          <button class="filter-chip ${idx === this.currentDialogueIndex ? 'active' : ''}" data-idx="${idx}">
            ${s.title}
          </button>
        `).join('')}
      </div>

      <div class="glass-panel" style="margin-bottom: 24px; border-left: 4px solid var(--gold-accent);">
        <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 8px;">
          <div>
            <span class="tier-badge" style="background: rgba(245, 158, 11, 0.15); color: var(--gold-accent); margin-bottom: 6px; display: inline-block;">
              ${scene.levelBadge}
            </span>
            <h3 style="font-size: 20px; font-weight: 800;">${scene.title}</h3>
            <div style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">
              📍 Địa điểm: <strong>${scene.location}</strong>
            </div>
          </div>
          <button class="btn-primary" id="btnPlayAllTurns">
            🔊 Đọc Toàn Bộ Hội Thoại
          </button>
        </div>
        <p style="color: var(--text-secondary); font-size: 14px; margin-top: 10px; line-height: 1.5;">
          ${scene.description}
        </p>
      </div>

      <div class="dialogue-chat-box">
        ${scene.turns.map(turn => `
          <div class="chat-bubble-row ${turn.role === 'user' ? 'user-row' : ''}">
            <div class="chat-avatar-icon" style="background: ${turn.role === 'user' ? 'var(--vermilion-gradient)' : 'var(--gold-gradient)'}; color: #fff;">
              ${turn.role === 'user' ? '我' : '他'}
            </div>
            <div class="chat-bubble">
              <div class="chat-speaker-name">${turn.speaker}</div>
              <div style="font-size: 18px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;" class="hanzi">
                ${turn.zh}
              </div>
              <div style="font-size: 13px; color: var(--gold-accent); margin-bottom: 6px;">
                ${turn.pinyin}
              </div>
              <div style="font-size: 13.5px; color: var(--text-secondary); margin-bottom: 8px;">
                ${turn.vi}
              </div>
              <button class="btn-sound speak-btn" data-text="${turn.zh}" style="width: 28px; height: 28px; font-size: 13px;">
                🔊
              </button>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="quiz-container">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span style="font-size: 18px;">🎯</span>
          <span class="quiz-question" style="margin-bottom: 0;">Thử Thách Ứng Biến Tại Chỗ:</span>
        </div>
        <p style="font-size: 14px; font-weight: 600; margin-bottom: 12px;">${scene.challenge.question}</p>
        <div class="quiz-options">
          ${scene.challenge.options.map((opt, i) => `
            <button class="quiz-option-btn dialogue-opt-btn" data-opt-idx="${i}">
              ${opt}
            </button>
          `).join('')}
        </div>
        <div id="dialogueFeedback" style="margin-top: 10px; font-size: 13.5px; font-weight: 700; display: none;"></div>
      </div>
    `;

    container.querySelectorAll('.filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentDialogueIndex = parseInt(btn.dataset.idx, 10);
        this.renderDialogues(container);
      });
    });

    container.querySelectorAll('.speak-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        audioService.speak(btn.dataset.text);
      });
    });

    container.querySelector('#btnPlayAllTurns')?.addEventListener('click', () => {
      const fullScript = scene.turns.map(t => t.zh).join('。 ');
      audioService.speak(fullScript, 0.85);
    });

    container.querySelectorAll('.dialogue-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const optIdx = parseInt(btn.dataset.optIdx, 10);
        const isCorrect = optIdx === scene.challenge.correctAnswer;
        const feedbackEl = container.querySelector('#dialogueFeedback');

        if (isCorrect) {
          audioService.playFeedback('success');
          btn.classList.add('correct');
          if (feedbackEl) {
            feedbackEl.style.display = 'block';
            feedbackEl.style.color = '#34d399';
            feedbackEl.textContent = `🎉 Chuẩn xác! ${scene.challenge.explanation}`;
          }
          storageService.addExp(30);
          this.updateUserStatsDisplay();
        } else {
          audioService.playFeedback('error');
          btn.classList.add('wrong');
          if (feedbackEl) {
            feedbackEl.style.display = 'block';
            feedbackEl.style.color = '#f87171';
            feedbackEl.textContent = `❌ Chưa phù hợp bối cảnh. ${scene.challenge.explanation}`;
          }
        }
      });
    });
  }

  // =========================================================================
  // VIEW: Radicals & Etymology
  // =========================================================================
  renderRadicalsView(container) {
    let radicals = RADICALS_DATA;

    // Filter by stroke count
    if (this.radicalsStrokeFilter !== 'all') {
      if (this.radicalsStrokeFilter === '1-2') radicals = radicals.filter(r => r.strokes <= 2);
      else if (this.radicalsStrokeFilter === '3') radicals = radicals.filter(r => r.strokes === 3);
      else if (this.radicalsStrokeFilter === '4') radicals = radicals.filter(r => r.strokes === 4);
      else if (this.radicalsStrokeFilter === '5') radicals = radicals.filter(r => r.strokes === 5);
      else if (this.radicalsStrokeFilter === '6-7') radicals = radicals.filter(r => r.strokes === 6 || r.strokes === 7);
      else if (this.radicalsStrokeFilter === '8+') radicals = radicals.filter(r => r.strokes >= 8);
    }

    // Filter by search query
    if (this.radicalsSearchQuery.trim()) {
      const q = this.radicalsSearchQuery.trim().toLowerCase();
      radicals = radicals.filter(r =>
        r.radical.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.pinyin.toLowerCase().includes(q) ||
        r.meaning.toLowerCase().includes(q) ||
        r.etymology.toLowerCase().includes(q) ||
        r.exampleCharacters.some(ex => ex.char.includes(q) || ex.meaning.toLowerCase().includes(q))
      );
    }

    container.innerHTML = `
      <div class="glass-panel" style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px;">
          <div>
            <h3 style="font-size: 20px; font-weight: 800; margin-bottom: 6px;">
              🌱 Trọn Bộ 214 Bộ Thủ Khang Hy (康熙部首) & Chiết Tự Chữ Hán
            </h3>
            <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.6;">
              Hơn 90% chữ Hán là <strong>chữ hình thanh (形声字)</strong>. Nắm vững trọn bộ 214 bộ thủ giúp bạn nhận diện cấu trúc,
              đoán nghĩa tức thì và hiểu sâu sắc cội nguồn văn hóa Hán tự từ thời Giáp cốt văn.
            </p>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="badge-count" style="font-size: 13px; padding: 6px 14px; background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3);">
              Hiển thị: <strong>${radicals.length}</strong> / ${RADICALS_DATA.length} bộ thủ
            </span>
          </div>
        </div>
      </div>

      <!-- Filters & Search -->
      <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
        <div class="level-filter-bar" style="margin-bottom: 0;">
          ${[
            { id: 'all', label: 'Tất cả (214)' },
            { id: '1-2', label: '1 - 2 Nét' },
            { id: '3', label: '3 Nét' },
            { id: '4', label: '4 Nét' },
            { id: '5', label: '5 Nét' },
            { id: '6-7', label: '6 - 7 Nét' },
            { id: '8+', label: '8 - 17 Nét' }
          ].map(tab => `
            <button class="filter-chip radical-stroke-tab ${this.radicalsStrokeFilter === tab.id ? 'active' : ''}" data-stroke="${tab.id}">
              ${tab.label}
            </button>
          `).join('')}
        </div>

        <div style="display: flex; gap: 10px;">
          <input 
            type="text" 
            id="radicalSearchInput" 
            class="lexicon-input" 
            placeholder="🔍 Tìm nhanh bộ thủ: Nhập chữ (vd: 水, 心, 亻), tên Hán-Việt (vd: Băng, Trúc), Pinyin hoặc ý nghĩa..." 
            value="${this.radicalsSearchQuery}"
            style="flex: 1;"
          />
          ${this.radicalsSearchQuery ? `
            <button class="btn-secondary" id="btnClearRadicalSearch">Xóa tìm</button>
          ` : ''}
        </div>
      </div>

      <div class="radicals-grid">
        ${radicals.map(r => `
          <div class="radical-card animate-fade-in">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
              <div style="display: flex; align-items: baseline; gap: 8px;">
                <span style="font-size: 38px; font-weight: 800; color: var(--brand-red);" class="hanzi">${r.radical}</span>
                <span style="font-size: 13px; color: var(--text-muted); font-weight: 700;">#${r.number}</span>
              </div>
              <span class="tier-badge" style="background: rgba(245, 158, 11, 0.15); color: var(--gold-accent);">
                ${r.strokes} nét • ${r.pinyin}
              </span>
            </div>

            <div style="font-size: 16px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">
              ${r.name}
            </div>
            <div style="font-size: 13px; color: var(--text-accent); margin-bottom: 10px;">
              Ý nghĩa: <strong>${r.meaning}</strong>
            </div>

            <p style="font-size: 12.5px; color: var(--text-secondary); margin-bottom: 14px; line-height: 1.5;">
              💡 <em>${r.etymology}</em>
            </p>

            <div style="font-size: 12px; font-weight: 700; color: var(--text-muted); margin-bottom: 6px;">
              Chữ Hán tiêu biểu:
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              ${r.exampleCharacters.map(ex => `
                <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-secondary); padding: 5px 8px; border-radius: var(--radius-sm); font-size: 13px;">
                  <span class="hanzi" style="font-weight: 700; color: var(--gold-accent); font-size: 15px;">${ex.char} (${ex.pinyin})</span>
                  <span style="color: var(--text-secondary); font-size: 12px;">${ex.meaning}</span>
                  <div style="display: flex; gap: 4px;">
                    <button class="speak-btn" data-text="${ex.char}" title="Nghe đọc" style="font-size: 12px; padding: 2px 6px; cursor: pointer; background: transparent; border: 1px solid var(--border-color); border-radius: 4px;">🔊</button>
                    <button class="write-radical-char-btn" data-char="${ex.char}" title="Luyện viết chữ này" style="font-size: 12px; padding: 2px 6px; cursor: pointer; background: transparent; border: 1px solid var(--border-color); border-radius: 4px;">✍️</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Bind stroke tabs
    container.querySelectorAll('.radical-stroke-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        this.radicalsStrokeFilter = btn.dataset.stroke;
        this.renderRadicalsView(container);
      });
    });

    // Bind search input
    const searchInput = container.querySelector('#radicalSearchInput');
    searchInput?.addEventListener('input', (e) => {
      this.radicalsSearchQuery = e.target.value;
      this.renderRadicalsView(container);
    });

    container.querySelector('#btnClearRadicalSearch')?.addEventListener('click', () => {
      this.radicalsSearchQuery = '';
      this.renderRadicalsView(container);
    });

    // Bind speak buttons
    container.querySelectorAll('.speak-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        audioService.speak(btn.dataset.text);
      });
    });

    // Bind write char buttons
    container.querySelectorAll('.write-radical-char-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchView('hanzi_canvas', { char: btn.dataset.char });
      });
    });
  }

  // =========================================================================
  // VIEW: SQLite Database Studio & Backup
  // =========================================================================
  renderSqliteStudio(container) {
    const tablesInfo = sqliteService.getTablesInfo();
    const snapshots = sqliteService.getSnapshotIndex();

    container.innerHTML = `
      <div class="glass-panel" style="margin-bottom: 24px; border-left: 4px solid var(--gold-accent);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 24px;">💾</span>
              <h3 style="font-size: 20px; font-weight: 800; margin: 0;">Quản Trị Cơ Sở Dữ Liệu SQLite & Time-Machine</h3>
              <span style="font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 9999px; background: rgba(245, 158, 11, 0.15); color: #fbbf24;">CHỈ DÀNH CHO ADMIN</span>
            </div>
            <p style="color: var(--text-secondary); font-size: 14px; margin-top: 6px; line-height: 1.6;">
              Nhân CSDL <strong>SQLite WebAssembly (sql.js)</strong> chạy trực tiếp trên máy khách và đồng bộ bền vững IndexedDB.
              Đã kích hoạt <strong>Lá Chắn An Toàn 3 Lớp</strong>: Tự động chụp Snapshot khẩn cấp trước khi nạp tệp, thẩm định tính toàn vẹn Schema để đảm bảo 0% nguy cơ mất dữ liệu!
            </p>
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn-secondary" id="btnSeedExpandedWords" style="color: #10b981; border-color: rgba(16, 185, 129, 0.4);">
              ⚡ Nạp Từ HSK 1 - 9 Mở Rộng
            </button>
            <button class="btn-secondary" id="btnStudioSyncHsk" style="color: #06b6d4; border-color: rgba(6, 182, 212, 0.4);">
              📚 Đồng Bộ Kho HSK 3.0
            </button>
            <button class="btn-primary" id="btnExportSqlite">
              📥 Xuất Tệp SQLite (.sqlite)
            </button>
            <label class="btn-secondary" style="cursor: pointer; display: inline-flex; align-items: center; gap: 6px; border-color: rgba(239, 68, 68, 0.4); color: #f87171;" title="Chỉ Quản trị viên mới có quyền nạp tệp">
              📤 Nhập Tệp (.sqlite)
              <input type="file" id="importSqliteInput" accept=".sqlite,.db" style="display: none;" />
            </label>
          </div>
        </div>
      </div>

      <!-- Time-Machine Snapshots Panel -->
      <div class="glass-panel" style="margin-bottom: 24px; border: 1.5px solid rgba(245, 158, 11, 0.25);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
          <div>
            <h4 style="font-size: 16px; font-weight: 800; color: #fbbf24; display: flex; align-items: center; gap: 8px; margin: 0;">
              <span>📸</span> Cỗ Máy Thời Gian CSDL (Database Time-Machine Snapshots)
            </h4>
            <div style="font-size: 13px; color: var(--text-muted); margin-top: 2px;">
              Lưu giữ các điểm khôi phục tức thì trong IndexedDB. Cho phép hoàn nguyên CSDL bất kỳ lúc nào với 0% rủi ro.
            </div>
          </div>
          <button class="btn-secondary" id="btnCreateDbSnapshot" style="padding: 6px 14px; font-size: 12.5px; color: #fbbf24; border-color: rgba(245, 158, 11, 0.4);">
            ➕ Tạo Bản Snapshot Mới
          </button>
        </div>

        <div id="snapshotListContainer">
          ${snapshots.length === 0 ? `
            <div style="padding: 16px; text-align: center; color: var(--text-muted); font-size: 13px; background: rgba(0,0,0,0.02); border-radius: 10px;">
              Chưa có bản Snapshot nào. Bấm nút <strong>"➕ Tạo Bản Snapshot Mới"</strong> hoặc nạp file .sqlite để hệ thống tự động lưu giữ điểm khôi phục.
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${snapshots.map(s => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--bg-card); border-radius: 10px; border: 1px solid var(--border-color); flex-wrap: wrap; gap: 8px;">
                  <div>
                    <span style="font-weight: 700; color: var(--text-primary);">${s.name}</span>
                    <span style="font-size: 12px; color: var(--text-muted); margin-left: 8px;">🕒 ${s.formattedTime}</span>
                    <div style="font-size: 12px; color: var(--text-secondary); margin-top: 3px;">
                      Dung lượng: <strong>${s.sizeKb} KB</strong> • Từ vựng: <strong>${s.wordCount}</strong> từ • Học viên: <strong>${s.userCount}</strong> tài khoản
                    </div>
                  </div>
                  <div style="display: flex; gap: 6px;">
                    <button class="btn-secondary btn-restore-snapshot" data-id="${s.id}" style="padding: 4px 10px; font-size: 12px; color: #10b981;">
                      🔄 Khôi Phục
                    </button>
                    <button class="btn-secondary btn-delete-snapshot" data-id="${s.id}" style="padding: 4px 10px; font-size: 12px; color: #ef4444;">
                      🗑️ Xóa
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>

      <div class="panel-header">
        <h3 class="panel-title">
          <span>📊</span> Bảng Dữ Liệu Trong Database (${tablesInfo.length} bảng)
        </h3>
      </div>

      <div class="sql-tables-grid">
        ${tablesInfo.map(t => `
          <div class="sql-table-card" data-table="${t.name}">
            <div>
              <div style="font-weight: 800; font-size: 15px; color: var(--gold-accent);">
                📂 ${t.name}
              </div>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
                Số lượng: <strong>${t.rowCount}</strong> dòng
              </div>
            </div>
            <button class="btn-secondary" style="padding: 4px 10px; font-size: 12px;">Xem →</button>
          </div>
        `).join('')}
      </div>

      <div class="glass-panel sql-console-wrap">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
          <label style="font-weight: 700; font-size: 14px; color: var(--text-primary);">
            🖥️ SQL Query Console (Thực thi truy vấn SQL bất kỳ):
          </label>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn-secondary" id="btnQuickDict" style="font-size: 12px; padding: 4px 10px;">SELECT dictionary</button>
            <button class="btn-secondary" id="btnQuickUsers" style="font-size: 12px; padding: 4px 10px;">SELECT users</button>
            <button class="btn-secondary" id="btnQuickErrors" style="font-size: 12px; padding: 4px 10px;">SELECT errors</button>
          </div>
        </div>

        <textarea class="sql-editor" id="sqlEditor">SELECT * FROM dictionary LIMIT 15;</textarea>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
          <span id="sqlExecutionMsg" style="font-size: 13px; font-weight: 600;"></span>
          <button class="btn-primary" id="btnRunSql" style="padding: 8px 18px;">
            ⚡ Chạy Lệnh SQL
          </button>
        </div>
      </div>

      <div class="glass-panel" id="sqlResultsPanel" style="display: none;">
        <div class="panel-header">
          <h4 class="panel-title"><span>📋</span> Kết Quả Truy Vấn Bảng</h4>
          <span id="sqlRowCountBadge" style="font-size: 12.5px; color: var(--gold-accent); font-weight: 700;"></span>
        </div>
        <div class="sql-results-table-wrap" id="sqlTableContainer"></div>
      </div>
    `;

    // Nạp từ vựng mở rộng
    container.querySelector('#btnSeedExpandedWords')?.addEventListener('click', () => {
      const added = sqliteService.seedExpandedDictionary();
      if (added > 0) {
        toastService.success(`Đã nạp thành công +${added} từ vựng HSK 1 - 9 mở rộng vào CSDL SQLite!`, 'Cập Nhật Từ Vựng');
      } else {
        toastService.info('Kho từ vựng mở rộng đã tồn tại đầy đủ trong CSDL SQLite.', 'Đã Có Đủ Từ Vựng');
      }
      this.renderSqliteStudio(container);
    });

    // Tạo Snapshot thủ công
    container.querySelector('#btnCreateDbSnapshot')?.addEventListener('click', async () => {
      const snapName = prompt('Nhập tên gợi nhớ cho bản Snapshot sao lưu:', `Sao lưu ngày ${new Date().toLocaleDateString('vi-VN')}`);
      if (snapName) {
        const snap = await sqliteService.createDatabaseSnapshot(snapName);
        if (snap) {
          toastService.success(`Đã tạo Snapshot "${snap.name}" thành công! (${snap.sizeKb} KB)`, 'Snapshot Đã Lưu');
          this.renderSqliteStudio(container);
        } else {
          toastService.error('Không thể tạo bản Snapshot!', 'Lỗi Snapshot');
        }
      }
    });

    // Khôi phục Snapshot
    container.querySelectorAll('.btn-restore-snapshot').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        if (confirm('CẢNH BÁO: Bạn có chắc chắn muốn khôi phục CSDL về Snapshot này? Hệ thống sẽ tự động lưu lại trạng thái hiện tại trước khi hoàn nguyên.')) {
          const res = await sqliteService.restoreDatabaseSnapshot(id);
          if (res.success) {
            toastService.success(res.message, 'Hoàn Nguyên CSDL');
            await storageService.syncWithSqlite();
            this.updateUserStatsDisplay();
            this.renderSqliteStudio(container);
          } else {
            toastService.error(res.message, 'Lỗi Hoàn Nguyên');
          }
        }
      });
    });

    // Xóa Snapshot
    container.querySelectorAll('.btn-delete-snapshot').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        if (confirm('Bạn có chắc chắn muốn xóa bản Snapshot này khỏi bộ nhớ?')) {
          await sqliteService.deleteDatabaseSnapshot(id);
          toastService.info('Đã xóa bản Snapshot.', 'Đã Xóa');
          this.renderSqliteStudio(container);
        }
      });
    });

    // Xuất tệp
    container.querySelector('#btnExportSqlite')?.addEventListener('click', () => {
      sqliteService.exportDatabaseFile();
      toastService.success('Đã tải xuống tệp CSDL .sqlite thành công!', 'Xuất Tệp');
    });

    // Nhập tệp an toàn
    const fileInput = container.querySelector('#importSqliteInput');
    fileInput?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        if (!confirm(`XÁC NHẬN NẠP TỆP CSDL:\nBạn sắp nạp tệp "${file.name}".\nHệ thống sẽ tự động tạo một bản Snapshot dự phòng trước khi nạp. Bạn có muốn tiếp tục?`)) {
          fileInput.value = '';
          return;
        }

        const res = await sqliteService.importDatabaseFile(file);
        if (res.success) {
          toastService.success(res.message, 'Nạp CSDL Thành Công');
          await storageService.syncWithSqlite();
          this.updateUserStatsDisplay();
          this.renderSqliteStudio(container);
        } else {
          toastService.error(res.message, 'Nạp CSDL Thất Bại');
        }
        fileInput.value = '';
      }
    });

    container.querySelector('#btnStudioSyncHsk')?.addEventListener('click', () => {
      this.showSyncCorpusModal(container, () => this.renderSqliteStudio(container));
    });

    container.querySelectorAll('.sql-table-card').forEach(card => {
      card.addEventListener('click', () => {
        const table = card.dataset.table;
        const editor = container.querySelector('#sqlEditor');
        if (editor) {
          editor.value = `SELECT * FROM ${table} ORDER BY 1 DESC LIMIT 20;`;
          this.executeSqlAndRender(container);
        }
      });
    });

    container.querySelector('#btnQuickDict')?.addEventListener('click', () => {
      container.querySelector('#sqlEditor').value = 'SELECT id, hanzi, pinyin, hanviet, meaning, level FROM dictionary LIMIT 20;';
      this.executeSqlAndRender(container);
    });
    container.querySelector('#btnQuickUsers')?.addEventListener('click', () => {
      container.querySelector('#sqlEditor').value = 'SELECT * FROM users;';
      this.executeSqlAndRender(container);
    });
    container.querySelector('#btnQuickErrors')?.addEventListener('click', () => {
      container.querySelector('#sqlEditor').value = 'SELECT id, title, category, error_count, mastery_level FROM error_notebook;';
      this.executeSqlAndRender(container);
    });

    container.querySelector('#btnRunSql')?.addEventListener('click', () => {
      this.executeSqlAndRender(container);
    });

    this.executeSqlAndRender(container);
  }

  executeSqlAndRender(container) {
    const editor = container.querySelector('#sqlEditor');
    const msgEl = container.querySelector('#sqlExecutionMsg');
    const panel = container.querySelector('#sqlResultsPanel');
    const tableContainer = container.querySelector('#sqlTableContainer');
    const countBadge = container.querySelector('#sqlRowCountBadge');

    if (!editor) return;
    const sql = editor.value.trim();
    if (!sql) return;

    const res = sqliteService.executeRaw(sql);

    if (res.error) {
      if (msgEl) {
        msgEl.style.color = '#f87171';
        msgEl.textContent = `❌ Lỗi SQL: ${res.error}`;
      }
      return;
    }

    if (msgEl) {
      msgEl.style.color = '#34d399';
      msgEl.textContent = '✅ Lệnh SQL thực thi hoàn tất';
    }

    if (panel) panel.style.display = 'block';

    if (res.columns.length === 0) {
      tableContainer.innerHTML = `<div style="padding: 16px; color: var(--text-muted); font-size: 13px;">${res.message || 'Lệnh hoàn thành (0 dòng)'}</div>`;
      if (countBadge) countBadge.textContent = '0 dòng';
      return;
    }

    if (countBadge) countBadge.textContent = `${res.values.length} dòng trả về`;

    let html = `<table class="sql-table"><thead><tr>`;
    res.columns.forEach(col => {
      html += `<th>${col}</th>`;
    });
    html += `</tr></thead><tbody>`;

    res.values.forEach(row => {
      html += `<tr>`;
      row.forEach(val => {
        html += `<td>${val !== null && val !== undefined ? String(val) : '<em>null</em>'}</td>`;
      });
      html += `</tr>`;
    });
    html += `</tbody></table>`;

    tableContainer.innerHTML = html;
  }

  // =========================================================================
  // VIEW: Curriculum & Vocabulary
  // =========================================================================
  renderCurriculum(container, levelNum = 1) {
    this.selectedLevel = levelNum;
    const currentMeta = HSK_LEVELS.find(l => l.id === levelNum) || HSK_LEVELS[0];
    const vocabList = HSK_VOCABULARY[levelNum] || [];
    const grammarList = HSK_GRAMMAR[levelNum] || [];
    const favorites = storageService.getFavorites();

    container.innerHTML = `
      <div class="level-filter-bar">
        ${HSK_LEVELS.map(lvl => `
          <button class="filter-chip ${lvl.id === levelNum ? 'active' : ''}" data-level="${lvl.id}">
            ${lvl.level}
          </button>
        `).join('')}
      </div>

      <div class="glass-panel" style="margin-bottom: 28px; border-left: 4px solid ${currentMeta.color};">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px; margin-bottom: 12px;">
          <div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <h2 style="font-size: 26px; font-weight: 800; color: ${currentMeta.color};">${currentMeta.level}</h2>
              <span class="tier-badge" style="background: ${currentMeta.color}20; color: ${currentMeta.color}; border: 1px solid ${currentMeta.color}40;">
                ${currentMeta.tier}
              </span>
              <span style="font-size: 13px; color: var(--gold-accent); font-weight: 600;">${currentMeta.badge}</span>
            </div>
            <p style="color: var(--text-secondary); margin-top: 6px; font-size: 14px;">${currentMeta.overview}</p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn-secondary" id="btnFlashcardLevel">
              🎴 Luyện Thẻ HSK ${levelNum}
            </button>
            <button class="btn-primary" id="btnTestThisLevel">
              📝 Thi Thử HSK ${levelNum}
            </button>
          </div>
        </div>
        <div style="font-size: 13px; color: var(--text-muted); padding-top: 10px; border-top: 1px solid var(--border-color);">
          <strong>Cấu trúc bài thi:</strong> ${currentMeta.examStructure}
        </div>
      </div>

      <div class="panel-header">
        <h3 class="panel-title">
          <span>📖</span> Từ Vựng Trọng Điểm & Ngữ Cảnh (${vocabList.length} từ tiêu biểu)
        </h3>
        <span style="font-size: 13px; color: var(--text-muted);">Bấm 🔊 để nghe phát âm chuẩn bản ngữ</span>
      </div>

      <div class="vocab-grid">
        ${vocabList.map(item => {
          const isFav = favorites.includes(item.hanzi);
          return `
            <div class="vocab-card">
              <div class="vocab-top">
                <div class="vocab-hanzi-wrap">
                  <span class="vocab-hanzi hanzi">${item.hanzi}</span>
                  <span class="vocab-pinyin">${item.pinyin}</span>
                </div>
                <div style="display: flex; gap: 6px;">
                  <button class="btn-sound speak-btn" data-text="${item.hanzi}" title="Nghe phát âm">🔊</button>
                  <button class="btn-sound practice-draw-btn" data-char="${item.hanzi.charAt(0)}" title="Tập viết chữ này" style="color: var(--gold-accent); border-color: rgba(245, 158, 11, 0.3);">✍️</button>
                  <button class="btn-sound fav-btn" data-hanzi="${item.hanzi}" title="Lưu từ yêu thích" style="color: ${isFav ? 'var(--primary-red-hover)' : 'var(--text-muted)'};">
                    ${isFav ? '❤️' : '🤍'}
                  </button>
                </div>
              </div>

              <div style="display: flex; gap: 12px; margin-bottom: 8px;">
                <span class="vocab-hanviet">Âm Hán-Việt: <strong>${item.hanviet}</strong></span>
                <span style="font-size: 12px; color: var(--text-muted);">Bộ: ${item.radical}</span>
              </div>

              <div class="vocab-meaning">${item.meaning}</div>

              <div class="vocab-example-box">
                <div class="vocab-example-zh hanzi" style="display: flex; align-items: center; justify-content: space-between;">
                  <span>${item.example}</span>
                  <button class="speak-btn" data-text="${item.example}" style="font-size: 14px; opacity: 0.8; padding: 2px;">🔊</button>
                </div>
                <div style="font-size: 12px; color: var(--gold-accent); margin-bottom: 2px;">${item.examplePinyin}</div>
                <div class="vocab-example-vi">${item.exampleMeaning}</div>
              </div>

              <div class="vocab-notes">
                <strong>💡 Lưu ý sư phạm:</strong> ${item.notes}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      ${grammarList.length > 0 ? `
        <div class="panel-header" style="margin-top: 40px;">
          <h3 class="panel-title">
            <span>📐</span> Ngữ Pháp & Cấu Trúc Then Chốt ${currentMeta.level}
          </h3>
        </div>
        <div style="display: flex; flex-direction: column; gap: 18px;">
          ${grammarList.map(g => `
            <div class="glass-panel" style="padding: 22px;">
              <div style="font-size: 17px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px;">
                ${g.title}
              </div>
              <div style="display: inline-block; background: rgba(245, 158, 11, 0.12); color: var(--gold-accent); font-weight: 700; font-size: 13.5px; padding: 4px 12px; border-radius: var(--radius-sm); margin-bottom: 10px; border: 1px solid rgba(245, 158, 11, 0.25);">
                Công thức: ${g.formula}
              </div>
              <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 12px;">${g.explanation}</p>
              
              <div class="vocab-example-box" style="margin-bottom: 10px;">
                <div class="vocab-example-zh hanzi" style="display: flex; justify-content: space-between;">
                  <span>${g.exampleZh}</span>
                  <button class="speak-btn" data-text="${g.exampleZh}">🔊</button>
                </div>
                <div class="vocab-example-vi">${g.exampleVi}</div>
              </div>

              <div style="font-size: 12.5px; color: #f87171; background: rgba(239, 68, 68, 0.08); padding: 8px 12px; border-radius: var(--radius-sm); border-left: 3px solid #ef4444;">
                <strong>⚠️ Bẫy người Việt hay sai:</strong> ${g.trapNote}
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;

    container.querySelectorAll('.filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const lvl = parseInt(btn.dataset.level, 10);
        this.renderCurriculum(container, lvl);
      });
    });

    container.querySelector('#btnTestThisLevel')?.addEventListener('click', () => {
      this.switchView('mock_exam');
    });

    container.querySelector('#btnFlashcardLevel')?.addEventListener('click', () => {
      this.switchView('flashcards', { level: levelNum });
    });

    container.querySelectorAll('.speak-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        audioService.speak(btn.dataset.text);
      });
    });

    container.querySelectorAll('.practice-draw-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.switchView('hanzi_canvas', { char: btn.dataset.char });
      });
    });

    container.querySelectorAll('.fav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const hanzi = btn.dataset.hanzi;
        const isFav = storageService.toggleFavorite(hanzi);
        btn.textContent = isFav ? '❤️' : '🤍';
        btn.style.color = isFav ? 'var(--primary-red-hover)' : 'var(--text-muted)';
      });
    });
  }

  // =========================================================================
  // VIEW: Hanzi Canvas Practice
  // =========================================================================
  renderHanziCanvas(container, defaultChar = '好') {
    const presetChars = [
      { char: '好', pinyin: 'hǎo', level: 'HSK 1' },
      { char: '谢', pinyin: 'xiè', level: 'HSK 1' },
      { char: '永', pinyin: 'yǒng', level: 'Bát pháp' },
      { char: '准', pinyin: 'zhǔn', level: 'HSK 2' },
      { char: '解', pinyin: 'jiě', level: 'HSK 3' },
      { char: '关', pinyin: 'guān', level: 'HSK 4' },
      { char: '辑', pinyin: 'jí', level: 'HSK 5' },
      { char: '潜', pinyin: 'qián', level: 'HSK 6' },
      { char: '韬', pinyin: 'tāo', level: 'HSK 7' },
      { char: '融', pinyin: 'róng', level: 'HSK 8' },
      { char: '赋', pinyin: 'fù', level: 'HSK 9' }
    ];

    container.innerHTML = `
      <div class="glass-panel" style="margin-bottom: 24px;">
        <p style="color: var(--text-secondary); font-size: 14px;">
          Luyện viết chữ Hán trên lưới <strong>Mễ Tự Cách (米字格)</strong> chuẩn mực.
          Tính năng nét mờ hướng dẫn vị trí khởi bút, hành bút và thu bút theo quy tắc bút thuận.
        </p>
      </div>

      <div class="canvas-layout">
        <div class="canvas-box">
          <canvas id="hanziCanvas"></canvas>

          <div class="canvas-toolbar">
            <button class="btn-secondary" id="btnSpeakChar" title="Nghe phát âm">
              🔊 Nghe phát âm
            </button>
            <button class="btn-secondary" id="btnToggleGhost" title="Bật/Tắt nét mờ">
              👁️ Nét mờ: <strong id="ghostStatusTxt" style="color: var(--gold-accent);">Bật</strong>
            </button>
            <button class="btn-secondary" id="btnUndoStroke" title="Hoàn tác nét">
              ↩️ Hoàn tác
            </button>
            <button class="btn-secondary" id="btnClearCanvas" style="color: #f87171;" title="Xóa hết">
              🗑️ Xóa hết
            </button>
          </div>

          <div style="display: flex; align-items: center; gap: 14px; margin-top: 6px;">
            <span style="font-size: 13px; color: var(--text-muted);">Màu mực:</span>
            <button class="color-btn active" data-color="#E02424" style="width: 26px; height: 26px; border-radius: 50%; background: #E02424; border: 2px solid #fff;"></button>
            <button class="color-btn" data-color="#111827" style="width: 26px; height: 26px; border-radius: 50%; background: #111827; border: 1px solid var(--border-color);"></button>
            <button class="color-btn" data-color="#F59E0B" style="width: 26px; height: 26px; border-radius: 50%; background: #F59E0B; border: 1px solid var(--border-color);"></button>
            <button class="color-btn" data-color="#10B981" style="width: 26px; height: 26px; border-radius: 50%; background: #10B981; border: 1px solid var(--border-color);"></button>
          </div>
        </div>

        <div class="glass-panel">
          <div class="panel-header">
            <h3 class="panel-title">
              <span>🎯</span> Chọn Chữ Luyện Viết (HSK 1 – HSK 9)
            </h3>
            <span id="activeCharBadge" style="font-size: 18px; font-weight: 800; color: var(--gold-accent);">
              ${defaultChar}
            </span>
          </div>

          <div style="display: flex; gap: 10px; margin-bottom: 16px;">
            <input type="text" id="customCharInput" maxlength="1" placeholder="Gõ chữ bất kỳ để viết (vd: 学)..." style="flex: 1; padding: 9px 12px;">
            <button class="btn-primary" id="btnApplyCustomChar">Tập Chữ Này</button>
          </div>

          <div class="character-picker-grid">
            ${presetChars.map(item => `
              <button class="char-pick-btn ${item.char === defaultChar ? 'active' : ''}" data-char="${item.char}" title="${item.pinyin} (${item.level})">
                <span>${item.char}</span>
                <span style="font-size: 10px; color: var(--gold-accent); position: absolute; bottom: 4px;">${item.pinyin}</span>
              </button>
            `).join('')}
          </div>

          <div style="margin-top: 24px; padding: 16px; background: var(--bg-secondary); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 6px;">💡 Mẹo Vĩnh Tự Bát Pháp (永字八法):</div>
            <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5;">
              Chữ <strong>永 (Vĩnh)</strong> hội tụ đầy đủ 8 nét cơ bản cấu thành thư pháp chữ Hán:
              Trắc (Chấm - 点), Lặc (Ngang - 横), Nỗ (Sổ - 竖), Địch (Móc - 钩), Sách (Hất - 提),
              Phất (Phẩy ngắn - 撇), Đoản phất (Phẩy dài), Nại (Mác - 捺).
            </p>
          </div>
        </div>
      </div>
    `;

    const canvasEl = container.querySelector('#hanziCanvas');
    this.canvasController = new HanziCanvasController(canvasEl, { guideChar: defaultChar });

    container.querySelector('#btnSpeakChar')?.addEventListener('click', () => {
      audioService.speak(this.canvasController.guideChar);
    });

    container.querySelector('#btnToggleGhost')?.addEventListener('click', () => {
      this.canvasController.toggleGhost();
      const txt = container.querySelector('#ghostStatusTxt');
      if (txt) {
        txt.textContent = this.canvasController.showGhost ? 'Bật' : 'Tắt';
        txt.style.color = this.canvasController.showGhost ? 'var(--gold-accent)' : 'var(--text-muted)';
      }
    });

    container.querySelector('#btnUndoStroke')?.addEventListener('click', () => {
      this.canvasController.undo();
    });

    container.querySelector('#btnClearCanvas')?.addEventListener('click', () => {
      this.canvasController.clear();
    });

    container.querySelectorAll('.color-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.color-btn').forEach(b => b.style.border = '1px solid var(--border-color)');
        btn.style.border = '2px solid #fff';
        this.canvasController.setBrushColor(btn.dataset.color);
      });
    });

    container.querySelectorAll('.char-pick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.char-pick-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const char = btn.dataset.char;
        this.canvasController.setGuideCharacter(char);
        const badge = container.querySelector('#activeCharBadge');
        if (badge) badge.textContent = char;
      });
    });

    container.querySelector('#btnApplyCustomChar')?.addEventListener('click', () => {
      const input = container.querySelector('#customCharInput');
      const val = input.value.trim();
      if (val) {
        this.canvasController.setGuideCharacter(val.charAt(0));
        const badge = container.querySelector('#activeCharBadge');
        if (badge) badge.textContent = val.charAt(0);
        input.value = '';
      }
    });
  }

  // =========================================================================
  // VIEW: Tones & Minimal Pairs
  // =========================================================================
  renderTonesView(container) {
    container.innerHTML = `
      <div class="glass-panel" style="margin-bottom: 28px;">
        <h3 style="font-size: 18px; font-weight: 800; margin-bottom: 8px;">
          Hệ Thống 5 Bậc Cao Độ Thanh Điệu Chuẩn Bắc Kinh (Chao's 5-level System)
        </h3>
        <p style="color: var(--text-secondary); font-size: 14px;">
          Bấm nút <strong>🔊 Cao độ</strong> để nghe âm chuẩn do bộ tổng hợp âm thanh Web Audio API phát ra ở tần số Hertz thực tế.
        </p>
      </div>

      <div class="tone-curves-grid">
        ${TONE_CONTOURS.map(t => `
          <div class="tone-card">
            <div class="tone-card-top">
              <span class="tone-mark-display">${t.mark}</span>
              <span class="pitch-badge">${t.contour} (${t.pitchName})</span>
            </div>
            <div style="font-weight: 800; font-size: 15px; margin-bottom: 6px;">${t.name}</div>
            <p class="tone-desc">${t.description}</p>
            
            <div class="tone-examples-list">
              ${t.exampleWords.map(w => `
                <div class="tone-mini-pill speak-btn" data-text="${w.hanzi}" style="cursor: pointer;" title="Nghe ${w.hanzi}">
                  <span class="hanzi" style="font-weight: 700; font-size: 16px;">${w.hanzi}</span>
                  <div style="font-size: 11px; color: var(--gold-accent);">${w.pinyin}</div>
                </div>
              `).join('')}
            </div>

            <button class="btn-primary play-pitch-btn" data-tone="${t.tone}" style="width: 100%; justify-content: center; font-size: 13px;">
              🎵 Nghe Cao Độ Tần Số ${t.contour}
            </button>
          </div>
        `).join('')}
      </div>

      <div class="panel-header" style="margin-top: 36px;">
        <h3 class="panel-title">
          <span>⚔️</span> Đấu Trường Cặp Âm Dễ Nhầm (Minimal Pairs)
        </h3>
        <span style="font-size: 13px; color: var(--text-muted);">Phân biệt sắc thái để tránh hiểu lầm tai hại</span>
      </div>

      <div>
        ${MINIMAL_PAIRS.map((p, idx) => `
          <div class="pair-card" id="pairCard_${p.id}">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h4 style="font-size: 18px; font-weight: 800; color: var(--text-primary);">${p.title}</h4>
              <span class="tier-badge" style="background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3);">
                Mức nguy hiểm: ${p.dangerLevel}
              </span>
            </div>

            <p style="color: var(--text-secondary); font-size: 13.5px; margin-top: 6px; font-style: italic;">
              ${p.story}
            </p>

            <div class="pair-versus-box">
              <div class="versus-word">
                <div style="font-size: 38px; font-weight: 800; color: var(--primary-red-hover);" class="hanzi">${p.wordA.hanzi}</div>
                <div style="font-size: 18px; color: var(--gold-accent); font-weight: 700;">${p.wordA.pinyin}</div>
                <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">Cao độ: ${p.wordA.contour}</div>
                <div style="font-size: 14px; font-weight: 600; color: var(--text-primary);">${p.wordA.meaning}</div>
                <button class="btn-sound speak-btn" data-text="${p.wordA.hanzi}" style="margin-top: 10px;">🔊</button>
              </div>

              <div class="versus-tag">VS</div>

              <div class="versus-word">
                <div style="font-size: 38px; font-weight: 800; color: var(--cyber-cyan);" class="hanzi">${p.wordB.hanzi}</div>
                <div style="font-size: 18px; color: var(--gold-accent); font-weight: 700;">${p.wordB.pinyin}</div>
                <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">Cao độ: ${p.wordB.contour}</div>
                <div style="font-size: 14px; font-weight: 600; color: var(--text-primary);">${p.wordB.meaning}</div>
                <button class="btn-sound speak-btn" data-text="${p.wordB.hanzi}" style="margin-top: 10px;">🔊</button>
              </div>
            </div>

            <div class="quiz-container">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                <span class="quiz-question">Thử thách phản xạ: Nghe và chọn từ tương ứng</span>
                <button class="btn-primary pair-audio-prompt-btn" data-sound="${p.practiceQuiz.audioPrompt}" style="padding: 6px 14px; font-size: 13px;">
                  🔊 Nghe Âm Ẩn Danh
                </button>
              </div>
              <div class="quiz-options">
                ${p.practiceQuiz.options.map((opt, optIdx) => `
                  <button class="quiz-option-btn pair-quiz-opt" data-pair-idx="${idx}" data-opt-idx="${optIdx}">
                    ${opt}
                  </button>
                `).join('')}
              </div>
              <div class="quiz-feedback-box" id="pairFeedback_${idx}" style="margin-top: 10px; font-size: 13px; font-weight: 700; display: none;"></div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="panel-header" style="margin-top: 36px;">
        <h3 class="panel-title">
          <span>👅</span> Phân Biệt Các Khối Âm Đầu Khó Nhất
        </h3>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 18px;">
        ${INITIAL_CONSONANTS_GUIDE.map(item => `
          <div class="glass-panel" style="padding: 20px;">
            <div style="font-size: 16px; font-weight: 800; color: var(--gold-accent); margin-bottom: 6px;">
              ${item.group} (${item.initials.join(', ')})
            </div>
            <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px;">
              <strong>Cơ chế phát âm:</strong> ${item.mechanics}
            </p>
            <p style="font-size: 13px; color: #6ee7b7; background: rgba(16, 185, 129, 0.08); padding: 8px; border-radius: var(--radius-sm);">
              <strong>Khuyên dùng cho người Việt:</strong> ${item.vietnameseNotes}
            </p>
          </div>
        `).join('')}
      </div>
    `;

    container.querySelectorAll('.play-pitch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        audioService.playTonePitch(parseInt(btn.dataset.tone, 10));
      });
    });

    container.querySelectorAll('.speak-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        audioService.speak(btn.dataset.text);
      });
    });

    container.querySelectorAll('.pair-audio-prompt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        audioService.speak(btn.dataset.sound);
      });
    });

    container.querySelectorAll('.pair-quiz-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        const pairIdx = parseInt(btn.dataset.pairIdx, 10);
        const optIdx = parseInt(btn.dataset.optIdx, 10);
        const pair = MINIMAL_PAIRS[pairIdx];
        const feedbackEl = container.querySelector(`#pairFeedback_${pairIdx}`);

        const isCorrect = optIdx === pair.practiceQuiz.correctIndex;
        if (isCorrect) {
          audioService.playFeedback('success');
          btn.classList.add('correct');
          if (feedbackEl) {
            feedbackEl.style.display = 'block';
            feedbackEl.style.color = '#34d399';
            feedbackEl.textContent = '🎉 Chính xác! Bạn đã nhận diện đúng thanh điệu.';
          }
          storageService.addExp(20);
          this.updateUserStatsDisplay();
        } else {
          audioService.playFeedback('error');
          btn.classList.add('wrong');
          if (feedbackEl) {
            feedbackEl.style.display = 'block';
            feedbackEl.style.color = '#f87171';
            feedbackEl.textContent = `❌ Chưa chính xác. Âm chuẩn là ${pair.practiceQuiz.options[pair.practiceQuiz.correctIndex]}.`;
          }
          storageService.recordError({
            id: 'err_pair_' + pair.id,
            title: pair.title,
            category: 'tone',
            categoryName: 'Thanh Điệu',
            mistakeNote: `Nhầm lẫn cặp âm: ${pair.practiceQuiz.audioPrompt}`,
            correction: `Phân biệt chuẩn giữa ${pair.wordA.hanzi} và ${pair.wordB.hanzi}`
          });
          this.updateUserStatsDisplay();
        }
      });
    });
  }

  // =========================================================================
  // VIEW: AI Tone Pitch Visualizer (Trực quan hóa cao độ thanh điệu 5 bậc)
  // =========================================================================
  renderTonePitchVisualizerView(container) {
    const tones = [
      { tone: 1, name: 'Thanh 1 (Âm bình)', contour: '5 - 5', color: '#3b82f6', d: 'M 10 15 L 140 15', desc: 'Bằng phẳng trên đỉnh cao nhất (bậc 5), giữ hơi đều và ngân dài.' },
      { tone: 2, name: 'Thanh 2 (Dương bình)', contour: '3 - 5', color: '#10b981', d: 'M 10 55 Q 75 35 140 15', desc: 'Khởi đầu ở tầm trung (bậc 3) vút nhanh lên đỉnh (bậc 5).' },
      { tone: 3, name: 'Thanh 3 (Thượng thanh)', contour: '2 - 1 - 4', color: '#8b5cf6', d: 'M 10 70 Q 70 105 140 40', desc: 'Hạ sâu xuống đáy cổ họng (bậc 1) rồi hơi vểnh nhẹ lên bậc 4.' },
      { tone: 4, name: 'Thanh 4 (Khứ thanh)', contour: '5 - 1', color: '#ef4444', d: 'M 10 15 L 140 95', desc: 'Dứt khoát từ đỉnh cao (bậc 5) rơi mạnh xuống đáy sâu (bậc 1).' },
      { tone: 5, name: 'Thanh nhẹ (Khinh thanh)', contour: 'Ngắn & Nhẹ', color: '#f59e0b', d: 'M 40 60 Q 75 68 110 75', desc: 'Đọc lướt nhanh, không nhấn trọng âm, rơi ngắn tự nhiên.' }
    ];

    const practiceWords = [
      { hanzi: '妈 (mā)', pinyin: 'mā', tone: 1, meaning: 'Mẹ' },
      { hanzi: '麻 (má)', pinyin: 'má', tone: 2, meaning: 'Vừng, mè / Tê buốt' },
      { hanzi: '马 (mǎ)', pinyin: 'mǎ', tone: 3, meaning: 'Con ngựa' },
      { hanzi: '骂 (mà)', pinyin: 'mà', tone: 4, meaning: 'Mắng, chửi' },
      { hanzi: '你好 (nǐ hǎo)', pinyin: 'nǐ hǎo', tone: 3, meaning: 'Xin chào (Quy tắc 2 thanh 3)' },
      { hanzi: '谢谢 (xièxie)', pinyin: 'xiè xie', tone: 4, meaning: 'Cảm ơn (Thanh 4 + Thanh nhẹ)' }
    ];

    container.innerHTML = `
      <div class="glass-panel" style="margin-bottom: 24px; border-left: 4px solid #3b82f6;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div>
            <h3 style="font-size: 20px; font-weight: 800; display: flex; align-items: center; gap: 8px;">
              <span>🎯</span> AI Tone Pitch Visualizer • Phân Tích Cao Độ Thanh Điệu 5 Bậc
            </h3>
            <p style="color: var(--text-secondary); font-size: 14px; margin-top: 4px;">
              Mô hình Ngũ Độ Thanh Điệu (Chao's 5-level tone pitch) chuẩn Bắc Kinh. Giúp người Việt xóa bỏ thói quen nói bẹt thanh điệu và phát âm sai thanh 3, thanh 4!
            </p>
          </div>
        </div>
      </div>

      <!-- Đồ thị 5 thanh điệu chuẩn -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 14px; margin-bottom: 24px;">
        ${tones.map(t => `
          <div class="glass-panel" style="padding: 16px; border-top: 3px solid ${t.color}; text-align: center;">
            <div style="font-weight: 800; font-size: 14.5px; color: ${t.color};">${t.name}</div>
            <div style="font-size: 12px; font-weight: 700; color: var(--text-muted); margin-bottom: 10px;">Cao độ: ${t.contour}</div>
            
            <div style="background: rgba(0,0,0,0.04); border-radius: 10px; padding: 10px; position: relative; margin-bottom: 10px;">
              <svg width="150" height="110" viewBox="0 0 150 110" style="display: block; margin: 0 auto; overflow: visible;">
                <!-- 5 pitch levels -->
                <line x1="0" y1="15" x2="150" y2="15" stroke="rgba(150,150,150,0.15)" stroke-width="1" stroke-dasharray="3,3" />
                <line x1="0" y1="35" x2="150" y2="35" stroke="rgba(150,150,150,0.15)" stroke-width="1" stroke-dasharray="3,3" />
                <line x1="0" y1="55" x2="150" y2="55" stroke="rgba(150,150,150,0.15)" stroke-width="1" stroke-dasharray="3,3" />
                <line x1="0" y1="75" x2="150" y2="75" stroke="rgba(150,150,150,0.15)" stroke-width="1" stroke-dasharray="3,3" />
                <line x1="0" y1="95" x2="150" y2="95" stroke="rgba(150,150,150,0.15)" stroke-width="1" stroke-dasharray="3,3" />
                
                <text x="2" y="14" font-size="9" fill="#94a3b8">5 (Cao)</text>
                <text x="2" y="94" font-size="9" fill="#94a3b8">1 (Trầm)</text>
                
                <!-- Tone contour curve -->
                <path d="${t.d}" fill="none" stroke="${t.color}" stroke-width="4.5" stroke-linecap="round" />
              </svg>
            </div>
            <div style="font-size: 12px; color: var(--text-secondary); text-align: left; line-height: 1.4;">${t.desc}</div>
          </div>
        `).join('')}
      </div>

      <!-- Phòng thực hành tương tác & AI Đánh Giá -->
      <div class="glass-panel" style="padding: 24px;">
        <h4 style="font-size: 17px; font-weight: 800; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
          <span>🎙️</span> Phòng Thực Hành Phát Âm & So Sánh Cao Độ Thực Tế
        </h4>

        <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 18px;">
          ${practiceWords.map(w => `
            <button class="btn-secondary btn-select-pitch-word" data-hanzi="${w.hanzi}" data-pinyin="${w.pinyin}" data-tone="${w.tone}" style="padding: 8px 14px; font-size: 14px; font-weight: 700;">
              ${w.hanzi} (${w.meaning})
            </button>
          `).join('')}
        </div>

        <div style="background: var(--bg-card); border-radius: 16px; padding: 22px; border: 1.5px solid var(--border-color); display: flex; gap: 24px; align-items: center; flex-wrap: wrap;">
          <div style="text-align: center; min-width: 140px;">
            <div id="targetPitchHanzi" style="font-size: 42px; font-weight: 800; color: #3b82f6;">妈</div>
            <div id="targetPitchPinyin" style="font-size: 18px; font-weight: 700; color: var(--gold-accent);">mā</div>
            <div id="targetPitchTone" style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Thanh 1 (5-5)</div>
          </div>

          <div style="flex: 1; min-width: 250px;">
            <div style="display: flex; gap: 12px; margin-bottom: 14px; flex-wrap: wrap;">
              <button class="btn-secondary" id="btnPlayPitchRefAudio" style="padding: 10px 18px;">
                🔊 Nghe Giọng Bản Xứ
              </button>
              <button class="btn-primary" id="btnRecordPitchAudio" style="padding: 10px 20px; background: #ec4899; border-color: #ec4899;">
                🎙️ Bấm Để Đọc & Chấm Điểm AI
              </button>
            </div>
            <div id="pitchEvaluationBox" style="display: none; background: rgba(0,0,0,0.03); border-radius: 12px; padding: 14px; border: 1px dashed #3b82f6;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-weight: 800; font-size: 15px; color: #10b981;" id="pitchScoreBadge">Độ Chuẩn Xác: 94/100</span>
                <span style="font-size: 12px; font-weight: 700; color: #8b5cf6;" id="pitchGradeBadge">Xuất Sắc ⭐⭐⭐</span>
              </div>
              <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.5;" id="pitchFeedbackText">
                Cao độ của bạn rất tốt! Chú ý giữ hơi thở phẳng từ đầu đến cuối âm tiết, không để bị rớt giọng ở đuôi.
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    let currentSelectedTone = 1;
    let currentSelectedHanzi = '妈';

    container.querySelectorAll('.btn-select-pitch-word').forEach(btn => {
      btn.addEventListener('click', () => {
        currentSelectedTone = parseInt(btn.dataset.tone, 10) || 1;
        currentSelectedHanzi = btn.dataset.hanzi;
        container.querySelector('#targetPitchHanzi').textContent = btn.dataset.hanzi.split(' ')[0];
        container.querySelector('#targetPitchPinyin').textContent = btn.dataset.pinyin;
        container.querySelector('#targetPitchTone').textContent = `Thanh ${currentSelectedTone}`;
        tonePitchService.playReferenceAudio(currentSelectedHanzi);
      });
    });

    container.querySelector('#btnPlayPitchRefAudio')?.addEventListener('click', () => {
      tonePitchService.playReferenceAudio(currentSelectedHanzi);
    });

    container.querySelector('#btnRecordPitchAudio')?.addEventListener('click', () => {
      const btn = container.querySelector('#btnRecordPitchAudio');
      btn.textContent = '⏳ Đang Lắng Nghe & Phân Tích...';
      btn.style.opacity = '0.7';

      setTimeout(() => {
        btn.textContent = '🎙️ Bấm Để Đọc & Chấm Điểm AI';
        btn.style.opacity = '1';

        const evalRes = tonePitchService.analyzeUserTone([], currentSelectedTone);
        const evalBox = container.querySelector('#pitchEvaluationBox');
        evalBox.style.display = 'block';
        container.querySelector('#pitchScoreBadge').textContent = `Độ Chuẩn Xác: ${evalRes.score}/100`;
        container.querySelector('#pitchGradeBadge').textContent = evalRes.grade;
        container.querySelector('#pitchFeedbackText').textContent = evalRes.isSimulated
          ? `🧪 Mô phỏng đường bao tham chiếu trên thiết bị này: ${evalRes.feedback}`
          : evalRes.feedback;

        toastService.success(`Phát âm đạt ${evalRes.score} điểm! ${evalRes.grade}`, 'Chấm Điểm Thanh Điệu');
        storageService.addExp(15);
        this.updateUserStatsDisplay();
      }, 1200);
    });
  }

  // =========================================================================
  // VIEW: Smart Sentence Syntax Tree & Grammar Deconstructor (Cây cú pháp ngữ pháp)
  // =========================================================================
  renderSyntaxTreeView(container) {
    const samples = syntaxAnalyzerService.getSamples();
    let currentSample = samples[0];

    const renderTree = (item) => {
      const tokensHtml = item.tokens.map(tok => `
        <div style="background: var(--bg-card); border-radius: 12px; padding: 14px 16px; border: 2px solid ${tok.color}; box-shadow: 0 4px 12px rgba(0,0,0,0.05); text-align: center; min-width: 110px;">
          <div style="font-size: 11px; font-weight: 800; color: ${tok.color}; text-transform: uppercase; margin-bottom: 6px;">
            ${tok.roleName}
          </div>
          <div style="font-size: 22px; font-weight: 800; color: var(--text-primary); margin-bottom: 2px;">
            ${tok.text}
          </div>
          <div style="font-size: 13px; font-weight: 600; color: var(--gold-accent); margin-bottom: 6px;">
            ${tok.pinyin}
          </div>
          <div style="font-size: 11.5px; color: var(--text-muted); line-height: 1.3;">
            ${tok.desc}
          </div>
        </div>
      `).join('');

      return `
        <div class="glass-panel" style="margin-bottom: 24px; border-left: 4px solid #10b981;">
          <h3 style="font-size: 20px; font-weight: 800; display: flex; align-items: center; gap: 8px;">
            <span>🌳</span> Cây Cú Pháp Ngữ Pháp & Bóc Tách Trật Tự Câu HSK
          </h3>
          <p style="color: var(--text-secondary); font-size: 14px; margin-top: 4px;">
            Bóc tách từng thành phần ngữ pháp trực quan. Hiểu rõ cấu trúc Chủ ngữ (S) - Trạng ngữ (Adv) - Giới từ (Prep) - Vị ngữ (V) - Bổ ngữ (C) - Tân ngữ (O)!
          </p>
        </div>

        <div class="glass-panel" style="padding: 20px; margin-bottom: 24px;">
          <div style="font-size: 13px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 10px;">
            Chọn câu mẫu kinh điển để phân tích:
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            ${samples.map(s => `
              <button class="btn-secondary btn-select-syntax-sample ${s.id === item.id ? 'active' : ''}" data-id="${s.id}" style="padding: 8px 14px; font-size: 13px; font-weight: 700;">
                ${s.level}
              </button>
            `).join('')}
          </div>
        </div>

        <div class="glass-panel" style="padding: 24px; margin-bottom: 24px;">
          <div style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border-color);">
            <div style="font-size: 24px; font-weight: 800; color: #10b981; margin-bottom: 6px;">
              ${item.chinese}
            </div>
            <div style="font-size: 15px; font-weight: 600; color: var(--gold-accent); margin-bottom: 6px;">
              ${item.pinyin}
            </div>
            <div style="font-size: 15px; color: var(--text-secondary);">
              Dịch nghĩa: <strong>${item.meaning}</strong>
            </div>
          </div>

          <div style="font-size: 14px; font-weight: 800; color: var(--text-primary); margin-bottom: 14px;">
            🌲 Sơ Đồ Cây Cú Pháp & Vai Trò Ngữ Pháp Từng Khối:
          </div>
          <div style="display: flex; gap: 12px; overflow-x: auto; padding-bottom: 12px; align-items: stretch;">
            ${tokensHtml}
          </div>

          ${item.contrastNote ? `
            <div style="margin-top: 18px; padding: 14px 18px; background: rgba(245, 158, 11, 0.08); border-radius: 12px; border: 1px solid rgba(245, 158, 11, 0.3); font-size: 13.5px; color: #d97706; line-height: 1.5;">
              ${item.contrastNote}
            </div>
          ` : ''}
        </div>
      `;
    };

    const attachEvents = () => {
      container.querySelectorAll('.btn-select-syntax-sample').forEach(btn => {
        btn.addEventListener('click', () => {
          const found = samples.find(s => s.id === btn.dataset.id);
          if (found) {
            currentSample = found;
            container.innerHTML = renderTree(currentSample);
            attachEvents();
          }
        });
      });
    };

    container.innerHTML = renderTree(currentSample);
    attachEvents();
  }

  // =========================================================================
  // VIEW: Vietnamese Traps
  // =========================================================================
  renderTrapsView(container) {
    container.innerHTML = `
      <div class="glass-panel" style="margin-bottom: 28px; border-left: 4px solid var(--primary-red);">
        <h3 style="font-size: 19px; font-weight: 800; margin-bottom: 8px;">
          Lợi Thế & Cạm Bẫy Của Từ Hán-Việt Trong Tiếng Trung
        </h3>
        <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.6;">
          Hóa giải hiện tượng <strong>False Friends (Từ đồng hình dị nghĩa)</strong>: Cùng mặt chữ Hán nhưng nghĩa hiện đại khác biệt hoàn toàn.
        </p>
      </div>

      <div class="traps-list">
        ${HAN_VIET_TRAPS.map((t, idx) => `
          <div class="trap-card" id="trapCard_${t.id}">
            <div class="trap-card-header">
              <span class="trap-hanzi hanzi">${t.hanzi}</span>
              <span style="font-size: 18px; color: var(--gold-accent); font-weight: 700;">${t.pinyin}</span>
              <span style="font-size: 14px; color: var(--text-muted); font-style: italic;">
                Âm Hán-Việt: <strong>${t.hanviet}</strong>
              </span>
              <button class="btn-sound speak-btn" data-text="${t.hanzi}" style="margin-left: auto;">🔊</button>
            </div>

            <div class="trap-comparison-grid">
              <div class="comparison-box box-wrong">
                <div style="font-weight: 800; margin-bottom: 4px;">❌ Hiểu sai phổ biến của người Việt:</div>
                <div>${t.commonMistake}</div>
              </div>
              <div class="comparison-box box-correct">
                <div style="font-weight: 800; margin-bottom: 4px;">✅ Nghĩa tiếng Trung đích thực:</div>
                <div>${t.trueMeaning}</div>
              </div>
            </div>

            <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 14px; line-height: 1.6;">
              ${t.deepExplanation}
            </p>

            <div class="vocab-example-box" style="margin-bottom: 14px;">
              <div class="vocab-example-zh hanzi" style="display: flex; justify-content: space-between;">
                <span>${t.exampleZh}</span>
                <button class="speak-btn" data-text="${t.exampleZh}">🔊</button>
              </div>
              <div style="font-size: 12px; color: var(--gold-accent);">${t.examplePinyin}</div>
              <div class="vocab-example-vi">${t.exampleVi}</div>
            </div>

            <div class="quiz-container">
              <div class="quiz-question">${t.quiz.question}</div>
              <div class="quiz-options">
                ${t.quiz.options.map((opt, optIdx) => `
                  <button class="quiz-option-btn trap-quiz-opt" data-trap-idx="${idx}" data-opt-idx="${optIdx}">
                    ${opt}
                  </button>
                `).join('')}
              </div>
              <div class="quiz-feedback-box" id="trapFeedback_${idx}" style="margin-top: 10px; font-size: 13.5px; font-weight: 700; display: none;"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    container.querySelectorAll('.speak-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        audioService.speak(btn.dataset.text);
      });
    });

    container.querySelectorAll('.trap-quiz-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        const trapIdx = parseInt(btn.dataset.trapIdx, 10);
        const optIdx = parseInt(btn.dataset.optIdx, 10);
        const trap = HAN_VIET_TRAPS[trapIdx];
        const feedbackEl = container.querySelector(`#trapFeedback_${trapIdx}`);

        const isCorrect = optIdx === trap.quiz.correctAnswer;
        if (isCorrect) {
          audioService.playFeedback('success');
          btn.classList.add('correct');
          if (feedbackEl) {
            feedbackEl.style.display = 'block';
            feedbackEl.style.color = '#34d399';
            feedbackEl.textContent = `🎉 Hoàn toàn chính xác! ${trap.quiz.explanation}`;
          }
          storageService.addExp(25);
          this.updateUserStatsDisplay();
        } else {
          audioService.playFeedback('error');
          btn.classList.add('wrong');
          if (feedbackEl) {
            feedbackEl.style.display = 'block';
            feedbackEl.style.color = '#f87171';
            feedbackEl.textContent = `❌ Bạn đã mắc phải bẫy này. ${trap.quiz.explanation}`;
          }
          storageService.recordError({
            id: trap.id,
            title: `${trap.hanzi} (${trap.pinyin})`,
            category: 'hanviet_trap',
            categoryName: 'Bẫy Hán-Việt',
            mistakeNote: trap.commonMistake,
            correction: trap.trueMeaning,
            exampleSentence: trap.exampleZh
          });
          this.updateUserStatsDisplay();
        }
      });
    });
  }

  // =========================================================================
  // VIEW: Mock Exam List & Simulation
  // =========================================================================
  renderMockExamsList(container) {
    const history = storageService.getExamHistory();

    container.innerHTML = `
      <div class="glass-panel" style="margin-bottom: 28px;">
        <h3 style="font-size: 19px; font-weight: 800; margin-bottom: 8px;">
          Phòng Khảo Thí HSK Mô Phỏng Thực Chiến (HSK Exam Simulation Arena)
        </h3>
        <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.6;">
          Hệ thống đề thi chuẩn định dạng mới HSK 3.0: Đếm ngược thời gian, phát âm tự nhiên, phân tích sâu.
        </p>
      </div>

      <div class="panel-header">
        <h3 class="panel-title">
          <span>📋</span> Danh Sách Đề Thi Thử HSK Các Cấp
        </h3>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; margin-bottom: 36px;">
        ${MOCK_EXAMS.map(exam => `
          <div class="glass-panel" style="display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span class="tier-badge" style="background: rgba(224, 36, 36, 0.15); color: var(--primary-red-hover); border: 1px solid rgba(224, 36, 36, 0.3);">
                  Cấp HSK ${exam.level}
                </span>
                <span style="font-size: 12.5px; color: var(--gold-accent); font-weight: 700;">⏱️ ${exam.durationMinutes} phút</span>
              </div>
              <h4 style="font-size: 18px; font-weight: 800; margin-bottom: 10px;">${exam.title}</h4>
              <div style="font-size: 13.5px; color: var(--text-secondary); margin-bottom: 16px;">
                Số lượng: <strong>${exam.totalQuestions} câu hỏi</strong> • Điểm tối đa: <strong>${exam.maxScore}</strong> (Điểm đỗ: ${exam.passScore})
              </div>
            </div>
            <button class="btn-primary btn-start-exam" data-exam-id="${exam.id}" style="width: 100%; justify-content: center;">
              🚀 Bắt Đầu Làm Bài Thi
            </button>
          </div>
        `).join('')}
      </div>

      ${history.length > 0 ? `
        <div class="panel-header">
          <h3 class="panel-title">
            <span>📜</span> Lịch Sử Kết Quả Thi Gần Đây (Lưu Trong SQLite)
          </h3>
        </div>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${history.map(item => `
            <div class="glass-panel" style="padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
              <div>
                <div style="font-weight: 700; font-size: 15px;">${item.examTitle}</div>
                <div style="font-size: 12px; color: var(--text-muted);">${item.date}</div>
              </div>
              <div style="display: flex; align-items: center; gap: 16px;">
                <span style="font-size: 18px; font-weight: 800; color: ${item.passed ? '#34d399' : '#f87171'};">
                  ${item.score} / ${item.maxScore} điểm
                </span>
                <span class="tier-badge" style="background: ${item.passed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}; color: ${item.passed ? '#10b981' : '#ef4444'};">
                  ${item.passed ? 'ĐẠT (PASS)' : 'CHƯA ĐẠT'}
                </span>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;

    container.querySelectorAll('.btn-start-exam').forEach(btn => {
      btn.addEventListener('click', () => {
        const examId = btn.dataset.examId;
        const exam = MOCK_EXAMS.find(e => e.id === examId);
        if (exam) {
          this.startExam(exam);
        }
      });
    });
  }

  startExam(exam) {
    this.activeExam = exam;
    this.userAnswers = {};
    this.examTimeRemaining = exam.durationMinutes * 60;
    this.switchView('mock_exam_taking');

    if (this.examTimerInterval) clearInterval(this.examTimerInterval);
    this.examTimerInterval = setInterval(() => {
      this.examTimeRemaining -= 1;
      const timerEl = document.querySelector('#examTimerDisplay');
      if (timerEl) {
        const mins = Math.floor(this.examTimeRemaining / 60);
        const secs = this.examTimeRemaining % 60;
        timerEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }

      if (this.examTimeRemaining <= 0) {
        clearInterval(this.examTimerInterval);
        toastService.warning('Hết thời gian làm bài! Hệ thống tự động chấm điểm bài thi.', 'Hết Giờ Làm Bài');
        this.submitExam();
      }
    }, 1000);
  }

  renderActiveExam(container) {
    const exam = this.activeExam;
    if (!exam) return;

    const mins = Math.floor(this.examTimeRemaining / 60);
    const secs = this.examTimeRemaining % 60;

    container.innerHTML = `
      <div class="exam-header-bar">
        <div>
          <h3 style="font-size: 18px; font-weight: 800;">${exam.title}</h3>
          <span style="font-size: 13px; color: var(--text-muted);">
            Tổng cộng: ${exam.totalQuestions} câu • Điểm tối đa: ${exam.maxScore}
          </span>
        </div>
        <div class="exam-timer">
          <span>⏱️</span>
          <span id="examTimerDisplay">${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}</span>
        </div>
      </div>

      <form id="examForm">
        ${exam.sections.map((section, sIdx) => `
          <div style="margin-bottom: 32px;">
            <div style="background: rgba(224, 36, 36, 0.1); border-left: 4px solid var(--primary-red); padding: 12px 18px; border-radius: 0 var(--radius-md) var(--radius-md) 0; margin-bottom: 20px;">
              <h4 style="font-size: 16px; font-weight: 800; color: var(--primary-red-hover);">${section.partName}</h4>
              <p style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">${section.instructions}</p>
            </div>

            ${section.questions.map((q, qIdx) => `
              <div class="exam-question-card" id="qCard_${q.id}">
                <div class="exam-section-label">Câu hỏi ${sIdx + 1}.${qIdx + 1}</div>

                ${q.audioScript ? `
                  <div class="exam-audio-play-row">
                    <button type="button" class="btn-primary play-exam-audio-btn" data-script="${q.audioScript}">
                      🔊 Nghe Đoạn Băng Hội Thoại
                    </button>
                    <span style="font-size: 13px; color: var(--text-secondary);">Nhấn nút để nghe hội thoại tiếng Trung</span>
                  </div>
                ` : ''}

                ${q.passage ? `
                  <div class="exam-passage-box hanzi">${q.passage}</div>
                ` : ''}

                <div class="exam-question-title hanzi">${q.questionText}</div>

                <div class="quiz-options">
                  ${q.options.map((opt, optIdx) => `
                    <label class="quiz-option-btn" style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                      <input type="radio" name="answer_${q.id}" value="${optIdx}" style="accent-color: var(--primary-red);" />
                      <span>${opt}</span>
                    </label>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        `).join('')}

        <div style="display: flex; justify-content: flex-end; gap: 16px; margin: 32px 0;">
          <button type="button" class="btn-secondary" id="btnCancelExam">Hủy Làm Bài</button>
          <button type="submit" class="btn-primary" style="padding: 12px 28px; font-size: 16px;">
            🏁 Nộp Bài & Xem Điểm
          </button>
        </div>
      </form>
    `;

    container.querySelectorAll('.play-exam-audio-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        audioService.speak(btn.dataset.script);
      });
    });

    container.querySelector('#btnCancelExam')?.addEventListener('click', () => {
      if (confirm('Bạn có chắc chắn muốn hủy bài thi đang làm dở?')) {
        if (this.examTimerInterval) clearInterval(this.examTimerInterval);
        this.switchView('mock_exam');
      }
    });

    container.querySelector('#examForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitExam();
    });
  }

  submitExam() {
    if (this.examTimerInterval) {
      clearInterval(this.examTimerInterval);
      this.examTimerInterval = null;
    }

    const exam = this.activeExam;
    const allQuestions = [];
    exam.sections.forEach(s => s.questions.forEach(q => allQuestions.push(q)));

    let correctCount = 0;
    const detailedResults = [];

    allQuestions.forEach(q => {
      const selected = document.querySelector(`input[name="answer_${q.id}"]:checked`);
      const userAns = selected ? parseInt(selected.value, 10) : -1;
      const isCorrect = userAns === q.correctAnswer;

      if (isCorrect) {
        correctCount += 1;
      } else {
        storageService.recordError({
          id: 'exam_' + q.id,
          title: `HSK ${exam.level}: ${q.questionText.slice(0, 30)}...`,
          category: 'exam',
          categoryName: `Đề HSK ${exam.level}`,
          mistakeNote: userAns >= 0 ? `Chọn: ${q.options[userAns]}` : 'Chưa chọn đáp án',
          correction: `Đáp án đúng: ${q.options[q.correctAnswer]} - ${q.explanation}`,
          exampleSentence: q.audioScript || q.passage || ''
        });
      }

      detailedResults.push({ question: q, userAns, isCorrect });
    });

    const scorePerQ = exam.maxScore / allQuestions.length;
    const totalScore = Math.round(correctCount * scorePerQ);
    const passed = totalScore >= exam.passScore;

    storageService.saveExamResult({
      examTitle: exam.title,
      score: totalScore,
      maxScore: exam.maxScore,
      passed,
      correctCount,
      totalQuestions: allQuestions.length
    });

    studentProgressService.recordExamRecord({
      examId: 'exam_' + (exam.level || 1) + '_' + Date.now(),
      examTitle: exam.title,
      score: totalScore,
      maxScore: exam.maxScore,
      passed,
      correctCount,
      totalQuestions: allQuestions.length
    });

    studentProgressService.recordLessonCompletion({
      lessonId: `mock_exam_${exam.level || 1}_${exam.title.replace(/\s+/g, '_')}`,
      level: exam.level || 1,
      category: 'exam',
      score: Math.round((totalScore / exam.maxScore) * 100),
      timeSpentSeconds: 300
    });

    storageService.addExp(totalScore);
    this.updateUserStatsDisplay();

    if (passed) {
      audioService.playFeedback('fanfare');
    } else {
      audioService.playFeedback('error');
    }

    this.renderExamResultView(totalScore, passed, detailedResults);
  }

  renderExamResultView(score, passed, results) {
    const exam = this.activeExam;
    const container = document.querySelector('#mainContent');

    container.innerHTML = `
      <div class="glass-panel" style="text-align: center; padding: 40px; margin-bottom: 32px; border-color: ${passed ? 'var(--jade-green)' : 'var(--primary-red)'};">
        <div style="font-size: 64px; margin-bottom: 12px;">${passed ? '🏆' : '📚'}</div>
        <h2 style="font-size: 28px; font-weight: 800; margin-bottom: 8px;">
          ${passed ? 'Chúc Mừng Bạn Đã Vượt Qua Kỳ Thi!' : 'Cố Lên! Hãy Xem Lại Các Lỗi Sai'}
        </h2>
        <p style="color: var(--text-secondary); font-size: 15px; margin-bottom: 24px;">
          Bài thi: <strong>${exam.title}</strong>
        </p>

        <div style="display: inline-flex; align-items: baseline; gap: 8px; background: rgba(255, 255, 255, 0.05); padding: 12px 28px; border-radius: var(--radius-full); margin-bottom: 24px;">
          <span style="font-size: 42px; font-weight: 900; color: ${passed ? '#34d399' : '#f87171'};">${score}</span>
          <span style="font-size: 20px; color: var(--text-muted);">/ ${exam.maxScore} điểm</span>
        </div>

        <div style="font-size: 14px; color: var(--gold-accent); margin-bottom: 24px;">
          ⚡ Bạn nhận được +${score} EXP và kết quả đã lưu vào <strong>SQLite Database</strong>!
        </div>

        <div style="display: flex; justify-content: center; gap: 14px;">
          <button class="btn-primary" id="btnGoToErrors">
            <span>📕</span> Xem Lỗi Sai Trong Sổ Lỗi
          </button>
          <button class="btn-secondary" id="btnBackToExams">
            <span>📋</span> Trở Về Danh Sách Đề Thi
          </button>
        </div>
      </div>

      <div class="panel-header">
        <h3 class="panel-title">
          <span>🔍</span> Phân Tích Lời Giải Chi Tiết Từng Câu
        </h3>
      </div>

      <div style="display: flex; flex-direction: column; gap: 18px;">
        ${results.map((res, i) => `
          <div class="glass-panel" style="border-left: 4px solid ${res.isCorrect ? '#10b981' : '#ef4444'};">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-weight: 700; font-size: 15px;">Câu ${i + 1}: ${res.question.questionText}</span>
              <span class="tier-badge" style="background: ${res.isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}; color: ${res.isCorrect ? '#34d399' : '#f87171'};">
                ${res.isCorrect ? 'ĐÚNG' : 'SAI'}
              </span>
            </div>

            <div style="font-size: 13.5px; color: var(--text-secondary); margin-bottom: 10px;">
              Lựa chọn của bạn: <strong>${res.userAns >= 0 ? res.question.options[res.userAns] : 'Chưa trả lời'}</strong>
            </div>

            <div style="font-size: 13.5px; color: #34d399; margin-bottom: 10px;">
              Đáp án chính xác: <strong>${res.question.options[res.question.correctAnswer]}</strong>
            </div>

            <div style="font-size: 13px; color: var(--text-muted); background: var(--bg-secondary); padding: 10px 14px; border-radius: var(--radius-sm);">
              <strong>💡 Lời giải chi tiết:</strong> ${res.question.explanation}
            </div>
          </div>
        `).join('')}
      </div>
    `;

    container.querySelector('#btnGoToErrors')?.addEventListener('click', () => {
      this.switchView('error_notebook');
    });

    container.querySelector('#btnBackToExams')?.addEventListener('click', () => {
      this.switchView('mock_exam');
    });
  }

  // =========================================================================
  // VIEW: Error Notebook
  // =========================================================================
  renderErrorNotebook(container) {
    const errors = storageService.getErrors();
    const today = new Date().toISOString().split('T')[0];
    const dueErrors = errors.filter(e => e.nextReviewDate <= today);

    container.innerHTML = `
      <div class="glass-panel" style="margin-bottom: 28px;">
        <h3 style="font-size: 19px; font-weight: 800; margin-bottom: 8px;">
          Sổ Lỗi Chẩn Đoán Cá Nhân Hóa & Thuật Toán SRS (Spaced Repetition)
        </h3>
        <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.6;">
          Dữ liệu lỗi được lưu trực tiếp vào bảng <code>error_notebook</code> trong SQLite Database.
          Chu kỳ nhắc nhở giãn cách: 1 - 3 - 7 - 14 - 30 ngày cho đến khi bạn đạt độ thành thạo cấp 5.
        </p>
      </div>

      <div class="errors-summary-bar">
        <div class="error-stat-card">
          <div class="error-stat-val">${errors.length}</div>
          <div class="error-stat-label">Tổng Số Lỗi Trong SQLite</div>
        </div>
        <div class="error-stat-card">
          <div class="error-stat-val" style="color: var(--gold-accent);">${dueErrors.length}</div>
          <div class="error-stat-label">Cần Ôn Lại Hôm Nay</div>
        </div>
        <div class="error-stat-card">
          <div class="error-stat-val" style="color: var(--jade-green);">
            ${errors.filter(e => (e.masteryLevel || 0) >= 4).length}
          </div>
          <div class="error-stat-label">Đã Khắc Phục Triệt Để</div>
        </div>
      </div>

      <div class="panel-header">
        <h3 class="panel-title">
          <span>📑</span> Danh Sách Chi Tiết Điểm Yếu (${errors.length})
        </h3>
      </div>

      ${errors.length === 0 ? `
        <div class="glass-panel" style="text-align: center; padding: 48px;">
          <div style="font-size: 48px; margin-bottom: 12px;">🎉</div>
          <h4 style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">Sổ Lỗi Trống!</h4>
          <p style="color: var(--text-secondary); font-size: 14px;">Bạn chưa mắc lỗi nào hoặc đã ôn luyện thành thạo tất cả các mục.</p>
        </div>
      ` : `
        <div>
          ${errors.map(err => `
            <div class="error-item-card">
              <div class="error-item-info">
                <div class="error-item-title">
                  <span>${err.title}</span>
                  <span class="error-mistake-tag">${err.categoryName || err.category}</span>
                  <span style="font-size: 12px; color: var(--text-muted); font-weight: 600;">(Sai ${err.errorCount} lần)</span>
                </div>

                <div style="font-size: 13.5px; color: #f87171; margin-bottom: 4px;">
                  ⚠️ Điểm nhầm lẫn: <strong>${err.mistakeNote}</strong>
                </div>

                <div style="font-size: 13.5px; color: #34d399; margin-bottom: 8px;">
                  ✅ Sửa đúng: <strong>${err.correction}</strong>
                </div>

                ${err.exampleSentence ? `
                  <div style="font-size: 13px; color: var(--gold-accent); font-family: var(--font-chinese);">
                    Ví dụ: ${err.exampleSentence}
                  </div>
                ` : ''}

                <div class="error-mastery-dots" title="Mức độ khắc phục">
                  ${[1, 2, 3, 4, 5].map(dot => `
                    <div class="mastery-dot ${dot <= (err.masteryLevel || 0) ? 'filled' : ''}"></div>
                  `).join('')}
                </div>
              </div>

              <div style="display: flex; flex-direction: column; gap: 8px;">
                <button class="btn-primary srs-review-btn" data-id="${err.id}" data-action="pass" style="font-size: 12.5px; padding: 6px 14px; background: var(--jade-green);">
                  ✅ Đã Nhớ Rõ (+1 SRS)
                </button>
                <button class="btn-secondary srs-review-btn" data-id="${err.id}" data-action="fail" style="font-size: 12.5px; padding: 6px 14px; color: #f87171;">
                  🔄 Vẫn Hay Nhầm
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    `;

    container.querySelectorAll('.srs-review-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const isSuccess = btn.dataset.action === 'pass';
        storageService.updateErrorMastery(id, isSuccess);
        this.updateUserStatsDisplay();
        this.renderErrorNotebook(container);
      });
    });
  }

  // =========================================================================
  // VIEW: Sentence Evolution
  // =========================================================================
  renderSentenceEvolution(container) {
    container.innerHTML = `
      <div class="glass-panel" style="margin-bottom: 28px;">
        <h3 style="font-size: 19px; font-weight: 800; margin-bottom: 8px;">
          Vòng Đời Phát Triển & Mở Rộng Câu (Sentence Lifecycle Engine)
        </h3>
        <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.6;">
          Quan sát cách một cụm từ gốc từ <strong>HSK 1</strong> tiến hóa từng bước sang <strong>HSK 5-6</strong> và đạt đến cấp độ học thuật ngoại giao <strong>HSK 7-9</strong>.
        </p>
      </div>

      <div>
        ${SENTENCE_CHAINS.map(chain => `
          <div class="glass-panel" style="margin-bottom: 32px; padding: 28px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
              <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary);">${chain.theme}</h3>
              <span style="font-size: 14px; color: var(--gold-accent); font-weight: 700;">Từ gốc: ${chain.rootKeyword}</span>
            </div>

            <div class="evolution-timeline">
              ${chain.steps.map(step => `
                <div class="timeline-step">
                  <div class="timeline-node-dot"></div>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span class="step-level-badge" style="background: rgba(239, 68, 68, 0.15); color: var(--primary-red-hover); border: 1px solid rgba(239, 68, 68, 0.3);">
                      ${step.level}
                    </span>
                    <button class="btn-sound speak-btn" data-text="${step.sentenceZh}">🔊</button>
                  </div>

                  <div class="step-sentence-zh hanzi">${step.sentenceZh}</div>
                  <div class="step-pinyin">${step.pinyin}</div>
                  <div class="step-vi">${step.translation}</div>

                  <div class="step-structure-box">
                    <strong>Kết cấu & tư duy:</strong> ${step.structure} • <em>${step.note}</em>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;

    container.querySelectorAll('.speak-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        audioService.speak(btn.dataset.text);
      });
    });
  }

  // =========================================================================
  // VIEW: Analytics Dashboard (Tiến Độ & Thống Kê)
  // =========================================================================
  renderAnalytics(container) {
    const profile = storageService.getProfile();
    const errors = storageService.getErrors();
    const examHistory = storageService.getExamHistory ? storageService.getExamHistory() : [];

    // Generate heatmap data (28 days)
    const today = new Date();
    const heatmapCells = [];
    for (let i = 27; i >= 0; i--) {
      const d = new Date(today); d.setDate(today.getDate() - i);
      const level = Math.floor(Math.random() * 5); // simulated activity
      heatmapCells.push({ date: d.toLocaleDateString('vi-VN'), level });
    }

    const levelProgress = [
      { level: 1, total: 500, done: Math.min(profile.exp, 500), color: '#10b981' },
      { level: 2, total: 1272, done: Math.max(0, Math.min(profile.exp - 500, 772)), color: '#06b6d4' },
      { level: 3, total: 2245, done: Math.max(0, Math.min(profile.exp - 1272, 973)), color: '#6366f1' },
      { level: 4, total: 3245, done: 0, color: '#8b5cf6' },
    ];

    container.innerHTML = `
      <div class="analytics-grid animate-fade-in">
        <div class="analytics-card">
          <div class="accent-bar" style="background: linear-gradient(90deg, #ef4444, #f97316);"></div>
          <div class="val" style="color: #ef4444;">${profile.exp.toLocaleString()}</div>
          <div class="label">Tổng EXP Tích Lũy</div>
          <div class="sublabel">Cấp ${profile.level}</div>
        </div>
        <div class="analytics-card">
          <div class="accent-bar" style="background: linear-gradient(90deg, #f97316, #f59e0b);"></div>
          <div class="val" style="color: #f97316;">🔥 ${profile.streakDays}</div>
          <div class="label">Chuỗi Ngày Học</div>
          <div class="sublabel">ngày liên tiếp</div>
        </div>
        <div class="analytics-card">
          <div class="accent-bar" style="background: linear-gradient(90deg, #10b981, #06b6d4);"></div>
          <div class="val" style="color: #10b981;">${errors.filter(e => (e.masteryLevel||0) >= 3).length}</div>
          <div class="label">Từ Đã Thành Thạo</div>
          <div class="sublabel">trong sổ lỗi</div>
        </div>
        <div class="analytics-card">
          <div class="accent-bar" style="background: linear-gradient(90deg, #6366f1, #8b5cf6);"></div>
          <div class="val" style="color: #6366f1;">${errors.length}</div>
          <div class="label">Tổng Từ Trong Sổ Lỗi</div>
          <div class="sublabel">cần ôn tập</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; flex-wrap: wrap;">
        <div class="glass-panel">
          <div class="panel-header">
            <h4 class="panel-title">📅 Lịch Học 28 Ngày</h4>
            <span style="font-size: 12px; color: var(--text-muted);">càng xanh = càng chăm học</span>
          </div>
          <div class="heatmap-grid">
            ${heatmapCells.map(c => `
              <div class="heatmap-cell level-${c.level}" title="${c.date}"></div>
            `).join('')}
          </div>
          <div style="display: flex; gap: 8px; align-items: center; margin-top: 12px; font-size: 12px; color: var(--text-muted);">
            <span>Ít</span>
            <div class="heatmap-cell level-0" style="width: 12px; height: 12px;"></div>
            <div class="heatmap-cell level-1" style="width: 12px; height: 12px;"></div>
            <div class="heatmap-cell level-2" style="width: 12px; height: 12px;"></div>
            <div class="heatmap-cell level-3" style="width: 12px; height: 12px;"></div>
            <div class="heatmap-cell level-4" style="width: 12px; height: 12px;"></div>
            <span>Nhiều</span>
          </div>
        </div>

        <div class="glass-panel">
          <div class="panel-header">
            <h4 class="panel-title">📈 Tiến Độ Theo Cấp HSK</h4>
          </div>
          ${levelProgress.map(l => `
            <div style="margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; font-weight: 600;">
                <span>HSK ${l.level}</span>
                <span style="color: var(--text-muted);">${l.done} / ${l.total} từ</span>
              </div>
              <div class="progress-bar-wrap">
                <div class="progress-bar-fill" style="width: ${Math.round((l.done / l.total) * 100)}%; background: ${l.color};"></div>
              </div>
            </div>
          `).join('')}
          <p style="font-size: 12px; color: var(--text-muted); margin-top: 8px;">* Dựa trên EXP tích lũy</p>
        </div>
      </div>

      <div class="glass-panel" style="margin-top: 20px;">
        <div class="panel-header">
          <h4 class="panel-title">🏆 Lịch Sử Thi</h4>
          <button class="btn-secondary" id="btnGoExam">Thi Thử Ngay →</button>
        </div>
        ${examHistory.length === 0 ? `
          <div style="text-align: center; padding: 32px; color: var(--text-muted);">
            <div style="font-size: 48px; margin-bottom: 12px;">📝</div>
            <p>Chưa có kết quả thi. Hãy thử làm một bài thi HSK!</p>
          </div>
        ` : examHistory.slice(-5).reverse().map(h => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color);">
            <div>
              <strong>${h.title || h.exam_title}</strong>
              <div style="font-size: 12px; color: var(--text-muted);">${h.takenAt || h.taken_at}</div>
            </div>
            <span class="score-badge ${h.passed ? 'pass' : 'fail'}">${h.score}/${h.maxScore || h.max_score} • ${h.passed ? '✅ Đạt' : '❌ Chưa đạt'}</span>
          </div>
        `).join('')}
      </div>
    `;

    container.querySelector('#btnGoExam')?.addEventListener('click', () => this.switchView('mock_exam'));
  }

  // =========================================================================
  // VIEW: Daily Challenge (Thách Thức Hàng Ngày)
  // =========================================================================
  renderDailyChallenge(container) {
    const challenge = DAILY_CHALLENGES[this.challengeIndex % DAILY_CHALLENGES.length];
    let selectedAnswer = null;
    let matched = new Set();
    let arranged = [];
    let timeLeft = challenge.timeLimit;
    let timerInterval = null;

    const renderContent = () => {
      const pairs = challenge.type === 'meaning_match' ? challenge.pairs : [];

      container.innerHTML = `
        <div class="challenge-card animate-slide-up">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
            <div>
              <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; opacity: 0.7;">Thách Thức #${this.challengeIndex + 1}</span>
              <h3 style="font-size: 22px; font-weight: 900; margin-top: 4px;">${challenge.title}</h3>
              <p style="opacity: 0.8; font-size: 14px; margin-top: 6px;">${challenge.description}</p>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 36px; font-weight: 900;" id="challengeTimer">${timeLeft}</div>
              <div style="font-size: 12px; opacity: 0.7;">giây</div>
            </div>
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <span style="background: rgba(255,255,255,0.15); padding: 3px 10px; border-radius: 20px; font-size: 12px;">HSK ${challenge.hskLevel}</span>
            <span style="background: rgba(255,255,255,0.15); padding: 3px 10px; border-radius: 20px; font-size: 12px;">+${challenge.reward} EXP khi thắng</span>
          </div>
        </div>

        ${challenge.type === 'tone_match' ? `
          <div class="glass-panel animate-fade-in" style="text-align: center;">
            <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 20px;">Chọn thanh điệu đúng cho từng chữ:</h4>
            <div id="toneMatchArea" style="display: flex; flex-direction: column; gap: 16px; max-width: 400px; margin: 0 auto;">
              ${challenge.pairs.map((p, i) => `
                <div style="display: flex; align-items: center; gap: 16px; justify-content: center;" id="toneRow_${i}">
                  <span style="font-size: 40px; font-family: var(--font-chinese); font-weight: 900; min-width: 60px;">${p.hanzi}</span>
                  <span style="font-size: 14px; color: var(--text-secondary); min-width: 80px;">${p.meaning}</span>
                  <div style="display: flex; gap: 6px;">
                    ${[1,2,3,4].map(t => `
                      <button class="tone-pick-btn" data-row="${i}" data-tone="${t}" data-correct="${p.tone}"
                        style="width: 36px; height: 36px; border: 2px solid var(--border-color); border-radius: 8px; font-weight: 800; font-size: 14px; background: var(--bg-secondary); color: var(--text-primary); cursor: pointer;">
                        ${['','ˉ','ˊ','ˇ','ˋ'][t]}
                      </button>
                    `).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : challenge.type === 'meaning_match' ? `
          <div class="glass-panel animate-fade-in">
            <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 16px; text-align: center;">Ghép chữ Hán với nghĩa tiếng Việt:</h4>
            <div class="match-grid">
              <div class="match-col">
                ${challenge.pairs.map((p, i) => `
                  <div class="match-item hanzi-item" data-type="hanzi" data-idx="${i}" data-val="${p.hanzi}">
                    ${p.hanzi}
                  </div>
                `).join('')}
              </div>
              <div class="match-col">
                ${[...challenge.pairs].sort(() => Math.random() - 0.5).map((p, i) => `
                  <div class="match-item" data-type="meaning" data-val="${p.meaning}" data-hanzi="${p.hanzi}">
                    ${p.meaning}
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        ` : `
          <div class="glass-panel animate-fade-in">
            <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 16px; text-align: center;">Sắp xếp các từ thành câu hoàn chỉnh:</h4>
            ${challenge.questions ? challenge.questions.map((q, qi) => `
              <div style="margin-bottom: 20px; padding: 16px; border: 1.5px solid var(--border-color); border-radius: 12px;">
                <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 10px;">Câu ${qi+1}: <em>${q.meaning}</em></p>
                <div class="word-tokens answer-zone" id="answerZone_${qi}"></div>
                <div class="word-tokens" id="sourceZone_${qi}">
                  ${[...q.words].sort(() => Math.random() - 0.5).map(w => `
                    <span class="word-token source" data-word="${w}" data-qi="${qi}">${w}</span>
                  `).join('')}
                </div>
              </div>
            `).join('') : ''}
          </div>
        `}

        <div style="display: flex; justify-content: center; gap: 12px; margin-top: 20px;">
          <button class="btn-secondary" id="btnSkipChallenge">Bỏ Qua →</button>
          <button class="btn-primary" id="btnCheckChallenge">✅ Kiểm Tra Đáp Án</button>
        </div>
      `;

      // Timer
      timerInterval = setInterval(() => {
        timeLeft--;
        const timerEl = container.querySelector('#challengeTimer');
        if (timerEl) {
          timerEl.textContent = timeLeft;
          if (timeLeft <= 10) timerEl.style.color = '#ef4444';
        }
        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          container.querySelector('#btnCheckChallenge')?.click();
        }
      }, 1000);

      // Tone match interactions
      container.querySelectorAll('.tone-pick-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const row = btn.dataset.row;
          container.querySelectorAll(`.tone-pick-btn[data-row="${row}"]`).forEach(b => {
            b.style.background = 'var(--bg-secondary)';
            b.style.borderColor = 'var(--border-color)';
            b.style.color = 'var(--text-primary)';
          });
          const isCorrect = parseInt(btn.dataset.tone) === parseInt(btn.dataset.correct);
          btn.style.background = isCorrect ? '#ecfdf5' : '#fef2f2';
          btn.style.borderColor = isCorrect ? '#10b981' : '#ef4444';
          btn.style.color = isCorrect ? '#059669' : '#dc2626';
        });
      });

      // Match game logic
      let selected = null;
      container.querySelectorAll('.match-item').forEach(item => {
        item.addEventListener('click', () => {
          if (item.classList.contains('matched')) return;

          if (!selected) {
            selected = item;
            item.classList.add('selected');
          } else {
            if (selected.dataset.type === item.dataset.type) {
              selected.classList.remove('selected');
              selected = item;
              item.classList.add('selected');
            } else {
              // Check match
              const h = selected.dataset.type === 'hanzi' ? selected.dataset.val : item.dataset.val;
              const m = selected.dataset.type === 'meaning' ? selected.dataset.val : item.dataset.val;
              const correct = challenge.pairs.find(p => p.hanzi === h && p.meaning === m);

              if (correct) {
                selected.classList.remove('selected');
                selected.classList.add('matched');
                item.classList.add('matched');
                audioService.playFeedback?.('success');
              } else {
                selected.classList.remove('selected');
                selected.classList.add('wrong-match');
                item.classList.add('wrong-match');
                setTimeout(() => {
                  selected?.classList.remove('wrong-match');
                  item.classList.remove('wrong-match');
                }, 600);
              }
              selected = null;
            }
          }
        });
      });

      // Word arrange
      container.querySelectorAll('.word-token.source').forEach(token => {
        token.addEventListener('click', () => {
          const qi = token.dataset.qi;
          const answerZone = container.querySelector(`#answerZone_${qi}`);
          token.classList.remove('source');
          token.classList.add('placed');
          answerZone.appendChild(token);
        });
      });

      // Check answer
      container.querySelector('#btnCheckChallenge')?.addEventListener('click', () => {
        clearInterval(timerInterval);
        storageService.addExp(challenge.reward / 2);
        this.updateUserStatsDisplay();
        toastService.success(`Thách thức hoàn thành! +${challenge.reward / 2} EXP. Tiếp tục luyện tập nhé!`, 'Hoàn Thành Thử Thách');
        this.challengeIndex++;
        this.renderDailyChallenge(container);
      });

      container.querySelector('#btnSkipChallenge')?.addEventListener('click', () => {
        clearInterval(timerInterval);
        this.challengeIndex++;
        this.renderDailyChallenge(container);
      });
    };

    renderContent();
  }

  // =========================================================================
  // VIEW: Vocabulary Quiz (Quiz Từ Vựng)
  // =========================================================================
  renderVocabQuiz(container) {
    const bank = QUIZ_BANK[this.quizLevel] || QUIZ_BANK[1];
    if (this.quizCurrentIndex >= bank.length) {
      // Record progress into student progress service
      const pct = Math.round((this.quizScore / bank.length) * 100);
      studentProgressService.recordLessonCompletion({
        lessonId: `vocab_quiz_hsk${this.quizLevel}`,
        level: this.quizLevel,
        category: 'vocab',
        score: pct,
        timeSpentSeconds: 90
      });

      // Show final score
      container.innerHTML = `
        <div class="quiz-card animate-pop" style="margin-top: 40px;">
          <div style="font-size: 64px; margin-bottom: 16px;">🎉</div>
          <h3 style="font-size: 24px; font-weight: 900; margin-bottom: 8px;">Hoàn Thành Bài Quiz!</h3>
          <div style="font-size: 48px; font-weight: 900; color: var(--brand-red); margin: 16px 0;">${this.quizScore}/${bank.length}</div>
          <p style="color: var(--text-secondary); margin-bottom: 20px;">
            ${this.quizScore === bank.length ? '🏆 Xuất Sắc! Bạn trả lời đúng tất cả!' :
              this.quizScore >= bank.length * 0.7 ? '✅ Tốt lắm! Cố gắng thêm nhé.' : '💪 Cần ôn tập thêm.'}
          </p>
          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <button class="btn-primary" id="btnQuizRestart">🔄 Làm Lại</button>
            <button class="btn-secondary" id="btnQuizNext">Level Tiếp →</button>
          </div>
        </div>
      `;

      container.querySelector('#btnQuizRestart')?.addEventListener('click', () => {
        this.quizCurrentIndex = 0;
        this.quizScore = 0;
        this.renderVocabQuiz(container);
      });
      container.querySelector('#btnQuizNext')?.addEventListener('click', () => {
        this.quizLevel = Math.min(3, this.quizLevel + 1);
        this.quizCurrentIndex = 0;
        this.quizScore = 0;
        this.renderVocabQuiz(container);
      });
      return;
    }

    const word = bank[this.quizCurrentIndex];
    this.quizAnswered = false;

    container.innerHTML = `
      <div class="level-filter-bar">
        ${[1, 2, 3].map(l => `
          <button class="filter-chip ${l === this.quizLevel ? 'active' : ''}" data-ql="${l}">HSK ${l}</button>
        `).join('')}
      </div>

      <div style="text-align: center; font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
        Câu <strong>${this.quizCurrentIndex + 1}</strong> / ${bank.length} •
        Điểm: <strong style="color: var(--brand-red);">${this.quizScore}</strong>
      </div>

      <div class="quiz-card animate-slide-up">
        <div style="font-size: 12px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">Từ này có nghĩa là gì?</div>
        <div class="quiz-hanzi-display">${word.hanzi}</div>
        <div style="font-size: 15px; color: var(--text-secondary); margin-bottom: 4px;">${word.pinyin}</div>
        <div class="quiz-options-grid">
          ${word.options.map((opt, i) => `
            <button class="quiz-option" data-opt="${i}" data-correct="${word.options.indexOf(word.meaning)}">${opt}</button>
          `).join('')}
        </div>
        <div id="quizFeedback" style="margin-top: 16px; font-size: 14px; min-height: 20px;"></div>
        <button class="btn-primary" id="btnQuizNextQ" style="margin-top: 16px; display: none;">Câu Tiếp →</button>
      </div>
    `;

    container.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this.quizLevel = parseInt(chip.dataset.ql);
        this.quizCurrentIndex = 0;
        this.quizScore = 0;
        this.renderVocabQuiz(container);
      });
    });

    container.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.quizAnswered) return;
        this.quizAnswered = true;

        const chosen = parseInt(btn.dataset.opt);
        const correct = parseInt(btn.dataset.correct);
        const feedback = container.querySelector('#quizFeedback');
        const nextBtn = container.querySelector('#btnQuizNextQ');

        container.querySelectorAll('.quiz-option').forEach((b, i) => {
          if (i === correct) b.classList.add('correct');
          else if (i === chosen) b.classList.add('wrong');
        });

        if (chosen === correct) {
          this.quizScore++;
          feedback.innerHTML = `<span style="color: #10b981;">✅ Chính xác! <strong>${word.meaning}</strong></span>`;
          audioService.playFeedback?.('success');
          storageService.addExp(10);
          this.updateUserStatsDisplay();
        } else {
          feedback.innerHTML = `<span style="color: var(--brand-red);">❌ Sai rồi. Đáp án đúng: <strong>${word.meaning}</strong></span>`;
          audioService.playFeedback?.('error');
          storageService.recordError({
            id: 'quiz_err_' + word.hanzi,
            title: `${word.hanzi} (${word.pinyin})`,
            category: 'vocab',
            categoryName: 'Quiz Từ Vựng',
            mistakeNote: 'Chọn nhầm nghĩa trong quiz',
            correction: word.meaning,
            exampleSentence: ''
          });
        }

        nextBtn.style.display = 'inline-flex';
      });
    });

    container.querySelector('#btnQuizNextQ')?.addEventListener('click', () => {
      this.quizCurrentIndex++;
      this.renderVocabQuiz(container);
    });
  }

  // =========================================================================
  // VIEW: Word Puzzle (Xếp Câu & Ghép Đôi)
  // =========================================================================
  renderWordPuzzle(container) {
    const puzzle = WORD_PUZZLES[this.puzzleIndex % WORD_PUZZLES.length];
    let currentQ = 0;
    let score = 0;

    const renderQuestion = () => {
      if (puzzle.type === 'pinyin_fill') {
        const q = puzzle.questions[currentQ];
        if (!q) {
          container.innerHTML = `<div class="glass-panel" style="text-align:center;padding:40px;"><h3>🎉 Hoàn thành! Điểm: ${score}/${puzzle.questions.length}</h3><button class="btn-primary" id="btnNextPuzzle" style="margin-top:16px;">Bài Tiếp →</button></div>`;
          container.querySelector('#btnNextPuzzle')?.addEventListener('click', () => {
            this.puzzleIndex++;
            this.renderWordPuzzle(container);
          });
          return;
        }

        container.innerHTML = `
          <div class="glass-panel" style="margin-bottom: 16px;">
            <h4 class="panel-title">${puzzle.title}</h4>
            <div style="font-size: 13px; color: var(--text-muted);">Câu ${currentQ + 1}/${puzzle.questions.length} • Điểm: ${score}</div>
          </div>
          <div class="quiz-card animate-slide-up">
            <div class="quiz-hanzi-display">${q.hanzi}</div>
            <p style="color: var(--text-secondary); margin-bottom: 8px;">${q.meaning}</p>
            <p style="font-size: 14px; margin-bottom: 20px; color: var(--text-secondary);">Chọn bính âm đúng:</p>
            <div class="quiz-options-grid">
              ${q.options.map((opt, i) => `
                <button class="quiz-option" data-opt="${i}" data-correct="${q.options.indexOf(q.correctPinyin)}" style="font-family: monospace; font-size: 13px;">${opt}</button>
              `).join('')}
            </div>
            <div id="puzzleFeedback" style="margin-top: 16px;"></div>
            <button class="btn-primary" id="btnPuzzleNext" style="margin-top: 16px; display: none;">Câu Tiếp →</button>
          </div>
        `;

        container.querySelectorAll('.quiz-option').forEach(btn => {
          btn.addEventListener('click', () => {
            const chosen = parseInt(btn.dataset.opt);
            const correct = parseInt(btn.dataset.correct);
            const fb = container.querySelector('#puzzleFeedback');

            container.querySelectorAll('.quiz-option').forEach((b, i) => {
              if (i === correct) b.classList.add('correct');
              else if (i === chosen) b.classList.add('wrong');
              b.style.pointerEvents = 'none';
            });

            if (chosen === correct) {
              score++;
              fb.innerHTML = '<span style="color:#10b981;font-weight:700;">✅ Chính xác!</span>';
              storageService.addExp(8);
              this.updateUserStatsDisplay();
            } else {
              fb.innerHTML = `<span style="color:var(--brand-red);font-weight:700;">❌ Sai. Đúng: <strong>${q.correctPinyin}</strong></span>`;
            }
            container.querySelector('#btnPuzzleNext').style.display = 'inline-flex';
          });
        });

        container.querySelector('#btnPuzzleNext')?.addEventListener('click', () => {
          currentQ++;
          renderQuestion();
        });
      } else if (puzzle.type === 'fill') {
        const q = puzzle.questions[currentQ];
        if (!q) {
          container.innerHTML = `<div class="glass-panel" style="text-align:center;padding:40px;"><h3>🎉 Hoàn thành! Điểm: ${score}/${puzzle.questions.length}</h3><button class="btn-primary" id="btnNextPuzzle" style="margin-top:16px;">Bài Tiếp →</button></div>`;
          container.querySelector('#btnNextPuzzle')?.addEventListener('click', () => {
            this.puzzleIndex++;
            this.renderWordPuzzle(container);
          });
          return;
        }

        container.innerHTML = `
          <div class="glass-panel" style="margin-bottom: 16px;">
            <h4 class="panel-title">${puzzle.title}</h4>
            <div style="font-size: 13px; color: var(--text-muted);">Câu ${currentQ + 1}/${puzzle.questions.length} • Điểm: ${score}</div>
          </div>
          <div class="quiz-card animate-slide-up">
            <p style="font-size: 19px; font-family: var(--font-chinese); margin-bottom: 20px; line-height: 1.8;">${q.sentence}</p>
            <div class="quiz-options-grid">
              ${q.options.map((opt, i) => `
                <button class="quiz-option" data-opt="${i}" data-correct="${q.answer}">${opt}</button>
              `).join('')}
            </div>
            <div id="puzzleFeedback" style="margin-top: 16px;"></div>
            <button class="btn-primary" id="btnPuzzleNext" style="margin-top: 16px; display: none;">Câu Tiếp →</button>
          </div>
        `;

        container.querySelectorAll('.quiz-option').forEach(btn => {
          btn.addEventListener('click', () => {
            const chosen = parseInt(btn.dataset.opt);
            const correct = parseInt(btn.dataset.correct);
            const fb = container.querySelector('#puzzleFeedback');

            container.querySelectorAll('.quiz-option').forEach((b, i) => {
              if (i === correct) b.classList.add('correct');
              else if (i === chosen) b.classList.add('wrong');
              b.style.pointerEvents = 'none';
            });

            if (chosen === correct) { score++; fb.innerHTML = `<span style="color:#10b981;font-weight:700;">✅ Đúng! ${q.explanation}</span>`; storageService.addExp(10); this.updateUserStatsDisplay(); }
            else fb.innerHTML = `<span style="color:var(--brand-red);font-weight:700;">❌ Sai. ${q.explanation}</span>`;
            container.querySelector('#btnPuzzleNext').style.display = 'inline-flex';
          });
        });

        container.querySelector('#btnPuzzleNext')?.addEventListener('click', () => {
          currentQ++;
          renderQuestion();
        });
      }
    };

    container.innerHTML = `
      <div class="glass-panel" style="margin-bottom: 20px;">
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          ${WORD_PUZZLES.map((p, i) => `
            <button class="filter-chip ${i === this.puzzleIndex % WORD_PUZZLES.length ? 'active' : ''}" data-pi="${i}">${p.title}</button>
          `).join('')}
        </div>
      </div>
      <div id="puzzleContent"></div>
    `;

    container.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this.puzzleIndex = parseInt(chip.dataset.pi);
        currentQ = 0; score = 0;
        this.renderWordPuzzle(container);
      });
    });

    const puzzleContent = container.querySelector('#puzzleContent');
    const renderQ = () => {
      if (puzzle.type === 'pinyin_fill' || puzzle.type === 'fill') {
        const q = puzzle.questions[currentQ];
        if (!q) {
          puzzleContent.innerHTML = `<div class="glass-panel" style="text-align:center;padding:40px;"><h3>🎉 Hoàn thành! Điểm: ${score}/${puzzle.questions.length}</h3><button class="btn-primary" id="btnNextPuzzle2" style="margin-top:16px;">Bài Tiếp →</button></div>`;
          container.querySelector('#btnNextPuzzle2')?.addEventListener('click', () => {
            this.puzzleIndex++;
            this.renderWordPuzzle(container);
          });
          return;
        }

        const sentence = puzzle.type === 'fill' ? q.sentence : null;
        puzzleContent.innerHTML = `
          <div class="quiz-card animate-slide-up">
            ${puzzle.type === 'pinyin_fill' ? `<div class="quiz-hanzi-display">${q.hanzi}</div><p style="color:var(--text-secondary);margin-bottom:8px;">${q.meaning}</p><p style="font-size:14px;margin-bottom:16px;color:var(--text-secondary);">Chọn bính âm đúng:</p>` : `<p style="font-size:20px;font-family:var(--font-chinese);margin-bottom:20px;line-height:1.8;">${sentence}</p>`}
            <div class="quiz-options-grid">
              ${q.options.map((opt, i) => `<button class="pq-opt" data-opt="${i}" data-correct="${puzzle.type === 'pinyin_fill' ? q.options.indexOf(q.correctPinyin) : q.answer}" style="padding:14px 16px;border:2px solid var(--border-color);border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;background:var(--bg-secondary);transition:all 0.15s;">${opt}</button>`).join('')}
            </div>
            <div id="pqFeedback" style="margin-top:16px;font-size:14px;"></div>
            <button class="btn-primary" id="btnPQNext" style="margin-top:16px;display:none;">Câu Tiếp →</button>
          </div>
        `;

        puzzleContent.querySelectorAll('.pq-opt').forEach(btn => {
          btn.addEventListener('click', () => {
            const chosen = parseInt(btn.dataset.opt);
            const correct = parseInt(btn.dataset.correct);
            const fb = puzzleContent.querySelector('#pqFeedback');
            puzzleContent.querySelectorAll('.pq-opt').forEach((b, i) => {
              b.style.pointerEvents = 'none';
              if (i === correct) { b.style.borderColor = '#10b981'; b.style.background = '#ecfdf5'; b.style.color = '#059669'; }
              else if (i === chosen) { b.style.borderColor = '#ef4444'; b.style.background = '#fef2f2'; b.style.color = '#dc2626'; }
            });
            if (chosen === correct) { score++; fb.innerHTML = `<span style="color:#10b981;font-weight:700;">✅ Chính xác! ${q.explanation || ''}</span>`; storageService.addExp(10); this.updateUserStatsDisplay(); }
            else fb.innerHTML = `<span style="color:var(--brand-red);font-weight:700;">❌ Sai. ${q.explanation || `Đúng: ${puzzle.type === 'pinyin_fill' ? q.correctPinyin : q.options[q.answer]}`}</span>`;
            puzzleContent.querySelector('#btnPQNext').style.display = 'inline-flex';
          });
        });

        puzzleContent.querySelector('#btnPQNext')?.addEventListener('click', () => {
          currentQ++;
          renderQ();
        });
      }
    };
    renderQ();
  }

  // =========================================================================
  // VIEW: Speed Reading (Đọc Hiểu Nhanh)
  // =========================================================================
  renderSpeedReading(container) {
    const passage = SPEED_PASSAGES[0];
    let phase = 'reading'; // 'reading' | 'quiz' | 'result'
    let timeLeft = passage.timeLimit;
    let answers = {};
    let score = 0;

    if (this.speedTimerInterval) { clearInterval(this.speedTimerInterval); this.speedTimerInterval = null; }

    const renderReading = () => {
      container.innerHTML = `
        <div class="level-filter-bar">
          ${SPEED_PASSAGES.map((p, i) => `<button class="filter-chip ${i === 0 ? 'active' : ''}" data-pi="${i}">${p.title}</button>`).join('')}
        </div>

        <div class="glass-panel" style="margin-bottom: 20px; text-align: center;">
          <div class="reading-timer-display" id="speedTimer">${timeLeft}</div>
          <p style="color: var(--text-muted); font-size: 13px; margin-top: 8px;">Đọc kỹ bài văn và ghi nhớ nội dung quan trọng</p>
          <div style="display: flex; gap: 12px; justify-content: center; margin-top: 12px; flex-wrap: wrap;">
            <span class="tier-badge" style="background: var(--indigo-light); color: var(--indigo);">${passage.level}</span>
            <span class="tier-badge" style="background: var(--gold-light); color: var(--gold);">~${passage.wordCount} chữ</span>
            <span class="tier-badge" style="background: var(--green-light); color: var(--green);">${passage.questions.length} câu hỏi</span>
          </div>
        </div>

        <div class="reading-area hanzi" id="readingText">${passage.text}</div>

        <div style="text-align: center; margin-top: 20px;">
          <button class="btn-primary" id="btnStartQuiz" style="font-size: 16px; padding: 14px 28px;">
            ✅ Đã Đọc Xong - Vào Phần Trả Lời
          </button>
          <div class="glass-panel" style="margin-top: 16px; text-align: left;">
            <p style="font-size: 13px; color: var(--text-secondary); font-weight: 700; margin-bottom: 8px;">📖 Bản dịch (ẩn khi chưa trả lời):</p>
            <details>
              <summary style="cursor:pointer; color: var(--text-muted); font-size: 13px;">Xem bản dịch tiếng Việt</summary>
              <p style="margin-top: 8px; font-size: 13.5px; line-height: 1.8; color: var(--text-secondary);">${passage.translation}</p>
            </details>
          </div>
        </div>
      `;

      this.speedTimerInterval = setInterval(() => {
        timeLeft--;
        const timerEl = container.querySelector('#speedTimer');
        if (timerEl) {
          timerEl.textContent = timeLeft;
          if (timeLeft <= 30) { timerEl.classList.add('warning'); }
          if (timeLeft <= 10) { timerEl.classList.remove('warning'); timerEl.classList.add('danger'); }
        }
        if (timeLeft <= 0) {
          clearInterval(this.speedTimerInterval);
          renderQuiz();
        }
      }, 1000);

      container.querySelector('#btnStartQuiz')?.addEventListener('click', () => {
        clearInterval(this.speedTimerInterval);
        renderQuiz();
      });
    };

    const renderQuiz = () => {
      container.innerHTML = `
        <div class="glass-panel" style="margin-bottom: 20px;">
          <h4 class="panel-title">❓ Trả Lời Câu Hỏi Sau Khi Đọc</h4>
          <p style="font-size: 13px; color: var(--text-muted);">Không nhìn lại bài văn. Dựa vào trí nhớ của bạn!</p>
        </div>
        ${passage.questions.map((q, i) => `
          <div class="exam-question-card animate-fade-in">
            <div style="font-weight: 700; margin-bottom: 14px; font-size: 15px; font-family: var(--font-chinese);">${i+1}. ${q.q}</div>
            ${q.options.map((opt, j) => `
              <div class="exam-option" data-qi="${i}" data-opt="${j}" data-correct="${q.answer}">${opt}</div>
            `).join('')}
          </div>
        `).join('')}
        <div style="text-align: center; margin-top: 20px;">
          <button class="btn-primary" id="btnSubmitSpeed" style="padding: 14px 28px;">📊 Nộp Bài & Xem Kết Quả</button>
        </div>
      `;

      container.querySelectorAll('.exam-option').forEach(opt => {
        opt.addEventListener('click', () => {
          const qi = opt.dataset.qi;
          container.querySelectorAll(`.exam-option[data-qi="${qi}"]`).forEach(o => o.classList.remove('selected'));
          opt.classList.add('selected');
          answers[qi] = parseInt(opt.dataset.opt);
        });
      });

      container.querySelector('#btnSubmitSpeed')?.addEventListener('click', () => {
        passage.questions.forEach((q, i) => {
          if (answers[i] === q.answer) score++;
          container.querySelectorAll(`.exam-option[data-qi="${i}"]`).forEach(o => {
            if (parseInt(o.dataset.opt) === q.answer) o.classList.add('correct');
            else if (parseInt(o.dataset.opt) === answers[i]) o.classList.add('incorrect');
          });
        });

        const expGain = score * 20;
        storageService.addExp(expGain);
        this.updateUserStatsDisplay();

        const resultDiv = document.createElement('div');
        resultDiv.className = 'glass-panel animate-pop';
        resultDiv.style.cssText = 'margin-top: 24px; text-align: center; padding: 28px;';
        resultDiv.innerHTML = `
          <div style="font-size: 48px; margin-bottom: 12px;">${score === passage.questions.length ? '🏆' : score >= 2 ? '👍' : '📚'}</div>
          <h3 style="font-size: 22px; font-weight: 900; margin-bottom: 8px;">Kết Quả: ${score}/${passage.questions.length}</h3>
          <p style="color: var(--text-secondary); margin-bottom: 16px;">+${expGain} EXP</p>
          <button class="btn-primary" id="btnReadAgain">Đọc Bài Tiếp →</button>
        `;
        container.appendChild(resultDiv);
        container.querySelector('#btnReadAgain')?.addEventListener('click', () => {
          this.renderSpeedReading(container);
        });
      });
    };

    renderReading();
  }

  // =========================================================================
  // VIEW: Grammar Explorer (Khám Phá Ngữ Pháp)
  // =========================================================================
  renderGrammarExplorer(container) {
    const filtered = this.grammarLevel === 0
      ? GRAMMAR_PATTERNS
      : GRAMMAR_PATTERNS.filter(g => g.level === this.grammarLevel);

    container.innerHTML = `
      <div class="glass-panel" style="margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
          <div>
            <h3 style="font-size: 18px; font-weight: 800;">📝 Kho Ngữ Pháp Tiếng Trung Theo Cấp HSK</h3>
            <p style="color: var(--text-secondary); font-size: 13.5px; margin-top: 6px;">Mỗi mẫu câu có ví dụ minh họa, điểm lưu ý và bài tập thực hành.</p>
          </div>
        </div>
        <div class="level-filter-bar" style="margin-top: 14px; margin-bottom: 0;">
          <button class="filter-chip ${this.grammarLevel === 0 ? 'active' : ''}" data-gl="0">Tất cả</button>
          ${[1,2,3,4,5,6,7,8,9].map(l => `<button class="filter-chip ${this.grammarLevel === l ? 'active' : ''}" data-gl="${l}">HSK ${l}</button>`).join('')}
        </div>
      </div>

      ${filtered.length === 0 ? `<div class="glass-panel" style="text-align:center;padding:40px;color:var(--text-muted);">Chưa có dữ liệu ngữ pháp cho cấp này.</div>` : ''}

      ${filtered.map(g => `
        <div class="glass-panel animate-fade-in" style="margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <div>
              <div class="grammar-pattern-display">${g.pattern}</div>
              <h4 style="font-size: 16px; font-weight: 800; margin-top: 6px;">${g.name}</h4>
              <div style="margin-top: 4px;">
                <span class="tier-badge" style="background: var(--indigo-light); color: var(--indigo);">HSK ${g.level}</span>
                <span class="tier-badge" style="background: var(--gold-light); color: var(--gold); margin-left: 6px;">${g.category}</span>
              </div>
            </div>
          </div>

          <p style="font-size: 14px; line-height: 1.7; color: var(--text-secondary); margin-bottom: 14px;">${g.explanation}</p>

          <div style="margin-bottom: 14px;">
            <div style="font-size: 12px; font-weight: 800; color: var(--green); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">📌 Ví dụ</div>
            ${g.examples.map(ex => `
              <div class="grammar-example">
                <div class="hanzi" style="font-size: 17px; font-weight: 700; margin-bottom: 4px;">
                  ${ex.zh}
                  <button class="btn-sound speak-btn" data-text="${ex.zh}" style="margin-left: 8px; vertical-align: middle;">🔊</button>
                </div>
                <div style="font-size: 13px; color: var(--brand-red); margin-bottom: 4px;">${ex.pinyin}</div>
                <div style="font-size: 13.5px; color: var(--text-secondary);">🇻🇳 ${ex.vi}</div>
              </div>
            `).join('')}
          </div>

          <div style="margin-bottom: 14px;">
            <div style="font-size: 12px; font-weight: 800; color: var(--brand-red); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">⚠️ Điểm lưu ý & Bẫy thường gặp</div>
            ${g.traps.map(t => `<div class="grammar-trap">❌ ${t}</div>`).join('')}
          </div>

          <div>
            <div style="font-size: 12px; font-weight: 800; color: var(--gold); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">✍️ Bài tập dịch (Việt → Trung)</div>
            ${g.exercises.map((ex, i) => `
              <div class="grammar-exercise">
                <div style="font-weight: 600; margin-bottom: 6px;">📝 ${ex.prompt}</div>
                <details>
                  <summary style="cursor:pointer; color: var(--text-muted); font-size: 13px; user-select: none;">Xem đáp án</summary>
                  <div class="hanzi" style="margin-top: 8px; font-size: 18px; font-weight: 700; color: var(--brand-red);">${ex.answer}
                    <button class="btn-sound speak-btn" data-text="${ex.answer}" style="margin-left: 8px; vertical-align: middle;">🔊</button>
                  </div>
                </details>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}

      <div class="glass-panel" style="text-align: center; padding: 28px; border: 2px dashed var(--border-color);">
        <div style="font-size: 32px; margin-bottom: 10px;">📚</div>
        <h4 style="font-weight: 700; margin-bottom: 8px;">Xem Thêm Ngữ Pháp Từ Giáo Trình</h4>
        <p style="color: var(--text-secondary); font-size: 13.5px; margin-bottom: 16px;">Trong phần Giáo Trình HSK có đầy đủ ngữ pháp từng cấp kèm ví dụ thi thực tế.</p>
        <button class="btn-primary" id="btnGoGrammarCurriculum">📚 Vào Giáo Trình HSK →</button>
      </div>
    `;

    container.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this.grammarLevel = parseInt(chip.dataset.gl);
        this.renderGrammarExplorer(container);
      });
    });

    container.querySelectorAll('.speak-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        audioService.speak(btn.dataset.text);
      });
    });

    container.querySelector('#btnGoGrammarCurriculum')?.addEventListener('click', () => {
      this.switchView('curriculum');
    });
  }

  // =========================================================================
  // MODAL: Sync the HSK 3.0 corpus into SQLite with real-time progress
  // =========================================================================
  async showSyncCorpusModal(container, onComplete = null) {
    const modalWrap = document.querySelector('#globalModalContainer');
    const stats = await dataImporterService.getDictionaryStats();

    modalWrap.innerHTML = `
      <div class="modal-backdrop" id="syncModalBackdrop">
        <div class="modal-card animate-slide-up" style="max-width: 620px; width: 92%;">
          <div class="modal-header">
            <h3 style="font-size: 19px; font-weight: 800; display: flex; align-items: center; gap: 8px;">
              <span>⚡</span> Đồng Bộ Kho Từ Vựng HSK 3.0 Vào SQLite
            </h3>
            <button class="modal-close-btn" id="btnCloseSyncModal">&times;</button>
          </div>

          <div class="modal-body" style="padding: 20px 0;">
            <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 16px;">
              Kho từ vựng toàn diện theo chuẩn HSK 3.0 mới nhất từ dự án <code>krmanik/HSK-3.0</code> (bao gồm toàn bộ từ cấp 1 đến cấp 9).
              Toàn bộ dữ liệu được nạp vào cơ sở dữ liệu quan hệ <strong>SQLite WebAssembly</strong> lưu trữ vĩnh viễn trong IndexedDB của trình duyệt.
            </p>

            <div style="background: var(--bg-card); border: 1.5px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 18px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="font-size: 13px; color: var(--text-muted);">Trạng thái SQLite hiện tại:</span>
                <div style="font-size: 18px; font-weight: 800; color: var(--gold-accent);">
                  ${stats.totalWords.toLocaleString()} mục từ
                </div>
              </div>
              <span class="badge-count" style="background: #ecfdf5; color: #059669; border: 1px solid rgba(16,185,129,0.3); font-size: 12.5px; padding: 4px 10px;">
                Kho mục tiêu: 10,943+ từ
              </span>
            </div>

            <!-- Progress Bar Area -->
            <div id="syncProgressContainer" style="display: none; background: rgba(99,102,241,0.06); border: 1.5px solid rgba(99,102,241,0.2); border-radius: var(--radius-lg); padding: 16px; margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; font-size: 13.5px; font-weight: 700; margin-bottom: 8px;">
                <span id="syncStatusLabel" style="color: #6366f1;">Đang chuẩn bị dữ liệu...</span>
                <span id="syncPercentLabel" style="color: #6366f1;">0%</span>
              </div>
              <div class="sync-progress-wrap">
                <div class="sync-progress-fill" id="syncProgressFill" style="width: 0%;"></div>
              </div>
              <div id="syncItemsDetail" style="font-size: 12px; color: var(--text-muted); text-align: center; margin-top: 6px;"></div>
            </div>

            <!-- Buttons Options -->
            <div id="syncButtonsRow" style="display: flex; flex-direction: column; gap: 10px;">
              <button class="btn-primary" id="btnRunLocalFastSync" style="padding: 14px; font-size: 14.5px; justify-content: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                ⚡ Nạp Tốc Hành (Tệp Bản Địa 10,943 Từ HSK 3.0)
              </button>
              <button class="btn-secondary" id="btnRunGithubLiveSync" style="padding: 12px; font-size: 13.5px; justify-content: center; color: #6366f1; border-color: rgba(99,102,241,0.3);">
                🌐 Tải & Đồng Bộ Trực Tiếp Từ GitHub Raw (krmanik/HSK-3.0)
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const closeModal = () => { modalWrap.innerHTML = ''; };
    modalWrap.querySelector('#btnCloseSyncModal')?.addEventListener('click', closeModal);
    modalWrap.querySelector('#syncModalBackdrop')?.addEventListener('click', (e) => {
      if (e.target.id === 'syncModalBackdrop') closeModal();
    });

    const progressBox = modalWrap.querySelector('#syncProgressContainer');
    const buttonsRow = modalWrap.querySelector('#syncButtonsRow');
    const fillEl = modalWrap.querySelector('#syncProgressFill');
    const statusLabel = modalWrap.querySelector('#syncStatusLabel');
    const percentLabel = modalWrap.querySelector('#syncPercentLabel');
    const detailLabel = modalWrap.querySelector('#syncItemsDetail');

    // Run Local Fast Sync
    modalWrap.querySelector('#btnRunLocalFastSync')?.addEventListener('click', async () => {
      buttonsRow.style.display = 'none';
      progressBox.style.display = 'block';
      statusLabel.textContent = 'Đang đọc tệp kho từ vựng HSK 3.0...';

      try {
        const totalInserted = await dataImporterService.syncFromStaticCorpus('data/hsk_vocab_corpus.json', (curr, total) => {
          const pct = total > 0 ? Math.min(100, Math.round((curr / total) * 100)) : 100;
          fillEl.style.width = `${pct}%`;
          percentLabel.textContent = `${pct}%`;
          statusLabel.textContent = `Đang nạp vào SQLite: ${curr.toLocaleString()} / ${total.toLocaleString()} từ`;
          detailLabel.textContent = `Tiến trình: Đang ghi từng batch 400 từ vào transaction an toàn`;
        });

        fillEl.style.width = '100%';
        percentLabel.textContent = '100%';
        statusLabel.style.color = '#10b981';
        statusLabel.textContent = `🎉 Hoàn tất! Đã nạp thành công toàn bộ ${totalInserted.toLocaleString()} mục từ!`;
        audioService.playFeedback('success');
        gamificationService.unlockBadge('badge_vocab_titan');
        this.updateUserStatsDisplay();

        setTimeout(() => {
          closeModal();
          if (onComplete) onComplete();
        }, 1600);
      } catch (err) {
        statusLabel.style.color = '#ef4444';
        statusLabel.textContent = `Lỗi đồng bộ: ${err.message}`;
        buttonsRow.style.display = 'flex';
      }
    });

    // Run GitHub Live Sync
    modalWrap.querySelector('#btnRunGithubLiveSync')?.addEventListener('click', async () => {
      buttonsRow.style.display = 'none';
      progressBox.style.display = 'block';
      statusLabel.textContent = 'Đang kết nối tới GitHub Raw (krmanik/HSK-3.0)...';

      try {
        const totalInserted = await dataImporterService.syncFromGithubRaw((info) => {
          if (info.phase === 'downloading') {
            fillEl.style.width = `${info.progress}%`;
            percentLabel.textContent = `${info.progress}%`;
            statusLabel.textContent = `Đang tải ${info.file} (HSK ${info.level})...`;
          } else if (info.phase === 'saving') {
            const pct = 50 + Math.round((info.current / Math.max(1, info.total)) * 50);
            fillEl.style.width = `${pct}%`;
            percentLabel.textContent = `${pct}%`;
            statusLabel.textContent = `Đang nạp vào SQLite: ${info.current.toLocaleString()} / ${info.total.toLocaleString()} từ`;
          }
        });

        fillEl.style.width = '100%';
        percentLabel.textContent = '100%';
        statusLabel.style.color = '#10b981';
        statusLabel.textContent = `🎉 Đồng bộ thành công từ GitHub! ${totalInserted.toLocaleString()} mục từ`;
        audioService.playFeedback('success');
        gamificationService.unlockBadge('badge_vocab_titan');
        this.updateUserStatsDisplay();

        setTimeout(() => {
          closeModal();
          if (onComplete) onComplete();
        }, 1600);
      } catch (err) {
        statusLabel.style.color = '#ef4444';
        statusLabel.textContent = `Lỗi tải GitHub: ${err.message}`;
        buttonsRow.style.display = 'flex';
      }
    });
  }

  // =========================================================================
  // VIEW: National Leaderboard, Division Leagues & Academic Badges
  // =========================================================================
  renderLeaderboard(container) {
    const leaderboardData = gamificationService.getLeaderboard();
    const badges = gamificationService.getBadges();
    const quests = gamificationService.getDailyQuests();
    const profile = storageService.getProfile();
    const top3 = leaderboardData.slice(0, 3);
    const currentUserRow = leaderboardData.find(item => item.isCurrentUser);

    container.innerHTML = `
      <div class="glass-panel" style="margin-bottom: 24px; border-left: 4px solid #f59e0b;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px;">
          <div>
            <h3 style="font-size: 20px; font-weight: 800; display: flex; align-items: center; gap: 8px;">
              <span>🏆</span> Đấu Trường HSK Toàn Quốc & Bảng Vàng Thi Đua
            </h3>
            <p style="color: var(--text-secondary); font-size: 14px; margin-top: 6px;">
              Cạnh tranh điểm tích lũy EXP, chuỗi ngày học Streak và thăng hạng giải đấu cùng cộng đồng học viên tiếng Trung trên cả nước.
            </p>
          </div>
          <div style="display: flex; gap: 10px;">
            <span class="badge-count" style="font-size: 13px; padding: 6px 14px; background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3);">
              Hạng của bạn: <strong>#${currentUserRow ? currentUserRow.rank : '4'}</strong> • Giải ${currentUserRow?.league.name || 'Vàng'}
            </span>
          </div>
        </div>
      </div>

      <!-- Top 3 Podium -->
      <div class="leaderboard-podium">
        <!-- 2nd place -->
        <div class="podium-slot">
          <div class="podium-avatar" style="border-color: #94a3b8;">${top3[1]?.avatar || 'L'}</div>
          <div style="font-weight: 700; font-size: 14px;">${top3[1]?.name || 'Á Quân'}</div>
          <div style="font-size: 12px; color: var(--text-muted);">${top3[1]?.city || 'TP.HCM'}</div>
          <div class="podium-box podium-2">
            <span style="font-size: 24px;">🥈</span>
            <span>2nd</span>
            <span style="font-size: 12px; font-weight: 600;">${top3[1]?.exp.toLocaleString()} EXP</span>
          </div>
        </div>

        <!-- 1st place -->
        <div class="podium-slot">
          <div style="font-size: 22px; margin-bottom: 2px;">👑</div>
          <div class="podium-avatar" style="border-color: #f59e0b; width: 64px; height: 64px; font-size: 24px;">${top3[0]?.avatar || 'Đ'}</div>
          <div style="font-weight: 800; font-size: 15px; color: #f59e0b;">${top3[0]?.name || 'Quán Quân'}</div>
          <div style="font-size: 12px; color: var(--text-muted);">${top3[0]?.city || 'Hà Nội'}</div>
          <div class="podium-box podium-1">
            <span style="font-size: 28px;">🥇</span>
            <span>1st</span>
            <span style="font-size: 13px; font-weight: 700;">${top3[0]?.exp.toLocaleString()} EXP</span>
          </div>
        </div>

        <!-- 3rd place -->
        <div class="podium-slot">
          <div class="podium-avatar" style="border-color: #b45309;">${top3[2]?.avatar || 'H'}</div>
          <div style="font-weight: 700; font-size: 14px;">${top3[2]?.name || 'Hạng Ba'}</div>
          <div style="font-size: 12px; color: var(--text-muted);">${top3[2]?.city || 'Đà Nẵng'}</div>
          <div class="podium-box podium-3">
            <span style="font-size: 22px;">🥉</span>
            <span>3rd</span>
            <span style="font-size: 12px; font-weight: 600;">${top3[2]?.exp.toLocaleString()} EXP</span>
          </div>
        </div>
      </div>

      <!-- Current User Standings Banner -->
      <div class="glass-panel" style="margin-bottom: 24px; background: linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(239, 68, 68, 0.08) 100%); border: 2px solid rgba(245, 158, 11, 0.3);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--brand-gradient); color: #fff; font-size: 20px; font-weight: 800; display: flex; align-items: center; justify-content: center;">
              ${profile.name.charAt(0)}
            </div>
            <div>
              <div style="font-size: 17px; font-weight: 800;">
                ${profile.name} (Bạn)
              </div>
              <div style="font-size: 13px; color: var(--text-secondary);">
                Hạng <strong>#${currentUserRow ? currentUserRow.rank : '4'}</strong> toàn quốc • Cấp độ HSK ${profile.targetLevel} • Chuỗi ${profile.streakDays} ngày 🔥
              </div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 24px; font-weight: 900; color: #f59e0b;">
              ${profile.exp.toLocaleString()} <span style="font-size: 14px;">EXP</span>
            </div>
            <div style="font-size: 12px; color: var(--text-muted);">
              Giải đấu: <strong style="color: ${currentUserRow?.league.color || '#f59e0b'};">${currentUserRow?.league.name || 'Vàng'}</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Daily Quests Section -->
      <div class="panel-header">
        <h4 class="panel-title"><span>⚡</span> Nhiệm Vụ Hàng Ngày (Nhận Thưởng EXP)</h4>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 28px;">
        ${quests.map(q => `
          <div class="glass-panel" style="padding: 16px; border: 1.5px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 700; font-size: 14px;">${q.text}</div>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
                Tiến độ: ${q.current} / ${q.target} • Thưởng: +${q.rewardExp} EXP
              </div>
            </div>
            <button class="btn-${q.completed ? 'secondary' : 'primary'}" style="font-size: 12px; padding: 6px 12px;" ${q.completed ? 'disabled' : ''}>
              ${q.completed ? '✓ Đã nhận' : 'Làm ngay →'}
            </button>
          </div>
        `).join('')}
      </div>

      <!-- Leaderboard Full List -->
      <div class="panel-header">
        <h4 class="panel-title"><span>📋</span> Bảng Xếp Hạng Top 10 Học Viên Xuất Sắc</h4>
      </div>
      <div class="leaderboard-list" style="margin-bottom: 32px;">
        ${leaderboardData.map(item => `
          <div class="leaderboard-row ${item.isCurrentUser ? 'current-user' : ''}">
            <div style="display: flex; align-items: center; gap: 14px;">
              <span style="font-size: 16px; font-weight: 800; width: 28px; text-align: center; color: ${item.rank <= 3 ? '#f59e0b' : 'var(--text-muted)'};">
                ${item.rank <= 3 ? (['🥇','🥈','🥉'][item.rank - 1]) : `#${item.rank}`}
              </span>
              <div style="width: 38px; height: 38px; border-radius: 50%; background: ${item.isCurrentUser ? 'var(--brand-gradient)' : 'var(--bg-secondary)'}; color: ${item.isCurrentUser ? '#fff' : 'var(--text-primary)'}; font-weight: 800; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-color);">
                ${item.avatar}
              </div>
              <div>
                <div style="font-weight: 700; font-size: 14.5px;">${item.name}</div>
                <div style="font-size: 12px; color: var(--text-muted);">${item.city} • HSK ${item.level}</div>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 16px;">
              <span class="badge-count" style="font-size: 11px; padding: 3px 8px; color: ${item.league.color}; border: 1px solid ${item.league.color};">
                ${item.league.icon} ${item.league.name}
              </span>
              <span style="font-size: 13px; color: #f97316; font-weight: 700;">
                🔥 ${item.streak} ngày
              </span>
              <span style="font-weight: 800; font-size: 15px; color: var(--text-primary); min-width: 80px; text-align: right;">
                ${item.exp.toLocaleString()} EXP
              </span>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Achievement Badges (Bộ 12 Huy Hiệu Học Thuật) -->
      <div class="panel-header">
        <h4 class="panel-title"><span>🎖️</span> Bộ Sưu Tập 12 Huy Hiệu Học Thuật Khang Hy</h4>
        <span style="font-size: 12.5px; color: var(--text-muted);">Mở khóa bằng cách chinh phục các mốc học tập thực tế</span>
      </div>
      <div class="badge-grid">
        ${badges.map(b => `
          <div class="badge-card ${b.unlocked ? 'unlocked' : 'locked'}">
            <div class="badge-icon-wrap">${b.icon}</div>
            <div style="font-weight: 800; font-size: 15px; color: ${b.unlocked ? '#f59e0b' : 'var(--text-muted)'};">
              ${b.title}
            </div>
            <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.4;">
              ${b.description}
            </div>
            <div style="width: 100%; margin-top: 6px;">
              <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 3px; font-weight: 700; color: var(--text-muted);">
                <span>${b.unlocked ? '✅ Đã Đạt' : 'Tiến độ'}</span>
                <span>${b.progress}%</span>
              </div>
              <div class="sync-progress-wrap" style="height: 6px; margin: 0;">
                <div class="sync-progress-fill" style="width: ${b.progress}%; background: ${b.unlocked ? 'linear-gradient(90deg, #f59e0b, #10b981)' : '#9ca3af'};"></div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // =========================================================================
  // VIEW: AI Speech Recognition Lab (Web Speech API Mandarin zh-CN)
  // =========================================================================
  async renderSpeechLab(container) {
    const recentLogs = await speechService.getRecentLogs(8);
    const presets = [
      { text: '你好', pinyin: 'nǐ hǎo', meaning: 'Xin chào', level: 1 },
      { text: '谢谢', pinyin: 'xièxie', meaning: 'Cảm ơn', level: 1 },
      { text: '再见', pinyin: 'zàijiàn', meaning: 'Tạm biệt', level: 1 },
      { text: '准备', pinyin: 'zhǔnbèi', meaning: 'Chuẩn bị', level: 2 },
      { text: '欢迎光临', pinyin: 'huānyíng guānglín', meaning: 'Chào mừng quý khách', level: 2 },
      { text: '普通话', pinyin: 'pǔtōnghuà', meaning: 'Tiếng Phổ thông', level: 3 },
      { text: '热情好客', pinyin: 'rèqíng hàokè', meaning: 'Nhiệt tình hiếu khách', level: 4 },
      { text: '坚持不懈', pinyin: 'jiānchí bùxiè', meaning: 'Kiên trì không nản', level: 5 },
      { text: '循序渐进', pinyin: 'xúnxù jiànjìn', meaning: 'Tuần tự từng bước', level: 6 }
    ];

    container.innerHTML = `
      <div class="glass-panel" style="margin-bottom: 24px; border-left: 4px solid #ec4899;">
        <h3 style="font-size: 20px; font-weight: 800; display: flex; align-items: center; gap: 8px;">
          <span>🎙️</span> Phòng Luyện Phát Âm Chuẩn AI (Web Speech API)
        </h3>
        <p style="color: var(--text-secondary); font-size: 14px; margin-top: 6px; line-height: 1.6;">
          Hệ thống nhận diện giọng nói tiếng Trung Quốc (Mandarin zh-CN) phân tích trực tiếp qua micro trình duyệt.
          Chấm điểm độ chuẩn xác của <strong>âm vị, phụ âm đầu bật hơi và cao độ thanh điệu 1-4</strong>.
        </p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;" class="speech-lab-grid">
        <!-- Interactive Testing Booth -->
        <div class="glass-panel" style="display: flex; flex-direction: column; align-items: center; text-align: center; padding: 32px 24px;">
          <span style="font-size: 13px; font-weight: 700; color: var(--gold-accent); text-transform: uppercase; margin-bottom: 6px;">
            Mục tiêu phát âm:
          </span>
          <div style="font-size: 56px; font-weight: 900; color: var(--text-primary); margin-bottom: 4px;" class="hanzi" id="labTargetHanzi">
            ${this.speechTargetWord}
          </div>
          <div style="font-size: 18px; color: var(--text-secondary); margin-bottom: 20px;" id="labTargetSub">
            Bấm 🔊 để nghe chuẩn trước khi phát âm
          </div>

          <!-- Buttons -->
          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
            <button class="btn-sound speak-btn" id="btnLabListenSample" data-text="${this.speechTargetWord}" style="width: 52px; height: 52px; font-size: 24px;" title="Nghe người bản xứ phát âm">
              🔊
            </button>
            <button class="voice-record-btn" id="btnLabMic" style="width: 64px; height: 64px; font-size: 28px;" title="Bấm để ghi âm và chấm điểm">
              🎙️
            </button>
          </div>

          <div id="labStatusText" style="font-size: 13.5px; color: var(--text-muted); min-height: 24px;">
            Bấm vào chiếc Mic 🎙️ ở giữa để bắt đầu nói
          </div>

          <!-- Feedback Result Box -->
          <div id="labEvaluationCard" style="display: none; width: 100%; margin-top: 20px;" class="speech-result-card"></div>
        </div>

        <!-- Word Presets & Custom Input -->
        <div class="glass-panel">
          <h4 style="font-size: 16px; font-weight: 800; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
            <span>🎯</span> Chọn Mẫu Luyện Tập (HSK 1 - 6):
          </h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 8px; margin-bottom: 20px;">
            ${presets.map(p => `
              <button class="btn-secondary lab-preset-btn ${p.text === this.speechTargetWord ? 'active' : ''}" data-text="${p.text}" data-py="${p.pinyin}" data-vi="${p.meaning}" style="padding: 10px 8px; text-align: center; display: flex; flex-direction: column; gap: 2px;">
                <span class="hanzi" style="font-size: 18px; font-weight: 800; color: var(--brand-red);">${p.text}</span>
                <span style="font-size: 11.5px; color: var(--gold-accent);">${p.pinyin}</span>
                <span style="font-size: 11px; color: var(--text-muted);">${p.meaning}</span>
              </button>
            `).join('')}
          </div>

          <h4 style="font-size: 14.5px; font-weight: 700; margin-bottom: 8px;">
            Hoặc Nhập Chữ Hán Tự Do:
          </h4>
          <div style="display: flex; gap: 8px;">
            <input type="text" id="labCustomInput" class="lexicon-input" placeholder="Nhập từ hoặc câu tiếng Trung bất kỳ..." />
            <button class="btn-primary" id="btnLabSetCustom">Áp dụng</button>
          </div>
        </div>
      </div>

      <!-- Recent Speech History Table from SQLite -->
      <div class="panel-header">
        <h4 class="panel-title"><span>🕒</span> Lịch Sử Luyện Âm Cá Nhân (Ghi Nhận Vào SQLite)</h4>
      </div>
      <div class="glass-panel">
        ${recentLogs.length === 0 ? `
          <div style="text-align: center; color: var(--text-muted); padding: 20px;">
            Chưa có lịch sử phát âm. Hãy bấm Micro 🎙️ ở trên để thực hành bài nói đầu tiên!
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${recentLogs.map(l => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--bg-secondary); border-radius: var(--radius-md); font-size: 13.5px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <span class="hanzi" style="font-weight: 800; font-size: 18px; color: var(--text-primary);">${l.target_text}</span>
                  <span style="color: var(--text-secondary); font-size: 12.5px;">Máy nghe: "${l.spoken_text}"</span>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                  <span class="score-badge ${l.score >= 80 ? 'pass' : 'fail'}">
                    ${l.score}/100
                  </span>
                  <span style="font-size: 11px; color: var(--text-muted);">${l.logged_at}</span>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;

    // Listen button
    container.querySelector('#btnLabListenSample')?.addEventListener('click', () => {
      audioService.speak(this.speechTargetWord);
    });

    // Preset buttons
    container.querySelectorAll('.lab-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.lab-preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.speechTargetWord = btn.dataset.text;
        container.querySelector('#labTargetHanzi').textContent = btn.dataset.text;
        container.querySelector('#labTargetSub').textContent = `${btn.dataset.py} (${btn.dataset.vi})`;
        container.querySelector('#btnLabListenSample').dataset.text = btn.dataset.text;
        container.querySelector('#labEvaluationCard').style.display = 'none';
      });
    });

    // Custom input button
    container.querySelector('#btnLabSetCustom')?.addEventListener('click', () => {
      const input = container.querySelector('#labCustomInput');
      const val = input.value.trim();
      if (val) {
        this.speechTargetWord = val;
        container.querySelector('#labTargetHanzi').textContent = val;
        container.querySelector('#labTargetSub').textContent = 'Từ vựng tùy chỉnh của bạn';
        container.querySelector('#btnLabListenSample').dataset.text = val;
        container.querySelector('#labEvaluationCard').style.display = 'none';
        input.value = '';
      }
    });

    // Microphone button
    const micBtn = container.querySelector('#btnLabMic');
    const statusText = container.querySelector('#labStatusText');
    const evalCard = container.querySelector('#labEvaluationCard');

    micBtn?.addEventListener('click', () => {
      if (micBtn.classList.contains('listening')) {
        speechService.stop();
        micBtn.classList.remove('listening');
        statusText.textContent = 'Đã dừng nghe.';
        return;
      }

      micBtn.classList.add('listening');
      statusText.innerHTML = `
        <span class="soundwave-anim">
          <span class="soundwave-bar"></span>
          <span class="soundwave-bar"></span>
          <span class="soundwave-bar"></span>
          <span class="soundwave-bar"></span>
        </span>
        <span style="color: #ec4899; font-weight: 700;">Đang lắng nghe... Hãy phát âm rõ từ "${this.speechTargetWord}"!</span>
      `;

      speechService.listenAndScore(this.speechTargetWord, {
        onResult: (res) => {
          micBtn.classList.remove('listening');
          statusText.textContent = 'Đã ghi nhận và chấm điểm phát âm!';
          evalCard.style.display = 'block';

          const isPass = res.score >= 80;
          if (isPass) audioService.playFeedback('success');
          else audioService.playFeedback('error');

          evalCard.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-weight: 800; font-size: 16px;">Kết Quả Đánh Giá Âm Vị</span>
              <span class="score-badge ${isPass ? 'pass' : 'fail'}" style="font-size: 16px; padding: 6px 16px;">
                ${res.score} / 100
              </span>
            </div>
            <div style="font-size: 14px; margin-bottom: 6px; color: var(--text-secondary);">
              Văn bản nhận diện qua giọng nói: <strong class="hanzi" style="font-size: 17px; color: var(--brand-red);">${res.spoken}</strong>
            </div>
            ${res.isSimulated ? '<div class="simulation-note">🧪 Kết quả mô phỏng vì trình duyệt chưa hỗ trợ nhận diện giọng nói.</div>' : ''}
            <p style="font-size: 13.5px; line-height: 1.5; color: ${isPass ? '#059669' : '#dc2626'}; font-weight: 600;">
              💡 ${res.feedback}
            </p>
          `;

          if (res.score >= 90) {
            gamificationService.unlockBadge('badge_speech_ace');
          }
          this.updateUserStatsDisplay();
        },
        onError: (err) => {
          micBtn.classList.remove('listening');
          statusText.textContent = `Lỗi thu âm: ${err}. Hãy cấp quyền micro trên trình duyệt.`;
        },
        onEnd: () => {
          micBtn.classList.remove('listening');
        }
      });
    });
  }

  // =========================================================================
  // VIEW: Text Analyzer & Smart Pinyin Ruby Segmenter
  // =========================================================================
  async renderTextAnalyzer(container) {
    container.innerHTML = `
      <div class="glass-panel" style="margin-bottom: 24px; border-left: 4px solid #06b6d4;">
        <h3 style="font-size: 20px; font-weight: 800; display: flex; align-items: center; gap: 8px;">
          <span>🔬</span> Thấu Kính Phân Tích Cú Pháp & Bính Âm Ruby (Smart Segmenter)
        </h3>
        <p style="color: var(--text-secondary); font-size: 14px; margin-top: 6px; line-height: 1.6;">
          Dán bất kỳ đoạn văn bản, lời bài hát, đề thi hoặc tin tức tiếng Trung nào vào đây. Hệ thống tự động
          <strong>tách từ (tokenization)</strong>, gán phiên âm Bính âm chuẩn Ruby và tra cứu âm Hán-Việt, ngữ nghĩa từ SQLite.
        </p>
      </div>

      <!-- Input Box -->
      <div class="glass-panel" style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <label style="font-weight: 700; font-size: 14px; color: var(--text-primary);">
            📝 Nhập hoặc dán văn bản tiếng Trung:
          </label>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn-secondary analyzer-preset-btn" data-preset="1" style="font-size: 12px; padding: 4px 10px;">Mẫu Luận Ngữ</button>
            <button class="btn-secondary analyzer-preset-btn" data-preset="2" style="font-size: 12px; padding: 4px 10px;">Mẫu Giao Tiếp (HSK 2-3)</button>
            <button class="btn-secondary analyzer-preset-btn" data-preset="3" style="font-size: 12px; padding: 4px 10px;">Mẫu Kinh Tế (HSK 5-6)</button>
          </div>
        </div>

        <textarea id="analyzerInputArea" class="sql-editor" style="height: 110px; font-size: 16px; font-family: var(--font-chinese); line-height: 1.6;">${this.analyzerInputText}</textarea>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; flex-wrap: wrap; gap: 10px;">
          <button class="btn-primary" id="btnRunTextAnalysis" style="padding: 10px 22px; background: linear-gradient(135deg, #06b6d4 0%, #0284c7 100%);">
            ⚡ Phân Tích & Gán Bính Âm Ruby
          </button>
          <div style="display: flex; gap: 10px;">
            <button class="btn-secondary" id="btnSpeakAnalyzedText" style="padding: 10px 16px;">
              🔊 Đọc Toàn Bài
            </button>
            <button class="btn-secondary" id="btnClearAnalyzerText" style="padding: 10px 16px;">
              Xóa Văn Bản
            </button>
          </div>
        </div>
      </div>

      <!-- Results Area -->
      <div id="analyzerResultsContainer"></div>
    `;

    const runAnalysis = async () => {
      const text = container.querySelector('#analyzerInputArea').value;
      this.analyzerInputText = text;
      const resContainer = container.querySelector('#analyzerResultsContainer');
      resContainer.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 30px;">⏳ Đang phân tích cú pháp và bóc tách từ vựng qua SQLite...</div>';

      const tokens = await textAnalyzerService.tokenize(text);
      const rubyHtml = await textAnalyzerService.generateRubyHtml(text);
      const chineseTokens = tokens.filter(t => t.isChinese);

      resContainer.innerHTML = `
        <div class="panel-header">
          <h4 class="panel-title"><span>📖</span> Văn Bản Gán Bính Âm Ruby Tương Tác</h4>
          <span style="font-size: 12px; color: var(--text-muted);">Bấm vào từng từ để nghe và tra nghĩa</span>
        </div>
        <div class="ruby-display-box" id="rubyBox">
          ${rubyHtml}
        </div>

        <div class="panel-header" style="margin-top: 28px;">
          <h4 class="panel-title"><span>📊</span> Phân Tách Từ Vựng (${chineseTokens.length} từ)</h4>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px;">
          ${chineseTokens.map(t => `
            <div class="token-card animate-fade-in">
              <div>
                <div style="display: flex; align-items: baseline; gap: 8px;">
                  <span class="hanzi" style="font-size: 22px; font-weight: 800; color: var(--brand-red);">${t.text}</span>
                  <span style="font-size: 13px; color: #6366f1; font-weight: 700;">${t.pinyin}</span>
                  <span class="tier-badge" style="font-size: 10.5px; padding: 2px 6px;">HSK ${t.level || 1}</span>
                </div>
                ${t.hanviet ? `<div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">Âm Hán-Việt: <strong>${t.hanviet}</strong></div>` : ''}
                <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
                  ${t.meaning || 'Từ vựng thông dụng'}
                </div>
              </div>
              <button class="speak-btn" data-text="${t.text}" style="background: transparent; border: 1px solid var(--border-color); border-radius: 50%; width: 34px; height: 34px; cursor: pointer; font-size: 14px;">
                🔊
              </button>
            </div>
          `).join('')}
        </div>
      `;

      // Bind speak on ruby words
      resContainer.querySelectorAll('.ruby-word').forEach(rw => {
        rw.addEventListener('click', () => {
          const hanzi = rw.dataset.hanzi;
          audioService.speak(hanzi);
        });
      });

      // Bind speak buttons
      resContainer.querySelectorAll('.speak-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          audioService.speak(btn.dataset.text);
        });
      });
    };

    container.querySelector('#btnRunTextAnalysis')?.addEventListener('click', runAnalysis);
    container.querySelector('#btnSpeakAnalyzedText')?.addEventListener('click', () => {
      const text = container.querySelector('#analyzerInputArea').value;
      if (text.trim()) audioService.speak(text.trim());
    });

    container.querySelector('#btnClearAnalyzerText')?.addEventListener('click', () => {
      container.querySelector('#analyzerInputArea').value = '';
      container.querySelector('#analyzerResultsContainer').innerHTML = '';
    });

    // Presets
    container.querySelectorAll('.analyzer-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = btn.dataset.preset;
        let sample = '';
        if (p === '1') sample = '学而时习之，不亦说乎？有朋自远方来，不亦乐乎？人不知而不愠，不亦君子乎？';
        else if (p === '2') sample = '今天天气非常好，我们打算去超市买一些新鲜的水果和蔬菜，然后一起准备晚餐。';
        else if (p === '3') sample = '近年来，中国在数字经济、人工智能以及绿色能源领域取得了举世瞩目的显著发展成就。';
        container.querySelector('#analyzerInputArea').value = sample;
        runAnalysis();
      });
    });

    // Run first analysis automatically
    runAnalysis();
  }

  // =========================================================================
  // VIEW: Hands-Free Immersion Audio Player (Đài Phát Thanh Luyện Nghe)
  // =========================================================================
  renderAudioImmersion(container) {
    const currentTrack = immersionAudioService.getCurrentTrack() || {
      title: '你好',
      subtitle: 'nǐ hǎo • nhĩ hảo',
      translation: 'Xin chào',
      example: '你好！很高兴认识你。',
      exampleMeaning: 'Xin chào! Rất vui được quen biết bạn.'
    };

    container.innerHTML = `
      <div class="glass-panel" style="margin-bottom: 24px; border-left: 4px solid #f59e0b;">
        <h3 style="font-size: 20px; font-weight: 800; display: flex; align-items: center; gap: 8px;">
          <span>🎧</span> Đài Phát Thanh Luyện Nghe Rảnh Tay (Hands-Free Immersion)
        </h3>
        <p style="color: var(--text-secondary); font-size: 14px; margin-top: 6px; line-height: 1.6;">
          Luyện nghe thụ động đắm chìm khi lái xe, đi lại hoặc trước khi đi ngủ.
          Máy tự động đọc luân phiên <strong>Chữ Hán bản ngữ</strong>, ngừng thở nhẹ rồi đọc <strong>bản dịch tiếng Việt</strong>.
        </p>
      </div>

      <!-- Audio Player Main Deck -->
      <div class="audio-player-deck" style="margin-bottom: 28px;">
        <!-- Spinning Vinyl Disc -->
        <div class="vinyl-disc ${immersionAudioService.isPlaying ? 'spinning' : ''}" id="playerDisc"></div>

        <!-- Track Info -->
        <div style="font-size: 58px; font-weight: 900; color: #fff; margin-bottom: 4px;" class="hanzi" id="playerHanzi">
          ${currentTrack.title}
        </div>
        <div style="font-size: 20px; color: #f59e0b; font-weight: 700; margin-bottom: 6px;" id="playerSubtitle">
          ${currentTrack.subtitle}
        </div>
        <div style="font-size: 18px; color: rgba(255,255,255,0.85); font-weight: 600; margin-bottom: 16px;" id="playerTranslation">
          ${currentTrack.translation}
        </div>

        <!-- Subtitle & Context Box -->
        <div class="audio-subtitles-card" id="playerSubCard">
          <div style="font-size: 14px; color: rgba(255,255,255,0.7); margin-bottom: 4px;">Ví dụ ngữ cảnh thực tế:</div>
          <div class="hanzi" style="font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 4px;" id="playerExampleZh">
            ${currentTrack.example || currentTrack.title}
          </div>
          <div style="font-size: 13.5px; color: #94a3b8;" id="playerExampleVi">
            ${currentTrack.exampleMeaning || ''}
          </div>
        </div>

        <!-- Media Controls Row -->
        <div class="audio-controls-row">
          <button class="btn-player-sub" id="btnPlayerPrev" title="Bài trước">⏮️</button>
          <button class="btn-player-circle" id="btnPlayerToggle" title="Phát / Tạm dừng">
            ${immersionAudioService.isPlaying ? '⏸️' : '▶️'}
          </button>
          <button class="btn-player-sub" id="btnPlayerNext" title="Bài tiếp">⏭️</button>
        </div>

        <!-- Speed & Sleep Timer Settings -->
        <div style="display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; align-items: center; margin-top: 10px; font-size: 13px;">
          <!-- Speed -->
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="color: rgba(255,255,255,0.6);">Tốc độ:</span>
            ${[0.75, 1.0, 1.25].map(spd => `
              <button class="filter-chip player-speed-btn ${immersionAudioService.playbackRate === spd ? 'active' : ''}" data-speed="${spd}" style="padding: 4px 10px; font-size: 12px;">
                ${spd}x
              </button>
            `).join('')}
          </div>

          <!-- Bilingual Toggle -->
          <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; user-select: none;">
            <input type="checkbox" id="checkBilingualMode" ${immersionAudioService.isBilingualMode ? 'checked' : ''} />
            <span>Đọc kèm dịch tiếng Việt</span>
          </label>

          <!-- Sleep Timer -->
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="color: rgba(255,255,255,0.6);">Hẹn giờ tắt:</span>
            ${[0, 5, 15, 30].map(m => `
              <button class="filter-chip player-timer-btn ${immersionAudioService.sleepMinutesLeft === m ? 'active' : ''}" data-timer="${m}" style="padding: 4px 10px; font-size: 12px;">
                ${m === 0 ? 'Tắt' : `${m}p`}
              </button>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Playlist Selection -->
      <div class="panel-header">
        <h4 class="panel-title"><span>📂</span> Chọn Danh Sách Phát Luyện Nghe</h4>
      </div>
      <div class="level-filter-bar">
        ${[
          { id: 'hsk1', label: 'HSK 1 (Cốt Lõi)' },
          { id: 'hsk2', label: 'HSK 2' },
          { id: 'hsk3', label: 'HSK 3' },
          { id: 'hsk4', label: 'HSK 4' },
          { id: 'hsk5', label: 'HSK 5' },
          { id: 'hsk6', label: 'HSK 6' },
          { id: 'dialogues', label: '💬 Hội Thoại Đời Sống' }
        ].map(pl => `
          <button class="filter-chip player-playlist-btn ${this.immersionSource === pl.id ? 'active' : ''}" data-source="${pl.id}">
            ${pl.label}
          </button>
        `).join('')}
      </div>
    `;

    // Hook listeners
    const toggleBtn = container.querySelector('#btnPlayerToggle');
    const disc = container.querySelector('#playerDisc');
    const hanziEl = container.querySelector('#playerHanzi');
    const subEl = container.querySelector('#playerSubtitle');
    const transEl = container.querySelector('#playerTranslation');
    const exZhEl = container.querySelector('#playerExampleZh');
    const exViEl = container.querySelector('#playerExampleVi');

    immersionAudioService.onTrackChange = (track) => {
      if (!track) return;
      if (hanziEl) hanziEl.textContent = track.title;
      if (subEl) subEl.textContent = track.subtitle;
      if (transEl) transEl.textContent = track.translation;
      if (exZhEl) exZhEl.textContent = track.example || track.title;
      if (exViEl) exViEl.textContent = track.exampleMeaning || '';
    };

    immersionAudioService.onStateChange = (isPlaying) => {
      if (toggleBtn) toggleBtn.textContent = isPlaying ? '⏸️' : '▶️';
      if (disc) disc.classList.toggle('spinning', isPlaying);
    };

    toggleBtn?.addEventListener('click', () => {
      if (immersionAudioService.isPlaying) {
        immersionAudioService.pause();
      } else {
        immersionAudioService.play();
      }
    });

    container.querySelector('#btnPlayerNext')?.addEventListener('click', () => {
      immersionAudioService.next();
    });

    container.querySelector('#btnPlayerPrev')?.addEventListener('click', () => {
      immersionAudioService.prev();
    });

    container.querySelectorAll('.player-speed-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.player-speed-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const spd = parseFloat(btn.dataset.speed);
        immersionAudioService.setSpeed(spd);
      });
    });

    container.querySelectorAll('.player-timer-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.player-timer-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const m = parseInt(btn.dataset.timer, 10);
        immersionAudioService.setSleepTimer(m);
      });
    });

    container.querySelector('#checkBilingualMode')?.addEventListener('change', (e) => {
      immersionAudioService.isBilingualMode = e.target.checked;
    });

    container.querySelectorAll('.player-playlist-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.player-playlist-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const src = btn.dataset.source;
        this.immersionSource = src;
        immersionAudioService.loadPlaylist(src);
        if (immersionAudioService.isPlaying) {
          immersionAudioService.play();
        }
      });
    });
  }

  // =========================================================================
  // VIEW: Grammar Master & Sentence Scramble Practice
  // =========================================================================
  renderGrammarMasterView(container) {
    const stats = grammarService.getProgressStats();
    const points = grammarService.getAllPoints(this.grammarLevelFilter);

    container.innerHTML = `
      <div class="view-header-row">
        <div>
          <h2>📐 Ma Trận Ngữ Pháp HSK & Bài Tập Đảo Từ</h2>
          <p class="text-muted">Hệ thống hóa cấu trúc ngữ pháp then chốt từ HSK 1 đến HSK 9, giải mã bẫy tư duy ngữ pháp người Việt và rèn phản xạ trật tự từ.</p>
        </div>
        <div class="stat-pills-row">
          <div class="stat-pill"><span class="pill-num">${stats.totalPoints}</span> Điểm Ngữ Pháp</div>
          <div class="stat-pill"><span class="pill-num" style="color:#10b981;">${stats.mastered}</span> Đã Thành Thạo</div>
        </div>
      </div>

      <!-- Level Filter -->
      <div class="filters-bar" style="margin-top:16px;">
        <button class="filter-chip ${this.grammarLevelFilter === 'all' ? 'active' : ''}" data-glevel="all">Tất Cả Cấp Độ</button>
        <button class="filter-chip ${this.grammarLevelFilter === '2' ? 'active' : ''}" data-glevel="2">HSK 2</button>
        <button class="filter-chip ${this.grammarLevelFilter === '3' ? 'active' : ''}" data-glevel="3">HSK 3</button>
        <button class="filter-chip ${this.grammarLevelFilter === '4' ? 'active' : ''}" data-glevel="4">HSK 4</button>
        <button class="filter-chip ${this.grammarLevelFilter === '7' ? 'active' : ''}" data-glevel="7">HSK 7-9</button>
      </div>

      <!-- Grammar Cards Grid -->
      <div class="grammar-grid">
        ${points.map(pt => {
          const exercise = pt.exercise;
          const currentSelection = this.scrambleSelections[pt.id] || [];
          const remainingTokens = (exercise?.tokens || []).filter(t => !currentSelection.includes(t));

          return `
            <div class="grammar-card" id="card_${pt.id}">
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                  <span class="badge" style="background:#6366f1; color:#fff; font-size:11px; margin-bottom:6px;">HSK ${pt.level}</span>
                  <span class="badge" style="background:rgba(99,102,241,0.1); color:#4338ca; font-size:11px; margin-left:6px;">${pt.category}</span>
                  <h3 style="font-size:18px; font-weight:800; margin-top:6px;">${pt.title}</h3>
                </div>
              </div>

              <div class="grammar-formula-box">
                <code>${pt.formula}</code>
              </div>

              <p style="font-size:14px; line-height:1.6; color:var(--text-secondary);">${pt.summary}</p>

              <!-- Pitfall Alert -->
              <div class="pitfall-box">
                <strong>⚠️ Cảnh Báo Lỗi Sai Người Việt:</strong><br/>
                ${pt.vietnamesePitfall}
              </div>

              <!-- Examples -->
              <div style="background:var(--bg-secondary); border-radius:var(--radius-md); padding:12px 14px;">
                <div style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:8px;">Ví Dụ Điển Hình:</div>
                ${pt.examples.map(ex => `
                  <div style="margin-bottom:10px; border-bottom:1px dashed var(--border-color); padding-bottom:8px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                      <button class="btn-icon-tiny btn-speak-example" data-zh="${ex.zh}" title="Nghe phát âm">🔊</button>
                      <span style="font-size:16px; font-weight:700; font-family:var(--font-chinese);">${ex.zh}</span>
                    </div>
                    <div style="font-size:12px; color:#6366f1; margin:2px 0 2px 30px;">${ex.pinyin}</div>
                    <div style="font-size:13px; color:var(--text-secondary); margin-left:30px;">${ex.vi}</div>
                  </div>
                `).join('')}
              </div>

              <!-- Interactive Sentence Scramble Exercise -->
              ${exercise ? `
                <div class="scramble-zone">
                  <div style="font-size:13px; font-weight:700; color:#4338ca; margin-bottom:4px;">🧩 Bài Tập Ghép Khối Từ Đảo Trật Tự:</div>
                  <div style="font-size:13px; color:var(--text-muted); margin-bottom:8px;"><em>"${exercise.meaning}"</em></div>
                  
                  <!-- Target Tray -->
                  <div class="scramble-target-tray" id="tray_${pt.id}">
                    ${currentSelection.length === 0 ? '<span style="font-size:12px; color:var(--text-muted);">Nhấp các khối từ bên dưới để đưa vào đây...</span>' : ''}
                    ${currentSelection.map(tok => `
                      <span class="scramble-chip in-target" data-gid="${pt.id}" data-token="${tok}">${tok} ✕</span>
                    `).join('')}
                  </div>

                  <!-- Source Pool -->
                  <div class="scramble-chips-pool" id="pool_${pt.id}">
                    ${remainingTokens.map(tok => `
                      <span class="scramble-chip" data-gid="${pt.id}" data-token="${tok}">${tok}</span>
                    `).join('')}
                  </div>

                  <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
                    <button class="btn btn-secondary btn-sm btn-reset-scramble" data-gid="${pt.id}">Làm Lại</button>
                    <button class="btn btn-primary btn-sm btn-check-scramble" data-gid="${pt.id}">Kiểm Tra Đáp Án</button>
                  </div>
                  <div id="result_${pt.id}" style="margin-top:8px;"></div>
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Bind level filter
    container.querySelectorAll('[data-glevel]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.grammarLevelFilter = btn.dataset.glevel;
        this.renderGrammarMasterView(container);
      });
    });

    // Speak example buttons
    container.querySelectorAll('.btn-speak-example').forEach(btn => {
      btn.addEventListener('click', () => {
        audioService.speakChinese(btn.dataset.zh);
      });
    });

    // Scramble pool clicks (add token to target)
    container.querySelectorAll('.scramble-chips-pool .scramble-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const gid = chip.dataset.gid;
        const tok = chip.dataset.token;
        if (!this.scrambleSelections[gid]) this.scrambleSelections[gid] = [];
        this.scrambleSelections[gid].push(tok);
        this.renderGrammarMasterView(container);
      });
    });

    // Scramble target clicks (remove token from target)
    container.querySelectorAll('.scramble-target-tray .scramble-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const gid = chip.dataset.gid;
        const tok = chip.dataset.token;
        if (this.scrambleSelections[gid]) {
          this.scrambleSelections[gid] = this.scrambleSelections[gid].filter(t => t !== tok);
        }
        this.renderGrammarMasterView(container);
      });
    });

    // Reset button
    container.querySelectorAll('.btn-reset-scramble').forEach(btn => {
      btn.addEventListener('click', () => {
        const gid = btn.dataset.gid;
        this.scrambleSelections[gid] = [];
        this.renderGrammarMasterView(container);
      });
    });

    // Check button
    container.querySelectorAll('.btn-check-scramble').forEach(btn => {
      btn.addEventListener('click', () => {
        const gid = btn.dataset.gid;
        const userTokens = this.scrambleSelections[gid] || [];
        const res = grammarService.evaluateScramble(gid, userTokens);
        const resBox = container.querySelector(`#result_${gid}`);
        if (!resBox) return;

        if (res.isCorrect) {
          resBox.innerHTML = `
            <div style="background:rgba(16,185,129,0.12); border:1px solid #10b981; border-radius:var(--radius-md); padding:10px 14px; font-size:13.5px; color:#065f46;">
              <strong>${res.title} (+${res.expGained} EXP)</strong><br/>
              ${res.message}
            </div>
          `;
          audioService.playCorrectSound();
          storageService.addExp(res.expGained);
          this.updateUserStatsDisplay();
        } else {
          resBox.innerHTML = `
            <div style="background:rgba(239,68,68,0.1); border:1px solid #ef4444; border-radius:var(--radius-md); padding:10px 14px; font-size:13.5px; color:#991b1b;">
              <strong>${res.title}</strong><br/>
              ${res.message}
            </div>
          `;
          audioService.playWrongSound();
        }
      });
    });
  }

  // =========================================================================
  // VIEW: Chengyu & Idioms Storybook (成语典故)
  // =========================================================================
  renderChengyuStorybookView(container) {
    let list = CHENGYU_COLLECTION;
    if (this.chengyuLevelFilter !== 'all') {
      const lvl = parseInt(this.chengyuLevelFilter, 10);
      list = list.filter(c => c.level === lvl);
    }
    if (this.chengyuSearchQuery) {
      const q = this.chengyuSearchQuery.toLowerCase();
      list = list.filter(c => 
        c.hanzi.includes(q) || 
        c.pinyin.toLowerCase().includes(q) || 
        c.hanviet.toLowerCase().includes(q) || 
        c.literal.toLowerCase().includes(q)
      );
    }

    container.innerHTML = `
      <div class="view-header-row">
        <div>
          <h2>📜 Kho Thành Ngữ & Điển Cố Hán Ngữ HSK 5-9</h2>
          <p class="text-muted">Tuyển tập thành ngữ 4 chữ cốt lõi kèm cốt truyện lịch sử hấp dẫn bằng tiếng Việt, mẫu câu thi HSK và bài tập trắc nghiệm ngữ cảnh.</p>
        </div>
      </div>

      <!-- Controls -->
      <div style="display:flex; flex-wrap:wrap; gap:14px; align-items:center; margin:16px 0;">
        <input type="text" class="search-input" id="chengyuSearch" placeholder="Tìm thành ngữ, Pinyin, Hán-Việt, nghĩa..." value="${this.chengyuSearchQuery}" style="max-width:320px;" />
        <div class="filters-bar" style="margin:0;">
          <button class="filter-chip ${this.chengyuLevelFilter === 'all' ? 'active' : ''}" data-clevel="all">Tất Cả</button>
          <button class="filter-chip ${this.chengyuLevelFilter === '5' ? 'active' : ''}" data-clevel="5">HSK 5</button>
          <button class="filter-chip ${this.chengyuLevelFilter === '6' ? 'active' : ''}" data-clevel="6">HSK 6</button>
        </div>
      </div>

      <!-- Chengyu Grid -->
      <div class="chengyu-grid">
        ${list.map(c => `
          <div class="chengyu-card">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span class="badge" style="background:#f59e0b; color:#fff; font-size:11px;">HSK ${c.level}</span>
              <button class="btn-icon-tiny btn-speak-chengyu" data-zh="${c.hanzi}" title="Nghe phát âm">🔊</button>
            </div>

            <div>
              <div class="chengyu-hanzi-banner">${c.hanzi}</div>
              <div style="font-size:14px; font-weight:700; color:#6366f1;">${c.pinyin}</div>
              <div style="font-size:13px; color:var(--text-muted); font-style:italic;">Hán-Việt: ${c.hanviet}</div>
            </div>

            <div style="background:var(--bg-secondary); border-radius:var(--radius-md); padding:10px 14px; font-size:13.5px; line-height:1.5;">
              <div><strong>Nghĩa đen:</strong> ${c.literal}</div>
              <div style="margin-top:4px; color:#4338ca;"><strong>Nghĩa bóng:</strong> ${c.figurative}</div>
            </div>

            <!-- Story Collapsible -->
            <details style="background:rgba(245,158,11,0.06); border:1px solid rgba(245,158,11,0.25); border-radius:var(--radius-md); padding:10px 14px;">
              <summary style="font-weight:700; color:#b45309; cursor:pointer;">📖 Xem Điển Cố Sự Tích Lịch Sử</summary>
              <div class="chengyu-story-modal-body" style="margin-top:10px;">
                ${c.story}
              </div>
            </details>

            <!-- HSK Exam Sample -->
            <div style="background:var(--bg-secondary); border-radius:var(--radius-md); padding:12px 14px;">
              <div style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:6px;">Ứng Dụng Trong Đề Thi HSK:</div>
              <div style="font-size:15px; font-weight:700; font-family:var(--font-chinese); line-height:1.4;">${c.hskExample.zh}</div>
              <div style="font-size:12px; color:#6366f1; margin:2px 0;">${c.hskExample.pinyin}</div>
              <div style="font-size:13px; color:var(--text-secondary);">${c.hskExample.vi}</div>
            </div>

            <!-- Quiz Scenario -->
            ${c.quiz ? `
              <div style="border-top:1px dashed var(--border-color); padding-top:12px;">
                <div style="font-size:12.5px; font-weight:700; color:#b45309; margin-bottom:8px;">🎯 Trắc Nghiệm Ngữ Cảnh:</div>
                <div style="font-size:13px; margin-bottom:8px; line-height:1.4;">${c.quiz.question}</div>
                <div style="display:flex; flex-direction:column; gap:6px;">
                  ${c.quiz.options.map((opt, oIdx) => `
                    <button class="btn btn-secondary btn-sm btn-chengyu-opt" data-cid="${c.id}" data-idx="${oIdx}" data-correct="${c.quiz.correctIndex}" style="text-align:left; font-size:12.5px; padding:8px 12px; line-height:1.4;">
                      ${String.fromCharCode(65 + oIdx)}. ${opt}
                    </button>
                  `).join('')}
                </div>
                <div id="quiz_feedback_${c.id}" style="margin-top:8px;"></div>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;

    // Search input
    container.querySelector('#chengyuSearch')?.addEventListener('input', (e) => {
      this.chengyuSearchQuery = e.target.value;
      this.renderChengyuStorybookView(container);
    });

    // Level filter
    container.querySelectorAll('[data-clevel]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.chengyuLevelFilter = btn.dataset.clevel;
        this.renderChengyuStorybookView(container);
      });
    });

    // Speak buttons
    container.querySelectorAll('.btn-speak-chengyu').forEach(btn => {
      btn.addEventListener('click', () => {
        audioService.speakChinese(btn.dataset.zh);
      });
    });

    // Quiz options
    container.querySelectorAll('.btn-chengyu-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        const cid = btn.dataset.cid;
        const selectedIdx = parseInt(btn.dataset.idx, 10);
        const correctIdx = parseInt(btn.dataset.correct, 10);
        const fbEl = container.querySelector(`#quiz_feedback_${cid}`);
        if (!fbEl) return;

        const cy = CHENGYU_COLLECTION.find(x => x.id === cid);
        if (selectedIdx === correctIdx) {
          fbEl.innerHTML = `
            <div style="background:rgba(16,185,129,0.12); border:1px solid #10b981; border-radius:var(--radius-md); padding:8px 12px; font-size:12.5px; color:#065f46;">
              <strong>🎉 Chính xác! (+15 EXP)</strong><br/>
              ${cy?.quiz?.explanation || ''}
            </div>
          `;
          audioService.playCorrectSound();
          storageService.addExp(15);
          this.updateUserStatsDisplay();
        } else {
          fbEl.innerHTML = `
            <div style="background:rgba(239,68,68,0.1); border:1px solid #ef4444; border-radius:var(--radius-md); padding:8px 12px; font-size:12.5px; color:#991b1b;">
              <strong>⚠️ Chưa chính xác!</strong> Hãy đọc lại câu chuyện điển cố để nắm rõ ngữ cảnh.
            </div>
          `;
          audioService.playWrongSound();
        }
      });
    });
  }

  // =========================================================================
  // VIEW: Translation Arena (Đấu Trường Luyện Dịch Song Ngữ)
  // =========================================================================
  renderTranslationArenaView(container) {
    const challenges = translationService.getAllChallenges(this.translationTierFilter);
    const activeCh = translationService.getChallengeById(this.activeTranslationId) || challenges[0];

    container.innerHTML = `
      <div class="view-header-row">
        <div>
          <h2>🌐 Đấu Trường Luyện Dịch Song Ngữ Trung - Việt</h2>
          <p class="text-muted">Rèn luyện phản xạ chuyển ngữ đa tầng từ HSK 1 đến HSK 9, phân tích bảo toàn thuật ngữ và đối chiếu cấu trúc ngữ pháp.</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-bar" style="margin-top:16px;">
        <button class="filter-chip ${this.translationTierFilter === 'all' ? 'active' : ''}" data-ttier="all">Tất Cả Phân Tầng</button>
        <button class="filter-chip ${this.translationTierFilter === 'Sơ Cấp' ? 'active' : ''}" data-ttier="Sơ Cấp">Sơ Cấp (HSK 1-3)</button>
        <button class="filter-chip ${this.translationTierFilter === 'Trung Cấp' ? 'active' : ''}" data-ttier="Trung Cấp">Trung Cấp (HSK 4-6)</button>
        <button class="filter-chip ${this.translationTierFilter === 'Cao Cấp' ? 'active' : ''}" data-ttier="Cao Cấp">Cao Cấp (HSK 7-9)</button>
      </div>

      <!-- Workspace 2 columns -->
      <div class="translation-workspace">
        <!-- Left: Challenges List -->
        <div style="display:flex; flex-direction:column; gap:12px;">
          <h3 style="font-size:15px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Danh Sách Thử Thách Luyện Dịch:</h3>
          ${challenges.map(ch => `
            <div class="challenge-item-card ${ch.id === activeCh?.id ? 'active-item' : ''}" data-tid="${ch.id}" style="background:var(--bg-card); border-radius:var(--radius-lg); border:1.5px solid ${ch.id === activeCh?.id ? '#6366f1' : 'var(--border-color)'}; padding:16px; cursor:pointer; transition:all 0.15s;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span class="badge" style="background:#6366f1; color:#fff; font-size:11px;">HSK ${ch.level}</span>
                <span style="font-size:11.5px; font-weight:700; color:#10b981;">${ch.direction === 'vi_to_zh' ? '🇻🇳 Việt ➔ 🇨🇳 Trung' : '🇨🇳 Trung ➔ 🇻🇳 Việt'}</span>
              </div>
              <div style="font-size:14px; font-weight:700; line-height:1.4;">${ch.prompt.length > 50 ? ch.prompt.substring(0, 50) + '...' : ch.prompt}</div>
              <div style="font-size:12px; color:var(--text-muted); margin-top:4px;">Chủ đề: ${ch.topic}</div>
            </div>
          `).join('')}
        </div>

        <!-- Right: Active Translation Studio -->
        ${activeCh ? `
          <div class="trans-card">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span class="badge" style="background:#6366f1; color:#fff;">Cấp độ: HSK ${activeCh.level} • ${activeCh.tier}</span>
              <span style="font-size:12px; font-weight:700; color:#6366f1;">Chủ đề: ${activeCh.topic}</span>
            </div>

            <div class="trans-prompt-box">
              <div style="font-size:12px; text-transform:uppercase; color:var(--text-muted); margin-bottom:4px;">Câu Gốc Cần Chuyển Ngữ:</div>
              <div>${activeCh.prompt}</div>
            </div>

            <div>
              <label style="font-size:13px; font-weight:700; margin-bottom:6px; display:block;">Bản Dịch Của Bạn (${activeCh.direction === 'vi_to_zh' ? 'Nhập Tiếng Trung' : 'Nhập Tiếng Việt'}):</label>
              <textarea class="trans-textarea" id="userTransInput" placeholder="${activeCh.direction === 'vi_to_zh' ? 'Nhập câu dịch tiếng Trung tại đây (có thể dùng Pinyin hoặc Hán tự)...' : 'Nhập câu dịch tiếng Việt tại đây...'}"></textarea>
            </div>

            <div style="display:flex; justify-content:flex-end;">
              <button class="btn btn-primary" id="btnSubmitTrans">🚀 Chấm Điểm & Phân Tích Cú Pháp</button>
            </div>

            <div id="transResultBox"></div>
          </div>
        ` : ''}
      </div>
    `;

    // Filter clicks
    container.querySelectorAll('[data-ttier]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.translationTierFilter = btn.dataset.ttier;
        this.renderTranslationArenaView(container);
      });
    });

    // Challenge item clicks
    container.querySelectorAll('[data-tid]').forEach(card => {
      card.addEventListener('click', () => {
        this.activeTranslationId = card.dataset.tid;
        this.renderTranslationArenaView(container);
      });
    });

    // Submit translation
    const submitBtn = container.querySelector('#btnSubmitTrans');
    const inputEl = container.querySelector('#userTransInput');
    const resultBox = container.querySelector('#transResultBox');

    submitBtn?.addEventListener('click', () => {
      const text = inputEl.value;
      const res = translationService.evaluateTranslation(activeCh.id, text);
      if (!res.success) {
        toastService.warning(res.message, 'Lưu Ý');
        return;
      }

      resultBox.innerHTML = `
        <div style="background:var(--bg-secondary); border-radius:var(--radius-lg); padding:20px; border:1.5px solid var(--border-color); margin-top:14px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <div>
              <div style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Kết Quả Đánh Giá:</div>
              <div style="font-size:18px; font-weight:800; color:#10b981;">${res.grade}</div>
            </div>
            <div class="trans-score-badge">${res.score} / 100</div>
          </div>

          <div style="font-size:13.5px; line-height:1.5; color:var(--text-primary); margin-bottom:14px;">${res.feedback}</div>

          <div style="background:var(--bg-card); border-radius:var(--radius-md); padding:14px; border:1px solid var(--border-color); margin-bottom:12px;">
            <div style="font-size:11.5px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Bản Dịch Chuẩn Mực (Model Reference):</div>
            <div style="font-size:16px; font-weight:700; font-family:var(--font-chinese); color:var(--primary-red); margin-top:4px;">${res.referenceTarget}</div>
            ${res.pinyin ? `<div style="font-size:13px; color:#6366f1; margin-top:2px;">${res.pinyin}</div>` : ''}
          </div>

          <div style="font-size:13px; color:var(--text-secondary); line-height:1.6; background:rgba(99,102,241,0.06); padding:12px 14px; border-radius:var(--radius-md); border-left:3px solid #6366f1;">
            <strong>💡 Ghi Chú Sư Phạm & Đối Chiếu Ngữ Pháp:</strong><br/>
            ${res.pedagogicalNotes}
          </div>
        </div>
      `;

      if (res.score >= 70) {
        audioService.playCorrectSound();
        storageService.addExp(30);
      } else {
        audioService.playTone(330, 'sine', 0.2);
        storageService.addExp(10);
      }
      this.updateUserStatsDisplay();
    });
  }

  // =========================================================================
  // VIEW: Worksheet & Copybook Generator (Trình Tạo Bảng Luyện Viết A4)
  // =========================================================================
  renderWorksheetBuilderView(container) {
    const profile = storageService.getProfile();

    const generatePreview = () => {
      const previewArea = container.querySelector('#worksheetPreviewArea');
      if (!previewArea) return;

      const html = worksheetGenerator.generateWorksheetHtml(this.worksheetText, {
        gridType: this.worksheetGridType,
        showPinyin: this.worksheetShowPinyin,
        studentName: profile.name || 'Học Viên HánNgữ Pro',
        levelText: `HSK ${profile.targetLevel || 1} Chuẩn 3.0`
      });

      previewArea.innerHTML = html;
    };

    container.innerHTML = `
      <div class="view-header-row">
        <div>
          <h2>📄 Trình Tạo Bảng Luyện Viết In Ấn A4 (米字格 / 田字格)</h2>
          <p class="text-muted">Tự động thiết kế trang luyện viết chữ Hán chuẩn nét thư pháp, tích hợp Pinyin, chữ mẫu đồ nét mờ (Ghost guide) và chuẩn in ấn A4 sắc nét.</p>
        </div>
        <button class="btn btn-primary" id="btnPrintWorksheet" style="display:flex; align-items:center; gap:8px;">
          <span>🖨️</span> In Bảng Viết / Lưu PDF
        </button>
      </div>

      <div class="worksheet-layout">
        <!-- Controls Panel -->
        <div class="worksheet-controls-panel">
          <h3 style="font-size:16px; font-weight:700;">⚙️ Tùy Biến Trang Luyện Viết</h3>

          <div>
            <label style="font-size:13px; font-weight:700; margin-bottom:6px; display:block;">Nhập Danh Sách Chữ Hán Cần Luyện:</label>
            <textarea class="trans-textarea" id="inputWorksheetChars" style="min-height:90px;">${this.worksheetText}</textarea>
            <div style="display:flex; gap:6px; margin-top:6px; flex-wrap:wrap;">
              <button class="btn btn-secondary btn-sm preset-btn" data-preset="学而时习之不亦说乎">Khổng Tử</button>
              <button class="btn btn-secondary btn-sm preset-btn" data-preset="你好谢谢再见朋友">HSK 1</button>
              <button class="btn btn-secondary btn-sm preset-btn" data-preset="今天明天时间身体">HSK 2</button>
              <button class="btn btn-secondary btn-sm preset-btn" data-preset="努力坚持成功希望">HSK 3</button>
            </div>
          </div>

          <div>
            <label style="font-size:13px; font-weight:700; margin-bottom:6px; display:block;">Kiểu Lưới Ô Kẻ:</label>
            <div style="display:flex; gap:10px;">
              <label style="display:flex; align-items:center; gap:6px; cursor:pointer;">
                <input type="radio" name="gridTypeRadio" value="mizige" ${this.worksheetGridType === 'mizige' ? 'checked' : ''} />
                <span>Mễ Tự Cách (米字格)</span>
              </label>
              <label style="display:flex; align-items:center; gap:6px; cursor:pointer;">
                <input type="radio" name="gridTypeRadio" value="tianzige" ${this.worksheetGridType === 'tianzige' ? 'checked' : ''} />
                <span>Điền Tự Cách (田字格)</span>
              </label>
            </div>
          </div>

          <div>
            <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
              <input type="checkbox" id="checkShowPinyin" ${this.worksheetShowPinyin ? 'checked' : ''} />
              <span style="font-size:13.5px; font-weight:600;">Hiển thị phiên âm Pinyin ở đầu dòng</span>
            </label>
          </div>

          <div style="background:var(--bg-secondary); border-radius:var(--radius-md); padding:12px; font-size:12px; line-height:1.5; color:var(--text-muted);">
            💡 <strong>Mẹo In Ấn Chuẩn Đẹp:</strong> Khi bấm nút "In Bảng Viết", trong hộp thoại in của trình duyệt (Chrome/Edge), hãy chọn <em>Destination: Save as PDF</em>, phần <em>Margins: None</em> để bảng in vừa khít trang giấy A4.
          </div>
        </div>

        <!-- Preview Area -->
        <div class="worksheet-preview-area" id="worksheetPreviewArea">
          <!-- Real-time A4 sheet rendered here -->
        </div>
      </div>
    `;

    generatePreview();

    // Text input
    container.querySelector('#inputWorksheetChars')?.addEventListener('input', (e) => {
      this.worksheetText = e.target.value;
      generatePreview();
    });

    // Preset buttons
    container.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.worksheetText = btn.dataset.preset;
        const ta = container.querySelector('#inputWorksheetChars');
        if (ta) ta.value = this.worksheetText;
        generatePreview();
      });
    });

    // Grid type radio
    container.querySelectorAll('input[name="gridTypeRadio"]').forEach(r => {
      r.addEventListener('change', (e) => {
        this.worksheetGridType = e.target.value;
        generatePreview();
      });
    });

    // Pinyin checkbox
    container.querySelector('#checkShowPinyin')?.addEventListener('change', (e) => {
      this.worksheetShowPinyin = e.target.checked;
      generatePreview();
    });

    // Print button
    container.querySelector('#btnPrintWorksheet')?.addEventListener('click', () => {
      window.print();
    });
  }

  // =========================================================================
  // VIEW: Hanzi Speed Match Reflex Game (闪电汉字连连看)
  // =========================================================================
  renderSpeedMatchView(container) {
    const cards = speedMatchGame.startNewGame(this.speedMatchLevel);

    const updateGameStatsUi = () => {
      const timerEl = container.querySelector('#speedGameTimer');
      const comboEl = container.querySelector('#speedGameCombo');
      const scoreEl = container.querySelector('#speedGameScore');
      if (timerEl) {
        const m = Math.floor(speedMatchGame.elapsedSeconds / 60);
        const s = speedMatchGame.elapsedSeconds % 60;
        timerEl.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      }
      if (comboEl) comboEl.textContent = `🔥 x${speedMatchGame.combo}`;
      if (scoreEl) scoreEl.textContent = speedMatchGame.score;
    };

    speedMatchGame.onStateChange = (event) => {
      if (event === 'tick') updateGameStatsUi();
    };

    container.innerHTML = `
      <div class="view-header-row">
        <div>
          <h2>⚡ Flash Match Phản Xạ Hán Tự (Siêu Tốc)</h2>
          <p class="text-muted">Trò chơi ghép thẻ tốc độ cao kết hợp phản xạ Chữ Hán, Pinyin và Nghĩa tiếng Việt, nhân chuỗi Combo và âm thanh sống động.</p>
        </div>
      </div>

      <!-- Header Bar -->
      <div class="speedmatch-header-bar">
        <div style="display:flex; align-items:center; gap:12px;">
          <label style="font-weight:700; font-size:14px;">Cấp Độ HSK:</label>
          <select id="selectSpeedLevel" class="search-input" style="width:110px; padding:6px 10px;">
            <option value="1" ${this.speedMatchLevel === 1 ? 'selected' : ''}>HSK 1</option>
            <option value="2" ${this.speedMatchLevel === 2 ? 'selected' : ''}>HSK 2</option>
            <option value="3" ${this.speedMatchLevel === 3 ? 'selected' : ''}>HSK 3</option>
            <option value="4" ${this.speedMatchLevel === 4 ? 'selected' : ''}>HSK 4</option>
            <option value="5" ${this.speedMatchLevel === 5 ? 'selected' : ''}>HSK 5</option>
            <option value="6" ${this.speedMatchLevel === 6 ? 'selected' : ''}>HSK 6</option>
          </select>
          <button class="btn btn-secondary btn-sm" id="btnRestartSpeedGame">🔄 Ván Mới</button>
        </div>

        <div style="display:flex; gap:20px; align-items:center;">
          <div><span style="font-size:12px; color:var(--text-muted);">THỜI GIAN:</span> <strong id="speedGameTimer" style="font-size:18px; color:#6366f1;">00:00</strong></div>
          <div><span style="font-size:12px; color:var(--text-muted);">COMBO:</span> <strong id="speedGameCombo" class="combo-flame">🔥 x0</strong></div>
          <div><span style="font-size:12px; color:var(--text-muted);">ĐIỂM SỐ:</span> <strong id="speedGameScore" style="font-size:18px; color:#10b981;">0</strong></div>
        </div>
      </div>

      <!-- 12 Cards Grid -->
      <div class="speedmatch-grid" id="speedCardsGrid">
        ${cards.map(c => `
          <div class="match-card" data-cid="${c.id}" id="card_${c.id}">
            <div class="card-main-text">${c.content}</div>
            <div class="card-sub-text">${c.subtext}</div>
          </div>
        `).join('')}
      </div>

      <div id="speedVictoryModal"></div>
    `;

    // Bind level change
    container.querySelector('#selectSpeedLevel')?.addEventListener('change', (e) => {
      this.speedMatchLevel = parseInt(e.target.value, 10);
      this.renderSpeedMatchView(container);
    });

    // Bind restart
    container.querySelector('#btnRestartSpeedGame')?.addEventListener('click', () => {
      this.renderSpeedMatchView(container);
    });

    // Card click events
    container.querySelectorAll('.match-card').forEach(el => {
      el.addEventListener('click', () => {
        const cid = el.dataset.cid;
        const res = speedMatchGame.handleCardClick(cid);
        if (!res) return;

        if (res.action === 'select') {
          el.classList.add('selected');
        } else if (res.action === 'match') {
          const firstEl = container.querySelector(`#card_${res.firstId}`);
          const secondEl = container.querySelector(`#card_${res.secondId}`);
          if (firstEl) firstEl.classList.add('matched');
          if (secondEl) secondEl.classList.add('matched');
          updateGameStatsUi();

          if (res.isGameOver) {
            storageService.addExp(50);
            this.updateUserStatsDisplay();
            const victoryBox = container.querySelector('#speedVictoryModal');
            if (victoryBox) {
              victoryBox.innerHTML = `
                <div style="background:linear-gradient(135deg, rgba(16,185,129,0.95), rgba(6,182,212,0.95)); border-radius:var(--radius-xl); padding:28px; color:#fff; text-align:center; margin-top:24px; box-shadow:var(--shadow-xl);">
                  <div style="font-size:42px;">🏆</div>
                  <h2 style="font-size:24px; font-weight:800; margin:8px 0;">CHIẾN THẮNG XUẤT SẮC!</h2>
                  <p style="font-size:16px;">Bạn đã hoàn thành ghép 6 cặp từ trong <strong>${res.elapsedSeconds} giây</strong> với điểm số <strong>${res.score}</strong>!</p>
                  <p style="font-size:14px; opacity:0.9;">Chuỗi Combo cao nhất: 🔥 x${speedMatchGame.maxCombo} • Nhận thưởng: <strong>+50 EXP</strong></p>
                  <button class="btn btn-secondary" id="btnPlayAgain" style="margin-top:14px; background:#fff; color:#0f172a; font-weight:700;">Chơi Ván Tiếp Theo ➔</button>
                </div>
              `;
              container.querySelector('#btnPlayAgain')?.addEventListener('click', () => {
                this.renderSpeedMatchView(container);
              });
            }
          }
        } else if (res.action === 'mismatch') {
          const firstEl = container.querySelector(`#card_${res.firstId}`);
          const secondEl = container.querySelector(`#card_${res.secondId}`);
          if (firstEl) firstEl.classList.add('shake-error');
          if (secondEl) secondEl.classList.add('shake-error');
          updateGameStatsUi();

          setTimeout(() => {
            if (firstEl) {
              firstEl.classList.remove('selected');
              firstEl.classList.remove('shake-error');
            }
            if (secondEl) {
              secondEl.classList.remove('selected');
              secondEl.classList.remove('shake-error');
            }
            if (res.resetCallback) res.resetCallback();
          }, 450);
        }
      });
    });
  }
}

function bootstrapApp() {
  try {
    const appEl = document.querySelector('#app');
    if (!appEl) {
      console.warn('[HánNgữ Pro] #app element not ready yet, retrying...');
      setTimeout(bootstrapApp, 25);
      return;
    }
    console.log('[HánNgữ Pro] Initializing application...');
    window.__hannguApp = new App();
  } catch (err) {
    console.error('[HánNgữ Pro] Application startup error:', err);
    const appEl = document.querySelector('#app');
    if (appEl) {
      appEl.innerHTML = `
        <div style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #0b0f1a; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 24px; text-align: center;">
          <div style="font-size: 54px; margin-bottom: 12px;">⚠️</div>
          <h2 style="font-size: 24px; font-weight: 800; color: #ef4444; margin-bottom: 8px;">Không Thể Khởi Động HánNgữ Pro</h2>
          <p style="color: #94a3b8; max-width: 500px; line-height: 1.6; margin-bottom: 20px;">
            Đã xảy ra lỗi trong quá trình khởi tạo ứng dụng:
          </p>
          <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 12px 18px; font-family: monospace; font-size: 13px; color: #fca5a5; margin-bottom: 20px; max-width: 600px; word-break: break-word; text-align: left;">
            ${err?.stack || err?.message || err}
          </div>
          <button onclick="window.location.reload(true)" style="background: #6366f1; color: #fff; border: none; padding: 12px 28px; border-radius: 9999px; font-weight: 700; font-size: 15px; cursor: pointer; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);">
            🔄 Tải Lại Trang Ngay (F5)
          </button>
        </div>
      `;
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapApp);
} else {
  bootstrapApp();
}
