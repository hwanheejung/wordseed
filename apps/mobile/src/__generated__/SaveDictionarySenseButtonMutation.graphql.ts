/**
 * @generated SignedSource<<843d3aefc3260aa7e240e824c26eeae2>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type SaveDictionarySenseButtonMutation$variables = {
  senseId: string;
};
export type SaveDictionarySenseButtonMutation$data = {
  readonly saveDictionarySense: {
    readonly addedAt: any;
    readonly id: string;
    readonly sense: {
      readonly id: string;
    };
  };
};
export type SaveDictionarySenseButtonMutation = {
  response: SaveDictionarySenseButtonMutation$data;
  variables: SaveDictionarySenseButtonMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "senseId"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "senseId",
        "variableName": "senseId"
      }
    ],
    "concreteType": "SavedLearningItem",
    "kind": "LinkedField",
    "name": "saveDictionarySense",
    "plural": false,
    "selections": [
      (v1/*:: as any*/),
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "addedAt",
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
          (v1/*:: as any*/)
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "SaveDictionarySenseButtonMutation",
    "selections": (v2/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "SaveDictionarySenseButtonMutation",
    "selections": (v2/*:: as any*/)
  },
  "params": {
    "cacheID": "b16dabd5d6ce2478fdf228cef7140166",
    "id": null,
    "metadata": {},
    "name": "SaveDictionarySenseButtonMutation",
    "operationKind": "mutation",
    "text": "mutation SaveDictionarySenseButtonMutation(\n  $senseId: ID!\n) {\n  saveDictionarySense(senseId: $senseId) {\n    id\n    addedAt\n    sense {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "3a16c61314cf988814fa3af2fb55e783";

export default node;
