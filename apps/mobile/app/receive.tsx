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
    <ScrollView style={styles.screen}>
      <Text style={styles.title}>Receive record</Text>

      {step === "discover" && (
        <>
          <Text style={styles.subtitle}>
            Look for a nearby sender, then preview before importing.
          </Text>
          <TouchableOpacity style={styles.button} onPress={onDiscover}>
            <Text style={styles.buttonText}>Discover nearby device</Text>
          </TouchableOpacity>
        </>
      )}

      {step === "preview" && incoming && (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{incoming.patient.label}</Text>
            <Text style={styles.cardMeta}>Local ID: {incoming.patient.id}</Text>
            <Text style={styles.cardMeta}>
              {incoming.readings.length} readings · {incoming.visitNotes.length}{" "}
              notes
            </Text>
            <Text style={[styles.cardMeta, { marginTop: 6 }]}>
              Duplicate IDs are skipped; existing entries are never overwritten.
            </Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={onConfirmImport}>
            <Text style={styles.buttonText}>Confirm import</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonAlt}
            onPress={() => setStep("discover")}
          >
            <Text style={styles.buttonAltText}>Cancel</Text>
          </TouchableOpacity>
        </>
      )}

      {step === "receipt" && result && (
        <View style={styles.card}>
          <Text style={styles.ok}>Import receipt</Text>
          <Text style={styles.cardMeta}>Patient: {result.patientId}</Text>
          <Text style={styles.cardMeta}>
            Readings added {result.readingsAdded}, skipped{" "}
            {result.readingsSkipped}
          </Text>
          <Text style={styles.cardMeta}>
            Notes added {result.notesAdded}, skipped {result.notesSkipped}
          </Text>
          <TouchableOpacity
            style={styles.buttonAlt}
            onPress={() => router.replace("/patients?role=bhw")}
          >
            <Text style={styles.buttonAltText}>Back to patients</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 16 }}>
        Failed or invalid imports leave existing data unchanged.
      </Text>
    </ScrollView>
  );
}
