import type { TransferBundle } from "./models";

/**
 * Transport abstraction (PHASM-20/#41). The native build used Nearby
 * Connections; the Expo managed app cannot ship that native module without a
 * dev-client, so the MVP uses a mock loopback transport. It simulates device
 * discovery and a confirmed, single-patient, device-to-device transfer entirely
 * in-process so the Send/Receive flow is demonstrable offline and on web/PWA.
 */
export interface DiscoveredDevice {
  id: string;
  name: string;
}

export type TransferPhase =
  | "idle"
  | "discovering"
  | "connecting"
  | "transferring"
  | "done"
  | "failed";

const MOCK_DEVICES: DiscoveredDevice[] = [
  { id: "dev-rhu-01", name: "RHU Tablet (BHW)" },
  { id: "dev-bhw-02", name: "BHW Phone" },
];

export function discoverDevices(): Promise<DiscoveredDevice[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_DEVICES), 400);
  });
}

/** A simple in-process channel so a "sent" bundle can be "received". */
const loopbackInbox: TransferBundle[] = [];

export function sendBundle(
  _deviceId: string,
  bundle: TransferBundle,
  onPhase?: (phase: TransferPhase) => void,
): Promise<void> {
  return new Promise((resolve) => {
    onPhase?.("connecting");
    setTimeout(() => {
      onPhase?.("transferring");
      setTimeout(() => {
        loopbackInbox.push(bundle);
        onPhase?.("done");
        resolve();
      }, 500);
    }, 400);
  });
}

/** Pull the most recently sent bundle, simulating an incoming transfer. */
export function receiveBundle(): TransferBundle | undefined {
  return loopbackInbox.shift();
}

/** Seed the inbox so the Receive flow has something to import in a demo. */
export function primeInbox(bundle: TransferBundle): void {
  loopbackInbox.push(bundle);
}
