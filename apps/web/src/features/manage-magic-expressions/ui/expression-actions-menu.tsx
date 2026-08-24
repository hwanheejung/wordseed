import {
  IconArrowDownLine,
  IconArrowUpLine,
  IconDot3HorizontalLine,
  IconPencilLine,
  IconTrashcanLine,
} from "@karrotmarket/react-monochrome-icon";
import { Icon, Menu } from "@seed-design/react";
import { ActionButton } from "seed-design/ui/action-button";
import type { MagicExpression } from "@/entities/magic-expression";

interface ExpressionActionsMenuProps {
  expression: MagicExpression;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ExpressionActionsMenu({
  expression,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: ExpressionActionsMenuProps) {
  return (
    <Menu.Root size="medium" placement="bottom-end" gutter={6}>
      <Menu.Trigger asChild>
        <ActionButton
          variant="ghost"
          size="small"
          layout="iconOnly"
          aria-label={`${expression.title} 더보기`}
        >
          <Icon svg={<IconDot3HorizontalLine />} />
        </ActionButton>
      </Menu.Trigger>
      <Menu.Positioner>
        <Menu.Content>
          {canMoveUp && (
            <Menu.Item onClick={onMoveUp}>
              <Icon svg={<IconArrowUpLine />} />
              <Menu.ItemLabel>위로 이동</Menu.ItemLabel>
            </Menu.Item>
          )}
          {canMoveDown && (
            <Menu.Item onClick={onMoveDown}>
              <Icon svg={<IconArrowDownLine />} />
              <Menu.ItemLabel>아래로 이동</Menu.ItemLabel>
            </Menu.Item>
          )}
          <Menu.Item onClick={onEdit}>
            <Icon svg={<IconPencilLine />} />
            <Menu.ItemLabel>수정하기</Menu.ItemLabel>
          </Menu.Item>
          <Menu.Item
            className="!text-[var(--seed-color-fg-critical)]"
            onClick={onDelete}
          >
            <Icon svg={<IconTrashcanLine />} />
            <Menu.ItemLabel>삭제하기</Menu.ItemLabel>
          </Menu.Item>
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  );
}
