import React, { useState } from 'react';
import './AuthModal.css';
import { authApi } from '../services/apiClient';

export function AuthModal({
  isOpen,
  initialTab = 'login', // 'login' | 'register'
  onClose,
  onSuccess,
}) {
  const [tab, setTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [fullName, setFullName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        const data = await authApi.login({ email, password });
        if (onSuccess) onSuccess(data);
      } else {
        const data = await authApi.register({
          business_name: businessName || `${email.split('@')[0]} Org`,
          email,
          password,
          full_name: fullName || email.split('@')[0],
        });
        if (onSuccess) onSuccess(data);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await authApi.demoLogin();
      if (onSuccess) onSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message || 'Could not connect to demo session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-portal" role="dialog" aria-modal="true">
      <div className="auth-modal-backdrop" onClick={onClose} />

      <div className="auth-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="auth-modal-header">
          <div className="auth-modal-header__brand">
            <div className="auth-modal-header__icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <path d="M7 8h10M7 12h7M7 16h4" />
              </svg>
            </div>
            <div>
              <h3 className="auth-modal-header__title">AI-CTO Platform</h3>
              <p className="auth-modal-header__subtitle">Autonomous Engineering Intelligence</p>
            </div>
          </div>

          <button
            type="button"
            className="auth-modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="auth-modal-tabs">
          <button
            type="button"
            className={`auth-modal-tab-btn ${tab === 'login' ? 'auth-modal-tab-btn--active' : ''}`}
            onClick={() => {
              setTab('login');
              setError(null);
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-modal-tab-btn ${tab === 'register' ? 'auth-modal-tab-btn--active' : ''}`}
            onClick={() => {
              setTab('register');
              setError(null);
            }}
          >
            Create Account
          </button>
        </div>

        {/* Body */}
        <div className="auth-modal-body">
          {error && (
            <div className="auth-modal-error" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form className="auth-modal-form" onSubmit={handleSubmit}>
            {tab === 'register' && (
              <>
                <div className="auth-field-group">
                  <label className="auth-label">Business / Team Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Retail Global"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="auth-input"
                  />
                </div>

                <div className="auth-field-group">
                  <label className="auth-label">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Jane Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="auth-input"
                  />
                </div>
              </>
            )}

            <div className="auth-field-group">
              <label className="auth-label">Work Email</label>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
              />
            </div>

            <div className="auth-field-group">
              <label className="auth-label">Password</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
              />
            </div>

            <button
              type="submit"
              className="auth-modal-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span>Connecting to Backend...</span>
              ) : tab === 'login' ? (
                <span>Sign In to Platform</span>
              ) : (
                <span>Create Workspace Account</span>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>OR INSTANT SANDBOX</span>
          </div>

          <button
            type="button"
            className="auth-demo-btn"
            onClick={handleDemoAccess}
            disabled={loading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span>Quick Demo Access (Apex Retail Tenant)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
