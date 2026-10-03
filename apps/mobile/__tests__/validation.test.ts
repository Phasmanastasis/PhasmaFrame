import { test } from "node:test";
import assert from "node:assert/strict";

import { localId, validateReading } from "../src/domain/validation";

/**
 * Reading-validation rules. The product docs require systolic, diastolic, time, measurer,
 * and recorder on a reading but do NOT define any numeric validity range or classification.
 * The numeric bounds below (systolic 60-260, diastolic 40-160, diastolic < systolic) are an
 * implementation choice in validation.ts, tested here *as implemented* to pin the behavior
 * — not asserted as a clinical specification. See docs/dev/testing.md.
 */

test("validateReading: accepts an in-range reading and returns parsed numbers", () => {
  const r = validateReading({ systolic: "140", diastolic: "90" });
  assert.equal(r.ok, true);
  assert.equal(r.systolic, 140);
  assert.equal(r.diastolic, 90);
  assert.deepEqual(r.errors, []);
});

test("validateReading: rejects a non-numeric systolic", () => {
  const r = validateReading({ systolic: "abc", diastolic: "90" });
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.toLowerCase().includes("systolic")));
});

test("validateReading: rejects a non-integer (decimal) systolic", () => {
  const r = validateReading({ systolic: "140.5", diastolic: "90" });
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.toLowerCase().includes("systolic")));
});

// Systolic boundaries: valid range is 60..260 inclusive.
test("validateReading: accepts systolic at the lower boundary 60", () => {
  const r = validateReading({ systolic: "60", diastolic: "40" });
  assert.equal(r.ok, true);
});

test("validateReading: rejects systolic just below the lower boundary (59)", () => {
  const r = validateReading({ systolic: "59", diastolic: "40" });
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.toLowerCase().includes("systolic")));
});

test("validateReading: accepts systolic at the upper boundary 260", () => {
  const r = validateReading({ systolic: "260", diastolic: "120" });
  assert.equal(r.ok, true);
});

test("validateReading: rejects systolic just above the upper boundary (261)", () => {
  const r = validateReading({ systolic: "261", diastolic: "120" });
  assert.equal(r.ok, false);
});

// Diastolic boundaries: valid range is 40..160 inclusive.
test("validateReading: rejects diastolic just below the lower boundary (39)", () => {
  const r = validateReading({ systolic: "120", diastolic: "39" });
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.toLowerCase().includes("diastolic")));
});

test("validateReading: rejects diastolic just above the upper boundary (161)", () => {
  const r = validateReading({ systolic: "200", diastolic: "161" });
  assert.equal(r.ok, false);
});

// Relationship rule: diastolic must be lower than systolic.
test("validateReading: rejects a diastolic equal to systolic", () => {
  const r = validateReading({ systolic: "120", diastolic: "120" });
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.toLowerCase().includes("lower than systolic")));
});

test("validateReading: rejects a diastolic greater than systolic", () => {
  const r = validateReading({ systolic: "100", diastolic: "120" });
  assert.equal(r.ok, false);
});

test("validateReading: does not run the relationship check when a range check already failed", () => {
  // Both out of range: the relationship error must not be added on top (errors.length>0 guard).
  const r = validateReading({ systolic: "10", diastolic: "5" });
  assert.equal(r.ok, false);
  assert.ok(!r.errors.some((e) => e.toLowerCase().includes("lower than systolic")));
});

test("validateReading: aggregates one error per out-of-range field", () => {
  const r = validateReading({ systolic: "10", diastolic: "5" });
  assert.equal(r.errors.length, 2);
});

test("validateReading: a failing result omits the parsed numeric fields", () => {
  const r = validateReading({ systolic: "59", diastolic: "40" });
  assert.equal(r.ok, false);
  assert.equal(r.systolic, undefined);
  assert.equal(r.diastolic, undefined);
});

// localId: shape only (it is random/time-based, so assert structure, not an exact value).
test("localId: prefixes the id and stays within the given namespace", () => {
  const id = localId("bp");
  assert.ok(id.startsWith("bp-"));
  assert.ok(id.length > 3);
});

test("localId: produces distinct ids on successive calls", () => {
  const a = localId("bp");
  const b = localId("bp");
  assert.notEqual(a, b);
});
