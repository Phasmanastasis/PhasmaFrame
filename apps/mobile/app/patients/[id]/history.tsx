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
        <Text style={styles.subtitle}>No readings recorded yet.</Text>
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
                Measured by {item.measuredBy} · entered by {item.recordedBy}
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
