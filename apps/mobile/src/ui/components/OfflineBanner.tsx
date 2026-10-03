import { CloudOff } from "lucide-react-native";
import { Text, View } from "react-native";
import { fonts, palette, radius, spacing, theme } from "../theme";

/**
 * Calm offline/low-connectivity indicator shown on every screen
 * (DESIGN.md Section 10, cross-cutting UI requirements). The MVP runs fully
 * offline, so this is informational and never blocks interaction.
 */
export function OfflineBanner() {
  return (
    <View
      accessibilityRole="summary"
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        backgroundColor: palette.foamWash,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: theme.border,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.base,
        marginBottom: spacing.base,
        alignSelf: "flex-start",
      }}
    >
      <CloudOff size={16} color={palette.darkPine} strokeWidth={2} />
      <Text
        style={{
          color: palette.darkPine,
          fontFamily: fonts.uiSemi,
          fontSize: 13,
        }}
      >
        Works offline
      </Text>
    </View>
  );
}
