import { useState, useCallback, useEffect } from 'react';
import './AppShell.css';
import { useAnalytics } from '../context/AnalyticsContext';

/* ── SVG Icons (inline, no external deps) ───────────────────── */
const Icons = {
  logo: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="14" height="14" rx="3" />
      <path d="M6 7h6M6 11h4" />
    </svg>
  ),
  dashboard: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="6" height="7" rx="1.5" />
      <rect x="11" y="3" width="6" height="4" rx="1.5" />
      <rect x="3" y="12" width="6" height="5" rx="1.5" />
      <rect x="11" y="9" width="6" height="8" rx="1.5" />
    </svg>
  ),
  analytics: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3,15 7,9 11,12 17,5" />
      <polyline points="14,5 17,5 17,8" />
    </svg>
  ),
  friday: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12a6 6 0 0 0 12 0V8a6 6 0 0 0-12 0v4z" />
      <path d="M8 8h.01M12 8h.01" />
      <path d="M8 12c.5.7 1.2 1 2 1s1.5-.3 2-1" />
    </svg>
  ),
  billing: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="16" height="12" rx="2" />
      <line x1="2" y1="8" x2="18" y2="8" />
      <line x1="6" y1="12" x2="10" y2="12" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="2.5" />
      <path d="M10 2v2M10 16v2M3.5 5.5l1.4 1.4M15.1 15.1l1.4 1.4M2 10h2M16 10h2M3.5 14.5l1.4-1.4M15.1 4.9l1.4-1.4" />
    </svg>
  ),
  collapse: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="10,3 5,8 10,13" />
    </svg>
  ),
  hamburger: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <line x1="3" y1="5" x2="17" y2="5" />
      <line x1="3" y1="10" x2="17" y2="10" />
      <line x1="3" y1="15" x2="17" y2="15" />
    </svg>
  ),
  bell: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 8a5 5 0 0 1 10 0c0 4 2 6 2 6H3s2-2 2-6" />
      <path d="M8.5 16a1.5 1.5 0 0 0 3 0" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="5" />
      <line x1="13" y1="13" x2="17" y2="17" />
    </svg>
  ),
  alerts: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3L2 17h16L10 3z" />
      <line x1="10" y1="8" x2="10" y2="12" />
      <circle cx="10" cy="14.5" r="0.5" fill="currentColor" />
    </svg>
  ),
};

/* Navigation items with sections */
const NAV_SECTIONS = [
  {
    label: 'Monitor',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: Icons.dashboard },
      { id: 'analytics', label: 'Analytics', icon: Icons.analytics },
    ],
  },
  {
    label: 'Act',
    items: [
      { id: 'friday-ai', label: 'FRIDAY AI', icon: Icons.friday, badge: 'AI' },
    ],
  },
  {
    label: 'Manage',
    items: [
      { id: 'billing', label: 'Billing', icon: Icons.billing },
      { id: 'settings', label: 'Settings', icon: Icons.settings },
    ],
  },
];

/**
 * AppShell — Root layout component.
 *
 * Features:
 *   - Collapsible sidebar (desktop: icon-only mode with tooltips)
 *   - Responsive: slides off on tablet/mobile with overlay + hamburger
 *   - Keyboard shortcut: Ctrl+B toggles sidebar collapse
 *   - Section-grouped navigation with active state tracking
 *   - User profile in sidebar footer
 *   - Breadcrumbs + notification bell + search in topbar
 *   - Content area with smooth fade-in animation
 *
 * @param {Object}   props
 * @param {React.ReactNode} props.sidebar  - Custom sidebar (overrides default)
 * @param {React.ReactNode} props.topbar   - Custom topbar (overrides default)
 * @param {React.ReactNode} props.children - Page content
 * @param {string}   props.activeNav       - Active nav item id
 * @param {string}   props.pageTitle       - Title shown in topbar
 * @param {Function} props.onNavChange     - Called when nav item is clicked
 */
