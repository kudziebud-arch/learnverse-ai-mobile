import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Metric, ProgressBar } from "@/components/learnverse-ui";
import { starterCourse } from "@/lib/learning/catalog";
import { getCourseProgress, getLearningMinutes, getQuizAccuracy } from "@/lib/learning/progress";
import { useLearner } from "@/lib/learning/learner-context";

const eventLabels: Record<string, string> = {
  VIDEO_STARTED: "Started a lesson",
  VIDEO_COMPLETED: "Completed a lesson",
  CHAPTER_COMPLETED: "Completed a chapter",
  QUESTION_ANSWERED: "Answered a knowledge check",
  QUIZ_COMPLETED: "Completed a quiz",
  FLASHCARD_REVIEWED: "Reviewed a flashcard",
};

export default function ProgressScreen() {
  const router = useRouter();
  const { state, isReady } = useLearner();
  const completion = getCourseProgress(starterCourse, state);
  const minutes = getLearningMinutes(state);
  const accuracy = getQuizAccuracy(state);
  const recentEvents = [...state.events].reverse().slice(0, 5);

  return (
    <ScreenContainer className="px-5" edges={["top", "bottom", "left", "right"]} containerClassName="bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, pressed && styles.pressed]}><Text style={styles.backText}>‹</Text><Text style={styles.backLabel}>Back</Text></Pressable>
        <Text style={styles.eyebrow}>Progress</Text>
        <Text style={styles.title}>Learning evidence</Text>
        <Text style={styles.subtitle}>{isReady ? "These indicators are calculated from lesson, checkpoint, and study actions recorded on this device." : "Loading your learning activity…"}</Text>

        <View style={styles.courseCard}>
          <View style={styles.courseTop}><View><Text style={styles.courseKicker}>Current course</Text><Text style={styles.courseTitle}>{starterCourse.title}</Text></View><Text style={styles.coursePercent}>{completion}%</Text></View>
          <ProgressBar value={completion} color="#A9BAFF" />
          <Text style={styles.courseBody}>{state.completedLessonIds.length} of {starterCourse.lessons.length} lessons marked complete</Text>
        </View>

        <Text style={styles.sectionTitle}>Activity snapshot</Text>
        <View style={styles.metrics}><Metric value={`${minutes} min`} label="learning time" /><View style={styles.rule} /><Metric value={accuracy === null ? "—" : `${accuracy}%`} label="check accuracy" /><View style={styles.rule} /><Metric value={`${state.reviewedFlashcardIds.length}`} label="cards reviewed" /></View>

        <Text style={styles.sectionTitle}>Recent learning activity</Text>
        {recentEvents.length > 0 ? <View style={styles.timeline}>{recentEvents.map((event) => <View key={event.id} style={styles.timelineRow}><View style={styles.timelineDot} /><View style={styles.timelineCopy}><Text style={styles.timelineTitle}>{eventLabels[event.type] ?? "Learning activity"}</Text><Text style={styles.timelineMeta}>{event.concept ? `${event.concept} · ` : ""}{new Date(event.occurredAt).toLocaleString()}</Text></View></View>)}</View> : <View style={styles.empty}><Text style={styles.emptyTitle}>Your activity will appear here</Text><Text style={styles.emptyBody}>Open a lesson, complete a checkpoint, or review a recall card to create your first learning evidence.</Text><Pressable onPress={() => router.push("/learning-path")} style={({ pressed }) => [styles.emptyButton, pressed && styles.pressed]}><Text style={styles.emptyButtonText}>Open learning path</Text></Pressable></View>}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 8, paddingBottom: 28 },
  back: { alignSelf: "flex-start", minHeight: 40, flexDirection: "row", gap: 4, alignItems: "center", paddingRight: 10 },
  backText: { color: "#255CFF", fontSize: 32, lineHeight: 32, marginTop: -2 },
  backLabel: { color: "#255CFF", fontSize: 14, fontWeight: "800" },
  eyebrow: { color: "#68738B", fontSize: 12, fontWeight: "800", letterSpacing: 0.7, textTransform: "uppercase", marginTop: 16 },
  title: { color: "#172033", fontSize: 30, lineHeight: 36, letterSpacing: -0.9, fontWeight: "800", marginTop: 6 },
  subtitle: { color: "#68738B", fontSize: 14, lineHeight: 21, marginTop: 7 },
  courseCard: { backgroundColor: "#111B3D", borderRadius: 24, padding: 20, marginTop: 24 },
  courseTop: { flexDirection: "row", gap: 12, justifyContent: "space-between", marginBottom: 15 },
  courseKicker: { color: "#A9BAFF", fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.7 },
  courseTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "800", marginTop: 4 },
  coursePercent: { color: "#FFFFFF", fontSize: 21, fontWeight: "800" },
  courseBody: { color: "#D6DDF9", fontSize: 13, marginTop: 14 },
  sectionTitle: { color: "#172033", fontSize: 20, fontWeight: "800", marginTop: 30, marginBottom: 12 },
  metrics: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#E6EAF2", padding: 17, flexDirection: "row", justifyContent: "space-between" },
  rule: { width: 1, backgroundColor: "#E6EAF2", alignSelf: "stretch" },
  timeline: { borderRadius: 18, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E6EAF2", paddingHorizontal: 16 },
  timelineRow: { flexDirection: "row", gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#EEF1F6" },
  timelineDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#255CFF", marginTop: 6 },
  timelineCopy: { flex: 1 },
  timelineTitle: { color: "#172033", fontSize: 14, fontWeight: "800" },
  timelineMeta: { color: "#68738B", fontSize: 12, marginTop: 3 },
  empty: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#E6EAF2", padding: 20 },
  emptyTitle: { color: "#172033", fontSize: 16, fontWeight: "800" },
  emptyBody: { color: "#68738B", fontSize: 13, lineHeight: 19, marginTop: 6 },
  emptyButton: { alignSelf: "flex-start", minHeight: 40, justifyContent: "center", marginTop: 10 },
  emptyButtonText: { color: "#255CFF", fontSize: 13, fontWeight: "800" },
  pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
});
