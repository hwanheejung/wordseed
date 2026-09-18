import { useState } from "react";
import { View } from "react-native";
import { graphql, useMutation } from "react-relay";
import { Button, Text } from "@/shared/ui";
import type { SaveDictionarySenseButtonMutation } from "./__generated__/SaveDictionarySenseButtonMutation.graphql";

interface SaveDictionarySenseButtonProps { senseId: string }

export function SaveDictionarySenseButton({ senseId }: SaveDictionarySenseButtonProps) {
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [commit, isSaving] = useMutation<SaveDictionarySenseButtonMutation>(graphql`
    mutation SaveDictionarySenseButtonMutation($senseId: ID!) {
      saveDictionarySense(senseId: $senseId) { id addedAt sense { id } }
    }
  `);

  function handleSave() {
    setStatus("idle");
    commit({
      variables: { senseId },
      updater: (store) => {
        if (store.getRootField("saveDictionarySense")) store.invalidateStore();
      },
      onCompleted: (response, errors) => setStatus(errors?.length || !response.saveDictionarySense ? "error" : "saved"),
      onError: () => setStatus("error"),
    });
  }

  return (
    <View style={{ gap: 8 }}>
      <Button label={status === "saved" ? "Saved" : status === "error" ? "Try again" : "Save meaning"} loading={isSaving} disabled={status === "saved"} onPress={handleSave} />
      {status === "error" && <Text accessibilityRole="alert" variant="caption">Couldn’t save this meaning. Try again.</Text>}
    </View>
  );
}
