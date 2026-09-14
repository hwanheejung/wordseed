/**
 * @generated SignedSource<<14b21205560a41141731e519a0734d10>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type DictionaryEntryRecommendationReason = "ANTONYM" | "CONFUSABLE" | "DERIVATIVE" | "DERIVED_FROM" | "HYPERNYM" | "HYPONYM" | "RELATED" | "SAME_SYNSET" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type DictionaryEntryRecommendationSummary_recommendation$data = {
  readonly entry: {
    readonly " $fragmentSpreads": FragmentRefs<"DictionaryEntrySummary_entry">;
  };
  readonly reason: DictionaryEntryRecommendationReason;
  readonly " $fragmentType": "DictionaryEntryRecommendationSummary_recommendation";
};
export type DictionaryEntryRecommendationSummary_recommendation$key = {
  readonly " $data"?: DictionaryEntryRecommendationSummary_recommendation$data;
  readonly " $fragmentSpreads": FragmentRefs<"DictionaryEntryRecommendationSummary_recommendation">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DictionaryEntryRecommendationSummary_recommendation",
  "selections": [
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "reason",
        "storageKey": null
      },
      "action": "THROW"
    },
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "concreteType": "DictionaryEntry",
        "kind": "LinkedField",
        "name": "entry",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "DictionaryEntrySummary_entry"
          }
        ],
        "storageKey": null
      },
      "action": "THROW"
    }
  ],
  "type": "DictionaryEntryRecommendation",
  "abstractKey": null
};

(node as any).hash = "3db72e988fe324146d00e102d5453fec";

export default node;
