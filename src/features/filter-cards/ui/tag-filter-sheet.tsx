import { MultiSelectFilterSheet } from "./multi-select-filter-sheet";

interface TagFilterSheetProps {
  options: string[];
  selected: string[];
  onChange: (tags: string[]) => void;
}

export function TagFilterSheet({
  options,
  selected,
  onChange,
}: TagFilterSheetProps) {
  return (
    <MultiSelectFilterSheet
      ariaLabel="태그 필터"
      title="태그"
      triggerLabel={
        selected.length === 0
          ? "태그"
          : selected.length === 1
            ? `#${selected[0]}`
            : `태그 ${selected.length}`
      }
      options={options.map((tag) => ({ value: tag, label: `#${tag}` }))}
      selected={selected}
      onChange={onChange}
    />
  );
}
