/**
 * ToastService - Hệ thống thông báo góc dưới bên phải màn hình (Bottom-Right Toast Notification)
 * Thiết kế mượt mà, sang trọng, thay thế hoàn toàn popup alert thô thiển của trình duyệt.
 * Hỗ trợ đa dạng trạng thái: Success, Error, Warning, Info, cùng thanh tiến trình và tính năng dừng khi hover.
 */

export class ToastService {
  constructor() {
    this.container = null;
    this.toasts = [];
    this.maxToasts = 5;
    this.initContainer();
    this.interceptBrowserAlert();
  }

  /**
   * Tạo hoặc lấy container chứa toast ở góc dưới bên phải màn hình
   */
  initContainer() {
    if (typeof document === 'undefined') return;

    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-atomic', 'true');
      document.body.appendChild(container);
    }
    this.container = container;
  }

  /**
   * Chặn hoàn toàn window.alert mặc định của trình duyệt để chuyển thành Toast thông báo sang trọng
   */
  interceptBrowserAlert() {
    if (typeof window === 'undefined') return;

    // Lưu lại alert gốc nếu cần
    if (!window.__nativeAlert) {
      window.__nativeAlert = window.alert;
    }

    // Override alert để không làm gián đoạn trải nghiệm người dùng
    window.alert = (message) => {
      // Phân tích nội dung để xác định loại toast phù hợp
      const msgStr = String(message || '');
      let type = 'info';
      let title = 'Thông Báo';

      const lower = msgStr.toLowerCase();
      if (lower.includes('thành công') || lower.includes('hoàn thành') || lower.includes('đã lưu') || lower.includes('khôi phục')) {
        type = 'success';
        title = 'Thành Công';
      } else if (lower.includes('lỗi') || lower.includes('thất bại') || lower.includes('từ chối') || lower.includes('không thể') || lower.includes('bị khóa')) {
        type = 'error';
        title = 'Thông Báo Lỗi';
      } else if (lower.includes('cảnh báo') || lower.includes('hết thời gian') || lower.includes('vui lòng')) {
        type = 'warning';
        title = 'Lưu Ý';
      }

      this.show({
        message: msgStr,
        type: type,
        title: title,
        duration: 4000
      });
    };
  }

  /**
   * Hiển thị một toast thông báo
   * @param {Object} options 
   * @param {string} options.message - Nội dung thông báo
   * @param {string} [options.title] - Tiêu đề
   * @param {'success'|'error'|'warning'|'info'} [options.type='info'] - Loại thông báo
   * @param {number} [options.duration=4000] - Thời gian hiển thị (ms)
   * @param {string} [options.icon] - Icon tùy chọn
   */
  show({ message, title = '', type = 'info', duration = 4000, icon = null }) {
    this.initContainer();
    if (!this.container) return;

    // Giới hạn số lượng toast hiển thị cùng lúc
    if (this.toasts.length >= this.maxToasts) {
      const oldest = this.toasts.shift();
      if (oldest && oldest.element) {
        this.dismiss(oldest.element);
      }
    }

    // Xác định icon và tiêu đề mặc định nếu không truyền
    const defaultMeta = this.getTypeMeta(type);
    const finalTitle = title || defaultMeta.defaultTitle;
    const finalIcon = icon || defaultMeta.iconSvg;

    // Tạo phần tử DOM Toast
    const toastEl = document.createElement('div');
    toastEl.className = `app-toast toast-${type}`;
    toastEl.setAttribute('role', 'status');

    toastEl.innerHTML = `
      <div class="toast-indicator"></div>
      <div class="toast-icon-wrap" aria-hidden="true">
        ${finalIcon}
      </div>
      <div class="toast-body">
        ${finalTitle ? `<div class="toast-title">${this.escapeHtml(finalTitle)}</div>` : ''}
        <div class="toast-message">${this.escapeHtml(message)}</div>
      </div>
      <button class="toast-close-btn" type="button" aria-label="Đóng thông báo" title="Đóng">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <div class="toast-progress-bar">
        <div class="toast-progress-fill"></div>
      </div>
    `;

    // Quản lý thời gian tồn tại và tạm dừng khi hover
    let remainingTime = duration;
    let startTime = Date.now();
    let dismissTimer = null;
    let isPaused = false;

    const progressFill = toastEl.querySelector('.toast-progress-fill');
    if (progressFill) {
      progressFill.style.transition = `width ${duration}ms linear`;
      // Kích hoạt animation chạy progress bar sau khi toast xuất hiện
      setTimeout(() => {
        if (!isPaused && progressFill) {
          progressFill.style.width = '0%';
        }
      }, 30);
    }

    const startTimer = (timeToWait) => {
      clearTimeout(dismissTimer);
      startTime = Date.now();
      dismissTimer = setTimeout(() => {
        this.dismiss(toastEl);
      }, timeToWait);
    };

    const pauseTimer = () => {
      isPaused = true;
      clearTimeout(dismissTimer);
      const elapsed = Date.now() - startTime;
      remainingTime = Math.max(500, remainingTime - elapsed);
      if (progressFill) {
        const computedStyle = window.getComputedStyle(progressFill);
        const currentWidth = computedStyle.getPropertyValue('width');
        progressFill.style.transition = 'none';
        progressFill.style.width = currentWidth;
      }
    };

    const resumeTimer = () => {
      if (!isPaused) return;
      isPaused = false;
      if (progressFill) {
        progressFill.style.transition = `width ${remainingTime}ms linear`;
        progressFill.style.width = '0%';
      }
      startTimer(remainingTime);
    };

    // Sự kiện tương tác
    toastEl.addEventListener('mouseenter', pauseTimer);
    toastEl.addEventListener('mouseleave', resumeTimer);

    const closeBtn = toastEl.querySelector('.toast-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.dismiss(toastEl);
      });
    }

    // Đưa vào DOM và tạo hiệu ứng animation xuất hiện
    this.container.appendChild(toastEl);
    const toastObj = { element: toastEl, timer: dismissTimer };
    this.toasts.push(toastObj);

    // Kích hoạt hiệu ứng xuất hiện
    requestAnimationFrame(() => {
      toastEl.classList.add('toast-show');
      startTimer(duration);
    });

    return toastEl;
  }

  /**
   * Đóng và gỡ bỏ toast khỏi giao diện với hiệu ứng mượt
   */
  dismiss(toastEl) {
    if (!toastEl || !toastEl.parentNode) return;

    toastEl.classList.remove('toast-show');
    toastEl.classList.add('toast-hide');

    // Xóa khỏi danh sách theo dõi
    this.toasts = this.toasts.filter(t => t.element !== toastEl);

    // Sau khi animation hoàn tất thì xóa DOM
    setTimeout(() => {
      if (toastEl.parentNode) {
        toastEl.remove();
      }
    }, 350);
  }

  /**
   * Các hàm tắt nhanh tiện dụng
   */
  success(message, title = 'Thành Công', duration = 4000) {
    return this.show({ message, title, type: 'success', duration });
  }

  error(message, title = 'Có Lỗi Xảy Ra', duration = 4500) {
    return this.show({ message, title, type: 'error', duration });
  }

  warning(message, title = 'Lưu Ý', duration = 4000) {
    return this.show({ message, title, type: 'warning', duration });
  }

  info(message, title = 'Thông Báo', duration = 4000) {
    return this.show({ message, title, type: 'info', duration });
  }

  /**
   * Siêu dữ liệu biểu tượng và màu sắc theo loại toast
   */
  getTypeMeta(type) {
    switch (type) {
      case 'success':
        return {
          defaultTitle: 'Thành Công',
          iconSvg: `
            <svg class="toast-svg-icon" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>`
        };
      case 'error':
        return {
          defaultTitle: 'Thất Bại',
          iconSvg: `
            <svg class="toast-svg-icon" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>`
        };
      case 'warning':
        return {
          defaultTitle: 'Cảnh Báo',
          iconSvg: `
            <svg class="toast-svg-icon" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>`
        };
      case 'info':
      default:
        return {
          defaultTitle: 'Thông Báo',
          iconSvg: `
            <svg class="toast-svg-icon" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>`
        };
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

// Khởi tạo singleton instance
export const toastService = new ToastService();

// Gắn toàn cục để dễ dàng sử dụng khắp mọi nơi
if (typeof window !== 'undefined') {
  window.toastService = toastService;
  window.showToast = (msg, type = 'info', title = '', duration = 4000) => {
    return toastService.show({ message: msg, type, title, duration });
  };
  window.toastSuccess = (msg, title) => toastService.success(msg, title);
  window.toastError = (msg, title) => toastService.error(msg, title);
  window.toastWarning = (msg, title) => toastService.warning(msg, title);
  window.toastInfo = (msg, title) => toastService.info(msg, title);
}

export default toastService;
