import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity } from "react-native";
import { getStore } from "../../../src/domain/store";
import { localId } from "../../../src/domain/validation";
import { styles, theme } from "../../../src/ui/theme";

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
    <ScrollView style={styles.scrollScreen} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Add a visit note</Text>
      <Text style={styles.subtitle}>Record what you discussed and any follow-up agreed during this visit.</Text>
      <Text style={styles.label}>Visit note</Text>
      <TextInput
        style={[styles.input, { minHeight: 120, textAlignVertical: "top" }]}
        multiline
        value={text}
        onChangeText={setText}
        placeholder="Write a short note"
        placeholderTextColor={theme.textMuted}
        accessibilityLabel="Visit note text"
        accessibilityHint="Enter the note you want saved to this patient record"
      />
      {error ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{error} Please add at least three characters.</Text> : null}
      <TouchableOpacity style={styles.button} accessibilityRole="button" accessibilityLabel="Save visit note" onPress={onSave}>
        <Text style={styles.buttonText}>Save note</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
