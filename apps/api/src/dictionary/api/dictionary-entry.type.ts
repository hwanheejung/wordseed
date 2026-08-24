import { Field, ID, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { PageInfoObject } from "../../graphql/page-info.type";
import {
  DictionaryEntryKind,
  type DictionaryEntryKind as DictionaryEntryKindValue,
} from "../domain/dictionary-entry";

registerEnumType(DictionaryEntryKind, {
  name: "DictionaryEntryKind",
  description: "Whether a dictionary entry is a word or a multiword expression.",
});

@ObjectType("DictionaryEntry")
export class DictionaryEntryObject {
  @Field(() => ID)
  id!: string;

  @Field()
  headword!: string;

  @Field(() => DictionaryEntryKind)
  kind!: DictionaryEntryKindValue;
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
