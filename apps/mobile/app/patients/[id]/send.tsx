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
import { styles, theme } from "../../../src/ui/theme";

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

  return (
    <ScrollView style={styles.screen}>
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
            onPress={() => onSend(d.id)}
            disabled={phase === "connecting" || phase === "transferring"}
          >
            <Text style={styles.cardTitle}>{d.name}</Text>
            <Text style={styles.cardMeta}>Tap to send to {d.id}</Text>
          </TouchableOpacity>
        ))}

      {(phase === "connecting" || phase === "transferring") && (
        <Text style={[styles.cardMeta, { color: theme.accent }]}>
          {phase === "connecting" ? "Connecting…" : "Transferring record…"}
        </Text>
      )}

      {phase === "done" && (
        <View style={styles.card}>
          <Text style={styles.ok}>Transfer complete.</Text>
          <Text style={styles.cardMeta}>
            The receiving device can now confirm the import.
          </Text>
          <TouchableOpacity
            style={styles.buttonAlt}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonAltText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}

      {phase === "failed" && (
        <View style={styles.card}>
          <Text style={styles.error}>{error || "Transfer failed."}</Text>
          <TouchableOpacity style={styles.button} onPress={() => onSend(devices[0]?.id ?? "")}>
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}
