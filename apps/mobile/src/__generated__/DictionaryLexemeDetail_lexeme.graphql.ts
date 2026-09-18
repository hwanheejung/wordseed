/**
 * @generated SignedSource<<13d8b12cc70f211909d95d8ebd691c09>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type DictionarySenseNarrativeKind = "ORIGIN" | "STORY" | "USAGE_GUIDE" | "%future added value";
export type DictionarySenseRecommendationReason = "ANTONYM" | "CONFUSABLE" | "DERIVATIVE" | "DERIVED_FROM" | "HOLONYM" | "HYPERNYM" | "HYPONYM" | "MERONYM" | "RELATED" | "SAME_SYNSET" | "SYNONYM" | "TRANSLATION" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type DictionaryLexemeDetail_lexeme$data = {
  readonly canonicalLemma: string;
  readonly forms: ReadonlyArray<{
    readonly features: ReadonlyArray<{
      readonly id: string;
      readonly key: string;
      readonly label: string;
    }>;
    readonly id: string;
    readonly pronunciations: ReadonlyArray<{
      readonly audioUrl: string | null | undefined;
      readonly dialectTag: string | null | undefined;
      readonly id: string;
      readonly ipa: string | null | undefined;
      readonly syllabification: string | null | undefined;
    }>;
    readonly representations: ReadonlyArray<{
      readonly id: string;
      readonly languageTag: string;
      readonly value: string;
    }>;
  }>;
  readonly language: {
    readonly code: string;
    readonly name: string;
  };
  readonly lemmas: ReadonlyArray<{
    readonly id: string;
    readonly isPrimary: boolean;
    readonly languageTag: string;
    readonly value: string;
  }>;
  readonly lexicalCategory: {
    readonly code: string;
    readonly displayName: string;
  };
  readonly senses: ReadonlyArray<{
    readonly examples: ReadonlyArray<{
      readonly id: string;
      readonly languageTag: string;
      readonly text: string;
      readonly translations: ReadonlyArray<{
        readonly id: string;
        readonly languageTag: string;
        readonly text: string;
      }>;
    }>;
    readonly glosses: ReadonlyArray<{
      readonly id: string;
      readonly languageTag: string;
      readonly text: string;
    }>;
    readonly id: string;
    readonly narratives: ReadonlyArray<{
      readonly id: string;
      readonly kind: DictionarySenseNarrativeKind;
      readonly languageTag: string;
      readonly markdown: string;
    }>;
    readonly order: number;
    readonly recommendations: ReadonlyArray<{
      readonly reason: DictionarySenseRecommendationReason;
      readonly targetLexeme: {
        readonly canonicalLemma: string;
        readonly id: string;
        readonly lexicalCategory: {
          readonly displayName: string;
        };
      };
      readonly targetSense: {
        readonly glosses: ReadonlyArray<{
          readonly languageTag: string;
          readonly text: string;
        }>;
        readonly id: string;
      };
    }>;
    readonly synset: {
      readonly definitions: ReadonlyArray<{
        readonly id: string;
        readonly languageTag: string;
        readonly text: string;
      }>;
      readonly id: string;
    } | null | undefined;
    readonly usages: ReadonlyArray<{
      readonly corpus: string | null | undefined;
      readonly id: string;
      readonly rank: number | null | undefined;
      readonly regionTag: string | null | undefined;
      readonly register: string | null | undefined;
      readonly score: number | null | undefined;
    }>;
  }>;
  readonly " $fragmentType": "DictionaryLexemeDetail_lexeme";
};
export type DictionaryLexemeDetail_lexeme$key = {
  readonly " $data"?: DictionaryLexemeDetail_lexeme$data;
  readonly " $fragmentSpreads": FragmentRefs<"DictionaryLexemeDetail_lexeme">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "kind": "RequiredField",
  "field": {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "canonicalLemma",
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
    "name": "code",
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
    "name": "displayName",
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
v4 = {
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
v5 = {
  "kind": "RequiredField",
  "field": {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "value",
    "storageKey": null
  },
  "action": "THROW"
},
v6 = {
  "kind": "RequiredField",
  "field": {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "text",
    "storageKey": null
  },
  "action": "THROW"
},
v7 = [
  (v3/*:: as any*/),
  (v4/*:: as any*/),
  (v6/*:: as any*/)
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DictionaryLexemeDetail_lexeme",
  "selections": [
    (v0/*:: as any*/),
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "concreteType": "DictionaryLanguage",
        "kind": "LinkedField",
        "name": "language",
        "plural": false,
        "selections": [
          (v1/*:: as any*/),
          {
            "kind": "RequiredField",
            "field": {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "name",
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
        "args": null,
        "concreteType": "DictionaryLexicalCategory",
        "kind": "LinkedField",
        "name": "lexicalCategory",
        "plural": false,
        "selections": [
          (v1/*:: as any*/),
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
        "concreteType": "DictionaryLemma",
        "kind": "LinkedField",
        "name": "lemmas",
        "plural": true,
        "selections": [
          (v3/*:: as any*/),
          {
            "kind": "RequiredField",
            "field": {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "isPrimary",
              "storageKey": null
            },
            "action": "THROW"
          },
          (v4/*:: as any*/),
          (v5/*:: as any*/)
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
        "concreteType": "DictionaryForm",
        "kind": "LinkedField",
        "name": "forms",
        "plural": true,
        "selections": [
          (v3/*:: as any*/),
          {
            "kind": "RequiredField",
            "field": {
              "alias": null,
              "args": null,
              "concreteType": "DictionaryFormRepresentation",
              "kind": "LinkedField",
              "name": "representations",
              "plural": true,
              "selections": [
                (v3/*:: as any*/),
                (v4/*:: as any*/),
                (v5/*:: as any*/)
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
              "concreteType": "DictionaryGrammaticalFeature",
              "kind": "LinkedField",
              "name": "features",
              "plural": true,
              "selections": [
                (v3/*:: as any*/),
                {
                  "kind": "RequiredField",
                  "field": {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "key",
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
                    "name": "label",
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
              "args": null,
              "concreteType": "DictionaryPronunciation",
              "kind": "LinkedField",
              "name": "pronunciations",
              "plural": true,
              "selections": [
                (v3/*:: as any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "audioUrl",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "dialectTag",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "ipa",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "syllabification",
                  "storageKey": null
                }
              ],
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
        "args": null,
        "concreteType": "DictionarySense",
        "kind": "LinkedField",
        "name": "senses",
        "plural": true,
        "selections": [
          (v3/*:: as any*/),
          {
            "kind": "RequiredField",
            "field": {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "order",
              "storageKey": null
            },
            "action": "THROW"
          },
          {
            "kind": "RequiredField",
            "field": {
              "alias": null,
              "args": null,
              "concreteType": "DictionarySenseGloss",
              "kind": "LinkedField",
              "name": "glosses",
              "plural": true,
              "selections": (v7/*:: as any*/),
              "storageKey": null
            },
            "action": "THROW"
          },
          {
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
                (v4/*:: as any*/),
                (v6/*:: as any*/),
                {
                  "kind": "RequiredField",
                  "field": {
                    "alias": null,
                    "args": null,
                    "concreteType": "DictionaryExampleTranslation",
                    "kind": "LinkedField",
                    "name": "translations",
                    "plural": true,
                    "selections": (v7/*:: as any*/),
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
              "args": null,
              "concreteType": "DictionarySenseNarrative",
              "kind": "LinkedField",
              "name": "narratives",
              "plural": true,
              "selections": [
                (v3/*:: as any*/),
                {
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
                (v4/*:: as any*/),
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
          {
            "kind": "RequiredField",
            "field": {
              "alias": null,
              "args": null,
              "concreteType": "DictionarySenseUsage",
              "kind": "LinkedField",
              "name": "usages",
              "plural": true,
              "selections": [
                (v3/*:: as any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "corpus",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "rank",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "regionTag",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "register",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "score",
                  "storageKey": null
                }
              ],
              "storageKey": null
            },
            "action": "THROW"
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "DictionarySynset",
            "kind": "LinkedField",
            "name": "synset",
            "plural": false,
            "selections": [
              (v3/*:: as any*/),
              {
                "kind": "RequiredField",
                "field": {
                  "alias": null,
                  "args": null,
                  "concreteType": "DictionarySynsetDefinition",
                  "kind": "LinkedField",
                  "name": "definitions",
                  "plural": true,
                  "selections": (v7/*:: as any*/),
                  "storageKey": null
                },
                "action": "THROW"
              }
            ],
            "storageKey": null
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
                    "concreteType": "DictionaryLexeme",
                    "kind": "LinkedField",
                    "name": "targetLexeme",
                    "plural": false,
                    "selections": [
                      (v3/*:: as any*/),
                      (v0/*:: as any*/),
                      {
                        "kind": "RequiredField",
                        "field": {
                          "alias": null,
                          "args": null,
                          "concreteType": "DictionaryLexicalCategory",
                          "kind": "LinkedField",
                          "name": "lexicalCategory",
                          "plural": false,
                          "selections": [
                            (v2/*:: as any*/)
                          ],
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
                          "concreteType": "DictionarySenseGloss",
                          "kind": "LinkedField",
                          "name": "glosses",
                          "plural": true,
                          "selections": [
                            (v4/*:: as any*/),
                            (v6/*:: as any*/)
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
  "type": "DictionaryLexeme",
  "abstractKey": null
};
})();

(node as any).hash = "70289a3bda990ee4552d48074f804a74";

export default node;
