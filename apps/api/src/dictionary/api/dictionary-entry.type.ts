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
  DictionaryPartOfSpeech,
  type DictionaryPartOfSpeech as DictionaryPartOfSpeechValue,
} from "../domain/dictionary-entry";

registerEnumType(DictionaryEntryKind, {
  name: "DictionaryEntryKind",
  description: "Whether a dictionary entry is a word or a multiword expression.",
});

registerEnumType(DictionaryPartOfSpeech, {
  name: "DictionaryPartOfSpeech",
  description: "The grammatical role of one dictionary sense.",
});

registerEnumType(DictionarySenseNarrativeKind, {
  name: "DictionarySenseNarrativeKind",
});

registerEnumType(DictionaryFormKind, {
  name: "DictionaryFormKind",
});

@ObjectType("DictionarySenseDefinition")
export class DictionarySenseDefinitionObject {
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

@ObjectType("DictionarySense")
export class DictionarySenseObject {
  @Field(() => ID)
  id!: string;

  @Field(() => DictionaryPartOfSpeech, { nullable: true })
  partOfSpeech!: DictionaryPartOfSpeechValue | null;

  @Field(() => Float, { nullable: true })
  commonnessScore!: number | null;

  @Field(() => [DictionarySenseDefinitionObject])
  definitions!: readonly DictionarySenseDefinitionObject[];

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
