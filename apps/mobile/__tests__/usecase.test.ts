import { test } from "node:test";
import assert from "node:assert/strict";

import type { TransferBundle } from "../src/domain/models";
import { encode } from "../src/domain/codec";
import {
  decodePayload,
  importFromPayload,
  previewBundle,
  previewFromPayload,
} from "../src/domain/usecase";

/**
 * Import use-case stages (#36): decode -> preview (no writes) -> commit. Preview tests
 * assert counts only and never write, so they are independent of the shared store. The
 * commit test uses ids unique to this file so its "added" counts hold regardless of any
 * prior store state (the module store is a singleton seeded with demo data).
 */

function uniqueBundle(tag: string): TransferBundle {
  return {
    bundleId: `bundle-${tag}`,
    patient: { id: `pt-${tag}`, label: `Patient ${tag}` },
    readings: [
      {
        id: `bp-${tag}-1`,
        patientId: `pt-${tag}`,
        systolic: 140,
        diastolic: 90,
        measuredAt: "2026-10-01T08:00:00.000Z",
        measuredBy: "bhw",
        recordedBy: "bhw",
      },
    ],
    visitNotes: [
      {
        id: `vn-${tag}-1`,
        patientId: `pt-${tag}`,
        authoredAt: "2026-10-01T08:05:00.000Z",
        authoredBy: "bhw",
        text: "note",
      },
    ],
    createdAt: "2026-10-01T08:10:00.000Z",
  };
}

test("decodePayload: returns the same bundle the payload encoded", () => {
  const b = uniqueBundle("dec");
  assert.deepEqual(decodePayload(encode(b)), b);
});

test("previewBundle: reports patient id/label and entry counts", () => {
  const preview = previewBundle(uniqueBundle("pre"));
  assert.equal(preview.patientId, "pt-pre");
  assert.equal(preview.patientLabel, "Patient pre");
  assert.equal(preview.readingCount, 1);
  assert.equal(preview.visitNoteCount, 1);
  assert.equal(preview.totalEntryCount, 2);
});

test("previewFromPayload: previews straight from encoded bytes", () => {
  const preview = previewFromPayload(encode(uniqueBundle("pfp")));
  assert.equal(preview.totalEntryCount, 2);
});

test("importFromPayload: commits all-new entries and reports them as added", () => {
  const result = importFromPayload(encode(uniqueBundle("commit")));
  assert.equal(result.readingsAdded, 1);
  assert.equal(result.notesAdded, 1);
});

test("importFromPayload: committing the same payload twice is repeat-safe", () => {
  const payload = encode(uniqueBundle("twice"));
  importFromPayload(payload);
  const second = importFromPayload(payload);
  assert.equal(second.readingsAdded, 0);
  assert.equal(second.notesAdded, 0);
  assert.ok(second.readingsSkipped + second.notesSkipped >= 2);
});
