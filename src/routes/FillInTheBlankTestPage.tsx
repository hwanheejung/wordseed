import { useCardsQuery } from "@/entities/card";
import {
  buildFillInTheBlankQueue,
  FillInTheBlankTestSession,
} from "@/features/fill-in-the-blank-test";
import { PageLoadingState } from "../shared/ui/page-loading-state";
import { navigate } from "@/shared/navigation";
import { AppHeader } from "@/shared/ui/app-header";

export function FillInTheBlankTestPage() {
  const { cards, isLoading } = useCardsQuery();

  if (isLoading)
    return (
      <>
        <AppHeader title="빈칸 채우기" onBack={() => navigate({ page: "home" })} />
        <PageLoadingState />
      </>
    );

  return (
    <FillInTheBlankTestSession
      items={buildFillInTheBlankQueue(cards)}
      onBack={() => navigate({ page: "home" })}
    />
  );
}
