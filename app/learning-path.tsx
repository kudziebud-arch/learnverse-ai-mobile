import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { ProgressBar } from "@/components/learnverse-ui";
import { formatDuration, starterCourse } from "@/lib/learning/catalog";
import { getCourseProgress, nextLesson } from "@/lib/learning/progress";
import { useLearner } from "@/lib/learning/learner-context";

export default function LearningPathScreen() {
  const router = useRouter();
  const { state } = useLearner();
  const progress = getCourseProgress(starterCourse, state);
  const next = nextLesson(starterCourse, state);
  return (
    <ScreenContainer className="px-5" edges={["top", "bottom", "left", "right"]} containerClassName="bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, pressed && styles.pressed]} accessibilityLabel="Go back"><Text style={styles.backText}>‹</Text><Text style={styles.backLabel}>Back</Text></Pressable>
        <Text style={styles.eyebrow}>Learning path</Text>
        <Text style={styles.title}>Build programming foundations</Text>
        <Text style={styles.subtitle}>A focused first path toward understanding how code stores information and organizes reusable actions.</Text>

        <View style={styles.overviewCard}>
          <View style={styles.overviewTop}><View><Text style={styles.overviewKicker}>{starterCourse.subject}</Text><Text style={styles.overviewTitle}>{starterCourse.title}</Text></View><Text style={styles.overviewPercent}>{progress}%</Text></View>
          <ProgressBar value={progress} color="#A9BAFF" />
          <Text style={styles.overviewBody}>{progress === 0 ? "Start with the first lesson, then use the in-video checkpoint to check your understanding." : "Your completion state is based on lessons you marked as complete."}</Text>
        </View>

        <Text style={styles.sectionTitle}>Your milestones</Text>
        {starterCourse.lessons.map((lesson, index) => {
          const completed = state.completedLessonIds.includes(lesson.id);
          const active = lesson.id === next.id;
          return (
            <Pressable key={lesson.id} onPress={() => router.push({ pathname: "/lesson/[id]", params: { id: lesson.id } })} style={({ pressed }) => [styles.lessonRow, active && styles.lessonActive, pressed && styles.pressed]} accessibilityRole="button">
              <View style={[styles.step, completed && styles.stepComplete, active && styles.stepActive]}><Text style={[styles.stepText, (completed || active) && styles.stepTextLight]}>{completed ? "✓" : index + 1}</Text></View>
              <View style={styles.lessonCopy}><Text style={styles.lessonStatus}>{completed ? "Completed" : active ? "Up next" : "On this path"}</Text><Text style={styles.lessonTitle}>{lesson.shortTitle}</Text><Text style={styles.lessonBody}>{formatDuration(lesson.durationSeconds)} · {lesson.concepts.slice(0, 2).join(" · ")}</Text></View>
              <Text style={styles.arrow}>›</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 8, paddingBottom: 24 },
  back: { alignSelf: "flex-start", minHeight: 40, flexDirection: "row", alignItems: "center", gap: 4, paddingRight: 10 },
  backText: { color: "#255CFF", fontSize: 32, lineHeight: 32, fontWeight: "300" },
  backLabel: { color: "#255CFF", fontSize: 14, fontWeight: "800" },
  eyebrow: { color: "#68738B", fontSize: 12, fontWeight: "800", letterSpacing: 0.7, textTransform: "uppercase", marginTop: 16 },
  title: { color: "#172033", fontSize: 29, lineHeight: 35, fontWeight: "800", letterSpacing: -0.9, marginTop: 6 },
  subtitle: { color: "#68738B", fontSize: 14, lineHeight: 21, marginTop: 7 },
  overviewCard: { backgroundColor: "#111B3D", borderRadius: 24, padding: 20, marginTop: 23 },
  overviewTop: { flexDirection: "row", gap: 16, justifyContent: "space-between", marginBottom: 16 },
  overviewKicker: { color: "#A9BAFF", fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.7 },
  overviewTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "800", marginTop: 4 },
  overviewPercent: { color: "#FFFFFF", fontSize: 20, fontWeight: "800" },
  overviewBody: { color: "#D6DDF9", fontSize: 13, lineHeight: 19, marginTop: 14 },
  sectionTitle: { color: "#172033", fontSize: 20, fontWeight: "800", marginTop: 30, marginBottom: 12 },
  lessonRow: { minHeight: 92, padding: 14, borderWidth: 1, borderColor: "#E6EAF2", borderRadius: 18, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  lessonActive: { borderColor: "#AABEFF", backgroundColor: "#F7F8FF" },
  step: { width: 35, height: 35, borderRadius: 18, borderWidth: 1, borderColor: "#DDE4F0", alignItems: "center", justifyContent: "center" },
  stepActive: { backgroundColor: "#255CFF", borderColor: "#255CFF" },
  stepComplete: { backgroundColor: "#16A66A", borderColor: "#16A66A" },
  stepText: { color: "#68738B", fontSize: 14, fontWeight: "800" },
  stepTextLight: { color: "#FFFFFF" },
  lessonCopy: { flex: 1, gap: 3 },
  lessonStatus: { color: "#68738B", fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.6 },
  lessonTitle: { color: "#172033", fontSize: 16, fontWeight: "800" },
  lessonBody: { color: "#68738B", fontSize: 12, lineHeight: 17 },
  arrow: { color: "#255CFF", fontSize: 27, fontWeight: "300" },
  pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
});
