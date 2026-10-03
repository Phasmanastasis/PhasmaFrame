import { Link, useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../src/ui/theme";

/**
 * Home / role choice (app sitemap root). Both roles land on the patient list;
 * the role is carried as a query param so downstream screens can show
 * role-appropriate actions (BHW gets visit notes, RHU summary, and Receive).
 */
export default function Home() {
  const router = useRouter();
  return (
    <ScrollView style={styles.scrollScreen} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Your blood pressure record</Text>
      <Text style={styles.subtitle}>
        Choose how you are using the app.
      </Text>

      <View style={styles.card} accessibilityRole="alert">
        <Text style={styles.cardTitle}>Demo mode</Text>
        <Text style={styles.cardMeta}>Uses sample records. Do not enter real health information. New entries reset when this demo closes.</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel="Continue as patient or caregiver"
        accessibilityHint="Opens the patient records on this device"
        onPress={() => router.push("/patients?role=caregiver")}
      >
        <Text style={styles.buttonText}>Patient or caregiver</Text>
      </TouchableOpacity>
      <Text style={styles.cardMeta}>View your readings or share one record with a health worker.</Text>

      <TouchableOpacity
        style={styles.buttonAlt}
        accessibilityRole="button"
        accessibilityLabel="Continue as barangay health worker"
        accessibilityHint="Opens patient records and receiving tools"
        onPress={() => router.push("/patients?role=bhw")}
      >
        <Text style={styles.buttonAltText}>Barangay health worker</Text>
      </TouchableOpacity>

      <View style={{ marginTop: 24 }}>
        <Link href="/receive" accessibilityRole="link" style={{ color: "#0F766E", fontSize: 18, fontWeight: "700", textDecorationLine: "underline", paddingVertical: 12 }}>
          Health worker: receive a record
        </Link>
      </View>
    </ScrollView>
  );
}
