import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Eyebrow } from "@/components/learnverse-ui";
import { catalog, formatDuration } from "@/lib/learning/catalog";
import { semanticMatch } from "@/lib/learning/search";

const filters = ["All", "Courses", "Lessons", "Beginner"];

export default function DiscoverScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return catalog.flatMap((course) => {
              const courseMatch = semanticMatch(normalized, [course.title, course.subject, ...course.skills]);
        const lessonMatches = course.lessons.filter((lesson) => semanticMatch(normalized, [lesson.title, ...lesson.concepts, lesson.description]));

      const showCourse = (activeFilter === "All" || activeFilter === "Courses" || activeFilter === "Beginner") && (courseMatch || normalized.length === 0);
      const showLessons = (activeFilter === "All" || activeFilter === "Lessons" || activeFilter === "Beginner") && (lessonMatches.length > 0 || normalized.length === 0);
      const items: { id: string; kind: "Course" | "Lesson"; title: string; detail: string }[] = [];
      if (showCourse) items.push({ id: course.id, kind: "Course", title: course.title, detail: `${course.level} · ${course.totalDurationMinutes} min · ${course.instructor}` });
      if (showLessons) lessonMatches.concat(normalized.length === 0 ? course.lessons.filter((lesson) => !lessonMatches.includes(lesson)) : []).forEach((lesson) => {
        items.push({ id: lesson.id, kind: "Lesson", title: lesson.shortTitle, detail: `${formatDuration(lesson.durationSeconds)} · ${lesson.concepts.slice(0, 2).join(" · ")}` });
      });
      return items;
    });
  }, [activeFilter, query]);

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View>
            <Eyebrow>Explore</Eyebrow>
            <Text style={styles.title}>Find your next concept</Text>
            <Text style={styles.subtitle}>Search learning materials by topic, skill, or question.</Text>
            <View style={styles.searchBox}>
              <Text style={styles.searchMark}>⌕</Text>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Try “variables” or “functions”"
                placeholderTextColor="#8791A6"
                style={styles.searchInput}
                returnKeyType="search"
                accessibilityLabel="Search learning materials"
              />
            </View>
            <View style={styles.filterRow}>
              {filters.map((filter) => (
                <Pressable key={filter} onPress={() => setActiveFilter(filter)} style={({ pressed }) => [styles.filter, activeFilter === filter && styles.filterActive, pressed && styles.pressed]}>
                  <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>{filter}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.resultLabel}>{results.length} learning result{results.length === 1 ? "" : "s"}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => item.kind === "Lesson" ? router.push({ pathname: "/lesson/[id]", params: { id: item.id } }) : router.push("/learning-path")} style={({ pressed }) => [styles.resultCard, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel={`Open ${item.title}`}>
            <View style={[styles.kindMark, item.kind === "Course" ? styles.courseMark : styles.lessonMark]}>
              <Text style={styles.kindMarkText}>{item.kind === "Course" ? "C" : "L"}</Text>
            </View>
            <View style={styles.resultBody}>
              <Text style={styles.kindText}>{item.kind}</Text>
              <Text style={styles.resultTitle}>{item.title}</Text>
              <Text style={styles.resultDetail}>{item.detail}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        )}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyTitle}>No materials found</Text><Text style={styles.emptyBody}>Try a broader concept or choose a different filter.</Text></View>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 24, paddingBottom: 116, gap: 12 },
  title: { color: "#172033", fontSize: 30, lineHeight: 36, fontWeight: "800", letterSpacing: -0.9, marginTop: 6 },
  subtitle: { color: "#68738B", fontSize: 15, lineHeight: 22, marginTop: 7, marginBottom: 20 },
  searchBox: { height: 54, borderRadius: 16, borderWidth: 1, borderColor: "#DDE4F0", backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", paddingHorizontal: 15 },
  searchMark: { color: "#255CFF", fontSize: 27, lineHeight: 28, marginRight: 9, marginTop: -5 },
  searchInput: { flex: 1, color: "#172033", fontSize: 15, minHeight: 44 },
  filterRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 14, marginBottom: 22 },
  filter: { borderWidth: 1, borderColor: "#DDE4F0", backgroundColor: "#FFFFFF", paddingHorizontal: 13, paddingVertical: 9, borderRadius: 99 },
  filterActive: { borderColor: "#255CFF", backgroundColor: "#E9EEFF" },
  filterText: { color: "#546077", fontSize: 13, fontWeight: "700" },
  filterTextActive: { color: "#255CFF" },
  resultLabel: { color: "#68738B", fontSize: 13, fontWeight: "600", marginBottom: 2 },
  resultCard: { backgroundColor: "#FFFFFF", minHeight: 100, borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "#E6EAF2", flexDirection: "row", alignItems: "center", gap: 12 },
  kindMark: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 14 },
  courseMark: { backgroundColor: "#E9EEFF" },
  lessonMark: { backgroundColor: "#E8F8F0" },
  kindMarkText: { color: "#255CFF", fontSize: 16, fontWeight: "800" },
  resultBody: { flex: 1, gap: 3 },
  kindText: { color: "#68738B", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.7 },
  resultTitle: { color: "#172033", fontSize: 16, fontWeight: "800" },
  resultDetail: { color: "#68738B", fontSize: 12, lineHeight: 17 },
  arrow: { color: "#255CFF", fontSize: 28, fontWeight: "300" },
  empty: { alignItems: "center", paddingVertical: 48, paddingHorizontal: 32 },
  emptyTitle: { color: "#172033", fontSize: 18, fontWeight: "800" },
  emptyBody: { color: "#68738B", fontSize: 14, textAlign: "center", lineHeight: 20, marginTop: 7 },
  pressed: { opacity: 0.68, transform: [{ scale: 0.985 }] },
});
