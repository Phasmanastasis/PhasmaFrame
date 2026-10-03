import type { BloodPressureReading, Patient, VisitNote } from "./models";

// Synthetic demo records only. Generated local IDs; no real PII.

export const seedPatients: Patient[] = [
  { id: "pt-aaa111", label: "Patient A", birthYear: 1958 },
  { id: "pt-bbb222", label: "Patient B", birthYear: 1963 },
  { id: "pt-ccc333", label: "Patient C", birthYear: 1971 },
];

export const seedReadings: BloodPressureReading[] = [
  {
    id: "bp-0001",
    patientId: "pt-aaa111",
    systolic: 148,
    diastolic: 92,
    measuredAt: "2026-09-28T08:15:00.000Z",
    measuredBy: "bhw",
    recordedBy: "bhw",
    note: "Pre-breakfast",
  },
  {
    id: "bp-0002",
    patientId: "pt-aaa111",
    systolic: 139,
    diastolic: 86,
    measuredAt: "2026-10-01T07:50:00.000Z",
    measuredBy: "caregiver",
    recordedBy: "caregiver",
  },
  {
    id: "bp-0003",
    patientId: "pt-bbb222",
    systolic: 161,
    diastolic: 99,
    measuredAt: "2026-09-30T09:05:00.000Z",
    measuredBy: "bhw",
    recordedBy: "bhw",
    note: "Reported headache",
  },
];

export const seedVisitNotes: VisitNote[] = [
  {
    id: "vn-0001",
    patientId: "pt-aaa111",
    authoredAt: "2026-09-28T08:30:00.000Z",
    authoredBy: "bhw",
    text: "Advised low-salt diet; follow up in two weeks.",
  },
];
