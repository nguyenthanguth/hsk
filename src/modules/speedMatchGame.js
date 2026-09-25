/**
 * HánNgữ Pro - Hanzi Speed Match Game (闪电汉字连连看)
 * High-speed interactive memory reflex matching game for Hanzi, Pinyin, and Vietnamese meanings.
 * Features Web Audio synthesized sound effects, combo multipliers, and SQLite high-score persistence.
 */

import { sqliteService } from './sqliteDb.js';

export class SpeedMatchGame {
  constructor() {
    this.cards = [];
    this.selectedCards = [];
    this.matchedCount = 0;
    this.totalPairs = 6;
    this.combo = 0;
    this.maxCombo = 0;
    this.score = 0;
    this.startTime = null;
    this.timerInterval = null;
    this.elapsedSeconds = 0;
    this.isLocked = false;
    this.onStateChange = null;
    this.audioCtx = null;
    this.initSound();
  }

  initSound() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    } catch {
      // AudioContext not available
    }
  }

  playTone(freq, type = 'sine', duration = 0.15) {
    if (!this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Tone play error:', e);
    }
  }

  playMatchSound() {
    this.playTone(523.25, 'triangle', 0.1); // C5
    setTimeout(() => this.playTone(659.25, 'triangle', 0.15), 80); // E5
    setTimeout(() => this.playTone(783.99, 'triangle', 0.25), 160); // G5
  }

  playMismatchSound() {
    this.playTone(220, 'sawtooth', 0.18); // A3 low buzz
  }

  playVictorySound() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.25), idx * 120);
    });
  }

  startNewGame(level = 1) {
    this.resetState();
    
    // Query words from SQLite
    let words = [];
    try {
      words = sqliteService.query(`
        SELECT hanzi, pinyin, meaning FROM dictionary
        WHERE level = ? AND length(hanzi) <= 4
        ORDER BY RANDOM() LIMIT 6;
      `, [level]);
    } catch (e) {
      console.warn('[SpeedMatch] SQLite query error, fallback:', e);
    }

    if (!words || words.length < 6) {
      words = [
        { hanzi: '苹果', pinyin: 'píngguǒ', meaning: 'Quả táo' },
        { hanzi: '飞机', pinyin: 'fēijī', meaning: 'Máy bay' },
        { hanzi: '学校', pinyin: 'xuéxiào', meaning: 'Trường học' },
        { hanzi: '朋友', pinyin: 'péngyou', meaning: 'Bạn bè' },
        { hanzi: '喜欢', pinyin: 'xǐhuan', meaning: 'Thích' },
        { hanzi: '医生', pinyin: 'yīshēng', meaning: 'Bác sĩ' }
      ];
    }

    // Build pairs: Hanzi card & Meaning/Pinyin card
    const cardDeck = [];
    words.forEach((w, index) => {
      const pairId = `pair_${index}`;
      // Card A: Hanzi
      cardDeck.push({
        id: `${pairId}_hanzi`,
        pairId,
        type: 'hanzi',
        content: w.hanzi,
        subtext: 'Hán Tự'
      });
      // Card B: Pinyin + Meaning
      cardDeck.push({
        id: `${pairId}_meta`,
        pairId,
        type: 'meta',
        content: w.pinyin,
        subtext: w.meaning
      });
    });

    // Shuffle deck
    this.cards = this.shuffleArray(cardDeck);
    this.startTime = Date.now();
    this.startTimer();
    return this.cards;
  }

  shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.startTime) {
        this.elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
        if (this.onStateChange) this.onStateChange('tick', { elapsedSeconds: this.elapsedSeconds });
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  resetState() {
    this.stopTimer();
    this.cards = [];
    this.selectedCards = [];
    this.matchedCount = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.score = 0;
    this.startTime = null;
    this.elapsedSeconds = 0;
    this.isLocked = false;
  }

  handleCardClick(cardId) {
    if (this.isLocked) return null;
    const card = this.cards.find(c => c.id === cardId);
    if (!card || card.isMatched || card.isSelected) return null;

    card.isSelected = true;
    this.selectedCards.push(card);

    if (this.selectedCards.length === 1) {
      this.playTone(440, 'sine', 0.08); // A4 tap
      return { action: 'select', cardId };
    }

    if (this.selectedCards.length === 2) {
      this.isLocked = true;
      const [first, second] = this.selectedCards;

      if (first.pairId === second.pairId) {
        // MATCH!
        this.matchedCount++;
        this.combo++;
        if (this.combo > this.maxCombo) this.maxCombo = this.combo;

        const comboBonus = (this.combo - 1) * 50;
        this.score += (100 + comboBonus);

        first.isMatched = true;
        second.isMatched = true;
        first.isSelected = false;
        second.isSelected = false;
        this.selectedCards = [];
        this.isLocked = false;

        this.playMatchSound();

        const isGameOver = this.matchedCount >= this.totalPairs;
        if (isGameOver) {
          this.stopTimer();
          this.playVictorySound();
          this.recordGameResult();
        }

        return {
          action: 'match',
          firstId: first.id,
          secondId: second.id,
          combo: this.combo,
          score: this.score,
          isGameOver,
          elapsedSeconds: this.elapsedSeconds
        };
      } else {
        // MISMATCH!
        this.combo = 0;
        this.playMismatchSound();

        return {
          action: 'mismatch',
          firstId: first.id,
          secondId: second.id,
          resetCallback: () => {
            first.isSelected = false;
            second.isSelected = false;
            this.selectedCards = [];
            this.isLocked = false;
          }
        };
      }
    }
    return null;
  }

  recordGameResult() {
    try {
      sqliteService.run(`
        INSERT INTO study_logs (action, exp_gained, notes)
        VALUES (?, ?, ?);
      `, ['Speed Match Game', 50, `Ghép hoàn thành trong ${this.elapsedSeconds}s, Combo cao nhất: ${this.maxCombo}`]);
    } catch (e) {
      console.warn('Record game log error:', e);
    }
  }
}

export const speedMatchGame = new SpeedMatchGame();
