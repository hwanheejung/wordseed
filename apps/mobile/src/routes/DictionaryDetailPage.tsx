import type { NativeStackNavigationOptions, NativeStackScreenProps } from "@react-navigation/native-stack";
import type { DictionaryStackParams } from "@/shared/navigation";
import { QueryBoundary } from "@/shared/relay";
import { ScrollView, StyleSheet, View } from "react-native";
import { graphql, useLazyLoadQuery } from "react-relay";
import { SaveDictionarySenseButton } from "@/features/save-dictionary-sense";
import { Surface, Text } from "@/shared/ui";
import type { DictionaryDetailPageQuery } from "@/__generated__/DictionaryDetailPageQuery.graphql";

export const dictionaryDetailPageOptions = {
  title: "Meaning and examples",
} satisfies NativeStackNavigationOptions;

type DictionaryDetailPageProps = NativeStackScreenProps<DictionaryStackParams, "DictionaryDetail">;

export function DictionaryDetailPage({ route }: DictionaryDetailPageProps) {
  return (
    <QueryBoundary>
      {(fetchKey) => (
        <DictionaryDetailContent
          lexemeId={route.params.lexemeId}
          selectedSenseId={route.params.senseId}
          fetchKey={fetchKey}
        />
      )}
    </QueryBoundary>
  );
}

interface DictionaryDetailContentProps {
  fetchKey: number;
  lexemeId: string;
  selectedSenseId?: string;
}

function DictionaryDetailContent({ lexemeId, selectedSenseId, fetchKey }: DictionaryDetailContentProps) {
  const data = useLazyLoadQuery<DictionaryDetailPageQuery>(graphql`
    query DictionaryDetailPageQuery($lexemeId: ID!) {
      dictionaryLexeme(id: $lexemeId) {
        canonicalLemma lexicalCategory { displayName }
        senses { id order glosses { id languageTag text } examples { id text translations { id text } } }
      }
    }
  `, { lexemeId }, { fetchKey });
  const lexeme = data.dictionaryLexeme;

  return (
    <Surface tone="background" style={styles.page}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        {!lexeme ? <Text>Expression not found.</Text> : <>
          <Text variant="title">{lexeme.canonicalLemma}</Text>
          <Text tone="secondary">{lexeme.lexicalCategory.displayName}</Text>
          {[...lexeme.senses].sort((left, right) => Number(right.id === selectedSenseId) - Number(left.id === selectedSenseId)).map((sense) => (
            <Surface key={sense.id} style={styles.card}>
              <Text variant="heading">{lexeme.canonicalLemma}</Text>
              {sense.id === selectedSenseId && <Text variant="caption" tone="secondary">Saved meaning</Text>}
              {sense.glosses.map((gloss) => <Text key={gloss.id}>{gloss.text}</Text>)}
              {sense.examples.map((example) => <View key={example.id} style={styles.example}>
                <Text>{example.text}</Text>
                {example.translations.map((translation) => <Text key={translation.id} tone="secondary">{translation.text}</Text>)}
              </View>)}
              <SaveDictionarySenseButton senseId={sense.id} />
            </Surface>
          ))}
        </>}
      </ScrollView>
    </Surface>
  );
}

const styles = StyleSheet.create({ page: { flex: 1 }, content: { padding: 20, gap: 16, paddingBottom: 40 }, card: { padding: 18, borderRadius: 16, gap: 12 }, example: { gap: 4 } });
