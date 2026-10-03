import { Activity, FileText } from "lucide-react-native";
import { Text, View } from "react-native";
import type { BloodPressureReading, VisitNote } from "../../domain/models";
import { fonts, palette, spacing, styles, theme } from "../theme";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString();
}

/** Blood-pressure reading card (DESIGN.md Section 12). */
export function BPReadingCard({ reading }: { reading: BloodPressureReading }) {
  return (
    <View style={styles.card}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
        <Activity size={18} color={theme.accentActive} strokeWidth={2} />
        <Text style={styles.cardTitle}>
          {reading.systolic}/{reading.diastolic} mmHg
        </Text>
      </View>
      <Text style={styles.cardMeta}>{formatDateTime(reading.measuredAt)}</Text>
      <Text style={styles.cardMeta}>
        Measured by {reading.measuredBy} · entered by {reading.recordedBy}
      </Text>
      {reading.note ? (
        <Text style={[styles.cardMeta, { color: theme.text, fontFamily: fonts.body }]}>
          Note: {reading.note}
        </Text>
      ) : null}
    </View>
  );
}

/** Visit note card (DESIGN.md Section 12). */
export function VisitNoteCard({ note }: { note: VisitNote }) {
  return (
    <View style={styles.card}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
        <FileText size={18} color={palette.nightTide} strokeWidth={2} />
        <Text style={styles.cardTitle}>Visit note</Text>
      </View>
      <Text style={styles.cardMeta}>
        {formatDateTime(note.authoredAt)} · {note.authoredBy}
      </Text>
      <Text style={[styles.cardMeta, { color: theme.text }]}>{note.text}</Text>
    </View>
  );
}
