import { useState } from "react";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationOptions, NativeStackScreenProps } from "@react-navigation/native-stack";
import type { LibraryStackParams } from "@/shared/navigation";
import { QueryBoundary } from "@/shared/relay";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { graphql, useLazyLoadQuery, usePaginationFragment } from "react-relay";
import { Button, Surface, Text } from "@/shared/ui";
import type { LibraryPageQuery } from "./__generated__/LibraryPageQuery.graphql";
import type { LibraryPage_items$key } from "./__generated__/LibraryPage_items.graphql";
import type { LibraryPagePaginationQuery } from "./__generated__/LibraryPagePaginationQuery.graphql";

export const libraryPageOptions = {
  title: "Library",
  headerLargeTitle: true,
} satisfies NativeStackNavigationOptions;

type LibraryPageProps = NativeStackScreenProps<LibraryStackParams, "LibraryOverview">;

export function LibraryPage() {
  const navigation = useNavigation<LibraryPageProps["navigation"]>();
  const focused = useIsFocused();

  return (
    <QueryBoundary active={focused}>
      {(fetchKey) => (
        <LibraryContent
          fetchKey={fetchKey}
          onOpenDetail={(lexemeId, senseId) => navigation.navigate("DictionaryDetail", { lexemeId, senseId })}
        />
      )}
    </QueryBoundary>
  );
}

interface LibraryContentProps {
  fetchKey: number;
  onOpenDetail: (lexemeId: string, senseId: string) => void;
}

function LibraryContent({ onOpenDetail, fetchKey }: LibraryContentProps) {
  const query = useLazyLoadQuery<LibraryPageQuery>(graphql`
    query LibraryPageQuery { ...LibraryPage_items }
  `, {}, { fetchPolicy: "store-or-network", fetchKey });
  const { data, loadNext, hasNext, isLoadingNext } = usePaginationFragment<LibraryPagePaginationQuery, LibraryPage_items$key>(graphql`
    fragment LibraryPage_items on Query
    @argumentDefinitions(count: { type: "Int", defaultValue: 20 }, cursor: { type: "String" })
    @refetchable(queryName: "LibraryPagePaginationQuery") {
      mySavedLearningItems(first: $count, after: $cursor) @connection(key: "LibraryPage_mySavedLearningItems") {
        totalCount
        edges { node { id lexeme { id canonicalLemma } sense { id glosses { languageTag text } } } }
      }
    }
  `, query);
  const [paginationFailed, setPaginationFailed] = useState(false);

  function handleLoadMore() {
    setPaginationFailed(false);
    loadNext(20, { onComplete: (error) => setPaginationFailed(error != null) });
  }

  return <Surface tone="background" style={styles.page}>
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <Text variant="caption" tone="secondary">Recently added · {data.mySavedLearningItems.totalCount}</Text>
      {data.mySavedLearningItems.edges.length === 0 && <Text>No saved expressions yet. Find a meaning in Search to save.</Text>}
      {data.mySavedLearningItems.edges.map((edge) => edge?.node && <Pressable key={edge.node.id} accessibilityRole="button" onPress={() => onOpenDetail(edge.node.lexeme.id, edge.node.sense.id)} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
        <Surface style={styles.row}>
          <View style={styles.rowText}><Text>{edge.node.lexeme.canonicalLemma}</Text><Text tone="secondary">{preferredGloss(edge.node.sense.glosses)}</Text></View>
          <Text tone="secondary">›</Text>
        </Surface>
      </Pressable>)}
      {paginationFailed && <Text accessibilityRole="alert">Couldn’t load more expressions. Try again.</Text>}
      {hasNext && <Button label={paginationFailed ? "Try again" : "Show more"} variant="plain" loading={isLoadingNext} onPress={handleLoadMore} />}
    </ScrollView>
  </Surface>;
}

function preferredGloss(glosses: readonly { languageTag: string; text: string }[]): string {
  return glosses.find((gloss) => gloss.languageTag === "ko")?.text ?? glosses.find((gloss) => gloss.languageTag === "en")?.text ?? glosses[0]?.text ?? "No definition available";
}
const styles = StyleSheet.create({ page: { flex: 1 }, content: { padding: 20, paddingBottom: 40, gap: 16 }, row: { borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", gap: 12 }, rowText: { flex: 1, gap: 4 } });
