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
    <ScrollView style={styles.screen}>
      <Text style={styles.title}>{patient?.label ?? id}</Text>
      <Text style={styles.subtitle}>
        Review and export only. This screen does not send data to an RHU.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Readings: {readings.length}</Text>
        <Text style={styles.cardMeta}>Visit notes: {notes.length}</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setCsv(toCsv(readings))}
      >
        <Text style={styles.buttonText}>Export summary as CSV</Text>
      </TouchableOpacity>

      {csv ? (
        <View style={[styles.card, { marginTop: 12 }]}>
          <Text style={styles.ok}>CSV generated:</Text>
          <Text
            style={{ color: theme.textMuted, fontFamily: "monospace", fontSize: 12, marginTop: 6 }}
            selectable
          >
            {csv}
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
