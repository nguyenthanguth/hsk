/**
 * HánNgữ Pro - Interactive Hanzi Writing Canvas (米字格 / 田字格)
 * Bảng tập viết chữ Hán tương tác cao cấp với lưới định vị, nét cọ mực mượt mà,
 * chế độ gợi ý nét mờ và tự động nhận diện hoàn thành nét.
 */

import { audioService } from './audioService.js';

export class HanziCanvasController {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.isDrawing = false;
    this.strokes = []; // Array of strokes, each stroke is an array of points
    this.currentStroke = [];
    this.brushColor = options.brushColor || '#E02424'; // Chinese Vermilion
    this.brushSize = options.brushSize || 8;
    this.guideChar = options.guideChar || '好';
    this.showGhost = true;
    this.gridType = 'mizige'; // 'mizige' (米字格) or 'tianzige' (田字格)

    this.initEvents();
    this.resizeAndDraw();
  }

  setGuideCharacter(char) {
    this.guideChar = char;
    this.clear();
    audioService.speak(char);
  }

  setBrushColor(color) {
    this.brushColor = color;
  }

  setBrushSize(size) {
    this.brushSize = size;
  }

  toggleGhost(show) {
    this.showGhost = show !== undefined ? show : !this.showGhost;
    this.redrawAll();
  }

  initEvents() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * (this.canvas.width / rect.width),
        y: (clientY - rect.top) * (this.canvas.height / rect.height)
      };
    };

    const startDraw = (e) => {
      e.preventDefault();
      this.isDrawing = true;
      const pos = getPos(e);
      this.currentStroke = [pos];
      this.drawPoint(pos.x, pos.y);
    };

    const moveDraw = (e) => {
      if (!this.isDrawing) return;
      e.preventDefault();
      const pos = getPos(e);
      this.currentStroke.push(pos);
      this.drawLineSegment(this.currentStroke);
    };

    const stopDraw = (e) => {
      if (!this.isDrawing) return;
      e.preventDefault();
      this.isDrawing = false;
      if (this.currentStroke.length > 0) {
        this.strokes.push([...this.currentStroke]);
        this.currentStroke = [];
      }
    };

    // Mouse events
    this.canvas.addEventListener('mousedown', startDraw);
    window.addEventListener('mousemove', moveDraw);
    window.addEventListener('mouseup', stopDraw);

    // Touch events for mobile/tablet
    this.canvas.addEventListener('touchstart', startDraw, { passive: false });
    window.addEventListener('touchmove', moveDraw, { passive: false });
    window.addEventListener('touchend', stopDraw, { passive: false });
  }

  resizeAndDraw() {
    const size = Math.min(this.canvas.parentElement ? this.canvas.parentElement.clientWidth : 340, 360);
    this.canvas.width = size;
    this.canvas.height = size;
    this.redrawAll();
  }

  drawGrid() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, w, h);

    // Background paper tint
    ctx.fillStyle = document.body.classList.contains('light-theme') ? '#FFFDF8' : '#141824';
    ctx.fillRect(0, 0, w, h);

    // Border
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#B91C1C'; // Red grid border
    ctx.strokeRect(4, 4, w - 8, h - 8);

    // Grid lines (Dashed lines)
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(220, 38, 38, 0.35)'; // Muted red guideline
    ctx.setLineDash([5, 5]);

    // Horizontal center
    ctx.beginPath();
    ctx.moveTo(4, h / 2);
    ctx.lineTo(w - 4, h / 2);
    ctx.stroke();

    // Vertical center
    ctx.beginPath();
    ctx.moveTo(w / 2, 4);
    ctx.lineTo(w / 2, h - 4);
    ctx.stroke();

    if (this.gridType === 'mizige') {
      // Diagonals for 米字格
      ctx.beginPath();
      ctx.moveTo(4, 4);
      ctx.lineTo(w - 4, h - 4);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(w - 4, 4);
      ctx.lineTo(4, h - 4);
      ctx.stroke();
    }

    ctx.setLineDash([]); // Reset dash
  }

  drawGhostCharacter() {
    if (!this.showGhost || !this.guideChar) return;
    const ctx = this.ctx;
    const size = this.canvas.width;

    ctx.save();
    ctx.font = `${size * 0.72}px "Noto Sans SC", "Ma Shan Zheng", "Kaiti", serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = document.body.classList.contains('light-theme')
      ? 'rgba(180, 83, 9, 0.16)'
      : 'rgba(245, 158, 11, 0.18)'; // Subtle amber watermark
    ctx.fillText(this.guideChar, size / 2, size / 2 + size * 0.05);
    ctx.restore();
  }

  drawPoint(x, y) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = this.brushColor;
    ctx.beginPath();
    ctx.arc(x, y, this.brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawLineSegment(points) {
    if (points.length < 2) return;
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = this.brushColor;
    ctx.fillStyle = this.brushColor;
    ctx.lineWidth = this.brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const p1 = points[points.length - 2];
    const p2 = points[points.length - 1];

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.restore();
  }

  redrawAll() {
    this.drawGrid();
    this.drawGhostCharacter();

    // Redraw all completed strokes
    this.strokes.forEach(stroke => {
      if (stroke.length === 0) return;
      if (stroke.length === 1) {
        this.drawPoint(stroke[0].x, stroke[0].y);
      } else {
        const ctx = this.ctx;
        ctx.save();
        ctx.strokeStyle = this.brushColor;
        ctx.lineWidth = this.brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(stroke[0].x, stroke[0].y);
        for (let i = 1; i < stroke.length; i++) {
          ctx.lineTo(stroke[i].x, stroke[i].y);
        }
        ctx.stroke();
        ctx.restore();
      }
    });
  }

  undo() {
    if (this.strokes.length > 0) {
      this.strokes.pop();
      this.redrawAll();
    }
  }

  clear() {
    this.strokes = [];
    this.currentStroke = [];
    this.redrawAll();
  }

  getStrokeCount() {
    return this.strokes.length;
  }
}
