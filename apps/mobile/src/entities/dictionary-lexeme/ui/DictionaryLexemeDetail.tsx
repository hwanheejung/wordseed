import { Pressable, StyleSheet, Text, View } from "react-native";
import { graphql, useFragment } from "react-relay";

import type { DictionaryLexemeDetail_lexeme$key } from "./__generated__/DictionaryLexemeDetail_lexeme.graphql";

interface DictionaryLexemeDetailProps {
  lexeme: DictionaryLexemeDetail_lexeme$key;
  onSelectRecommendation: (lexemeId: string) => void;
}

export function DictionaryLexemeDetail({
  lexeme: lexemeRef,
  onSelectRecommendation,
}: DictionaryLexemeDetailProps) {
  const lexeme = useFragment(
    graphql`
      fragment DictionaryLexemeDetail_lexeme on DictionaryLexeme {
        canonicalLemma @required(action: THROW)
        language @required(action: THROW) {
          code @required(action: THROW)
          name @required(action: THROW)
        }
        lexicalCategory @required(action: THROW) {
          code @required(action: THROW)
          displayName @required(action: THROW)
        }
        lemmas @required(action: THROW) {
          id @required(action: THROW)
          isPrimary @required(action: THROW)
          languageTag @required(action: THROW)
          value @required(action: THROW)
        }
        forms @required(action: THROW) {
          id @required(action: THROW)
          representations @required(action: THROW) {
            id @required(action: THROW)
            languageTag @required(action: THROW)
            value @required(action: THROW)
          }
          features @required(action: THROW) {
            id @required(action: THROW)
            key @required(action: THROW)
            label @required(action: THROW)
          }
          pronunciations @required(action: THROW) {
            id @required(action: THROW)
            audioUrl
            dialectTag
            ipa
            syllabification
          }
        }
        senses @required(action: THROW) {
          id @required(action: THROW)
          order @required(action: THROW)
          glosses @required(action: THROW) {
            id @required(action: THROW)
            languageTag @required(action: THROW)
            text @required(action: THROW)
          }
          examples @required(action: THROW) {
            id @required(action: THROW)
            languageTag @required(action: THROW)
            text @required(action: THROW)
            translations @required(action: THROW) {
              id @required(action: THROW)
              languageTag @required(action: THROW)
              text @required(action: THROW)
            }
          }
          narratives @required(action: THROW) {
            id @required(action: THROW)
            kind @required(action: THROW)
            languageTag @required(action: THROW)
            markdown @required(action: THROW)
          }
          usages @required(action: THROW) {
            id @required(action: THROW)
            corpus
            rank
            regionTag
            register
            score
          }
          synset {
            id @required(action: THROW)
            definitions @required(action: THROW) {
              id @required(action: THROW)
              languageTag @required(action: THROW)
              text @required(action: THROW)
            }
          }
          recommendations(first: 3) @required(action: THROW) {
            reason @required(action: THROW)
            targetLexeme @required(action: THROW) {
              id @required(action: THROW)
              canonicalLemma @required(action: THROW)
              lexicalCategory @required(action: THROW) {
                displayName @required(action: THROW)
              }
            }
            targetSense @required(action: THROW) {
              id @required(action: THROW)
              glosses @required(action: THROW) {
                languageTag @required(action: THROW)
                text @required(action: THROW)
              }
            }
          }
        }
      }
    `,
    lexemeRef,
  );

  return (
    <View style={styles.content}>
      <View style={styles.header}>
        <Text style={styles.lemma}>{lexeme.canonicalLemma}</Text>
        <Text style={styles.meta}>
          {lexeme.lexicalCategory.displayName} · {lexeme.language.name} ({lexeme.language.code})
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>표제어</Text>
        {lexeme.lemmas.map((lemma) => (
          <Text key={lemma.id} style={styles.body}>
            {lemma.value} · {lemma.languageTag}{lemma.isPrimary ? " · 대표" : ""}
          </Text>
        ))}
      </View>

      {lexeme.forms.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>형태와 발음</Text>
          {lexeme.forms.map((form) => (
            <View key={form.id} style={styles.subsection}>
              {form.representations.map((representation) => (
                <Text key={representation.id} style={styles.body}>
                  {representation.value} · {representation.languageTag}
                </Text>
              ))}
              {form.features.length > 0 ? (
                <Text style={styles.meta}>
                  {form.features.map((feature) => feature.label).join(" · ")}
                </Text>
              ) : null}
              {form.pronunciations.map((pronunciation) => (
                <Text key={pronunciation.id} style={styles.meta}>
                  {formatPronunciation(pronunciation)}
                </Text>
              ))}
            </View>
          ))}
        </View>
      ) : null}

      {lexeme.senses.map((sense) => (
        <View key={sense.id} style={styles.senseCard}>
          <Text style={styles.senseTitle}>의미 {sense.order}</Text>

          {sense.glosses.map((gloss) => (
            <View key={gloss.id} style={styles.block}>
              <Text style={styles.label}>뜻 · {gloss.languageTag}</Text>
              <Text style={styles.body}>{gloss.text}</Text>
            </View>
          ))}

          {sense.synset?.definitions.map((definition) => (
            <View key={definition.id} style={styles.block}>
              <Text style={styles.label}>공유 개념 · {definition.languageTag}</Text>
              <Text style={styles.body}>{definition.text}</Text>
            </View>
          ))}

          {sense.examples.map((example) => (
            <View key={example.id} style={styles.block}>
              <Text style={styles.label}>예문 · {example.languageTag}</Text>
              <Text style={styles.body}>{example.text}</Text>
              {example.translations.map((translation) => (
                <Text key={translation.id} style={styles.translation}>
                  {translation.languageTag} · {translation.text}
                </Text>
              ))}
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

          {sense.usages.length > 0 ? (
            <View style={styles.block}>
              <Text style={styles.label}>사용 정보</Text>
              {sense.usages.map((usage) => (
                <Text key={usage.id} style={styles.meta}>
                  {formatUsage(usage)}
                </Text>
              ))}
            </View>
          ) : null}

          {sense.recommendations.length > 0 ? (
            <View style={styles.recommendations}>
              <Text style={styles.recommendationHeading}>관련 단어·표현</Text>
              {sense.recommendations.map((recommendation) => (
                <Pressable
                  key={`${recommendation.targetLexeme.id}-${recommendation.targetSense.id}`}
                  accessibilityRole="button"
                  onPress={() => onSelectRecommendation(recommendation.targetLexeme.id)}
                  style={({ pressed }) => [
                    styles.recommendation,
                    pressed && styles.recommendationPressed,
                  ]}
                >
                  <Text style={styles.reason}>
                    {getRecommendationReasonLabel(recommendation.reason)}
                  </Text>
                  <Text style={styles.body}>
                    {recommendation.targetLexeme.canonicalLemma} · {recommendation.targetLexeme.lexicalCategory.displayName}
                  </Text>
                  <Text style={styles.translation}>
                    {getPreferredGloss(recommendation.targetSense.glosses)}
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
  content: { gap: 16 },
  header: { gap: 6 },
  lemma: { color: "#111827", fontSize: 28, fontWeight: "800", lineHeight: 34 },
  meta: { color: "#6b7280", fontSize: 13, lineHeight: 19 },
  section: { gap: 10, padding: 16, borderRadius: 12, backgroundColor: "#eef2ff" },
  sectionTitle: { color: "#111827", fontSize: 16, fontWeight: "700" },
  subsection: { gap: 4, paddingTop: 4 },
  senseCard: { gap: 14, padding: 18, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, backgroundColor: "#ffffff" },
  senseTitle: { color: "#111827", fontSize: 19, fontWeight: "700" },
  block: { gap: 4 },
  highlightBlock: { gap: 6, padding: 12, borderRadius: 8, backgroundColor: "#f3f4f6" },
  label: { color: "#374151", fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  body: { color: "#1f2937", fontSize: 15, lineHeight: 22 },
  translation: { color: "#4b5563", fontSize: 14, lineHeight: 20 },
  recommendations: { gap: 8, paddingTop: 4 },
  recommendationHeading: { color: "#111827", fontSize: 16, fontWeight: "700" },
  recommendation: { minHeight: 44, justifyContent: "center", gap: 2, padding: 10, backgroundColor: "#f9fafb" },
  recommendationPressed: { opacity: 0.6 },
  reason: { color: "#7c3aed", fontSize: 12, fontWeight: "700" },
});

function getPreferredGloss(
  glosses: readonly { languageTag: string; text: string }[],
): string {
  return (
    glosses.find(({ languageTag }) => languageTag === "ko")?.text ??
    glosses.find(({ languageTag }) => languageTag === "en")?.text ??
    glosses[0]?.text ??
    "뜻 없음"
  );
}

function formatPronunciation(pronunciation: {
  audioUrl: string | null | undefined;
  dialectTag: string | null | undefined;
  ipa: string | null | undefined;
  syllabification: string | null | undefined;
}): string {
  return [
    pronunciation.ipa === null || pronunciation.ipa === undefined
      ? null
      : `IPA ${pronunciation.ipa}`,
    pronunciation.dialectTag,
    pronunciation.syllabification,
    pronunciation.audioUrl === null || pronunciation.audioUrl === undefined
      ? null
      : "오디오 있음",
  ].filter((value): value is string => value !== null && value !== undefined).join(" · ");
}

function formatUsage(usage: {
  corpus: string | null | undefined;
  rank: number | null | undefined;
  regionTag: string | null | undefined;
  register: string | null | undefined;
  score: number | null | undefined;
}): string {
  return [
    usage.corpus,
    usage.regionTag,
    usage.register,
    usage.rank === null || usage.rank === undefined ? null : `순위 ${usage.rank}`,
    usage.score === null || usage.score === undefined ? null : `점수 ${usage.score}`,
  ].filter((value): value is string => value !== null && value !== undefined).join(" · ");
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
    case "HOLONYM": return "전체 개념";
    case "MERONYM": return "부분 개념";
    case "SYNONYM": return "유의어";
    case "TRANSLATION": return "번역 표현";
    default: return "관련 표현";
  }
}
