import type { TagStudyGroup } from "../utils/tag-study-groups";

interface TagStudyProgressCardProps {
  group: TagStudyGroup;
  onSelect: (tag: string) => void;
}

export function TagStudyProgressCard({
  group,
  onSelect,
}: TagStudyProgressCardProps) {
  return (
    <button
      className="flex min-h-[194px] w-full cursor-pointer flex-col items-center rounded-[20px] border border-[var(--seed-color-stroke-neutral-subtle)] bg-[var(--seed-color-bg-layer-default)] p-[18px] text-center text-inherit shadow-[0_5px_18px_rgba(0,0,0,.045)] active:scale-[.985] active:bg-[var(--seed-color-bg-layer-default-pressed)]"
      onClick={() => onSelect(group.tag)}
    >
      <b className="line-clamp-1 w-full text-[length:var(--seed-font-size-t6)] leading-[1.4]">
        {group.tag}
      </b>
      <div
        className="mt-4 grid size-20 place-items-center rounded-full"
        style={{
          background: `conic-gradient(var(--seed-color-fg-positive) ${group.correctPercentage}%, var(--seed-color-bg-layer-fill) 0)`,
        }}
        role="img"
        aria-label={`알고 있어요 ${group.correctPercentage}%`}
      >
        <span className="grid size-[62px] place-items-center rounded-full bg-[var(--seed-color-bg-layer-default)] text-[length:var(--seed-font-size-t5)] font-bold">
          {group.correctPercentage}%
        </span>
      </div>
      <span className="mt-2 text-[length:var(--seed-font-size-t3)] font-semibold text-[var(--seed-color-fg-neutral-subtle)]">
        {group.correctCount}/{group.cardCount}
      </span>
    </button>
  );
}
