import React, { useState } from 'react';

const LEVEL_CONFIG = [
  { id: 'error', label: 'ERROR', colorClass: 'log-chip--error' },
  { id: 'warn', label: 'WARN', colorClass: 'log-chip--warn' },
  { id: 'info', label: 'INFO', colorClass: 'log-chip--info' },
  { id: 'debug', label: 'DEBUG', colorClass: 'log-chip--debug' },
];

const TIME_PRESETS = [
  { id: '15m', label: '15m' },
  { id: '1h', label: '1h' },
  { id: '24h', label: '24h' },
  { id: 'all', label: 'All' },
];

const LOG_TYPES = [
  { id: 'all', label: 'All Types' },
  { id: 'application', label: 'Application' },
  { id: 'container', label: 'Container' },
  { id: 'kubernetes', label: 'Kubernetes' },
  { id: 'other', label: 'Other' },
];

export function LogFilterBar({
  timePreset,
  onTimePresetChange,
  logType,
  onLogTypeChange,
  selectedLevels,
  onToggleLevel,
  source,
  sources = [],
  onSourceChange,
  searchQuery,
  onSearchChange,
}) {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  return (
    <div className="log-filter-bar">
      {/* Search Input (Always Visible) */}
      <div className="log-filter-search">
        <svg className="log-filter-search__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          className="log-filter-search__input"
          placeholder="Filter logs by message, exception, HTTP status, request ID..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            className="log-filter-search__clear"
            onClick={() => onSearchChange('')}
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Mobile Toggle Button */}
      <button
        type="button"
        className="log-filter-mobile-toggle"
        onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        <span>Filters {selectedLevels.length > 0 ? `(${selectedLevels.length})` : ''}</span>
      </button>

      {/* Filter Controls Group */}
      <div className={`log-filter-controls ${isMobileDrawerOpen ? 'log-filter-controls--open' : ''}`}>
        {/* Time Presets */}
        <div className="log-filter-group">
          <span className="log-filter-group__label">Time:</span>
          <div className="log-time-presets">
            {TIME_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={`log-time-preset-btn ${timePreset === preset.id ? 'log-time-preset-btn--active' : ''}`}
                onClick={() => onTimePresetChange(preset.id)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Level Filter Chips */}
        <div className="log-filter-group">
          <span className="log-filter-group__label">Level:</span>
          <div className="log-level-chips">
            {LEVEL_CONFIG.map((lvl) => {
              const isSelected = selectedLevels.includes(lvl.id);
              return (
                <button
                  key={lvl.id}
                  type="button"
                  className={`log-level-chip ${lvl.colorClass} ${isSelected ? 'log-level-chip--selected' : ''}`}
                  onClick={() => onToggleLevel(lvl.id)}
                  title={`Filter by ${lvl.label}`}
                >
                  <span className="log-level-chip__indicator" />
                  {lvl.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Source Filter Dropdown */}
        <div className="log-filter-group">
          <span className="log-filter-group__label">Source:</span>
          <select
            className="log-filter-select"
            value={source}
            onChange={(e) => onSourceChange(e.target.value)}
          >
            <option value="all">All Sources</option>
            {sources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Log Type Dropdown */}
        <div className="log-filter-group">
          <span className="log-filter-group__label">Type:</span>
          <select
            className="log-filter-select"
            value={logType}
            onChange={(e) => onLogTypeChange(e.target.value)}
          >
            {LOG_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
