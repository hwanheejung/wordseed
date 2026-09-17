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
      <Button label={status === "saved" ? "저장됨" : status === "error" ? "다시 저장" : "이 뜻 저장"} loading={isSaving} disabled={status === "saved"} onPress={handleSave} />
      {status === "error" && <Text accessibilityRole="alert" variant="caption">저장하지 못했어요. 다시 시도해 주세요.</Text>}
    </View>
  );
}
