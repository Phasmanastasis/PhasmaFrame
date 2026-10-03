import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import type { TransferBundle } from "../src/domain/models";
import { getStore, type ImportResult } from "../src/domain/store";
import { exportSampleIncoming } from "../src/domain/demo";
import { styles, theme } from "../src/ui/theme";

type Step = "discover" | "preview" | "receipt";

export default function Receive() {
  const router = useRouter();
  const store = getStore();
  const [step, setStep] = useState<Step>("discover");
  const [incoming, setIncoming] = useState<TransferBundle | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  function onDiscover() {
    // Simulate an incoming bundle from a nearby sender.
    setIncoming(exportSampleIncoming());
    setStep("preview");
  }

  function onConfirmImport() {
    if (!incoming) return;
    setResult(store.importBundle(incoming));
    setStep("receipt");
  }

  return (
    <ScrollView style={styles.scrollScreen} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Receive a record</Text>

      {step === "discover" && (
        <>
          <Text style={styles.subtitle}>
            Find a nearby sender. You can review the record before you add it.
          </Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Before you begin</Text>
            <Text style={styles.cardMeta}>Demo mode uses a simulated nearby device. No second phone is needed. Nothing is added until you confirm.</Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={onDiscover} accessibilityRole="button" accessibilityLabel="Find a nearby device to receive a patient record" accessibilityHint="Looks for a sender, then shows you a review screen.">
            <Text style={styles.buttonText}>Find nearby device</Text>
          </TouchableOpacity>
        </>
      )}

      {step === "preview" && incoming && (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle} accessibilityRole="header">Review this patient record</Text>
            <Text style={[styles.cardMeta, { fontWeight: "700" }]}>{incoming.patient.label}</Text>
            <Text style={styles.cardMeta}>Local ID: {incoming.patient.id}</Text>
            <Text style={styles.cardMeta}>
              {incoming.readings.length} readings and {incoming.visitNotes.length} notes
            </Text>
            <Text style={[styles.cardMeta, { marginTop: 12 }]}>
              Duplicate items will be skipped. Existing information will not be changed.
            </Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={onConfirmImport} accessibilityRole="button" accessibilityLabel={`Confirm and add ${incoming.patient.label}'s patient record`} accessibilityHint="Adds new readings and notes. Existing items are kept unchanged.">
            <Text style={styles.buttonText}>Confirm and add record</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonAlt} onPress={() => setStep("discover")} accessibilityRole="button" accessibilityLabel="Cancel and return to device search">
            <Text style={styles.buttonAltText}>Cancel and go back</Text>
          </TouchableOpacity>
        </>
      )}

      {step === "receipt" && result && (
        <View style={styles.card} accessibilityLiveRegion="polite">
          <Text style={styles.ok} accessibilityRole="header">Record received</Text>
          <Text style={styles.cardMeta}>Patient ID: {result.patientId}</Text>
          <Text style={styles.cardMeta}>
            Readings: {result.readingsAdded} added, {result.readingsSkipped} already on this device
          </Text>
          <Text style={styles.cardMeta}>
            Notes: {result.notesAdded} added, {result.notesSkipped} already on this device
          </Text>
          <TouchableOpacity style={styles.buttonAlt} onPress={() => router.replace("/patients?role=bhw")} accessibilityRole="button" accessibilityLabel="Return to the patient list">
            <Text style={styles.buttonAltText}>Back to patients</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={{ color: theme.textMuted, fontSize: 16, lineHeight: 24, marginTop: 16 }}>
        If a record cannot be added, existing information stays unchanged.
      </Text>
    </ScrollView>
  );
}
