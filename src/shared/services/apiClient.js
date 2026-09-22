/**
 * AI-CTO Frontend API Client
 * Centralized service layer for communicating with the FastAPI Modular Monolith backend.
 */
const RAW_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || '/api';
const API_BASE = RAW_BASE.replace(/\/+$/, '');
const TOKEN_KEY = 'aicto_access_token';
const REFRESH_KEY = 'aicto_refresh_token';
const USER_KEY = 'aicto_auth_user';

// ==========================================
// Token & Session Storage Helpers
// ==========================================
export const getAccessToken = () => localStorage.getItem(TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);
export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setAuthSession = (tokenData, userData = null) => {
  if (tokenData?.access_token) localStorage.setItem(TOKEN_KEY, tokenData.access_token);
  if (tokenData?.refresh_token) localStorage.setItem(REFRESH_KEY, tokenData.refresh_token);
  if (userData) localStorage.setItem(USER_KEY, JSON.stringify(userData));
};

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('aicto_friday_conv_id');
};

// ==========================================
// Token Auto-Refresh Mutex & Helper
// ==========================================
let isRefreshing = false;
let refreshPromise = null;

export async function refreshAccessToken() {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearAuthSession();
    window.dispatchEvent(new CustomEvent('aicto_auth_expired'));
    throw new Error('No refresh token available');
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        throw new Error(`Refresh failed with HTTP ${response.status}`);
      }

      const data = await response.json();
      if (!data.access_token) {
        throw new Error('No access token returned from refresh');
      }

      // Preserve existing stored user information
      const currentUser = getStoredUser();
      setAuthSession(data, currentUser);
      window.dispatchEvent(new CustomEvent('aicto_token_refreshed', { detail: data }));
      return data.access_token;
    } catch (err) {
      console.warn('Auto-refresh token failed, clearing session:', err.message);
      clearAuthSession();
      window.dispatchEvent(new CustomEvent('aicto_auth_expired'));
      window.dispatchEvent(new CustomEvent('aicto_user_updated', { detail: null }));
      throw err;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ==========================================
// Core Fetch Wrapper
// ==========================================
async function request(endpoint, options = {}, isRetry = false) {
  const token = getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized with single-flight automatic token refresh & retry
    if (
      response.status === 401 &&
      !isRetry &&
      !endpoint.includes('/auth/login') &&
      !endpoint.includes('/auth/register') &&
      !endpoint.includes('/auth/refresh')
    ) {
      try {
        const newAccessToken = await refreshAccessToken();
        const retryHeaders = {
          ...headers,
          Authorization: `Bearer ${newAccessToken}`,
        };
        return await request(endpoint, { ...options, headers: retryHeaders }, true);
      } catch (refreshErr) {
        console.warn(`Authentication refresh failed for ${endpoint}:`, refreshErr.message);
        throw new Error('Session expired. Please log in again.');
      }
    }

    if (!response.ok) {
      let errorDetail = `HTTP Error ${response.status}`;
      try {
        const errorJson = await response.json();
        errorDetail = errorJson.detail || JSON.stringify(errorJson);
      } catch {
        errorDetail = await response.text();
      }
      throw new Error(errorDetail);
    }

    // Return JSON if present, else empty object
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return {};
  } catch (error) {
    if (!isRetry) {
      console.error(`API Error [${endpoint}]:`, error.message);
    }
    throw error;
  }
}

// ==========================================
// ==========================================
// Canonical User & Profile Management API
// ==========================================
export const userApi = {
  async getMe() {
    return await request('/users/me', { method: 'GET' });
  },

  async updateMe(updateData) {
    const data = await request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    const current = getStoredUser() || {};
    const merged = { ...current, ...data };
    localStorage.setItem(USER_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('aicto_user_updated', { detail: merged }));
    return data;
  },

  async uploadAvatar(file) {
    let token = getAccessToken();
    const formData = new FormData();
    formData.append('file', file);

    const url = `${API_BASE}/users/me/avatar`;
    let response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (response.status === 401) {
      try {
        token = await refreshAccessToken();
        response = await fetch(url, {
          method: 'POST',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: formData,
        });
      } catch (refreshErr) {
        throw new Error('Session expired during avatar upload. Please log in again.');
      }
    }

    if (!response.ok) {
      let errorDetail = `HTTP Error ${response.status}`;
      try {
        const errorJson = await response.json();
        errorDetail = errorJson.detail || JSON.stringify(errorJson);
      } catch {
        errorDetail = await response.text();
      }
      throw new Error(errorDetail);
    }

    const result = await response.json();
    const updatedUser = await userApi.getMe();
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    window.dispatchEvent(new CustomEvent('aicto_user_updated', { detail: updatedUser }));
    return result;
  },
};

