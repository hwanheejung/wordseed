import {
  buildTagStudyGroups,
  TagStudyProgressCard,
  useCardsQuery,
} from "@/entities/card";
import { navigate } from "@/shared/navigation";
import { AppHeader } from "@/shared/ui/app-header";
import { EmptyState } from "@/shared/ui/empty-state";

export function AllTagsPage() {
  const { cards } = useCardsQuery();
  const groups = buildTagStudyGroups(cards);

  return (
    <>
      <AppHeader
        title="전체 태그"
        subtitle={`${groups.length}개 태그`}
        onBack={() => navigate({ page: "home" })}
      />
      <main className="p-5">
        {groups.length ? (
          <section
            className="grid grid-cols-2 gap-3"
            aria-label="전체 태그"
          >
            {groups.map((group) => (
              <TagStudyProgressCard
                key={group.tag}
                group={group}
                onSelect={(tag) => navigate({ page: "study", tag })}
              />
            ))}
          </section>
        ) : (
          <EmptyState
            title="아직 태그가 없어요"
            description="카드에 태그를 추가하면 태그별로 학습할 수 있어요."
          />
        )}
      </main>
    </>
  );
}
