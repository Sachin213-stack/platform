import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('--- Running Phase 5 UI Honesty Tests ---');

// 1. Verify DashboardTopBar.jsx has no hardcoded 32ms
const topBarPath = path.resolve('./src/modules/monitor/components/DashboardTopBar.jsx');
const topBarSrc = fs.readFileSync(topBarPath, 'utf8');

assert(!topBarSrc.includes('32ms'), 'DashboardTopBar.jsx must not contain hardcoded 32ms');
console.log('✓ PASS: DashboardTopBar.jsx has no hardcoded 32ms');

assert(topBarSrc.includes('latencyMs'), 'DashboardTopBar.jsx must accept latencyMs prop');
assert(topBarSrc.includes('latencyMs != null ? `${Math.round(latencyMs)}ms` : \'—\''), 'DashboardTopBar.jsx renders dynamic latency or dash');
console.log('✓ PASS: DashboardTopBar renders dynamic latencyMs or dash placeholder');

assert(!topBarSrc.includes('Click to simulate disconnect'), 'DashboardTopBar.jsx must not have simulated disconnect tooltip');
console.log('✓ PASS: Simulated disconnect tooltip removed from DashboardTopBar.jsx');

// 2. Verify DashboardPage.jsx
const dashboardPagePath = path.resolve('./src/modules/monitor/DashboardPage.jsx');
const dashboardPageSrc = fs.readFileSync(dashboardPagePath, 'utf8');

assert(!dashboardPageSrc.includes('32ms'), 'DashboardPage.jsx must not contain 32ms');
assert(dashboardPageSrc.includes('const [isConnected, setIsConnected] = useState(false);'), 'isConnected must start as false (not default true)');
assert(dashboardPageSrc.includes('latencyMs={latencyMs}'), 'DashboardPage passes latencyMs to DashboardTopBar');
assert(dashboardPageSrc.includes('ingestionApi.getVerificationStatus'), 'DashboardPage calls verification endpoint on load');
assert(!dashboardPageSrc.includes('Click to simulate disconnect') && !dashboardPageSrc.includes('onToggleConnection={() => {'), 'Simulated disconnect toggle removed from DashboardPage');
console.log('✓ PASS: DashboardPage.jsx tracks real network status, real latency, and calls verification endpoint');

// 3. Verify tracker.js in backend
const trackerPath = path.resolve('../aicto-backend/app/static/tracker.js');
const trackerSrc = fs.readFileSync(trackerPath, 'utf8');

assert(trackerSrc.includes('/api/dashboard'), 'tracker.js must exclude /api/dashboard');
assert(trackerSrc.includes('/api/health'), 'tracker.js must exclude /api/health');
assert(trackerSrc.includes('/api/ingestion/verify'), 'tracker.js must exclude /api/ingestion/verify');
assert(trackerSrc.includes('/api/users/me') && trackerSrc.includes('401'), 'tracker.js must exclude 401 on /api/users/me');
console.log('✓ PASS: tracker.js excludes internal monitoring endpoints and 401 on /api/users/me');

console.log('\n--- All Phase 5 UI Honesty Tests Passed! ---');
