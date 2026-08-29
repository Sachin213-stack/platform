import React from 'react';
import { Card, CardHeader, CardBody } from '../../../shared/components/Card';
import { Badge } from '../../../shared/components/Badge';
import { Button } from '../../../shared/components/Button';
import { useToast } from '../../../shared/components/Toast';
import { useTheme } from '../../../shared/context/ThemeContext';

const ACCENT_COLORS = [
  { id: 'violet', label: 'Dark Violet', hex: '#8b5cf6', desc: 'Default AI-CTO signature' },
  { id: 'gold', label: 'Cyber Gold', hex: '#f59e0b', desc: 'High-contrast warm amber' },
  { id: 'teal', label: 'Emerald Teal', hex: '#14b8a6', desc: 'Clean bio-luminescent teal' },
  { id: 'rose', label: 'Neon Rose', hex: '#f43f5e', desc: 'Vibrant modern magenta' },
  { id: 'blue', label: 'Electric Blue', hex: '#3b82f6', desc: 'Enterprise deep cobalt' },
  { id: 'emerald', label: 'Matrix Emerald', hex: '#10b981', desc: 'Telemetry green' },
];

export function AppearanceTab() {
  const { addToast } = useToast();
  const {
    theme: themeMode,
    setTheme: handleThemeSelect,
    accentColor,
    setAccentColor: handleAccentSelect,
    density,
    setDensity: handleDensitySelect,
    fontSize,
    setFontSize: handleFontSizeSelect,
  } = useTheme();

  const handleThemeChange = (mode) => {
    handleThemeSelect(mode);
    addToast(`Theme set to ${mode === 'light' ? 'Light daylight mode' : 'Dark violet mode'}`, 'info');
  };

  const handleAccentChange = (accentId) => {
    handleAccentSelect(accentId);
    addToast(`Accent palette changed to ${accentId.toUpperCase()}`, 'success');
  };

  const handleDensityChange = (newDensity) => {
    handleDensitySelect(newDensity);
    addToast(`Dashboard density set to ${newDensity}`, 'info');
  };

  const handleFontSizeChange = (newSize) => {
    handleFontSizeSelect(newSize);
    addToast(`Platform font size set to ${newSize}`, 'info');
  };

  return (
    <div className="settings-tab-pane">
      <div className="settings-tab-pane__header">
        <h2 className="settings-tab-pane__title">Appearance & Theming</h2>
        <p className="settings-tab-pane__subtitle">
          Customize interface color palette, light/dark appearance, viewport density, and global font scaling.
        </p>
      </div>

      <div className="settings-form-grid">
        {/* Interface Theme (Dark vs Light) */}
        <Card>
          <CardHeader
            title="Interface Mode"
            subtitle="Choose between the deep dark violet operations mode or daylight high-contrast."
          />
          <CardBody>
            <div className="appearance-theme-cards">
              <button
                type="button"
                className={`theme-mode-card ${themeMode === 'dark' ? 'theme-mode-card--active' : ''}`}
                onClick={() => handleThemeChange('dark')}
              >
                <div className="theme-mode-card__preview theme-mode-card__preview--dark">
                  <div className="preview-mini-sidebar" />
                  <div className="preview-mini-content">
                    <div className="preview-mini-bar preview-mini-bar--accent" />
                    <div className="preview-mini-box" />
                  </div>
                </div>
                <div className="theme-mode-card__info">
                  <span className="theme-mode-card__label">Dark Violet Mode</span>
                  <span className="theme-mode-card__desc">Reduced eye strain for night operations (Default)</span>
                </div>
                {themeMode === 'dark' && <span className="theme-mode-card__check">✓</span>}
              </button>

              <button
                type="button"
                className={`theme-mode-card ${themeMode === 'light' ? 'theme-mode-card--active' : ''}`}
                onClick={() => handleThemeChange('light')}
              >
                <div className="theme-mode-card__preview theme-mode-card__preview--light">
                  <div className="preview-mini-sidebar" />
                  <div className="preview-mini-content">
                    <div className="preview-mini-bar preview-mini-bar--accent" />
                    <div className="preview-mini-box" />
                  </div>
                </div>
                <div className="theme-mode-card__info">
                  <span className="theme-mode-card__label">Light Daylight Mode</span>
                  <span className="theme-mode-card__desc">High-contrast clarity for well-lit rooms</span>
                </div>
                {themeMode === 'light' && <span className="theme-mode-card__check">✓</span>}
              </button>
            </div>
          </CardBody>
        </Card>

        {/* Accent Color Palette */}
        <Card>
          <CardHeader
            title="Accent Color Palette"
            subtitle="Choose the primary highlight color used for badges, active tabs, buttons, and telemetry spikes."
          />
          <CardBody>
            <div className="appearance-palette-grid">
              {ACCENT_COLORS.map((c) => {
                const isSelected = accentColor === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={`palette-swatch-card ${isSelected ? 'palette-swatch-card--selected' : ''}`}
                    onClick={() => handleAccentChange(c.id)}
                  >
                    <span
                      className="palette-swatch-card__circle"
                      style={{ backgroundColor: c.hex, boxShadow: `0 0 12px ${c.hex}66` }}
                    />
                    <div className="palette-swatch-card__meta">
                      <span className="palette-swatch-card__title">{c.label}</span>
                      <span className="palette-swatch-card__desc">{c.desc}</span>
                    </div>
                    {isSelected && (
                      <span className="palette-swatch-card__active-indicator" style={{ color: c.hex }}>
                        ● Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </CardBody>
        </Card>

        {/* Density & Font Scaling */}
        <Card>
          <CardHeader
            title="Density & Font Scaling"
            subtitle="Fine-tune table compactness, widget spacing, and global typography sizing."
          />
          <CardBody>
            <div className="settings-fields-stack">
              {/* Density */}
              <div className="settings-field">
                <label className="settings-field__label">Dashboard Density</label>
                <div className="segmented-control">
                  <button
                    type="button"
                    className={`segmented-control__item ${density === 'comfortable' ? 'segmented-control__item--active' : ''}`}
                    onClick={() => handleDensityChange('comfortable')}
                  >
                    Comfortable (Standard 16px Spacing)
                  </button>
                  <button
                    type="button"
                    className={`segmented-control__item ${density === 'compact' ? 'segmented-control__item--active' : ''}`}
                    onClick={() => handleDensityChange('compact')}
                  >
                    Compact (Dense 12px Operations Grid)
                  </button>
                </div>
                <span className="settings-field__hint">
                  Compact mode reduces card padding and table row heights to show 30% more data above the fold.
                </span>
              </div>

              {/* Font Size */}
              <div className="settings-field">
                <label className="settings-field__label">Font Size Preference</label>
                <div className="segmented-control">
                  <button
                    type="button"
                    className={`segmented-control__item ${fontSize === 'small' ? 'segmented-control__item--active' : ''}`}
                    onClick={() => handleFontSizeChange('small')}
                  >
                    Small (90%)
                  </button>
                  <button
                    type="button"
                    className={`segmented-control__item ${fontSize === 'medium' ? 'segmented-control__item--active' : ''}`}
                    onClick={() => handleFontSizeChange('medium')}
                  >
                    Medium (100% Default)
                  </button>
                  <button
                    type="button"
                    className={`segmented-control__item ${fontSize === 'large' ? 'segmented-control__item--active' : ''}`}
                    onClick={() => handleFontSizeChange('large')}
                  >
                    Large (110%)
                  </button>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="appearance-live-preview">
                <div className="appearance-live-preview__header">
                  <span>Live Telemetry Component Preview</span>
                  <Badge variant="violet" dot>AI Online</Badge>
                </div>
                <div className="appearance-live-preview__body">
                  <div className="preview-stat">
                    <span className="preview-stat__val">214 ms</span>
                    <span className="preview-stat__lbl">99th Percentile Latency</span>
                  </div>
                  <div className="preview-actions">
                    <Button variant="secondary" size="sm">Dismiss</Button>
                    <Button variant="primary" size="sm">Execute AI Patch</Button>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
