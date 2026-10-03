import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { useBrandFonts } from "../src/ui/fonts";
import { fonts, palette, theme } from "../src/ui/theme";

export default function RootLayout() {
  const ready = useBrandFonts();

  // Hold on a brand-colored canvas until fonts settle so headings do not flash
  // in a fallback face. A font-load failure still resolves `ready` to true.
  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: theme.bg }} />;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: palette.deepTeal },
          headerTintColor: palette.pureWhite,
          headerTitleStyle: { fontFamily: fonts.ui, color: palette.pureWhite },
          contentStyle: { backgroundColor: theme.bg },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Kasigla" }} />
        <Stack.Screen name="patients/index" options={{ title: "Patients" }} />
        <Stack.Screen name="patients/[id]/index" options={{ title: "Patient summary" }} />
        <Stack.Screen name="patients/[id]/history" options={{ title: "Reading history" }} />
        <Stack.Screen name="patients/[id]/add-reading" options={{ title: "Add reading" }} />
        <Stack.Screen name="patients/[id]/add-note" options={{ title: "Add visit note" }} />
        <Stack.Screen name="patients/[id]/summary" options={{ title: "RHU / YAKAP summary" }} />
        <Stack.Screen name="patients/[id]/send" options={{ title: "Send record" }} />
        <Stack.Screen name="receive" options={{ title: "Receive record" }} />
      </Stack>
    </>
  );
}
