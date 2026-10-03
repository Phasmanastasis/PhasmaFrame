import { Save } from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TextInput } from "react-native";
import { getStore } from "../../../src/domain/store";
import { localId } from "../../../src/domain/validation";
import { OfflineBanner, PrimaryButton } from "../../../src/ui/components";
import { palette, styles } from "../../../src/ui/theme";

export default function AddVisitNote() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  function onSave() {
    if (text.trim().length < 3) {
      setError("Note is too short.");
      return;
    }
    getStore().addVisitNote({
      id: localId("vn"),
      patientId: id,
      authoredAt: new Date().toISOString(),
      authoredBy: "bhw",
      text: text.trim(),
    });
    router.back();
  }

  return (
    <ScrollView style={styles.screen}>
      <OfflineBanner />
      <Text style={styles.label}>Visit note</Text>
      <TextInput
        style={[styles.input, { minHeight: 120, textAlignVertical: "top" }]}
        multiline
        value={text}
        onChangeText={setText}
        placeholder="Observations, advice, follow-up plan…"
        placeholderTextColor={palette.nightTide}
        accessibilityLabel="Visit note text"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <PrimaryButton label="Save note" icon={Save} onPress={onSave} />
    </ScrollView>
  );
}
