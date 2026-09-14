/**
 * @generated SignedSource<<891d091067390adfce2034144f6d1a33>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DictionaryDetailPageQuery$variables = {
  entryId: string;
};
export type DictionaryDetailPageQuery$data = {
  readonly dictionaryEntry: {
    readonly " $fragmentSpreads": FragmentRefs<"DictionaryEntryDetail_entry">;
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
    "name": "entryId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "entryId"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "headword",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "languageTag",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "kind",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v6 = [
  (v5/*:: as any*/),
  (v3/*:: as any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "text",
    "storageKey": null
  }
],
v7 = {
  "alias": null,
  "args": null,
  "concreteType": "DictionarySynsetDefinition",
  "kind": "LinkedField",
  "name": "definitions",
  "plural": true,
  "selections": (v6/*:: as any*/),
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "concreteType": "DictionaryExample",
  "kind": "LinkedField",
  "name": "examples",
  "plural": true,
  "selections": [
    (v5/*:: as any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "sourceLanguageTag",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "sourceText",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "DictionaryExampleTranslation",
      "kind": "LinkedField",
      "name": "translations",
      "plural": true,
      "selections": (v6/*:: as any*/),
      "storageKey": null
    }
  ],
  "storageKey": null
};
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
        "concreteType": "DictionaryEntry",
        "kind": "LinkedField",
        "name": "dictionaryEntry",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "DictionaryEntryDetail_entry"
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
        "concreteType": "DictionaryEntry",
        "kind": "LinkedField",
        "name": "dictionaryEntry",
        "plural": false,
        "selections": [
          (v2/*:: as any*/),
          (v3/*:: as any*/),
          (v4/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "DictionarySense",
            "kind": "LinkedField",
            "name": "senses",
            "plural": true,
            "selections": [
              (v5/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "commonnessScore",
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
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "partOfSpeech",
                    "storageKey": null
                  },
                  (v7/*:: as any*/),
                  (v8/*:: as any*/),
                  (v5/*:: as any*/)
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
                  (v5/*:: as any*/),
                  (v4/*:: as any*/),
                  (v3/*:: as any*/),
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
              (v8/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "DictionaryForm",
                "kind": "LinkedField",
                "name": "forms",
                "plural": true,
                "selections": [
                  (v5/*:: as any*/),
                  (v4/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "surface",
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
                    "concreteType": "DictionaryEntry",
                    "kind": "LinkedField",
                    "name": "targetEntry",
                    "plural": false,
                    "selections": [
                      (v5/*:: as any*/),
                      (v2/*:: as any*/),
                      (v4/*:: as any*/)
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
                      (v5/*:: as any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "DictionarySynset",
                        "kind": "LinkedField",
                        "name": "synset",
                        "plural": false,
                        "selections": [
                          (v7/*:: as any*/),
                          (v5/*:: as any*/)
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
          (v5/*:: as any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "76e9aead73c99a6adfef79517f17a8b1",
    "id": null,
    "metadata": {},
    "name": "DictionaryDetailPageQuery",
    "operationKind": "query",
    "text": "query DictionaryDetailPageQuery(\n  $entryId: ID!\n) {\n  dictionaryEntry(id: $entryId) {\n    ...DictionaryEntryDetail_entry\n    id\n  }\n}\n\nfragment DictionaryEntryDetail_entry on DictionaryEntry {\n  headword\n  languageTag\n  kind\n  senses {\n    id\n    commonnessScore\n    synset {\n      partOfSpeech\n      definitions {\n        id\n        languageTag\n        text\n      }\n      examples {\n        id\n        sourceLanguageTag\n        sourceText\n        translations {\n          id\n          languageTag\n          text\n        }\n      }\n      id\n    }\n    narratives {\n      id\n      kind\n      languageTag\n      markdown\n    }\n    examples {\n      id\n      sourceLanguageTag\n      sourceText\n      translations {\n        id\n        languageTag\n        text\n      }\n    }\n    forms {\n      id\n      kind\n      surface\n    }\n    recommendations(first: 3) {\n      reason\n      targetEntry {\n        id\n        headword\n        kind\n      }\n      targetSense {\n        id\n        synset {\n          definitions {\n            id\n            languageTag\n            text\n          }\n          id\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "c30bf02b244ce81d8deb58a0756cc2b3";

export default node;
