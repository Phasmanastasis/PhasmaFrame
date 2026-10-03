import type { ComponentType } from "react";
import { Text, TouchableOpacity } from "react-native";
import type { LucideProps } from "lucide-react-native";
import { palette, styles, theme } from "../theme";

interface ButtonProps {
  label: string;
  onPress: () => void;
  icon?: ComponentType<LucideProps>;
  disabled?: boolean;
}

/**
 * Primary action button (DESIGN.md Section 9: one obvious primary action per
 * screen). Meets the 44x44px touch target via the 48px min height in theme.
 */
export function PrimaryButton({ label, onPress, icon: Icon, disabled }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled ? { opacity: 0.5 } : null]}
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
    >
      {Icon ? <Icon size={18} color={palette.deepAbyss} strokeWidth={2} /> : null}
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
}

/** Secondary action — visually quieter than the primary (Section 9/12). */
export function SecondaryButton({ label, onPress, icon: Icon, disabled }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.buttonAlt, disabled ? { opacity: 0.5 } : null]}
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
    >
      {Icon ? <Icon size={18} color={theme.brand} strokeWidth={2} /> : null}
      <Text style={styles.buttonAltText}>{label}</Text>
    </TouchableOpacity>
  );
}
