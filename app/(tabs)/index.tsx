import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Eyebrow, ProgressBar, SectionTitle } from "@/components/learnverse-ui";
import { formatDuration, starterCourse } from "@/lib/learning/catalog";
import { getCourseProgress, getLearningMinutes, nextLesson } from "@/lib/learning/progress";
import { useLearner } from "@/lib/learning/learner-context";

/**
 * Home Screen - NativeWind Example
 *
 * This template uses NativeWind (Tailwind CSS for React Native).
 * You can use familiar Tailwind classes directly in className props.
 *
 * Key patterns:
 * - Use `className` instead of `style` for most styling
 * - Theme colors: use tokens directly (bg-background, text-foreground, bg-primary, etc.); no dark: prefix needed
 * - Responsive: standard Tailwind breakpoints work on web
 * - Custom colors defined in tailwind.config.js
 */
export default function HomeScreen() {
  const router = useRouter();
  const { state } = useLearner();
  const progress = getCourseProgress(starterCourse, state);
  const minutes = getLearningMinutes(state);
  const next = nextLesson(starterCourse, state);
  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroTop}><View><Eyebrow>LearnVerse AI</Eyebrow><Text style={styles.greeting}>Learn with focus.{`\n`}Keep moving forward.</Text></View><View style={styles.avatar}><Text style={styles.avatarText}>L</Text></View></View>
        <Text style={styles.heroCopy}>Turn each lesson into lasting understanding with guided practice, useful feedback, and a learning record you can trust.</Text>

        <SectionTitle title={progress === 0 ? "Start learning" : "Continue learning"} action={<Pressable onPress={() => router.push("/learning-path")} style={({ pressed }) => pressed && styles.textPressed}><Text style={styles.link}>View path</Text></Pressable>} />
        <Pressable onPress={() => router.push("/learning-path")} style={({ pressed }) => [styles.resumeCard, pressed && styles.pressed]} accessibilityRole="button">
          <View style={styles.resumeAccent}><Text style={styles.resumeAccentText}>01</Text></View>
          <View style={styles.resumeCopy}><Text style={styles.resumeCourse}>{starterCourse.title}</Text><Text style={styles.resumeTitle}>{next.shortTitle}</Text><Text style={styles.resumeMeta}>{formatDuration(next.durationSeconds)} · {next.level}</Text></View><Text style={styles.resumeArrow}>›</Text>
        </Pressable>

        <SectionTitle title="Your learning path" />
        <View style={styles.pathCard}>
          <View style={styles.pathTop}><View><Text style={styles.pathKicker}>Your goal</Text><Text style={styles.pathTitle}>Programming foundations</Text></View><Text style={styles.pathPercent}>{progress}%</Text></View>
          <ProgressBar value={progress} color="#A9BAFF" />
          <Text style={styles.pathBody}>{progress === 0 ? "Start with variables and values, then build toward reusable functions with a clear next step each time." : "Your progress reflects the lesson, practice, and review activity you complete."}</Text>
        </View>

        <SectionTitle title="Quick practice" action={<Pressable onPress={() => router.push("/(tabs)/study")} style={({ pressed }) => pressed && styles.textPressed}><Text style={styles.link}>Open practice</Text></Pressable>} />
        <View style={styles.practiceCard}><View style={styles.practiceIcon}><Text style={styles.practiceIconText}>↗</Text></View><View style={styles.practiceCopy}><Text style={styles.practiceTitle}>{minutes === 0 ? "Create your first learning win" : "Strengthen what you learned"}</Text><Text style={styles.practiceBody}>{minutes === 0 ? "Watch the starter lesson, try its knowledge check, then use recall cards to make the ideas stick." : `${minutes} minutes of focused learning recorded on this device.`}</Text></View></View>

        <SectionTitle title="Recommended for your goal" />
        <Pressable onPress={() => router.push("/learning-path")} style={({ pressed }) => [styles.recommendation, pressed && styles.pressed]}><Text style={styles.recommendationKicker}>Start here</Text><Text style={styles.recommendationTitle}>From values to functions</Text><Text style={styles.recommendationBody}>A focused sequence that pairs each explanation with a quick way to check your understanding.</Text></Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 24, paddingBottom: 120 },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  greeting: { color: "#172033", fontSize: 32, lineHeight: 37, fontWeight: "800", letterSpacing: -1.1, marginTop: 7 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#E9EEFF", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#255CFF", fontWeight: "900", fontSize: 16 },
  heroCopy: { color: "#68738B", fontSize: 15, lineHeight: 22, marginTop: 11, marginBottom: 28, maxWidth: "93%" },
  link: { color: "#255CFF", fontSize: 13, fontWeight: "800" },
  resumeCard: { backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1, borderColor: "#E6EAF2", padding: 15, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 30 },
  resumeAccent: { width: 47, height: 58, borderRadius: 15, backgroundColor: "#E9EEFF", alignItems: "center", justifyContent: "center" },
  resumeAccentText: { color: "#255CFF", fontSize: 14, fontWeight: "900" },
  resumeCopy: { flex: 1, gap: 3 },
  resumeCourse: { color: "#68738B", fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.6 },
  resumeTitle: { color: "#172033", fontSize: 16, fontWeight: "800" },
  resumeMeta: { color: "#68738B", fontSize: 12 },
  resumeArrow: { color: "#255CFF", fontSize: 28, fontWeight: "300" },
  pathCard: { backgroundColor: "#111B3D", borderRadius: 23, padding: 20, marginBottom: 30 },
  pathTop: { flexDirection: "row", justifyContent: "space-between", gap: 12, marginBottom: 15 },
  pathKicker: { color: "#A9BAFF", fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.7 },
  pathTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "800", marginTop: 4 },
  pathPercent: { color: "#FFFFFF", fontSize: 20, fontWeight: "800" },
  pathBody: { color: "#D6DDF9", fontSize: 13, lineHeight: 19, marginTop: 13 },
  practiceCard: { flexDirection: "row", gap: 13, borderRadius: 20, backgroundColor: "#F0FBF5", padding: 17, marginBottom: 30 },
  practiceIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#D7F5E3", alignItems: "center", justifyContent: "center" },
  practiceIconText: { color: "#16A66A", fontSize: 22, fontWeight: "800" },
  practiceCopy: { flex: 1, gap: 4 },
  practiceTitle: { color: "#172033", fontSize: 15, fontWeight: "800" },
  practiceBody: { color: "#53617B", fontSize: 13, lineHeight: 19 },
  recommendation: { backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1, borderColor: "#E6EAF2", padding: 18 },
  recommendationKicker: { color: "#255CFF", fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.7 },
  recommendationTitle: { color: "#172033", fontSize: 18, fontWeight: "800", marginTop: 5 },
  recommendationBody: { color: "#68738B", fontSize: 13, lineHeight: 19, marginTop: 7 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
  textPressed: { opacity: 0.58 },
});
