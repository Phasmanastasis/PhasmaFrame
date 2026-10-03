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
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [phase, setPhase] = useState<TransferPhase>("discovering");
  const [error, setError] = useState("");

  async function findDevices() {
    setError("");
    setPhase("discovering");
    setSelectedDevice(null);
    setDevices([]);
    try {
      setDevices(await discoverDevices());
      setPhase("idle");
    } catch {
      setPhase("failed");
      setError(
        "We could not find nearby devices. Check that both devices are close, then try again.",
      );
    }
  }

  useEffect(() => {
    void findDevices();
  }, []);

  async function onSend() {
    if (!selectedDevice) return;
    setError("");
    try {
      const bundle = store.exportBundle(id);
      await sendBundle(selectedDevice, bundle, setPhase);
    } catch (e) {
      setPhase("failed");
      setError(e instanceof Error ? e.message : "The record could not be sent. Please try again.");
    }
  }

  const busy = phase === "connecting" || phase === "transferring";
  const selected = devices.find((device) => device.id === selectedDevice);

  return (
    <ScrollView style={styles.scrollScreen} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Send a patient record</Text>
      <Text style={styles.subtitle}>
        Choose who will receive {patient?.label ?? id}. You will review the choice
        before sending. This demo simulates the nearby device.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Record to send</Text>
        <Text style={styles.cardMeta}>{patient?.label ?? id}</Text>
        <Text style={styles.cardMeta}>Only this patient’s record will be sent.</Text>
      </View>

      <Text style={styles.label} accessibilityRole="header">
        1. Choose a nearby device
      </Text>
      {phase === "discovering" && (
        <Text style={styles.cardMeta} accessibilityLiveRegion="polite">Looking for nearby devices… Keep both devices close.</Text>
      )}

      {phase !== "discovering" && devices.length === 0 && phase !== "failed" && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>No nearby devices found</Text>
          <Text style={styles.cardMeta}>Move the devices closer and search again.</Text>
          <TouchableOpacity
            style={styles.buttonAlt}
            onPress={findDevices}
            accessibilityRole="button"
            accessibilityLabel="Search for nearby devices again"
          >
            <Text style={styles.buttonAltText}>Search again</Text>
          </TouchableOpacity>
        </View>
      )}

      {phase !== "done" && devices.map((device) => {
        const isSelected = selectedDevice === device.id;
        return (
          <TouchableOpacity
            key={device.id}
            style={[
              styles.card,
              isSelected && {
                borderColor: theme.accent,
                borderWidth: 3,
                backgroundColor: theme.surfaceAlt,
              },
            ]}
            onPress={() => setSelectedDevice(device.id)}
            disabled={busy || phase === "discovering"}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected, disabled: busy || phase === "discovering" }}
            accessibilityLabel={`${device.name}, ${isSelected ? "selected" : "not selected"}`}
            accessibilityHint="Select this device as the recipient. You will confirm before sending."
          >
            <Text style={styles.cardTitle}>{device.name}</Text>
            <Text style={styles.cardMeta}>Nearby recipient</Text>
            <Text style={[styles.cardMeta, { color: theme.accent, fontWeight: "700" }]}>
              {isSelected ? "Selected recipient" : "Tap to select"}
            </Text>
          </TouchableOpacity>
        );
      })}

      {selected && phase === "idle" && (
        <View style={styles.card}>
          <Text style={styles.label}>2. Review and send</Text>
          <Text style={styles.cardMeta}>
            Send {patient?.label ?? id} to {selected.name}?
          </Text>
          <Text style={styles.cardMeta}>The other device must confirm before adding the record.</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={onSend}
            accessibilityRole="button"
            accessibilityLabel={`Send ${patient?.label ?? id} to ${selected.name}`}
            accessibilityHint="Starts sending this one patient record to the selected device."
          >
            <Text style={styles.buttonText}>Confirm and send</Text>
          </TouchableOpacity>
        </View>
      )}

      {busy && (
        <View style={styles.card} accessibilityLiveRegion="polite">
          <Text style={[styles.cardTitle, { color: theme.accent }]}>
            {phase === "connecting"
              ? "Connecting to recipient…"
              : "Sending the record…"}
          </Text>
          <Text style={styles.cardMeta}>Keep the devices close. This may take a moment.</Text>
        </View>
      )}

      {phase === "done" && (
        <View style={styles.card} accessibilityLiveRegion="polite">
          <Text style={styles.ok} accessibilityRole="header">Record sent</Text>
          <Text style={styles.cardMeta}>The receiving device can now review and confirm the import.</Text>
          <TouchableOpacity
            style={styles.buttonAlt}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Finish and return to the patient record"
          >
            <Text style={styles.buttonAltText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}

      {phase === "failed" && (
        <View style={styles.card} accessibilityLiveRegion="assertive">
          <Text style={styles.error} accessibilityRole="alert">
            {error || "The record could not be sent."}
          </Text>
          {devices.length > 0 ? (
            <TouchableOpacity
              style={styles.button}
              onPress={onSend}
              disabled={!selectedDevice}
              accessibilityRole="button"
              accessibilityState={{ disabled: !selectedDevice }}
              accessibilityLabel="Try sending the record again"
            >
              <Text style={styles.buttonText}>Try again</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.button} onPress={findDevices} accessibilityRole="button" accessibilityLabel="Search for nearby devices again">
              <Text style={styles.buttonText}>Search again</Text>
            </TouchableOpacity>
          )}
          {devices.length > 0 && !selectedDevice && <Text style={styles.cardMeta}>Select a recipient before trying again.</Text>}
        </View>
      )}
    </ScrollView>
  );
}
