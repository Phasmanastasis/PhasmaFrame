import { Link, useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "../src/ui/theme";

/**
 * Home / role choice (app sitemap root). Both roles land on the patient list;
 * the role is carried as a query param so downstream screens can show
 * role-appropriate actions (BHW gets visit notes, RHU summary, and Receive).
 */
export default function Home() {
  const router = useRouter();
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>PhasmaFrame</Text>
      <Text style={styles.subtitle}>
        Offline hypertension follow-up. Choose how you are using the app.
      </Text>

      <TouchableOpacity
        style={styles.button}
        accessibilityRole="button"
        onPress={() => router.push("/patients?role=caregiver")}
      >
        <Text style={styles.buttonText}>Patient or caregiver</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonAlt}
        accessibilityRole="button"
        onPress={() => router.push("/patients?role=bhw")}
      >
        <Text style={styles.buttonAltText}>BHW (health worker)</Text>
      </TouchableOpacity>

      <View style={{ marginTop: 24 }}>
        <Link href="/receive" style={{ color: "#38bdf8", fontSize: 14 }}>
          BHW: receive a record →
        </Link>
      </View>
    </View>
  );
}
