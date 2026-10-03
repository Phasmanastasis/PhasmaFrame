import { useLocalSearchParams } from "expo-router";
import { FlatList, Text, View } from "react-native";
import { getStore } from "../../../src/domain/store";
import { styles } from "../../../src/ui/theme";

export default function ReadingHistory() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const readings = getStore().listReadings(id);

  return (
    <View style={styles.screen}>
      {readings.length === 0 ? (
        <View>
          <Text style={styles.title}>No readings yet</Text>
          <Text style={styles.subtitle}>Saved blood pressure readings will appear here with their date and who entered them.</Text>
        </View>
      ) : (
        <FlatList
          data={readings}
          keyExtractor={(r) => r.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                {item.systolic}/{item.diastolic} mmHg
              </Text>
              <Text style={styles.cardMeta}>
                {new Date(item.measuredAt).toLocaleString()}
              </Text>
              <Text style={styles.cardMeta}>
                Measured by {item.measuredBy === "bhw" ? "health worker" : "patient or caregiver"} · entered by {item.recordedBy === "bhw" ? "health worker" : "patient or caregiver"}
              </Text>
              {item.note ? (
                <Text style={styles.cardMeta}>Note: {item.note}</Text>
              ) : null}
            </View>
          )}
        />
      )}
    </View>
  );
}
