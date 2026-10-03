import { Link, useLocalSearchParams } from "expo-router";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { getStore } from "../../src/domain/store";
import { styles, theme } from "../../src/ui/theme";

export default function PatientList() {
  const { role } = useLocalSearchParams<{ role?: string }>();
  const patients = getStore().listPatients();
  const roleParam = role ? `?role=${role}` : "";

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Patients</Text>
      <Text style={styles.subtitle}>
        {role === "bhw" ? "Health worker view" : "Patient and caregiver view"}. {patients.length} records on this device.
      </Text>
      <FlatList
        data={patients}
        keyExtractor={(p) => p.id}
        ListEmptyComponent={<Text style={styles.cardMeta}>No patient records yet.</Text>}
        renderItem={({ item }) => (
          <Link href={`/patients/${item.id}${roleParam}`} asChild>
            <TouchableOpacity style={styles.card} accessibilityRole="button" accessibilityLabel={`Open record for ${item.label}`} accessibilityHint="Shows blood pressure readings and record actions">
              <Text style={styles.cardTitle}>{item.label}</Text>
              <Text style={styles.cardMeta}>Record ID: {item.id}</Text>
              <Text style={[styles.cardMeta, { color: theme.accent, fontWeight: "700" }]}>Open record</Text>
            </TouchableOpacity>
          </Link>
        )}
      />
      {role === "bhw" ? (
        <Link href="/receive" asChild>
          <TouchableOpacity style={styles.buttonAlt} accessibilityRole="button" accessibilityLabel="Receive a patient record">
            <Text style={styles.buttonAltText}>Receive a record</Text>
          </TouchableOpacity>
        </Link>
      ) : (
        <Text style={[styles.cardMeta, { marginTop: 8 }]}>
          Open a record to view readings or send it to a health worker.
        </Text>
      )}
    </View>
  );
}
