import { BottomSheet, Chip } from "@seed-design/react";
import { IconChevronDownSmallLine } from "@karrotmarket/react-monochrome-icon";
import { useState } from "react";
import { ActionButton } from "seed-design/ui/action-button";

export function TagFilterSheet({
  options,
  selected,
  onChange,
}: {
  options: string[];
  selected: string[];
  onChange: (tags: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draftSelected, setDraftSelected] = useState(selected);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) setDraftSelected(selected);
    setOpen(nextOpen);
  };

  const toggleTag = (tag: string) =>
    setDraftSelected((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag],
    );

  return (
    <BottomSheet.Root open={open} onOpenChange={handleOpenChange}>
      <BottomSheet.Trigger asChild>
        <Chip.Root
          size="large"
          variant={selected.length === 0 ? "outlineStrong" : "solid"}
          aria-label="태그 필터"
        >
          <Chip.Label>
            {selected.length === 0
              ? "태그"
              : selected.length === 1
                ? `#${selected[0]}`
                : `태그 ${selected.length}`}
          </Chip.Label>
          <Chip.SuffixIcon>
            <IconChevronDownSmallLine />
          </Chip.SuffixIcon>
        </Chip.Root>
      </BottomSheet.Trigger>
      <BottomSheet.Backdrop className="!z-[100]" />
      <BottomSheet.Positioner className="!z-[100]">
        <BottomSheet.Content className="min-h-[50dvh] max-h-[72dvh]">
          <BottomSheet.Handle />
          <BottomSheet.Header>
            <BottomSheet.Title>태그로 필터</BottomSheet.Title>
          </BottomSheet.Header>
          <BottomSheet.Body className="overflow-y-auto">
            <div
              className="flex flex-wrap content-start gap-2 pb-5"
              aria-label="태그 선택"
            >
              {options.map((tag) => (
                <Chip.Root
                  key={tag}
                  size="medium"
                  variant={
                    draftSelected.includes(tag) ? "solid" : "outlineWeak"
                  }
                  aria-label={`#${tag}`}
                  aria-pressed={draftSelected.includes(tag)}
                  onClick={() => toggleTag(tag)}
                >
                  <Chip.Label>#{tag}</Chip.Label>
                </Chip.Root>
              ))}
            </div>
          </BottomSheet.Body>
          <BottomSheet.Footer className="!flex !flex-row gap-2 pb-[calc(12px+var(--seed-safe-area-bottom))]">
            <ActionButton
              variant="neutralWeak"
              size="large"
              className="min-w-0 justify-center"
              style={{ flexGrow: 3, flexShrink: 1, flexBasis: 0 }}
              disabled={draftSelected.length === 0}
              onClick={() => setDraftSelected([])}
            >
              초기화
            </ActionButton>
            <ActionButton
              size="large"
              className="min-w-0 justify-center"
              style={{ flexGrow: 7, flexShrink: 1, flexBasis: 0 }}
              onClick={() => {
                onChange(draftSelected);
                setOpen(false);
              }}
            >
              적용하기
              {draftSelected.length > 0 ? ` ${draftSelected.length}` : ""}
            </ActionButton>
          </BottomSheet.Footer>
        </BottomSheet.Content>
      </BottomSheet.Positioner>
    </BottomSheet.Root>
  );
}
