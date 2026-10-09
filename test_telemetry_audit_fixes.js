import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('--- Running Telemetry Audit Fixes Accreditation (Frontend) ---');

// 1. BUG-01: apiClient.js getVerificationStatus signature & headers
const apiClientPath = path.resolve('./src/shared/services/apiClient.js');
const apiClientSrc = fs.readFileSync(apiClientPath, 'utf8');

const verifyFnBlock = apiClientSrc.slice(apiClientSrc.indexOf('async getVerificationStatus('), apiClientSrc.indexOf('logsApi = {'));
assert(!verifyFnBlock.includes('apiKey'), 'BUG-01: getVerificationStatus must not accept apiKey parameter');
assert(!verifyFnBlock.includes('X-API-Key'), 'BUG-01: getVerificationStatus must not attach X-API-Key header');
assert(verifyFnBlock.includes('async getVerificationStatus(businessId) {'), 'BUG-01: getVerificationStatus must take only businessId');
console.log('✓ PASS: BUG-01 resolved in apiClient.js (getVerificationStatus signature and headers sanitized)');

// 2. BUG-05: onboardingConfig.js verifySnippetInstallation signature & call
const onboardingConfigPath = path.resolve('./src/modules/onboarding/onboardingConfig.js');
const onboardingConfigSrc = fs.readFileSync(onboardingConfigPath, 'utf8');

assert(!onboardingConfigSrc.includes('verifySnippetInstallation({ businessId, websiteUrl, apiKey'), 'BUG-05: verifySnippetInstallation must not accept apiKey');
assert(!onboardingConfigSrc.includes('ingestionApi.getVerificationStatus(businessId, apiKey)'), 'BUG-05: verifySnippetInstallation must not pass apiKey to ingestionApi');
assert(onboardingConfigSrc.includes('export async function verifySnippetInstallation({ businessId, websiteUrl })'), 'BUG-05: verifySnippetInstallation takes only businessId and websiteUrl');
assert(onboardingConfigSrc.includes('await ingestionApi.getVerificationStatus(businessId);'), 'BUG-05: calls getVerificationStatus(businessId)');
console.log('✓ PASS: BUG-05 resolved in onboardingConfig.js (verifySnippetInstallation does not accept or forward apiKey)');

// 3. BUG-07: DashboardPage.jsx refreshTelemetry dependency
const dashboardPagePath = path.resolve('./src/modules/monitor/DashboardPage.jsx');
const dashboardPageSrc = fs.readFileSync(dashboardPagePath, 'utf8');

assert(dashboardPageSrc.includes('[selectedBusiness?.id]'), 'BUG-07: refreshTelemetry must depend on [selectedBusiness?.id]');
assert(!dashboardPageSrc.includes('}, [selectedBusiness]);'), 'BUG-07: refreshTelemetry must not depend on raw selectedBusiness object');
console.log('✓ PASS: BUG-07 resolved in DashboardPage.jsx (refreshTelemetry scoped to selectedBusiness?.id)');

console.log('\n--- ALL FRONTEND TELEMETRY AUDIT FIXES VERIFIED SUCCESSFULLY! ---');
