import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity } from "react-native";
import { getStore } from "../../../src/domain/store";
import { localId } from "../../../src/domain/validation";
import { styles } from "../../../src/ui/theme";

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
      <Text style={styles.label}>Visit note</Text>
      <TextInput
        style={[styles.input, { minHeight: 120, textAlignVertical: "top" }]}
        multiline
        value={text}
        onChangeText={setText}
        placeholder="Observations, advice, follow-up plan…"
        placeholderTextColor="#64748b"
        accessibilityLabel="Visit note text"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={onSave}>
        <Text style={styles.buttonText}>Save note</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
