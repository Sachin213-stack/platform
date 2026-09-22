import React, { createContext, useContext, useState, useCallback } from 'react';
import './Toast.css';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    let text = message;
    let toastType = type;
    if (message && typeof message === 'object') {
      text = message.message || message.detail || message.title || JSON.stringify(message);
      if (message.variant) toastType = message.variant;
      else if (message.type) toastType = message.type;
    }
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message: String(text || ''), type: toastType }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="ui-toast-container" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`ui-toast ui-toast--${toast.type}`}>
            <div className="ui-toast__icon">
              {toast.type === 'success' && (
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="4 10 8 14 16 6" />
                </svg>
              )}
              {toast.type === 'error' && (
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="10" cy="10" r="8" />
                  <line x1="10" y1="6" x2="10" y2="10" />
                  <circle cx="10" cy="14" r="0.5" fill="currentColor" />
                </svg>
              )}
              {toast.type === 'warning' && (
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 3L2 17h16L10 3z" />
                  <line x1="10" y1="8" x2="10" y2="12" />
                  <circle cx="10" cy="14.5" r="0.5" fill="currentColor" />
                </svg>
              )}
              {toast.type === 'info' && (
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="10" cy="10" r="8" />
                  <line x1="10" y1="10" x2="10" y2="14" />
                  <circle cx="10" cy="6.5" r="0.5" fill="currentColor" />
                </svg>
              )}
            </div>
            <div className="ui-toast__message">{toast.message}</div>
            <button
              className="ui-toast__close"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      addToast: (msg) => console.log('Toast:', msg),
    };
  }
  return ctx;
}
