import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { ScreenContainer } from "@/components/screen-container";
import { Eyebrow, ProgressBar, SectionTitle } from "@/components/learnverse-ui";
import { formatDuration, starterCourse } from "@/lib/learning/catalog";
import { getCourseProgress, getLearningMinutes, nextLesson } from "@/lib/learning/progress";
import { useLearner } from "@/lib/learning/learner-context";
import { haptic } from "@/lib/haptics";

const LEARNVERSE_LOGO_URI = "/manus-storage/learnverse-logo_119d94e6.png";
const LEARNVERSE_HERO_URI = "/manus-storage/learnverse-hero_780147ec.png";

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
  const floatY = useSharedValue(0);
  const launchOpacity = useSharedValue(0);
  const launchScale = useSharedValue(0.96);
  const reducedMotion = useReducedMotion();
  const [isLaunching, setIsLaunching] = useState(false);
  const launchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (reducedMotion) return;
    floatY.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(6, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
    return () => cancelAnimation(floatY);
  }, [floatY, reducedMotion]);
  const floatStyle = useAnimatedStyle(() => ({ transform: [{ translateY: floatY.value }] }));
  const launchOverlayStyle = useAnimatedStyle(() => ({ opacity: launchOpacity.value, transform: [{ scale: launchScale.value }] }));
  const openNextLesson = useCallback(() => {
    if (isLaunching) return;
    if (progress === 0) haptic.light();
    setIsLaunching(true);
    const duration = reducedMotion ? 0 : 220;
    launchOpacity.value = withTiming(1, { duration });
    launchScale.value = withTiming(1, { duration });
    launchTimer.current = setTimeout(() => {
      router.push({ pathname: "/lesson/[id]", params: { id: next.id } });
      setIsLaunching(false);
      launchOpacity.value = 0;
      launchScale.value = 0.96;
    }, reducedMotion ? 80 : 520);
  }, [isLaunching, launchOpacity, launchScale, next.id, progress, reducedMotion, router]);
  useEffect(() => () => { if (launchTimer.current) clearTimeout(launchTimer.current); }, []);
  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroTop}><View><Eyebrow>LearnVerse AI</Eyebrow><Text style={styles.greeting}>Learn with focus.{`\n`}Keep moving forward.</Text></View><View style={styles.avatar}><Image source={{ uri: LEARNVERSE_LOGO_URI }} style={styles.avatarLogo} accessibilityLabel="LearnVerse AI logo" /></View></View>
        <Text style={styles.heroCopy}>Turn each lesson into lasting understanding with guided practice, useful feedback, and a learning record you can trust.</Text>
        <ImageBackground source={{ uri: LEARNVERSE_HERO_URI }} style={styles.heroVisual} imageStyle={styles.heroBackgroundImage} accessibilityRole="image" accessibilityLabel="Deep indigo and lavender abstract learning visual">
          <View style={styles.heroTint} />
          <View style={styles.orbitRing} />
          <Animated.View style={[styles.floatCard, styles.floatCardBack, floatStyle]}><Text style={styles.floatCardLabel}>LEARNING PATH</Text><Text style={[styles.floatCardTitle, styles.floatCardBackTitle]}>Build momentum</Text><Text style={[styles.floatCardMeta, styles.floatCardBackMeta]}>01 · Focused practice</Text></Animated.View>
          <Animated.View style={[styles.floatCard, styles.floatCardFront, floatStyle]}><View style={styles.floatCardTop}><View style={styles.floatBadge}><Text style={styles.floatBadgeText}>L</Text></View><Text style={styles.floatSpark}>✦</Text></View><Text style={styles.floatCardLabel}>TODAY’S WIN</Text><Text style={styles.floatCardTitle}>One idea clearer</Text><Text style={styles.floatCardMeta}>Watch · Check · Remember</Text></Animated.View>
        </ImageBackground>

        <SectionTitle title={progress === 0 ? "Start learning" : "Continue learning"} action={<Pressable onPress={() => router.push("/learning-path")} style={({ pressed }) => pressed && styles.textPressed}><Text style={styles.link}>View path</Text></Pressable>} />
        <Pressable onPress={openNextLesson} disabled={isLaunching} style={({ pressed }) => [styles.resumeCard, pressed && styles.pressed, isLaunching && styles.disabled]} accessibilityRole="button" accessibilityLabel={`Open lesson ${next.shortTitle}`}>
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
      {isLaunching ? <Animated.View style={[styles.launchOverlay, launchOverlayStyle]} accessibilityViewIsModal accessibilityRole="alert"><View style={styles.launchCard}><Image source={{ uri: LEARNVERSE_LOGO_URI }} style={styles.launchLogo} accessibilityLabel="LearnVerse AI logo" /><Text style={styles.launchEyebrow}>NEXT UP</Text><Text style={styles.launchTitle}>{next.shortTitle}</Text><Text style={styles.launchBody}>Opening your focused lesson…</Text><View style={styles.launchRule}><View style={styles.launchRuleFill} /></View></View></Animated.View> : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 24, paddingBottom: 120 },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  greeting: { color: "#172033", fontSize: 32, lineHeight: 37, fontWeight: "800", letterSpacing: -1.1, marginTop: 7 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#E9EEFF", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#255CFF", fontWeight: "900", fontSize: 16 },
  avatarLogo: { width: 30, height: 30, resizeMode: "contain" },
  heroCopy: { color: "#68738B", fontSize: 15, lineHeight: 22, marginTop: 11, marginBottom: 28, maxWidth: "93%" },
  heroVisual: { height: 190, marginTop: -2, marginBottom: 25, borderRadius: 26, backgroundColor: "#111B3D", overflow: "hidden", position: "relative", alignItems: "center", justifyContent: "center" },
  heroBackgroundImage: { borderRadius: 26 },
  heroTint: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(17,27,61,0.24)" },
  orbitRing: { position: "absolute", width: 188, height: 188, borderRadius: 94, borderWidth: 1, borderColor: "#C9D5FF", transform: [{ rotateZ: "18deg" }] },
  floatCard: { position: "absolute", width: 170, minHeight: 104, borderRadius: 18, padding: 13, shadowColor: "#111B3D", shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 5 },
  floatCardBack: { backgroundColor: "#AEBEFF", transform: [{ translateX: -22 }, { translateY: -12 }, { rotateZ: "-8deg" }] },
  floatCardFront: { backgroundColor: "#111B3D", transform: [{ translateX: 18 }, { translateY: 8 }, { rotateZ: "6deg" }] },
  floatCardBackTitle: { color: "#111B3D" },
  floatCardBackMeta: { color: "#255CFF" },
  floatCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 11 },
  floatBadge: { width: 23, height: 23, borderRadius: 8, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  floatBadgeText: { color: "#255CFF", fontSize: 11, fontWeight: "900" },
  floatSpark: { color: "#A9BAFF", fontSize: 18 },
  floatCardLabel: { color: "#D6DDF9", fontSize: 9, fontWeight: "800", letterSpacing: 0.8 },
  floatCardTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "800", marginTop: 5 },
  floatCardMeta: { color: "#D6DDF9", fontSize: 10, marginTop: 6 },
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
  disabled: { opacity: 0.62 },
  launchOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(17,27,61,0.96)", zIndex: 20, alignItems: "center", justifyContent: "center", paddingHorizontal: 28 },
  launchCard: { width: "100%", maxWidth: 330, borderRadius: 26, backgroundColor: "#1D2A5B", borderWidth: 1, borderColor: "#7F95F0", padding: 24, alignItems: "center", shadowColor: "#000000", shadowOpacity: 0.25, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 8 },
  launchLogo: { width: 54, height: 54, resizeMode: "contain", marginBottom: 18 },
  launchEyebrow: { color: "#A9BAFF", fontSize: 11, fontWeight: "800", letterSpacing: 1.2 },
  launchTitle: { color: "#FFFFFF", fontSize: 23, lineHeight: 29, fontWeight: "800", textAlign: "center", marginTop: 7 },
  launchBody: { color: "#D6DDF9", fontSize: 13, marginTop: 7 },
  launchRule: { width: "100%", height: 5, borderRadius: 3, backgroundColor: "#38487D", marginTop: 21, overflow: "hidden" },
  launchRuleFill: { width: "42%", height: "100%", borderRadius: 3, backgroundColor: "#A9BAFF" },
});
