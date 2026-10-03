import { test } from "node:test";
import assert from "node:assert/strict";

import { InMemoryStore } from "../src/domain/store";
import type { BloodPressureReading, TransferBundle, VisitNote } from "../src/domain/models";

/**
 * Import behavior from the SDD: imports append new ids only, never overwrite existing
 * entries, and are repeat-safe (a re-imported bundle adds nothing new). Each test uses a
 * fresh InMemoryStore so results are order-independent. The store seeds synthetic demo
 * data in its constructor; tests use ids that do not collide with that seed unless the test
 * is specifically about a seeded id.
 */

function reading(id: string, patientId = "pt-new"): BloodPressureReading {
  return {
    id,
    patientId,
    systolic: 130,
    diastolic: 85,
    measuredAt: "2026-10-01T08:00:00.000Z",
    measuredBy: "bhw",
    recordedBy: "bhw",
  };
}

function note(id: string, patientId = "pt-new"): VisitNote {
  return {
    id,
    patientId,
    authoredAt: "2026-10-01T08:05:00.000Z",
    authoredBy: "bhw",
    text: "note",
  };
}

function bundle(
  patientId: string,
  readings: BloodPressureReading[],
  visitNotes: VisitNote[] = [],
): TransferBundle {
  return {
    bundleId: `bundle-${patientId}`,
    patient: { id: patientId, label: "Imported Patient" },
    readings,
    visitNotes,
    createdAt: "2026-10-01T08:10:00.000Z",
  };
}

test("importBundle: adds all-new readings and notes and reports the counts", () => {
  const store = new InMemoryStore();
  const result = store.importBundle(
    bundle("pt-new", [reading("new-1"), reading("new-2")], [note("vn-new-1")]),
  );
  assert.equal(result.readingsAdded, 2);
  assert.equal(result.readingsSkipped, 0);
  assert.equal(result.notesAdded, 1);
  assert.equal(result.notesSkipped, 0);
});

test("importBundle: creates the patient when it did not exist", () => {
  const store = new InMemoryStore();
  assert.equal(store.getPatient("pt-new"), undefined);
  store.importBundle(bundle("pt-new", [reading("new-1")]));
  assert.ok(store.getPatient("pt-new"));
});

test("importBundle: is repeat-safe — re-importing the same bundle adds nothing new", () => {
  const store = new InMemoryStore();
  const b = bundle("pt-new", [reading("new-1"), reading("new-2")], [note("vn-new-1")]);
  store.importBundle(b);
  const second = store.importBundle(b);
  assert.equal(second.readingsAdded, 0);
  assert.equal(second.notesAdded, 0);
  assert.equal(second.readingsSkipped, 2);
  assert.equal(second.notesSkipped, 1);
});

test("importBundle: skips a duplicate reading id but adds the new ones alongside it", () => {
  const store = new InMemoryStore();
  store.importBundle(bundle("pt-new", [reading("dup")]));
  const result = store.importBundle(
    bundle("pt-new", [reading("dup"), reading("fresh")]),
  );
  assert.equal(result.readingsAdded, 1);
  assert.equal(result.readingsSkipped, 1);
});

test("importBundle: append-only — a duplicate id never overwrites the stored entry", () => {
  const store = new InMemoryStore();
  store.importBundle(bundle("pt-new", [reading("keep")]));
  // Re-import the same id carrying different values; the original must survive.
  const mutated = { ...reading("keep"), systolic: 999, note: "tampered" };
  store.importBundle(bundle("pt-new", [mutated]));
  const stored = store.listReadings("pt-new").find((r) => r.id === "keep");
  assert.equal(stored?.systolic, 130);
  assert.equal(stored?.note, undefined);
});

test("importBundle: a fully duplicate bundle adds no new ids (no partial change)", () => {
  const store = new InMemoryStore();
  const b = bundle("pt-new", [reading("r1"), reading("r2")], [note("n1")]);
  store.importBundle(b);
  const before = store.listReadings("pt-new").length + store.listVisitNotes("pt-new").length;
  const result = store.importBundle(b);
  const after = store.listReadings("pt-new").length + store.listVisitNotes("pt-new").length;
  assert.equal(after, before);
  assert.equal(result.readingsAdded + result.notesAdded, 0);
});

test("importBundle: skips a reading whose id collides with seeded demo data", () => {
  const store = new InMemoryStore();
  // bp-0003 is a seeded reading id (seed.ts); importing it must be skipped, not duplicated.
  const result = store.importBundle(
    bundle("pt-bbb222", [reading("bp-0003", "pt-bbb222"), reading("brand-new", "pt-bbb222")]),
  );
  assert.equal(result.readingsSkipped, 1);
  assert.equal(result.readingsAdded, 1);
});

test("listReadings: returns readings for a patient newest-first", () => {
  const store = new InMemoryStore();
  store.addReading({ ...reading("old"), measuredAt: "2026-01-01T00:00:00.000Z" });
  store.addReading({ ...reading("recent"), measuredAt: "2026-12-01T00:00:00.000Z" });
  const ids = store.listReadings("pt-new").map((r) => r.id);
  assert.deepEqual(ids, ["recent", "old"]);
});

test("exportBundle: throws for an unknown patient", () => {
  const store = new InMemoryStore();
  assert.throws(() => store.exportBundle("pt-does-not-exist"));
});

test("exportBundle: bundles exactly the requested patient's entries", () => {
  const store = new InMemoryStore();
  store.addReading(reading("r-a", "pt-x"));
  store.addReading(reading("r-b", "pt-y"));
  const b = store.exportBundle("pt-x");
  assert.equal(b.patient.id, "pt-x");
  assert.ok(b.readings.every((r) => r.patientId === "pt-x"));
});
