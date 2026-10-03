// Domain models for the offline hypertension follow-up MVP.
// Ported from the native core models (PHASM-19/#33) into TypeScript for the
// Expo-managed app. No national ID is collected; patients use a generated local ID.

export type EntrySource = "patient" | "caregiver" | "bhw";

export interface Patient {
  /** Generated local identifier (not a national ID). */
  id: string;
  /** Human-friendly local label, e.g. "Patient A". */
  label: string;
  birthYear?: number;
}

export interface BloodPressureReading {
  id: string;
  patientId: string;
  systolic: number;
  diastolic: number;
  /** ISO-8601 timestamp of when the measurement was taken. */
  measuredAt: string;
  /** Who measured the reading. */
  measuredBy: EntrySource;
  /** Who entered the reading into the app. */
  recordedBy: EntrySource;
  note?: string;
}

export interface VisitNote {
  id: string;
  patientId: string;
  authoredAt: string;
  authoredBy: EntrySource;
  text: string;
}

/** A single-patient transfer payload exchanged device-to-device. */
export interface TransferBundle {
  bundleId: string;
  patient: Patient;
  readings: BloodPressureReading[];
  visitNotes: VisitNote[];
  createdAt: string;
}
