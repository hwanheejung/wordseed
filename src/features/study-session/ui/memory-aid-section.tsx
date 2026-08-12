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
  | { status: "failed" };

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
      setState({ status: "failed" });
    }
  };

  if (item.meaning.memoryAid)
    return (
      <section className="border-t border-[var(--seed-color-stroke-neutral-subtle)] py-5">
        <small className="font-extrabold tracking-[.04em] text-[var(--seed-color-fg-brand)]">
          MEMORY AID
        </small>
        <div className="mt-3 text-[length:var(--seed-font-size-t4)] leading-[1.65] text-[var(--seed-color-fg-neutral)] [&_blockquote]:mx-0 [&_blockquote]:border-l-3 [&_blockquote]:border-[var(--seed-color-stroke-brand)] [&_blockquote]:pl-3 [&_h1]:mt-5 [&_h1]:mb-2 [&_h1]:text-[length:var(--seed-font-size-t6)] [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-[length:var(--seed-font-size-t6)] [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-[length:var(--seed-font-size-t5)] [&_li]:my-1 [&_ol]:my-3 [&_ol]:pl-5 [&_p]:my-3 [&_ul]:my-3 [&_ul]:pl-5 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
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
    <section className="border-t border-[var(--seed-color-stroke-neutral-subtle)] py-5">
      <ActionButton
        className="w-full"
        variant="neutralWeak"
        loading={state.status === "generating"}
        disabled={state.status === "generating"}
        onClick={() => void handleGenerate()}
      >
        {state.status === "failed" ? "다시 시도" : "Help me remember"}
      </ActionButton>
      {state.status === "failed" && (
        <p
          className="mt-2 mb-0 text-center text-[length:var(--seed-font-size-t2)] text-[var(--seed-color-fg-critical)]"
          role="alert"
        >
          기억 장치를 만들지 못했어요. 다시 시도해 주세요.
        </p>
      )}
    </section>
  );
}
