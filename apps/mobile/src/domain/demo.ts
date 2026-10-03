import type { TransferBundle } from "./models";

/**
 * Build a sample incoming bundle for the Receive demo. It intentionally reuses
 * one existing reading ID ("bp-0003") and adds a new one so the import receipt
 * shows both an added and a skipped entry, demonstrating repeat-safe import.
 */
export function exportSampleIncoming(): TransferBundle {
  return {
    bundleId: `bundle-incoming-${Date.now()}`,
    patient: { id: "pt-bbb222", label: "Patient B", birthYear: 1963 },
    readings: [
      {
        id: "bp-0003", // duplicate of seeded reading -> skipped
        patientId: "pt-bbb222",
        systolic: 161,
        diastolic: 99,
        measuredAt: "2026-09-30T09:05:00.000Z",
        measuredBy: "bhw",
        recordedBy: "bhw",
      },
      {
        id: "bp-incoming-01", // new -> added
        patientId: "pt-bbb222",
        systolic: 152,
        diastolic: 94,
        measuredAt: "2026-10-03T10:20:00.000Z",
        measuredBy: "caregiver",
        recordedBy: "caregiver",
        note: "Home reading",
      },
    ],
    visitNotes: [],
    createdAt: new Date().toISOString(),
  };
}
