import { Link, useLocalSearchParams } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { getStore } from "../../../src/domain/store";
import { styles, theme } from "../../../src/ui/theme";

export default function PatientSummary() {
  const { id, role } = useLocalSearchParams<{ id: string; role?: string }>();
  const store = getStore();
  const patient = store.getPatient(id);
  const readings = store.listReadings(id);
  const roleParam = role ? `?role=${role}` : "";
  const isBhw = role === "bhw";

  if (!patient) {
    return (
      <View style={styles.screen}>
        <Text style={styles.error}>Patient not found.</Text>
      </View>
    );
  }

  const latest = readings[0];

  return (
    <ScrollView style={styles.screen}>
      <Text style={styles.title}>{patient.label}</Text>
      <Text style={styles.subtitle}>Local ID: {patient.id}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Latest reading</Text>
        {latest ? (
          <Text style={styles.cardMeta}>
            {latest.systolic}/{latest.diastolic} mmHg ·{" "}
            {new Date(latest.measuredAt).toLocaleDateString()} · measured by{" "}
            {latest.measuredBy}
          </Text>
        ) : (
          <Text style={styles.cardMeta}>No readings yet.</Text>
        )}
      </View>

      <Link href={`/patients/${id}/history${roleParam}`} asChild>
        <TouchableOpacity style={styles.buttonAlt}>
          <Text style={styles.buttonAltText}>Reading history</Text>
        </TouchableOpacity>
      </Link>

      <Link href={`/patients/${id}/add-reading${roleParam}`} asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Add blood-pressure reading</Text>
        </TouchableOpacity>
      </Link>

      {isBhw && (
        <>
          <Link href={`/patients/${id}/add-note${roleParam}`} asChild>
            <TouchableOpacity style={styles.buttonAlt}>
              <Text style={styles.buttonAltText}>Add visit note</Text>
            </TouchableOpacity>
          </Link>
          <Link href={`/patients/${id}/summary${roleParam}`} asChild>
            <TouchableOpacity style={styles.buttonAlt}>
              <Text style={styles.buttonAltText}>RHU / YAKAP summary</Text>
            </TouchableOpacity>
          </Link>
        </>
      )}

      {!isBhw && (
        <Link href={`/patients/${id}/send${roleParam}`} asChild>
          <TouchableOpacity style={styles.buttonAlt}>
            <Text style={styles.buttonAltText}>Send record</Text>
          </TouchableOpacity>
        </Link>
      )}

      <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 16 }}>
        Data stays on this device except during a confirmed transfer.
      </Text>
    </ScrollView>
  );
}
