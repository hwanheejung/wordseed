import { useState } from "react";
import Markdown from "react-markdown";
import { ActionButton } from "seed-design/ui/action-button";
import type { Meaning } from "@/entities/card";
import { generateMemoryAid } from "../actions/generate-memory-aid";
import type { StudyQueueItem } from "../types/study-queue-item";

interface MemoryAidSectionProps {
  item: StudyQueueItem;
  onSaved: (meaning: Meaning) => void;
}

type GenerationState =
  | { status: "idle" }
  | { status: "generating" }
  | { status: "failed"; message: string };

export function MemoryAidSection({ item, onSaved }: MemoryAidSectionProps) {
  const [state, setState] = useState<GenerationState>({ status: "idle" });

  const handleGenerate = async () => {
    if (state.status === "generating" || item.meaning.memoryAid) return;

    setState({ status: "generating" });
    try {
      onSaved(await generateMemoryAid(item));
      setState({ status: "idle" });
    } catch (error) {
      console.error(error);
      setState({
        status: "failed",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  };

  if (item.meaning.memoryAid)
    return (
      <section className="rounded-[22px] bg-[var(--seed-color-bg-brand-weak)] p-4.5">
        <small className="font-extrabold tracking-[.04em] text-[var(--seed-color-fg-brand)]">
          외우는 팁
        </small>
        <div className="mt-3 text-[length:var(--seed-font-size-t4)] leading-[1.65] text-[var(--seed-color-fg-neutral)] [&_blockquote]:mx-0 [&_blockquote]:border-l-3 [&_blockquote]:border-[var(--seed-color-stroke-brand)] [&_blockquote]:pl-3 [&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:text-[length:var(--seed-font-size-t6)] [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-[length:var(--seed-font-size-t6)] [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-[length:var(--seed-font-size-t5)] [&_li]:my-1 [&_ol]:my-3 [&_ol]:pl-5 [&_p]:my-3 [&_ul]:my-3 [&_ul]:pl-5 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
          <Markdown
            skipHtml
            disallowedElements={["a", "img"]}
            unwrapDisallowed
          >
            {item.meaning.memoryAid}
          </Markdown>
        </div>
      </section>
    );

  return (
    <section className="rounded-[22px] bg-[var(--seed-color-bg-layer-fill)] p-3">
      <ActionButton
        className="w-full transition-transform duration-100 ease-out active:scale-[.98] motion-reduce:transition-none"
        variant="neutralWeak"
        loading={state.status === "generating"}
        disabled={state.status === "generating"}
        onClick={() => void handleGenerate()}
      >
        {state.status === "failed" ? "다시 만들기" : "외우는 팁 만들기"}
      </ActionButton>
      {state.status === "failed" && (
        <p
          className="mt-2 mb-0 text-center text-[length:var(--seed-font-size-t2)] text-[var(--seed-color-fg-critical)]"
          role="alert"
        >
          외우는 팁을 만들지 못했어요.
          <br />
          {" "}
          {state.message}
        </p>
      )}
    </section>
  );
}
