import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { formatTimestamp, getLesson } from "@/lib/learning/catalog";
import { trpc } from "@/lib/trpc";

type Message = { id: string; role: "user" | "assistant"; text: string; citation?: string; practice?: string };

export default function ContextTutorScreen() {
  const router = useRouter();
  const { lessonId, timestamp } = useLocalSearchParams<{ lessonId: string; timestamp?: string }>();
  const lesson = getLesson(lessonId);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const selectedTime = Number(timestamp ?? 0);
  const mutation = trpc.learning.tutor.useMutation({
    onSuccess: (response) => {
      setMessages((current) => [...current, { id: `assistant-${Date.now()}`, role: "assistant", text: response.answer, citation: response.citations[0]?.label, practice: response.suggestedPractice }]);
    },
  });

  useEffect(() => {
    if (lesson && messages.length === 0) {
      setMessages([{ id: "context", role: "assistant", text: `I have the context for “${lesson.shortTitle}” around ${formatTimestamp(selectedTime)}. Ask for an explanation, a different example, or a quick check of your understanding.` }]);
    }
  }, [lesson, messages.length, selectedTime]);

  const prompts = useMemo(() => ["Explain this like I’m a beginner.", "Give me another example.", "Test me on this concept."], []);
  const submit = (prompt = question) => {
    const trimmed = prompt.trim();
    if (!lesson || trimmed.length < 3 || mutation.isPending) return;
    setMessages((current) => [...current, { id: `user-${Date.now()}`, role: "user", text: trimmed }]);
    setQuestion("");
    mutation.mutate({ question: trimmed, lessonId: lesson.id, timestampSeconds: selectedTime, transcript: lesson.transcript.join(" ") });
  };

  if (!lesson) return <ScreenContainer className="p-6" edges={["top", "bottom", "left", "right"]}><Text style={styles.unavailable}>This tutor context is unavailable.</Text></ScreenContainer>;

  return (
    <ScreenContainer className="px-0" edges={["top", "bottom", "left", "right"]} containerClassName="bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.select({ ios: "padding", default: undefined })} keyboardVerticalOffset={0}>
        <View style={styles.header}><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, pressed && styles.pressed]}><Text style={styles.backText}>‹</Text></Pressable><View style={styles.headerCopy}><Text style={styles.headerTitle}>AI Tutor</Text><Text numberOfLines={1} style={styles.headerContext}>{lesson.shortTitle} · {formatTimestamp(selectedTime)}</Text></View><View style={styles.online}><View style={styles.onlineDot} /><Text style={styles.onlineText}>Context on</Text></View></View>
        <ScrollView contentContainerStyle={styles.messages} showsVerticalScrollIndicator={false}>
          <View style={styles.contextCard}><Text style={styles.contextLabel}>Lesson context</Text><Text style={styles.contextTitle}>{lesson.title}</Text><Text style={styles.contextBody}>Answers are requested from the server with this lesson’s supplied transcript context. The tutor identifies limits when the source does not support an answer.</Text></View>
          {messages.map((message) => <View key={message.id} style={[styles.message, message.role === "user" ? styles.userMessage : styles.assistantMessage]}><Text style={[styles.messageRole, message.role === "user" && styles.userMessageRole]}>{message.role === "user" ? "You" : "LearnVerse tutor"}</Text><Text style={[styles.messageText, message.role === "user" && styles.userMessageText]}>{message.text}</Text>{message.citation ? <Text style={styles.citation}>Source context: {message.citation}</Text> : null}{message.practice ? <View style={styles.practice}><Text style={styles.practiceLabel}>Try next</Text><Text style={styles.practiceText}>{message.practice}</Text></View> : null}</View>)}
          {mutation.isPending ? <View style={styles.typing}><ActivityIndicator color="#255CFF" size="small" /><Text style={styles.typingText}>Preparing a grounded explanation…</Text></View> : null}
          {mutation.error ? <View style={styles.errorCard}><Text style={styles.errorTitle}>The tutor is unavailable right now</Text><Text style={styles.errorText}>No substitute answer has been created. Please try again when the AI service is available.</Text></View> : null}
        </ScrollView>
        <View style={styles.composerArea}><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promptRow}>{prompts.map((prompt) => <Pressable key={prompt} onPress={() => submit(prompt)} disabled={mutation.isPending} style={({ pressed }) => [styles.prompt, pressed && styles.pressed]}><Text style={styles.promptText}>{prompt}</Text></Pressable>)}</ScrollView><View style={styles.composer}><TextInput value={question} onChangeText={setQuestion} placeholder="Ask about this lesson" placeholderTextColor="#8791A6" style={styles.input} multiline accessibilityLabel="Ask the AI tutor" /><Pressable onPress={() => submit()} disabled={mutation.isPending || question.trim().length < 3} style={({ pressed }) => [styles.send, (mutation.isPending || question.trim().length < 3) && styles.disabled, pressed && styles.pressed]} accessibilityLabel="Send tutor question"><Text style={styles.sendText}>↑</Text></Pressable></View></View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { minHeight: 62, paddingHorizontal: 15, flexDirection: "row", alignItems: "center", gap: 8, borderBottomWidth: 1, borderBottomColor: "#E6EAF2" },
  back: { width: 38, height: 42, alignItems: "center", justifyContent: "center" },
  backText: { color: "#255CFF", fontSize: 35, lineHeight: 35, marginTop: -2 },
  headerCopy: { flex: 1 },
  headerTitle: { color: "#172033", fontSize: 16, fontWeight: "800" },
  headerContext: { color: "#68738B", fontSize: 11, marginTop: 2 },
  online: { alignItems: "center", gap: 3 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#16A66A" },
  onlineText: { color: "#16A66A", fontSize: 10, fontWeight: "800" },
  messages: { padding: 18, gap: 12, paddingBottom: 24 },
  contextCard: { padding: 15, borderRadius: 17, backgroundColor: "#EEF2FF", marginBottom: 4 },
  contextLabel: { color: "#255CFF", fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.7 },
  contextTitle: { color: "#172033", fontSize: 15, lineHeight: 21, fontWeight: "800", marginTop: 4 },
  contextBody: { color: "#53617B", fontSize: 12, lineHeight: 18, marginTop: 6 },
  message: { maxWidth: "89%", padding: 14, borderRadius: 18 },
  assistantMessage: { alignSelf: "flex-start", backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E6EAF2", borderTopLeftRadius: 4 },
  userMessage: { alignSelf: "flex-end", backgroundColor: "#255CFF", borderTopRightRadius: 4 },
  messageRole: { color: "#68738B", fontSize: 11, fontWeight: "800", marginBottom: 5 },
  userMessageRole: { color: "#DCE5FF" },
  messageText: { color: "#36415A", fontSize: 14, lineHeight: 21 },
  userMessageText: { color: "#FFFFFF" },
  citation: { color: "#255CFF", fontSize: 11, fontWeight: "700", marginTop: 8 },
  practice: { borderTopWidth: 1, borderTopColor: "#E6EAF2", marginTop: 10, paddingTop: 9 },
  practiceLabel: { color: "#255CFF", fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.6 },
  practiceText: { color: "#53617B", fontSize: 12, lineHeight: 18, marginTop: 3 },
  typing: { alignSelf: "flex-start", flexDirection: "row", gap: 9, alignItems: "center", padding: 12 },
  typingText: { color: "#68738B", fontSize: 12, fontWeight: "700" },
  errorCard: { backgroundColor: "#FFF0F0", borderRadius: 14, padding: 14 },
  errorTitle: { color: "#9C3E3E", fontSize: 13, fontWeight: "800" },
  errorText: { color: "#9C3E3E", fontSize: 12, lineHeight: 18, marginTop: 4 },
  composerArea: { borderTopWidth: 1, borderTopColor: "#E6EAF2", paddingTop: 10, paddingHorizontal: 14, paddingBottom: 12, backgroundColor: "#FFFFFF" },
  promptRow: { gap: 8, paddingRight: 10, paddingBottom: 10 },
  prompt: { borderWidth: 1, borderColor: "#DDE4F0", borderRadius: 99, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "#FAFBFE" },
  promptText: { color: "#53617B", fontSize: 12, fontWeight: "700" },
  composer: { minHeight: 52, borderWidth: 1, borderColor: "#D8E0EF", borderRadius: 17, paddingLeft: 13, paddingRight: 6, flexDirection: "row", alignItems: "flex-end", backgroundColor: "#FFFFFF" },
  input: { color: "#172033", flex: 1, fontSize: 14, minHeight: 48, maxHeight: 96, paddingTop: 14, paddingBottom: 10 },
  send: { width: 40, height: 40, borderRadius: 13, backgroundColor: "#255CFF", alignItems: "center", justifyContent: "center", marginBottom: 5 },
  sendText: { color: "#FFFFFF", fontSize: 21, fontWeight: "600", marginTop: -2 },
  unavailable: { color: "#172033", fontSize: 18, fontWeight: "800" },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
});
