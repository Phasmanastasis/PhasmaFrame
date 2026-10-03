import { Platform, StyleSheet } from "react-native";

/**
 * Kasigla brand tokens — see docs/DESIGN.md Sections 3 (color), 4 (typography),
 * and 7 (layout). This replaces the earlier generic slate/sky palette so the
 * mobile app matches the brand system. Token names mirror the DESIGN.md
 * `--color-*` CSS custom properties.
 */
export const palette = {
  // Foundational darks
  deepAbyss: "#021C22",
  deepTeal: "#04323A",
  nightTide: "#084E5B",
  darkPine: "#0F766E",
  // Care and identity
  kelp: "#0D9488",
  teal: "#14B8A6",
  // Radiant mint and outreach
  mintGlow: "#2DD4BF",
  seafoam: "#5EEAD4",
  mintLight: "#99F6E4",
  // Surfaces and washes
  foamWash: "#CCFBF1",
  mintSubtle: "#E2F4F0",
  surface: "#F2FAF8",
  pureWhite: "#FFFFFF",
  // Warm accent — focal only (DESIGN.md: ~5% usage)
  dawnGold: "#FBBF24",
} as const;

/**
 * Font family names registered by `loadBrandFonts` (see fonts.ts). On web the
 * `@expo-google-fonts` packages expose these same keys; web-safe fallbacks keep
 * text readable before fonts load or if loading is skipped.
 */
export const fonts = {
  // Headings — Manrope (700/800). Fallback: Arial/Helvetica.
  heading: Platform.select({ default: "Manrope_800ExtraBold", web: "Manrope_800ExtraBold, Arial, Helvetica, sans-serif" })!,
  headingSemi: Platform.select({ default: "Manrope_700Bold", web: "Manrope_700Bold, Arial, Helvetica, sans-serif" })!,
  // UI / subheadings — Nunito (600/700/800). Fallback: Trebuchet MS.
  ui: Platform.select({ default: "Nunito_700Bold", web: 'Nunito_700Bold, "Trebuchet MS", Arial, sans-serif' })!,
  uiSemi: Platform.select({ default: "Nunito_600SemiBold", web: 'Nunito_600SemiBold, "Trebuchet MS", Arial, sans-serif' })!,
  // Body — Atkinson Hyperlegible (400/700). Fallback: Verdana.
  body: Platform.select({ default: "AtkinsonHyperlegible_400Regular", web: "AtkinsonHyperlegible_400Regular, Verdana, Arial, sans-serif" })!,
  bodyBold: Platform.select({ default: "AtkinsonHyperlegible_700Bold", web: "AtkinsonHyperlegible_700Bold, Verdana, Arial, sans-serif" })!,
} as const;

/** 4px base spacing grid (DESIGN.md Section 7). */
export const spacing = { xs: 4, sm: 8, md: 12, base: 16, lg: 20, xl: 24, xxl: 32, xxxl: 40 } as const;

/** Container radii (DESIGN.md Section 7). */
export const radius = { card: 16, compact: 12, pill: 999 } as const;

/**
 * Semantic theme on a light Kasigla canvas (Surface Tint), using Deep Sea Teal
 * for primary text per DESIGN.md Section 10 contrast guidance.
 */
export const theme = {
  bg: palette.surface,
  surface: palette.pureWhite,
  surfaceAlt: palette.mintSubtle,
  brand: palette.deepTeal,
  text: palette.deepTeal,
  textMuted: palette.nightTide,
  accent: palette.teal,
  accentActive: palette.kelp,
  focal: palette.dawnGold,
  danger: "#B42318",
  ok: palette.kelp,
  border: "rgba(13, 148, 136, 0.14)", // subtle teal border, ~14% (Section 7)
} as const;

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.bg, padding: spacing.lg },
  title: {
    color: theme.text,
    fontSize: 32,
    lineHeight: 38,
    fontFamily: fonts.heading,
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: theme.textMuted,
    fontSize: 16,
    lineHeight: 25,
    fontFamily: fonts.body,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: radius.compact,
    padding: spacing.base,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cardTitle: {
    color: theme.text,
    fontSize: 18,
    lineHeight: 24,
    fontFamily: fonts.ui,
    fontWeight: "700",
  },
  cardMeta: {
    color: theme.textMuted,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: fonts.body,
    marginTop: spacing.xs,
  },
  button: {
    backgroundColor: theme.accent,
    borderRadius: radius.compact,
    paddingVertical: 14,
    paddingHorizontal: 18,
    minHeight: 48,
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
  },
  buttonText: {
    color: palette.deepAbyss,
    fontSize: 16,
    fontFamily: fonts.ui,
    fontWeight: "700",
  },
  buttonAlt: {
    backgroundColor: theme.surfaceAlt,
    borderRadius: radius.compact,
    paddingVertical: 14,
    paddingHorizontal: 18,
    minHeight: 48,
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: theme.border,
  },
  buttonAltText: {
    color: theme.brand,
    fontSize: 16,
    fontFamily: fonts.uiSemi,
    fontWeight: "600",
  },
  input: {
    backgroundColor: theme.surface,
    color: theme.text,
    borderRadius: radius.compact,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 14,
    minHeight: 48,
    fontSize: 16,
    fontFamily: fonts.body,
    marginBottom: spacing.md,
  },
  label: {
    color: theme.text,
    fontSize: 14,
    fontFamily: fonts.uiSemi,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  error: {
    color: theme.danger,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: fonts.bodyBold,
    marginBottom: spacing.sm,
  },
  ok: {
    color: theme.ok,
    fontSize: 16,
    fontFamily: fonts.ui,
    fontWeight: "700",
  },
  hint: {
    color: theme.textMuted,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: fonts.body,
    marginTop: spacing.base,
  },
});
