import { test } from 'node:test';
import assert from 'node:assert/strict';

import { ROUTES, routeForWorkspace } from '../src/lib/routes';

// Expected values come from the product requirement for this feature
// (chooser at /choose, patient at /patient, BHW at /bhw), not runtime output.

test('ROUTES: chooser lives at /choose', () => {
  assert.equal(ROUTES.chooser, '/choose');
});

test('ROUTES: patient/caregiver role lands on /patient', () => {
  assert.equal(ROUTES.patient, '/patient');
});

test('ROUTES: barangay health worker role lands on /bhw', () => {
  assert.equal(ROUTES.bhw, '/bhw');
});

test('routeForWorkspace: maps each role workspace to its landing route', () => {
  assert.equal(routeForWorkspace('patient'), '/patient');
  assert.equal(routeForWorkspace('bhw'), '/bhw');
});

test('ROUTES: the three role routes are all distinct', () => {
  const paths = [ROUTES.chooser, ROUTES.patient, ROUTES.bhw];
  assert.equal(new Set(paths).size, paths.length);
});
