/**
 * @generated SignedSource<<18c35c8a6ac2dd600bf62ad20147f8a1>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DictionaryLexemeSummary_lexeme$data = {
  readonly canonicalLemma: string;
  readonly lexicalCategory: {
    readonly displayName: string;
  };
  readonly senses: ReadonlyArray<{
    readonly glosses: ReadonlyArray<{
      readonly languageTag: string;
      readonly text: string;
    }>;
    readonly id: string;
  }>;
  readonly " $fragmentType": "DictionaryLexemeSummary_lexeme";
};
export type DictionaryLexemeSummary_lexeme$key = {
  readonly " $data"?: DictionaryLexemeSummary_lexeme$data;
  readonly " $fragmentSpreads": FragmentRefs<"DictionaryLexemeSummary_lexeme">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DictionaryLexemeSummary_lexeme",
  "selections": [
    {
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
          {
            "kind": "RequiredField",
            "field": {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "displayName",
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
          {
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
                {
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
  "type": "DictionaryLexeme",
  "abstractKey": null
};

(node as any).hash = "5574016bdca3f71a5c6cfd6dfb35321b";

export default node;
