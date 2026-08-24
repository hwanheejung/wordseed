// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { AppSnackbarProvider, useAppSnackbar } from "./use-app-snackbar";

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

function SnackbarTestButton() {
  const notify = useAppSnackbar();

  return <button onClick={() => notify("저장했어요.")}>알림 표시</button>;
}

describe("AppSnackbarProvider", () => {
  beforeAll(() => {
    vi.stubGlobal("ResizeObserver", ResizeObserverStub);
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("dismisses every snackbar after three seconds even while the pointer remains over it", () => {
    render(
      <AppSnackbarProvider>
        <SnackbarTestButton />
      </AppSnackbarProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "알림 표시" }));
    const snackbar = screen.getByRole("status");
    fireEvent.pointerEnter(snackbar);

    act(() => vi.advanceTimersByTime(3_000));
    act(() => vi.advanceTimersByTime(200));

    expect(screen.queryByText("저장했어요.")).not.toBeInTheDocument();
  });
});
