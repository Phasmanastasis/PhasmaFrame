import { HeartHandshake, Stethoscope } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Text } from "react-native";
import { ScreenContainer, RoleCard } from "../src/ui/components";
import { styles } from "../src/ui/theme";

/**
 * Home / role choice (DESIGN.md Section 11.1). Both roles land on the patient
 * list; the role is carried as a query param so downstream screens show
 * role-appropriate actions (BHW gets visit notes, RHU summary, and Receive).
 */
export default function Home() {
  const router = useRouter();
  return (
    <ScreenContainer>
      <Text style={styles.title}>Kasigla</Text>
      <Text style={styles.subtitle}>
        A calm path to trusted care, wherever home may be. Choose how you are
        using the app.
      </Text>

      <RoleCard
        title="Patient or caregiver"
        subtitle="Record readings and send a record during a visit."
        icon={HeartHandshake}
        onPress={() => router.push("/patients?role=caregiver")}
      />
      <RoleCard
        title="BHW (health worker)"
        subtitle="Receive, review, and summarize a patient's record."
        icon={Stethoscope}
        onPress={() => router.push("/patients?role=bhw")}
      />
    </ScreenContainer>
  );
}
