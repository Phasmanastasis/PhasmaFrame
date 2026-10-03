import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { theme } from "../src/ui/theme";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.surface },
          headerTintColor: theme.accent,
          headerTitleStyle: { color: theme.text, fontSize: 18, fontWeight: "700" },
          contentStyle: { backgroundColor: theme.bg },
        }}
      >
        <Stack.Screen name="index" options={{ title: "PhasmaFrame" }} />
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
