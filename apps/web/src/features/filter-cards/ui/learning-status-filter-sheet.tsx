import type { CardLearningStatus } from "@/entities/card";
import { libraryLearningStatusOptions } from "../reducers/library-filters-reducer";
import { MultiSelectFilterSheet } from "./multi-select-filter-sheet";

interface LearningStatusFilterSheetProps {
  selected: CardLearningStatus[];
  onChange: (statuses: CardLearningStatus[]) => void;
}

export function LearningStatusFilterSheet({
  selected,
  onChange,
}: LearningStatusFilterSheetProps) {
  const selectedLabel = libraryLearningStatusOptions.find(
    ({ value }) => value === selected[0],
  )?.label;

  return (
    <MultiSelectFilterSheet
      ariaLabel="학습 상태 필터"
      title="학습 상태"
      triggerLabel={
        selected.length === 0
          ? "학습 상태"
          : selected.length === 1
            ? selectedLabel ?? "학습 상태"
            : `학습 상태 ${selected.length}`
      }
      options={libraryLearningStatusOptions}
      selected={selected}
      onChange={onChange}
    />
  );
}
