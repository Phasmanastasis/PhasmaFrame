import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createApp } from '../src/app';

/**
 * In-process API tests. No network, no ports, no real database: `createApp` is given a
 * minimal fake Prisma client and exercised through Hono's `app.request()`.
 *
 * Expected status codes and bodies come from the route/shared contract, not from running
 * the real implementation first:
 *  - /api/health is documented to return {status:"ok",service:"api"} (README/docs).
 *  - POST /api/examples is coded to return 201; GET returns 200.
 *  - An unknown route returns 404.
 *  - An invalid create body must be rejected by the request validator (client error).
 */

interface ExampleRow {
  id: string;
  name: string;
  createdAt: Date;
}

/** A fake Prisma client exposing only what app.ts touches: example.findMany / create. */
function fakePrisma(initialRows: ExampleRow[] = []) {
  const rows = [...initialRows];
  return {
    client: {
      example: {
        findMany: async (_args?: unknown) => rows,
        create: async ({ data }: { data: { name: string } }) => {
          const row: ExampleRow = {
            id: `id-${rows.length + 1}`,
            name: data.name,
            createdAt: new Date('2026-10-01T08:00:00.000Z'),
          };
          rows.push(row);
          return row;
        },
      },
    },
    rows,
  };
}

function makeApp(rows: ExampleRow[] = []) {
  const { client, rows: store } = fakePrisma(rows);
  // The fake satisfies the structural surface app.ts uses; cast for the typed param.
  const app = createApp({ prisma: client as never });
  return { app, store };
}

// --- /api/health ---

test('GET /api/health returns 200 with {status:"ok",service:"api"}', async () => {
  const { app } = makeApp();
  const res = await app.request('/api/health');
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { status: 'ok', service: 'api' });
});

// --- GET /api/examples ---

test('GET /api/examples returns 200 and an empty array when there are no rows', async () => {
  const { app } = makeApp([]);
  const res = await app.request('/api/examples');
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), []);
});

test('GET /api/examples maps rows to the response contract (createdAt as ISO string)', async () => {
  const { app } = makeApp([
    { id: 'a', name: 'First', createdAt: new Date('2026-10-01T08:00:00.000Z') },
  ]);
  const res = await app.request('/api/examples');
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), [
    { id: 'a', name: 'First', createdAt: '2026-10-01T08:00:00.000Z' },
  ]);
});

// --- POST /api/examples ---

test('POST /api/examples with a valid body returns 201 and the created example', async () => {
  const { app } = makeApp();
  const res = await app.request('/api/examples', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'My example' }),
  });
  assert.equal(res.status, 201);
  const body = (await res.json()) as { id: string; name: string; createdAt: string };
  assert.equal(body.name, 'My example');
  assert.equal(typeof body.id, 'string');
  assert.equal(body.createdAt, '2026-10-01T08:00:00.000Z');
});

test('POST /api/examples persists through the injected client (next GET sees it)', async () => {
  const { app } = makeApp();
  await app.request('/api/examples', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Persisted' }),
  });
  const res = await app.request('/api/examples');
  const body = (await res.json()) as unknown[];
  assert.equal(body.length, 1);
});

test('POST /api/examples rejects an empty name with a client error (4xx)', async () => {
  const { app, store } = makeApp();
  const res = await app.request('/api/examples', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: '' }),
  });
  assert.ok(res.status >= 400 && res.status < 500, `expected 4xx, got ${res.status}`);
  // The invalid request must not have created a row.
  assert.equal(store.length, 0);
});

test('POST /api/examples rejects a name longer than 80 chars (4xx)', async () => {
  const { app, store } = makeApp();
  const res = await app.request('/api/examples', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'a'.repeat(81) }),
  });
  assert.ok(res.status >= 400 && res.status < 500, `expected 4xx, got ${res.status}`);
  assert.equal(store.length, 0);
});

// --- unknown routes ---

test('an unknown /api/* route returns 404', async () => {
  const { app } = makeApp();
  const res = await app.request('/api/does-not-exist');
  assert.equal(res.status, 404);
});