// ==========================================
// Auth API Endpoints (Delegates to canonical userApi)
// ==========================================
export const authApi = {
  async register({ business_name, email, password, full_name }) {
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ business_name, email, password, full_name }),
    });
    const initialUser = {
      email,
      name: full_name || business_name,
      full_name: full_name || business_name,
      business_name,
      business_id: data.business_id,
      role: 'owner',
    };
    setAuthSession(data, initialUser);
    try {
      const me = await userApi.getMe();
      if (me && me.email) {
        setAuthSession(data, me);
        window.dispatchEvent(new CustomEvent('aicto_user_updated', { detail: me }));
      }
    } catch {
      window.dispatchEvent(new CustomEvent('aicto_user_updated', { detail: initialUser }));
    }
    return data;
  },

  async login({ email, password }) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthSession(data, { email, business_id: data.business_id });
    try {
      const me = await userApi.getMe();
      if (me && me.email) {
        setAuthSession(data, me);
        window.dispatchEvent(new CustomEvent('aicto_user_updated', { detail: me }));
      }
    } catch {}
    return data;
  },

  async demoLogin() {
    const data = await request('/auth/demo', { method: 'POST' });
    const demoUser = {
      email: 'demo.cto@aicto.io',
      business_id: data.business_id,
      name: 'Alex Vance (Lead Architect)',
      business_name: 'Apex Retail Global',
      role: 'owner',
    };
    setAuthSession(data, demoUser);
    try {
      const me = await userApi.getMe();
      if (me && me.email) {
        setAuthSession(data, me);
        window.dispatchEvent(new CustomEvent('aicto_user_updated', { detail: me }));
      }
    } catch {}
    return data;
  },

  async logout() {
    try {
      await request('/auth/logout', { method: 'POST' });
    } finally {
      clearAuthSession();
      window.dispatchEvent(new CustomEvent('aicto_user_updated', { detail: null }));
    }
  },

  async getMe() {
    return await userApi.getMe();
  },
};

// ==========================================
// Dashboard & Monitoring API
// ==========================================
export const dashboardApi = {
  async getMetrics() {
    return await request('/dashboard/metrics', { method: 'GET' });
  },

  async getAnalytics() {
    return await request('/dashboard/analytics', { method: 'GET' });
  },

  async getAuditLogs(limit = 50) {
    return await request(`/dashboard/audit-logs?limit=${limit}`, { method: 'GET' });
  },
};

