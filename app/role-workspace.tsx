import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Eyebrow } from "@/components/learnverse-ui";
import { createStudyRoomPlan, getActivationBoundary, getRoleActions, getRoleLabel, getWorkspaceMetrics, type WorkspaceRole } from "@/lib/learning/role-workspaces";

const roles: WorkspaceRole[] = ["educator", "creator", "institution", "administrator"];

export default function RoleWorkspaceScreen() {
  const router = useRouter();
  const [role, setRole] = useState<WorkspaceRole>("educator");
  const [topic, setTopic] = useState("Variables and values");
  const [duration, setDuration] = useState("45");
  const [roomCreated, setRoomCreated] = useState(false);
  const metrics = useMemo(() => getWorkspaceMetrics(role), [role]);
  const actions = useMemo(() => getRoleActions(role), [role]);
  const room = useMemo(() => createStudyRoomPlan(topic, Number(duration) || 45), [topic, duration]);

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.back} accessibilityRole="button"><Text style={styles.backText}>‹ Back</Text></Pressable>
        <Eyebrow>Role workspaces</Eyebrow>
        <Text style={styles.title}>Move from learning record to learning operations.</Text>
        <Text style={styles.subtitle}>Additive planning surfaces for the people who teach, publish, manage, and protect learning. Existing learner flows remain unchanged.</Text>

        <View style={styles.roleRail} accessibilityRole="tablist">
          {roles.map((item) => <Pressable key={item} onPress={() => setRole(item)} style={({ pressed }) => [styles.roleTab, role === item && styles.roleTabSelected, pressed && styles.pressed]} accessibilityRole="tab" accessibilityState={{ selected: role === item }}><Text style={[styles.roleTabText, role === item && styles.roleTabTextSelected]}>{getRoleLabel(item)}</Text></Pressable>)}
        </View>

        <View style={styles.heroCard}><Text style={styles.heroEyebrow}>{getRoleLabel(role)} workspace</Text><Text style={styles.heroTitle}>{role === "educator" ? "Design lessons that make understanding visible." : role === "creator" ? "Prepare educational content for a trusted release." : role === "institution" ? "Coordinate a private learning environment." : "Keep learning safe, observable, and accountable."}</Text><Text style={styles.heroBody}>{getActivationBoundary(role)}</Text></View>

        <View style={styles.metricsGrid}>{metrics.map((metric) => <View key={metric.label} style={styles.metric}><Text style={styles.metricValue}>{metric.value}</Text><Text style={styles.metricLabel}>{metric.label}</Text><Text style={styles.metricNote}>{metric.note}</Text></View>)}</View>

        <Text style={styles.sectionTitle}>Workspace actions</Text>
        <View style={styles.card}>{actions.map((action, index) => <View key={action} style={styles.actionRow}><View style={styles.actionNumber}><Text style={styles.actionNumberText}>{index + 1}</Text></View><View style={styles.actionCopy}><Text style={styles.cardTitle}>{action}</Text><Text style={styles.body}>{role === "educator" ? "Create a structured next step while keeping evidence and moderation boundaries explicit." : role === "creator" ? "Prepare the work locally, then connect the required production service when ready." : role === "institution" ? "Define the operating model before inviting real organization members." : "Review the control surface before enabling production access."}</Text></View><Text style={styles.chevron}>›</Text></View>)}</View>

        <Text style={styles.sectionTitle}>Study room blueprint</Text>
        <View style={styles.card}><Text style={styles.cardTitle}>Plan a collaborative Watch → Apply session</Text><Text style={styles.body}>This creates a real agenda locally. It does not claim that video rooms, screen sharing, or live presence are active until the collaboration service is connected.</Text><TextInput value={topic} onChangeText={setTopic} placeholder="Topic" placeholderTextColor="#8791A5" style={styles.input} accessibilityLabel="Study room topic" /><TextInput value={duration} onChangeText={setDuration} keyboardType="number-pad" placeholder="Duration in minutes" placeholderTextColor="#8791A5" style={styles.input} accessibilityLabel="Study room duration" /><Pressable onPress={() => setRoomCreated(true)} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]} accessibilityRole="button"><Text style={styles.primaryButtonText}>Create room blueprint</Text></Pressable>{roomCreated ? <View style={styles.planBox}><Text style={styles.planTitle}>{room.title}</Text>{room.agenda.map((item) => <Text key={item} style={styles.body}>• {item}</Text>)}<Text style={styles.notice}>{room.nextStep}</Text></View> : null}</View>

        <Text style={styles.sectionTitle}>Activation checklist</Text>
        <View style={styles.checklist}>{["Role permissions reviewed", "Content and learner evidence defined", "Moderation boundary understood", "External service ownership assigned"].map((item, index) => <View key={item} style={styles.checkRow}><View style={[styles.check, index < 3 && styles.checkDone]}><Text style={styles.checkText}>{index < 3 ? "✓" : ""}</Text></View><Text style={styles.body}>{item}</Text></View>)}</View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 20, paddingBottom: 120 }, back: { minHeight: 32, justifyContent: "center", alignSelf: "flex-start" }, backText: { color: "#255CFF", fontSize: 14, fontWeight: "800" }, title: { color: "#172033", fontSize: 30, lineHeight: 36, fontWeight: "800", letterSpacing: -0.9, marginTop: 6 }, subtitle: { color: "#68738B", fontSize: 15, lineHeight: 22, marginTop: 8 }, roleRail: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 20 }, roleTab: { borderRadius: 12, borderWidth: 1, borderColor: "#DDE3F0", paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#FFFFFF" }, roleTabSelected: { backgroundColor: "#111B3D", borderColor: "#111B3D" }, roleTabText: { color: "#68738B", fontSize: 12, fontWeight: "800" }, roleTabTextSelected: { color: "#FFFFFF" }, heroCard: { backgroundColor: "#111B3D", borderRadius: 22, padding: 20, marginTop: 18 }, heroEyebrow: { color: "#A9BAFF", fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.7 }, heroTitle: { color: "#FFFFFF", fontSize: 22, lineHeight: 28, fontWeight: "800", marginTop: 8 }, heroBody: { color: "#C9D4FF", fontSize: 13, lineHeight: 20, marginTop: 10 }, metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 14 }, metric: { width: "31.8%", minWidth: 100, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E6EAF2", borderRadius: 16, padding: 12 }, metricValue: { color: "#172033", fontSize: 20, fontWeight: "800" }, metricLabel: { color: "#172033", fontSize: 12, fontWeight: "800", marginTop: 4 }, metricNote: { color: "#8791A5", fontSize: 11, lineHeight: 15, marginTop: 4 }, sectionTitle: { color: "#172033", fontSize: 20, fontWeight: "800", marginTop: 28, marginBottom: 12 }, card: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#E6EAF2", padding: 17 }, actionRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#EEF1F6" }, actionNumber: { width: 27, height: 27, borderRadius: 14, backgroundColor: "#E9EEFF", alignItems: "center", justifyContent: "center" }, actionNumberText: { color: "#255CFF", fontSize: 12, fontWeight: "900" }, actionCopy: { flex: 1 }, cardTitle: { color: "#172033", fontSize: 14, fontWeight: "800" }, body: { color: "#68738B", fontSize: 13, lineHeight: 20, marginTop: 5 }, chevron: { color: "#255CFF", fontSize: 22, fontWeight: "700" }, input: { minHeight: 44, borderWidth: 1, borderColor: "#DDE3F0", borderRadius: 12, paddingHorizontal: 12, color: "#172033", fontSize: 14, marginTop: 12 }, primaryButton: { minHeight: 44, borderRadius: 12, backgroundColor: "#255CFF", alignItems: "center", justifyContent: "center", marginTop: 14 }, primaryButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" }, planBox: { backgroundColor: "#F1F4FF", borderRadius: 13, padding: 13, marginTop: 14 }, planTitle: { color: "#172033", fontSize: 14, fontWeight: "800", marginBottom: 4 }, notice: { color: "#9A6817", fontSize: 12, lineHeight: 18, marginTop: 10, fontWeight: "700" }, checklist: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#E6EAF2", padding: 17 }, checkRow: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 42, borderBottomWidth: 1, borderBottomColor: "#EEF1F6" }, check: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: "#C9D2E5", alignItems: "center", justifyContent: "center" }, checkDone: { backgroundColor: "#16A66A", borderColor: "#16A66A" }, checkText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" }, pressed: { opacity: 0.75, transform: [{ scale: 0.985 }] },
});
