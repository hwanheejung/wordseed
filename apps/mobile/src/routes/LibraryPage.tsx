import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Button, Separator, Surface, Text, useUITheme } from "@/shared/ui";

interface LibraryPageProps {
  onOpenDetail: (title: string) => void;
}

export function LibraryPage({ onOpenDetail }: LibraryPageProps) {
  const { colors } = useUITheme();
  const [section, setSection] = useState<"expressions" | "wordbooks">("expressions");

  return (
    <Surface tone="background" style={styles.page}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <View style={styles.tabs}>
            {[
              { value: "expressions", label: "표현" },
              { value: "wordbooks", label: "단어장" },
            ].map((item) => (
              <Pressable key={item.value} accessibilityRole="tab" accessibilityState={{ selected: section === item.value }} onPress={() => setSection(item.value === "expressions" ? "expressions" : "wordbooks")} style={[styles.tab, { backgroundColor: section === item.value ? colors.surface : "transparent" }]}>
                <Text>{item.label}</Text>
              </Pressable>
            ))}
          </View>
          {section === "expressions" ? (
            <>
              <View style={styles.toolbar}><Text variant="caption" tone="secondary">최근 추가한 순</Text><Button variant="plain" label="정렬" disabled /></View>
              <Surface style={styles.list}>
                {[
                  { expression: "make it happen", meaning: "실현하다" },
                  { expression: "a fresh start", meaning: "새로운 시작" },
                  { expression: "take your time", meaning: "서두르지 않고 천천히 하다" },
                ].map((item, index) => (
                  <View key={item.expression}>
                    {index > 0 && <Separator />}
                    <Pressable accessibilityRole="button" onPress={() => onOpenDetail(item.expression)} style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}>
                      <View style={styles.rowText}><Text>{item.expression}</Text><Text variant="caption" tone="secondary">{item.meaning}</Text></View>
                      <Text tone="secondary">›</Text>
                    </Pressable>
                  </View>
                ))}
              </Surface>
            </>
          ) : (
            <>
              <View style={styles.toolbar}><Text variant="caption" tone="secondary">내 단어장</Text><Button variant="plain" label="새 단어장" disabled /></View>
              <Pressable accessibilityRole="button" onPress={() => onOpenDetail("일상 속 표현")} style={({ pressed }) => [styles.wordbook, { opacity: pressed ? 0.6 : 1 }]}>
                <View style={styles.artwork}><Text style={styles.artworkText}>Everyday</Text></View>
                <Text>일상 속 표현</Text><Text variant="caption" tone="secondary">3개 표현</Text>
              </Pressable>
            </>
          )}
          <Text variant="caption" tone="secondary">미리보기 · 샘플 콘텐츠</Text>
        </View>
      </ScrollView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { paddingTop: 12, paddingBottom: 32 },
  section: { paddingHorizontal: 20, gap: 16 },
  tabs: { flexDirection: "row", gap: 4 },
  tab: { flex: 1, minHeight: 48, alignItems: "center", justifyContent: "center", borderRadius: 12 },
  toolbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  list: { borderRadius: 16, overflow: "hidden" },
  row: { minHeight: 80, padding: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  rowText: { flex: 1, gap: 4 },
  wordbook: { width: "48%", gap: 5 },
  artwork: { aspectRatio: 1, borderRadius: 14, backgroundColor: "#235A4B", alignItems: "center", justifyContent: "center", marginBottom: 6 },
  artworkText: { color: "#FFFFFF", fontSize: 22, fontWeight: "700" },
});
