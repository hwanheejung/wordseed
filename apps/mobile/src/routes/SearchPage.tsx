import { useNavigation } from "@react-navigation/native";
import { startTransition, useLayoutEffect, useState } from "react";
import type { NativeStackNavigationOptions, NativeStackScreenProps } from "@react-navigation/native-stack";
import { Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { graphql, useLazyLoadQuery, usePaginationFragment } from "react-relay";
import type { SearchStackParams } from "@/shared/navigation";
import { QueryBoundary } from "@/shared/relay";
import { Button, Surface, Text, useUITheme } from "@/shared/ui";
import type { SearchPageQuery } from "@/__generated__/SearchPageQuery.graphql";
import type { SearchPage_lexemes$key } from "@/__generated__/SearchPage_lexemes.graphql";
import type { SearchPagePaginationQuery } from "@/__generated__/SearchPagePaginationQuery.graphql";

export const searchPageOptions = {
  title: "Search",
  headerLargeTitle: true,
} satisfies NativeStackNavigationOptions;

type SearchPageProps = NativeStackScreenProps<SearchStackParams, "SearchOverview">;

export function SearchPage() {
  const navigation = useNavigation<SearchPageProps["navigation"]>();
  return (
    <QueryBoundary>
      {(fetchKey) => <SearchContent navigation={navigation} fetchKey={fetchKey} />}
    </QueryBoundary>
  );
}

interface SearchContentProps {
  navigation: SearchPageProps["navigation"];
  fetchKey: number;
}

function SearchContent({ navigation, fetchKey }: SearchContentProps) {
  const [search, setSearch] = useState("");
  const query = useLazyLoadQuery<SearchPageQuery>(graphql`
    query SearchPageQuery($query: String!) { ...SearchPage_lexemes @arguments(query: $query) }
  `, { query: search }, { fetchKey });
  const { data, loadNext, hasNext, isLoadingNext } = usePaginationFragment<SearchPagePaginationQuery, SearchPage_lexemes$key>(graphql`
    fragment SearchPage_lexemes on Query
    @argumentDefinitions(query: { type: "String!" }, count: { type: "Int", defaultValue: 20 }, cursor: { type: "String" })
    @refetchable(queryName: "SearchPagePaginationQuery") {
      dictionaryLexemes(languageTag: "en", query: $query, first: $count, after: $cursor) @connection(key: "SearchPage_dictionaryLexemes", filters: ["languageTag", "query"]) {
        totalCount
        edges { node { id canonicalLemma lexicalCategory { displayName } senses { glosses { languageTag text } } } }
      }
    }
  `, query);
  const { colors } = useUITheme();
  const [draft, setDraft] = useState("");
  const [paginationFailed, setPaginationFailed] = useState(false);

  function handleSearch() {
    setPaginationFailed(false);
    startTransition(() => setSearch(draft.trim()));
  }
  function handleLoadMore() {
    setPaginationFailed(false);
    loadNext(20, { onComplete: (error) => setPaginationFailed(error != null) });
  }

  // Synchronize the iOS navigation search bar with submitted Dictionary searches.
  useLayoutEffect(() => {
    if (Platform.OS !== "ios") return;
    navigation.setOptions({ headerSearchBarOptions: {
      placeholder: "Search English words or expressions", autoCapitalize: "none", hideWhenScrolling: false,
      onSearchButtonPress: (event) => {
        setPaginationFailed(false);
        startTransition(() => setSearch(event.nativeEvent.text.trim()));
      },
      onCancelButtonPress: () => { setPaginationFailed(false); startTransition(() => setSearch("")); },
    } } satisfies NativeStackNavigationOptions);
  }, [navigation]);

  return <Surface tone="background" style={styles.page}>
    <ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={styles.content}>
      {Platform.OS !== "ios" && <View style={styles.search}>
        <TextInput accessibilityLabel="Search English words or expressions" placeholder="Search English words or expressions" placeholderTextColor={colors.secondaryText} value={draft} onChangeText={setDraft} onSubmitEditing={handleSearch} autoCapitalize="none" autoCorrect={false} returnKeyType="search" style={[styles.input, { color: colors.text, backgroundColor: colors.surface }]} />
        <Button label="Search" variant="plain" onPress={handleSearch} />
      </View>}
      <Text variant="caption" tone="secondary">{search ? `Results for “${search}”` : "Browse dictionary"} · {data.dictionaryLexemes.totalCount}</Text>
      {data.dictionaryLexemes.edges.length === 0 && <Text>No results. Try another word or expression.</Text>}
      {data.dictionaryLexemes.edges.map((edge) => edge?.node && <Pressable key={edge.node.id} accessibilityRole="button" onPress={() => navigation.navigate("DictionaryDetail", { lexemeId: edge.node.id })} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
        <Surface style={styles.row}>
          <View style={styles.rowText}><Text>{edge.node.canonicalLemma}</Text><Text variant="caption" tone="secondary">{edge.node.lexicalCategory.displayName}</Text><Text tone="secondary">{preferredGloss(edge.node.senses.flatMap((sense) => sense.glosses))}</Text></View>
          <Text tone="secondary">›</Text>
        </Surface>
      </Pressable>)}
      {paginationFailed && <Text accessibilityRole="alert">Couldn’t load more results. Try again.</Text>}
      {hasNext && <Button label={paginationFailed ? "Try again" : "Show more"} variant="plain" loading={isLoadingNext} onPress={handleLoadMore} />}
    </ScrollView>
  </Surface>;
}

function preferredGloss(glosses: readonly { languageTag: string; text: string }[]): string {
  return glosses.find((gloss) => gloss.languageTag === "ko")?.text ?? glosses.find((gloss) => gloss.languageTag === "en")?.text ?? glosses[0]?.text ?? "No definition available";
}
const styles = StyleSheet.create({ page: { flex: 1 }, content: { padding: 20, paddingBottom: 40, gap: 16 }, search: { gap: 8 }, input: { minHeight: 52, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 17 }, row: { borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", gap: 12 }, rowText: { flex: 1, gap: 4 } });
