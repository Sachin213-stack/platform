import React from 'react';
import './Button.css';

export function Button({
  children,
  type = 'button',
  variant = 'secondary', // 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon,
  iconRight,
  loading = false,
  disabled = false,
  className = '',
  onClick,
  ...props
}) {
  const classes = [
    'ui-btn',
    `ui-btn--${variant}`,
    `ui-btn--${size}`,
    loading && 'ui-btn--loading',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <span className="ui-btn__spinner" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" />
          </svg>
        </span>
      )}
      {!loading && icon && <span className="ui-btn__icon">{icon}</span>}
      <span className="ui-btn__label">{children}</span>
      {!loading && iconRight && <span className="ui-btn__icon ui-btn__icon--right">{iconRight}</span>}
    </button>
  );
}
