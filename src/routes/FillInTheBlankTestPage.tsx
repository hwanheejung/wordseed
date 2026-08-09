import { useCardCollection } from "@/entities/card";
import {
  buildFillInTheBlankQueue,
  FillInTheBlankTestSession,
} from "@/features/fill-in-the-blank-test";
import { PageLoadingState } from "../shared/ui/page-loading-state";

interface FillInTheBlankTestPageProps {
  onBack: () => void;
}

export function FillInTheBlankTestPage({
  onBack,
}: FillInTheBlankTestPageProps) {
  const { cards, isLoading } = useCardCollection();

  if (isLoading)
    return <PageLoadingState title="빈칸 채우기" onBack={onBack} />;

  return (
    <FillInTheBlankTestSession
      items={buildFillInTheBlankQueue(cards)}
      onBack={onBack}
    />
  );
}
