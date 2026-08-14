import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Eyebrow, ProgressBar } from "@/components/learnverse-ui";
import { starterCourse } from "@/lib/learning/catalog";
import { useLearner } from "@/lib/learning/learner-context";
import { getDueReviews, getKnowledgeGraph, getLearnerArtifacts, getAnalytics, createExamPlan, createStudyPlan, buildReviewSchedule, advanceReview, getNotificationReminders } from "@/lib/learning/additive";
import { initialAdditiveLearningState, loadAdditiveLearningState, saveAdditiveLearningState, type AdditiveLearningState } from "@/lib/learning/additive-persistence";

export default function LearningHubScreen() {
  const { state } = useLearner();
  const [hub, setHub] = useState<AdditiveLearningState>(initialAdditiveLearningState);
  const [hydrated, setHydrated] = useState(false);
  const analytics = useMemo(() => getAnalytics(starterCourse, state), [state]);
  const graph = useMemo(() => getKnowledgeGraph(starterCourse), []);
  const artifacts = useMemo(() => getLearnerArtifacts(starterCourse, state), [state]);
  const dueReviews = useMemo(() => getDueReviews(hub.reviewItems), [hub.reviewItems]);
  const reminders = useMemo(() => getNotificationReminders(hub.reviewItems, hub.notificationPreferences), [hub.reviewItems, hub.notificationPreferences]);

  useEffect(() => {
    loadAdditiveLearningState().then((loaded) => { setHub(loaded); setHydrated(true); });
  }, []);

  useEffect(() => {
    if (hydrated) void saveAdditiveLearningState(hub);
  }, [hub, hydrated]);

  const createPlan = (durationMinutes: number) => setHub((current) => ({ ...current, studyPlan: createStudyPlan(starterCourse.subject, durationMinutes, "Prepare for confident practice") }));
  const createExam = () => {
    const examDate = new Date(Date.now() + 28 * 86_400_000).toISOString().slice(0, 10);
    setHub((current) => ({ ...current, examPlan: createExamPlan(starterCourse.subject, examDate, [...starterCourse.skills, ...starterCourse.lessons.flatMap((lesson) => lesson.concepts)]) }));
  };
  const scheduleReviews = () => setHub((current) => ({ ...current, reviewItems: buildReviewSchedule(starterCourse.skills) }));
  const reviewNext = () => setHub((current) => current.reviewItems.length ? { ...current, reviewItems: [advanceReview(current.reviewItems[0]), ...current.reviewItems.slice(1)] } : current);
  const togglePreference = (key: keyof AdditiveLearningState["notificationPreferences"]) => setHub((current) => ({ ...current, notificationPreferences: { ...current.notificationPreferences, [key]: !current.notificationPreferences[key] } }));

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Eyebrow>Learning Hub</Eyebrow>
        <Text style={styles.title}>Turn understanding into momentum.</Text>
        <Text style={styles.subtitle}>New planning, retention, evidence, and learning-coach tools are available here without changing your existing learning experience.</Text>

        <Text style={styles.sectionTitle}>AI study mode</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Focus session builder</Text>
          <Text style={styles.body}>Choose a duration and goal. The planner creates Review → Learn → Practice → Recall blocks.</Text>
          <View style={styles.row}><Action label="30 min" onPress={() => createPlan(30)} /><Action label="60 min" onPress={() => createPlan(60)} /></View>
          {hub.studyPlan ? <View style={styles.planBox}><Text style={styles.planTitle}>{hub.studyPlan.topic} · {hub.studyPlan.durationMinutes} min</Text>{hub.studyPlan.blocks.map((block) => <View key={block.label} style={styles.planRow}><Text style={styles.body}>{block.label}</Text><Text style={styles.value}>{block.minutes} min</Text></View>)}</View> : null}
        </View>

        <Text style={styles.sectionTitle}>AI exam preparation</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Build a revision plan</Text>
          <Text style={styles.body}>Create a 28-day subject plan with weekly topics, practice, revision, and a readiness estimate. The estimate is not a guarantee of exam results.</Text>
          <Action label="Generate exam plan" onPress={createExam} />
          {hub.examPlan ? <View style={styles.planBox}><Text style={styles.planTitle}>{hub.examPlan.daysRemaining} days remaining · estimated readiness {hub.examPlan.readiness}%</Text>{hub.examPlan.weeks.map((week) => <View key={week.label} style={styles.week}><Text style={styles.value}>{week.label}</Text><Text style={styles.body}>{week.topics.join(" · ") || "Revision and practice"}</Text></View>)}</View> : null}
        </View>

        <Text style={styles.sectionTitle}>Knowledge graph</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{graph.nodes.length} connected concepts</Text>
          <Text style={styles.body}>Prerequisite relationships help identify what to revisit when a concept is difficult.</Text>
          <View style={styles.graphRail}>{graph.nodes.slice(0, 8).map((node, index) => <View key={node} style={[styles.node, index === 0 && styles.nodePrimary]}><Text style={[styles.nodeText, index === 0 && styles.nodeTextPrimary]}>{node}</Text></View>)}</View>
          <Text style={styles.caption}>{graph.edges.length} prerequisite relationships derived from the current course catalog.</Text>
        </View>

        <Text style={styles.sectionTitle}>Retention system</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Spaced review schedule</Text>
          <Text style={styles.body}>Reviews use 1 → 2 → 4 → 8 → 16-day intervals and can be connected to flashcards, quizzes, and AI questions.</Text>
          <View style={styles.row}><Action label="Schedule reviews" onPress={scheduleReviews} /><Action label="Review next" onPress={reviewNext} /></View>
          <Text style={styles.caption}>{dueReviews.length} review{dueReviews.length === 1 ? "" : "s"} due now.</Text>
        </View>

        <Text style={styles.sectionTitle}>Learning analytics</Text>
        <View style={styles.analyticsGrid}><Metric label="Learning hours" value={`${analytics.learningHours}`} /><Metric label="Completion" value={`${analytics.completionRate}%`} /><Metric label="Streak" value={`${analytics.currentStreak} d`} /><Metric label="Velocity" value={`${analytics.learningVelocity}/d`} /></View>
        <View style={styles.card}><Text style={styles.cardTitle}>Evidence-based signals</Text><ProgressBar value={analytics.completionRate} color="#255CFF" /><Text style={styles.body}>Weekly learning events: {analytics.weeklyProgress}. Quiz accuracy: {analytics.quizAccuracy === null ? "not enough evidence" : `${analytics.quizAccuracy}%`}.</Text><Text style={styles.body}>Strong: {analytics.strongConcepts.join(", ") || "building evidence"}</Text><Text style={styles.body}>Needs review: {analytics.weakConcepts.join(", ") || "none identified"}</Text></View>

        <Text style={styles.sectionTitle}>Skill passport and portfolio</Text>
        <View style={styles.card}><Text style={styles.cardTitle}>Verified from your learning record</Text><Text style={styles.body}>Skills: {artifacts.skills.join(", ") || "Complete lessons to earn evidence-based skills"}</Text><Text style={styles.body}>Achievements: {artifacts.achievements.join(", ") || "No achievements yet"}</Text><Text style={styles.body}>Certificates: {artifacts.certificates.join(", ") || "Completion evidence required"}</Text><Text style={styles.caption}>{artifacts.portfolioSummary}</Text></View>

        <Text style={styles.sectionTitle}>Notification preferences</Text>
        <View style={styles.card}>{(["reviewReminders", "quizReminders", "teacherUpdates"] as const).map((key) => <View key={key} style={styles.preference}><Text style={styles.body}>{key === "reviewReminders" ? "Scheduled review reminders" : key === "quizReminders" ? "Quiz reminders" : "Teacher updates"}</Text><Switch value={hub.notificationPreferences[key]} onValueChange={() => togglePreference(key)} accessibilityLabel={`Toggle ${key}`} /></View>)}{reminders.length ? <Text style={styles.reminder}>{reminders[0]}</Text> : null}</View>
      </ScrollView>
    </ScreenContainer>
  );
}

