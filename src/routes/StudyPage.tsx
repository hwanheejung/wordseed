import { useCardCollection } from "@/entities/card";
import {
  buildStudyQueue,
  LearningCardSession,
  startQueueAt,
} from "@/features/study-session";
import { PageLoadingState } from "../shared/ui/page-loading-state";

interface StudyPageProps {
  tag?: string;
  meaningId?: string;
  onBack: () => void;
}

export function StudyPage({
  tag,
  meaningId,
  onBack,
}: StudyPageProps) {
  const { cards, isLoading } = useCardCollection();
  const queue = buildStudyQueue(
    tag ? cards.filter((card) => card.tags.includes(tag)) : cards,
  );
  const startIndex = meaningId
    ? queue.findIndex((item) => item.meaning.id === meaningId)
    : 0;

  if (isLoading)
    return (
      <PageLoadingState
        title={tag ? `#${tag} 학습` : "학습 모드"}
        onBack={onBack}
      />
    );

  return (
    <LearningCardSession
      title={tag ? `#${tag} 학습` : "학습 모드"}
      items={startIndex > 0 ? startQueueAt(queue, startIndex) : queue}
      emptyTitle="학습할 단어가 없어요"
      emptyDescription="단어를 추가하거나 다른 학습 목록을 선택해 주세요."
      onBack={onBack}
    />
  );
}
