import type { BloodPressureReading } from "./models";

/**
 * Builds the RHU/YAKAP CSV summary for a patient's readings (RhuSummaryBuilder, #40).
 *
 * Extracted verbatim from the inline `toCsv` in
 * `app/patients/[id]/summary.tsx` so the format is unit-testable. The behavior is
 * unchanged: a fixed header line followed by one comma-separated line per reading, in the
 * order the rows are given, joined by `\n`. The screen is review/export only and does not
 * send anything to an RHU.
 */

/** The exact columns emitted, in order. */
export const CSV_HEADER = "measured_at,systolic,diastolic,measured_by";

/** Just the fields the CSV needs; a full {@link BloodPressureReading} also satisfies this. */
export type CsvRow = Pick<
  BloodPressureReading,
  "measuredAt" | "systolic" | "diastolic" | "measuredBy"
>;

export function toCsv(rows: CsvRow[]): string {
  const body = rows
    .map((r) => `${r.measuredAt},${r.systolic},${r.diastolic},${r.measuredBy}`)
    .join("\n");
  return `${CSV_HEADER}\n${body}`;
}
