import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Button, Separator, Surface, Text } from "@/shared/ui";

const expressions = [
  { expression: "take your time", meaning: "서두르지 않고 천천히 하다", example: "Take your time. There’s no rush.", translation: "천천히 해도 돼. 서두를 필요 없어." },
  { expression: "make it happen", meaning: "실현하다", example: "We have a plan. Let’s make it happen.", translation: "계획이 있으니, 실현해 보자." },
  { expression: "a fresh start", meaning: "새로운 시작", example: "Moving to a new city felt like a fresh start.", translation: "새 도시로 이사하는 건 새로운 시작처럼 느껴졌어." },
];

interface PreviewDetailPageProps {
  title: string;
  onOpenDetail: (title: string) => void;
}

export function PreviewDetailPage({ title, onOpenDetail }: PreviewDetailPageProps) {
  const expression = expressions.find((item) => item.expression === title);

  return (
    <Surface tone="background" style={styles.page}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        <View style={styles.section}>
          {expression ? (
            <>
              <Surface style={styles.card}>
                <Text variant="caption" tone="secondary">표현</Text>
                <Text variant="title">{expression.expression}</Text>
                <Text variant="heading">{expression.meaning}</Text>
                <Separator />
                <Text variant="caption" tone="secondary">예문</Text>
                <Text>{expression.example}</Text>
                <Text tone="secondary">{expression.translation}</Text>
              </Surface>
              <Button label="Library에 저장" disabled />
              <Button label="Master" variant="plain" disabled />
              <Button label="문제 신고" variant="plain" disabled />
            </>
          ) : (
            <>
              <View style={styles.artwork}><Text style={styles.artworkText}>Everyday</Text></View>
              <Text variant="heading">{title}</Text>
              <Text tone="secondary">매일 쓰고 싶은 표현들 · 3개 표현</Text>
              <Surface style={styles.card}>
                {expressions.map((item) => (
                  <Pressable key={item.expression} accessibilityRole="button" onPress={() => onOpenDetail(item.expression)} style={({ pressed }) => [styles.expression, { opacity: pressed ? 0.6 : 1 }]}>
                    <Text>{item.expression}</Text>
                    <Text variant="caption" tone="secondary">{item.meaning}</Text>
                  </Pressable>
                ))}
              </Surface>
              <Button label="표현 추가" disabled />
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
  content: { paddingTop: 16, paddingBottom: 32 },
  section: { paddingHorizontal: 20, gap: 16 },
  card: { padding: 22, borderRadius: 20, gap: 18 },
  expression: { gap: 4, minHeight: 48, justifyContent: "center" },
  artwork: { width: "70%", aspectRatio: 1, alignSelf: "center", borderRadius: 20, backgroundColor: "#235A4B", alignItems: "center", justifyContent: "center", marginBottom: 8 },
  artworkText: { color: "#FFFFFF", fontSize: 32, fontWeight: "700" },
});
