import React from 'react';
import './ToggleRow.css';

export function ToggleRow({
  title,
  description,
  checked,
  onChange,
  disabled = false,
  badge,
  icon,
  className = '',
  id,
}) {
  const inputId = id || (title ? `toggle-${title.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={`ui-toggle-row ${disabled ? 'ui-toggle-row--disabled' : ''} ${className}`}>
      <div className="ui-toggle-row__content">
        {icon && <div className="ui-toggle-row__icon">{icon}</div>}
        <div className="ui-toggle-row__text">
          <label htmlFor={inputId} className="ui-toggle-row__title">
            <span>{title}</span>
            {badge && <span className="ui-toggle-row__badge">{badge}</span>}
          </label>
          {description && <p className="ui-toggle-row__description">{description}</p>}
        </div>
      </div>
      <div className="ui-toggle-row__control">
        <label className="ui-switch" htmlFor={inputId}>
          <input
            type="checkbox"
            id={inputId}
            checked={checked}
            onChange={(e) => onChange && onChange(e.target.checked)}
            disabled={disabled}
          />
          <span className="ui-switch__slider" />
        </label>
      </div>
    </div>
  );
}
