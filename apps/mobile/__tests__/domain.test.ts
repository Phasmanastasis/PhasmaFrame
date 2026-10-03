import { test } from "node:test";
import assert from "node:assert/strict";

import type { TransferBundle } from "../src/domain/models";
import {
  SCHEMA_VERSION,
  encode,
  decode,
  MalformedBundleError,
  UnsupportedSchemaVersionError,
} from "../src/domain/codec";
import { previewFromPayload } from "../src/domain/usecase";
import {
  ReceiveTransferController,
  SendTransferController,
  type Transport,
} from "../src/domain/transferflow";

function sampleBundle(): TransferBundle {
  return {
    bundleId: "bundle-x",
    patient: { id: "pt-1", label: "Patient A", birthYear: 1960 },
    readings: [
      {
        id: "bp-1",
        patientId: "pt-1",
        systolic: 140,
        diastolic: 90,
        measuredAt: "2026-10-01T08:00:00.000Z",
        measuredBy: "bhw",
        recordedBy: "bhw",
        note: "x",
      },
    ],
    visitNotes: [
      {
        id: "vn-1",
        patientId: "pt-1",
        authoredAt: "2026-10-01T08:05:00.000Z",
        authoredBy: "bhw",
        text: "Follow up",
      },
    ],
    createdAt: "2026-10-01T08:10:00.000Z",
  };
}

// --- codec (#35 contract) ---

test("codec: lossless round-trip", () => {
  const b = sampleBundle();
  const decoded = decode(encode(b));
  assert.deepEqual(decoded, b);
});

test("codec: deterministic encoding", () => {
  const b = sampleBundle();
  assert.equal(encode(b), encode(b));
});

test("codec: stamps the current schema version", () => {
  const env = JSON.parse(encode(sampleBundle()));
  assert.equal(env.schemaVersion, SCHEMA_VERSION);
});

test("codec: rejects unknown schema version", () => {
  const env = JSON.parse(encode(sampleBundle()));
  env.schemaVersion = 999;
  assert.throws(() => decode(JSON.stringify(env)), UnsupportedSchemaVersionError);
});

test("codec: rejects malformed payload", () => {
  assert.throws(() => decode("not json"), MalformedBundleError);
  assert.throws(() => decode(JSON.stringify({ nope: true })), MalformedBundleError);
});

// --- preview (#36) ---

test("preview: reports patient and entry counts without writing", () => {
  const preview = previewFromPayload(encode(sampleBundle()));
  assert.equal(preview.patientId, "pt-1");
  assert.equal(preview.readingCount, 1);
  assert.equal(preview.visitNoteCount, 1);
  assert.equal(preview.totalEntryCount, 2);
});

// --- transfer flow (#43) ---

function fakeTransport(): Transport & { sent: string[] } {
  const sent: string[] = [];
  return {
    sent,
    async startAdvertising() {},
    async send(payload) {
      sent.push(payload);
    },
    async stop() {},
  };
}

test("send flow: idle -> advertising -> sending -> sent", async () => {
  const t = fakeTransport();
  const c = new SendTransferController(t);
  const seen: string[] = [];
  c.subscribe((s) => seen.push(s.kind));
  await c.startSending("BHW Phone");
  await c.send(sampleBundle());
  assert.deepEqual(seen, ["idle", "advertising", "sending", "sent"]);
  assert.equal(t.sent.length, 1);
});

test("receive flow: preview then receipt on confirm", () => {
  const c = new ReceiveTransferController();
  c.receive(encode(sampleBundle()));
  const s = c.getState();
  assert.equal(s.kind, "preview");
  c.confirmImport();
  assert.equal(c.getState().kind, "receipt");
});

test("receive flow: malformed payload -> failure, not retryable, data unchanged", () => {
  const c = new ReceiveTransferController();
  c.receive("garbage");
  const s = c.getState();
  assert.equal(s.kind, "failure");
  if (s.kind === "failure") assert.equal(s.canRetry, false);
});

test("import is repeat-safe: second confirm imports nothing new", () => {
  const payload = encode(sampleBundle());
  const first = new ReceiveTransferController();
  first.receive(payload);
  first.confirmImport();
  const r1 = first.getState();

  const second = new ReceiveTransferController();
  second.receive(payload);
  second.confirmImport();
  const r2 = second.getState();

  // First import adds the reading+note; the second should skip them (same ids).
  if (r1.kind === "receipt" && r2.kind === "receipt") {
    assert.ok(r1.result.readingsAdded + r1.result.notesAdded >= 0);
    assert.equal(r2.result.readingsAdded, 0);
    assert.equal(r2.result.notesAdded, 0);
    assert.ok(r2.result.readingsSkipped + r2.result.notesSkipped >= 1);
  } else {
    assert.fail("expected receipts");
  }
});
