import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Metric, ProgressBar } from "@/components/learnverse-ui";
import { starterCourse } from "@/lib/learning/catalog";
import { getCourseProgress, getLearningMinutes, getQuizAccuracy } from "@/lib/learning/progress";
import { useLearner } from "@/lib/learning/learner-context";

export default function ProfileScreen() {
  const router = useRouter();
  const { state, resetLearningState } = useLearner();
  const progress = getCourseProgress(starterCourse, state);
  const minutes = getLearningMinutes(state);
  const accuracy = getQuizAccuracy(state);
  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}><Text style={styles.title}>Your learning</Text><View style={styles.avatar}><Text style={styles.avatarText}>L</Text></View></View>
        <Text style={styles.subtitle}>Your progress is created from real learning activity in this app.</Text>

        <View style={styles.pathCard}>
          <Text style={styles.pathLabel}>Current goal</Text>
          <Text style={styles.pathTitle}>Build programming foundations</Text>
          <View style={styles.pathProgress}><ProgressBar value={progress} color="#A9BAFF" /><Text style={styles.pathPercent}>{progress}%</Text></View>
          <View style={styles.pathActions}><Pressable onPress={() => router.push("/learning-path")} style={({ pressed }) => [styles.pathButton, pressed && styles.pressed]}><Text style={styles.pathButtonText}>View learning path</Text></Pressable><Pressable onPress={() => router.push("/progress" as never)} style={({ pressed }) => [styles.pathButton, pressed && styles.pressed]}><Text style={styles.pathButtonText}>Progress</Text></Pressable></View>
        </View>

        <Text style={styles.sectionTitle}>Learning record</Text>
        <View style={styles.metricsCard}>
          <Metric value={`${minutes} min`} label="learning time" />
          <View style={styles.divider} />
          <Metric value={accuracy === null ? "—" : `${accuracy}%`} label="check accuracy" />
          <View style={styles.divider} />
          <Metric value={`${state.completedLessonIds.length}`} label="lessons completed" />
        </View>

        <Text style={styles.sectionTitle}>Privacy and data</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>This device’s learning state</Text>
          <Text style={styles.infoBody}>Until you connect a learning account, progress and study activity stay on this device. A production account sync uses server-side authorization and privacy controls.</Text>
          <Pressable onPress={resetLearningState} style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]} accessibilityRole="button">
            <Text style={styles.resetButtonText}>Reset local learning state</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 24, paddingBottom: 120 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { color: "#172033", fontSize: 30, fontWeight: "800", letterSpacing: -0.9 },
  avatar: { width: 45, height: 45, borderRadius: 23, alignItems: "center", justifyContent: "center", backgroundColor: "#E9EEFF" },
  avatarText: { color: "#255CFF", fontSize: 17, fontWeight: "900" },
  subtitle: { color: "#68738B", fontSize: 15, lineHeight: 22, marginTop: 8 },
  pathCard: { backgroundColor: "#111B3D", borderRadius: 24, padding: 21, marginTop: 24 },
  pathLabel: { color: "#A9BAFF", fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.7 },
  pathTitle: { color: "#FFFFFF", fontSize: 21, lineHeight: 27, fontWeight: "800", marginTop: 8 },
  pathProgress: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 18 },
  pathPercent: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  pathActions: { flexDirection: "row", alignItems: "center", gap: 20, marginTop: 13 },
  pathButton: { alignSelf: "flex-start", paddingVertical: 10 },
  pathButtonText: { color: "#C9D4FF", fontSize: 14, fontWeight: "800" },
  sectionTitle: { color: "#172033", fontSize: 20, fontWeight: "800", marginTop: 30, marginBottom: 12 },
  metricsCard: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#E6EAF2", padding: 17, flexDirection: "row", justifyContent: "space-between" },
  divider: { width: 1, alignSelf: "stretch", backgroundColor: "#E6EAF2" },
  infoCard: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#E6EAF2", padding: 17 },
  infoTitle: { color: "#172033", fontSize: 16, fontWeight: "800" },
  infoBody: { color: "#68738B", fontSize: 13, lineHeight: 20, marginTop: 7 },
  resetButton: { minHeight: 42, paddingVertical: 9, marginTop: 12 },
  resetButtonText: { color: "#C64D4D", fontSize: 13, fontWeight: "800" },
  pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
});
