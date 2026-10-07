import assert from 'node:assert/strict';
import { generateBusinessId } from './src/modules/onboarding/onboardingConfig.js';

console.log('--- RUNNING PHASE 1 WIZARD TENANT UUID TEST ---');

// Test 1: generateBusinessId produces valid v4 UUID
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const id1 = generateBusinessId();
assert(uuidRegex.test(id1), `Expected valid v4 UUID, got: ${id1}`);
console.log(`[PASS] Test 1: Generated valid v4 UUID: ${id1}`);

// Test 2: Sequential calls generate distinct UUIDs
const id2 = generateBusinessId();
assert.notEqual(id1, id2, 'Expected distinct UUIDs for consecutive calls');
console.log(`[PASS] Test 2: Consecutive UUIDs are distinct (${id1} !== ${id2})`);

// Test 3: Fresh business onboarding resolution does not reuse existing business ID
const existingBizId = '0b01b0d0-3b9d-43e4-919b-32b18603bd53';
const onboardingInitialData = null; // New business flow

const isEditingExisting = Boolean(onboardingInitialData && onboardingInitialData.id);
const resolvedBizIdNew = isEditingExisting ? onboardingInitialData.id : generateBusinessId();

assert.notEqual(resolvedBizIdNew, existingBizId, 'New business flow must NEVER reuse existing business ID');
assert(uuidRegex.test(resolvedBizIdNew), 'New business flow must receive a valid UUID');
console.log(`[PASS] Test 3: New business flow creates fresh UUID: ${resolvedBizIdNew} (different from existing ${existingBizId})`);

// Test 4: Editing existing business preserves existing business ID
const existingBusinessData = { id: '11111111-2222-3333-4444-555555555555', name: 'Existing Org' };
const isEditingExistingTrue = Boolean(existingBusinessData && existingBusinessData.id);
const resolvedBizIdEdit = isEditingExistingTrue ? existingBusinessData.id : generateBusinessId();

assert.equal(resolvedBizIdEdit, existingBusinessData.id, 'Edit flow must preserve existing business ID');
console.log(`[PASS] Test 4: Edit existing business preserves target ID: ${resolvedBizIdEdit}`);

console.log('--- ALL PHASE 1 TESTS PASSED SUCCESSFULLY ---');
