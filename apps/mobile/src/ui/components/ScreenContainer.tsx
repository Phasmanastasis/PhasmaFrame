import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { styles } from "../theme";
import { OfflineBanner } from "./OfflineBanner";

/**
 * Standard screen frame: brand canvas padding plus the persistent offline
 * banner (DESIGN.md Section 10). Use `scroll` for content that can overflow.
 */
export function ScreenContainer({
  children,
  scroll = false,
  showOffline = true,
}: {
  children: ReactNode;
  scroll?: boolean;
  showOffline?: boolean;
}) {
  const body = (
    <>
      {showOffline ? <OfflineBanner /> : null}
      {children}
    </>
  );
  if (scroll) {
    return <ScrollView style={styles.screen}>{body}</ScrollView>;
  }
  return <View style={styles.screen}>{body}</View>;
}
