import { test } from "node:test";
import assert from "node:assert/strict";

import type { TransferBundle } from "../src/domain/models";
import {
  SCHEMA_VERSION,
  decode,
  encode,
  MalformedBundleError,
  UnsupportedSchemaVersionError,
} from "../src/domain/codec";

/**
 * Deeper codec contract (#35), complementing the round-trip/version/malformed cases in
 * domain.test.ts: per-field validation, optional-field preservation, and the exact
 * error type for each failure mode.
 */

function sample(): TransferBundle {
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
        recordedBy: "caregiver",
        note: "x",
      },
    ],
    visitNotes: [],
    createdAt: "2026-10-01T08:10:00.000Z",
  };
}

test("encode: stamps the supported schema version regardless of input", () => {
  const env = JSON.parse(encode(sample())) as { schemaVersion: number };
  assert.equal(env.schemaVersion, SCHEMA_VERSION);
});

test("decode: round-trips an optional note and birthYear", () => {
  const decoded = decode(encode(sample()));
  assert.equal(decoded.readings[0].note, "x");
  assert.equal(decoded.patient.birthYear, 1960);
});

test("decode: round-trips a reading that omits the optional note", () => {
  const b = sample();
  delete b.readings[0].note;
  const decoded = decode(encode(b));
  assert.equal(decoded.readings[0].note, undefined);
});

test("decode: rejects a payload missing schemaVersion as malformed", () => {
  const env = JSON.parse(encode(sample())) as Record<string, unknown>;
  delete env.schemaVersion;
  assert.throws(() => decode(JSON.stringify(env)), MalformedBundleError);
});

test("decode: rejects an unsupported schema version with the typed error", () => {
  const env = JSON.parse(encode(sample())) as { schemaVersion: number };
  env.schemaVersion = SCHEMA_VERSION + 1;
  assert.throws(() => decode(JSON.stringify(env)), UnsupportedSchemaVersionError);
});

test("decode: UnsupportedSchemaVersionError carries the found and supported versions", () => {
  const env = JSON.parse(encode(sample())) as { schemaVersion: number };
  env.schemaVersion = 999;
  try {
    decode(JSON.stringify(env));
    assert.fail("expected throw");
  } catch (e) {
    assert.ok(e instanceof UnsupportedSchemaVersionError);
    if (e instanceof UnsupportedSchemaVersionError) {
      assert.equal(e.foundVersion, 999);
      assert.equal(e.supportedVersion, SCHEMA_VERSION);
    }
  }
});

test("decode: rejects a non-JSON payload as malformed", () => {
  assert.throws(() => decode("not json at all"), MalformedBundleError);
});

test("decode: rejects a JSON primitive (not an object) as malformed", () => {
  assert.throws(() => decode("42"), MalformedBundleError);
});

test("decode: rejects a reading with a non-numeric systolic", () => {
  const env = JSON.parse(encode(sample())) as { readings: Record<string, unknown>[] };
  env.readings[0].systolic = "140";
  assert.throws(() => decode(JSON.stringify(env)), MalformedBundleError);
});

test("decode: rejects a reading whose measuredBy is not a known source", () => {
  const env = JSON.parse(encode(sample())) as { readings: Record<string, unknown>[] };
  env.readings[0].measuredBy = "doctor";
  assert.throws(() => decode(JSON.stringify(env)), MalformedBundleError);
});

test("decode: rejects a bundle whose readings field is not an array", () => {
  const env = JSON.parse(encode(sample())) as Record<string, unknown>;
  env.readings = { not: "an array" };
  assert.throws(() => decode(JSON.stringify(env)), MalformedBundleError);
});

test("encode: is deterministic for the same bundle", () => {
  const b = sample();
  assert.equal(encode(b), encode(b));
});
