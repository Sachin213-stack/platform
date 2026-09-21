import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Badge } from '../../../../shared/components/Badge';
import { EmptyState } from '../../../../shared/components/EmptyState';

function formatTimestamp(ts) {
  if (!ts) return '';
  try {
    const d = new Date(ts);
    // Format as HH:mm:ss.SSS
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    const ms = String(d.getMilliseconds()).padStart(3, '0');
    return `${hh}:${mm}:${ss}.${ms}`;
  } catch {
    return String(ts);
  }
}

function highlightSearchMatch(text, query) {
  if (!query || !query.trim() || typeof text !== 'string') return text;
  const q = query.trim();
  const index = text.toLowerCase().indexOf(q.toLowerCase());
  if (index === -1) return text;

  const before = text.slice(0, index);
  const match = text.slice(index, index + q.length);
  const after = text.slice(index + q.length);

  return (
    <>
      {before}
      <mark className="log-search-highlight">{match}</mark>
      {after}
    </>
  );
}

export function LogStreamPanel({
  logs = [],
  isLive,
  isLoading,
  searchQuery,
  correlatedEntryIds = [],
  selectedLog,
  onSelectLog,
  onOpenShippingModal,
}) {
  const containerRef = useRef(null);
  const [isAutoScrollPaused, setIsAutoScrollPaused] = useState(false);
  const userScrolledUpRef = useRef(false);

  // Auto-scroll handler
  const scrollToBottom = useCallback((behavior = 'smooth') => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior,
      });
      userScrolledUpRef.current = false;
      setIsAutoScrollPaused(false);
    }
  }, []);

  // Listen to user scroll events
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;

    // If user scrolled up by more than 40px
    if (distanceToBottom > 40) {
      userScrolledUpRef.current = true;
      setIsAutoScrollPaused(true);
    } else {
      userScrolledUpRef.current = false;
      setIsAutoScrollPaused(false);
    }
  };

  // Scroll to bottom when new logs arrive (if auto-scroll is active)
  useEffect(() => {
    if (isLive && !userScrolledUpRef.current && containerRef.current) {
      // Use instant or micro-smooth
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, isLive]);

  // Initial scroll to bottom on mount
  useEffect(() => {
    if (logs.length > 0 && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, []);

  return (
    <div className="log-stream-panel">
      {/* Terminal Window Header Chrome */}
      <div className="log-terminal-header">
        <div className="log-terminal-dots">
          <span className="log-terminal-dot log-terminal-dot--red" />
          <span className="log-terminal-dot log-terminal-dot--amber" />
          <span className="log-terminal-dot log-terminal-dot--green" />
        </div>
        <div className="log-terminal-title">
          <span className="log-terminal-icon">❯_</span>
          <span>ai-cto-log-tail --follow --format=json</span>
        </div>
        <div className="log-terminal-stats">
          <span className="log-terminal-status-dot" />
          <span>{isLive ? 'STREAMING' : 'IDLE'}</span>
        </div>
      </div>

      {/* Main Terminal Body */}
      <div
        ref={containerRef}
        className="log-terminal-body"
        onScroll={handleScroll}
        role="log"
        aria-live="polite"
      >
        {isLoading && logs.length === 0 ? (
          <div className="log-terminal-loading">
            <div className="log-spinner" />
            <p>Connecting to log stream and fetching initial window...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="log-terminal-empty">
            <EmptyState
              icon={
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                  <polyline points="6 9 10 13 14 9" />
                </svg>
              }
              title="No Logs Ingested Yet"
              description="Logs will appear here in real-time once your server log shipper (Fluentd, Vector, Filebeat, or curl script) is connected."
              actionLabel="View Log Shipper Setup"
              onAction={onOpenShippingModal}
            />
          </div>
        ) : (
          <div className="log-lines-list">
            {logs.map((entry, index) => {
              const isSelected = selectedLog?.id === entry.id;
              const isCorrelated = correlatedEntryIds.includes(entry.id);
              const lvl = (entry.level || 'info').toLowerCase();

              return (
                <div
                  key={entry.id || index}
                  className={`log-line log-line--${lvl} ${isSelected ? 'log-line--selected' : ''} ${isCorrelated ? 'log-line--correlated' : ''}`}
                  onClick={() => onSelectLog(entry)}
                  tabIndex={0}
                  role="button"
                  title="Click to view full log details and parsed JSON fields"
                >
                  {/* Correlated Anomaly Indicator */}
                  {isCorrelated && (
                    <span className="log-line__correlated-indicator" title="Correlated with active anomaly">
                      ⚡ ANOMALY ROOT CAUSE
                    </span>
                  )}

                  {/* Timestamp */}
                  <span className="log-line__timestamp">
                    {formatTimestamp(entry.timestamp)}
                  </span>

                  {/* Level Badge */}
                  <span className={`log-line__level-badge log-line__level-badge--${lvl}`}>
                    {lvl.toUpperCase()}
                  </span>

                  {/* Source Pill */}
                  <span className="log-line__source" title={entry.source || 'application'}>
                    {entry.source || 'app'}
                  </span>

                  {/* Content Message */}
                  <span className="log-line__content">
                    {highlightSearchMatch(entry.content, searchQuery)}
                  </span>

                  {/* Parsed Fields Indicator */}
                  {entry.parsed_fields && Object.keys(entry.parsed_fields).length > 0 && (
                    <span className="log-line__json-indicator" title="Structured JSON fields available">
                      {'{...}'}
                    </span>
                  )}

                  {/* Inspect Chevron */}
                  <span className="log-line__chevron">→</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Resume Auto-Scroll Pill */}
      {isAutoScrollPaused && (
        <button
          type="button"
          className="log-floating-scroll-resume"
          onClick={() => scrollToBottom('smooth')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
          <span>Auto-scroll paused (Click to jump to latest)</span>
        </button>
      )}
    </div>
  );
}
