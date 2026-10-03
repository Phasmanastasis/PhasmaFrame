import {
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from "@expo-google-fonts/manrope";
import {
  Nunito_600SemiBold,
  Nunito_700Bold,
} from "@expo-google-fonts/nunito";
import {
  AtkinsonHyperlegible_400Regular,
  AtkinsonHyperlegible_700Bold,
} from "@expo-google-fonts/atkinson-hyperlegible";
import { useFonts } from "expo-font";

/**
 * Loads the Kasigla brand font families (DESIGN.md Section 4). Returns a flag
 * once loading settles; callers should keep showing a neutral splash until then
 * so text does not flash in a fallback face. If a font fails to load the app
 * still renders with the web-safe fallbacks declared in theme.ts `fonts`.
 */
export function useBrandFonts(): boolean {
  const [loaded, error] = useFonts({
    Manrope_700Bold,
    Manrope_800ExtraBold,
    Nunito_600SemiBold,
    Nunito_700Bold,
    AtkinsonHyperlegible_400Regular,
    AtkinsonHyperlegible_700Bold,
  });
  // Treat an error as "ready" so a font-CDN failure never blocks the offline app.
  return loaded || error != null;
}
