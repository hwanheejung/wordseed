/**
 * @generated SignedSource<<63a810f5c2f77bc3be20b4453c485d6d>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DictionaryListPageQuery$variables = Record<PropertyKey, never>;
export type DictionaryListPageQuery$data = {
  readonly dictionaryLexemes: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly " $fragmentSpreads": FragmentRefs<"DictionaryLexemeSummary_lexeme">;
      };
    }>;
    readonly totalCount: number;
  };
};
export type DictionaryListPageQuery = {
  response: DictionaryListPageQuery$data;
  variables: DictionaryListPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 100
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "totalCount",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "DictionaryListPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*:: as any*/),
        "concreteType": "DictionaryLexemeConnection",
        "kind": "LinkedField",
        "name": "dictionaryLexemes",
        "plural": false,
        "selections": [
          (v1/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "DictionaryLexemeEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "DictionaryLexeme",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v2/*:: as any*/),
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "DictionaryLexemeSummary_lexeme"
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "dictionaryLexemes(first:100)"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "DictionaryListPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*:: as any*/),
        "concreteType": "DictionaryLexemeConnection",
        "kind": "LinkedField",
        "name": "dictionaryLexemes",
        "plural": false,
        "selections": [
          (v1/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "DictionaryLexemeEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "DictionaryLexeme",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v2/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "canonicalLemma",
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
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "displayName",
                        "storageKey": null
                      },
                      (v2/*:: as any*/)
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
                      (v2/*:: as any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "DictionarySenseGloss",
                        "kind": "LinkedField",
                        "name": "glosses",
                        "plural": true,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "languageTag",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "text",
                            "storageKey": null
                          },
                          (v2/*:: as any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "dictionaryLexemes(first:100)"
      }
    ]
  },
  "params": {
    "cacheID": "9a776a007c9593d4a4ff4e343657b84a",
    "id": null,
    "metadata": {},
    "name": "DictionaryListPageQuery",
    "operationKind": "query",
    "text": "query DictionaryListPageQuery {\n  dictionaryLexemes(first: 100) {\n    totalCount\n    edges {\n      node {\n        id\n        ...DictionaryLexemeSummary_lexeme\n      }\n    }\n  }\n}\n\nfragment DictionaryLexemeSummary_lexeme on DictionaryLexeme {\n  canonicalLemma\n  lexicalCategory {\n    displayName\n    id\n  }\n  senses {\n    id\n    glosses {\n      languageTag\n      text\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "d9d32703d6c29e4b3280d0915505286b";

export default node;
