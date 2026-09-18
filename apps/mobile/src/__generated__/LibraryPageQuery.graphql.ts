/**
 * @generated SignedSource<<d1d7c25440d9caf7dd58c3d228c433f0>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type LibraryPageQuery$variables = Record<PropertyKey, never>;
export type LibraryPageQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"LibraryPage_items">;
};
export type LibraryPageQuery = {
  response: LibraryPageQuery$data;
  variables: LibraryPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 20
  }
],
v1 = {
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
    "name": "LibraryPageQuery",
    "selections": [
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "LibraryPage_items"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "LibraryPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*:: as any*/),
        "concreteType": "SavedLearningItemConnection",
        "kind": "LinkedField",
        "name": "mySavedLearningItems",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "totalCount",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "SavedLearningItemEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "SavedLearningItem",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v1/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "DictionaryLexeme",
                    "kind": "LinkedField",
                    "name": "lexeme",
                    "plural": false,
                    "selections": [
                      (v1/*:: as any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "canonicalLemma",
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
                    "name": "sense",
                    "plural": false,
                    "selections": [
                      (v1/*:: as any*/),
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
                          (v1/*:: as any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "__typename",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "cursor",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "PageInfo",
            "kind": "LinkedField",
            "name": "pageInfo",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "endCursor",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "hasNextPage",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "mySavedLearningItems(first:20)"
      },
      {
        "alias": null,
        "args": (v0/*:: as any*/),
        "filters": null,
        "handle": "connection",
        "key": "LibraryPage_mySavedLearningItems",
        "kind": "LinkedHandle",
        "name": "mySavedLearningItems"
      }
    ]
  },
  "params": {
    "cacheID": "753d405cfc2d3005753aa23c8d13b254",
    "id": null,
    "metadata": {},
    "name": "LibraryPageQuery",
    "operationKind": "query",
    "text": "query LibraryPageQuery {\n  ...LibraryPage_items\n}\n\nfragment LibraryPage_items on Query {\n  mySavedLearningItems(first: 20) {\n    totalCount\n    edges {\n      node {\n        id\n        lexeme {\n          id\n          canonicalLemma\n        }\n        sense {\n          id\n          glosses {\n            languageTag\n            text\n            id\n          }\n        }\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "cd95177bde92fdb6cd6755b37bfe2a5c";

export default node;
