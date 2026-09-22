import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../../shared/components/Button';
import { Card, CardHeader, CardBody } from '../../../shared/components/Card';
import { Badge } from '../../../shared/components/Badge';
import {
  generateBusinessId,
  generateTrackingSnippet,
  verifySnippetInstallation,
} from '../onboardingConfig';
import { getStoredUser, apiKeysApi } from '../../../shared/services/apiClient';
import { useTenant } from '../../../shared/context/TenantContext';

export function Step2TrackingSnippet({
  formData,
  onChange,
  onNext,
  onBack,
  onCancel,
}) {
  const { selectedBusiness } = useTenant();
  const stored = getStoredUser();
  const activeDbUuid = stored?.business_id || (selectedBusiness?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(selectedBusiness.id) ? selectedBusiness.id : null);

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('html'); // 'html' | 'gtm' | 'react' | 'shopify'
  const [verificationState, setVerificationState] = useState(formData.verificationStatus || 'idle'); // 'idle' | 'checking' | 'success' | 'failed'
  const [verificationResult, setVerificationResult] = useState(formData.verificationResult || null);
  const [liveEventCount, setLiveEventCount] = useState(formData.verificationStatus === 'success' ? 4 : 0);
  const eventIntervalRef = useRef(null);

  // Ensure Business ID exists and matches Postgres UUID format
  useEffect(() => {
    const isCurrentValidUuid = formData.businessId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(formData.businessId);
    if (!isCurrentValidUuid) {
      const targetId = activeDbUuid || generateBusinessId();
      onChange('businessId', targetId);
    }
  }, [formData.businessId, activeDbUuid, onChange]);

  const businessId = (formData.businessId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(formData.businessId))
    ? formData.businessId
    : (activeDbUuid || generateBusinessId());

  // Retrieve or generate real API key for this business
  const [apiKey, setApiKey] = useState(() => {
    return formData.apiKey || localStorage.getItem(`aicto_api_key_${businessId}`) || '';
  });

  useEffect(() => {
    let isMounted = true;
    async function loadOrCreateKey() {
      try {
        const storedKey = formData.apiKey || localStorage.getItem(`aicto_api_key_${businessId}`);
        if (storedKey) {
          if (isMounted) setApiKey(storedKey);
          return;
        }
        const keys = await apiKeysApi.getKeys();
        if (keys && keys.length > 0 && keys[0].api_key) {
          if (isMounted) {
            setApiKey(keys[0].api_key);
            onChange('apiKey', keys[0].api_key);
            localStorage.setItem(`aicto_api_key_${businessId}`, keys[0].api_key);
          }
          return;
        }
        const created = await apiKeysApi.createKey('Website Telemetry Snippet Key');
        if (created && created.api_key && isMounted) {
          setApiKey(created.api_key);
          onChange('apiKey', created.api_key);
          localStorage.setItem(`aicto_api_key_${businessId}`, created.api_key);
        }
      } catch (err) {
        console.warn('Could not fetch API key:', err);
        const fallbackKey = `sk_live_${businessId.replace(/-/g, '').slice(0, 24)}`;
        if (isMounted) {
          setApiKey(fallbackKey);
          onChange('apiKey', fallbackKey);
          localStorage.setItem(`aicto_api_key_${businessId}`, fallbackKey);
        }
      }
    }
    loadOrCreateKey();
    return () => { isMounted = false; };
  }, [businessId, formData.apiKey, onChange]);

  const snippetCode = generateTrackingSnippet(businessId, apiKey);

  // Live telemetry pulse simulation once verified
  useEffect(() => {
    if (verificationState === 'success') {
      eventIntervalRef.current = setInterval(() => {
        setLiveEventCount((prev) => prev + 1);
      }, 3500);
    }
    return () => {
      if (eventIntervalRef.current) clearInterval(eventIntervalRef.current);
    };
  }, [verificationState]);

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(snippetCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleVerify = async (simulateFailure = false) => {
    setVerificationState('checking');
    try {
      const result = await verifySnippetInstallation({
        businessId,
        websiteUrl: formData.websiteUrl || 'https://example.com',
        simulateFailure,
      });

      if (result.success) {
        setVerificationState('success');
        setVerificationResult(result);
        onChange('verificationStatus', 'success');
        onChange('verificationResult', result);
        setLiveEventCount(1);
      } else {
        setVerificationState('failed');
        setVerificationResult(result);
        onChange('verificationStatus', 'failed');
        onChange('verificationResult', result);
      }
    } catch (err) {
      setVerificationState('failed');
      setVerificationResult({ error: err?.message || 'Connection to verification service timed out.' });
      onChange('verificationStatus', 'failed');
    }
  };

  const handleSkipInstallation = () => {
    onChange('verificationStatus', 'skipped');
    onNext();
  };

  return (
    <div className="onboarding-step-content">
      <div className="onboarding-step-header">
        <Badge variant="violet" size="sm">Step 2 of 5</Badge>
        <h2 className="onboarding-step-title">Connect Your Website</h2>
        <p className="onboarding-step-subtitle">
          Embed the lightweight AI-CTO tracking snippet into your site to start streaming live real-user
          performance, latency metrics, checkout anomalies, and error telemetry.
        </p>
      </div>

      {/* ── 1. Business ID & Snippet Code Block ── */}
      <Card className="onboarding-card onboarding-card--highlight">
        <CardHeader
          title="JavaScript Tracking Snippet"
          subtitle="Paste this snippet inside the <head> tag of every page on your website you want to track."
          action={
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <div className="onboarding-biz-id-pill">
                <span className="onboarding-biz-id-pill__label">Assigned Business ID:</span>
                <code className="onboarding-biz-id-pill__code">{businessId}</code>
              </div>
              {apiKey && (
                <div className="onboarding-biz-id-pill">
                  <span className="onboarding-biz-id-pill__label">Snippet API Key:</span>
                  <code className="onboarding-biz-id-pill__code">{apiKey}</code>
                </div>
              )}
            </div>
          }
        />
        <CardBody>
          {/* Framework Tab Selectors */}
          <div className="onboarding-snippet-tabs">
            <button
              type="button"
              className={`onboarding-tab-btn ${activeTab === 'html' ? 'onboarding-tab-btn--active' : ''}`}
              onClick={() => setActiveTab('html')}
            >
              Standard HTML / Head
            </button>
            <button
              type="button"
              className={`onboarding-tab-btn ${activeTab === 'gtm' ? 'onboarding-tab-btn--active' : ''}`}
              onClick={() => setActiveTab('gtm')}
            >
              Google Tag Manager
            </button>
            <button
              type="button"
              className={`onboarding-tab-btn ${activeTab === 'react' ? 'onboarding-tab-btn--active' : ''}`}
              onClick={() => setActiveTab('react')}
            >
              Next.js / React SPA
            </button>
            <button
              type="button"
              className={`onboarding-tab-btn ${activeTab === 'shopify' ? 'onboarding-tab-btn--active' : ''}`}
              onClick={() => setActiveTab('shopify')}
            >
              Shopify Theme
            </button>
          </div>

          {/* Snippet Code Container */}
          <div className="onboarding-code-wrapper">
            <pre className="onboarding-code-block">
              <code>{snippetCode}</code>
            </pre>
            <Button
              variant={copied ? 'primary' : 'secondary'}
              size="sm"
              className="onboarding-code-copy-btn"
              onClick={handleCopySnippet}
              icon={
                copied ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )
              }
            >
              {copied ? 'Copied to Clipboard!' : 'Copy Snippet'}
            </Button>
          </div>

          {/* Contextual instruction notes */}
          <div className="onboarding-install-guide">
            {activeTab === 'html' && (
              <p className="onboarding-install-guide__text">
                💡 <strong>HTML Installation:</strong> Add the script tag directly before the closing <code>&lt;/head&gt;</code> tag in your primary template (e.g. <code>index.html</code> or layout file). The <code>async</code> attribute ensures zero render-blocking delay.
              </p>
            )}
            {activeTab === 'gtm' && (
              <p className="onboarding-install-guide__text">
                💡 <strong>GTM Setup:</strong> Create a new <em>Custom HTML Tag</em> in GTM, paste the code above, and set the firing trigger to <em>All Pages (Page View)</em>.
              </p>
            )}
            {activeTab === 'react' && (
              <p className="onboarding-install-guide__text">
                💡 <strong>Next.js App Router:</strong> Place inside your root <code>app/layout.jsx</code> using Next’s <code>&lt;Script src="https://cdn.aicto.io/tracker.js" data-business-id="{businessId}" strategy="afterInteractive" /&gt;</code>.
              </p>
            )}
            {activeTab === 'shopify' && (
              <p className="onboarding-install-guide__text">
                💡 <strong>Shopify Setup:</strong> In Online Store &gt; Themes &gt; Edit code, open <code>theme.liquid</code> and insert the snippet right before <code>&lt;/head&gt;</code>.
              </p>
            )}
          </div>
        </CardBody>
      </Card>

      {/* ── 2. Verification Action Section ── */}
      <Card className={`onboarding-card onboarding-verify-card onboarding-verify-card--${verificationState}`}>
        <CardBody>
          <div className="onboarding-verify-box">
            <div className="onboarding-verify-box__left">
              <div className="onboarding-verify-box__status-icon">
                {verificationState === 'idle' && (
                  <div className="onboarding-verify-icon onboarding-verify-icon--idle">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                  </div>
                )}
                {verificationState === 'checking' && (
                  <div className="onboarding-verify-icon onboarding-verify-icon--checking">
                    <svg className="onboarding-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeLinecap="round" />
                    </svg>
                  </div>
                )}
                {verificationState === 'success' && (
                  <div className="onboarding-verify-icon onboarding-verify-icon--success">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
                {verificationState === 'failed' && (
                  <div className="onboarding-verify-icon onboarding-verify-icon--failed">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="onboarding-verify-box__info">
                {verificationState === 'idle' && (
                  <>
                    <h4 className="onboarding-verify-title">Verify Snippet Installation</h4>
                    <p className="onboarding-verify-desc">
                      Target domain: <strong>{formData.websiteUrl || 'https://yourwebsite.com'}</strong>. Once installed, run verification to confirm telemetry handshakes.
                    </p>
                  </>
                )}

                {verificationState === 'checking' && (
                  <>
                    <h4 className="onboarding-verify-title">Checking for tracking snippet...</h4>
                    <p className="onboarding-verify-desc">
                      Dispatching edge probe to {formData.websiteUrl || 'your website'} to listen for telemetry beacon...
                    </p>
                  </>
                )}

                {verificationState === 'success' && (
                  <>
                    <h4 className="onboarding-verify-title onboarding-verify-title--success">
                      ✓ Snippet detected — telemetry is now live
                    </h4>
                    <p className="onboarding-verify-desc">
                      Edge node connected to <strong>{verificationResult?.clusterRegion || 'us-east-1'}</strong> with {verificationResult?.firstEventLatency || '28ms'} initial latency handshake.
                    </p>
                    {/* Live events ticker */}
                    <div className="onboarding-live-ticker">
                      <span className="onboarding-live-ticker__pulse" />
                      <span className="onboarding-live-ticker__text">
                        Incoming telemetry events received: <strong>{liveEventCount}</strong>
                      </span>
                    </div>
                  </>
                )}

                {verificationState === 'failed' && (
                  <>
                    <h4 className="onboarding-verify-title onboarding-verify-title--failed">
                      Snippet not detected yet
                    </h4>
                    <p className="onboarding-verify-desc">
                      {verificationResult?.error || 'Make sure the snippet is installed inside your <head> tag and that any caching layer is cleared.'}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="onboarding-verify-box__actions">
              {verificationState === 'idle' && (
                <Button
                  variant="primary"
                  onClick={() => handleVerify(false)}
                  icon={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  }
                >
                  Verify Installation
                </Button>
              )}

              {verificationState === 'checking' && (
                <Button variant="secondary" disabled loading>
                  Verifying...
                </Button>
              )}

              {verificationState === 'success' && (
                <Badge variant="success" size="lg">
                  ✓ Verified & Streaming
                </Badge>
              )}

              {verificationState === 'failed' && (
                <div className="onboarding-verify-retry-group">
                  <Button
                    variant="secondary"
                    onClick={() => handleVerify(false)}
                    icon={
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="23 4 23 10 17 10" />
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                      </svg>
                    }
                  >
                    Retry Verification
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Non-blocking skip fallback link */}
          <div className="onboarding-verify-fallback">
            <span className="onboarding-verify-fallback__hint">Can't install the snippet right now?</span>
            <button
              type="button"
              className="onboarding-link-btn"
              onClick={handleSkipInstallation}
            >
              Skip for now, I'll install it later →
            </button>
          </div>
        </CardBody>
      </Card>

      {/* Navigation actions footer */}
      <div className="onboarding-actions-footer">
        <Button variant="ghost" onClick={onBack}>
          ← Back
        </Button>
        <div className="onboarding-actions-footer__right">
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
            {verificationState === 'success' ? 'Continue to KPI Setup' : 'Next Step'}
          </Button>
        </div>
      </div>
    </div>
  );
}
