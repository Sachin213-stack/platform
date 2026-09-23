import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '../../../../shared/components/Button';
import { generateTrackingSnippet } from '../../../onboarding/onboardingConfig';

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
  onSendTestLog,
  isSendingTestLog = false,
  apiKey = '',
  businessId = '',
}) {
  const containerRef = useRef(null);
  const [isAutoScrollPaused, setIsAutoScrollPaused] = useState(false);
  const userScrolledUpRef = useRef(false);

  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const snippetCode = generateTrackingSnippet(
    businessId || 'YOUR_BUSINESS_ID',
    apiKey || 'YOUR_API_KEY'
  );

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(snippetCode);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

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
            <div className="log-awaiting-container">
              <div className="log-awaiting-header">
                <div className="log-awaiting-beacon">
                  <span className="log-awaiting-pulse" />
                  <span className="log-awaiting-dot" />
                </div>
                <div className="log-awaiting-badge">
                  <span className="log-awaiting-badge-dot" />
                  <span>ZERO-MOCK TELEMETRY ENGINE ACTIVE</span>
                </div>
                <h3 className="log-awaiting-title">Awaiting Live Telemetry & Server Logs</h3>
                <p className="log-awaiting-desc">
                  AI-CTO is connected and monitoring. Zero synthetic baseline data is loaded—this terminal renders strictly authentic logs from your connected web apps and backend services.
                </p>

                <div className="log-awaiting-actions">
                  <Button
                    variant="primary"
                    size="sm"
                    loading={isSendingTestLog}
                    onClick={onSendTestLog}
                    icon={
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                    }
                  >
                    Send Instant Test Log Probe
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onOpenShippingModal}
                    icon={
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v8M4.93 10.93l1.41 1.41M2 18h8M20 18h2M19.07 10.93l-1.41 1.41M22 22H2M8 22v-4a4 4 0 0 1 8 0v4" />
                      </svg>
                    }
                  >
                    Server Shipper Setup
                  </Button>
                </div>
              </div>

              <div className="log-awaiting-cards">
                {/* Option 1: Browser Telemetry & Error Mirroring */}
                <div className="log-awaiting-card">
                  <div className="log-awaiting-card__header">
                    <span className="log-awaiting-card__icon">🌐</span>
                    <div>
                      <h4 className="log-awaiting-card__title">Website Frontend Telemetry</h4>
                      <span className="log-awaiting-card__sub">Core Web Vitals, runtime JS errors & promise rejections</span>
                    </div>
                  </div>
                  <p className="log-awaiting-card__text">
                    Add this lightweight script tag to your web app's HTML <code>&lt;head&gt;</code>. Uncaught errors and client crashes automatically stream into this terminal.
                  </p>
                  <div className="log-awaiting-code-wrap">
                    <code className="log-awaiting-code">{snippetCode}</code>
                    <button
                      type="button"
                      className="log-awaiting-copy-btn"
                      onClick={handleCopySnippet}
                      title="Copy script snippet to clipboard"
                    >
                      {copiedSnippet ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Option 2: Server-Side Logs */}
                <div className="log-awaiting-card">
                  <div className="log-awaiting-card__header">
                    <span className="log-awaiting-card__icon">🖥️</span>
                    <div>
                      <h4 className="log-awaiting-card__title">Server Log Shipper</h4>
                      <span className="log-awaiting-card__sub">Docker, Kubernetes, FluentBit, Python, Node, Go</span>
                    </div>
                  </div>
                  <p className="log-awaiting-card__text">
                    Ship backend application logs, stack traces, and HTTP 5xx errors directly to our high-throughput ingestion endpoint via HTTP POST.
                  </p>
                  <div className="log-awaiting-code-wrap">
                    <code className="log-awaiting-code">
                      POST {window.location.origin}/api/logs
                    </code>
                    <button
                      type="button"
                      className="log-awaiting-copy-btn"
                      onClick={onOpenShippingModal}
                    >
                      View Snippets →
                    </button>
                  </div>
                </div>
              </div>
            </div>
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
