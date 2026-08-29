import React from 'react';
import './Card.css';

export function Card({
  children,
  className = '',
  variant = 'default', // 'default' | 'danger' | 'accent' | 'subtle'
  padding = 'normal', // 'none' | 'compact' | 'normal' | 'large'
  glow = false,
  ...props
}) {
  const classes = [
    'ui-card',
    `ui-card--${variant}`,
    `ui-card--p-${padding}`,
    glow && 'ui-card--glow',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className = '', children }) {
  return (
    <div className={`ui-card__header ${className}`}>
      <div className="ui-card__header-text">
        {title && <h3 className="ui-card__title">{title}</h3>}
        {subtitle && <p className="ui-card__subtitle">{subtitle}</p>}
      </div>
      {action && <div className="ui-card__header-action">{action}</div>}
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return <div className={`ui-card__body ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return <div className={`ui-card__footer ${className}`}>{children}</div>;
}
