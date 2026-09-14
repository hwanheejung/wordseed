/**
 * @generated SignedSource<<ae4eab3d25d5813a04a9f08aebd73062>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type DictionaryEntryKind = "EXPRESSION" | "WORD" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type DictionaryEntrySummary_entry$data = {
  readonly headword: string;
  readonly kind: DictionaryEntryKind;
  readonly senses: ReadonlyArray<{
    readonly synset: {
      readonly definitions: ReadonlyArray<{
        readonly languageTag: string;
        readonly text: string;
      }>;
    };
  }>;
  readonly " $fragmentType": "DictionaryEntrySummary_entry";
};
export type DictionaryEntrySummary_entry$key = {
  readonly " $data"?: DictionaryEntrySummary_entry$data;
  readonly " $fragmentSpreads": FragmentRefs<"DictionaryEntrySummary_entry">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DictionaryEntrySummary_entry",
  "selections": [
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "headword",
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
        "name": "kind",
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
              "concreteType": "DictionarySynset",
              "kind": "LinkedField",
              "name": "synset",
              "plural": false,
              "selections": [
                {
                  "kind": "RequiredField",
                  "field": {
                    "alias": null,
                    "args": null,
                    "concreteType": "DictionarySynsetDefinition",
                    "kind": "LinkedField",
                    "name": "definitions",
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
        "storageKey": null
      },
      "action": "THROW"
    }
  ],
  "type": "DictionaryEntry",
  "abstractKey": null
};

(node as any).hash = "957f123af487e4bbadbb0b431af57058";

export default node;
