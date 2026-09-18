/**
 * @generated SignedSource<<d9c68a7cdcb763129441b3526db2b5be>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type completeSignInMutation$variables = Record<PropertyKey, never>;
export type completeSignInMutation$data = {
  readonly completeSignIn: {
    readonly id: string;
  };
};
export type completeSignInMutation = {
  response: completeSignInMutation$data;
  variables: completeSignInMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "User",
    "kind": "LinkedField",
    "name": "completeSignIn",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "completeSignInMutation",
    "selections": (v0/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "completeSignInMutation",
    "selections": (v0/*:: as any*/)
  },
  "params": {
    "cacheID": "aa9df68ecfdd9b9a88761a779191b5ab",
    "id": null,
    "metadata": {},
    "name": "completeSignInMutation",
    "operationKind": "mutation",
    "text": "mutation completeSignInMutation {\n  completeSignIn {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "07aa44d52773f3ef4f8164186ed5c622";

export default node;
