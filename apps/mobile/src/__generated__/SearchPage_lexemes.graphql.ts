/**
 * @generated SignedSource<<25f69c8822d6c7360baaefb881705de2>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SearchPage_lexemes$data = {
  readonly dictionaryLexemes: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly canonicalLemma: string;
        readonly id: string;
        readonly lexicalCategory: {
          readonly displayName: string;
        };
        readonly senses: ReadonlyArray<{
          readonly glosses: ReadonlyArray<{
            readonly languageTag: string;
            readonly text: string;
          }>;
        }>;
      };
    }>;
    readonly totalCount: number;
  };
  readonly " $fragmentType": "SearchPage_lexemes";
};
export type SearchPage_lexemes$key = {
  readonly " $data"?: SearchPage_lexemes$data;
  readonly " $fragmentSpreads": FragmentRefs<"SearchPage_lexemes">;
};

import SearchPagePaginationQuery_graphql from './SearchPagePaginationQuery.graphql';

const node: ReaderFragment = (function(){
var v0 = [
  "dictionaryLexemes"
];
return {
  "argumentDefinitions": [
    {
      "defaultValue": 20,
      "kind": "LocalArgument",
      "name": "count"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "cursor"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "query"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "connection": [
      {
        "count": "count",
        "cursor": "cursor",
        "direction": "forward",
        "path": (v0/*:: as any*/)
      }
    ],
    "refetch": {
      "connection": {
        "forward": {
          "count": "count",
          "cursor": "cursor"
        },
        "backward": null,
        "path": (v0/*:: as any*/)
      },
      "fragmentPathInResult": [],
      "operation": SearchPagePaginationQuery_graphql
    }
  },
  "name": "SearchPage_lexemes",
  "selections": [
    {
      "alias": "dictionaryLexemes",
      "args": [
        {
          "kind": "Literal",
          "name": "languageTag",
          "value": "en"
        },
        {
          "kind": "Variable",
          "name": "query",
          "variableName": "query"
        }
      ],
      "concreteType": "DictionaryLexemeConnection",
      "kind": "LinkedField",
      "name": "__SearchPage_dictionaryLexemes_connection",
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
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "id",
                  "storageKey": null
                },
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
      "storageKey": null
    }
  ],
  "type": "Query",
  "abstractKey": null
};
})();

(node as any).hash = "48fce8ebe8e878ab81b7c0da87ad39c2";

export default node;
