/**
 * @generated SignedSource<<a3fdc74cf53ce38fd504f4bf5de16b0c>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DictionaryDetailPageQuery$variables = {
  lexemeId: string;
};
export type DictionaryDetailPageQuery$data = {
  readonly dictionaryLexeme: {
    readonly canonicalLemma: string;
    readonly lexicalCategory: {
      readonly displayName: string;
    };
    readonly senses: ReadonlyArray<{
      readonly examples: ReadonlyArray<{
        readonly id: string;
        readonly text: string;
        readonly translations: ReadonlyArray<{
          readonly id: string;
          readonly text: string;
        }>;
      }>;
      readonly glosses: ReadonlyArray<{
        readonly id: string;
        readonly languageTag: string;
        readonly text: string;
      }>;
      readonly id: string;
      readonly order: number;
    }>;
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
  "name": "displayName",
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
  "name": "text",
  "storageKey": null
},
v6 = {
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
      "selections": [
        (v4/*:: as any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "languageTag",
          "storageKey": null
        },
        (v5/*:: as any*/)
      ],
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
        (v5/*:: as any*/),
        {
          "alias": null,
          "args": null,
          "concreteType": "DictionaryExampleTranslation",
          "kind": "LinkedField",
          "name": "translations",
          "plural": true,
          "selections": [
            (v4/*:: as any*/),
            (v5/*:: as any*/)
          ],
          "storageKey": null
        }
      ],
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
        "concreteType": "DictionaryLexeme",
        "kind": "LinkedField",
        "name": "dictionaryLexeme",
        "plural": false,
        "selections": [
          (v2/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "DictionaryLexicalCategory",
            "kind": "LinkedField",
            "name": "lexicalCategory",
            "plural": false,
            "selections": [
              (v3/*:: as any*/)
            ],
            "storageKey": null
          },
          (v6/*:: as any*/)
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
            "concreteType": "DictionaryLexicalCategory",
            "kind": "LinkedField",
            "name": "lexicalCategory",
            "plural": false,
            "selections": [
              (v3/*:: as any*/),
              (v4/*:: as any*/)
            ],
            "storageKey": null
          },
          (v6/*:: as any*/),
          (v4/*:: as any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "d9870b0b659682b9a440370da89bcb4a",
    "id": null,
    "metadata": {},
    "name": "DictionaryDetailPageQuery",
    "operationKind": "query",
    "text": "query DictionaryDetailPageQuery(\n  $lexemeId: ID!\n) {\n  dictionaryLexeme(id: $lexemeId) {\n    canonicalLemma\n    lexicalCategory {\n      displayName\n      id\n    }\n    senses {\n      id\n      order\n      glosses {\n        id\n        languageTag\n        text\n      }\n      examples {\n        id\n        text\n        translations {\n          id\n          text\n        }\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "c5b744ef3723bafea29c83bdc5dc060c";

export default node;
