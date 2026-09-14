import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { graphql, useLazyLoadQuery } from "react-relay";

import { DictionaryEntrySummary } from "@/entities/dictionary-entry";
import type { DictionaryListPageQuery } from "./__generated__/DictionaryListPageQuery.graphql";

interface DictionaryListPageProps {
  onSelect: (entryId: string) => void;
}

export function DictionaryListPage({ onSelect }: DictionaryListPageProps) {
  const data = useLazyLoadQuery<DictionaryListPageQuery>(
    graphql`
      query DictionaryListPageQuery {
        dictionaryEntries(first: 50) {
          edges {
            node {
              id
              ...DictionaryEntrySummary_entry
            }
          }
        }
      }
    `,
    {},
  );
  const entries = data.dictionaryEntries.edges;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Dictionary</Text>
      <Text style={styles.count}>전체 {entries.length}개</Text>
      {entries.length === 0 ? (
        <Text style={styles.empty}>사전 데이터가 없습니다.</Text>
      ) : (
        entries.map(({ node }) => (
          <Pressable
            key={node.id}
            onPress={() => onSelect(node.id)}
            style={({ pressed }) => [
              styles.item,
              pressed && styles.itemPressed,
            ]}
          >
            <DictionaryEntrySummary entry={node} />
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  content: {
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 40,
  },
  title: {
    color: "#111827",
    fontSize: 30,
    fontWeight: "700",
  },
  count: {
    marginBottom: 8,
    color: "#6b7280",
    fontSize: 14,
  },
  empty: {
    color: "#6b7280",
    fontSize: 16,
  },
  item: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },
  itemPressed: {
    opacity: 0.6,
  },
});
