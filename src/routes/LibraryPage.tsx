import {
  Badge,
  Chip,
  Flex,
  Icon,
  Menu,
  TextField,
} from "@seed-design/react";
import {
  IconArrowClockwiseCircularLine,
  IconChevronDownSmallLine,
} from "@karrotmarket/react-monochrome-icon";
import { useCardCollection } from "@/entities/card";
import {
  getCardStatus,
  reviewResultMeta,
} from "@/entities/card";
import { LibraryBackupMenu } from "@/features/backup-library";
import { TagFilterSheet, useCardFilters } from "@/features/filter-cards";
import { AppHeader } from "../shared/ui/app-header";
import { EmptyState } from "../shared/ui/empty-state";

export function LibraryPage({
  onBack,
  onOpen,
}: {
  onBack: () => void;
  onOpen: (cardIds: string[], index: number) => void;
}) {
  const { cards } = useCardCollection();
  const {
    availableTags,
    filter,
    filtered,
    hasFilters,
    resetFilters,
    search,
    setFilter,
    setSearch,
    setSort,
    setTagFilter,
    sort,
    tagFilter,
  } = useCardFilters(cards);

  return (
    <>
      <AppHeader
        title="내 단어"
        subtitle={`전체 ${cards.length}개`}
        onBack={onBack}
        action={<LibraryBackupMenu />}
      />
      <main className="min-h-[calc(100vh-84px)] p-5 pb-[100px]">
        <TextField.Root>
          <TextField.Input
            aria-label="단어 또는 뜻 검색"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="단어 또는 뜻 검색"
          />
        </TextField.Root>
        <Flex
          className="-mx-5 !gap-3 overflow-x-auto !py-3 !pb-3.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>*]:shrink-0"
          align="center"
          aria-label="정렬과 필터"
        >
          {hasFilters && (
            <Chip.Root
              size="large"
              layout="iconOnly"
              variant="outlineStrong"
              aria-label="필터 초기화"
              onClick={resetFilters}
            >
              <Icon svg={<IconArrowClockwiseCircularLine />} />
            </Chip.Root>
          )}
          <Menu.Root size="medium" placement="bottom-start" gutter={6}>
            <Menu.Trigger asChild>
              <Chip.Root size="large" variant="solid" aria-label="단어 정렬">
                <Chip.Label>
                  {sort === "newest" ? "최신순" : "오래된순"}
                </Chip.Label>
                <Chip.SuffixIcon>
                  <IconChevronDownSmallLine />
                </Chip.SuffixIcon>
              </Chip.Root>
            </Menu.Trigger>
            <Menu.Positioner>
              <Menu.Content>
                <Menu.Item onClick={() => setSort("newest")}>
                  <Menu.ItemLabel>최신순</Menu.ItemLabel>
                </Menu.Item>
                <Menu.Item onClick={() => setSort("oldest")}>
                  <Menu.ItemLabel>오래된순</Menu.ItemLabel>
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>
          <Menu.Root size="medium" placement="bottom-start" gutter={6}>
            <Menu.Trigger asChild>
              <Chip.Root
                size="large"
                variant={filter === "all" ? "outlineStrong" : "solid"}
                aria-label="학습 상태"
              >
                <Chip.Label>
                  {filter === "all" ? "학습 상태" : reviewResultMeta[filter].label}
                </Chip.Label>
                <Chip.SuffixIcon>
                  <IconChevronDownSmallLine />
                </Chip.SuffixIcon>
              </Chip.Root>
            </Menu.Trigger>
            <Menu.Positioner>
              <Menu.Content>
                {(["unknown", "confusing", "correct"] as const).map((value) => (
                  <Menu.Item key={value} onClick={() => setFilter(value)}>
                    <Menu.ItemLabel>{reviewResultMeta[value].label}</Menu.ItemLabel>
                  </Menu.Item>
                ))}
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>
          {availableTags.length > 0 && (
            <TagFilterSheet
              options={availableTags}
              selected={tagFilter}
              onChange={setTagFilter}
            />
          )}
        </Flex>
        <div className="grid gap-2.5">
          {filtered.map((card, index) => (
            <article
              key={card.id}
              className="overflow-hidden rounded-[20px] border border-[var(--seed-color-stroke-neutral-subtle)] bg-[var(--seed-color-bg-layer-default)]"
            >
              <button
                className="grid min-h-[100px] w-full cursor-pointer grid-cols-[1fr_auto] gap-3 border-0 bg-transparent p-4 text-left text-inherit [&>span]:self-center [&>span]:text-2xl [&>span]:text-[var(--seed-color-fg-neutral-subtle)] [&_p]:mt-[7px] [&_p]:mb-1 [&_p]:text-[var(--seed-color-fg-neutral-muted)] [&_small]:text-[var(--seed-color-fg-neutral-subtle)]"
                onClick={() =>
                  onOpen(
                    filtered.map((item) => item.id),
                    index,
                  )
                }
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="m-0 text-[length:var(--seed-font-size-t6)]">
                      {card.term}
                    </h2>
                    <Badge
                      tone={reviewResultMeta[getCardStatus(card)].tone}
                      variant="weak"
                    >
                      {reviewResultMeta[getCardStatus(card)].label}
                    </Badge>
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
          ))}
          {!filtered.length && (
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
