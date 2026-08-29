import React from 'react';
import { Button } from './Button';
import './EmptyState.css';

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`ui-empty-state ${className}`}>
      {icon && <div className="ui-empty-state__icon">{icon}</div>}
      <h4 className="ui-empty-state__title">{title}</h4>
      {description && <p className="ui-empty-state__description">{description}</p>}
      {actionLabel && onAction && (
        <div className="ui-empty-state__action">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
