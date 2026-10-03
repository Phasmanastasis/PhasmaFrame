import type { TransferBundle } from "./models";
import { decode } from "./codec";
import { getStore } from "./store";

/**
 * Import use-case (ported from ImportBundleUseCase, #21/#36). Three stages:
 * 1. decode + validate payload bytes (delegated to the codec),
 * 2. preview (no writes) for the BHW to confirm,
 * 3. commit — repeat-safe, append-only by id.
 */

/** What a received bundle contains, shown before import for verification. */
export interface ImportPreview {
  patientId: string;
  patientLabel: string;
  readingCount: number;
  visitNoteCount: number;
  /** readings + notes. */
  totalEntryCount: number;
}

/** Stage 1: decode + validate raw payload. Throws on unknown version/malformed. */
export function decodePayload(payload: string): TransferBundle {
  return decode(payload);
}

/** Stage 2: preview a decoded bundle (no writes). */
export function previewBundle(bundle: TransferBundle): ImportPreview {
  const readingCount = bundle.readings.length;
  const visitNoteCount = bundle.visitNotes.length;
  return {
    patientId: bundle.patient.id,
    patientLabel: bundle.patient.label,
    readingCount,
    visitNoteCount,
    totalEntryCount: readingCount + visitNoteCount,
  };
}

/** Convenience: decode + preview straight from bytes. */
export function previewFromPayload(payload: string): ImportPreview {
  return previewBundle(decodePayload(payload));
}

/** Stage 3: commit (repeat-safe). Delegates to the store's importBundle. */
export function commitBundle(bundle: TransferBundle) {
  return getStore().importBundle(bundle);
}

/** Decode + validate + commit from raw bytes. */
export function importFromPayload(payload: string) {
  return commitBundle(decodePayload(payload));
}
