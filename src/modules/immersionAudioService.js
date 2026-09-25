/**
 * HánNgữ Pro - Hands-Free Immersion Audio Player
 * Đài phát thanh luyện nghe thụ động, tự động đọc chữ Hán -> dịch nghĩa tiếng Việt,
 * hỗ trợ chỉnh tốc độ, hẹn giờ tắt (Sleep Timer) và chế độ học lái xe/nghỉ ngơi.
 */

import { audioService } from './audioService.js';
import { HSK_VOCABULARY } from '../data/hskData.js';
import { SITUATIONAL_DIALOGUES } from '../data/dialoguesData.js';

class ImmersionAudioService {
  constructor() {
    this.playlist = [];
    this.currentIndex = 0;
    this.isPlaying = false;
    this.playbackRate = 1.0;
    this.sleepTimerId = null;
    this.sleepMinutesLeft = 0;
    this.onTrackChange = null;
    this.onStateChange = null;
    this.isBilingualMode = true; // Read Chinese then Vietnamese
    this.loopMode = 'playlist'; // 'playlist', 'single', 'shuffle'

    this.loadPlaylist('hsk1');
  }

  loadPlaylist(source = 'hsk1') {
    this.stop();
    this.currentIndex = 0;

    if (source.startsWith('hsk')) {
      const lvl = parseInt(source.replace('hsk', ''), 10) || 1;
      const vocab = HSK_VOCABULARY[lvl] || HSK_VOCABULARY[1];
      this.playlist = vocab.map(v => ({
        id: v.hanzi,
        title: v.hanzi,
        subtitle: `${v.pinyin} • ${v.hanviet || ''}`,
        translation: v.meaning,
        level: lvl,
        example: v.example || '',
        exampleMeaning: v.exampleMeaning || ''
      }));
    } else if (source === 'dialogues') {
      const items = [];
      SITUATIONAL_DIALOGUES.forEach(d => {
        d.turns.forEach(t => {
          items.push({
            id: t.zh,
            title: t.zh,
            subtitle: `${t.speaker} • ${t.pinyin}`,
            translation: t.vi,
            context: d.title
          });
        });
      });
      this.playlist = items;
    }

    if (this.onTrackChange && this.playlist.length > 0) {
      this.onTrackChange(this.getCurrentTrack());
    }
  }

  getCurrentTrack() {
    return this.playlist[this.currentIndex] || null;
  }

  async play() {
    if (this.playlist.length === 0) return;
    this.isPlaying = true;
    if (this.onStateChange) this.onStateChange(true);
    this.playStep();
  }

  pause() {
    this.isPlaying = false;
    try {
      if (audioService && typeof audioService.stop === 'function') {
        audioService.stop();
      } else if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } catch (e) {
      console.warn('[ImmersionAudio] pause notice:', e);
    }
    if (this.onStateChange) this.onStateChange(false);
  }

  stop() {
    this.isPlaying = false;
    try {
      if (audioService && typeof audioService.stop === 'function') {
        audioService.stop();
      } else if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } catch (e) {
      console.warn('[ImmersionAudio] stop notice:', e);
    }
    if (this.onStateChange) this.onStateChange(false);
  }

  next() {
    if (this.playlist.length === 0) return;
    if (this.loopMode === 'shuffle') {
      this.currentIndex = Math.floor(Math.random() * this.playlist.length);
    } else {
      this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
    }

    if (this.onTrackChange) this.onTrackChange(this.getCurrentTrack());
    if (this.isPlaying) {
      this.playStep();
    }
  }

  prev() {
    if (this.playlist.length === 0) return;
    this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
    if (this.onTrackChange) this.onTrackChange(this.getCurrentTrack());
    if (this.isPlaying) {
      this.playStep();
    }
  }

  setSpeed(rate) {
    this.playbackRate = rate;
  }

  setSleepTimer(minutes) {
    if (this.sleepTimerId) {
      clearInterval(this.sleepTimerId);
      this.sleepTimerId = null;
    }

    this.sleepMinutesLeft = minutes;
    if (minutes > 0) {
      this.sleepTimerId = setInterval(() => {
        this.sleepMinutesLeft--;
        if (this.sleepMinutesLeft <= 0) {
          clearInterval(this.sleepTimerId);
          this.sleepTimerId = null;
          this.pause();
        }
      }, 60000);
    }
  }

  async playStep() {
    if (!this.isPlaying) return;
    const track = this.getCurrentTrack();
    if (!track) return;

    if (this.onTrackChange) this.onTrackChange(track);

    // Speak Chinese text
    await this.speakPromise(track.title, 'zh-CN', this.playbackRate);
    if (!this.isPlaying) return;

    // Small breathing pause
    await new Promise(r => setTimeout(r, 600));
    if (!this.isPlaying) return;

    // If bilingual mode, speak Vietnamese translation using Vietnamese voice or polite notification
    if (this.isBilingualMode && track.translation) {
      await this.speakPromise(track.translation, 'vi-VN', this.playbackRate);
      if (!this.isPlaying) return;
    }

    // Interval before next track (1.5 seconds)
    await new Promise(r => setTimeout(r, 1400));
    if (!this.isPlaying) return;

    this.next();
  }

  speakPromise(text, lang = 'zh-CN', rate = 1.0) {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) {
        setTimeout(resolve, 1500);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate;

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);
    });
  }
}

export const immersionAudioService = new ImmersionAudioService();
