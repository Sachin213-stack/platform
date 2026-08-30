import React from 'react';

const BUSINESS_TYPES = [
  {
    id: 'ecommerce',
    name: 'E-Commerce & Retail',
    description: 'Cart checkouts, flash sales, inventory sync',
    metric: '99.99% checkout uptime',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
  },
  {
    id: 'saas',
    name: 'B2B SaaS Platforms',
    description: 'Multi-tenant APIs, token auth, microservices',
    metric: '< 180ms p99 latency SLA',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
      </svg>
    ),
  },
  {
    id: 'marketplace',
    name: 'Real-Time Marketplaces',
    description: 'Live order matching, driver/buyer dispatch',
    metric: 'Zero-drop event queue',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 3 21 3 21 8" />
        <line x1="4" y1="20" x2="21" y2="3" />
        <polyline points="21 16 21 21 16 21" />
        <line x1="15" y1="15" x2="21" y2="21" />
        <line x1="4" y1="4" x2="9" y2="9" />
      </svg>
    ),
  },
  {
    id: 'content',
    name: 'Media & Streaming',
    description: 'CDN edge delivery, video assets, high throughput',
    metric: '98.5% CDN hit ratio',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),
  },
  {
    id: 'fintech',
    name: 'FinTech & Banking',
    description: 'High-security ledger, transaction webhooks',
    metric: 'SOC-2 readiness',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
  },
];

export function BuiltForStrip() {
  return (
    <div className="built-for-strip">
      <div className="built-for-strip__container">
        <div className="built-for-strip__header">
          <span className="built-for-strip__label">Built for High-Scale Digital Operations</span>
          <span className="built-for-strip__line" />
        </div>

        <div className="built-for-strip__grid">
          {BUSINESS_TYPES.map((b) => (
            <div key={b.id} className="built-for-strip__item">
              <div className="built-for-strip__icon">{b.icon}</div>
              <div className="built-for-strip__content">
                <div className="built-for-strip__name">{b.name}</div>
                <div className="built-for-strip__meta">{b.description}</div>
              </div>
              <span className="built-for-strip__metric-badge">{b.metric}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
