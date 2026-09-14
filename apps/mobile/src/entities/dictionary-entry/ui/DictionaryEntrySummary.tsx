import { StyleSheet, Text, View } from "react-native";
import { graphql, useFragment } from "react-relay";

import type { DictionaryEntrySummary_entry$key } from "./__generated__/DictionaryEntrySummary_entry.graphql";

interface DictionaryEntrySummaryProps {
  entry: DictionaryEntrySummary_entry$key;
}

export function DictionaryEntrySummary({
  entry: entryRef,
}: DictionaryEntrySummaryProps) {
  const entry = useFragment(
    graphql`
      fragment DictionaryEntrySummary_entry on DictionaryEntry {
        headword @required(action: THROW)
        kind @required(action: THROW)
        senses @required(action: THROW) {
          synset @required(action: THROW) {
            definitions @required(action: THROW) {
              languageTag @required(action: THROW)
              text @required(action: THROW)
            }
          }
        }
      }
    `,
    entryRef,
  );
  const koreanDefinition = entry.senses
    .flatMap((sense) => sense.synset.definitions)
    .find((definition) => definition.languageTag === "ko");

  return (
    <View style={styles.content}>
      <View style={styles.headingRow}>
        <Text style={styles.headword}>{entry.headword}</Text>
        <Text style={styles.kind}>
          {entry.kind === "EXPRESSION" ? "표현" : "단어"}
        </Text>
      </View>
      <Text style={styles.definition}>
        {koreanDefinition?.text ?? "한국어 뜻 없음"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 6,
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headword: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "700",
  },
  definition: {
    color: "#4b5563",
    fontSize: 14,
    lineHeight: 20,
  },
  kind: {
    color: "#2563eb",
    fontSize: 12,
    fontWeight: "600",
  },
});
