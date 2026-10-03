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
      <Text style={styles.subtitle}>
        {role === "bhw" ? "BHW view" : "Patient / caregiver view"} ·{" "}
        {patients.length} patients
      </Text>
      <FlatList
        data={patients}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <Link href={`/patients/${item.id}${roleParam}`} asChild>
            <TouchableOpacity style={styles.card} accessibilityRole="button">
              <Text style={styles.cardTitle}>{item.label}</Text>
              <Text style={styles.cardMeta}>Local ID: {item.id}</Text>
            </TouchableOpacity>
          </Link>
        )}
      />
      {role === "bhw" ? (
        <Link href="/receive" asChild>
          <TouchableOpacity style={styles.buttonAlt} accessibilityRole="button">
            <Text style={styles.buttonAltText}>Receive record</Text>
          </TouchableOpacity>
        </Link>
      ) : (
        <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 8 }}>
          Open a patient to view readings or send their record.
        </Text>
      )}
    </View>
  );
}
