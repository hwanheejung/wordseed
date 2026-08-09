import { useCardCollection } from "@/entities/card";
import {
  buildFocusQueue,
  LearningCardSession,
} from "@/features/study-session";
import { PageLoadingState } from "../shared/ui/page-loading-state";

interface FocusStudyPageProps {
  onBack: () => void;
}

export function FocusStudyPage({
  onBack,
}: FocusStudyPageProps) {
  const { cards, isLoading } = useCardCollection();

  if (isLoading)
    return <PageLoadingState title="몰랐어요 · 헷갈려요" onBack={onBack} />;

  return (
    <LearningCardSession
      title="몰랐어요 · 헷갈려요"
      items={buildFocusQueue(cards)}
      emptyTitle="집중 학습할 단어가 없어요"
      emptyDescription="몰랐어요 또는 헷갈려요로 표시한 단어가 여기에 모여요."
      onBack={onBack}
      removeCorrectFromQueue
    />
  );
}
