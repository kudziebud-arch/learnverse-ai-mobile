import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Eyebrow } from "@/components/learnverse-ui";

export default function TutorTabScreen() {
  const router = useRouter();
  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Eyebrow>AI tutor</Eyebrow>
        <Text style={styles.title}>Learn with context</Text>
        <Text style={styles.subtitle}>The tutor works best alongside a lesson, where it can use the topic, chapter, and transcript you are studying.</Text>

        <View style={styles.orbitCard}>
          <View style={styles.orbitOne} /><View style={styles.orbitTwo} /><View style={styles.brain}><Text style={styles.brainText}>LV</Text></View>
          <Text style={styles.cardTitle}>Ask the moment that matters</Text>
          <Text style={styles.cardBody}>Open a lesson to ask for a simpler explanation, another example, or a quick knowledge check.</Text>
          <Pressable onPress={() => router.push("/learning-path")} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
            <Text style={styles.buttonText}>Choose a lesson</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>How the tutor responds</Text>
        {[
          ["Explain", "Breaks down the idea in the context you are viewing."],
          ["Example", "Creates a fresh, guided example rather than just giving an answer."],
          ["Check", "Suggests a short practice step so you can verify understanding."],
        ].map(([title, body], index) => (
          <View key={title} style={styles.ruleRow}>
            <View style={styles.step}><Text style={styles.stepText}>{index + 1}</Text></View>
            <View style={styles.ruleCopy}><Text style={styles.ruleTitle}>{title}</Text><Text style={styles.ruleBody}>{body}</Text></View>
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 24, paddingBottom: 120 },
  title: { color: "#172033", fontSize: 30, lineHeight: 36, fontWeight: "800", letterSpacing: -0.9, marginTop: 6 },
  subtitle: { color: "#68738B", fontSize: 15, lineHeight: 22, marginTop: 7 },
  orbitCard: { position: "relative", marginTop: 26, overflow: "hidden", backgroundColor: "#EEF2FF", borderRadius: 26, padding: 22, minHeight: 294 },
  orbitOne: { position: "absolute", width: 206, height: 206, borderRadius: 103, borderWidth: 1, borderColor: "#C8D3FF", right: -63, top: -52 },
  orbitTwo: { position: "absolute", width: 132, height: 132, borderRadius: 66, backgroundColor: "#D9E1FF", right: -21, top: -7 },
  brain: { width: 54, height: 54, borderRadius: 18, backgroundColor: "#255CFF", alignItems: "center", justifyContent: "center" },
  brainText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900", letterSpacing: 1 },
  cardTitle: { color: "#172033", fontSize: 22, lineHeight: 28, fontWeight: "800", marginTop: 32, maxWidth: "78%" },
  cardBody: { color: "#53617B", fontSize: 14, lineHeight: 21, marginTop: 8, maxWidth: "88%" },
  button: { position: "absolute", left: 22, right: 22, bottom: 20, minHeight: 48, borderRadius: 14, backgroundColor: "#255CFF", alignItems: "center", justifyContent: "center" },
  buttonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  sectionTitle: { color: "#172033", fontSize: 20, fontWeight: "800", marginTop: 30, marginBottom: 12 },
  ruleRow: { flexDirection: "row", gap: 13, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: "#E6EAF2" },
  step: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#E9EEFF", alignItems: "center", justifyContent: "center" },
  stepText: { color: "#255CFF", fontSize: 13, fontWeight: "800" },
  ruleCopy: { flex: 1, gap: 3 },
  ruleTitle: { color: "#172033", fontSize: 15, fontWeight: "800" },
  ruleBody: { color: "#68738B", fontSize: 13, lineHeight: 19 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});
