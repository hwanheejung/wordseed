import { useLayoutEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { Separator, Surface, Text, useUITheme } from "@/shared/ui";

const expressions = [
  { expression: "take your time", meaning: "서두르지 않고 천천히 하다" },
  { expression: "make it happen", meaning: "실현하다" },
  { expression: "a fresh start", meaning: "새로운 시작" },
];

interface SearchPageProps {
  onOpenDetail: (title: string) => void;
}

export function SearchPage({ onOpenDetail }: SearchPageProps) {
  const { colors } = useUITheme();
  const navigation = useNavigation();
  const [query, setQuery] = useState("");
  const searchText = query.trim().toLowerCase();
  const results = searchText === "" ? [] : expressions.filter((item) =>
    item.expression.toLowerCase().includes(searchText) || item.meaning.includes(searchText),
  );

  // Connect the native navigation search bar to this screen's query state.
  useLayoutEffect(() => {
    if (Platform.OS !== "ios") return;
    navigation.setOptions({
      headerSearchBarOptions: {
        placeholder: "단어 또는 표현 검색",
        autoCapitalize: "none",
        hideWhenScrolling: false,
        placement: "automatic",
        onChangeText: (event) => setQuery(event.nativeEvent.text),
        onCancelButtonPress: () => setQuery(""),
      },
    } satisfies NativeStackNavigationOptions);
  }, [navigation]);

  return (
    <Surface tone="background" style={styles.page}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={styles.content}>
        <View style={styles.section}>
          {Platform.OS !== "ios" && (
            <TextInput accessibilityLabel="Dictionary 검색" placeholder="단어 또는 표현 검색" placeholderTextColor={colors.secondaryText} value={query} onChangeText={setQuery} autoCapitalize="none" autoCorrect={false} returnKeyType="search" style={[styles.input, { color: colors.text, backgroundColor: colors.surface }]} />
          )}
          {results.length > 0 && (
          <Surface style={styles.list}>
            {results.map((item, index) => (
              <View key={item.expression}>
                {index > 0 && <Separator />}
                <Pressable accessibilityRole="button" onPress={() => onOpenDetail(item.expression)} style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}>
                  <View style={styles.rowText}><Text>{item.expression}</Text><Text variant="caption" tone="secondary">{item.meaning}</Text></View>
                  <Text tone="secondary">›</Text>
                </Pressable>
              </View>
            ))}
          </Surface>
          )}
        </View>
      </ScrollView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { paddingTop: 12, paddingBottom: 32 },
  section: { paddingHorizontal: 20, gap: 18 },
  input: { minHeight: 52, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 17 },
  list: { borderRadius: 16, overflow: "hidden" },
  row: { minHeight: 82, padding: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  rowText: { flex: 1, gap: 4 },
});
