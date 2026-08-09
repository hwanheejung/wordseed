import { Badge } from "@seed-design/react";
import { useState } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import { Checkbox } from "seed-design/ui/checkbox";
import { AppHeader } from "@/shared/ui/app-header";
import type { CardDraft, ExtractedCandidate } from "../types/card-draft";

interface CandidateSelectionProps {
  items: ExtractedCandidate[];
  onChange: (items: ExtractedCandidate[]) => void;
  onBack: () => void;
  onContinue: (drafts: CardDraft[]) => void;
  onSaveImmediately: (drafts: CardDraft[]) => void | Promise<void>;
}

export function CandidateSelection({
  items,
  onChange,
  onBack,
  onContinue,
  onSaveImmediately,
}: CandidateSelectionProps) {
  const [saving, setSaving] = useState(false);
  const selected = items.filter((item) => item.selected);

  const selectedDrafts = () =>
    selected.map((item) => ({
      id: item.id,
      term: item.term,
      meanings: item.meanings,
      tags: item.tags,
    }));

  const toggle = (index: number) =>
    onChange(
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, selected: !item.selected } : item,
      ),
    );

  return (
    <>
      <AppHeader
        title="추출한 단어"
        subtitle={`${items.length}개를 찾았어요. 저장할 단어를 골라 주세요.`}
        onBack={onBack}
      />
      <main className="min-h-[calc(100vh-84px)] p-5 pb-44">
        <div className="mb-2 flex items-center justify-between [&_button]:min-h-11 [&_button]:cursor-pointer [&_button]:border-0 [&_button]:bg-transparent [&_button]:font-bold [&_button]:text-[var(--seed-color-fg-brand)]">
          <b>{selected.length}개 선택</b>
          <button
            onClick={() =>
              onChange(items.map((item) => ({ ...item, selected: true })))
            }
          >
            전체 선택
          </button>
        </div>
        <div className="grid gap-2.5">
          {items.map((item, index) => (
            <article
              key={`${item.term}-${index}`}
              className={`grid cursor-pointer grid-cols-[28px_1fr] gap-3 rounded-[20px] border p-4 transition-[border-color,background] duration-150 ${item.selected ? "border-[var(--seed-color-stroke-brand-solid)] bg-[var(--seed-color-bg-brand-weak)]" : "border-[var(--seed-color-stroke-neutral-subtle)]"} [&_p]:my-[5px] [&_p]:text-[var(--seed-color-fg-neutral-muted)] [&_small]:text-[var(--seed-color-fg-neutral-subtle)]`}
              onClick={() => toggle(index)}
            >
              <span onClick={(event) => event.stopPropagation()}>
                <Checkbox
                  checked={item.selected}
                  onCheckedChange={() => toggle(index)}
                  label=""
                  inputProps={{ "aria-label": `${item.term} 선택` }}
                />
              </span>
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="m-0 text-[length:var(--seed-font-size-t6)]">
                    {item.term}
                  </h2>
                  <Badge
                    tone={item.confidence > 0.9 ? "positive" : "warning"}
                    variant="weak"
                  >
                    {Math.round(item.confidence * 100)}%
                  </Badge>
                </div>
                <p>{item.meanings[0]?.definitionKo}</p>
                <small>
                  {item.meanings[0]?.provenance === "source"
                    ? "원문 정보"
                    : "AI가 보완"}
                </small>
              </div>
            </article>
          ))}
        </div>
        <div className="sticky-cta grid gap-2">
          <ActionButton
            size="large"
            disabled={!selected.length}
            loading={saving}
            onClick={async () => {
              setSaving(true);
              try {
                await onSaveImmediately(selectedDrafts());
              } finally {
                setSaving(false);
              }
            }}
            className="w-full justify-center"
          >
            선택한 {selected.length}개 바로 저장
          </ActionButton>
          <ActionButton
            size="large"
            variant="neutralWeak"
            disabled={!selected.length || saving}
            onClick={() => onContinue(selectedDrafts())}
            className="w-full justify-center"
          >
            검토 후 저장
          </ActionButton>
        </div>
      </main>
    </>
  );
}
