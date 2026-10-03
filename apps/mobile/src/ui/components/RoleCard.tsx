import type { ComponentType } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import type { LucideProps } from "lucide-react-native";
import { ChevronRight } from "lucide-react-native";
import { fonts, radius, spacing, styles, theme } from "../theme";

/**
 * Large role choice card for Home (DESIGN.md Section 11.1). High-contrast,
 * generous target, icon paired with a text label (Section 5).
 */
export function RoleCard({
  title,
  subtitle,
  icon: Icon,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: ComponentType<LucideProps>;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={{
        backgroundColor: theme.surface,
        borderRadius: radius.card,
        borderWidth: 1,
        borderColor: theme.border,
        padding: spacing.lg,
        marginBottom: spacing.md,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.base,
        minHeight: 72,
      }}
    >
      <Icon size={28} color={theme.accentActive} strokeWidth={2} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.text, fontFamily: fonts.ui, fontSize: 18 }}>
          {title}
        </Text>
        <Text style={{ color: theme.textMuted, fontFamily: fonts.body, fontSize: 14, marginTop: 2 }}>
          {subtitle}
        </Text>
      </View>
      <ChevronRight size={20} color={theme.textMuted} strokeWidth={2} />
    </TouchableOpacity>
  );
}

/** Patient list row (DESIGN.md Section 12). */
export function PatientListItem({
  label,
  meta,
  onPress,
}: {
  label: string;
  meta: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} accessibilityRole="button" accessibilityLabel={label} onPress={onPress}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{label}</Text>
          <Text style={styles.cardMeta}>{meta}</Text>
        </View>
        <ChevronRight size={20} color={theme.textMuted} strokeWidth={2} />
      </View>
    </TouchableOpacity>
  );
}
