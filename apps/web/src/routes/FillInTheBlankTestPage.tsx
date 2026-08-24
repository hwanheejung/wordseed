import { useCardsQuery } from "@/entities/card";
import {
  buildFillInTheBlankQueue,
  FillInTheBlankTestSession,
} from "@/features/fill-in-the-blank-test";
import { PageLoadingState } from "../shared/ui/page-loading-state";
import { navigate } from "@/shared/navigation";
import { AppHeader } from "@/shared/ui/app-header";

interface FillInTheBlankTestPageProps {
  tag?: string;
}

export function FillInTheBlankTestPage({ tag }: FillInTheBlankTestPageProps) {
  const { cards, isLoading } = useCardsQuery(tag ? { tags: [tag] } : undefined);

  const handleBack = () =>
    navigate({ page: tag ? "all-tags" : "home" });

  if (isLoading)
    return (
      <>
        <AppHeader
          title={tag ? `#${tag} 빈칸 채우기` : "빈칸 채우기"}
          onBack={handleBack}
        />
        <PageLoadingState />
      </>
    );

  return (
    <FillInTheBlankTestSession
      title={tag ? `#${tag} 빈칸 채우기` : "빈칸 채우기"}
      items={buildFillInTheBlankQueue(cards)}
      onBack={handleBack}
    />
  );
}
