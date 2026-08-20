import { IconPlusLine } from "@karrotmarket/react-monochrome-icon";
import { Icon } from "@seed-design/react";
import { useState } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import { MagicExpressionManager } from "@/features/manage-magic-expressions";
import { navigate } from "@/shared/navigation";
import { AppHeader } from "@/shared/ui/app-header";

export function ToeflMagicExpressionsPage() {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <>
      <AppHeader
        title="Magic Expression"
        subtitle="Speaking Task 2"
        onBack={() => navigate({ page: "toefl" })}
        action={
          <ActionButton
            variant="ghost"
            size="medium"
            layout="iconOnly"
            aria-label="표현 추가"
            onClick={() => setAddOpen(true)}
          >
            <Icon svg={<IconPlusLine />} />
          </ActionButton>
        }
      />
      <MagicExpressionManager
        addOpen={addOpen}
        onAddOpenChange={setAddOpen}
      />
    </>
  );
}
