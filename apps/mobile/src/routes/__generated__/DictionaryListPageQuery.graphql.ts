/**
 * @generated SignedSource<<07647ff986ff765e414ff80ba029d5d0>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DictionaryListPageQuery$variables = Record<PropertyKey, never>;
export type DictionaryListPageQuery$data = {
  readonly dictionaryEntries: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly " $fragmentSpreads": FragmentRefs<"DictionaryEntrySummary_entry">;
      };
    }>;
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
    "value": 50
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
    "name": "DictionaryListPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*:: as any*/),
        "concreteType": "DictionaryEntryConnection",
        "kind": "LinkedField",
        "name": "dictionaryEntries",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "DictionaryEntryEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "DictionaryEntry",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v1/*:: as any*/),
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "DictionaryEntrySummary_entry"
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "dictionaryEntries(first:50)"
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
        "concreteType": "DictionaryEntryConnection",
        "kind": "LinkedField",
        "name": "dictionaryEntries",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "DictionaryEntryEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "DictionaryEntry",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v1/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "headword",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "kind",
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
                            "concreteType": "DictionarySynsetDefinition",
                            "kind": "LinkedField",
                            "name": "definitions",
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
                          },
                          (v1/*:: as any*/)
                        ],
                        "storageKey": null
                      },
                      (v1/*:: as any*/)
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
        "storageKey": "dictionaryEntries(first:50)"
      }
    ]
  },
  "params": {
    "cacheID": "c530437720b72a51082233ae58609018",
    "id": null,
    "metadata": {},
    "name": "DictionaryListPageQuery",
    "operationKind": "query",
    "text": "query DictionaryListPageQuery {\n  dictionaryEntries(first: 50) {\n    edges {\n      node {\n        id\n        ...DictionaryEntrySummary_entry\n      }\n    }\n  }\n}\n\nfragment DictionaryEntrySummary_entry on DictionaryEntry {\n  headword\n  kind\n  senses {\n    synset {\n      definitions {\n        languageTag\n        text\n        id\n      }\n      id\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "ca17b89b6d96f5e062012af7796a5653";

export default node;
