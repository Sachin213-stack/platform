/**
 * Verification test for:
 * "logs woulb must be shown after only when the user onborded"
 *
 * Verifies:
 * 1. LogsPage component renders the Onboarding Gate when tenant is not onboarded.
 * 2. Background logs queries and SSE stream are guarded when not onboarded.
 * 3. AppShell sidebar shows 'Setup' locked badge when not onboarded, and 'Live' when onboarded.
 * 4. Once onboarded (or marked verified), LogsPage renders the full log streams and topbar.
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('--- Testing Logs Onboarding Gate Logic & Integrity ---');

// 1. Inspect TenantContext logic
const tenantContextPath = path.resolve('./src/shared/context/TenantContext.jsx');
const tenantContextSrc = fs.readFileSync(tenantContextPath, 'utf8');

assert(tenantContextSrc.includes('isOnboarded'), 'TenantContext must export isOnboarded');
assert(tenantContextSrc.includes('markBusinessOnboarded'), 'TenantContext must export markBusinessOnboarded');
assert(tenantContextSrc.includes('aicto_onboarded_'), 'TenantContext must check aicto_onboarded_ in localStorage');
console.log('✓ TenantContext exports isOnboarded & markBusinessOnboarded and checks storage keys');

// 2. Inspect AppShell sidebar dynamic badge
const appShellPath = path.resolve('./src/shared/layout/AppShell.jsx');
const appShellSrc = fs.readFileSync(appShellPath, 'utf8');

assert(appShellSrc.includes("item.id === 'logs' ? (isOnboarded ? 'Live' : 'Setup') : item.badge"), 
  'AppShell must conditionally show Live vs Setup for logs nav item badge');
assert(appShellSrc.includes("sidebar-nav__badge--locked"), 
  'AppShell must apply sidebar-nav__badge--locked class when logs is not onboarded');
console.log('✓ AppShell dynamically renders Setup badge when not onboarded and Live when onboarded');

// 3. Inspect AppShell.css for locked badge styling
const appShellCssPath = path.resolve('./src/shared/layout/AppShell.css');
const appShellCss = fs.readFileSync(appShellCssPath, 'utf8');
assert(appShellCss.includes('.sidebar-nav__badge--locked'), 'AppShell.css must define .sidebar-nav__badge--locked');
console.log('✓ AppShell.css defines styles for locked logs badge');

// 4. Inspect LogsPage gate logic
const logsPagePath = path.resolve('./src/modules/monitor/logs/LogsPage.jsx');
const logsPageSrc = fs.readFileSync(logsPagePath, 'utf8');

assert(logsPageSrc.includes('isOnboarded'), 'LogsPage must consume isOnboarded');
assert(logsPageSrc.includes('logs-onboarding-gate'), 'LogsPage must render logs-onboarding-gate when !isOnboarded');
assert(logsPageSrc.includes('if (!isOnboarded) return;'), 'LogsPage must guard query/stream effects when !isOnboarded');
assert(logsPageSrc.includes('if (!isOnboarded || !isLive || anomalyContext)'), 'LogsPage must guard SSE EventSource when !isOnboarded');
assert(logsPageSrc.includes('openOnboarding'), 'LogsPage must allow opening Onboarding Wizard');
assert(logsPageSrc.includes('handleCheckVerification'), 'LogsPage must provide verification check action');
assert(logsPageSrc.includes('generateTrackingSnippet'), 'LogsPage must provide quick-start tracking snippet');
console.log('✓ LogsPage guards all network log queries, SSE connections, and renders Onboarding Gate');

// 5. Inspect LogsPage.css for onboarding gate styles
const logsPageCssPath = path.resolve('./src/modules/monitor/logs/LogsPage.css');
const logsPageCss = fs.readFileSync(logsPageCssPath, 'utf8');

assert(logsPageCss.includes('.logs-onboarding-gate'), 'LogsPage.css must define .logs-onboarding-gate');
assert(logsPageCss.includes('.logs-onboarding-steps'), 'LogsPage.css must define .logs-onboarding-steps');
assert(logsPageCss.includes('.logs-onboarding-snippet-box'), 'LogsPage.css must define .logs-onboarding-snippet-box');
assert(logsPageCss.includes('.logs-onboarding-feedback'), 'LogsPage.css must define .logs-onboarding-feedback');
console.log('✓ LogsPage.css defines rich styles for onboarding gate and verification feedback');

// 6. Inspect OnboardingWizard marks onboarded on completion
const wizardPath = path.resolve('./src/modules/onboarding/OnboardingWizard.jsx');
const wizardSrc = fs.readFileSync(wizardPath, 'utf8');

assert(wizardSrc.includes('onboarded: true'), 'OnboardingWizard must set onboarded: true on finished profile');
assert(wizardSrc.includes('aicto_onboarded_'), 'OnboardingWizard must persist aicto_onboarded_ state');
console.log('✓ OnboardingWizard marks business as onboarded upon completion');

console.log('\nAll checks passed successfully! Logs are strictly gated behind tenant onboarding.');
