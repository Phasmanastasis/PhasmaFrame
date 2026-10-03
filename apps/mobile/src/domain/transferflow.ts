import type { ImportResult } from "./store";
import type { TransferBundle } from "./models";
import type { ImportPreview } from "./usecase";
import { decodePayload, previewBundle, commitBundle } from "./usecase";
import { encode } from "./codec";

/**
 * Transfer-flow state machine (ported from TransferState + Send/Receive
 * controllers, #25/#43). A testable state machine independent of the UI and of
 * any particular transport. On any failure, device data is left unchanged and
 * the UI offers retry/cancel.
 */
export type TransferState =
  | { kind: "idle" }
  // sender
  | { kind: "advertising" }
  | { kind: "sending" }
  | { kind: "sent" }
  // receiver
  | { kind: "discovering"; endpoints: string[] }
  | { kind: "verifying"; token: string }
  | { kind: "preview"; preview: ImportPreview }
  | { kind: "importing" }
  | { kind: "receipt"; result: ImportResult }
  // shared
  | { kind: "failure"; reason: string; canRetry: boolean };

/** Minimal transport surface the controllers need (payload is encoded bytes/string). */
export interface Transport {
  startAdvertising(localName: string): Promise<void>;
  send(payload: string): Promise<void>;
  stop(): Promise<void>;
}

type Listener = (state: TransferState) => void;

class Emitter {
  protected state: TransferState = { kind: "idle" };
  private listeners = new Set<Listener>();
  getState(): TransferState {
    return this.state;
  }
  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    fn(this.state);
    return () => this.listeners.delete(fn);
  }
  protected set(next: TransferState): void {
    this.state = next;
    this.listeners.forEach((l) => l(next));
  }
}

/** Sender-side flow: advertise, encode + transmit a one-patient bundle, report done. */
export class SendTransferController extends Emitter {
  constructor(private readonly transport: Transport) {
    super();
  }

  async startSending(localName: string): Promise<void> {
    try {
      await this.transport.startAdvertising(localName);
      this.set({ kind: "advertising" });
    } catch (e) {
      this.set({
        kind: "failure",
        reason: msg(e, "Could not start sending. Try again."),
        canRetry: true,
      });
    }
  }

  async send(bundle: TransferBundle): Promise<void> {
    this.set({ kind: "sending" });
    try {
      await this.transport.send(encode(bundle));
      this.set({ kind: "sent" });
    } catch (e) {
      this.set({ kind: "failure", reason: msg(e, "Send failed. Try again."), canRetry: true });
    }
  }

  async cancel(): Promise<void> {
    await this.transport.stop();
    this.set({ kind: "idle" });
  }
}

/** Receiver-side flow: decode + preview, then commit on confirm. */
export class ReceiveTransferController extends Emitter {
  private pending?: TransferBundle;

  /** Decode an incoming payload and move to preview; data is not written yet. */
  receive(payload: string): void {
    try {
      const bundle = decodePayload(payload);
      this.pending = bundle;
      this.set({ kind: "preview", preview: previewBundle(bundle) });
    } catch (e) {
      // Malformed / unknown version: data unchanged, no retry of the same bytes.
      this.set({ kind: "failure", reason: msg(e, "Could not read the record."), canRetry: false });
    }
  }

  /** Commit the previewed bundle (repeat-safe). */
  confirmImport(): void {
    if (!this.pending) {
      this.set({ kind: "failure", reason: "Nothing to import.", canRetry: false });
      return;
    }
    this.set({ kind: "importing" });
    try {
      const result = commitBundle(this.pending);
      this.pending = undefined;
      this.set({ kind: "receipt", result });
    } catch (e) {
      this.set({ kind: "failure", reason: msg(e, "Import failed. Try again."), canRetry: true });
    }
  }

  cancel(): void {
    this.pending = undefined;
    this.set({ kind: "idle" });
  }
}

function msg(e: unknown, fallback: string): string {
  return e instanceof Error && e.message ? e.message : fallback;
}
