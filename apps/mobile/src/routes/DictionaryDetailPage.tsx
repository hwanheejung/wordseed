import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { graphql, useLazyLoadQuery } from "react-relay";

import {
  DictionaryLexemeDetail,
} from "@/entities/dictionary-lexeme";
import type { DictionaryDetailPageQuery } from "./__generated__/DictionaryDetailPageQuery.graphql";

interface DictionaryDetailPageProps {
  lexemeId: string;
  onBack: () => void;
  onSelectRecommendation: (lexemeId: string) => void;
}

export function DictionaryDetailPage({
  lexemeId,
  onBack,
  onSelectRecommendation,
}: DictionaryDetailPageProps) {
  const data = useLazyLoadQuery<DictionaryDetailPageQuery>(
    graphql`
      query DictionaryDetailPageQuery($lexemeId: ID!) {
        dictionaryLexeme(id: $lexemeId) {
          ...DictionaryLexemeDetail_lexeme
        }
      }
    `,
    { lexemeId },
  );
  const selectedLexeme = data.dictionaryLexeme;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
    >
      <Pressable onPress={onBack} style={styles.backButton}>
        <Text style={styles.backLabel}>← 목록으로</Text>
      </Pressable>

      {selectedLexeme === null || selectedLexeme === undefined ? (
        <Text style={styles.empty}>해당 표현을 찾을 수 없습니다.</Text>
      ) : (
        <DictionaryLexemeDetail
          lexeme={selectedLexeme}
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
