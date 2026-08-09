import type { StudyQueueItem } from "../types/study-queue-item";
import { moveReviewedCardToBack, updateFocusQueue } from "./scheduler";

export interface StudySessionState {
  queue: StudyQueueItem[];
  history: StudyQueueItem[];
  historyIndex?: number;
  revision: number;
}

export function createStudySession(items: StudyQueueItem[]): StudySessionState {
  return {
    queue: items,
    history: [],
    revision: 0,
  };
}

export function getCurrentStudyItem(state: StudySessionState) {
  return state.historyIndex === undefined
    ? state.queue[0]
    : state.history[state.historyIndex];
}

export function getPreviousStudyItem(state: StudySessionState) {
  if (state.historyIndex === undefined)
    return state.history.at(-1) ?? state.queue.at(-1);

  return state.history[state.historyIndex - 1];
}

export function getNextStudyItem(state: StudySessionState) {
  if (state.historyIndex === undefined) return state.queue[1];

  return state.history[state.historyIndex + 1] ?? state.queue[0];
}

export function navigateStudySession(
  state: StudySessionState,
  direction: "next" | "previous",
): StudySessionState {
  if (direction === "previous") {
    if (state.historyIndex !== undefined) {
      if (state.historyIndex === 0) return state;

      return {
        ...state,
        historyIndex: state.historyIndex - 1,
        revision: state.revision + 1,
      };
    }

    if (state.history.length)
      return {
        ...state,
        historyIndex: state.history.length - 1,
        revision: state.revision + 1,
      };

    if (state.queue.length < 2) return state;

    return {
      ...state,
      queue: [state.queue.at(-1)!, ...state.queue.slice(0, -1)],
      revision: state.revision + 1,
    };
  }

  if (state.historyIndex !== undefined) {
    const hasNewerHistory = state.historyIndex < state.history.length - 1;

    return {
      ...state,
      historyIndex: hasNewerHistory ? state.historyIndex + 1 : undefined,
      revision: state.revision + 1,
    };
  }

  if (state.queue.length < 2) return state;

  return {
    ...state,
    queue: [...state.queue.slice(1), state.queue[0]],
    history: [...state.history, state.queue[0]],
    revision: state.revision + 1,
  };
}

function updateHistoricalQueue(
  queue: StudyQueueItem[],
  updated: StudyQueueItem,
  removeCorrectFromQueue: boolean,
) {
  const matchingIndex = queue.findIndex(
    ({ meaning }) => meaning.id === updated.meaning.id,
  );

  if (removeCorrectFromQueue && updated.meaning.status === "correct")
    return queue.filter(({ meaning }) => meaning.id !== updated.meaning.id);

  if (matchingIndex === -1)
    return removeCorrectFromQueue ? [...queue, updated] : queue;

  return queue.map((item, index) =>
    index === matchingIndex ? updated : item,
  );
}

export function reviewStudySession(
  state: StudySessionState,
  updated: StudyQueueItem,
  removeCorrectFromQueue: boolean,
): StudySessionState {
  if (state.historyIndex === undefined) {
    const history = [...state.history, updated];
    const queue = removeCorrectFromQueue
      ? updateFocusQueue(state.queue, updated)
      : moveReviewedCardToBack(state.queue, updated);

    return {
      queue,
      history,
      historyIndex: queue.length ? undefined : history.length - 1,
      revision: state.revision + 1,
    };
  }

  const history = state.history.map((item, index) =>
    index === state.historyIndex ? updated : item,
  );
  const queue = updateHistoricalQueue(
    state.queue,
    updated,
    removeCorrectFromQueue,
  );
  const hasNewerHistory = state.historyIndex < history.length - 1;

  return {
    queue,
    history,
    historyIndex: hasNewerHistory
      ? state.historyIndex + 1
      : queue.length
        ? undefined
        : state.historyIndex,
    revision: state.revision + 1,
  };
}
