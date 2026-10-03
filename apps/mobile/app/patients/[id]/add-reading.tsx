import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { getStore } from "../../../src/domain/store";
import { localId, validateReading } from "../../../src/domain/validation";
import { styles } from "../../../src/ui/theme";

export default function AddReading() {
  const { id, role } = useLocalSearchParams<{ id: string; role?: string }>();
  const router = useRouter();
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const source = role === "bhw" ? "bhw" : "caregiver";

  function onSave() {
    const result = validateReading({ systolic, diastolic });
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    getStore().addReading({
      id: localId("bp"),
      patientId: id,
      systolic: result.systolic!,
      diastolic: result.diastolic!,
      measuredAt: new Date().toISOString(),
      measuredBy: source,
      recordedBy: source,
      note: note.trim() || undefined,
    });
    router.back();
  }

  return (
    <ScrollView style={styles.screen}>
      <Text style={styles.label}>Systolic (mmHg)</Text>
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        value={systolic}
        onChangeText={setSystolic}
        placeholder="e.g. 140"
        placeholderTextColor="#64748b"
        accessibilityLabel="Systolic value"
      />
      <Text style={styles.label}>Diastolic (mmHg)</Text>
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        value={diastolic}
        onChangeText={setDiastolic}
        placeholder="e.g. 90"
        placeholderTextColor="#64748b"
        accessibilityLabel="Diastolic value"
      />
      <Text style={styles.label}>Note (optional)</Text>
      <TextInput
        style={styles.input}
        value={note}
        onChangeText={setNote}
        placeholder="Context for this reading"
        placeholderTextColor="#64748b"
        accessibilityLabel="Optional note"
      />

      {errors.map((e) => (
        <Text key={e} style={styles.error}>
          {e}
        </Text>
      ))}

      <TouchableOpacity style={styles.button} onPress={onSave}>
        <Text style={styles.buttonText}>Save reading</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
