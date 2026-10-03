import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  createExampleRequestSchema,
  exampleListResponseSchema,
  exampleResponseSchema,
  healthResponseSchema,
} from '../src/index';

// Expected behavior is taken from the schema rules declared in src/index.ts and the
// API contract documented for /api/health, not copied from any runtime output.

// --- healthResponseSchema ---
// Contract (docs + README): the health check is exactly {status:"ok",service:"api"}.

test('healthResponseSchema: accepts the documented health payload', () => {
  const result = healthResponseSchema.safeParse({ status: 'ok', service: 'api' });
  assert.equal(result.success, true);
});

test('healthResponseSchema: rejects a status other than "ok"', () => {
  const result = healthResponseSchema.safeParse({ status: 'degraded', service: 'api' });
  assert.equal(result.success, false);
});

test('healthResponseSchema: rejects a service other than "api"', () => {
  const result = healthResponseSchema.safeParse({ status: 'ok', service: 'web' });
  assert.equal(result.success, false);
});

test('healthResponseSchema: rejects a missing field', () => {
  const result = healthResponseSchema.safeParse({ status: 'ok' });
  assert.equal(result.success, false);
});

// --- createExampleRequestSchema ---
// Rule: name is a string, trimmed, min length 1, max length 80.

test('createExampleRequestSchema: accepts a normal name', () => {
  const result = createExampleRequestSchema.safeParse({ name: 'My example' });
  assert.equal(result.success, true);
});

test('createExampleRequestSchema: trims surrounding whitespace from name', () => {
  const result = createExampleRequestSchema.parse({ name: '  spaced  ' });
  assert.equal(result.name, 'spaced');
});

test('createExampleRequestSchema: rejects an empty name (min length 1)', () => {
  const result = createExampleRequestSchema.safeParse({ name: '' });
  assert.equal(result.success, false);
});

test('createExampleRequestSchema: rejects a whitespace-only name (trim then min 1)', () => {
  // After trimming, "   " becomes "", which violates min length 1.
  const result = createExampleRequestSchema.safeParse({ name: '   ' });
  assert.equal(result.success, false);
});

test('createExampleRequestSchema: accepts a name of exactly 80 chars (upper boundary)', () => {
  const result = createExampleRequestSchema.safeParse({ name: 'a'.repeat(80) });
  assert.equal(result.success, true);
});

test('createExampleRequestSchema: rejects a name of 81 chars (over max)', () => {
  const result = createExampleRequestSchema.safeParse({ name: 'a'.repeat(81) });
  assert.equal(result.success, false);
});

test('createExampleRequestSchema: rejects a non-string name', () => {
  const result = createExampleRequestSchema.safeParse({ name: 123 });
  assert.equal(result.success, false);
});

test('createExampleRequestSchema: reports the error on the name path', () => {
  const result = createExampleRequestSchema.safeParse({ name: '' });
  assert.equal(result.success, false);
  if (!result.success) {
    const issue = result.error.issues[0];
    assert.deepEqual(issue.path, ['name']);
  }
});

// --- exampleResponseSchema ---
// Rule: id string, name string, createdAt ISO-8601 datetime.

test('exampleResponseSchema: accepts an ISO-8601 createdAt', () => {
  const result = exampleResponseSchema.safeParse({
    id: 'abc',
    name: 'Example',
    createdAt: '2026-10-01T08:00:00.000Z',
  });
  assert.equal(result.success, true);
});

test('exampleResponseSchema: rejects a non-ISO createdAt', () => {
  const result = exampleResponseSchema.safeParse({
    id: 'abc',
    name: 'Example',
    createdAt: '01/10/2026',
  });
  assert.equal(result.success, false);
});

test('exampleResponseSchema: rejects a missing id', () => {
  const result = exampleResponseSchema.safeParse({
    name: 'Example',
    createdAt: '2026-10-01T08:00:00.000Z',
  });
  assert.equal(result.success, false);
});

// --- exampleListResponseSchema ---

test('exampleListResponseSchema: accepts an empty array', () => {
  const result = exampleListResponseSchema.safeParse([]);
  assert.equal(result.success, true);
});

test('exampleListResponseSchema: accepts an array of valid examples', () => {
  const result = exampleListResponseSchema.safeParse([
    { id: '1', name: 'A', createdAt: '2026-10-01T08:00:00.000Z' },
    { id: '2', name: 'B', createdAt: '2026-10-02T08:00:00.000Z' },
  ]);
  assert.equal(result.success, true);
});

test('exampleListResponseSchema: rejects an array containing an invalid example', () => {
  const result = exampleListResponseSchema.safeParse([
    { id: '1', name: 'A', createdAt: 'not-a-date' },
  ]);
  assert.equal(result.success, false);
});
