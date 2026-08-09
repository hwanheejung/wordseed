import { ProgressCircle } from "seed-design/ui/progress-circle";

export function PageLoadingState() {
  return (
    <main className="grid min-h-[calc(100vh-84px)] place-items-center p-5">
      <div
        className="grid justify-items-center gap-3 text-[var(--seed-color-fg-neutral-subtle)]"
        role="status"
      >
        <ProgressCircle size="40" />
        <span>단어를 불러오는 중...</span>
      </div>
    </main>
  );
}
