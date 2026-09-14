/**
 * @generated SignedSource<<9178884fdfb6ff8fcdd86bd15ddf8d6e>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type DictionaryEntryKind = "EXPRESSION" | "WORD" | "%future added value";
export type DictionaryFormKind = "COMPARATIVE" | "OTHER" | "PAST" | "PAST_PARTICIPLE" | "PLURAL" | "PRESENT_PARTICIPLE" | "SUPERLATIVE" | "THIRD_PERSON_SINGULAR" | "%future added value";
export type DictionaryPartOfSpeech = "ADJECTIVE" | "ADVERB" | "AUXILIARY" | "CONJUNCTION" | "DETERMINER" | "INTERJECTION" | "NOUN" | "PARTICLE" | "PREPOSITION" | "PRONOUN" | "VERB" | "%future added value";
export type DictionarySenseNarrativeKind = "ORIGIN" | "STORY" | "USAGE_GUIDE" | "%future added value";
export type DictionarySenseRecommendationReason = "ANTONYM" | "CONFUSABLE" | "DERIVATIVE" | "DERIVED_FROM" | "HYPERNYM" | "HYPONYM" | "RELATED" | "SAME_SYNSET" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type DictionaryEntryDetail_entry$data = {
  readonly headword: string;
  readonly kind: DictionaryEntryKind;
  readonly languageTag: string;
  readonly senses: ReadonlyArray<{
    readonly commonnessScore: number | null | undefined;
    readonly examples: ReadonlyArray<{
      readonly id: string;
      readonly sourceLanguageTag: string;
      readonly sourceText: string;
      readonly translations: ReadonlyArray<{
        readonly id: string;
        readonly languageTag: string;
        readonly text: string;
      }>;
    }>;
    readonly forms: ReadonlyArray<{
      readonly id: string;
      readonly kind: DictionaryFormKind;
      readonly surface: string;
    }>;
    readonly id: string;
    readonly narratives: ReadonlyArray<{
      readonly id: string;
      readonly kind: DictionarySenseNarrativeKind;
      readonly languageTag: string;
      readonly markdown: string;
    }>;
    readonly recommendations: ReadonlyArray<{
      readonly reason: DictionarySenseRecommendationReason;
      readonly targetEntry: {
        readonly headword: string;
        readonly id: string;
        readonly kind: DictionaryEntryKind;
      };
      readonly targetSense: {
        readonly id: string;
        readonly synset: {
          readonly definitions: ReadonlyArray<{
            readonly id: string;
            readonly languageTag: string;
            readonly text: string;
          }>;
        };
      };
    }>;
    readonly synset: {
      readonly definitions: ReadonlyArray<{
        readonly id: string;
        readonly languageTag: string;
        readonly text: string;
      }>;
      readonly examples: ReadonlyArray<{
        readonly id: string;
        readonly sourceLanguageTag: string;
        readonly sourceText: string;
        readonly translations: ReadonlyArray<{
          readonly id: string;
          readonly languageTag: string;
          readonly text: string;
        }>;
      }>;
      readonly partOfSpeech: DictionaryPartOfSpeech | null | undefined;
    };
  }>;
  readonly " $fragmentType": "DictionaryEntryDetail_entry";
};
export type DictionaryEntryDetail_entry$key = {
  readonly " $data"?: DictionaryEntryDetail_entry$data;
  readonly " $fragmentSpreads": FragmentRefs<"DictionaryEntryDetail_entry">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "kind": "RequiredField",
  "field": {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "headword",
    "storageKey": null
  },
  "action": "THROW"
},
v1 = {
  "kind": "RequiredField",
  "field": {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "languageTag",
    "storageKey": null
  },
  "action": "THROW"
},
v2 = {
  "kind": "RequiredField",
  "field": {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "kind",
    "storageKey": null
  },
  "action": "THROW"
},
v3 = {
  "kind": "RequiredField",
  "field": {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "id",
    "storageKey": null
  },
  "action": "THROW"
},
v4 = [
  (v3/*:: as any*/),
  (v1/*:: as any*/),
  {
    "kind": "RequiredField",
    "field": {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "text",
      "storageKey": null
    },
    "action": "THROW"
  }
],
v5 = {
  "kind": "RequiredField",
  "field": {
    "alias": null,
    "args": null,
    "concreteType": "DictionarySynsetDefinition",
    "kind": "LinkedField",
    "name": "definitions",
    "plural": true,
    "selections": (v4/*:: as any*/),
    "storageKey": null
  },
  "action": "THROW"
},
v6 = {
  "kind": "RequiredField",
  "field": {
    "alias": null,
    "args": null,
    "concreteType": "DictionaryExample",
    "kind": "LinkedField",
    "name": "examples",
    "plural": true,
    "selections": [
      (v3/*:: as any*/),
      {
        "kind": "RequiredField",
        "field": {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "sourceLanguageTag",
          "storageKey": null
        },
        "action": "THROW"
      },
      {
        "kind": "RequiredField",
        "field": {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "sourceText",
          "storageKey": null
        },
        "action": "THROW"
      },
      {
        "kind": "RequiredField",
        "field": {
          "alias": null,
          "args": null,
          "concreteType": "DictionaryExampleTranslation",
          "kind": "LinkedField",
          "name": "translations",
          "plural": true,
          "selections": (v4/*:: as any*/),
          "storageKey": null
        },
        "action": "THROW"
      }
    ],
    "storageKey": null
  },
  "action": "THROW"
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DictionaryEntryDetail_entry",
  "selections": [
    (v0/*:: as any*/),
    (v1/*:: as any*/),
    (v2/*:: as any*/),
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "concreteType": "DictionarySense",
        "kind": "LinkedField",
        "name": "senses",
        "plural": true,
        "selections": [
          (v3/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "commonnessScore",
            "storageKey": null
          },
          {
            "kind": "RequiredField",
            "field": {
              "alias": null,
              "args": null,
              "concreteType": "DictionarySynset",
              "kind": "LinkedField",
              "name": "synset",
              "plural": false,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "partOfSpeech",
                  "storageKey": null
                },
                (v5/*:: as any*/),
                (v6/*:: as any*/)
              ],
              "storageKey": null
            },
            "action": "THROW"
          },
          {
            "kind": "RequiredField",
            "field": {
              "alias": null,
              "args": null,
              "concreteType": "DictionarySenseNarrative",
              "kind": "LinkedField",
              "name": "narratives",
              "plural": true,
              "selections": [
                (v3/*:: as any*/),
                (v2/*:: as any*/),
                (v1/*:: as any*/),
                {
                  "kind": "RequiredField",
                  "field": {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "markdown",
                    "storageKey": null
                  },
                  "action": "THROW"
                }
              ],
              "storageKey": null
            },
            "action": "THROW"
          },
          (v6/*:: as any*/),
          {
            "kind": "RequiredField",
            "field": {
              "alias": null,
              "args": null,
              "concreteType": "DictionaryForm",
              "kind": "LinkedField",
              "name": "forms",
              "plural": true,
              "selections": [
                (v3/*:: as any*/),
                (v2/*:: as any*/),
                {
                  "kind": "RequiredField",
                  "field": {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "surface",
                    "storageKey": null
                  },
                  "action": "THROW"
                }
              ],
              "storageKey": null
            },
            "action": "THROW"
          },
          {
            "kind": "RequiredField",
            "field": {
              "alias": null,
              "args": [
                {
                  "kind": "Literal",
                  "name": "first",
                  "value": 3
                }
              ],
              "concreteType": "DictionarySenseRecommendation",
              "kind": "LinkedField",
              "name": "recommendations",
              "plural": true,
              "selections": [
                {
                  "kind": "RequiredField",
                  "field": {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "reason",
                    "storageKey": null
                  },
                  "action": "THROW"
                },
                {
                  "kind": "RequiredField",
                  "field": {
                    "alias": null,
                    "args": null,
                    "concreteType": "DictionaryEntry",
                    "kind": "LinkedField",
                    "name": "targetEntry",
                    "plural": false,
                    "selections": [
                      (v3/*:: as any*/),
                      (v0/*:: as any*/),
                      (v2/*:: as any*/)
                    ],
                    "storageKey": null
                  },
                  "action": "THROW"
                },
                {
                  "kind": "RequiredField",
                  "field": {
                    "alias": null,
                    "args": null,
                    "concreteType": "DictionarySense",
                    "kind": "LinkedField",
                    "name": "targetSense",
                    "plural": false,
                    "selections": [
                      (v3/*:: as any*/),
                      {
                        "kind": "RequiredField",
                        "field": {
                          "alias": null,
                          "args": null,
                          "concreteType": "DictionarySynset",
                          "kind": "LinkedField",
                          "name": "synset",
                          "plural": false,
                          "selections": [
                            (v5/*:: as any*/)
                          ],
                          "storageKey": null
                        },
                        "action": "THROW"
                      }
                    ],
                    "storageKey": null
                  },
                  "action": "THROW"
                }
              ],
              "storageKey": "recommendations(first:3)"
            },
            "action": "THROW"
          }
        ],
        "storageKey": null
      },
      "action": "THROW"
    }
  ],
  "type": "DictionaryEntry",
  "abstractKey": null
};
})();

(node as any).hash = "2aa24435b02720d0b5531987f00a095f";

export default node;
