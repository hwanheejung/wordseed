/**
 * @generated SignedSource<<52a471294c5152f5c6bffcf5f1b682c3>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DictionaryDetailPageQuery$variables = {
  lexemeId: string;
};
export type DictionaryDetailPageQuery$data = {
  readonly dictionaryLexeme: {
    readonly " $fragmentSpreads": FragmentRefs<"DictionaryLexemeDetail_lexeme">;
  } | null | undefined;
};
export type DictionaryDetailPageQuery = {
  response: DictionaryDetailPageQuery$data;
  variables: DictionaryDetailPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "lexemeId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "lexemeId"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "canonicalLemma",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "code",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "displayName",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "languageTag",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "value",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "text",
  "storageKey": null
},
v9 = [
  (v4/*:: as any*/),
  (v6/*:: as any*/),
  (v8/*:: as any*/)
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "DictionaryDetailPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "DictionaryLexeme",
        "kind": "LinkedField",
        "name": "dictionaryLexeme",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "DictionaryLexemeDetail_lexeme"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "DictionaryDetailPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "DictionaryLexeme",
        "kind": "LinkedField",
        "name": "dictionaryLexeme",
        "plural": false,
        "selections": [
          (v2/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "DictionaryLanguage",
            "kind": "LinkedField",
            "name": "language",
            "plural": false,
            "selections": [
              (v3/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              },
              (v4/*:: as any*/)
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "DictionaryLexicalCategory",
            "kind": "LinkedField",
            "name": "lexicalCategory",
            "plural": false,
            "selections": [
              (v3/*:: as any*/),
              (v5/*:: as any*/),
              (v4/*:: as any*/)
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "DictionaryLemma",
            "kind": "LinkedField",
            "name": "lemmas",
            "plural": true,
            "selections": [
              (v4/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "isPrimary",
                "storageKey": null
              },
              (v6/*:: as any*/),
              (v7/*:: as any*/)
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "DictionaryForm",
            "kind": "LinkedField",
            "name": "forms",
            "plural": true,
            "selections": [
              (v4/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "DictionaryFormRepresentation",
                "kind": "LinkedField",
                "name": "representations",
                "plural": true,
                "selections": [
                  (v4/*:: as any*/),
                  (v6/*:: as any*/),
                  (v7/*:: as any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "DictionaryGrammaticalFeature",
                "kind": "LinkedField",
                "name": "features",
                "plural": true,
                "selections": [
                  (v4/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "key",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "label",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "DictionaryPronunciation",
                "kind": "LinkedField",
                "name": "pronunciations",
                "plural": true,
                "selections": [
                  (v4/*:: as any*/),
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
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "DictionarySense",
            "kind": "LinkedField",
            "name": "senses",
            "plural": true,
            "selections": [
              (v4/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "order",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "DictionarySenseGloss",
                "kind": "LinkedField",
                "name": "glosses",
                "plural": true,
                "selections": (v9/*:: as any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "DictionaryExample",
                "kind": "LinkedField",
                "name": "examples",
                "plural": true,
                "selections": [
                  (v4/*:: as any*/),
                  (v6/*:: as any*/),
                  (v8/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "DictionaryExampleTranslation",
                    "kind": "LinkedField",
                    "name": "translations",
                    "plural": true,
                    "selections": (v9/*:: as any*/),
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "DictionarySenseNarrative",
                "kind": "LinkedField",
                "name": "narratives",
                "plural": true,
                "selections": [
                  (v4/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "kind",
                    "storageKey": null
                  },
                  (v6/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "markdown",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "DictionarySenseUsage",
                "kind": "LinkedField",
                "name": "usages",
                "plural": true,
                "selections": [
                  (v4/*:: as any*/),
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
              {
                "alias": null,
                "args": null,
                "concreteType": "DictionarySynset",
                "kind": "LinkedField",
                "name": "synset",
                "plural": false,
                "selections": [
                  (v4/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "DictionarySynsetDefinition",
                    "kind": "LinkedField",
                    "name": "definitions",
                    "plural": true,
                    "selections": (v9/*:: as any*/),
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
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
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "reason",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "DictionaryLexeme",
                    "kind": "LinkedField",
                    "name": "targetLexeme",
                    "plural": false,
                    "selections": [
                      (v4/*:: as any*/),
                      (v2/*:: as any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "DictionaryLexicalCategory",
                        "kind": "LinkedField",
                        "name": "lexicalCategory",
                        "plural": false,
                        "selections": [
                          (v5/*:: as any*/),
                          (v4/*:: as any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "DictionarySense",
                    "kind": "LinkedField",
                    "name": "targetSense",
                    "plural": false,
                    "selections": [
                      (v4/*:: as any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "DictionarySenseGloss",
                        "kind": "LinkedField",
                        "name": "glosses",
                        "plural": true,
                        "selections": [
                          (v6/*:: as any*/),
                          (v8/*:: as any*/),
                          (v4/*:: as any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "recommendations(first:3)"
              }
            ],
            "storageKey": null
          },
          (v4/*:: as any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "046267563cba81c9f7019d0d50a64639",
    "id": null,
    "metadata": {},
    "name": "DictionaryDetailPageQuery",
    "operationKind": "query",
    "text": "query DictionaryDetailPageQuery(\n  $lexemeId: ID!\n) {\n  dictionaryLexeme(id: $lexemeId) {\n    ...DictionaryLexemeDetail_lexeme\n    id\n  }\n}\n\nfragment DictionaryLexemeDetail_lexeme on DictionaryLexeme {\n  canonicalLemma\n  language {\n    code\n    name\n    id\n  }\n  lexicalCategory {\n    code\n    displayName\n    id\n  }\n  lemmas {\n    id\n    isPrimary\n    languageTag\n    value\n  }\n  forms {\n    id\n    representations {\n      id\n      languageTag\n      value\n    }\n    features {\n      id\n      key\n      label\n    }\n    pronunciations {\n      id\n      audioUrl\n      dialectTag\n      ipa\n      syllabification\n    }\n  }\n  senses {\n    id\n    order\n    glosses {\n      id\n      languageTag\n      text\n    }\n    examples {\n      id\n      languageTag\n      text\n      translations {\n        id\n        languageTag\n        text\n      }\n    }\n    narratives {\n      id\n      kind\n      languageTag\n      markdown\n    }\n    usages {\n      id\n      corpus\n      rank\n      regionTag\n      register\n      score\n    }\n    synset {\n      id\n      definitions {\n        id\n        languageTag\n        text\n      }\n    }\n    recommendations(first: 3) {\n      reason\n      targetLexeme {\n        id\n        canonicalLemma\n        lexicalCategory {\n          displayName\n          id\n        }\n      }\n      targetSense {\n        id\n        glosses {\n          languageTag\n          text\n          id\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "b3acfaf59d7d3bdd1a857b3ec6cb970d";

export default node;
