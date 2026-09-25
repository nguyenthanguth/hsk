/**
 * HánNgữ Pro - Hanzi Copybook & Worksheet Generator (田字格 / 米字格 生成器)
 * Generates beautiful, print-ready calligraphy practice worksheets
 * with customizable grid styles, ghost guide tracing characters,
 * Pinyin annotations, and A4 print stylesheet formatting.
 */

export class WorksheetGenerator {
  constructor() {
    this.defaultConfig = {
      gridType: 'mizige', // 'mizige' (米字格) or 'tianzige' (田字格)
      showPinyin: true,
      ghostCount: 2, // Number of faint tracing characters per line
      colsPerRow: 10,
      rowsPerChar: 1,
      studentName: 'Học Viên HánNgữ Pro',
      levelText: 'HSK Chuẩn 3.0'
    };
  }

  /**
   * Generates the complete HTML string for the printable worksheet container.
   * @param {Array<{hanzi: string, pinyin?: string}>|string} inputCharacters 
   * @param {Object} options 
   * @returns {string} HTML markup
   */
  generateWorksheetHtml(inputCharacters, options = {}) {
    const config = { ...this.defaultConfig, ...options };
    
    // Normalize characters array
    let charList = [];
    if (typeof inputCharacters === 'string') {
      const trimmed = inputCharacters.replace(/[\s\r\n,，。！？]/g, '');
      charList = Array.from(trimmed).map(ch => ({ hanzi: ch, pinyin: '' }));
    } else if (Array.isArray(inputCharacters)) {
      charList = inputCharacters;
    }

    if (charList.length === 0) {
      charList = [
        { hanzi: '学', pinyin: 'xué' },
        { hanzi: '而', pinyin: 'ér' },
        { hanzi: '时', pinyin: 'shí' },
        { hanzi: '习', pinyin: 'xí' },
        { hanzi: '之', pinyin: 'zhī' }
      ];
    }

    const todayDate = new Date().toLocaleDateString('vi-VN');

    // Build row blocks
    const rowsHtml = charList.map(item => {
      let charRows = '';
      for (let r = 0; r < config.rowsPerChar; r++) {
        let cellsHtml = '';
        for (let col = 0; col < config.colsPerRow; col++) {
          let cellContent = '';
          let cellClass = `grid-cell ${config.gridType}`;

          if (col === 0) {
            // First cell: Solid master model character
            cellClass += ' cell-master';
            cellContent = `<span class="char-glyph master-glyph">${item.hanzi}</span>`;
          } else if (col <= config.ghostCount) {
            // Ghost guide cells for tracing
            cellClass += ' cell-ghost';
            cellContent = `<span class="char-glyph ghost-glyph">${item.hanzi}</span>`;
          } else {
            // Blank practice cells
            cellClass += ' cell-blank';
          }

          cellsHtml += `
            <div class="${cellClass}">
              <div class="grid-cross-horizontal"></div>
              <div class="grid-cross-vertical"></div>
              ${config.gridType === 'mizige' ? `
                <div class="grid-diag-1"></div>
                <div class="grid-diag-2"></div>
              ` : ''}
              ${cellContent}
            </div>
          `;
        }

        charRows += `
          <div class="worksheet-row">
            ${config.showPinyin && item.pinyin && r === 0 ? `
              <div class="pinyin-label-bar">
                <span class="pinyin-text">${item.pinyin}</span>
              </div>
            ` : ''}
            <div class="row-cells">
              ${cellsHtml}
            </div>
          </div>
        `;
      }
      return charRows;
    }).join('');

    return `
      <div class="worksheet-sheet-a4" id="printableWorksheet">
        <!-- Sheet Header -->
        <header class="sheet-header">
          <div class="header-main-title">
            <span class="emblem">🀄</span>
            <h2>BẢNG LUYỆN VIẾT CHỮ HÁN CHUẨN MỄ TỰ CÁCH</h2>
          </div>
          <div class="header-metadata">
            <span class="meta-item"><strong>Học viên:</strong> ${config.studentName}</span>
            <span class="meta-item"><strong>Cấp độ:</strong> ${config.levelText}</span>
            <span class="meta-item"><strong>Ngày luyện:</strong> ${todayDate}</span>
            <span class="meta-item"><strong>Điểm đánh giá:</strong> ____ / 100</span>
          </div>
        </header>

        <!-- Grid Body -->
        <div class="sheet-body">
          ${rowsHtml}
        </div>

        <!-- Sheet Footer -->
        <footer class="sheet-footer">
          <span>HánNgữ Pro • Nền Tảng Luyện Thi HSK 3.0 Chuẩn Quốc Tế • Vĩnh Tự Bát Pháp (永字八法)</span>
        </footer>
      </div>
    `;
  }
}

export const worksheetGenerator = new WorksheetGenerator();
