import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

const workerSource = readFileSync(new URL('../public/offline-worker.js', import.meta.url), 'utf8');

function createWorker({ online = true } = {}) {
  const origin = 'https://kasigla.test';
  let isOnline = online;
  const listeners = new Map<string, (event: any) => void>();
  const entries = new Map<string, Response>();
  const cache = {
    async put(request: string | Request, response: Response) {
      const key = typeof request === 'string' ? new URL(request, origin).href : request.url;
      entries.set(key, response);
    },
  };
  const self = {
    location: { origin },
    clients: { claim: async () => undefined },
    addEventListener(type: string, listener: (event: any) => void) { listeners.set(type, listener); },
    skipWaiting: async () => undefined,
  };
  const caches = {
    async open() { return cache; },
    async keys() { return ['alaga-shell-v4']; },
    async delete() { return true; },
    async match(request: string | Request) {
      const key = typeof request === 'string' ? new URL(request, origin).href : request.url;
      return entries.get(key)?.clone();
    },
  };
  const fetch = async (input: string | Request) => {
    if (!isOnline) throw new TypeError('offline');
    const url = typeof input === 'string' ? new URL(input, origin) : new URL(input.url);
    return new Response(`<main>screen:${url.pathname}</main>`, { status: url.pathname.includes('missing') ? 404 : 200 });
  };

  vm.runInNewContext(workerSource, { self, caches, fetch, URL, Response, Request, Promise, Set, RegExp });

  return {
    async install() {
      let pending: Promise<void> | undefined;
      listeners.get('install')?.({ waitUntil(value: Promise<void>) { pending = value; } });
      await pending;
    },
    setOnline(value: boolean) { isOnline = value; },
    async navigate(path: string) {
      let response: Promise<Response> | undefined;
      listeners.get('fetch')?.({
        request: { url: new URL(path, origin).href, method: 'GET', mode: 'navigate' },
        respondWith(value: Promise<Response>) { response = value; },
      });
      assert.ok(response);
      return response;
    },
  };
}

test('offline worker serves role screens for slash and query URL variants', async () => {
  const worker = createWorker();
  await worker.install();
  worker.setOnline(false);

  const patient = await worker.navigate('/patient/');
  const bhw = await worker.navigate('/bhw/?source=installed');

  assert.match(await patient.text(), /screen:\/patient/);
  assert.match(await bhw.text(), /screen:\/bhw/);
});

test('offline worker returns a readable response when no route is cached', async () => {
  const worker = createWorker({ online: false });
  const response = await worker.navigate('/patient/');

  assert.equal(response.status, 503);
  assert.match(await response.text(), /You are offline/);
});
