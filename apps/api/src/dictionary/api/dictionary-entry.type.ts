import {
  Field,
  Float,
  ID,
  Int,
  ObjectType,
  registerEnumType,
} from "@nestjs/graphql";
import { PageInfoObject } from "../../graphql/page-info.type";
import {
  DictionaryFormKind,
  type DictionaryFormKind as DictionaryFormKindValue,
  DictionarySenseNarrativeKind,
  type DictionarySenseNarrativeKind as DictionarySenseNarrativeKindValue,
} from "../domain/dictionary-content";
import {
  DictionaryEntryKind,
  type DictionaryEntryKind as DictionaryEntryKindValue,
  DictionarySenseRecommendationReason,
  type DictionarySenseRecommendationReason as DictionarySenseRecommendationReasonValue,
  DictionaryPartOfSpeech,
  type DictionaryPartOfSpeech as DictionaryPartOfSpeechValue,
} from "../domain/dictionary-entry";

registerEnumType(DictionaryEntryKind, {
  name: "DictionaryEntryKind",
  description: "Whether a dictionary entry is a word or a multiword expression.",
});

registerEnumType(DictionarySenseRecommendationReason, {
  name: "DictionarySenseRecommendationReason",
  description: "Why another sense is recommended from this sense's lexical relationships.",
});

registerEnumType(DictionaryPartOfSpeech, {
  name: "DictionaryPartOfSpeech",
  description: "The grammatical role shared by one dictionary concept.",
});

registerEnumType(DictionarySenseNarrativeKind, {
  name: "DictionarySenseNarrativeKind",
});

registerEnumType(DictionaryFormKind, {
  name: "DictionaryFormKind",
});

@ObjectType("DictionarySynsetDefinition")
export class DictionarySynsetDefinitionObject {
  @Field(() => ID)
  id!: string;

  @Field()
  languageTag!: string;

  @Field()
  text!: string;
}

@ObjectType("DictionarySenseNarrative")
export class DictionarySenseNarrativeObject {
  @Field(() => ID)
  id!: string;

  @Field(() => DictionarySenseNarrativeKind)
  kind!: DictionarySenseNarrativeKindValue;

  @Field()
  languageTag!: string;

  @Field()
  markdown!: string;

  @Field(() => String, { nullable: true })
  generatedBy!: string | null;

  @Field(() => String, { nullable: true })
  promptVersion!: string | null;
}

@ObjectType("DictionaryExampleTranslation")
export class DictionaryExampleTranslationObject {
  @Field(() => ID)
  id!: string;

  @Field()
  languageTag!: string;

  @Field()
  text!: string;

  @Field(() => String, { nullable: true })
  generatedBy!: string | null;
}

@ObjectType("DictionaryExample")
export class DictionaryExampleObject {
  @Field(() => ID)
  id!: string;

  @Field()
  sourceLanguageTag!: string;

  @Field()
  sourceText!: string;

  @Field(() => [DictionaryExampleTranslationObject])
  translations!: readonly DictionaryExampleTranslationObject[];
}

@ObjectType("DictionaryForm")
export class DictionaryFormObject {
  @Field(() => ID)
  id!: string;

  @Field()
  surface!: string;

  @Field(() => DictionaryFormKind)
  kind!: DictionaryFormKindValue;
}

@ObjectType("DictionarySynset")
export class DictionarySynsetObject {
  @Field(() => ID)
  id!: string;

  @Field(() => DictionaryPartOfSpeech, { nullable: true })
  partOfSpeech!: DictionaryPartOfSpeechValue | null;

  @Field(() => [DictionarySynsetDefinitionObject])
  definitions!: readonly DictionarySynsetDefinitionObject[];

  @Field(() => [DictionaryExampleObject])
  examples!: readonly DictionaryExampleObject[];
}

@ObjectType("DictionarySense")
export class DictionarySenseObject {
  @Field(() => ID)
  id!: string;

  @Field(() => Float, { nullable: true })
  commonnessScore!: number | null;

  @Field(() => DictionarySynsetObject)
  synset!: DictionarySynsetObject;

  @Field(() => [DictionarySenseNarrativeObject])
  narratives!: readonly DictionarySenseNarrativeObject[];

  @Field(() => [DictionaryExampleObject])
  examples!: readonly DictionaryExampleObject[];

  @Field(() => [DictionaryFormObject])
  forms!: readonly DictionaryFormObject[];
}

@ObjectType("DictionaryEntry")
export class DictionaryEntryObject {
  @Field(() => ID)
  id!: string;

  @Field()
  headword!: string;

  @Field()
  languageTag!: string;

  @Field(() => DictionaryEntryKind)
  kind!: DictionaryEntryKindValue;

  @Field(() => [DictionarySenseObject])
  senses!: readonly DictionarySenseObject[];
}

@ObjectType("DictionarySenseRecommendation")
export class DictionarySenseRecommendationObject {
  @Field(() => DictionaryEntryObject)
  targetEntry!: DictionaryEntryObject;

  @Field(() => DictionarySenseObject)
  targetSense!: DictionarySenseObject;

  @Field(() => DictionarySenseRecommendationReason)
  reason!: DictionarySenseRecommendationReasonValue;
}

@ObjectType("DictionaryEntryEdge")
export class DictionaryEntryEdgeObject {
  @Field()
  cursor!: string;

  @Field(() => DictionaryEntryObject)
  node!: DictionaryEntryObject;
}

@ObjectType("DictionaryEntryConnection")
export class DictionaryEntryConnectionObject {
  @Field(() => [DictionaryEntryEdgeObject])
  edges!: readonly DictionaryEntryEdgeObject[];

  @Field(() => PageInfoObject)
  pageInfo!: PageInfoObject;

  @Field(() => Int)
  totalCount!: number;
}
