import React, { useEffect, useCallback } from 'react';
import './Modal.css';

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = '540px',
  className = '',
}) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="ui-modal-portal" role="dialog" aria-modal="true">
      <div className="ui-modal__backdrop" onClick={onClose} />
      <div className="ui-modal__wrapper">
        <div
          className={`ui-modal__dialog ${className}`}
          style={{ maxWidth }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="ui-modal__header">
            <div>
              {title && <h2 className="ui-modal__title">{title}</h2>}
              {subtitle && <p className="ui-modal__subtitle">{subtitle}</p>}
            </div>
            <button
              className="ui-modal__close-btn"
              onClick={onClose}
              aria-label="Close dialog"
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="5" x2="15" y2="15" />
                <line x1="15" y1="5" x2="5" y2="15" />
              </svg>
            </button>
          </div>

          <div className="ui-modal__body">{children}</div>

          {footer && <div className="ui-modal__footer">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
