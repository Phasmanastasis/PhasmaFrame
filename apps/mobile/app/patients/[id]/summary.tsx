import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { getStore } from "../../../src/domain/store";
import { toCsv } from "../../../src/domain/summary";
import { styles, theme } from "../../../src/ui/theme";

export default function RhuSummary() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const store = getStore();
  const patient = store.getPatient(id);
  const readings = store.listReadings(id);
  const notes = store.listVisitNotes(id);
  const [csv, setCsv] = useState<string | null>(null);

  return (
    <ScrollView style={styles.scrollScreen} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>{patient?.label ?? id}</Text>
      <Text style={styles.subtitle}>
        A summary to review with a health worker. This screen does not send data to a clinic.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Readings: {readings.length}</Text>
        <Text style={styles.cardMeta}>Visit notes: {notes.length}</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel="Show a CSV summary preview"
        onPress={() => setCsv(toCsv(readings))}
      >
        <Text style={styles.buttonText}>Prepare CSV summary</Text>
      </TouchableOpacity>

      {csv ? (
        <View style={[styles.card, { marginTop: 12 }]}>
          <Text style={styles.ok}>CSV preview is ready</Text>
          <Text style={styles.cardMeta}>Press and hold the text to select or copy it.</Text>
          <Text
            style={{ color: theme.text, fontFamily: "monospace", fontSize: 16, lineHeight: 24, marginTop: 12 }}
            selectable
            accessibilityLabel="CSV summary preview"
          >
            {csv}
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
