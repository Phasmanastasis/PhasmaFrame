import { Inbox } from "lucide-react-native";
import { Text, View } from "react-native";
import { fonts, palette, spacing, theme } from "../theme";

/**
 * Reassuring empty state with room for a clear primary action
 * (DESIGN.md Section 11, empty states; Section 8 voice).
 */
export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <View
      style={{
        alignItems: "center",
        paddingVertical: spacing.xxl,
        gap: spacing.sm,
      }}
    >
      <Inbox size={32} color={palette.mintGlow} strokeWidth={1.75} />
      <Text
        style={{
          color: theme.text,
          fontFamily: fonts.ui,
          fontSize: 18,
          textAlign: "center",
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          color: theme.textMuted,
          fontFamily: fonts.body,
          fontSize: 14,
          lineHeight: 21,
          textAlign: "center",
        }}
      >
        {message}
      </Text>
    </View>
  );
}
