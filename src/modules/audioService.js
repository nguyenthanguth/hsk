/**
 * HánNgữ Pro - Audio Service
 * Web Speech Synthesis (Phát âm tiếng Trung chuẩn Bắc Kinh) &
 * Web Audio API Tone Synthesizer (Mô phỏng chính xác đường cao độ 5-5, 3-5, 2-1-4, 5-1)
 */

class AudioService {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.audioCtx = null;
    this.chineseVoice = null;
    this.initVoice();
  }

  getAudioContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  initVoice() {
    if (!this.synth) return;
    try {
      const loadVoices = () => {
        try {
          const voices = this.synth.getVoices ? this.synth.getVoices() : [];
          if (Array.isArray(voices)) {
            this.chineseVoice = voices.find(v => v.lang && v.lang.startsWith('zh-CN')) ||
                                voices.find(v => v.lang && v.lang.startsWith('zh')) ||
                                voices.find(v => v.name && v.name.toLowerCase().includes('chinese'));
          }
        } catch (err) {
          console.warn('[AudioService] Voices loading warning:', err);
        }
      };

      loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = loadVoices;
      }
    } catch (e) {
      console.warn('[AudioService] initVoice fallback:', e);
    }
  }

  /**
   * Speak Chinese text using Native Web Speech API
   * @param {string} text - Chinese text to speak
   * @param {number} rate - Speech rate (0.8 = slow/clear, 1.0 = normal)
   */
  speak(text, rate = 0.85) {
    if (!this.synth) {
      console.warn('Web Speech API is not supported in this browser.');
      return;
    }

    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = rate;
    utterance.pitch = 1.0;

    if (this.chineseVoice) {
      utterance.voice = this.chineseVoice;
    }

    this.synth.speak(utterance);
  }

  /**
   * Play pitch curve using Web Audio API for Tone Training
   * @param {number} tone - Tone number: 1, 2, 3, 4, 0
   */
  playTonePitch(tone) {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.3, now + 0.05);

    switch (tone) {
      case 1: // 5-5 (Cao, phẳng: 340Hz)
        osc.frequency.setValueAtTime(340, now);
        osc.frequency.setValueAtTime(340, now + 0.6);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
        osc.start(now);
        osc.stop(now + 0.65);
        break;

      case 2: // 3-5 (Vút lên: 240Hz -> 340Hz)
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(340, now + 0.55);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.58);
        osc.start(now);
        osc.stop(now + 0.58);
        break;

      case 3: // 2-1-4 (Trầm đáy rồi vểnh lên: 230Hz -> 170Hz -> 270Hz)
        osc.frequency.setValueAtTime(230, now);
        osc.frequency.exponentialRampToValueAtTime(170, now + 0.28);
        osc.frequency.exponentialRampToValueAtTime(270, now + 0.68);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.72);
        osc.start(now);
        osc.stop(now + 0.72);
        break;

      case 4: // 5-1 (Rơi mạnh: 350Hz -> 170Hz)
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.exponentialRampToValueAtTime(170, now + 0.42);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
        break;

      default: // Thanh nhẹ (230Hz ngắn)
        osc.frequency.setValueAtTime(230, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
        break;
    }
  }

  /**
   * Sound effects: Success chime, Error buzz, Level Up Fanfare
   */
  playFeedback(type = 'success') {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(180, now + 0.12);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'fanfare') {
      // Short victory fanfare
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'triangle';
        o.frequency.value = freq;
        o.connect(g);
        g.connect(ctx.destination);
        const startTime = now + i * 0.12;
        g.gain.setValueAtTime(0.12, startTime);
        g.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
        o.start(startTime);
        o.stop(startTime + 0.25);
      });
    }
  }

  /**
   * Stop any ongoing speech synthesis or audio
   */
  stop() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {
        console.warn('[AudioService] stop error:', e);
      }
    }
  }

  /**
   * Alias for speak Chinese text
   */
  speakChinese(text, rate = 0.85) {
    this.speak(text, rate);
  }

  /**
   * Play correct sound effect
   */
  playCorrectSound() {
    this.playFeedback('success');
  }

  /**
   * Play wrong sound effect
   */
  playWrongSound() {
    this.playFeedback('error');
  }
}

export const audioService = new AudioService();
