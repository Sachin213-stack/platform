/**
 * AI-CTO Frontend API Client
 * Centralized service layer for communicating with the FastAPI Modular Monolith backend.
 */

const RAW_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
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
};

// ==========================================
// Core Fetch Wrapper
// ==========================================
async function request(endpoint, options = {}) {
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

    // Handle 401 Unauthorized
    if (response.status === 401) {
      console.warn('Session expired or unauthorized request to:', endpoint);
      // Optional auto-logout or refresh trigger
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
    console.error(`API Error [${endpoint}]:`, error.message);
    throw error;
  }
}

// ==========================================
// Auth API Endpoints
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
      const me = await request('/auth/me', { method: 'GET' });
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
      const me = await request('/auth/me', { method: 'GET' });
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
      const me = await request('/auth/me', { method: 'GET' });
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
    return await request('/auth/me', { method: 'GET' });
  },
};

// ==========================================
// User & Profile Management API
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
    const token = getAccessToken();
    const formData = new FormData();
    formData.append('file', file);

    const url = `${API_BASE}/users/me/avatar`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

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
// Dashboard & Monitoring API
// ==========================================
export const dashboardApi = {
  async getMetrics() {
    return await request('/dashboard/metrics', { method: 'GET' });
  },
};

// ==========================================
// FRIDAY AI-CTO Conversational API
// ==========================================
export const fridayApi = {
  async sendMessage({ message, conversation_id = null, mode = 'chat', model = null, context_hints = null }) {
    return await request('/friday/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        conversation_id,
        mode,
        model,
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
    const token = getAccessToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const url = `${API_BASE}/friday/chat/stream`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message,
          conversation_id,
          mode,
          model,
          context_hints,
          stream: true,
        }),
      });

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
// Observability / Health Probe
// ==========================================
export const healthApi = {
  async checkHealth() {
    return await request('/health', { method: 'GET' });
  },
};

export default {
  auth: authApi,
  user: userApi,
  dashboard: dashboardApi,
  friday: fridayApi,
  ingestion: ingestionApi,
  health: healthApi,
};
