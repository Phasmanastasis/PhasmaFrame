import { StyleSheet } from "react-native";

export const theme = {
  bg: "#0f172a",
  surface: "#1e293b",
  surfaceAlt: "#334155",
  text: "#f1f5f9",
  textMuted: "#94a3b8",
  accent: "#38bdf8",
  danger: "#f87171",
  ok: "#4ade80",
  border: "#334155",
};

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.bg, padding: 20 },
  title: { color: theme.text, fontSize: 24, fontWeight: "700", marginBottom: 4 },
  subtitle: { color: theme.textMuted, fontSize: 14, marginBottom: 20 },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cardTitle: { color: theme.text, fontSize: 17, fontWeight: "600" },
  cardMeta: { color: theme.textMuted, fontSize: 13, marginTop: 4 },
  button: {
    backgroundColor: theme.accent,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#0b1120", fontSize: 16, fontWeight: "700" },
  buttonAlt: {
    backgroundColor: theme.surfaceAlt,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    marginTop: 8,
  },
  buttonAltText: { color: theme.text, fontSize: 16, fontWeight: "600" },
  input: {
    backgroundColor: theme.surfaceAlt,
    color: theme.text,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 10,
  },
  label: { color: theme.textMuted, fontSize: 13, marginBottom: 4 },
  error: { color: theme.danger, fontSize: 13, marginBottom: 6 },
  ok: { color: theme.ok, fontSize: 14, fontWeight: "600" },
});
