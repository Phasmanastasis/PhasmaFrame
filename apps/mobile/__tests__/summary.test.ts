import { test } from "node:test";
import assert from "node:assert/strict";

import { CSV_HEADER, toCsv, type CsvRow } from "../src/domain/summary";

/**
 * CSV summary format (#40). The expected output is derived from the documented column
 * contract (measured_at, systolic, diastolic, measured_by), not copied from runtime output.
 */

const rowA: CsvRow = {
  measuredAt: "2026-09-28T08:15:00.000Z",
  systolic: 148,
  diastolic: 92,
  measuredBy: "bhw",
};
const rowB: CsvRow = {
  measuredAt: "2026-10-01T07:50:00.000Z",
  systolic: 139,
  diastolic: 86,
  measuredBy: "caregiver",
};

test("toCsv: emits the fixed header as the first line", () => {
  const lines = toCsv([rowA]).split("\n");
  assert.equal(lines[0], "measured_at,systolic,diastolic,measured_by");
  assert.equal(lines[0], CSV_HEADER);
});

test("toCsv: writes one comma-separated line per reading in order", () => {
  const csv = toCsv([rowA, rowB]);
  assert.equal(
    csv,
    "measured_at,systolic,diastolic,measured_by\n" +
      "2026-09-28T08:15:00.000Z,148,92,bhw\n" +
      "2026-10-01T07:50:00.000Z,139,86,caregiver",
  );
});

test("toCsv: preserves the given row order", () => {
  const csv = toCsv([rowB, rowA]);
  const dataLines = csv.split("\n").slice(1);
  assert.equal(dataLines[0], "2026-10-01T07:50:00.000Z,139,86,caregiver");
  assert.equal(dataLines[1], "2026-09-28T08:15:00.000Z,148,92,bhw");
});

test("toCsv: a single reading yields a header line plus one data line", () => {
  const lines = toCsv([rowA]).split("\n");
  assert.equal(lines.length, 2);
});

test("toCsv: with no readings emits the header followed by an empty body line", () => {
  // Current behavior: header + "\n" + "" (an empty join). Pinned so a regression is caught.
  assert.equal(toCsv([]), "measured_at,systolic,diastolic,measured_by\n");
});
