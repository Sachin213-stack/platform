/**
 * fridayMemoryService.js
 * Unified Session & Context Memory Manager for FRIDAY AI.
 *
 * Ensures FRIDAY Chat and FRIDAY Voice Assistant share the exact same
 * conversation memory, multi-turn context window, and persistent storage.
 * Provides ChatGPT-style multi-session history indexing and switching.
 */

import { fridayApi } from '../../../shared/services/apiClient';

const CONV_STORAGE_KEY = 'aicto_friday_conv_id';
const MESSAGES_STORAGE_PREFIX = 'aicto_friday_msgs_';
const SESSIONS_INDEX_KEY = 'aicto_friday_sessions_list';

class FridayMemoryService {
  constructor() {
    this.listeners = new Set();
    this.sessionListeners = new Set();
    this.conversationId = this._initConversationId();
    this.messages = this._loadLocalMessages(this.conversationId);
    this.sessions = this._loadSessionsList();
    this._ensureCurrentSessionIndexed();
  }

  _initConversationId() {
    try {
      const saved = localStorage.getItem(CONV_STORAGE_KEY);
      if (saved && saved !== 'conv-default' && saved.length > 10) {
        return saved;
      }
      const created = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : `c-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(CONV_STORAGE_KEY, created);
      return created;
    } catch {
      return '00000000-0000-4000-8000-000000000001';
    }
  }

  _loadLocalMessages(convId) {
    try {
      const data = localStorage.getItem(`${MESSAGES_STORAGE_PREFIX}${convId}`);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read cached messages from localStorage:', e);
    }
    return [];
  }

  _persistLocalMessages() {
    try {
      localStorage.setItem(
        `${MESSAGES_STORAGE_PREFIX}${this.conversationId}`,
        JSON.stringify(this.messages)
      );
    } catch (e) {
      console.warn('Could not persist messages to localStorage:', e);
    }
  }

  _loadSessionsList() {
    try {
      const data = localStorage.getItem(SESSIONS_INDEX_KEY);
      if (data) {
        const list = JSON.parse(data);
        if (Array.isArray(list)) return list;
      }
    } catch (e) {
      console.warn('Could not read sessions list:', e);
    }
    return [];
  }

  _persistSessionsList() {
    try {
      localStorage.setItem(SESSIONS_INDEX_KEY, JSON.stringify(this.sessions));
      this._notifySessionListeners();
    } catch (e) {
      console.warn('Could not persist sessions list:', e);
    }
  }

  _ensureCurrentSessionIndexed() {
    const existing = this.sessions.find((s) => s.id === this.conversationId);
    const firstUserMsg = this.messages.find((m) => m.sender === 'user');
    const title = firstUserMsg
      ? firstUserMsg.text.trim().slice(0, 48) + (firstUserMsg.text.length > 48 ? '...' : '')
      : 'Active Investigation';

    if (!existing) {
      this.sessions.unshift({
        id: this.conversationId,
        title,
        preview: this.messages.length > 0 ? this.messages[this.messages.length - 1].text.slice(0, 75) : 'New conversation',
        updatedAt: new Date().toISOString(),
        messageCount: this.messages.length,
      });
      this._persistSessionsList();
    }
  }

  getConversationId() {
    return this.conversationId;
  }

  getMessages() {
    return [...this.messages];
  }

  getSessionsList() {
    return [...this.sessions].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  setMessages(newMessages) {
    this.messages = [...newMessages];
    this._persistLocalMessages();
    this._updateCurrentSessionMetadata();
    this._notify();
  }

  appendTurn(sender, text, suggestedActions = null) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const turn = {
      id: `m-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      sender: sender === 'assistant' ? 'friday' : sender,
      time: timeStr,
      text: text || '',
      suggestedActions: suggestedActions || null,
      timestamp: now.toISOString(),
    };

    this.messages = [...this.messages, turn];
    this._persistLocalMessages();
    this._updateCurrentSessionMetadata(turn);
    this._notify();
    return turn;
  }

