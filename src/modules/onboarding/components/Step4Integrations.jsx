import React, { useState } from 'react';
import { Button } from '../../../shared/components/Button';
import { Card, CardHeader, CardBody } from '../../../shared/components/Card';
import { Badge } from '../../../shared/components/Badge';
import { INTEGRATIONS_LIST } from '../onboardingConfig';

export function Step4Integrations({
  formData,
  onChange,
  onNext,
  onBack,
  onCancel,
}) {
  const [connectingId, setConnectingId] = useState(null);
  const connectedIntegrations = formData.connectedIntegrations || [];

  const handleToggleConnect = (integration) => {
    if (!integration.available) return;

    const isConnected = connectedIntegrations.includes(integration.id);
    if (isConnected) {
      // Disconnect
      onChange(
        'connectedIntegrations',
        connectedIntegrations.filter((id) => id !== integration.id)
      );
    } else {
      // Simulate quick OAuth / Webhook handshake
      setConnectingId(integration.id);
      setTimeout(() => {
        onChange('connectedIntegrations', [...connectedIntegrations, integration.id]);
        setConnectingId(null);
      }, 700);
    }
  };

  const handleSkip = () => {
    onNext();
  };

  const businessType = formData.businessType || 'ecommerce';

  return (
    <div className="onboarding-step-content">
      <div className="onboarding-step-header">
        <div className="onboarding-step-header__tags">
          <Badge variant="violet" size="sm">Step 4 of 5</Badge>
          <Badge variant="info" size="sm">Optional</Badge>
        </div>
        <h2 className="onboarding-step-title">Connect Platform Integrations</h2>
        <p className="onboarding-step-subtitle">
          Supercharge AI-CTO’s autonomous mitigation capabilities by linking your e-commerce platform,
          payment provider, CI/CD pipeline, and alerting channels.
        </p>
      </div>

      {/* ── Integration Grid ── */}
      <Card className="onboarding-card">
        <CardHeader
          title="Available Connectors"
          subtitle="Choose relevant services to stream backend events and dispatch automated mitigations."
          action={
            <span className="onboarding-integrations-count">
              {connectedIntegrations.length} connected
            </span>
          }
        />
        <CardBody>
          <div className="onboarding-integrations-grid">
            {INTEGRATIONS_LIST.map((item) => {
              const isConnected = connectedIntegrations.includes(item.id);
              const isRecommended = item.recommendedFor.includes(businessType);
              const isConnecting = connectingId === item.id;

              return (
                <div
                  key={item.id}
                  className={`onboarding-integration-card ${isConnected ? 'onboarding-integration-card--connected' : ''} ${!item.available ? 'onboarding-integration-card--disabled' : ''}`}
                >
                  <div className="onboarding-integration-card__top">
                    <div className="onboarding-integration-card__icon-wrapper">
                      {/* Visual Icon representation */}
                      <div className={`onboarding-integration-icon onboarding-integration-icon--${item.iconType}`}>
                        {item.iconType === 'shopify' && (
                          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M19.4 6.7c-.1-.3-.3-.4-.5-.4h-2.1c-.2-1.3-1.1-3.6-3.8-3.6-2.8 0-3.6 2.3-3.8 3.6H7.1c-.2 0-.4.1-.5.4L4.1 20.2c0 .2.1.4.3.5.1.1.2.1.4.1h14.4c.2 0 .3 0 .4-.1.2-.1.3-.3.3-.5l-2.5-13.5zm-6.4-2.5c1.7 0 2.2 1.6 2.4 2.5H10.6c.2-.9.7-2.5 2.4-2.5zm-5 14.5l1.9-10.5h2.2v1.5c0 .3.2.5.5.5s.5-.2.5-.5V8.2h3.8v1.5c0 .3.2.5.5.5s.5-.2.5-.5V8.2h2.2l1.9 10.5H8z"/>
                          </svg>
                        )}
                        {item.iconType === 'stripe' && (
                          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
                          </svg>
                        )}
                        {item.iconType === 'cloudflare' && (
                          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M19.4 12.5c-.3-2.8-2.6-5-5.4-5-1.5 0-2.8.6-3.8 1.6-.6-.4-1.4-.6-2.2-.6-2.2 0-4 1.8-4 4 0 .3 0 .6.1.9C2.4 13.9 1 15.8 1 18c0 2.8 2.2 5 5 5h13c2.8 0 5-2.2 5-5 0-2.5-1.8-4.6-4.2-5-.1-.2-.2-.3-.4-.5z"/>
                          </svg>
                        )}
                        {item.iconType === 'github' && (
                          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                          </svg>
                        )}
                        {item.iconType === 'slack' && (
                          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M6 15a2 2 0 1 1-2-2h2v2zm1 0a2 2 0 1 1 2 2v-2H7zm0-6a2 2 0 1 1-2-2 2 2 0 0 1 2 2v2zm6 1a2 2 0 1 1 2 2h-2v-2zm-1 0a2 2 0 1 1-2-2v2h2zm0 6a2 2 0 1 1 2 2 2 2 0 0 1-2-2v-2zm6-1a2 2 0 1 1-2-2h2v2zm-1-6a2 2 0 1 1-2 2V9h2zm0 0a2 2 0 1 1 2-2 2 2 0 0 1-2 2h-2z"/>
                          </svg>
                        )}
                        {item.iconType === 'datadog' && (
                          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14h-2v-2h2zm0-4h-2V7h2z"/>
                          </svg>
                        )}
                      </div>
                    </div>

                    <div className="onboarding-integration-card__badges">
                      {isRecommended && (
                        <Badge variant="violet" size="sm">Recommended</Badge>
                      )}
                      {!item.available && (
                        <Badge variant="subtle" size="sm">Coming Soon</Badge>
                      )}
                    </div>
                  </div>

                  <div className="onboarding-integration-card__body">
                    <h4 className="onboarding-integration-card__title">{item.name}</h4>
                    <p className="onboarding-integration-card__desc">{item.desc}</p>
                  </div>

                  <div className="onboarding-integration-card__footer">
                    {item.available ? (
                      <Button
                        variant={isConnected ? 'secondary' : 'primary'}
                        size="sm"
                        loading={isConnecting}
                        onClick={() => handleToggleConnect(item)}
                        icon={
                          isConnected ? (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : null
                        }
                      >
                        {isConnected ? 'Connected' : 'Connect'}
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" disabled>
                        In Development
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Navigation actions footer */}
      <div className="onboarding-actions-footer">
        <Button variant="ghost" onClick={onBack}>
          ← Back
        </Button>
        <div className="onboarding-actions-footer__right">
          <button type="button" className="onboarding-link-btn" onClick={handleSkip}>
            Skip this step →
          </button>
          <Button variant="ghost" onClick={onCancel}>
            Exit Setup
          </Button>
          <Button
            variant="primary"
            onClick={onNext}
            iconRight={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            }
          >
            Review & Finalize
          </Button>
        </div>
      </div>
    </div>
  );
}
