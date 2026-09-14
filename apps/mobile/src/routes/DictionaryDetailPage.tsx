import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { graphql, useLazyLoadQuery } from "react-relay";

import {
  DictionaryEntryDetail,
} from "@/entities/dictionary-entry";
import type { DictionaryDetailPageQuery } from "./__generated__/DictionaryDetailPageQuery.graphql";

interface DictionaryDetailPageProps {
  entryId: string;
  onBack: () => void;
  onSelectRecommendation: (entryId: string) => void;
}

export function DictionaryDetailPage({
  entryId,
  onBack,
  onSelectRecommendation,
}: DictionaryDetailPageProps) {
  const data = useLazyLoadQuery<DictionaryDetailPageQuery>(
    graphql`
      query DictionaryDetailPageQuery($entryId: ID!) {
        dictionaryEntry(id: $entryId) {
          ...DictionaryEntryDetail_entry
        }
      }
    `,
    { entryId },
  );
  const selectedEntry = data.dictionaryEntry;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
    >
      <Pressable onPress={onBack} style={styles.backButton}>
        <Text style={styles.backLabel}>← 목록으로</Text>
      </Pressable>

      {selectedEntry === null || selectedEntry === undefined ? (
        <Text style={styles.empty}>해당 표현을 찾을 수 없습니다.</Text>
      ) : (
        <DictionaryEntryDetail
          entry={selectedEntry}
          onSelectRecommendation={onSelectRecommendation}
        />
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
    gap: 24,
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
  },
  backLabel: {
    color: "#2563eb",
    fontSize: 16,
    fontWeight: "600",
  },
  empty: {
    color: "#6b7280",
    fontSize: 16,
  },
});
