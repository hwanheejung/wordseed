import {
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import type { MagicExpression } from "@/entities/magic-expression";

const LONG_PRESS_DELAY_MS = 300;
const PRESS_MOVEMENT_TOLERANCE_PX = 10;
const AUTO_SCROLL_EDGE_PX = 72;
const AUTO_SCROLL_STEP_PX = 14;

type MagicExpressionReorderState =
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

interface MagicExpressionReorderElements {
  listRef: RefObject<HTMLOListElement | null>;
  itemRefs: RefObject<Map<string, HTMLLIElement>>;
}

interface ExpressionGestureBindings {
  state: MagicExpressionReorderState;
  start: (
    expressionId: string,
    expressionIndex: number,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => void;
  move: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  end: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  cancel: (event: ReactPointerEvent<HTMLButtonElement>) => void;
}

interface MagicExpressionReorder {
  gesture: ExpressionGestureBindings;
  moveExpression: (expressionId: string, targetIndex: number) => void;
  announcement: string;
}

export function useMagicExpressionReorder(
  expressions: MagicExpression[],
  onMove: (expressionId: string, targetIndex: number) => void,
  elements: MagicExpressionReorderElements,
): MagicExpressionReorder {
  const holdTimer = useRef<number | undefined>(undefined);
  const activeGesture = useRef<ActiveGesture | undefined>(undefined);
  const [state, setState] = useState<MagicExpressionReorderState>({
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
    setState({
      status: "dragging",
      expressionId: gesture.expressionId,
      offsetY: 0,
      targetIndex: gesture.targetIndex,
    });
  }

  function moveExpression(expressionId: string, targetIndex: number) {
    const sourceIndex = expressions.findIndex(({ id }) => id === expressionId);
    const expression = expressions[sourceIndex];
    if (!expression || sourceIndex === targetIndex) return;

    onMove(expressionId, targetIndex);
    setAnnouncement(`${expression.title}을 ${targetIndex + 1}번째로 이동했어요.`);
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
    setState({ status: "pressing", expressionId });

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
      setState({ status: "idle" });
      releasePointer(event);

      return;
    }

    event.preventDefault();
    gesture.targetIndex = getClosestExpressionIndex(
      expressions,
      elements.itemRefs.current,
      event.clientY,
    );
    setState({
      status: "dragging",
      expressionId: gesture.expressionId,
      offsetY,
      targetIndex: gesture.targetIndex,
    });
    autoScrollList(elements.listRef.current, event.clientY);
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
    const gesture = activeGesture.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;

    clearHoldTimer();
    if (gesture.dragging) {
      moveExpression(gesture.expressionId, gesture.targetIndex);
    }
    activeGesture.current = undefined;
    setState({ status: "idle" });
    releasePointer(event);
  }

  function handlePointerCancel(event: ReactPointerEvent<HTMLButtonElement>) {
    const gesture = activeGesture.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;

    clearHoldTimer();
    activeGesture.current = undefined;
    setState({ status: "idle" });
    releasePointer(event);
  }

  // Clear a pending touch hold when the expression list leaves the DOM.
  useEffect(() => clearHoldTimer, []);

  return {
    gesture: {
      state,
      start: handlePointerDown,
      move: handlePointerMove,
      end: handlePointerUp,
      cancel: handlePointerCancel,
    },
    moveExpression,
    announcement,
  };
}

function releasePointer(event: ReactPointerEvent<HTMLButtonElement>) {
  if (!event.currentTarget.hasPointerCapture?.(event.pointerId)) return;
  event.currentTarget.releasePointerCapture(event.pointerId);
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

function autoScrollList(listElement: HTMLOListElement | null, pointerY: number) {
  const scrollContainer = listElement?.closest("main");
  if (!(scrollContainer instanceof HTMLElement)) return;

  const rect = scrollContainer.getBoundingClientRect();
  if (pointerY < rect.top + AUTO_SCROLL_EDGE_PX) {
    scrollContainer.scrollBy?.({ top: -AUTO_SCROLL_STEP_PX });
  } else if (pointerY > rect.bottom - AUTO_SCROLL_EDGE_PX) {
    scrollContainer.scrollBy?.({ top: AUTO_SCROLL_STEP_PX });
  }
}
