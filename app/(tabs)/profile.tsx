import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Metric, ProgressBar } from "@/components/learnverse-ui";
import { starterCourse } from "@/lib/learning/catalog";
import { getCourseProgress, getLearningMinutes, getQuizAccuracy } from "@/lib/learning/progress";
import { useLearner } from "@/lib/learning/learner-context";
import { useAuth } from "@/hooks/use-auth";
import { startOAuthLogin } from "@/constants/oauth";

export default function ProfileScreen() {
  const router = useRouter();
  const { state, resetLearningState, syncError, syncNow, syncStatus } = useLearner();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const progress = getCourseProgress(starterCourse, state);
  const minutes = getLearningMinutes(state);
  const accuracy = getQuizAccuracy(state);
  const accountName = user?.name?.trim() || "Learner";
  const syncLabel = syncStatus === "synced" ? "Synced securely" : syncStatus === "syncing" ? "Syncing learning state" : syncStatus === "error" ? "Sync needs attention" : "Stored on this device";

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
        <View style={styles.topRow}><View><Text style={styles.title}>Your learning</Text><Text style={styles.accountName}>{isAuthenticated ? accountName : "Guest learner"}</Text></View><View style={styles.avatar}><Text style={styles.avatarText}>{accountName.slice(0, 1).toUpperCase()}</Text></View></View>
        <Text style={styles.subtitle}>Your progress is created from real learning activity in this app.</Text>

        <View style={styles.accountCard}>
          <View style={[styles.syncDot, syncStatus === "synced" ? styles.syncSuccess : syncStatus === "error" ? styles.syncError : styles.syncLocal]} />
          <View style={styles.accountCopy}><Text style={styles.accountTitle}>{isAuthenticated ? "Learning account connected" : "Protect your learning record"}</Text><Text style={styles.accountBody}>{isAuthenticated ? `${syncLabel}. Your cloud data is authorized by your account.` : "Sign in to back up progress across devices with protected server-side access."}</Text>{syncError ? <Text style={styles.errorHint}>{syncError}</Text> : null}</View>
          {isAuthenticated ? <Pressable onPress={() => syncNow().catch(() => undefined)} disabled={syncStatus === "syncing"} style={({ pressed }) => [styles.accountAction, pressed && styles.pressed]} accessibilityRole="button"><Text style={styles.accountActionText}>{syncStatus === "syncing" ? "Syncing" : "Sync"}</Text></Pressable> : <Pressable onPress={beginLogin} disabled={loading} style={({ pressed }) => [styles.accountAction, pressed && styles.pressed]} accessibilityRole="button"><Text style={styles.accountActionText}>{loading ? "Checking" : "Sign in"}</Text></Pressable>}
        </View>

        <View style={styles.pathCard}>
          <Text style={styles.pathLabel}>Current goal</Text>
          <Text style={styles.pathTitle}>Build programming foundations</Text>
          <View style={styles.pathProgress}><ProgressBar value={progress} color="#A9BAFF" /><Text style={styles.pathPercent}>{progress}%</Text></View>
          <View style={styles.pathActions}><Pressable onPress={() => router.push("/learning-path")} style={({ pressed }) => [styles.pathButton, pressed && styles.pressed]} accessibilityRole="button"><Text style={styles.pathButtonText}>View learning path</Text></Pressable><Pressable onPress={() => router.push("/progress" as never)} style={({ pressed }) => [styles.pathButton, pressed && styles.pressed]} accessibilityRole="button"><Text style={styles.pathButtonText}>Progress</Text></Pressable></View>
        </View>

        <Text style={styles.sectionTitle}>Learning record</Text>
        <View style={styles.metricsCard}>
          <Metric value={`${minutes} min`} label="learning time" /><View style={styles.divider} /><Metric value={accuracy === null ? "—" : `${accuracy}%`} label="check accuracy" /><View style={styles.divider} /><Metric value={`${state.completedLessonIds.length}`} label="lessons completed" />
        </View>

        <Text style={styles.sectionTitle}>Privacy and data</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{isAuthenticated ? "Account and learning data" : "This device’s learning state"}</Text>
          <Text style={styles.infoBody}>{isAuthenticated ? "Cloud records are tied to your signed-in identity and are accessed through protected server procedures. You can still reset this device’s local learning state below." : "Until you sign in, progress and study activity remain on this device. No account record is created automatically."}</Text>
          <Pressable onPress={() => { resetLearningState(); Alert.alert("Local learning state reset", "The learning state stored on this device has been cleared."); }} style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]} accessibilityRole="button"><Text style={styles.resetButtonText}>Reset local learning state</Text></Pressable>
          {isAuthenticated ? <Pressable onPress={() => logout()} style={({ pressed }) => [styles.signOutButton, pressed && styles.pressed]} accessibilityRole="button"><Text style={styles.signOutButtonText}>Sign out on this device</Text></Pressable> : null}
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
});
