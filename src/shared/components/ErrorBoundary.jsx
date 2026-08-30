import React from 'react';
import { Button } from './Button';
import './ErrorBoundary.css';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      copied: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  componentDidUpdate(prevProps) {
    // Automatically reset error boundary if the resetKey or route changes
    if (this.props.resetKey !== undefined && prevProps.resetKey !== this.props.resetKey) {
      if (this.state.hasError) {
        this.resetError();
      }
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      copied: false,
    });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleGoDashboard = () => {
    this.resetError();
    if (this.props.onNavigate) {
      this.props.onNavigate('dashboard');
    }
  };

  handleCopyError = () => {
    const errorText = `${this.state.error?.toString()}\n\nComponent Stack:\n${
      this.state.errorInfo?.componentStack || 'No component stack'
    }`;
    navigator.clipboard.writeText(errorText);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2000);
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function'
          ? this.props.fallback({ error: this.state.error, resetError: this.resetError })
          : this.props.fallback;
      }

      const routeName = this.props.routeName || 'this page';

      return (
        <div className="ui-error-boundary" role="alert">
          <div className="ui-error-card">
            <div className="ui-error-header">
              <div className="ui-error-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>

              <div className="ui-error-title-group">
                <h3 className="ui-error-title">
                  Something went wrong loading {routeName}
                </h3>
                <p className="ui-error-subtitle">
                  An unexpected error occurred while rendering this component. The rest of the platform remains active. You can reload this view or navigate back to the dashboard.
                </p>
              </div>
            </div>

            <button
              className="ui-error-details-toggle"
              onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
              type="button"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{
                  transform: this.state.showDetails ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.15s ease',
                }}
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <span>{this.state.showDetails ? 'Hide technical diagnostics' : 'Show technical diagnostics'}</span>
            </button>

            {this.state.showDetails && (
              <div className="ui-error-details-box">
                <div className="ui-error-details-header">
                  <span>ERROR TRACE</span>
                  <button
                    onClick={this.handleCopyError}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--color-border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--color-text-secondary)',
                      fontSize: '10px',
                      padding: '2px 6px',
                      cursor: 'pointer',
                    }}
                    type="button"
                  >
                    {this.state.copied ? 'Copied to clipboard' : 'Copy stack trace'}
                  </button>
                </div>
                <pre className="ui-error-stack">
                  {this.state.error?.toString() || 'Unknown Error'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            )}

            <div className="ui-error-actions">
              <Button variant="primary" size="md" onClick={this.resetError}>
                Reload View
              </Button>
              {this.props.onNavigate && (
                <Button variant="secondary" size="md" onClick={this.handleGoDashboard}>
                  Go to Dashboard
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
