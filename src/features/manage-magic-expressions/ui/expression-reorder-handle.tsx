import { IconArrowUpArrowDownLine } from "@karrotmarket/react-monochrome-icon";
import { Icon } from "@seed-design/react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import type { MagicExpression } from "@/entities/magic-expression";

interface ExpressionReorderHandleProps {
  expression: MagicExpression;
  pressed: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerCancel: (event: ReactPointerEvent<HTMLButtonElement>) => void;
}

export function ExpressionReorderHandle({
  expression,
  pressed,
  onMoveUp,
  onMoveDown,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}: ExpressionReorderHandleProps) {
  return (
    <ActionButton
      variant="ghost"
      size="small"
      layout="iconOnly"
      className={`cursor-grab touch-none select-none active:cursor-grabbing ${
        pressed ? "bg-[var(--seed-color-bg-neutral-weak)]" : ""
      }`}
      aria-label={`${expression.title} 순서 변경`}
      aria-pressed={pressed}
      title="길게 눌러 순서 변경"
      onContextMenu={(event) => event.preventDefault()}
      onKeyDown={(event) => {
        if (event.key === "ArrowUp") {
          event.preventDefault();
          onMoveUp();
        }
        if (event.key === "ArrowDown") {
          event.preventDefault();
          onMoveDown();
        }
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <Icon svg={<IconArrowUpArrowDownLine />} />
    </ActionButton>
  );
}
