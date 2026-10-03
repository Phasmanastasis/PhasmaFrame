import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import type { EntrySource } from "../../../src/domain/models";
import { getStore } from "../../../src/domain/store";
import { localId, validateReading } from "../../../src/domain/validation";
import { styles, theme } from "../../../src/ui/theme";

export default function AddReading() {
  const { id, role } = useLocalSearchParams<{ id: string; role?: string }>();
  const router = useRouter();
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const defaultSource: EntrySource = role === "bhw" ? "bhw" : "patient";
  const [measuredBy, setMeasuredBy] = useState<EntrySource>(defaultSource);
  const [recordedBy, setRecordedBy] = useState<EntrySource>(defaultSource);
  const sourceOptions: { value: EntrySource; label: string }[] = [
    { value: "patient", label: "Patient" },
    { value: "caregiver", label: "Caregiver" },
    { value: "bhw", label: "Health worker" },
  ];

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
      measuredBy,
      recordedBy,
      note: note.trim() || undefined,
    });
    router.back();
  }

  return (
    <ScrollView style={styles.scrollScreen} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Add a reading</Text>
      <Text style={styles.subtitle}>Copy the numbers from your blood pressure monitor. This reading will be saved on this device.</Text>
      <Text style={styles.label}>Top number — systolic (mmHg)</Text>
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        value={systolic}
        onChangeText={setSystolic}
        placeholder="e.g. 140"
        placeholderTextColor={theme.textMuted}
        accessibilityLabel="Systolic value"
        accessibilityHint="Enter the top number shown on the monitor"
      />
      <Text style={styles.label}>Bottom number — diastolic (mmHg)</Text>
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        value={diastolic}
        onChangeText={setDiastolic}
        placeholder="e.g. 90"
        placeholderTextColor={theme.textMuted}
        accessibilityLabel="Diastolic value"
        accessibilityHint="Enter the bottom number shown on the monitor"
      />
      <Text style={styles.label}>Note (optional)</Text>
      <TextInput
        style={styles.input}
        value={note}
        onChangeText={setNote}
        placeholder="Context for this reading"
        placeholderTextColor={theme.textMuted}
        accessibilityLabel="Optional note"
        accessibilityHint="Add context about this reading, if needed"
      />

      <Text style={styles.label}>Who took the reading?</Text>
      <Text style={styles.cardMeta}>Measured now</Text>
      {sourceOptions.map((option) => (
        <TouchableOpacity
          key={`measured-${option.value}`}
          style={[styles.choice, measuredBy === option.value && styles.choiceSelected]}
          onPress={() => setMeasuredBy(option.value)}
          accessibilityRole="radio"
          accessibilityState={{ checked: measuredBy === option.value }}
          accessibilityLabel={`Measured by ${option.label}`}
        >
          <Text style={measuredBy === option.value ? styles.choiceSelectedText : styles.choiceText}>{option.label}</Text>
        </TouchableOpacity>
      ))}

      <Text style={[styles.label, { marginTop: 16 }]}>Who entered the reading?</Text>
      {sourceOptions.map((option) => (
        <TouchableOpacity
          key={`recorded-${option.value}`}
          style={[styles.choice, recordedBy === option.value && styles.choiceSelected]}
          onPress={() => setRecordedBy(option.value)}
          accessibilityRole="radio"
          accessibilityState={{ checked: recordedBy === option.value }}
          accessibilityLabel={`Entered by ${option.label}`}
        >
          <Text style={recordedBy === option.value ? styles.choiceSelectedText : styles.choiceText}>{option.label}</Text>
        </TouchableOpacity>
      ))}

      {errors.length > 0 ? (
        <View accessibilityLiveRegion="polite" accessibilityRole="alert" style={styles.card}>
          <Text style={styles.error}>Please check this reading:</Text>
          {errors.map((e) => <Text key={e} style={styles.error}>{e}</Text>)}
        </View>
      ) : null}

      <TouchableOpacity style={styles.button} accessibilityRole="button" accessibilityLabel="Save blood pressure reading" onPress={onSave}>
        <Text style={styles.buttonText}>Save reading</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
