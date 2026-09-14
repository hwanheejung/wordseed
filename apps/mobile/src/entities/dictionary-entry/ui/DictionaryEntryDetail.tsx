import { Pressable, StyleSheet, Text, View } from "react-native";
import { graphql, useFragment } from "react-relay";

import type { DictionaryEntryDetail_entry$key } from "./__generated__/DictionaryEntryDetail_entry.graphql";

interface DictionaryEntryDetailProps {
  entry: DictionaryEntryDetail_entry$key;
  onSelectRecommendation: (entryId: string) => void;
}

export function DictionaryEntryDetail({
  entry: entryRef,
  onSelectRecommendation,
}: DictionaryEntryDetailProps) {
  const entry = useFragment(
    graphql`
      fragment DictionaryEntryDetail_entry on DictionaryEntry {
        headword @required(action: THROW)
        languageTag @required(action: THROW)
        kind @required(action: THROW)
        senses @required(action: THROW) {
          id @required(action: THROW)
          commonnessScore
          synset @required(action: THROW) {
            partOfSpeech
            definitions @required(action: THROW) {
              id @required(action: THROW)
              languageTag @required(action: THROW)
              text @required(action: THROW)
            }
            examples @required(action: THROW) {
              id @required(action: THROW)
              sourceLanguageTag @required(action: THROW)
              sourceText @required(action: THROW)
              translations @required(action: THROW) {
                id @required(action: THROW)
                languageTag @required(action: THROW)
                text @required(action: THROW)
              }
            }
          }
          narratives @required(action: THROW) {
            id @required(action: THROW)
            kind @required(action: THROW)
            languageTag @required(action: THROW)
            markdown @required(action: THROW)
          }
          examples @required(action: THROW) {
            id @required(action: THROW)
            sourceLanguageTag @required(action: THROW)
            sourceText @required(action: THROW)
            translations @required(action: THROW) {
              id @required(action: THROW)
              languageTag @required(action: THROW)
              text @required(action: THROW)
            }
          }
          forms @required(action: THROW) {
            id @required(action: THROW)
            kind @required(action: THROW)
            surface @required(action: THROW)
          }
          recommendations(first: 3) @required(action: THROW) {
            reason @required(action: THROW)
            targetEntry @required(action: THROW) {
              id @required(action: THROW)
              headword @required(action: THROW)
              kind @required(action: THROW)
            }
            targetSense @required(action: THROW) {
              id @required(action: THROW)
              synset @required(action: THROW) {
                definitions @required(action: THROW) {
                  id @required(action: THROW)
                  languageTag @required(action: THROW)
                  text @required(action: THROW)
                }
              }
            }
          }
        }
      }
    `,
    entryRef,
  );

  return (
    <View style={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headword}>{entry.headword}</Text>
        <Text style={styles.meta}>
        {entry.kind} · {entry.languageTag}
        </Text>
      </View>

      {entry.senses.map((sense, senseIndex) => (
        <View key={sense.id} style={styles.senseCard}>
          <Text style={styles.senseTitle}>의미 {senseIndex + 1}</Text>
          <Text style={styles.meta}>
            품사 {sense.synset.partOfSpeech ?? "없음"} · 빈도{" "}
            {sense.commonnessScore ?? "없음"}
          </Text>

          {sense.synset.definitions.map((definition) => (
            <View key={definition.id} style={styles.block}>
              <Text style={styles.label}>뜻 · {definition.languageTag}</Text>
              <Text style={styles.body}>{definition.text}</Text>
            </View>
          ))}

          {sense.narratives.map((narrative) => (
            <View key={narrative.id} style={styles.highlightBlock}>
              <Text style={styles.label}>
                {narrative.kind} · {narrative.languageTag}
              </Text>
              <Text style={styles.body}>{narrative.markdown}</Text>
            </View>
          ))}

          {[...sense.synset.examples, ...sense.examples].map(
            (example, exampleIndex) => (
              <View
                key={`${example.id}-${exampleIndex}`}
                style={styles.block}
              >
                <Text style={styles.label}>
                  예문 · {example.sourceLanguageTag}
                </Text>
                <Text style={styles.body}>{example.sourceText}</Text>
                {example.translations.map((translation) => (
                  <Text key={translation.id} style={styles.translation}>
                    {translation.languageTag} · {translation.text}
                  </Text>
                ))}
              </View>
            ),
          )}

          {sense.forms.length > 0 ? (
            <View style={styles.block}>
              <Text style={styles.label}>활용형</Text>
              {sense.forms.map((form) => (
                <Text key={form.id} style={styles.body}>
                  {form.kind} · {form.surface}
                </Text>
              ))}
            </View>
          ) : null}

          {sense.recommendations.length > 0 ? (
            <View style={styles.recommendations}>
              <Text style={styles.recommendationHeading}>
                이 의미와 관련된 단어·표현
              </Text>
              {sense.recommendations.map((recommendation) => (
                <Pressable
                  key={recommendation.targetSense.id}
                  accessibilityRole="button"
                  onPress={() =>
                    onSelectRecommendation(recommendation.targetEntry.id)
                  }
                  style={({ pressed }) => [
                    styles.recommendation,
                    pressed && styles.recommendationPressed,
                  ]}
                >
                  <Text style={styles.reason}>
                    {getRecommendationReasonLabel(recommendation.reason)}
                  </Text>
                  <Text style={styles.body}>
                    {recommendation.targetEntry.headword} · {recommendation.targetEntry.kind}
                  </Text>
                  <Text style={styles.translation}>
                    {getPreferredDefinition(
                      recommendation.targetSense.synset.definitions,
                    )}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
  },
  header: {
    gap: 6,
  },
  headword: {
    color: "#111827",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
  },
  meta: {
    color: "#6b7280",
    fontSize: 13,
  },
  senseCard: {
    gap: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },
  senseTitle: {
    color: "#111827",
    fontSize: 19,
    fontWeight: "700",
  },
  block: {
    gap: 4,
  },
  highlightBlock: {
    gap: 6,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  label: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  body: {
    color: "#1f2937",
    fontSize: 15,
    lineHeight: 22,
  },
  translation: {
    color: "#4b5563",
    fontSize: 14,
    lineHeight: 20,
  },
  recommendations: { gap: 8, paddingTop: 4 },
  recommendationHeading: { color: "#111827", fontSize: 16, fontWeight: "700" },
  recommendation: { minHeight: 44, justifyContent: "center", gap: 2, padding: 10, backgroundColor: "#f9fafb" },
  recommendationPressed: { opacity: 0.6 },
  reason: { color: "#7c3aed", fontSize: 12, fontWeight: "700" },
});

function getPreferredDefinition(
  definitions: readonly { languageTag: string; text: string }[],
): string {
  return (
    definitions.find(({ languageTag }) => languageTag === "ko")?.text ??
    definitions.find(({ languageTag }) => languageTag === "en")?.text ??
    definitions[0]?.text ??
    "정의 없음"
  );
}

function getRecommendationReasonLabel(reason: string): string {
  switch (reason) {
    case "SAME_SYNSET": return "같은 의미";
    case "DERIVED_FROM": return "기본형";
    case "DERIVATIVE": return "파생 표현";
    case "CONFUSABLE": return "헷갈리기 쉬운 표현";
    case "ANTONYM": return "반대말";
    case "RELATED": return "관련 표현";
    case "HYPERNYM": return "더 넓은 개념";
    case "HYPONYM": return "더 구체적인 표현";
    default: return "관련 표현";
  }
}