// ==========================================
// FRIDAY AI-CTO Conversational API
// ==========================================
export const fridayApi = {
  async sendMessage({ message, conversation_id = null, mode = 'chat', model = null, reasoning_effort = 'medium', context_hints = null }) {
    return await request('/friday/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        conversation_id,
        mode,
        model,
        reasoning_effort,
        context_hints,
      }),
    });
  },

  async streamMessage({
    message,
    conversation_id = null,
    mode = 'chat',
    model = null,
    context_hints = null,
    onToken,
    onDone,
    onError,
  }) {
    let token = getAccessToken();
    const getHeaders = (t) => ({
      'Content-Type': 'application/json',
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
    });
    const url = `${API_BASE}/friday/chat/stream`;

    try {
      let response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify({
          message,
          conversation_id,
          mode,
          model,
          context_hints,
          stream: true,
        }),
      });

      if (response.status === 401) {
        try {
          token = await refreshAccessToken();
          response = await fetch(url, {
            method: 'POST',
            headers: getHeaders(token),
            body: JSON.stringify({
              message,
              conversation_id,
              mode,
              model,
              context_hints,
              stream: true,
            }),
          });
        } catch (refreshErr) {
          if (onError) onError(new Error('Session expired. Please log in again.'));
          return;
        }
      }

      if (!response.ok) {
        let errText = `HTTP ${response.status}`;
        try {
          const errJson = await response.json();
          errText = errJson.detail || JSON.stringify(errJson);
        } catch {
          errText = await response.text();
        }
        throw new Error(errText);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;
          const payload = trimmed.slice(5).trim();
          try {
            const parsed = JSON.parse(payload);
            if (parsed.error) {
              if (onError) onError(new Error(parsed.error));
              return;
            }
            if (parsed.token && onToken) {
              onToken(parsed.token, parsed.model);
            }
            if (parsed.done && onDone) {
              onDone(parsed.model);
            }
          } catch {
            // non-JSON SSE chunk
          }
        }
      }

      if (onDone) onDone();
    } catch (err) {
      if (onError) onError(err);
      else throw err;
    }
  },

  async executeAction({ action_type, service, params = {}, conversation_id = null }) {
    return await request('/friday/actions/execute', {
      method: 'POST',
      body: JSON.stringify({
        action_type,
        service,
        params,
        conversation_id,
      }),
    });
  },

  async getHistory(conversation_id = null) {
    const query = conversation_id ? `?conversation_id=${encodeURIComponent(conversation_id)}` : '';
    return await request(`/friday/history${query}`, { method: 'GET' });
  },
};

// ==========================================
// Telemetry Ingestion API (JS Snippet)
// ==========================================
export const ingestionApi = {
  async sendEvent(eventData) {
    return await request('/ingestion/events', {
      method: 'POST',
      body: JSON.stringify({
        ...eventData,
        idempotency_key: eventData.idempotency_key || crypto.randomUUID(),
      }),
    });
  },
};

// ==========================================
// Logs & Observability API
// ==========================================
export const logsApi = {
  async queryLogs({ timeFrom, timeTo, logType, level, source, search, limit = 50, offset = 0 } = {}) {
    const params = new URLSearchParams();
    if (timeFrom) params.append('time_from', typeof timeFrom === 'string' ? timeFrom : timeFrom.toISOString());
    if (timeTo) params.append('time_to', typeof timeTo === 'string' ? timeTo : timeTo.toISOString());
    if (logType && logType !== 'all') params.append('log_type', logType);
    if (level && level !== 'all') params.append('level', level);
    if (source && source !== 'all') params.append('source', source);
    if (search && search.trim()) params.append('search', search.trim());
    params.append('limit', String(limit));
    params.append('offset', String(offset));

    const qs = params.toString();
    return await request(`/logs${qs ? `?${qs}` : ''}`, { method: 'GET' });
  },

  async getLogsAroundAnomaly(anomalyId) {
    return await request(`/logs/around-anomaly/${encodeURIComponent(anomalyId)}`, { method: 'GET' });
  },

  async getSources() {
    return await request('/logs/sources', { method: 'GET' });
  },

  async ingestLogs(logs) {
    return await request('/logs', {
      method: 'POST',
      body: JSON.stringify({ logs }),
    });
  },

  getStreamUrl({ level, source, logType, search } = {}) {
    const token = getAccessToken();
    const params = new URLSearchParams();
    if (token) params.append('token', token);
    if (level && level !== 'all') params.append('level', level);
    if (source && source !== 'all') params.append('source', source);
    if (logType && logType !== 'all') params.append('log_type', logType);
    if (search && search.trim()) params.append('search', search.trim());

    const qs = params.toString();
    return `${API_BASE}/logs/stream${qs ? `?${qs}` : ''}`;
  },
};

// ==========================================
// Observability / Health Probe
// ==========================================
export const healthApi = {
  async checkHealth() {
    return await request('/health', { method: 'GET' });
  },
};

// ==========================================
// API Keys Management API
// ==========================================
export const apiKeysApi = {
  async getKeys() {
    return await request('/users/api-keys', { method: 'GET' });
  },
  async createKey(name = 'Website Telemetry Snippet Key') {
    return await request('/users/api-keys', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },
};

export default {
  auth: authApi,
  user: userApi,
  apiKeys: apiKeysApi,
  dashboard: dashboardApi,
  friday: fridayApi,
  ingestion: ingestionApi,
  logs: logsApi,
  health: healthApi,
};

