import React, { useState, useEffect, useRef } from 'react';
import { Badge } from '../../../shared/components/Badge';
import { Button } from '../../../shared/components/Button';
import { BUSINESS_PROFILES } from '../dashboardData';
import { useTenant } from '../../../shared/context/TenantContext';

const REFRESH_INTERVALS = [
  { label: '5s', value: 5000 },
  { label: '10s', value: 10000 },
  { label: '30s', value: 30000 },
  { label: '60s', value: 60000 },
];

export function DashboardTopBar({
  selectedBusiness: propSelectedBusiness,
  onBusinessChange,
  isConnected,
  onToggleConnection,
  unreadAlertCount = 0,
  notifications = [],
  onDismissNotification,
  autoRefresh,
  onToggleAutoRefresh,
  refreshInterval,
  onIntervalChange,
  onManualRefresh,
  isRefreshing,
  lastUpdatedSeconds,
  onNavigate,
}) {
  const [businessDropdownOpen, setBusinessDropdownOpen] = useState(false);
  const [bellDropdownOpen, setBellDropdownOpen] = useState(false);
  const [intervalDropdownOpen, setIntervalDropdownOpen] = useState(false);

  const businessRef = useRef(null);
  const bellRef = useRef(null);
  const intervalRef = useRef(null);

  // Connect to tenant context
  const { businesses: contextBusinesses, selectedBusiness: contextSelectedBusiness, openOnboarding } = useTenant();
  const availableBusinesses = contextBusinesses && contextBusinesses.length > 0 ? contextBusinesses : [];
  const currentBusiness = propSelectedBusiness || contextSelectedBusiness || availableBusinesses[0] || {
    id: 'primary-tenant',
    name: 'Primary Organization',
    type: 'ecommerce',
    typeLabel: 'PRODUCTION',
    region: 'Global Edge',
    domain: 'live.aicto.io',
  };

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (businessRef.current && !businessRef.current.contains(event.target)) {
        setBusinessDropdownOpen(false);
      }
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setBellDropdownOpen(false);
      }
      if (intervalRef.current && !intervalRef.current.contains(event.target)) {
        setIntervalDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="dashboard-topbar">
      {/* ── Left: Dynamic Page Title & Business Tenant Selector ── */}
      <div className="dashboard-topbar__left">
        <div className="dashboard-topbar__title-group">
          <div className="dashboard-topbar__heading-row">
            <h1 className="dashboard-topbar__title">Operations Control Center</h1>
            <Badge variant="violet" size="sm" className="dashboard-topbar__type-badge">
              {currentBusiness.typeLabel}
            </Badge>
          </div>
          <p className="dashboard-topbar__subtitle">
            Live telemetry & automated incident mitigation · {currentBusiness.region}
          </p>
        </div>

        {/* Business Selector Dropdown */}
        <div className="dashboard-tenant-selector" ref={businessRef}>
          <button
            type="button"
            className="dashboard-tenant-selector__btn"
            onClick={() => setBusinessDropdownOpen(!businessDropdownOpen)}
            aria-expanded={businessDropdownOpen}
            aria-label="Select business tenant"
          >
            <span className="dashboard-tenant-selector__icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
              </svg>
            </span>
            <div className="dashboard-tenant-selector__meta">
              <span className="dashboard-tenant-selector__name">{currentBusiness.name}</span>
              <span className="dashboard-tenant-selector__tier">{currentBusiness.domain}</span>
            </div>
            <svg
              className={`dashboard-tenant-selector__chevron ${businessDropdownOpen ? 'dashboard-tenant-selector__chevron--open' : ''}`}
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {businessDropdownOpen && (
            <div className="dashboard-dropdown-menu">
              <div className="dashboard-dropdown-menu__header">Switch Active Tenant</div>
              {availableBusinesses.map((biz) => (
                <button
                  key={biz.id}
                  className={`dashboard-dropdown-item ${biz.id === currentBusiness.id ? 'dashboard-dropdown-item--active' : ''}`}
                  onClick={() => {
                    if (onBusinessChange) onBusinessChange(biz);
                    setBusinessDropdownOpen(false);
                  }}
                >
                  <div className="dashboard-dropdown-item__main">
                    <span className="dashboard-dropdown-item__title">{biz.name}</span>
                    <span className="dashboard-dropdown-item__desc">{biz.region} · {biz.domain}</span>
                  </div>
                  <span className="dashboard-dropdown-item__tag">{biz.typeLabel}</span>
                </button>
              ))}

              <div className="dashboard-dropdown-divider" />

              <button
                type="button"
                className="dashboard-dropdown-action-btn"
                onClick={() => {
                  setBusinessDropdownOpen(false);
                  openOnboarding();
                }}
              >
                <span className="dashboard-dropdown-action-btn__icon">+</span>
                <span>Add New Business</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Live Indicators, Refresh Controls, Notifications, Shortcuts ── */}
      <div className="dashboard-topbar__right">
        {/* Connection Status Pill */}
        <button
          className={`dashboard-status-pill ${isConnected ? 'dashboard-status-pill--connected' : 'dashboard-status-pill--disconnected'}`}
          onClick={onToggleConnection}
          title={isConnected ? 'Click to simulate disconnect' : 'Click to reconnect'}
        >
          <span className="dashboard-status-pill__dot" />
          <span className="dashboard-status-pill__label">
            {isConnected ? 'Live Telemetry' : 'Offline'}
          </span>
          <span className="dashboard-status-pill__ping">{isConnected ? '32ms' : '—'}</span>
        </button>

        {/* Last updated timestamp */}
        <div className="dashboard-topbar__updated-ticker" title="Last metrics refresh time">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>
            {lastUpdatedSeconds === 0 ? 'Just now' : `${lastUpdatedSeconds}s ago`}
          </span>
        </div>

        {/* Auto Refresh Toggle & Interval Menu */}
        <div className="dashboard-refresh-control" ref={intervalRef}>
          <button
            className={`dashboard-refresh-control__toggle ${autoRefresh ? 'dashboard-refresh-control__toggle--on' : ''}`}
            onClick={onToggleAutoRefresh}
            title={autoRefresh ? 'Auto-refresh active (click to pause)' : 'Auto-refresh paused (click to start)'}
          >
            <span className="dashboard-refresh-control__switch" />
            <span className="dashboard-refresh-control__text">
              {autoRefresh ? 'Auto' : 'Paused'}
            </span>
          </button>

          <button
            className="dashboard-refresh-control__interval-btn"
            onClick={() => setIntervalDropdownOpen(!intervalDropdownOpen)}
            disabled={!autoRefresh}
            title="Change auto-refresh interval"
          >
            <span>{refreshInterval / 1000}s</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {intervalDropdownOpen && (
            <div className="dashboard-dropdown-menu dashboard-dropdown-menu--compact">
              <div className="dashboard-dropdown-menu__header">Polling Interval</div>
              {REFRESH_INTERVALS.map((item) => (
                <button
                  key={item.value}
                  className={`dashboard-dropdown-item ${refreshInterval === item.value ? 'dashboard-dropdown-item--active' : ''}`}
                  onClick={() => {
                    onIntervalChange(item.value);
                    setIntervalDropdownOpen(false);
                  }}
                >
                  {item.label} refresh
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Manual Refresh Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onManualRefresh}
          loading={isRefreshing}
          icon={
            <svg
              className={`dashboard-refresh-icon ${isRefreshing ? 'dashboard-refresh-icon--spinning' : ''}`}
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          }
          title="Manual refresh telemetry metrics"
        >
          Refresh
        </Button>

        {/* Notification Bell Dropdown */}
        <div className="dashboard-bell-container" ref={bellRef}>
          <button
            className={`dashboard-topbar__icon-btn ${bellDropdownOpen ? 'dashboard-topbar__icon-btn--active' : ''}`}
            onClick={() => setBellDropdownOpen(!bellDropdownOpen)}
            aria-label="Alerts and notifications"
            title="Active alert notifications"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadAlertCount > 0 && (
              <span className="dashboard-topbar__bell-badge">{unreadAlertCount}</span>
            )}
          </button>

          {bellDropdownOpen && (
            <div className="dashboard-notifications-popover">
              <div className="dashboard-notifications-popover__header">
                <div className="dashboard-notifications-popover__title">
                  <span>System Alerts</span>
                  <Badge variant={unreadAlertCount > 0 ? "error" : "success"} size="sm">
                    {unreadAlertCount > 0 ? `${unreadAlertCount} Unresolved` : 'All Systems Nominal'}
                  </Badge>
                </div>
              </div>
              <div className="dashboard-notifications-popover__list">
                {notifications.length === 0 ? (
                  <div className="dashboard-notifications-popover__empty">
                    No unread notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="dashboard-notification-item">
                      <div className="dashboard-notification-item__top">
                        <span className={`dashboard-notification-item__tag dashboard-notification-item__tag--${notif.severity.toLowerCase()}`}>
                          {notif.severity}
                        </span>
                        <span className="dashboard-notification-item__time">{notif.timestamp}</span>
                      </div>
                      <div className="dashboard-notification-item__title">{notif.title}</div>
                      <div className="dashboard-notification-item__impact">{notif.service}</div>
                      {onDismissNotification && (
                        <button
                          className="dashboard-notification-item__dismiss"
                          onClick={() => onDismissNotification(notif.id)}
                        >
                          Dismiss
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
              <div className="dashboard-notifications-popover__footer">
                <button
                  className="dashboard-notifications-popover__footer-btn"
                  onClick={() => {
                    setBellDropdownOpen(false);
                    if (onNavigate) onNavigate('audit-logs');
                  }}
                >
                  View Full Audit Trail →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Settings Shortcut Button */}
        <button
          className="dashboard-topbar__icon-btn"
          onClick={() => onNavigate && onNavigate('settings')}
          aria-label="Settings"
          title="Open Settings"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
