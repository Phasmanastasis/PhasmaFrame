import type {
  BloodPressureReading,
  EntrySource,
  Patient,
  TransferBundle,
  VisitNote,
} from "./models";

/**
 * Encodes/decodes a {@link TransferBundle} to/from a versioned wire payload.
 *
 * Ported from the native `TransferBundleCodec` (#18/#35). The native build used
 * Protobuf; in the Expo managed / PWA app the payload is a deterministic,
 * versioned JSON envelope. The *contract* is identical and transport-independent:
 *
 * - **Versioned:** every encoded bundle carries {@link SCHEMA_VERSION}; `decode`
 *   rejects any other version with {@link UnsupportedSchemaVersionError}.
 * - **Lossless round-trip:** all fields survive encode→decode.
 * - **Deterministic:** keys are emitted in a fixed order, so the same bundle
 *   always encodes to the same bytes (stable for size checks / comparison).
 * - **Transport-independent:** the bytes can go over any transport.
 */

export const SCHEMA_VERSION = 1 as const;

/** Base type for all bundle codec failures. */
export class BundleCodecError extends Error {}

/** The decoded bundle declares a schema version this build does not support. */
export class UnsupportedSchemaVersionError extends BundleCodecError {
  constructor(
    readonly foundVersion: number,
    readonly supportedVersion: number,
  ) {
    super(
      `Unsupported bundle schema version ${foundVersion} (this app supports ${supportedVersion}).`,
    );
    this.name = "UnsupportedSchemaVersionError";
  }
}

/** The bytes could not be parsed as a TransferBundle (corrupt or not a bundle). */
export class MalformedBundleError extends BundleCodecError {
  constructor(cause?: unknown) {
    super("Bundle payload is malformed or not a TransferBundle.");
    this.name = "MalformedBundleError";
    if (cause instanceof Error) this.cause = cause;
  }
}

const SOURCES: readonly EntrySource[] = ["patient", "caregiver", "bhw"];

/** Deterministic wire envelope. Field order here fixes the serialized output. */
interface Envelope {
  id: string;
  schemaVersion: number;
  patient: Patient;
  readings: BloodPressureReading[];
  visitNotes: VisitNote[];
  createdAt: string;
}

function orderedReading(r: BloodPressureReading): BloodPressureReading {
  return {
    id: r.id,
    patientId: r.patientId,
    systolic: r.systolic,
    diastolic: r.diastolic,
    measuredAt: r.measuredAt,
    measuredBy: r.measuredBy,
    recordedBy: r.recordedBy,
    note: r.note,
  };
}

export function encode(bundle: TransferBundle): string {
  const envelope: Envelope = {
    id: bundle.bundleId,
    // Always stamp the current version so encoders cannot emit an inconsistent one.
    schemaVersion: SCHEMA_VERSION,
    patient: { id: bundle.patient.id, label: bundle.patient.label, birthYear: bundle.patient.birthYear },
    readings: bundle.readings.map(orderedReading),
    visitNotes: bundle.visitNotes.map((n) => ({
      id: n.id,
      patientId: n.patientId,
      authoredAt: n.authoredAt,
      authoredBy: n.authoredBy,
      text: n.text,
    })),
    createdAt: bundle.createdAt,
  };
  return JSON.stringify(envelope);
}

function isSource(v: unknown): v is EntrySource {
  return typeof v === "string" && (SOURCES as readonly string[]).includes(v);
}

/**
 * Decodes a bundle from an encoded payload.
 * @throws {MalformedBundleError} if the payload is not a valid TransferBundle.
 * @throws {UnsupportedSchemaVersionError} if the schema version is not supported.
 */
export function decode(payload: string): TransferBundle {
  let raw: unknown;
  try {
    raw = JSON.parse(payload);
  } catch (e) {
    throw new MalformedBundleError(e);
  }
  if (typeof raw !== "object" || raw === null) {
    throw new MalformedBundleError();
  }
  const env = raw as Partial<Envelope>;

  if (typeof env.schemaVersion !== "number") {
    throw new MalformedBundleError();
  }
  if (env.schemaVersion !== SCHEMA_VERSION) {
    throw new UnsupportedSchemaVersionError(env.schemaVersion, SCHEMA_VERSION);
  }
  if (
    typeof env.id !== "string" ||
    typeof env.createdAt !== "string" ||
    typeof env.patient !== "object" ||
    env.patient === null ||
    typeof (env.patient as Patient).id !== "string" ||
    !Array.isArray(env.readings) ||
    !Array.isArray(env.visitNotes)
  ) {
    throw new MalformedBundleError();
  }

  for (const r of env.readings) {
    if (
      typeof r?.id !== "string" ||
      typeof r?.systolic !== "number" ||
      typeof r?.diastolic !== "number" ||
      !isSource(r?.measuredBy) ||
      !isSource(r?.recordedBy)
    ) {
      throw new MalformedBundleError();
    }
  }

  return {
    bundleId: env.id,
    patient: env.patient as Patient,
    readings: env.readings as BloodPressureReading[],
    visitNotes: env.visitNotes as VisitNote[],
    createdAt: env.createdAt,
  };
}
