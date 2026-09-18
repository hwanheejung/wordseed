import { commitMutation, graphql } from "react-relay";
import type { Environment } from "relay-runtime";
import type { completeSignInMutation } from "@/__generated__/completeSignInMutation.graphql";

export function completeSignIn(environment: Environment): Promise<string> {
  return new Promise((resolve, reject) => {
    commitMutation<completeSignInMutation>(environment, {
      mutation: graphql`
        mutation completeSignInMutation {
          completeSignIn { id }
        }
      `,
      variables: {},
      onCompleted: (response, errors) => {
        if (errors?.length || !response.completeSignIn?.id) {
          reject(new Error("Unable to initialize the Wordseed user."));
          return;
        }
        resolve(response.completeSignIn.id);
      },
      onError: reject,
    });
  });
}
