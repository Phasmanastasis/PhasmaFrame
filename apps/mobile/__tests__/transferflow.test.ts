import { test } from "node:test";
import assert from "node:assert/strict";

import type { TransferBundle } from "../src/domain/models";
import { encode } from "../src/domain/codec";
import {
  ReceiveTransferController,
  SendTransferController,
  type Transport,
} from "../src/domain/transferflow";

/**
 * Transfer-flow failure handling (#43 / SDD "Failure handling"): on any failure the
 * device's data is left unchanged and the UI is offered retry/cancel. These cover the
 * failure and cancel paths that domain.test.ts does not.
 */

function sample(): TransferBundle {
  return {
    bundleId: "bundle-x",
    patient: { id: "pt-1", label: "Patient A" },
    readings: [],
    visitNotes: [],
    createdAt: "2026-10-01T08:10:00.000Z",
  };
}

/** A transport whose advertise/send reject, to drive the failure branches. */
function failingTransport(): Transport {
  return {
    async startAdvertising() {
      throw new Error("advertise boom");
    },
    async send() {
      throw new Error("send boom");
    },
    async stop() {},
  };
}

function okTransport(): Transport {
  return {
    async startAdvertising() {},
    async send() {},
    async stop() {},
  };
}

test("send flow: a failing advertise moves to a retryable failure", async () => {
  const c = new SendTransferController(failingTransport());
  await c.startSending("BHW Phone");
  const s = c.getState();
  assert.equal(s.kind, "failure");
  if (s.kind === "failure") assert.equal(s.canRetry, true);
});

test("send flow: a failing send moves to a retryable failure", async () => {
  const c = new SendTransferController(failingTransport());
  await c.send(sample());
  const s = c.getState();
  assert.equal(s.kind, "failure");
  if (s.kind === "failure") assert.equal(s.canRetry, true);
});

test("send flow: cancel returns the controller to idle", async () => {
  const c = new SendTransferController(okTransport());
  await c.startSending("BHW Phone");
  await c.cancel();
  assert.equal(c.getState().kind, "idle");
});

test("receive flow: a malformed payload fails and is NOT retryable (same bytes won't help)", () => {
  const c = new ReceiveTransferController();
  c.receive("garbage-not-a-bundle");
  const s = c.getState();
  assert.equal(s.kind, "failure");
  if (s.kind === "failure") assert.equal(s.canRetry, false);
});

test("receive flow: confirming with nothing pending is a non-retryable failure", () => {
  const c = new ReceiveTransferController();
  c.confirmImport();
  const s = c.getState();
  assert.equal(s.kind, "failure");
  if (s.kind === "failure") assert.equal(s.canRetry, false);
});

test("receive flow: a valid payload previews, then a confirm produces a receipt", () => {
  const c = new ReceiveTransferController();
  c.receive(encode({ ...sample(), bundleId: "bundle-recv", patient: { id: "pt-recv", label: "R" } }));
  assert.equal(c.getState().kind, "preview");
  c.confirmImport();
  assert.equal(c.getState().kind, "receipt");
});

test("receive flow: cancel after preview returns to idle without committing", () => {
  const c = new ReceiveTransferController();
  c.receive(encode({ ...sample(), bundleId: "bundle-cancel", patient: { id: "pt-cancel", label: "C" } }));
  c.cancel();
  assert.equal(c.getState().kind, "idle");
});
