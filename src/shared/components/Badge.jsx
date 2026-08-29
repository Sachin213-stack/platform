import React from 'react';
import './Badge.css';

export function Badge({
  children,
  variant = 'neutral', // 'violet' | 'success' | 'warning' | 'error' | 'info' | 'neutral'
  size = 'md', // 'sm' | 'md'
  dot = false,
  className = '',
}) {
  const classes = [
    'ui-badge',
    `ui-badge--${variant}`,
    `ui-badge--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes}>
      {dot && <span className="ui-badge__dot" />}
      {children}
    </span>
  );
}
