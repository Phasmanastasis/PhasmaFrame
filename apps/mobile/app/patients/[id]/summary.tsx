import { Download } from "lucide-react-native";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { getStore } from "../../../src/domain/store";
import { OfflineBanner, PrimaryButton } from "../../../src/ui/components";
import { fonts, styles, theme } from "../../../src/ui/theme";

/** Build a CSV string for the patient's readings (RhuSummaryBuilder, #40). */
function toCsv(
  rows: { measuredAt: string; systolic: number; diastolic: number; measuredBy: string }[],
): string {
  const header = "measured_at,systolic,diastolic,measured_by";
  const body = rows
    .map((r) => `${r.measuredAt},${r.systolic},${r.diastolic},${r.measuredBy}`)
    .join("\n");
  return `${header}\n${body}`;
}

export default function RhuSummary() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const store = getStore();
  const patient = store.getPatient(id);
  const readings = store.listReadings(id);
  const notes = store.listVisitNotes(id);
  const [csv, setCsv] = useState<string | null>(null);

  return (
    <ScrollView style={styles.screen}>
      <OfflineBanner />
      <Text style={styles.title}>{patient?.label ?? id}</Text>
      <Text style={styles.subtitle}>
        Review and export only. This screen does not send data to an RHU.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Readings: {readings.length}</Text>
        <Text style={styles.cardMeta}>Visit notes: {notes.length}</Text>
      </View>

      <PrimaryButton
        label="Export summary as CSV"
        icon={Download}
        onPress={() => setCsv(toCsv(readings))}
      />

      {csv ? (
        <View style={[styles.card, { marginTop: 12 }]}>
          <Text style={styles.ok}>CSV generated</Text>
          <Text
            style={{
              color: theme.textMuted,
              fontFamily: fonts.body,
              fontSize: 12,
              marginTop: 6,
            }}
            selectable
          >
            {csv}
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
