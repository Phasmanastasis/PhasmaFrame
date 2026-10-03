import { Inbox } from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, Text, View } from "react-native";
import { getStore } from "../../src/domain/store";
import {
  EmptyState,
  PatientListItem,
  ScreenContainer,
  SecondaryButton,
} from "../../src/ui/components";
import { styles } from "../../src/ui/theme";

export default function PatientList() {
  const { role } = useLocalSearchParams<{ role?: string }>();
  const router = useRouter();
  const patients = getStore().listPatients();
  const roleParam = role ? `?role=${role}` : "";
  const isBhw = role === "bhw";

  return (
    <ScreenContainer>
      <Text style={styles.subtitle}>
        {isBhw ? "BHW view" : "Patient / caregiver view"} · {patients.length}{" "}
        patients
      </Text>

      <View style={{ flex: 1 }}>
        <FlatList
          data={patients}
          keyExtractor={(p) => p.id}
          ListEmptyComponent={
            <EmptyState
              title="No patients yet"
              message="Patient records will appear here once added."
            />
          }
          renderItem={({ item }) => (
            <PatientListItem
              label={item.label}
              meta={`Local ID: ${item.id}`}
              onPress={() => router.push(`/patients/${item.id}${roleParam}`)}
            />
          )}
        />
      </View>

      {isBhw ? (
        <SecondaryButton
          label="Receive record"
          icon={Inbox}
          onPress={() => router.push("/receive")}
        />
      ) : (
        <Text style={styles.hint}>
          Open a patient to view readings or send their record.
        </Text>
      )}
    </ScreenContainer>
  );
}
