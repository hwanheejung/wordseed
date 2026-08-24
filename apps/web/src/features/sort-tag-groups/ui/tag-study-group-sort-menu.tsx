import { IconChevronDownSmallLine } from "@karrotmarket/react-monochrome-icon";
import { Chip, Menu } from "@seed-design/react";
import type { TagStudyGroupSort } from "@/entities/card";

interface TagStudyGroupSortMenuProps {
  sort: TagStudyGroupSort;
  onChange: (sort: TagStudyGroupSort) => void;
}

const TAG_SORT_OPTIONS = [
  { value: "name", label: "이름순" },
  { value: "recentlyReviewed", label: "최근 학습한 순" },
  { value: "leastRecentlyReviewed", label: "오래전에 학습한 순" },
  { value: "learningPriority", label: "학습률 낮은 순" },
] satisfies Array<{ value: TagStudyGroupSort; label: string }>;

export function TagStudyGroupSortMenu({
  sort,
  onChange,
}: TagStudyGroupSortMenuProps) {
  return (
    <Menu.Root size="medium" placement="bottom-end" gutter={6}>
      <Menu.Trigger asChild>
        <Chip.Root size="large" variant="solid" aria-label="태그 정렬">
          <Chip.Label>
            {
              TAG_SORT_OPTIONS.find((option) => option.value === sort)
                ?.label
            }
          </Chip.Label>
          <Chip.SuffixIcon>
            <IconChevronDownSmallLine />
          </Chip.SuffixIcon>
        </Chip.Root>
      </Menu.Trigger>
      <Menu.Positioner>
        <Menu.Content>
          {TAG_SORT_OPTIONS.map((option) => (
            <Menu.Item
              key={option.value}
              onClick={() => onChange(option.value)}
            >
              <Menu.ItemLabel>{option.label}</Menu.ItemLabel>
            </Menu.Item>
          ))}
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  );
}
