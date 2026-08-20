import {
  Badge,
  Chip,
  Flex,
  Icon,
  Menu,
  TextField,
} from "@seed-design/react";
import { useEffect, useLayoutEffect, useReducer, useRef } from "react";
import {
  IconArrowClockwiseCircularLine,
  IconChevronDownSmallLine,
} from "@karrotmarket/react-monochrome-icon";
import {
  getReviewedCardStatus,
  reviewResultMeta,
  shouldRecheckMeaning,
  useCardsQuery,
  useRecentlyRepeatedUnknownCardIds,
  useReviewStatsQuery,
} from "@/entities/card";
import { LibraryBackupMenu } from "@/features/backup-library";
import {
  libraryFiltersReducer,
  libraryStudyFilterOptions,
  readLibraryFilters,
  TagFilterSheet,
} from "@/features/filter-cards";
import { navigate, replaceNavigationEntry } from "@/shared/navigation";
import { AppHeader } from "../shared/ui/app-header";
import { EmptyState } from "../shared/ui/empty-state";

interface LibraryPageProps {
  initialScrollTop?: number;
}

export function LibraryPage({ initialScrollTop }: LibraryPageProps) {
  const [filters, dispatch] = useReducer(
    libraryFiltersReducer,
    undefined,
    readLibraryFilters,
  );
  const recentlyRepeatedUnknownCardIds =
    useRecentlyRepeatedUnknownCardIds(3);
  const reviewStats = useReviewStatsQuery();
  const {
    cards: queriedCards,
    availableTags,
    totalCount,
    isLoading,
  } = useCardsQuery({
    search: filters.search,
    status:
      filters.status === "unknown" ||
      filters.status === "confusing" ||
      filters.status === "correct"
        ? filters.status
        : undefined,
    ids:
      filters.status === "recently-repeated-unknown"
        ? recentlyRepeatedUnknownCardIds
        : undefined,
    tags: filters.tags,
    sort: filters.sort,
  });
  const cards =
    filters.status === "needs-review"
      ? queriedCards.filter((card) =>
          card.meanings.some((meaning) =>
            shouldRecheckMeaning(meaning.status, reviewStats[meaning.id]),
          ),
        )
      : queriedCards;
  const mainRef = useRef<HTMLElement>(null);
  const didRestoreScroll = useRef(initialScrollTop === undefined);

  const handleCardSelect = (index: number) => {
    replaceNavigationEntry({
      page: "library",
      scrollTop: mainRef.current?.scrollTop ?? 0,
    });
    navigate({
      page: "card",
      cardIds: cards.map((item) => item.id),
      startIndex: index,
    });
  };

  // Restore the Wordbook scroll container from browser history after its cards load.
  useLayoutEffect(() => {
    if (
      didRestoreScroll.current ||
      isLoading ||
      !cards.length ||
      !mainRef.current
    )
      return;

    mainRef.current.scrollTop = initialScrollTop ?? 0;
    didRestoreScroll.current = true;
  }, [cards.length, initialScrollTop, isLoading]);

  // Synchronize the declarative library query variables with the browser URL.
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("sort", filters.sort);
    if (filters.status !== "all") params.set("status", filters.status);
    filters.tags.forEach((tag) => params.append("tag", tag));
    if (filters.search.trim()) params.set("q", filters.search.trim());
    replaceNavigationEntry(
      { page: "library", scrollTop: initialScrollTop },
      `/library?${params.toString()}`,
    );
  }, [filters, initialScrollTop]);

  return (
    <>
      <AppHeader
        title="내 단어"
        subtitle={`전체 ${totalCount}개`}
        onBack={() => navigate({ page: "home" })}
        action={<LibraryBackupMenu />}
      />
      <main
        ref={mainRef}
        className="min-h-[calc(100vh-84px)] p-5 pb-[100px]"
      >
        <TextField.Root>
          <TextField.Input
            aria-label="단어 또는 뜻 검색"
            value={filters.search}
            onChange={(event) =>
              dispatch({ type: "searchChanged", search: event.target.value })
            }
            placeholder="단어 또는 뜻 검색"
          />
        </TextField.Root>
        <Flex
          className="-mx-5 !gap-3 !overflow-x-auto !px-5 !py-3 !pb-3.5 [touch-action:pan-x_pan-y] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>*]:shrink-0"
          align="center"
          aria-label="정렬과 필터"
        >
          {(filters.status !== "all" || filters.tags.length > 0) && (
            <Chip.Root
              size="large"
              layout="iconOnly"
              variant="outlineStrong"
              aria-label="필터 초기화"
              onClick={() => dispatch({ type: "filtersReset" })}
            >
              <Icon svg={<IconArrowClockwiseCircularLine />} />
            </Chip.Root>
          )}
          <Menu.Root size="medium" placement="bottom-start" gutter={6}>
            <Menu.Trigger asChild>
              <Chip.Root size="large" variant="solid" aria-label="단어 정렬">
                <Chip.Label>
                  {filters.sort === "newest" ? "최신순" : "오래된순"}
                </Chip.Label>
                <Chip.SuffixIcon>
                  <IconChevronDownSmallLine />
                </Chip.SuffixIcon>
              </Chip.Root>
            </Menu.Trigger>
            <Menu.Positioner>
              <Menu.Content>
                <Menu.Item
                  onClick={() =>
                    dispatch({ type: "sortChanged", sort: "newest" })
                  }
                >
                  <Menu.ItemLabel>최신순</Menu.ItemLabel>
                </Menu.Item>
                <Menu.Item
                  onClick={() =>
                    dispatch({ type: "sortChanged", sort: "oldest" })
                  }
                >
                  <Menu.ItemLabel>오래된순</Menu.ItemLabel>
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>
          <Menu.Root size="medium" placement="bottom-start" gutter={6}>
            <Menu.Trigger asChild>
              <Chip.Root
                size="large"
                variant={filters.status === "all" ? "outlineStrong" : "solid"}
                aria-label="학습 상태"
              >
                <Chip.Label>
                  {filters.status === "all"
                    ? "학습 상태"
                    : libraryStudyFilterOptions.find(
                        ({ value }) => value === filters.status,
                      )?.label}
                </Chip.Label>
                <Chip.SuffixIcon>
                  <IconChevronDownSmallLine />
                </Chip.SuffixIcon>
              </Chip.Root>
            </Menu.Trigger>
            <Menu.Positioner>
              <Menu.Content>
                {libraryStudyFilterOptions.map(({ value, label }) => (
                  <Menu.Item
                    key={value}
                    onClick={() =>
                      dispatch({ type: "statusChanged", status: value })
                    }
                  >
                    <Menu.ItemLabel>{label}</Menu.ItemLabel>
                  </Menu.Item>
                ))}
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>
          {availableTags.length > 0 && (
            <TagFilterSheet
              options={availableTags}
              selected={filters.tags}
              onChange={(tags) => dispatch({ type: "tagsChanged", tags })}
            />
          )}
        </Flex>
        <div className="grid gap-2.5">
          {cards.map((card, index) => {
            const reviewedStatus = getReviewedCardStatus(card, reviewStats);

            return (
              <article
                key={card.id}
                className="overflow-hidden rounded-[20px] border border-[var(--seed-color-stroke-neutral-subtle)] bg-[var(--seed-color-bg-layer-default)]"
              >
                <button
                  className="grid min-h-[100px] w-full cursor-pointer grid-cols-[1fr_auto] gap-3 border-0 bg-transparent p-4 text-left text-inherit [&>span]:self-center [&>span]:text-2xl [&>span]:text-[var(--seed-color-fg-neutral-subtle)] [&_p]:mt-[7px] [&_p]:mb-1 [&_p]:text-[var(--seed-color-fg-neutral-muted)] [&_small]:text-[var(--seed-color-fg-neutral-subtle)]"
                  onClick={() => handleCardSelect(index)}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="m-0 text-[length:var(--seed-font-size-t6)]">
                        {card.term}
                      </h2>
                      {reviewedStatus && (
                        <Badge
                          tone={reviewResultMeta[reviewedStatus].tone}
                          variant="weak"
                        >
                          {reviewResultMeta[reviewedStatus].label}
                        </Badge>
                      )}
                    </div>
                    <p>
                      {card.meanings
                        .map((meaning) => meaning.definitionKo)
                        .join(" · ")}
                    </p>
                    {card.tags.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5 [&_small]:rounded-full [&_small]:bg-[var(--seed-color-bg-neutral-weak)] [&_small]:px-[7px] [&_small]:py-1">
                        {card.tags.map((tag) => (
                          <small key={tag}>#{tag}</small>
                        ))}
                      </div>
                    )}
                  </div>
                  <span>›</span>
                </button>
              </article>
            );
          })}
          {!cards.length && (
            <EmptyState
              title="일치하는 단어가 없어요"
              description="검색어나 필터를 바꿔 보세요."
            />
          )}
        </div>
      </main>
    </>
  );
}
