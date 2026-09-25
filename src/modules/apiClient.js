/**
 * Thin browser client for the optional HánNgữ server API.
 * The app remains usable without the API; callers can detect availability
 * and keep the existing local-first SQLite flow as a fallback.
 */
class ApiClient {
  constructor() {
    this.baseUrl = '/api';
    this.available = false;
    this.user = null;
    this.lastError = null;
  }

  async request(path, { method = 'GET', body, signal } = {}) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      credentials: 'include',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal
    });
    let payload = null;
    try { payload = await response.json(); } catch {}
    if (!response.ok) {
      const error = new Error(payload?.error || `API request failed (${response.status})`);
      error.status = response.status;
      error.code = payload?.code;
      throw error;
    }
    return payload;
  }

  async health() {
    try {
      const payload = await this.request('/health');
      this.available = payload?.ok === true;
      this.lastError = null;
      return payload;
    } catch (error) {
      this.available = false;
      this.lastError = error;
      return null;
    }
  }

  async register({ email, password, displayName, targetLevel, learningGoal }) {
    const payload = await this.request('/auth/register', { method: 'POST', body: { email, password, displayName, targetLevel, learningGoal } });
    this.user = payload.user;
    this.available = true;
    return payload.user;
  }

  async login(email, password) {
    const payload = await this.request('/auth/login', { method: 'POST', body: { email, password } });
    this.user = payload.user;
    this.available = true;
    return payload.user;
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    this.user = null;
  }

  async getMe() {
    const payload = await this.request('/me');
    this.user = payload.user;
    return payload.user;
  }

  async updateProfile(changes) {
    const payload = await this.request('/me', { method: 'PATCH', body: changes });
    this.user = payload.user;
    return payload.user;
  }

  async pullSync() {
    return this.request('/sync/pull');
  }

  async pushSync(bundle) {
    return this.request('/sync/push', { method: 'POST', body: bundle });
  }

  async dashboard() {
    return this.request('/dashboard');
  }

  async getDueCards({ limit = 30, level = 0 } = {}) {
    return this.request(`/srs/due?limit=${encodeURIComponent(limit)}&level=${encodeURIComponent(level)}`);
  }

  async reviewCard(review) {
    return this.request('/srs/review', { method: 'POST', body: review });
  }

  async recordLesson(lesson) {
    return this.request('/progress/lessons', { method: 'POST', body: lesson });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
