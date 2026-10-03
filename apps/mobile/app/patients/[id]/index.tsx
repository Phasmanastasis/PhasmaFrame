import {
  ClipboardList,
  FilePlus2,
  History,
  PlusCircle,
  Send,
} from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { getStore } from "../../../src/domain/store";
import {
  OfflineBanner,
  PrimaryButton,
  SecondaryButton,
} from "../../../src/ui/components";
import { styles } from "../../../src/ui/theme";

export default function PatientSummary() {
  const { id, role } = useLocalSearchParams<{ id: string; role?: string }>();
  const router = useRouter();
  const store = getStore();
  const patient = store.getPatient(id);
  const readings = store.listReadings(id);
  const roleParam = role ? `?role=${role}` : "";
  const isBhw = role === "bhw";

  if (!patient) {
    return (
      <ScrollView style={styles.screen}>
        <OfflineBanner />
        <Text style={styles.error}>Patient not found.</Text>
      </ScrollView>
    );
  }

  const latest = readings[0];

  return (
    <ScrollView style={styles.screen}>
      <OfflineBanner />
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

      <PrimaryButton
        label="Add blood-pressure reading"
        icon={PlusCircle}
        onPress={() => router.push(`/patients/${id}/add-reading${roleParam}`)}
      />
      <SecondaryButton
        label="Reading history"
        icon={History}
        onPress={() => router.push(`/patients/${id}/history${roleParam}`)}
      />

      {isBhw ? (
        <>
          <SecondaryButton
            label="Add visit note"
            icon={FilePlus2}
            onPress={() => router.push(`/patients/${id}/add-note${roleParam}`)}
          />
          <SecondaryButton
            label="RHU / YAKAP summary"
            icon={ClipboardList}
            onPress={() => router.push(`/patients/${id}/summary${roleParam}`)}
          />
        </>
      ) : (
        <SecondaryButton
          label="Send record"
          icon={Send}
          onPress={() => router.push(`/patients/${id}/send${roleParam}`)}
        />
      )}

      <Text style={styles.hint}>
        Data stays on this device except during a confirmed transfer.
      </Text>
    </ScrollView>
  );
}