  _updateCurrentSessionMetadata(newTurn = null) {
    const nowIso = new Date().toISOString();
    let idx = this.sessions.findIndex((s) => s.id === this.conversationId);

    if (idx === -1) {
      this.sessions.unshift({
        id: this.conversationId,
        title: 'Active Investigation',
        preview: '',
        updatedAt: nowIso,
        messageCount: this.messages.length,
      });
      idx = 0;
    }

    const session = this.sessions[idx];
    session.updatedAt = nowIso;
    session.messageCount = this.messages.length;

    if (newTurn) {
      session.preview = newTurn.text.slice(0, 80);
      if (newTurn.sender === 'user' && (!session.title || session.title === 'Active Investigation' || session.title === 'New Session')) {
        session.title = newTurn.text.trim().slice(0, 48) + (newTurn.text.length > 48 ? '...' : '');
      }
    }

    // Move current session to top of list
    if (idx > 0) {
      this.sessions.splice(idx, 1);
      this.sessions.unshift(session);
    }

    this._persistSessionsList();
  }

  loadSession(sessionId) {
    if (!sessionId || sessionId === this.conversationId) return this.messages;

    this.conversationId = sessionId;
    try {
      localStorage.setItem(CONV_STORAGE_KEY, sessionId);
    } catch {}

    this.messages = this._loadLocalMessages(sessionId);
    this._notify();
    this.syncWithBackend();
    this._notifySessionListeners();
    return this.messages;
  }

  resetConversation() {
    try {
      const newId = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : `c-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      this.conversationId = newId;
      localStorage.setItem(CONV_STORAGE_KEY, newId);
      this.messages = [];
      this._persistLocalMessages();

      // Add to session list
      this.sessions.unshift({
        id: newId,
        title: 'New Session',
        preview: 'New session started',
        updatedAt: new Date().toISOString(),
        messageCount: 0,
      });
      this._persistSessionsList();

      this._notify();
      return newId;
    } catch {
      return this.conversationId;
    }
  }

  deleteSession(sessionId) {
    this.sessions = this.sessions.filter((s) => s.id !== sessionId);
    try {
      localStorage.removeItem(`${MESSAGES_STORAGE_PREFIX}${sessionId}`);
      this._persistSessionsList();
    } catch (e) {
      console.warn('Could not remove session storage:', e);
    }

    // If currently active session was deleted, switch to next available or reset
    if (sessionId === this.conversationId) {
      if (this.sessions.length > 0) {
        this.loadSession(this.sessions[0].id);
      } else {
        this.resetConversation();
      }
    } else {
      this._notifySessionListeners();
    }
  }

  clearAllSessions() {
    for (const session of this.sessions) {
      try {
        localStorage.removeItem(`${MESSAGES_STORAGE_PREFIX}${session.id}`);
      } catch {}
    }
    this.sessions = [];
    this._persistSessionsList();
    this.resetConversation();
  }

  async syncWithBackend() {
    if (!this.conversationId) return this.messages;

    try {
      const res = await fridayApi.getHistory(this.conversationId);
      if (res?.messages && Array.isArray(res.messages) && res.messages.length > 0) {
        const backendTurns = res.messages.map((m, idx) => ({
          id: `hist-${idx}-${m.timestamp || Date.now()}`,
          sender: m.role === 'assistant' ? 'friday' : (m.role || 'user'),
          time: m.timestamp
            ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'Earlier',
          text: m.content || '',
          timestamp: m.timestamp || new Date().toISOString(),
        }));

        if (backendTurns.length >= this.messages.length) {
          this.messages = backendTurns;
          this._persistLocalMessages();
          this._updateCurrentSessionMetadata();
          this._notify();
        }
      }
    } catch (err) {
      console.debug('Backend history sync deferred or offline:', err);
    }
    return this.messages;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  subscribeSessions(listener) {
    this.sessionListeners.add(listener);
    return () => {
      this.sessionListeners.delete(listener);
    };
  }

  _notify() {
    const msgs = this.getMessages();
    for (const listener of this.listeners) {
      try {
        listener(msgs, this.conversationId);
      } catch (e) {
        console.error('Error notifying memory listener:', e);
      }
    }
  }

  _notifySessionListeners() {
    const sessions = this.getSessionsList();
    for (const listener of this.sessionListeners) {
      try {
        listener(sessions, this.conversationId);
      } catch (e) {
        console.error('Error notifying session listener:', e);
      }
    }
  }
}

export const fridayMemory = new FridayMemoryService();
export default fridayMemory;
