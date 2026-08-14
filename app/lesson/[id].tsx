import { useEvent } from "expo";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import NetInfo from "@react-native-community/netinfo";
import { VideoView, useVideoPlayer } from "expo-video";
import { ScreenContainer } from "@/components/screen-container";
import { ProgressBar } from "@/components/learnverse-ui";
import { createLessonOutline } from "@/lib/learning/notes";
import { formatTimestamp, getLesson } from "@/lib/learning/catalog";
import { useLearner } from "@/lib/learning/learner-context";
import { trpc } from "@/lib/trpc";

type LessonSection = "chapters" | "transcript" | "notes";

export default function LessonScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = getLesson(id);
  const { state, recordVideoStarted, recordVideoProgress, markLessonComplete, answerCheckpoint, reviewFlashcard } = useLearner();
  const [activeSection, setActiveSection] = useState<LessonSection>("chapters");
  const [selectedTime, setSelectedTime] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showCheckpoint, setShowCheckpoint] = useState(false);
  const [revealedCardId, setRevealedCardId] = useState<string | null>(null);
  const [generatedNotes, setGeneratedNotes] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    let mounted = true;
    NetInfo.fetch().then((network) => { if (mounted) setIsOnline(Boolean(network.isConnected && network.isInternetReachable !== false)); });
    const unsubscribe = NetInfo.addEventListener((network) => setIsOnline(Boolean(network.isConnected && network.isInternetReachable !== false)));
    return () => { mounted = false; unsubscribe(); };
  }, []);

  const source = useMemo(() => lesson ? { uri: lesson.videoUrl, useCaching: true } : null, [lesson]);
  const player = useVideoPlayer(source, (createdPlayer) => {
    createdPlayer.timeUpdateEventInterval = 5;
    createdPlayer.staysActiveInBackground = true;
  });
  const { currentTime } = useEvent(player, "timeUpdate", {
    currentTime: 0,
    currentLiveTimestamp: null,
    currentOffsetFromLive: null,
    bufferedPosition: 0,
  });
  const noteMutation = trpc.learning.generateNotes.useMutation({ onSuccess: (response) => setGeneratedNotes(response.notes) });

  useEffect(() => {
    if (!lesson || currentTime <= 0) return;
    setSelectedTime(currentTime);
    recordVideoStarted(lesson.id, currentTime);
    recordVideoProgress(lesson.id, currentTime);
  }, [currentTime, lesson, recordVideoProgress, recordVideoStarted]);

  if (!lesson) {
    return (
      <ScreenContainer className="px-5" edges={["top", "bottom", "left", "right"]}>
        <View style={styles.missing}><Text style={styles.missingTitle}>Lesson unavailable</Text><Text style={styles.missingBody}>The requested lesson is not in this learning path.</Text><Pressable onPress={() => router.back()} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Return to learning path</Text></Pressable></View>
      </ScreenContainer>
    );
  }

  const checkpointAnswered = state.answeredQuestionIds.includes(lesson.interactiveQuestion.id);
  const checkpointAttempt = state.quizAttempts.find((attempt) => attempt.questionId === lesson.interactiveQuestion.id);
  const isCorrect = checkpointAnswered ? checkpointAttempt?.correct === true : selectedAnswer === lesson.interactiveQuestion.correctOptionIndex;
  const progress = Math.min(100, Math.round(((state.lessonProgress[lesson.id] ?? 0) / lesson.durationSeconds) * 100));
  const beginTutor = () => {
    if (!isOnline) {
      Alert.alert("AI tutor needs a connection", "Your transcript, outline, flashcards, checkpoint, and progress remain available offline. Reconnect to ask a grounded tutor question.");
      return;
    }
    recordVideoProgress(lesson.id, selectedTime);
    router.push({ pathname: "/tutor/[lessonId]", params: { lessonId: lesson.id, timestamp: String(selectedTime) } });
  };
  const openChapter = (seconds: number) => {
    setSelectedTime(seconds);
    player.currentTime = seconds;
    recordVideoStarted(lesson.id, seconds || 1);
    recordVideoProgress(lesson.id, seconds);
  };
  const submitCheckpoint = () => {
    if (selectedAnswer === null) return;
    answerCheckpoint(lesson.id, lesson.interactiveQuestion.id, lesson.interactiveQuestion.concept, isCorrect);
  };
  const requestNotes = () => {
    if (!isOnline) {
      setGeneratedNotes(createLessonOutline(lesson));
      return;
    }
    noteMutation.mutate({
      lessonTitle: lesson.title,
      concepts: lesson.concepts,
      transcript: lesson.transcript.join(" "),
    });
  };

  return (
    <ScreenContainer className="px-0" edges={["top", "bottom", "left", "right"]} containerClassName="bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel="Go back"><Text style={styles.backText}>‹</Text></Pressable>
          <Text numberOfLines={1} style={styles.topTitle}>{lesson.shortTitle}</Text>
          <Pressable onPress={() => setShowCheckpoint((visible) => !visible)} style={({ pressed }) => [styles.checkpointShortcut, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel={showCheckpoint ? "Close knowledge check" : "Open knowledge check"}><Text style={styles.checkpointShortcutText}>Check</Text></Pressable>
        </View>

        <View style={styles.videoWrap}>
          <VideoView style={styles.video} player={player} nativeControls allowsFullscreen allowsPictureInPicture contentFit="contain" surfaceType="textureView" onFirstFrameRender={() => recordVideoStarted(lesson.id, selectedTime || 1)} />
        </View>
        {!isOnline ? <Text style={styles.offlineNotice}>Offline mode: cached lesson content, outline, flashcards, checkpoints, and progress remain available. AI tutor requests will resume when you reconnect.</Text> : null}

        <View style={styles.body}>
          <Text style={styles.courseLabel}>JavaScript Foundations · {lesson.level}</Text>
          <Text style={styles.title}>{lesson.title}</Text>
          <Text style={styles.description}>{lesson.description}</Text>
          <View style={styles.progressRow}><ProgressBar value={progress} /><Text style={styles.progressText}>{progress}% watched</Text></View>

          <View style={styles.actions}>
            <Pressable onPress={beginTutor} style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel="Ask the AI tutor about this lesson"><Text style={styles.primaryActionIcon}>✦</Text><Text style={styles.primaryActionText}>Ask tutor</Text></Pressable>
            <Pressable onPress={requestNotes} disabled={noteMutation.isPending} style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed, noteMutation.isPending && styles.disabled]} accessibilityRole="button" accessibilityLabel="Create AI study notes"><Text style={styles.secondaryActionText}>{noteMutation.isPending ? "Preparing notes…" : "Create notes"}</Text></Pressable>
          </View>
          {noteMutation.error ? <Text style={styles.errorText}>Notes could not be generated right now. Your lesson outline is still available below.</Text> : null}

          <View style={styles.segmented}>
            {(["chapters", "transcript", "notes"] as LessonSection[]).map((section) => <Pressable key={section} onPress={() => setActiveSection(section)} style={[styles.segment, activeSection === section && styles.segmentActive]} accessibilityRole="tab" accessibilityState={{ selected: activeSection === section }} accessibilityLabel={`Show ${section}`}><Text style={[styles.segmentText, activeSection === section && styles.segmentTextActive]}>{section[0].toUpperCase() + section.slice(1)}</Text></Pressable>)}
          </View>
          {activeSection === "chapters" ? <View style={styles.sectionCard}>{lesson.chapters.map((chapter) => <Pressable key={chapter.id} onPress={() => openChapter(chapter.startSeconds)} style={({ pressed }) => [styles.chapterRow, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel={`Play chapter ${chapter.title} at ${formatTimestamp(chapter.startSeconds)}`}><Text style={styles.chapterTime}>{formatTimestamp(chapter.startSeconds)}</Text><View style={styles.chapterCopy}><Text style={styles.chapterTitle}>{chapter.title}</Text><Text style={styles.chapterBody}>{chapter.summary}</Text></View><Text style={styles.chapterArrow}>›</Text></Pressable>)}</View> : null}
          {activeSection === "transcript" ? <View style={styles.sectionCard}>{lesson.transcript.map((segment, index) => <View key={segment} style={styles.transcriptRow}><Text style={styles.transcriptIndex}>{String(index + 1).padStart(2, "0")}</Text><Text style={styles.transcriptText}>{segment}</Text></View>)}</View> : null}
          {activeSection === "notes" ? <View style={styles.notesCard}><Text style={styles.notesLabel}>{generatedNotes ? "AI study notes" : "Verified lesson outline"}</Text><Text style={styles.notesText}>{generatedNotes ?? createLessonOutline(lesson)}</Text></View> : null}

          <View style={styles.practiceHeader}><View><Text style={styles.sectionHeading}>Practice the idea</Text><Text style={styles.sectionHint}>Use the checkpoint, then review a concept card.</Text></View><Pressable onPress={() => setShowCheckpoint(true)}><Text style={styles.textLink}>Open check</Text></Pressable></View>
          {showCheckpoint ? <View style={styles.checkpointCard}>
            <Text style={styles.checkpointLabel}>Interactive checkpoint · {formatTimestamp(lesson.interactiveQuestion.timestampSeconds)}</Text>
            <Text style={styles.checkpointQuestion}>{lesson.interactiveQuestion.prompt}</Text>
            {lesson.interactiveQuestion.options.map((option, optionIndex) => <Pressable key={option} onPress={() => setSelectedAnswer(optionIndex)} disabled={checkpointAnswered} style={({ pressed }) => [styles.option, selectedAnswer === optionIndex && styles.optionSelected, checkpointAnswered && optionIndex === lesson.interactiveQuestion.correctOptionIndex && styles.optionCorrect, pressed && styles.pressed]} accessibilityRole="radio" accessibilityState={{ selected: selectedAnswer === optionIndex, disabled: checkpointAnswered }} accessibilityLabel={`Answer ${String.fromCharCode(65 + optionIndex)}: ${option}`}><View style={[styles.optionCircle, selectedAnswer === optionIndex && styles.optionCircleSelected]}><Text style={[styles.optionLetter, selectedAnswer === optionIndex && styles.optionLetterSelected]}>{String.fromCharCode(65 + optionIndex)}</Text></View><Text style={styles.optionText}>{option}</Text></Pressable>)}
            {!checkpointAnswered ? <Pressable onPress={submitCheckpoint} disabled={selectedAnswer === null} style={({ pressed }) => [styles.checkButton, selectedAnswer === null && styles.disabled, pressed && styles.pressed]} accessibilityRole="button" accessibilityState={{ disabled: selectedAnswer === null }}><Text style={styles.checkButtonText}>Check answer</Text></Pressable> : <View style={[styles.feedback, isCorrect ? styles.feedbackCorrect : styles.feedbackReview]} accessibilityLiveRegion="polite"><Text style={styles.feedbackTitle}>{isCorrect ? "That’s right" : "Revisit the concept"}</Text><Text style={styles.feedbackBody}>{lesson.interactiveQuestion.explanation}</Text>{!isCorrect ? <Pressable onPress={beginTutor} accessibilityRole="button" accessibilityLabel="Ask the tutor for another example"><Text style={styles.feedbackLink}>Ask the tutor for another example</Text></Pressable> : null}</View>}
          </View> : null}

          <View style={styles.flashcardsCard}><Text style={styles.sectionHeading}>Quick recall cards</Text>{lesson.flashcards.map((card) => { const revealed = revealedCardId === card.id; const reviewed = state.reviewedFlashcardIds.includes(card.id); return <Pressable key={card.id} onPress={() => { setRevealedCardId(revealed ? null : card.id); reviewFlashcard(card.id, card.concept); }} style={({ pressed }) => [styles.flashcard, revealed && styles.flashcardRevealed, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel={`${revealed ? "Hide" : "Reveal"} flashcard: ${card.front}`}><Text style={styles.cardKicker}>{reviewed ? "Reviewed" : "Tap to reveal"}</Text><Text style={styles.cardFront}>{revealed ? card.back : card.front}</Text><Text style={styles.cardConcept}>{card.concept}</Text></Pressable>; })}</View>

          <Pressable onPress={() => { markLessonComplete(lesson.id); Alert.alert("Lesson marked complete", "Your learning path and profile now reflect this completed lesson."); }} style={({ pressed }) => [styles.completeButton, pressed && styles.pressed]} accessibilityRole="button" accessibilityState={{ selected: state.completedLessonIds.includes(lesson.id) }} accessibilityLabel={state.completedLessonIds.includes(lesson.id) ? "Lesson completed" : "Mark lesson complete"}><Text style={styles.completeButtonText}>{state.completedLessonIds.includes(lesson.id) ? "Lesson completed" : "Mark lesson complete"}</Text><Text style={styles.completeCheck}>{state.completedLessonIds.includes(lesson.id) ? "✓" : "→"}</Text></Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 28 },
  topBar: { height: 58, paddingHorizontal: 16, alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: 12 },
  back: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  backText: { color: "#255CFF", fontSize: 36, lineHeight: 36, fontWeight: "300", marginTop: -3 },
  topTitle: { flex: 1, color: "#172033", fontSize: 15, fontWeight: "800", textAlign: "center" },
  checkpointShortcut: { minWidth: 42, minHeight: 42, alignItems: "center", justifyContent: "center" },
  checkpointShortcutText: { color: "#255CFF", fontSize: 12, fontWeight: "800" },
  videoWrap: { position: "relative", width: "100%", aspectRatio: 16 / 9, backgroundColor: "#111B3D" },
  video: { width: "100%", height: "100%" },
  body: { paddingHorizontal: 20, paddingTop: 21 },
  courseLabel: { color: "#255CFF", fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.7 },
  title: { color: "#172033", fontSize: 25, lineHeight: 31, fontWeight: "800", letterSpacing: -0.7, marginTop: 6 },
  description: { color: "#68738B", fontSize: 14, lineHeight: 21, marginTop: 8 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 16 },
  progressText: { color: "#68738B", fontSize: 12, fontWeight: "700" },
  actions: { flexDirection: "row", gap: 10, marginTop: 22 },
  primaryAction: { flex: 1, minHeight: 48, borderRadius: 14, backgroundColor: "#255CFF", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 7 },
  primaryActionIcon: { color: "#FFFFFF", fontSize: 15 },
  primaryActionText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  secondaryAction: { flex: 1, minHeight: 48, borderRadius: 14, borderWidth: 1, borderColor: "#D8E0EF", alignItems: "center", justifyContent: "center" },
  secondaryActionText: { color: "#255CFF", fontSize: 14, fontWeight: "800" },
  errorText: { color: "#B54B4B", fontSize: 12, lineHeight: 18, marginTop: 10 },
  offlineNotice: { color: "#6E5B16", backgroundColor: "#FFF7D6", paddingHorizontal: 20, paddingVertical: 10, fontSize: 12, lineHeight: 18 },
  segmented: { flexDirection: "row", padding: 4, backgroundColor: "#EDF1F7", borderRadius: 14, marginTop: 24 },
  segment: { flex: 1, minHeight: 36, alignItems: "center", justifyContent: "center", borderRadius: 10 },
  segmentActive: { backgroundColor: "#FFFFFF" },
  segmentText: { color: "#68738B", fontSize: 12, fontWeight: "800" },
  segmentTextActive: { color: "#172033" },
  sectionCard: { marginTop: 12, borderWidth: 1, borderColor: "#E6EAF2", borderRadius: 18, backgroundColor: "#FFFFFF", overflow: "hidden" },
  chapterRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderBottomWidth: 1, borderBottomColor: "#EEF1F6" },
  chapterTime: { color: "#255CFF", fontSize: 12, fontWeight: "800", width: 36 },
  chapterCopy: { flex: 1, gap: 3 },
  chapterTitle: { color: "#172033", fontSize: 14, fontWeight: "800" },
  chapterBody: { color: "#68738B", fontSize: 12, lineHeight: 17 },
  chapterArrow: { color: "#255CFF", fontSize: 23 },
  transcriptRow: { flexDirection: "row", gap: 12, padding: 14, borderBottomWidth: 1, borderBottomColor: "#EEF1F6" },
  transcriptIndex: { color: "#255CFF", fontSize: 11, fontWeight: "800", paddingTop: 2 },
  transcriptText: { color: "#53617B", flex: 1, fontSize: 13, lineHeight: 20 },
  notesCard: { backgroundColor: "#FBFCFF", borderWidth: 1, borderColor: "#E6EAF2", borderRadius: 18, marginTop: 12, padding: 16 },
  notesLabel: { color: "#255CFF", fontSize: 11, fontWeight: "800", letterSpacing: 0.7, textTransform: "uppercase", marginBottom: 10 },
  notesText: { color: "#36415A", fontSize: 13, lineHeight: 20 },
  practiceHeader: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: 30, marginBottom: 12 },
  sectionHeading: { color: "#172033", fontSize: 19, fontWeight: "800" },
  sectionHint: { color: "#68738B", fontSize: 12, marginTop: 4 },
  textLink: { color: "#255CFF", fontSize: 13, fontWeight: "800" },
  checkpointCard: { borderWidth: 1, borderColor: "#DCE5FF", backgroundColor: "#F7F9FF", borderRadius: 20, padding: 16 },
  checkpointLabel: { color: "#255CFF", fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.6 },
  checkpointQuestion: { color: "#172033", fontSize: 16, lineHeight: 23, fontWeight: "800", marginTop: 8, marginBottom: 14 },
  option: { minHeight: 49, borderRadius: 13, borderWidth: 1, borderColor: "#DDE4F0", backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, marginBottom: 8 },
  optionSelected: { borderColor: "#255CFF", backgroundColor: "#EEF2FF" },
  optionCorrect: { borderColor: "#16A66A", backgroundColor: "#EDF9F2" },
  optionCircle: { width: 23, height: 23, borderRadius: 12, borderWidth: 1, borderColor: "#C8D1E1", alignItems: "center", justifyContent: "center" },
  optionCircleSelected: { borderColor: "#255CFF", backgroundColor: "#255CFF" },
  optionLetter: { color: "#68738B", fontSize: 10, fontWeight: "800" },
  optionLetterSelected: { color: "#FFFFFF" },
  optionText: { color: "#36415A", flex: 1, fontSize: 13, lineHeight: 18, fontWeight: "600" },
  checkButton: { minHeight: 48, borderRadius: 13, backgroundColor: "#255CFF", alignItems: "center", justifyContent: "center", marginTop: 5 },
  checkButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  feedback: { borderRadius: 13, padding: 14, marginTop: 5 },
  feedbackCorrect: { backgroundColor: "#E8F8F0" },
  feedbackReview: { backgroundColor: "#FFF5E8" },
  feedbackTitle: { color: "#172033", fontSize: 14, fontWeight: "800" },
  feedbackBody: { color: "#53617B", fontSize: 13, lineHeight: 19, marginTop: 4 },
  feedbackLink: { color: "#255CFF", fontSize: 13, fontWeight: "800", marginTop: 8 },
  flashcardsCard: { marginTop: 30 },
  flashcard: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E6EAF2", borderRadius: 18, padding: 16, marginTop: 10, minHeight: 118, justifyContent: "space-between" },
  flashcardRevealed: { backgroundColor: "#F7F9FF", borderColor: "#C9D5FF" },
  cardKicker: { color: "#68738B", fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.6 },
  cardFront: { color: "#172033", fontSize: 15, lineHeight: 21, fontWeight: "800", marginVertical: 9 },
  cardConcept: { color: "#255CFF", fontSize: 12, fontWeight: "700" },
  completeButton: { backgroundColor: "#111B3D", minHeight: 56, paddingHorizontal: 17, borderRadius: 16, marginTop: 30, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  completeButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  completeCheck: { color: "#FFFFFF", fontSize: 19, fontWeight: "700" },
  missing: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28 },
  missingTitle: { color: "#172033", fontSize: 22, fontWeight: "800" },
  missingBody: { color: "#68738B", fontSize: 14, textAlign: "center", lineHeight: 20, marginTop: 8 },
  secondaryButton: { marginTop: 20, borderRadius: 14, borderWidth: 1, borderColor: "#DDE4F0", paddingHorizontal: 16, paddingVertical: 12 },
  secondaryButtonText: { color: "#255CFF", fontSize: 14, fontWeight: "800" },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
});
