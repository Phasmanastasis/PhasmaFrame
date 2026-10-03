import type {
  BloodPressureReading,
  Patient,
  TransferBundle,
  VisitNote,
} from "./models";
import { seedPatients, seedReadings, seedVisitNotes } from "./seed";

/**
 * Local store abstraction. Mirrors the native LocalStore (PHASM-21/#36).
 *
 * The MVP ships an in-memory implementation so it runs identically in the
 * Expo managed app and in the web/PWA target. A SQLite-backed implementation
 * can be swapped in behind the same interface using expo-sqlite; it is kept
 * out of the critical path so the app renders with mock data offline and on
 * web where a native SQLite binding may be unavailable.
 */
export interface LocalStore {
  listPatients(): Patient[];
  getPatient(id: string): Patient | undefined;
  listReadings(patientId: string): BloodPressureReading[];
  listVisitNotes(patientId: string): VisitNote[];
  addReading(reading: BloodPressureReading): void;
  addVisitNote(note: VisitNote): void;
  /** Build a single-patient transfer bundle for sending. */
  exportBundle(patientId: string): TransferBundle;
  /**
   * Import a bundle. Repeat-safe: duplicate IDs are skipped and existing
   * entries are never overwritten (mirrors ImportBundleUseCase, #36).
   */
  importBundle(bundle: TransferBundle): ImportResult;
}

export interface ImportResult {
  patientId: string;
  readingsAdded: number;
  readingsSkipped: number;
  notesAdded: number;
  notesSkipped: number;
}

export class InMemoryStore implements LocalStore {
  private patients = new Map<string, Patient>();
  private readings = new Map<string, BloodPressureReading>();
  private visitNotes = new Map<string, VisitNote>();

  constructor() {
    seedPatients.forEach((p) => this.patients.set(p.id, p));
    seedReadings.forEach((r) => this.readings.set(r.id, r));
    seedVisitNotes.forEach((n) => this.visitNotes.set(n.id, n));
  }

  listPatients(): Patient[] {
    return [...this.patients.values()].sort((a, b) =>
      a.label.localeCompare(b.label),
    );
  }

  getPatient(id: string): Patient | undefined {
    return this.patients.get(id);
  }

  listReadings(patientId: string): BloodPressureReading[] {
    return [...this.readings.values()]
      .filter((r) => r.patientId === patientId)
      .sort((a, b) => b.measuredAt.localeCompare(a.measuredAt));
  }

  listVisitNotes(patientId: string): VisitNote[] {
    return [...this.visitNotes.values()]
      .filter((n) => n.patientId === patientId)
      .sort((a, b) => b.authoredAt.localeCompare(a.authoredAt));
  }

  addReading(reading: BloodPressureReading): void {
    this.readings.set(reading.id, reading);
    if (!this.patients.has(reading.patientId)) {
      this.patients.set(reading.patientId, {
        id: reading.patientId,
        label: reading.patientId,
      });
    }
  }

  addVisitNote(note: VisitNote): void {
    this.visitNotes.set(note.id, note);
  }

  exportBundle(patientId: string): TransferBundle {
    const patient = this.patients.get(patientId);
    if (!patient) {
      throw new Error(`Unknown patient: ${patientId}`);
    }
    return {
      bundleId: `bundle-${patientId}-${Date.now()}`,
      patient,
      readings: this.listReadings(patientId),
      visitNotes: this.listVisitNotes(patientId),
      createdAt: new Date().toISOString(),
    };
  }

  importBundle(bundle: TransferBundle): ImportResult {
    const result: ImportResult = {
      patientId: bundle.patient.id,
      readingsAdded: 0,
      readingsSkipped: 0,
      notesAdded: 0,
      notesSkipped: 0,
    };

    if (!this.patients.has(bundle.patient.id)) {
      this.patients.set(bundle.patient.id, bundle.patient);
    }

    for (const r of bundle.readings) {
      if (this.readings.has(r.id)) {
        result.readingsSkipped += 1;
        continue;
      }
      this.readings.set(r.id, r);
      result.readingsAdded += 1;
    }

    for (const n of bundle.visitNotes) {
      if (this.visitNotes.has(n.id)) {
        result.notesSkipped += 1;
        continue;
      }
      this.visitNotes.set(n.id, n);
      result.notesAdded += 1;
    }

    return result;
  }
}

let store: LocalStore | undefined;

export function getStore(): LocalStore {
  if (!store) {
    store = new InMemoryStore();
  }
  return store;
}
