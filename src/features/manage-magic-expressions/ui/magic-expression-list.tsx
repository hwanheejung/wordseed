import {
  IconArrowDownLine,
  IconArrowUpArrowDownLine,
  IconArrowUpLine,
  IconDot3HorizontalLine,
  IconPencilLine,
  IconTrashcanLine,
} from "@karrotmarket/react-monochrome-icon";
import { Icon, Menu } from "@seed-design/react";
import {
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { ActionButton } from "seed-design/ui/action-button";
import {
  type MagicExpression,
  MagicExpressionCard,
} from "@/entities/magic-expression";

const LONG_PRESS_DELAY_MS = 300;
const PRESS_MOVEMENT_TOLERANCE_PX = 10;
const AUTO_SCROLL_EDGE_PX = 72;
const AUTO_SCROLL_STEP_PX = 14;

type ReorderState =
  | { status: "idle" }
  | { status: "pressing"; expressionId: string }
  | {
      status: "dragging";
      expressionId: string;
      offsetY: number;
      targetIndex: number;
    };

interface ActiveGesture {
  expressionId: string;
  pointerId: number;
  startY: number;
  dragging: boolean;
  targetIndex: number;
}

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
  const holdTimer = useRef<number | undefined>(undefined);
  const activeGesture = useRef<ActiveGesture | undefined>(undefined);
  const [reorderState, setReorderState] = useState<ReorderState>({
    status: "idle",
  });
  const [announcement, setAnnouncement] = useState("");

  function clearHoldTimer() {
    if (holdTimer.current === undefined) return;

    window.clearTimeout(holdTimer.current);
    holdTimer.current = undefined;
  }

  function startDragging(gesture: ActiveGesture) {
    gesture.dragging = true;
    setReorderState({
      status: "dragging",
      expressionId: gesture.expressionId,
      offsetY: 0,
      targetIndex: gesture.targetIndex,
    });
  }

  function handlePointerDown(
    expressionId: string,
    expressionIndex: number,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) {
    if (event.button !== 0 || activeGesture.current) return;

    event.currentTarget.setPointerCapture?.(event.pointerId);
    const gesture: ActiveGesture = {
      expressionId,
      pointerId: event.pointerId,
      startY: event.clientY,
      dragging: false,
      targetIndex: expressionIndex,
    };
    activeGesture.current = gesture;
    setReorderState({ status: "pressing", expressionId });

    if (event.pointerType === "mouse") {
      startDragging(gesture);

      return;
    }

    holdTimer.current = window.setTimeout(() => {
      if (activeGesture.current !== gesture) return;
      startDragging(gesture);
    }, LONG_PRESS_DELAY_MS);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const gesture = activeGesture.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;

    const offsetY = event.clientY - gesture.startY;
    if (!gesture.dragging) {
      if (Math.abs(offsetY) <= PRESS_MOVEMENT_TOLERANCE_PX) return;

      clearHoldTimer();
      activeGesture.current = undefined;
      setReorderState({ status: "idle" });
      event.currentTarget.releasePointerCapture?.(event.pointerId);

      return;
    }

    event.preventDefault();
    gesture.targetIndex = getClosestExpressionIndex(
      expressions,
      itemRefs.current,
      event.clientY,
    );
    setReorderState({
      status: "dragging",
      expressionId: gesture.expressionId,
      offsetY,
      targetIndex: gesture.targetIndex,
    });
    autoScrollList(listRef, event.clientY);
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
    const gesture = activeGesture.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;

    clearHoldTimer();
    if (gesture.dragging) {
      moveExpression(gesture.expressionId, gesture.targetIndex);
    }
    activeGesture.current = undefined;
    setReorderState({ status: "idle" });
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }

  function handlePointerCancel(event: ReactPointerEvent<HTMLButtonElement>) {
    const gesture = activeGesture.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;

    clearHoldTimer();
    activeGesture.current = undefined;
    setReorderState({ status: "idle" });
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }

  function moveExpression(expressionId: string, targetIndex: number) {
    const sourceIndex = expressions.findIndex(({ id }) => id === expressionId);
    const expression = expressions[sourceIndex];
    if (!expression || sourceIndex === targetIndex) return;

    onMove(expressionId, targetIndex);
    setAnnouncement(`${expression.title}을 ${targetIndex + 1}번째로 이동했어요.`);
  }

  // Clear a pending touch hold when the expression list leaves the DOM.
  useEffect(() => clearHoldTimer, []);

  return (
    <section aria-label="저장한 표현">
      <ol ref={listRef} className="m-0 grid list-none gap-3 p-0">
        {expressions.map((expression, expressionIndex) => {
          const isDragging =
            reorderState.status === "dragging" &&
            reorderState.expressionId === expression.id;
          const isDropTarget =
            reorderState.status === "dragging" &&
            reorderState.targetIndex === expressionIndex &&
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
                  ? "relative z-30 cursor-grabbing opacity-95 will-change-transform"
                  : "transition-[box-shadow,transform] duration-200 ease-out motion-reduce:transition-none"
              } ${
                isDropTarget
                  ? "ring-2 ring-[var(--seed-color-stroke-brand)] ring-offset-2 ring-offset-[var(--seed-color-bg-layer-default)]"
                  : ""
              }`}
              style={
                isDragging
                  ? {
                      transform: `translate3d(0, ${reorderState.offsetY}px, 0) scale(1.01)`,
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
                        reorderState.status !== "idle" &&
                        reorderState.expressionId === expression.id
                      }
                      onMoveUp={() => moveExpression(expression.id, expressionIndex - 1)}
                      onMoveDown={() =>
                        moveExpression(expression.id, expressionIndex + 1)
                      }
                      onPointerDown={(event) =>
                        handlePointerDown(expression.id, expressionIndex, event)
                      }
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerCancel}
                    />
                    <ExpressionActionsMenu
                      expression={expression}
                      canMoveUp={expressionIndex > 0}
                      canMoveDown={expressionIndex < expressions.length - 1}
                      onMoveUp={() => moveExpression(expression.id, expressionIndex - 1)}
                      onMoveDown={() =>
                        moveExpression(expression.id, expressionIndex + 1)
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

function ExpressionReorderHandle({
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

interface ExpressionActionsMenuProps {
  expression: MagicExpression;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function ExpressionActionsMenu({
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

function getClosestExpressionIndex(
  expressions: MagicExpression[],
  itemElements: Map<string, HTMLLIElement>,
  pointerY: number,
) {
  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  expressions.forEach((expression, index) => {
    const element = itemElements.get(expression.id);
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const distance = Math.abs(pointerY - (rect.top + rect.height / 2));
    if (distance >= closestDistance) return;

    closestIndex = index;
    closestDistance = distance;
  });

  return closestIndex;
}

function autoScrollList(
  listRef: RefObject<HTMLOListElement | null>,
  pointerY: number,
) {
  const scrollContainer = listRef.current?.closest("main");
  if (!(scrollContainer instanceof HTMLElement)) return;

  const rect = scrollContainer.getBoundingClientRect();
  if (pointerY < rect.top + AUTO_SCROLL_EDGE_PX) {
    scrollContainer.scrollBy?.({ top: -AUTO_SCROLL_STEP_PX });
  } else if (pointerY > rect.bottom - AUTO_SCROLL_EDGE_PX) {
    scrollContainer.scrollBy?.({ top: AUTO_SCROLL_STEP_PX });
  }
}
