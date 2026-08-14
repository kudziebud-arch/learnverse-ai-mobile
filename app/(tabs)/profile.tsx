import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useMemo } from "react";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Metric, ProgressBar } from "@/components/learnverse-ui";
import { starterCourse } from "@/lib/learning/catalog";
import { getCourseProgress, getLearningMinutes, getQuizAccuracy } from "@/lib/learning/progress";
import { useLearner } from "@/lib/learning/learner-context";
import { useAuth } from "@/hooks/use-auth";
import { startOAuthLogin } from "@/constants/oauth";
import { useThemeContext, type ThemePreference } from "@/lib/theme-provider";
import { useColors } from "@/hooks/use-colors";

export default function ProfileScreen() {
  const router = useRouter();
  const { state, resetLearningState, syncError, syncNow, syncStatus } = useLearner();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { colorScheme, themePreference, setThemePreference } = useThemeContext();
  const colors = useColors();
  const themeStyles = useMemo(() => createThemeStyles(colors, colorScheme), [colorScheme, colors]);
  const progress = getCourseProgress(starterCourse, state);
  const minutes = getLearningMinutes(state);
  const accuracy = getQuizAccuracy(state);
  const accountName = user?.name?.trim() || "Learner";
  const syncLabel = syncStatus === "synced" ? "Synced securely" : syncStatus === "syncing" ? "Syncing learning state" : syncStatus === "offline" ? "Offline — changes queued safely" : syncStatus === "error" ? "Sync needs attention" : "Stored on this device";

  const beginLogin = async () => {
    try {
      await startOAuthLogin();
    } catch {
      Alert.alert("Sign-in unavailable", "We could not open the secure sign-in flow. Please try again.");
    }
  };

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}><View><Text style={[styles.title, themeStyles.foreground]}>Build momentum, one lesson at a time.</Text><Text style={[styles.accountName, themeStyles.muted]}>{isAuthenticated ? accountName : "Guest learner"}</Text></View><View style={[styles.avatar, themeStyles.avatar]}><Text style={styles.avatarText}>{accountName.slice(0, 1).toUpperCase()}</Text></View></View>
        <Text style={[styles.subtitle, themeStyles.muted]}>Every lesson, check, and review builds a clear record of what you understand.</Text>

        <View style={[styles.accountCard, themeStyles.card]}>
          <View style={[styles.syncDot, syncStatus === "synced" ? styles.syncSuccess : syncStatus === "error" ? styles.syncError : styles.syncLocal]} />
          <View style={styles.accountCopy}><Text style={[styles.accountTitle, themeStyles.foreground]}>{isAuthenticated ? "Learning account connected" : "Keep your learning record safe"}</Text><Text style={[styles.accountBody, themeStyles.muted]}>{isAuthenticated ? `${syncLabel}. Your learning record follows your account across supported devices.` : "Sign in when you are ready to back up your progress and continue on another device."}</Text>{syncError ? <Text style={styles.errorHint}>{syncError}</Text> : null}</View>
          {isAuthenticated ? <Pressable onPress={() => syncNow().catch(() => undefined)} disabled={syncStatus === "syncing"} style={({ pressed }) => [styles.accountAction, pressed && styles.pressed]} accessibilityRole="button"><Text style={styles.accountActionText}>{syncStatus === "syncing" ? "Syncing" : "Sync"}</Text></Pressable> : <Pressable onPress={beginLogin} disabled={loading} style={({ pressed }) => [styles.accountAction, pressed && styles.pressed]} accessibilityRole="button"><Text style={styles.accountActionText}>{loading ? "Checking" : "Sign in"}</Text></Pressable>}
        </View>

        <View style={styles.pathCard}>
          <Text style={styles.pathLabel}>Your current focus</Text>
          <Text style={styles.pathTitle}>Build confident programming foundations</Text>
          <View style={styles.pathProgress}><ProgressBar value={progress} color="#A9BAFF" /><Text style={styles.pathPercent}>{progress}%</Text></View>
          <View style={styles.pathActions}><Pressable onPress={() => router.push("/learning-path")} style={({ pressed }) => [styles.pathButton, pressed && styles.pressed]} accessibilityRole="button"><Text style={styles.pathButtonText}>View learning path</Text></Pressable><Pressable onPress={() => router.push("/progress")} style={({ pressed }) => [styles.pathButton, pressed && styles.pressed]} accessibilityRole="button"><Text style={styles.pathButtonText}>Progress</Text></Pressable></View>
        </View>

        <Text style={[styles.sectionTitle, themeStyles.foreground]}>Learning record</Text>
        <View style={[styles.metricsCard, themeStyles.card]}>
          <Metric value={`${minutes} min`} label="learning time" /><View style={styles.divider} /><Metric value={accuracy === null ? "—" : `${accuracy}%`} label="check accuracy" /><View style={styles.divider} /><Metric value={`${state.completedLessonIds.length}`} label="lessons completed" />
        </View>

        <Text style={[styles.sectionTitle, themeStyles.foreground]}>Appearance</Text>
        <View style={[styles.infoCard, themeStyles.card]}>
          <Text style={[styles.infoTitle, themeStyles.foreground]}>Choose what feels best</Text>
          <Text style={[styles.infoBody, themeStyles.muted]}>Use the system setting or choose a consistent light or dark appearance. Your preference is saved on this device.</Text>
          <View style={[styles.appearanceOptions, themeStyles.optionRail]}>
            {(["system", "light", "dark"] as ThemePreference[]).map((option) => <Pressable key={option} onPress={() => setThemePreference(option)} style={({ pressed }) => [styles.appearanceOption, themePreference === option && [styles.appearanceOptionSelected, themeStyles.optionSelected], pressed && styles.pressed]} accessibilityRole="radio" accessibilityState={{ selected: themePreference === option }} accessibilityLabel={`Use ${option} appearance`}><Text style={[styles.appearanceOptionText, themeStyles.muted, themePreference === option && styles.appearanceOptionTextSelected]}>{option === "system" ? `System (${colorScheme})` : option[0].toUpperCase() + option.slice(1)}</Text></Pressable>)}
          </View>
        </View>

        <Text style={[styles.sectionTitle, themeStyles.foreground]}>Privacy and data</Text>
        <View style={[styles.infoCard, themeStyles.card]}>
          <Text style={[styles.infoTitle, themeStyles.foreground]}>{isAuthenticated ? "Account and learning data" : "This device’s learning state"}</Text>
          <Text style={[styles.infoBody, themeStyles.muted]}>{isAuthenticated ? "Your cloud record is tied to your account and accessed through protected server procedures. You can still reset this device’s learning state below." : "Until you sign in, your progress stays on this device. No account record is created automatically."}</Text>
          <Pressable onPress={() => { resetLearningState(); Alert.alert("Local learning state reset", "The learning state stored on this device has been cleared."); }} style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]} accessibilityRole="button"><Text style={styles.resetButtonText}>Reset local learning state</Text></Pressable>
          {isAuthenticated ? <Pressable onPress={() => logout()} style={({ pressed }) => [styles.signOutButton, pressed && styles.pressed]} accessibilityRole="button"><Text style={styles.signOutButtonText}>Sign out on this device</Text></Pressable> : null}
        </View>

        <Text style={[styles.sectionTitle, themeStyles.foreground]}>More learning tools</Text>
        <View style={[styles.infoCard, themeStyles.card]}>
          <Text style={[styles.infoTitle, themeStyles.foreground]}>Plan, retain, and apply</Text>
          <Text style={[styles.infoBody, themeStyles.muted]}>Open the new Learning Hub for study plans, exam preparation, spaced review, knowledge links, analytics, skill evidence, and notification preferences.</Text>
          <Pressable onPress={() => router.push("/learning-hub")} style={({ pressed }) => [styles.signOutButton, pressed && styles.pressed]} accessibilityRole="button"><Text style={styles.signOutButtonText}>Open Learning Hub</Text></Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 24, paddingBottom: 120 }, topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, title: { color: "#172033", fontSize: 30, fontWeight: "800", letterSpacing: -0.9 }, accountName: { color: "#68738B", fontSize: 13, fontWeight: "700", marginTop: 3 }, avatar: { width: 45, height: 45, borderRadius: 23, alignItems: "center", justifyContent: "center", backgroundColor: "#E9EEFF" }, avatarText: { color: "#255CFF", fontSize: 17, fontWeight: "900" }, subtitle: { color: "#68738B", fontSize: 15, lineHeight: 22, marginTop: 8 },
  accountCard: { flexDirection: "row", alignItems: "flex-start", gap: 10, backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#E6EAF2", padding: 15, marginTop: 20 }, syncDot: { width: 9, height: 9, borderRadius: 5, marginTop: 6 }, syncSuccess: { backgroundColor: "#16A66A" }, syncError: { backgroundColor: "#E45757" }, syncLocal: { backgroundColor: "#F0A83A" }, accountCopy: { flex: 1 }, accountTitle: { color: "#172033", fontSize: 14, fontWeight: "800" }, accountBody: { color: "#68738B", fontSize: 12, lineHeight: 18, marginTop: 4 }, errorHint: { color: "#B54B4B", fontSize: 11, lineHeight: 16, marginTop: 5 }, accountAction: { minHeight: 38, paddingHorizontal: 8, alignItems: "center", justifyContent: "center" }, accountActionText: { color: "#255CFF", fontSize: 13, fontWeight: "800" },
  pathCard: { backgroundColor: "#111B3D", borderRadius: 24, padding: 21, marginTop: 18 }, pathLabel: { color: "#A9BAFF", fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.7 }, pathTitle: { color: "#FFFFFF", fontSize: 21, lineHeight: 27, fontWeight: "800", marginTop: 8 }, pathProgress: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 18 }, pathPercent: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" }, pathActions: { flexDirection: "row", alignItems: "center", gap: 20, marginTop: 13 }, pathButton: { alignSelf: "flex-start", paddingVertical: 10 }, pathButtonText: { color: "#C9D4FF", fontSize: 14, fontWeight: "800" },
  sectionTitle: { color: "#172033", fontSize: 20, fontWeight: "800", marginTop: 30, marginBottom: 12 }, metricsCard: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#E6EAF2", padding: 17, flexDirection: "row", justifyContent: "space-between" }, divider: { width: 1, alignSelf: "stretch", backgroundColor: "#E6EAF2" }, infoCard: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#E6EAF2", padding: 17 }, infoTitle: { color: "#172033", fontSize: 16, fontWeight: "800" }, infoBody: { color: "#68738B", fontSize: 13, lineHeight: 20, marginTop: 7 }, resetButton: { minHeight: 42, paddingVertical: 9, marginTop: 12 }, resetButtonText: { color: "#C64D4D", fontSize: 13, fontWeight: "800" }, signOutButton: { minHeight: 42, paddingVertical: 9 }, signOutButtonText: { color: "#255CFF", fontSize: 13, fontWeight: "800" }, pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
  appearanceOptions: { flexDirection: "row", borderRadius: 13, padding: 4, marginTop: 14 }, appearanceOption: { flex: 1, minHeight: 39, borderRadius: 10, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 }, appearanceOptionSelected: { backgroundColor: "#FFFFFF" }, appearanceOptionText: { fontSize: 11, fontWeight: "800" }, appearanceOptionTextSelected: { color: "#255CFF" },
});

function createThemeStyles(colors: ReturnType<typeof useColors>, colorScheme: "light" | "dark") {
  return StyleSheet.create({
    foreground: { color: colors.foreground },
    muted: { color: colors.muted },
    card: { backgroundColor: colors.surface, borderColor: colors.border },
    avatar: { backgroundColor: colorScheme === "dark" ? "#25356F" : "#E9EEFF" },
    optionRail: { backgroundColor: colorScheme === "dark" ? "#252B3B" : "#EDF1F7" },
    optionSelected: { backgroundColor: colors.surface },
  });
}
