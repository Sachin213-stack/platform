import React, { useState, useEffect, useMemo } from 'react';
import './FridayChatHistoryDrawer.css';
import { fridayMemory } from '../services/fridayMemoryService';
import { Badge } from '../../../shared/components/Badge';

function getTimeframe(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24 && now.getDate() === date.getDate()) {
    return 'Today';
  }
  if (diffHours < 48) {
    return 'Yesterday';
  }
  if (diffHours < 24 * 7) {
    return 'Previous 7 Days';
  }
  return 'Older';
}

function formatSessionTime(dateStr) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'Earlier';
  }
}

export function FridayChatHistoryDrawer({
  isOpen,
  onClose,
  activeSessionId,
  onSelectSession,
  onNewSession,
}) {
  const [sessions, setSessions] = useState(() => fridayMemory.getSessionsList());
  const [search, setSearch] = useState('');

  // Subscribe to live session list changes
  useEffect(() => {
    const unsubscribe = fridayMemory.subscribeSessions((updatedSessions) => {
      setSessions(updatedSessions);
    });
    return unsubscribe;
  }, []);

  // Keyboard shortcut: Esc to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter sessions by search query
  const filteredSessions = useMemo(() => {
    if (!search.trim()) return sessions;
    const q = search.toLowerCase();
    return sessions.filter(
      (s) =>
        (s.title || '').toLowerCase().includes(q) ||
        (s.preview || '').toLowerCase().includes(q)
    );
  }, [sessions, search]);

  // Group filtered sessions by timeframe
  const groupedSessions = useMemo(() => {
    const groups = {
      Today: [],
      Yesterday: [],
      'Previous 7 Days': [],
      Older: [],
    };

    for (const session of filteredSessions) {
      const tf = getTimeframe(session.updatedAt);
      if (groups[tf]) {
        groups[tf].push(session);
      } else {
        groups.Older.push(session);
      }
    }

    return Object.entries(groups).filter(([_, items]) => items.length > 0);
  }, [filteredSessions]);

  if (!isOpen) return null;

  return (
    <div
      className="friday-history-drawer-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <aside className="friday-history-drawer">
        {/* ── Drawer Header ── */}
        <div className="friday-history-header">
          <div className="friday-history-title-row">
            <div className="friday-history-title-group">
              <span style={{ fontSize: '16px' }}>💬</span>
              <h3 className="friday-history-title">Chat History</h3>
              <Badge variant="neutral" size="sm">
                {sessions.length}
              </Badge>
            </div>
            <button
              type="button"
              className="friday-history-close-btn"
              onClick={onClose}
              title="Close drawer (Esc)"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Quick New Session Button inside drawer */}
          <button
            type="button"
            className="friday-history-new-btn"
            onClick={() => {
              onNewSession();
              onClose();
            }}
          >
            <span>+</span>
            <span>Start New Session</span>
          </button>

          {/* Search Bar */}
          <input
            type="text"
            className="friday-history-search"
            placeholder="Search past conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* ── Sessions List Body ── */}
        <div className="friday-history-body">
          {sessions.length === 0 ? (
            <div className="friday-history-empty">
              <p>No conversations saved yet.</p>
              <p style={{ fontSize: '11px', marginTop: '4px' }}>
                Your chat and voice discussions will appear here automatically.
              </p>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="friday-history-empty">
              <p>No chats match "{search}"</p>
            </div>
          ) : (
            groupedSessions.map(([groupName, items]) => (
              <div key={groupName} className="friday-history-group">
                <div className="friday-history-group-title">{groupName}</div>
                {items.map((session) => {
                  const isActive = session.id === activeSessionId;
                  return (
                    <div
                      key={session.id}
                      className={`friday-session-item ${
                        isActive ? 'friday-session-item--active' : ''
                      }`}
                      onClick={() => {
                        onSelectSession(session.id);
                        onClose();
                      }}
                      title={session.title || 'Conversation'}
                    >
                      <div className="friday-session-main">
                        <div className="friday-session-title-row">
                          <span className="friday-session-icon">
                            {isActive ? '✦' : '💬'}
                          </span>
                          <span className="friday-session-title">
                            {session.title || 'Untitled Conversation'}
                          </span>
                        </div>
                        <div className="friday-session-meta">
                          <span>{formatSessionTime(session.updatedAt)}</span>
                          <span>•</span>
                          <span>
                            {session.messageCount || 0} turn
                            {session.messageCount === 1 ? '' : 's'}
                          </span>
                        </div>
                      </div>

                      {/* Delete Session Button */}
                      <button
                        type="button"
                        className="friday-session-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          fridayMemory.deleteSession(session.id);
                        }}
                        title="Delete conversation"
                        aria-label="Delete conversation"
                      >
                        🗑️
                      </button>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* ── Drawer Footer ── */}
        <div className="friday-history-footer">
          <span className="friday-history-footer-count">
            {sessions.length} conversation{sessions.length === 1 ? '' : 's'} indexed
          </span>
          {sessions.length > 0 && (
            <button
              type="button"
              className="friday-history-clear-btn"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all chat history?')) {
                  fridayMemory.clearAllSessions();
                  onNewSession();
                  onClose();
                }
              }}
            >
              Clear All
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