export default function AppShell({
  sidebar,
  topbar,
  children,
  activeNav = 'dashboard',
  pageTitle = 'Dashboard',
  onNavChange,
  onSignOut,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentNav, setCurrentNav] = useState(activeNav);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleCollapse = useCallback(() => setSidebarCollapsed((c) => !c), []);

  const handleNavClick = useCallback(
    (id) => {
      setCurrentNav(id);
      closeSidebar(); // close mobile sidebar on nav
      if (onNavChange) onNavChange(id);
    },
    [onNavChange, closeSidebar]
  );

  /* ── Keyboard shortcut: Ctrl+B to toggle collapse ────────── */
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        toggleCollapse();
      }
      if (e.key === 'Escape' && sidebarOpen) {
        closeSidebar();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleCollapse, sidebarOpen, closeSidebar]);

  /* ── Derive page title from currentNav if not provided ───── */
  const derivedTitle =
    pageTitle !== 'Dashboard' || currentNav === 'dashboard'
      ? pageTitle
      : NAV_SECTIONS.flatMap((s) => s.items).find((i) => i.id === currentNav)?.label || 'Dashboard';

  const sidebarClasses = [
    'app-shell__sidebar',
    sidebarOpen && 'app-shell__sidebar--open',
    sidebarCollapsed && 'app-shell__sidebar--collapsed',
  ]
    .filter(Boolean)
    .join(' ');

  const contentClasses = [
    'app-shell__content',
    sidebarCollapsed && 'app-shell__content--sidebar-collapsed',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="app-shell">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className={sidebarClasses} aria-label="Main navigation">
        {sidebar || (
          <DefaultSidebar
            collapsed={sidebarCollapsed}
            currentNav={currentNav}
            onNavClick={handleNavClick}
            onToggleCollapse={toggleCollapse}
            onSignOut={onSignOut}
          />
        )}
      </aside>

      {/* ── Mobile overlay ──────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="app-shell__overlay app-shell__overlay--visible"
          onClick={closeSidebar}
          onKeyDown={(e) => e.key === 'Escape' && closeSidebar()}
          role="button"
          tabIndex={-1}
          aria-label="Close navigation"
        />
      )}

      {/* ── Content region ──────────────────────────────────── */}
      <div className={contentClasses}>
        {/* Mobile menu button (visible only on mobile/tablet screens) */}
        <button
          className="app-shell__mobile-menu-btn"
          onClick={openSidebar}
          aria-label="Open navigation menu"
        >
          {Icons.hamburger}
        </button>

        {/* Main content */}
        <main className="app-shell__main" id="main-content" key={currentNav}>
          {children || <ContentPlaceholder />}
        </main>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   DEFAULT SUB-COMPONENTS (replaced by real ones in later steps)
   ════════════════════════════════════════════════════════════ */

function DefaultSidebar({ collapsed, currentNav, onNavClick, onToggleCollapse, onSignOut }) {
  const { activeAnomaliesCount } = useAnalytics();

  return (
    <>
      {/* ── Header: logo + collapse toggle ──────────────────── */}
      <div className="sidebar-header">
        <a href="/app" className="sidebar-logo" aria-label="AI-CTO Home" onClick={(e) => { e.preventDefault(); onNavClick('dashboard'); }}>
          <span className="sidebar-logo__icon">{Icons.logo}</span>
          <span className="sidebar-logo__text">AI-CTO</span>
        </a>
        <button
          className="sidebar-collapse-btn"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand (Ctrl+B)' : 'Collapse (Ctrl+B)'}
        >
          {Icons.collapse}
        </button>
      </div>

      {/* ── Navigation ──────────────────────────────────────── */}
      <nav className="sidebar-nav" aria-label="Main navigation">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <div className="sidebar-nav__section-label">{section.label}</div>
            {section.items.map((item) => (
              <button
                key={item.id}
                className={`sidebar-nav__item${currentNav === item.id ? ' sidebar-nav__item--active' : ''}`}
                onClick={() => onNavClick(item.id)}
                aria-current={currentNav === item.id ? 'page' : undefined}
                title={collapsed ? item.label : undefined}
              >
                <span className="sidebar-nav__item-icon">{item.icon}</span>
                <span className="sidebar-nav__item-label">{item.label}</span>
                {item.id === 'friday-ai' && activeAnomaliesCount > 0 ? (
                  <span
                    className="sidebar-nav__badge"
                    style={{
                      background: 'var(--color-status-error)',
                      color: '#ffffff',
                      boxShadow: '0 0 8px var(--color-status-error)',
                    }}
                    title={`${activeAnomaliesCount} active anomalies detected`}
                  >
                    {activeAnomaliesCount}
                  </span>
                ) : (
                  item.badge && <span className="sidebar-nav__badge">{item.badge}</span>
                )}
                {item.id === 'friday-ai' && (
                  <span className="status-dot status-dot--online" title="Online" />
                )}
                {/* Tooltip for collapsed state */}
                <span className="sidebar-tooltip">{item.label}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* ── Keyboard shortcut hint ──────────────────────────── */}
      <div className="sidebar-shortcut-hint">Ctrl+B to collapse</div>

      {/* ── Footer: user profile + sign out ───────────────────── */}
      <div className="sidebar-footer">
        <div
          className="sidebar-footer__user"
          role="button"
          tabIndex={0}
          aria-label="Sign out"
          onClick={onSignOut}
          title="Sign out and return to home page"
        >
          <div className="sidebar-footer__avatar">U</div>
          <div className="sidebar-footer__info">
            <div className="sidebar-footer__name">User (Admin)</div>
            <div className="sidebar-footer__role" style={{ color: 'var(--color-accent-light)' }}>
              Sign Out
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function DefaultTopbar() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="topbar-inner">
      <div className="topbar-right">
        {/* Search toggle */}
        <button
          className="topbar-icon-btn"
          aria-label="Search"
          onClick={() => setSearchOpen(!searchOpen)}
          title="Search"
        >
          {Icons.search}
        </button>

        {/* Notifications */}
        <button className="topbar-icon-btn" aria-label="Notifications" title="Notifications">
          {Icons.bell}
          <span className="topbar-icon-btn__badge" />
        </button>

        {/* Alerts */}
        <button className="topbar-icon-btn" aria-label="Alerts" title="Alerts">
          {Icons.alerts}
        </button>

        {/* User avatar */}
        <div
          className="topbar-avatar"
          role="button"
          tabIndex={0}
          aria-label="Account menu"
        >
          U
        </div>
      </div>
    </div>
  );
}

function ContentPlaceholder() {
  return (
    <div className="content-placeholder">
      <div className="content-placeholder__inner">
        <p className="content-placeholder__title">Content Area</p>
        <p className="content-placeholder__subtitle">
          Page components will render here
        </p>
      </div>
    </div>
  );
}
