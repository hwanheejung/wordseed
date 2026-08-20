import Markdown from "react-markdown";
import type { ReactNode } from "react";
import type { MagicExpression } from "../types/magic-expression";

interface MagicExpressionCardProps {
  expression: MagicExpression;
  action?: ReactNode;
}

export function MagicExpressionCard({
  expression,
  action,
}: MagicExpressionCardProps) {
  return (
    <article className="rounded-[22px] border border-[var(--seed-color-stroke-neutral-subtle)] bg-[var(--seed-color-bg-layer-default)] p-4 shadow-[0_4px_16px_rgba(0,0,0,.035)]">
      <div className="mb-3 flex min-h-9 items-start gap-2">
        <h2 className="my-1 min-w-0 flex-1 text-[length:var(--seed-font-size-t5)] tracking-[-.02em]">
          {expression.title}
        </h2>
        {action}
      </div>
      <div className="text-[length:var(--seed-font-size-t3)] leading-[1.65] text-[var(--seed-color-fg-neutral-subtle)] [&_blockquote]:mx-0 [&_blockquote]:border-l-3 [&_blockquote]:border-[var(--seed-color-stroke-brand)] [&_blockquote]:pl-3 [&_h1]:my-3 [&_h1]:text-[length:var(--seed-font-size-t6)] [&_h2]:my-3 [&_h2]:text-[length:var(--seed-font-size-t5)] [&_h3]:my-3 [&_h3]:text-[length:var(--seed-font-size-t4)] [&_hr]:my-5 [&_hr]:border-0 [&_hr]:border-t [&_hr]:border-[var(--seed-color-stroke-neutral-subtle)] [&_li]:my-1 [&_ol]:my-3 [&_ol]:pl-5 [&_p]:my-3 [&_strong]:font-bold [&_strong]:text-[var(--seed-color-fg-neutral)] [&_ul]:my-3 [&_ul]:pl-5 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
        <Markdown skipHtml disallowedElements={["a", "img"]} unwrapDisallowed>
          {expression.description}
        </Markdown>
      </div>
    </article>
  );
}
