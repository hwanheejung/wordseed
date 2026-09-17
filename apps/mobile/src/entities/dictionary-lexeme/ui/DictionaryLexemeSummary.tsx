import { StyleSheet, Text, View } from "react-native";
import { graphql, useFragment } from "react-relay";

import type { DictionaryLexemeSummary_lexeme$key } from "./__generated__/DictionaryLexemeSummary_lexeme.graphql";

interface DictionaryLexemeSummaryProps {
  lexeme: DictionaryLexemeSummary_lexeme$key;
}

export function DictionaryLexemeSummary({
  lexeme: lexemeRef,
}: DictionaryLexemeSummaryProps) {
  const lexeme = useFragment(
    graphql`
      fragment DictionaryLexemeSummary_lexeme on DictionaryLexeme {
        canonicalLemma @required(action: THROW)
        lexicalCategory @required(action: THROW) {
          displayName @required(action: THROW)
        }
        senses @required(action: THROW) {
          id @required(action: THROW)
          glosses @required(action: THROW) {
            languageTag @required(action: THROW)
            text @required(action: THROW)
          }
        }
      }
    `,
    lexemeRef,
  );
  const glosses = lexeme.senses.flatMap((sense) => sense.glosses);
  const preferredGloss =
    glosses.find(({ languageTag }) => languageTag === "ko") ??
    glosses.find(({ languageTag }) => languageTag === "en") ??
    glosses[0];

  return (
    <View style={styles.content}>
      <View style={styles.headingRow}>
        <Text style={styles.lemma}>{lexeme.canonicalLemma}</Text>
        <Text style={styles.category}>
          {lexeme.lexicalCategory.displayName}
        </Text>
      </View>
      <Text style={styles.gloss}>{preferredGloss?.text ?? "뜻 없음"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: 6 },
  headingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  lemma: { color: "#111827", fontSize: 17, fontWeight: "700" },
  category: { color: "#2563eb", fontSize: 12, fontWeight: "600" },
  gloss: { color: "#4b5563", fontSize: 14, lineHeight: 20 },
});
