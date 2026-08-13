import { type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

export function Eyebrow({ children }: { children: ReactNode }) {
  return <Text style={styles.eyebrow}>{children}</Text>;
}

export function ProgressBar({ value, color = "#255CFF" }: { value: number; color?: string }) {
  return (
    <View style={styles.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: value }}>
      <View style={[styles.fill, { width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color }]} />
    </View>
  );
}

export function SectionTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={styles.sectionHeading}>{title}</Text>
      {action}
    </View>
  );
}

export function Metric({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  eyebrow: { color: "#68738B", fontSize: 12, fontWeight: "700", letterSpacing: 0.7, textTransform: "uppercase" },
  track: { height: 7, width: "100%", borderRadius: 99, backgroundColor: "#E7ECF6", overflow: "hidden" },
  fill: { height: "100%", borderRadius: 99 },
  sectionTitle: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionHeading: { color: "#172033", fontSize: 20, fontWeight: "800", letterSpacing: -0.3 },
  metric: { alignItems: "flex-start", gap: 3 },
  metricValue: { color: "#172033", fontSize: 20, fontWeight: "800" },
  metricLabel: { color: "#68738B", fontSize: 12, fontWeight: "500" },
});
