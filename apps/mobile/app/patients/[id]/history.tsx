import { useLocalSearchParams } from "expo-router";
import { FlatList } from "react-native";
import { getStore } from "../../../src/domain/store";
import {
  BPReadingCard,
  EmptyState,
  OfflineBanner,
} from "../../../src/ui/components";
import { styles } from "../../../src/ui/theme";

export default function ReadingHistory() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const readings = getStore().listReadings(id);

  return (
    <FlatList
      style={styles.screen}
      data={readings}
      keyExtractor={(r) => r.id}
      ListHeaderComponent={<OfflineBanner />}
      ListEmptyComponent={
        <EmptyState
          title="No readings recorded yet"
          message="Add the first blood-pressure reading from the patient summary."
        />
      }
      renderItem={({ item }) => <BPReadingCard reading={item} />}
    />
  );
}
