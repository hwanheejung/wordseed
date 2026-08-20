import { IconChevronDownSmallLine } from "@karrotmarket/react-monochrome-icon";
import { BottomSheet, Chip } from "@seed-design/react";
import { useState } from "react";
import { ActionButton } from "seed-design/ui/action-button";

interface MultiSelectOption<T extends string> {
  value: T;
  label: string;
}

interface MultiSelectFilterSheetProps<T extends string> {
  ariaLabel: string;
  title: string;
  triggerLabel: string;
  options: Array<MultiSelectOption<T>>;
  selected: T[];
  onChange: (selected: T[]) => void;
}

export function MultiSelectFilterSheet<T extends string>({
  ariaLabel,
  title,
  triggerLabel,
  options,
  selected,
  onChange,
}: MultiSelectFilterSheetProps<T>) {
  const [open, setOpen] = useState(false);
  const [draftSelected, setDraftSelected] = useState(selected);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) setDraftSelected(selected);
    setOpen(nextOpen);
  };

  const toggleOption = (value: T) =>
    setDraftSelected((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );

  return (
    <BottomSheet.Root open={open} onOpenChange={handleOpenChange}>
      <BottomSheet.Trigger asChild>
        <Chip.Root
          size="large"
          variant={selected.length === 0 ? "outlineStrong" : "solid"}
          aria-label={ariaLabel}
        >
          <Chip.Label>{triggerLabel}</Chip.Label>
          <Chip.SuffixIcon>
            <IconChevronDownSmallLine />
          </Chip.SuffixIcon>
        </Chip.Root>
      </BottomSheet.Trigger>
      <BottomSheet.Backdrop className="!z-[100]" />
      <BottomSheet.Positioner className="!z-[100]">
        <BottomSheet.Content className="min-h-[42dvh] max-h-[72dvh]">
          <BottomSheet.Handle />
          <BottomSheet.Header>
            <BottomSheet.Title>{title}</BottomSheet.Title>
          </BottomSheet.Header>
          <BottomSheet.Body className="overflow-y-auto">
            <div
              className="flex flex-wrap content-start gap-2 pb-5"
              aria-label={`${title} 선택`}
            >
              {options.map((option) => (
                <Chip.Root
                  key={option.value}
                  size="medium"
                  variant={
                    draftSelected.includes(option.value)
                      ? "solid"
                      : "outlineWeak"
                  }
                  aria-label={option.label}
                  aria-pressed={draftSelected.includes(option.value)}
                  onClick={() => toggleOption(option.value)}
                >
                  <Chip.Label>{option.label}</Chip.Label>
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
              선택 해제
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
              필터 적용
              {draftSelected.length > 0 ? ` ${draftSelected.length}` : ""}
            </ActionButton>
          </BottomSheet.Footer>
        </BottomSheet.Content>
      </BottomSheet.Positioner>
    </BottomSheet.Root>
  );
}
