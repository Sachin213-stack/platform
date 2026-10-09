import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../../shared/components/Button';
import { Card, CardHeader, CardBody } from '../../../shared/components/Card';
import { Badge } from '../../../shared/components/Badge';
import {
  generateBusinessId,
  generateTrackingSnippet,
  verifySnippetInstallation,
} from '../onboardingConfig';
import { apiKeysApi, dashboardApi } from '../../../shared/services/apiClient';

export function Step2TrackingSnippet({
  formData,
  onChange,
  onNext,
  onBack,
  onCancel,
}) {

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('html'); // 'html' | 'gtm' | 'react' | 'shopify'
  const [verificationState, setVerificationState] = useState(
    formData.verificationStatus === 'success' ? 'checking' : (formData.verificationStatus || 'idle')
  );
  const [verificationResult, setVerificationResult] = useState(formData.verificationResult || null);
  const [liveEventCount, setLiveEventCount] = useState(0);

  // Ensure Business ID exists and matches Postgres UUID format
  useEffect(() => {
    const isCurrentValidUuid = formData.businessId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(formData.businessId);
    if (!isCurrentValidUuid) {
      const targetId = generateBusinessId();
      onChange('businessId', targetId);
    }
  }, [formData.businessId, onChange]);

  const businessId = (formData.businessId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(formData.businessId))
    ? formData.businessId
    : generateBusinessId();

  // Retrieve or generate publishable API key (pk_live_...) for this business
  const [apiKey, setApiKey] = useState(() => {
    const stored = formData.apiKey || localStorage.getItem(`aicto_pk_key_${businessId}`) || '';
    return stored.startsWith('pk_') ? stored : '';
  });
  const [isRegenerating, setIsRegenerating] = useState(false);

  async function handleRegenerateKey() {
    setIsRegenerating(true);
    try {
      const res = await apiKeysApi.regeneratePublishableKey(businessId);
      if (res && res.publishable_key) {
        setApiKey(res.publishable_key);
        onChange('apiKey', res.publishable_key);
        localStorage.setItem(`aicto_pk_key_${businessId}`, res.publishable_key);
      }
    } catch (err) {
      console.error('Failed to regenerate publishable key:', err);
    } finally {
      setIsRegenerating(false);
    }
  }

  useEffect(() => {
    let isMounted = true;
    async function loadOrCreateKey() {
      try {
        const storedKey = formData.apiKey || localStorage.getItem(`aicto_pk_key_${businessId}`);
        if (storedKey && storedKey.startsWith('pk_')) {
          if (isMounted) setApiKey(storedKey);
          return;
        }
        const res = await apiKeysApi.getPublishableKey(businessId);
        if (res && res.publishable_key && isMounted) {
          setApiKey(res.publishable_key);
          onChange('apiKey', res.publishable_key);
          localStorage.setItem(`aicto_pk_key_${businessId}`, res.publishable_key);
          return;
        }
      } catch (err) {
        console.warn('Could not fetch publishable key:', err);
        const fallbackKey = `pk_live_${businessId.replace(/-/g, '').slice(0, 24)}`;
        if (isMounted) {
          setApiKey(fallbackKey);
          onChange('apiKey', fallbackKey);
          localStorage.setItem(`aicto_pk_key_${businessId}`, fallbackKey);
        }
      }
    }
    loadOrCreateKey();
    return () => { isMounted = false; };
  }, [businessId, formData.apiKey, onChange]);

  const snippetCode = generateTrackingSnippet(businessId, apiKey);


  // 1. Initial Mount Check: Always consult real backend state (never assume success from localStorage draft)
  useEffect(() => {
    let isMounted = true;
    async function checkInitialBackendState() {
      if (!businessId) return;
      try {
        // Note: do NOT pass apiKey here — the verify endpoint rejects pk_ publishable keys.
        // Bearer token (set automatically by apiClient) is the correct auth for verify.
        const result = await verifySnippetInstallation({
          businessId,
          websiteUrl: formData.websiteUrl,
        });
        if (!isMounted) return;
        if (result.success && result.verified) {
          setVerificationState('success');
          setVerificationResult(result);
          setLiveEventCount(result.eventCount || 1);
          onChange('verificationStatus', 'success');
          onChange('verificationResult', result);
        } else {
          setVerificationState('idle');
          setVerificationResult(null);
          setLiveEventCount(0);
          if (formData.verificationStatus === 'success') {
            onChange('verificationStatus', 'idle');
            onChange('verificationResult', null);
          }
        }
      } catch {
        if (!isMounted) return;
        setVerificationState('idle');
        setVerificationResult(null);
        setLiveEventCount(0);
      }
    }

    checkInitialBackendState();
    return () => { isMounted = false; };
  }, [businessId]); // run once per businessId resolution; apiKey excluded to avoid pk_ 403

  // 2. Auto-Detection Polling: Poll backend while unverified, with exponential backoff.
  //    Backoff schedule: 5s → 10s → 30s → 60s (capped).
  //    NOTE: Never pass apiKey to verify — pk_ publishable keys are rejected with 403.
  //    onChange is intentionally excluded from the dep array: it is a prop that may be
  //    recreated on every parent render, which would tear down and restart the interval
  //    producing burst calls. businessId and verificationState are the actual sentinels.
  useEffect(() => {
    if (verificationState === 'success' || !businessId) return;
    let isCancelled = false;
    let consecutiveFails = 0;
    const BACKOFF = [5000, 10000, 30000, 60000];

    function getDelay() {
      return BACKOFF[Math.min(consecutiveFails, BACKOFF.length - 1)];
    }

    let timeoutId;

    async function poll() {
      if (isCancelled) return;
      try {
        const result = await verifySnippetInstallation({
          businessId,
          websiteUrl: formData.websiteUrl,
          // no apiKey — Bearer token used automatically by apiClient
        });
        if (!isCancelled && result.success && result.verified) {
          setVerificationState('success');
          setVerificationResult(result);
          setLiveEventCount(result.eventCount || 1);
          onChange('verificationStatus', 'success');
          onChange('verificationResult', result);
          return; // stop polling — verified
        }
        // Not verified yet — not an error, reset fail count
        consecutiveFails = 0;
      } catch {
        // Network/auth failure: back off
        consecutiveFails = Math.min(consecutiveFails + 1, BACKOFF.length - 1);
      }
      if (!isCancelled) {
        timeoutId = setTimeout(poll, getDelay());
      }
    }

    // Start first poll after initial delay
    timeoutId = setTimeout(poll, getDelay());

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [verificationState, businessId]); // onChange and formData.websiteUrl excluded intentionally (see comment above)

  // 3. Live Streaming Ticker: When verified, refresh real event count directly from backend
  useEffect(() => {
    if (verificationState !== 'success' || !businessId) return;
    let isCancelled = false;

    async function fetchAuthenticEventCount() {
      try {
        const metrics = await dashboardApi.getMetrics(businessId);
        if (!isCancelled && metrics) {
          const count = metrics.total_events_count ?? metrics.total_events ?? 0;
          if (count > 0) {
            setLiveEventCount(count);
          }
        }
      } catch {
        // Quiet catch for background count polling
      }
    }

    const interval = setInterval(fetchAuthenticEventCount, 4000);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [verificationState, businessId]);

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(snippetCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleVerify = async () => {
    setVerificationState('checking');
    try {
      // Note: do NOT pass apiKey — Bearer token is correct for the verify endpoint.
      const result = await verifySnippetInstallation({
        businessId,
        websiteUrl: formData.websiteUrl,
      });

      if (result.success && result.verified) {
        setVerificationState('success');
        setVerificationResult(result);
        setLiveEventCount(result.eventCount || 1);
        onChange('verificationStatus', 'success');
        onChange('verificationResult', result);
      } else {
        setVerificationState('failed');
        setVerificationResult(result);
        setLiveEventCount(0);
        onChange('verificationStatus', 'failed');
        onChange('verificationResult', result);
      }
    } catch (err) {
      const failureResult = {
        success: false,
        verified: false,
        error: err?.message || 'Connection to verification service timed out. Telemetry beacon not detected.',
      };
      setVerificationState('failed');
      setVerificationResult(failureResult);
      setLiveEventCount(0);
      onChange('verificationStatus', 'failed');
      onChange('verificationResult', failureResult);
    }
  };

  const handleSkipInstallation = () => {
    onChange('verificationStatus', 'skipped');
    onChange('verificationResult', null);
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
                <div className="onboarding-biz-id-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span className="onboarding-biz-id-pill__label">Publishable Key:</span>
                  <code className="onboarding-biz-id-pill__code">{apiKey}</code>
                  <button
                    type="button"
                    onClick={handleRegenerateKey}
                    disabled={isRegenerating}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-primary-400, #818cf8)',
                      cursor: isRegenerating ? 'not-allowed' : 'pointer',
                      fontSize: '11px',
                      textDecoration: 'underline',
                      padding: '0 2px',
                    }}
                    title="Generate a fresh publishable key for this business"
                  >
                    {isRegenerating ? 'Regenerating...' : 'Regenerate'}
                  </button>
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
                💡 <strong>Next.js App Router:</strong> Place inside your root <code>app/layout.jsx</code> using Next’s <code>&lt;Script src="{snippetCode.match(/src="([^"]+)"/)?.[1] || '/static/tracker.js'}" data-business-id="{businessId}" data-api-key="{apiKey}" strategy="afterInteractive" /&gt;</code>.
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
                    <h4 className="onboarding-verify-title">Waiting for your tracking script...</h4>
                    <p className="onboarding-verify-desc">
                      Install the snippet on your website ({formData.websiteUrl || 'your website'}) and we'll automatically verify it.
                    </p>
                  </>
                )}

                {verificationState === 'checking' && (
                  <>
                    <h4 className="onboarding-verify-title">Checking for incoming telemetry...</h4>
                    <p className="onboarding-verify-desc">
                      Listening for incoming telemetry events from {formData.websiteUrl || 'your website'}...
                    </p>
                  </>
                )}

                {verificationState === 'success' && (
                  <>
                    <h4 className="onboarding-verify-title onboarding-verify-title--success">
                      ✓ Snippet detected — telemetry is now live
                    </h4>
                    <p className="onboarding-verify-desc">
                      {verificationResult?.clusterRegion ? (
                        <>Connected to <strong>{verificationResult.clusterRegion}</strong>{verificationResult?.firstEventLatency ? ` with ${verificationResult.firstEventLatency} latency.` : '.'}</>
                      ) : (
                        <>Telemetry stream confirmed active for Business ID <strong>{businessId}</strong>.</>
                      )}
                      {verificationResult?.detectedAt && (
                        <span style={{ display: 'block', marginTop: '4px', fontSize: '12px', opacity: 0.85 }}>
                          First event received: {new Date(verificationResult.detectedAt).toLocaleTimeString()}
                        </span>
                      )}
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
                      Snippet not detected
                    </h4>
                    <p className="onboarding-verify-desc">
                      {verificationResult?.error || "We haven't received telemetry from your website yet. Make sure the snippet is installed inside your <head> tag and transmits events."}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="onboarding-verify-box__actions">
              {verificationState === 'idle' && (
                <Button
                  variant="primary"
                  onClick={handleVerify}
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
                    onClick={handleVerify}
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
            disabled={verificationState !== 'success'}
            title={verificationState !== 'success' ? 'Verify snippet installation to continue, or click "Skip for now" below' : ''}
            iconRight={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            }
          >
            {verificationState === 'success' ? 'Continue to KPI Setup' : 'Continue to KPI Setup'}
          </Button>
        </div>
      </div>
    </div>
  );
}
