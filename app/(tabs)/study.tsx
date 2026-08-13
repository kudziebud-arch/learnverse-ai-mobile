import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Eyebrow, ProgressBar } from "@/components/learnverse-ui";
import { starterCourse } from "@/lib/learning/catalog";
import { useLearner } from "@/lib/learning/learner-context";

export default function StudyScreen() {
  const router = useRouter();
  const { state } = useLearner();
  const reviewed = state.reviewedFlashcardIds.length;
  const totalCards = starterCourse.lessons.flatMap((lesson) => lesson.flashcards).length;
  const questions = state.quizAttempts.length;

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Eyebrow>Practice</Eyebrow>
        <Text style={styles.title}>Make it stick</Text>
        <Text style={styles.subtitle}>Short recall sessions help turn a watched lesson into usable knowledge.</Text>

        <View style={styles.focusCard}>
          <Text style={styles.focusKicker}>Today’s focus</Text>
          <Text style={styles.focusTitle}>{reviewed === 0 ? "Start with a quick recall" : "Keep your recall active"}</Text>
          <Text style={styles.focusBody}>{reviewed === 0 ? "Watch a lesson first to unlock practice that uses its concepts." : `${reviewed} cards reviewed. Return to the lesson when you want another explanation.`}</Text>
          <Pressable onPress={() => router.push("/learning-path")} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
            <Text style={styles.primaryButtonText}>Open learning path</Text>
            <Text style={styles.buttonArrow}>›</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Your study signals</Text>
        <View style={styles.signalCard}>
          <View style={styles.signalTop}><Text style={styles.signalTitle}>Flashcard review</Text><Text style={styles.signalValue}>{reviewed}/{totalCards}</Text></View>
          <ProgressBar value={totalCards === 0 ? 0 : (reviewed / totalCards) * 100} color="#16A66A" />
          <Text style={styles.signalText}>Review is scheduled from the concepts you study, not a generic streak target.</Text>
        </View>
        <View style={styles.signalCard}>
          <View style={styles.signalTop}><Text style={styles.signalTitle}>Understanding checks</Text><Text style={styles.signalValue}>{questions}</Text></View>
          <Text style={styles.signalText}>{questions === 0 ? "No questions answered yet. Complete a lesson checkpoint to create an evidence-based practice record." : "Your practice record is based on completed interactions in this app."}</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 24, paddingBottom: 120 },
  title: { color: "#172033", fontSize: 30, lineHeight: 36, fontWeight: "800", letterSpacing: -0.9, marginTop: 6 },
  subtitle: { color: "#68738B", fontSize: 15, lineHeight: 22, marginTop: 7 },
  focusCard: { marginTop: 24, backgroundColor: "#111B3D", borderRadius: 24, padding: 22 },
  focusKicker: { color: "#A9BAFF", fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.7 },
  focusTitle: { color: "#FFFFFF", fontSize: 22, lineHeight: 28, fontWeight: "800", marginTop: 8 },
  focusBody: { color: "#D6DDF9", fontSize: 14, lineHeight: 21, marginTop: 8 },
  primaryButton: { marginTop: 20, backgroundColor: "#FFFFFF", minHeight: 48, paddingHorizontal: 15, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  primaryButtonText: { color: "#172033", fontSize: 15, fontWeight: "800" },
  buttonArrow: { color: "#255CFF", fontSize: 25 },
  sectionTitle: { color: "#172033", fontSize: 20, fontWeight: "800", marginTop: 30, marginBottom: 12 },
  signalCard: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 17, borderWidth: 1, borderColor: "#E6EAF2", marginBottom: 10 },
  signalTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  signalTitle: { color: "#172033", fontSize: 15, fontWeight: "800" },
  signalValue: { color: "#16A66A", fontSize: 14, fontWeight: "800" },
  signalText: { color: "#68738B", fontSize: 13, lineHeight: 19, marginTop: 12 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});
