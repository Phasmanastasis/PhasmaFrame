import { CheckCircle2, Radar } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import type { TransferBundle } from "../src/domain/models";
import { getStore, type ImportResult } from "../src/domain/store";
import { exportSampleIncoming } from "../src/domain/demo";
import {
  OfflineBanner,
  PrimaryButton,
  SecondaryButton,
} from "../src/ui/components";
import { styles } from "../src/ui/theme";

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
      <OfflineBanner />
      <Text style={styles.title}>Receive record</Text>

      {step === "discover" && (
        <>
          <Text style={styles.subtitle}>
            Look for a nearby sender, then preview before importing.
          </Text>
          <PrimaryButton
            label="Discover nearby device"
            icon={Radar}
            onPress={onDiscover}
          />
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
          <PrimaryButton label="Confirm import" onPress={onConfirmImport} />
          <SecondaryButton label="Cancel" onPress={() => setStep("discover")} />
        </>
      )}

      {step === "receipt" && result && (
        <View style={styles.card}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <CheckCircle2 size={18} color="#0D9488" strokeWidth={2} />
            <Text style={styles.ok}>Import receipt</Text>
          </View>
          <Text style={styles.cardMeta}>Patient: {result.patientId}</Text>
          <Text style={styles.cardMeta}>
            Readings added {result.readingsAdded}, skipped{" "}
            {result.readingsSkipped}
          </Text>
          <Text style={styles.cardMeta}>
            Notes added {result.notesAdded}, skipped {result.notesSkipped}
          </Text>
          <SecondaryButton
            label="Back to patients"
            onPress={() => router.replace("/patients?role=bhw")}
          />
        </View>
      )}

      <Text style={styles.hint}>
        Failed or invalid imports leave existing data unchanged.
      </Text>
    </ScrollView>
  );
}
