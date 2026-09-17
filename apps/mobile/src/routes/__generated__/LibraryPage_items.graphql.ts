/**
 * @generated SignedSource<<04e3b49587936c2d03033ba1307bb926>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type LibraryPage_items$data = {
  readonly mySavedLearningItems: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly lexeme: {
          readonly canonicalLemma: string;
          readonly id: string;
        };
        readonly sense: {
          readonly glosses: ReadonlyArray<{
            readonly languageTag: string;
            readonly text: string;
          }>;
          readonly id: string;
        };
      };
    }>;
    readonly totalCount: number;
  };
  readonly " $fragmentType": "LibraryPage_items";
};
export type LibraryPage_items$key = {
  readonly " $data"?: LibraryPage_items$data;
  readonly " $fragmentSpreads": FragmentRefs<"LibraryPage_items">;
};

import LibraryPagePaginationQuery_graphql from './LibraryPagePaginationQuery.graphql';

const node: ReaderFragment = (function(){
var v0 = [
  "mySavedLearningItems"
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
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
      "operation": LibraryPagePaginationQuery_graphql
    }
  },
  "name": "LibraryPage_items",
  "selections": [
    {
      "alias": "mySavedLearningItems",
      "args": null,
      "concreteType": "SavedLearningItemConnection",
      "kind": "LinkedField",
      "name": "__LibraryPage_mySavedLearningItems_connection",
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

(node as any).hash = "a73b976be6134e2b4e026e562e57f189";

export default node;
