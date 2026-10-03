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
        <Text style={styles.title}>Record not found</Text>
        <Text style={styles.error}>Go back to the patient list and choose a record again.</Text>
      </View>
    );
  }

  const latest = readings[0];

  return (
    <ScrollView style={styles.scrollScreen} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>{patient.label}</Text>
      <Text style={styles.subtitle}>Record ID: {patient.id}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Most recent reading</Text>
        {latest ? (
          <>
            <Text accessibilityLabel={`Blood pressure ${latest.systolic} over ${latest.diastolic} millimeters of mercury`} style={{ color: theme.text, fontSize: 36, lineHeight: 44, fontWeight: "700", marginTop: 10 }}>
              {latest.systolic}/{latest.diastolic} <Text style={{ fontSize: 18, fontWeight: "600" }}>mmHg</Text>
            </Text>
            <Text style={styles.cardMeta}>{new Date(latest.measuredAt).toLocaleString()}</Text>
            <Text style={styles.cardMeta}>Measured by {latest.measuredBy === "bhw" ? "health worker" : "patient or caregiver"}</Text>
          </>
        ) : (
          <Text style={styles.cardMeta}>No readings recorded yet. Add a reading from your blood pressure monitor.</Text>
        )}
      </View>

      <Link href={`/patients/${id}/history${roleParam}`} asChild>
        <TouchableOpacity style={styles.buttonAlt}>
          <Text style={styles.buttonAltText}>View all readings</Text>
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

      <Text style={[styles.cardMeta, { marginTop: 20 }]}>
        Your record stays on this device. It is shared only when you confirm a transfer.
      </Text>
    </ScrollView>
  );
}
