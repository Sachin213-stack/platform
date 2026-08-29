import React, { useState } from 'react';
import { ToastProvider } from '../../shared/components/Toast';
import { GeneralTab } from './tabs/GeneralTab';
import { AppearanceTab } from './tabs/AppearanceTab';
import { ApiKeysTab } from './tabs/ApiKeysTab';
import { TeamAccessTab } from './tabs/TeamAccessTab';
import { AlertRulesTab } from './tabs/AlertRulesTab';
import { DataPrivacyTab } from './tabs/DataPrivacyTab';
import './Settings.css';

/* ── SVG Icons for Settings Navigation ──────────────────────── */
const TabIcons = {
  general: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="3" />
      <path d="M10 2v2M10 16v2M3.5 5.5l1.4 1.4M15.1 15.1l1.4 1.4M2 10h2M16 10h2M3.5 14.5l1.4-1.4M15.1 4.9l1.4-1.4" />
    </svg>
  ),
  appearance: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="7" />
      <path d="M10 3v14a7 7 0 0 0 0-14z" fill="currentColor" />
    </svg>
  ),
  apiKeys: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 6a3 3 0 1 0-4.24 4.24L3 17v3h3l1-1v-2h2v-2l1.24-1.24A3 3 0 0 0 14 6z" />
      <circle cx="13.5" cy="6.5" r="0.8" fill="currentColor" />
    </svg>
  ),
  team: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 16v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1" />
      <circle cx="7.5" cy="5.5" r="3.5" />
      <path d="M18 16v-1a3.5 3.5 0 0 0-2.5-3.3M14.5 2.2a3.5 3.5 0 0 1 0 6.6" />
    </svg>
  ),
  alertRules: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2a6 6 0 0 0-6 6v3.586l-.707.707A1 1 0 0 0 4 14h12a1 1 0 0 0 .707-1.707L16 11.586V8a6 6 0 0 0-6-6z" />
      <path d="M8 17a2 2 0 0 0 4 0" />
    </svg>
  ),
  dataPrivacy: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="9" width="14" height="9" rx="2" />
      <path d="M6 9V6a4 4 0 0 1 8 0v3" />
    </svg>
  ),
};

const TABS = [
  { id: 'general', label: 'General', icon: TabIcons.general, desc: 'Identity, timezone, refresh rate' },
  { id: 'appearance', label: 'Appearance', icon: TabIcons.appearance, desc: 'Dark/light, palette, density' },
  { id: 'api-keys', label: 'API Keys', icon: TabIcons.apiKeys, desc: 'Bearer tokens, webhooks' },
  { id: 'team-access', label: 'Team Access', icon: TabIcons.team, desc: 'Members, roles, permissions' },
  { id: 'alert-rules', label: 'Alert Rules', icon: TabIcons.alertRules, desc: 'Thresholds, notifications' },
  { id: 'data-privacy', label: 'Data & Privacy', icon: TabIcons.dataPrivacy, desc: 'Retention, export, danger zone' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralTab />;
      case 'appearance':
        return <AppearanceTab />;
      case 'api-keys':
        return <ApiKeysTab />;
      case 'team-access':
        return <TeamAccessTab />;
      case 'alert-rules':
        return <AlertRulesTab />;
      case 'data-privacy':
        return <DataPrivacyTab />;
      default:
        return <GeneralTab />;
    }
  };

  return (
    <ToastProvider>
      <div className="settings-container">
        {/* Settings Header */}
        <div className="settings-page-header">
          <div className="settings-page-header__meta">
            <h1 className="settings-page-header__title">Workspace Settings</h1>
            <p className="settings-page-header__subtitle">
              Configure system preferences, API credentials, team RBAC access, and security policies.
            </p>
          </div>
        </div>

        {/* Mobile Tab Selector Dropdown */}
        <div className="settings-mobile-tab-selector">
          <label htmlFor="settings-tab-select" className="settings-mobile-tab-label">
            Active Section:
          </label>
          <div className="settings-mobile-select-wrapper">
            <select
              id="settings-tab-select"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="settings-mobile-select"
            >
              {TABS.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label} — {tab.desc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Settings Layout (Sidebar + Content Pane) */}
        <div className="settings-layout">
          {/* Settings Sidebar Navigation */}
          <aside className="settings-nav-card" aria-label="Settings navigation">
            <div className="settings-nav-card__label">Settings Sections</div>
            <nav className="settings-nav-list">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    className={`settings-nav-item ${isActive ? 'settings-nav-item--active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="settings-nav-item__icon">{tab.icon}</span>
                    <div className="settings-nav-item__text">
                      <span className="settings-nav-item__label">{tab.label}</span>
                      <span className="settings-nav-item__desc">{tab.desc}</span>
                    </div>
                    {isActive && <span className="settings-nav-item__pill" />}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Settings Content Pane */}
          <main className="settings-content-wrapper" key={activeTab}>
            {renderActiveTabContent()}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
