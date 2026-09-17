import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Button, Separator, Surface, Text } from "@/shared/ui";

interface HomePageProps {
  onOpenDetail: (title: string) => void;
}

export function HomePage({ onOpenDetail }: HomePageProps) {
  return (
    <Surface tone="background" style={styles.page}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text variant="heading">Quick Review</Text>
          <Surface style={styles.review}>
            <Text variant="caption" tone="secondary">내가 저장한 표현</Text>
            <Text variant="title">take your time</Text>
            <Text>서두르지 않고 천천히 하다</Text>
            <Separator />
            <Text tone="secondary">“Take your time. There’s no rush.”</Text>
            <Button label="표현 보기" onPress={() => onOpenDetail("take your time")} />
          </Surface>
        </View>
        <View style={styles.section}>
          <Text variant="heading">최근 저장한 표현</Text>
          <Surface style={styles.list}>
            {[
              { expression: "make it happen", meaning: "실현하다" },
              { expression: "a fresh start", meaning: "새로운 시작" },
            ].map((item, index) => (
              <View key={item.expression}>
                {index > 0 && <Separator />}
                <Pressable accessibilityRole="button" onPress={() => onOpenDetail(item.expression)} style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}>
                  <View style={styles.rowText}>
                    <Text>{item.expression}</Text>
                    <Text variant="caption" tone="secondary">{item.meaning}</Text>
                  </View>
                  <Text tone="secondary">›</Text>
                </Pressable>
              </View>
            ))}
          </Surface>
        </View>
        <View style={styles.section}>
          <Text variant="heading">내 단어장</Text>
          <Pressable accessibilityRole="button" onPress={() => onOpenDetail("일상 속 표현")} style={({ pressed }) => [styles.wordbook, { opacity: pressed ? 0.6 : 1 }]}>
            <View style={styles.artwork}><Text style={styles.artworkText}>Everyday</Text></View>
            <Text>일상 속 표현</Text>
            <Text variant="caption" tone="secondary">3개 표현</Text>
          </Pressable>
        </View>
        <Text variant="caption" tone="secondary" style={styles.notice}>미리보기 · 샘플 콘텐츠</Text>
      </ScrollView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { paddingTop: 12, paddingBottom: 32, gap: 28 },
  section: { paddingHorizontal: 20, gap: 14 },
  review: { padding: 22, borderRadius: 20, gap: 16 },
  list: { borderRadius: 16, overflow: "hidden" },
  row: { minHeight: 76, padding: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  rowText: { flex: 1, gap: 4 },
  wordbook: { width: "48%", gap: 5 },
  artwork: { aspectRatio: 1, borderRadius: 14, backgroundColor: "#235A4B", alignItems: "center", justifyContent: "center", marginBottom: 6 },
  artworkText: { color: "#FFFFFF", fontSize: 22, fontWeight: "700" },
  notice: { paddingHorizontal: 20 },
});
