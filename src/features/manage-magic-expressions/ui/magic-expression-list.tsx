import { useRef } from "react";
import {
  type MagicExpression,
  MagicExpressionCard,
} from "@/entities/magic-expression";
import { useMagicExpressionReorder } from "../hooks/use-magic-expression-reorder";
import { ExpressionActionsMenu } from "./expression-actions-menu";
import { ExpressionReorderHandle } from "./expression-reorder-handle";

interface MagicExpressionListProps {
  expressions: MagicExpression[];
  onEdit: (expression: MagicExpression) => void;
  onDelete: (expression: MagicExpression) => void;
  onMove: (expressionId: string, targetIndex: number) => void;
}

export function MagicExpressionList({
  expressions,
  onEdit,
  onDelete,
  onMove,
}: MagicExpressionListProps) {
  const listRef = useRef<HTMLOListElement>(null);
  const itemRefs = useRef(new Map<string, HTMLLIElement>());
  const { gesture, moveExpression, announcement } =
    useMagicExpressionReorder(expressions, onMove, { listRef, itemRefs });

  return (
    <section aria-label="저장한 표현">
      <ol ref={listRef} className="m-0 grid list-none gap-3 p-0">
        {expressions.map((expression, expressionIndex) => {
          const dragOffsetY =
            gesture.state.status === "dragging" &&
            gesture.state.expressionId === expression.id
              ? gesture.state.offsetY
              : undefined;
          const isDragging = dragOffsetY !== undefined;
          const isDropTarget =
            gesture.state.status === "dragging" &&
            gesture.state.targetIndex === expressionIndex &&
            !isDragging;

          return (
            <li
              key={expression.id}
              ref={(element) => {
                if (element) itemRefs.current.set(expression.id, element);
                else itemRefs.current.delete(expression.id);
              }}
              className={`rounded-[22px] ${
                isDragging
                  ? "relative z-[var(--app-layer-dragged)] cursor-grabbing opacity-95 will-change-transform"
                  : "transition-[box-shadow,transform] duration-200 ease-out motion-reduce:transition-none"
              } ${
                isDropTarget
                  ? "ring-2 ring-[var(--seed-color-stroke-brand)] ring-offset-2 ring-offset-[var(--seed-color-bg-layer-default)]"
                  : ""
              }`}
              style={
                isDragging
                  ? {
                      transform: `translate3d(0, ${dragOffsetY}px, 0) scale(1.01)`,
                    }
                  : undefined
              }
            >
              <MagicExpressionCard
                expression={expression}
                action={
                  <div className="flex items-center gap-1">
                    <ExpressionReorderHandle
                      expression={expression}
                      pressed={
                        gesture.state.status !== "idle" &&
                        gesture.state.expressionId === expression.id
                      }
                      onMoveUp={() =>
                        moveExpression(
                          expression.id,
                          expressionIndex - 1,
                        )
                      }
                      onMoveDown={() =>
                        moveExpression(
                          expression.id,
                          expressionIndex + 1,
                        )
                      }
                      onPointerDown={(event) =>
                        gesture.start(
                          expression.id,
                          expressionIndex,
                          event,
                        )
                      }
                      onPointerMove={gesture.move}
                      onPointerUp={gesture.end}
                      onPointerCancel={gesture.cancel}
                    />
                    <ExpressionActionsMenu
                      expression={expression}
                      canMoveUp={expressionIndex > 0}
                      canMoveDown={expressionIndex < expressions.length - 1}
                      onMoveUp={() =>
                        moveExpression(
                          expression.id,
                          expressionIndex - 1,
                        )
                      }
                      onMoveDown={() =>
                        moveExpression(
                          expression.id,
                          expressionIndex + 1,
                        )
                      }
                      onEdit={() => onEdit(expression)}
                      onDelete={() => onDelete(expression)}
                    />
                  </div>
                }
              />
            </li>
          );
        })}
      </ol>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </section>
  );
}
