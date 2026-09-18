import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationOptions, NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSession } from "@/entities/session";
import { UserAvatarButton } from "@/entities/user";
import type { AppStackParams, HomeStackParams } from "@/shared/navigation";
import { Button, Separator, Surface, Text } from "@/shared/ui";

export const homePageOptions = {
  title: "Home",
  headerLargeTitle: true,
  headerRight: () => <HomeAccountButton />,
} satisfies NativeStackNavigationOptions;

type HomePageProps = NativeStackScreenProps<HomeStackParams, "HomeOverview">;

export function HomePage() {
  const navigation = useNavigation<HomePageProps["navigation"]>();
  function handleOpenDetail(title: string) {
    navigation.navigate("Detail", { title });
  }

  return (
    <Surface tone="background" style={styles.page}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text variant="heading">Quick Review</Text>
          <Surface style={styles.review}>
            <Text variant="caption" tone="secondary">Saved expression</Text>
            <Text variant="title">take your time</Text>
            <Text>서두르지 않고 천천히 하다</Text>
            <Separator />
            <Text tone="secondary">“Take your time. There’s no rush.”</Text>
            <Button label="View expression" onPress={() => handleOpenDetail("take your time")} />
          </Surface>
        </View>
        <View style={styles.section}>
          <Text variant="heading">Recently added</Text>
          <Surface style={styles.list}>
            {[
              { expression: "make it happen", meaning: "실현하다" },
              { expression: "a fresh start", meaning: "새로운 시작" },
            ].map((item, index) => (
              <View key={item.expression}>
                {index > 0 && <Separator />}
                <Pressable accessibilityRole="button" onPress={() => handleOpenDetail(item.expression)} style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}>
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
          <Text variant="heading">My wordbooks</Text>
          <Pressable accessibilityRole="button" onPress={() => handleOpenDetail("Everyday expressions")} style={({ pressed }) => [styles.wordbook, { opacity: pressed ? 0.6 : 1 }]}>
            <View style={styles.artwork}><Text style={styles.artworkText}>Everyday</Text></View>
            <Text>Everyday expressions</Text>
            <Text variant="caption" tone="secondary">3 expressions</Text>
          </Pressable>
        </View>
        <Text variant="caption" tone="secondary" style={styles.notice}>Preview · Sample content</Text>
      </ScrollView>
    </Surface>
  );
}

function HomeAccountButton() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParams>>();
  const { user } = useSession();

  return <UserAvatarButton user={user} accessibilityLabel="Account" onPress={() => navigation.navigate("Account")} />;
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
