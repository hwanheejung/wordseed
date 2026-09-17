import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { graphql, useLazyLoadQuery, usePaginationFragment } from "react-relay";
import { Button, Surface, Text } from "@/shared/ui";
import type { LibraryPageQuery } from "./__generated__/LibraryPageQuery.graphql";
import type { LibraryPage_items$key } from "./__generated__/LibraryPage_items.graphql";
import type { LibraryPagePaginationQuery } from "./__generated__/LibraryPagePaginationQuery.graphql";

interface LibraryPageProps { fetchKey?: number; onOpenDetail: (lexemeId: string, senseId: string) => void }

export function LibraryPage({ onOpenDetail, fetchKey }: LibraryPageProps) {
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
      <Text variant="caption" tone="secondary">최근 추가한 순 · {data.mySavedLearningItems.totalCount}개</Text>
      {data.mySavedLearningItems.edges.length === 0 && <Text>아직 저장한 표현이 없어요. Search에서 뜻을 골라 저장해 보세요.</Text>}
      {data.mySavedLearningItems.edges.map((edge) => edge?.node && <Pressable key={edge.node.id} accessibilityRole="button" onPress={() => onOpenDetail(edge.node.lexeme.id, edge.node.sense.id)} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
        <Surface style={styles.row}>
          <View style={styles.rowText}><Text>{edge.node.lexeme.canonicalLemma}</Text><Text tone="secondary">{preferredGloss(edge.node.sense.glosses)}</Text></View>
          <Text tone="secondary">›</Text>
        </Surface>
      </Pressable>)}
      {paginationFailed && <Text accessibilityRole="alert">다음 표현을 불러오지 못했어요. 다시 시도해 주세요.</Text>}
      {hasNext && <Button label={paginationFailed ? "다시 불러오기" : "더 보기"} variant="plain" loading={isLoadingNext} onPress={handleLoadMore} />}
    </ScrollView>
  </Surface>;
}

function preferredGloss(glosses: readonly { languageTag: string; text: string }[]): string {
  return glosses.find((gloss) => gloss.languageTag === "ko")?.text ?? glosses.find((gloss) => gloss.languageTag === "en")?.text ?? glosses[0]?.text ?? "뜻이 없어요";
}
const styles = StyleSheet.create({ page: { flex: 1 }, content: { padding: 20, paddingBottom: 40, gap: 16 }, row: { borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", gap: 12 }, rowText: { flex: 1, gap: 4 } });