function Action({ label, onPress }: { label: string; onPress: () => void }) { return <Pressable onPress={onPress} style={({ pressed }) => [styles.action, pressed && styles.pressed]} accessibilityRole="button"><Text style={styles.actionText}>{label}</Text></Pressable>; }
function Metric({ label, value }: { label: string; value: string }) { return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>; }

const styles = StyleSheet.create({
  content: { paddingTop: 24, paddingBottom: 120 }, title: { color: "#172033", fontSize: 30, lineHeight: 36, fontWeight: "800", letterSpacing: -0.9, marginTop: 6 }, subtitle: { color: "#68738B", fontSize: 15, lineHeight: 22, marginTop: 8 }, sectionTitle: { color: "#172033", fontSize: 20, fontWeight: "800", marginTop: 28, marginBottom: 12 }, card: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#E6EAF2", padding: 17, marginBottom: 10 }, cardTitle: { color: "#172033", fontSize: 16, fontWeight: "800" }, body: { color: "#68738B", fontSize: 13, lineHeight: 20, marginTop: 7 }, caption: { color: "#8791A5", fontSize: 12, lineHeight: 18, marginTop: 12 }, row: { flexDirection: "row", gap: 10, marginTop: 16 }, action: { backgroundColor: "#255CFF", borderRadius: 12, minHeight: 42, paddingHorizontal: 16, alignItems: "center", justifyContent: "center", flex: 1 }, actionText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" }, pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] }, planBox: { backgroundColor: "#F1F4FF", borderRadius: 13, padding: 12, marginTop: 14 }, planTitle: { color: "#172033", fontSize: 13, fontWeight: "800" }, planRow: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#DEE5FF", paddingVertical: 8 }, value: { color: "#255CFF", fontSize: 13, fontWeight: "800" }, week: { marginTop: 10 }, graphRail: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 }, node: { borderRadius: 12, backgroundColor: "#F1F4FF", paddingHorizontal: 10, paddingVertical: 8 }, nodePrimary: { backgroundColor: "#111B3D" }, nodeText: { color: "#255CFF", fontSize: 12, fontWeight: "800" }, nodeTextPrimary: { color: "#FFFFFF" }, analyticsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 }, metric: { backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#E6EAF2", padding: 14, width: "48%" }, metricValue: { color: "#172033", fontSize: 22, fontWeight: "800" }, metricLabel: { color: "#68738B", fontSize: 12, marginTop: 4 }, preference: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#EEF1F6" }, reminder: { color: "#167A56", fontSize: 13, fontWeight: "700", marginTop: 12 },
});
