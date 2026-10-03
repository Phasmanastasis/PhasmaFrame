import { test } from 'node:test';
import assert from 'node:assert/strict';

import { healthResponseSchema } from '../src/index';

// Trivial wiring check (PHASM-48): proves the node:test + tsx runner resolves
// workspace TypeScript sources and runs. Real schema coverage lands in PHASM-49.
test('wiring: shared package exports a parseable health schema', () => {
  const parsed = healthResponseSchema.parse({ status: 'ok', service: 'api' });
  assert.deepEqual(parsed, { status: 'ok', service: 'api' });
});
