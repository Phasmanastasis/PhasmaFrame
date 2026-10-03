import { RefreshCw, Smartphone } from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { getStore } from "../../../src/domain/store";
import {
  type DiscoveredDevice,
  type TransferPhase,
  discoverDevices,
  sendBundle,
} from "../../../src/domain/transport";
import {
  OfflineBanner,
  PrimaryButton,
  SecondaryButton,
} from "../../../src/ui/components";
import { spacing, styles, theme } from "../../../src/ui/theme";

export default function SendRecord() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const store = getStore();
  const patient = store.getPatient(id);
  const [devices, setDevices] = useState<DiscoveredDevice[]>([]);
  const [phase, setPhase] = useState<TransferPhase>("discovering");
  const [error, setError] = useState("");

  useEffect(() => {
    discoverDevices().then((d) => {
      setDevices(d);
      setPhase("idle");
    });
  }, []);

  async function onSend(deviceId: string) {
    setError("");
    try {
      const bundle = store.exportBundle(id);
      await sendBundle(deviceId, bundle, setPhase);
    } catch (e) {
      setPhase("failed");
      setError(e instanceof Error ? e.message : "Transfer failed.");
    }
  }

  const busy = phase === "connecting" || phase === "transferring";

  return (
    <ScrollView style={styles.screen}>
      <OfflineBanner />
      <Text style={styles.title}>Send {patient?.label ?? id}</Text>
      <Text style={styles.subtitle}>
        One patient record per transfer. The receiver must confirm the import.
      </Text>

      {phase === "discovering" && (
        <Text style={styles.cardMeta}>Discovering nearby devices…</Text>
      )}

      {phase !== "done" &&
        devices.map((d) => (
          <TouchableOpacity
            key={d.id}
            style={styles.card}
            accessibilityRole="button"
            accessibilityLabel={`Send to ${d.name}`}
            onPress={() => onSend(d.id)}
            disabled={busy}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
              <Smartphone size={18} color={theme.accentActive} strokeWidth={2} />
              <Text style={styles.cardTitle}>{d.name}</Text>
            </View>
            <Text style={styles.cardMeta}>Tap to send to {d.id}</Text>
          </TouchableOpacity>
        ))}

      {busy && (
        <Text style={[styles.cardMeta, { color: theme.accentActive }]}>
          {phase === "connecting" ? "Connecting…" : "Transferring record…"}
        </Text>
      )}

      {phase === "done" && (
        <View style={styles.card}>
          <Text style={styles.ok}>Transfer complete</Text>
          <Text style={styles.cardMeta}>
            The receiving device can now confirm the import.
          </Text>
          <SecondaryButton label="Done" onPress={() => router.back()} />
        </View>
      )}

      {phase === "failed" && (
        <View style={styles.card}>
          <Text style={styles.error}>{error || "Transfer failed."}</Text>
          <PrimaryButton
            label="Retry"
            icon={RefreshCw}
            onPress={() => onSend(devices[0]?.id ?? "")}
          />
        </View>
      )}
    </ScrollView>
  );
}
