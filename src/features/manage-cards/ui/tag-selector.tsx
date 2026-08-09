import { BottomSheet, TextField } from "@seed-design/react";
import { IconChevronDownSmallLine } from "@karrotmarket/react-monochrome-icon";
import { useState } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import { normalizeTags } from "@/entities/card";

export function TagSelector({
  label,
  options,
  selected,
  onChange,
  onCreate,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (tags: string[]) => void;
  onCreate: (tag: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTag, setNewTag] = useState("");

  const createTag = () => {
    const tag = normalizeTags([newTag])[0];
    if (!tag) return;
    onCreate(tag);
    onChange(normalizeTags([...selected, tag]));
    setNewTag("");
    setCreating(false);
  };

  const toggleTag = (tag: string) =>
    onChange(
      selected.includes(tag)
        ? selected.filter((item) => item !== tag)
        : [...selected, tag],
    );

  return (
    <section className="mt-5">
      <label className="field-label mb-2 block">{label}</label>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
        <BottomSheet.Root open={open} onOpenChange={setOpen}>
          <BottomSheet.Trigger asChild>
            <button
              type="button"
              className="flex min-h-12 min-w-0 items-center justify-between gap-3 rounded-xl border border-[var(--seed-color-stroke-neutral-subtle)] bg-[var(--seed-color-bg-layer-default)] px-4 text-left text-[length:var(--seed-font-size-t4)] text-[var(--seed-color-fg-neutral)]"
              aria-label={`${label} 선택`}
            >
              <span className="truncate">
                {selected.length
                  ? selected.map((tag) => `#${tag}`).join(", ")
                  : "태그 선택"}
              </span>
              <IconChevronDownSmallLine />
            </button>
          </BottomSheet.Trigger>
          <BottomSheet.Backdrop className="!z-[100]" />
          <BottomSheet.Positioner className="!z-[100]">
            <BottomSheet.Content className="min-h-[50dvh] max-h-[72dvh]">
              <BottomSheet.Handle />
              <BottomSheet.Header>
                <BottomSheet.Title>{label}</BottomSheet.Title>
              </BottomSheet.Header>
              <BottomSheet.Body className="overflow-y-auto pb-[calc(20px+var(--seed-safe-area-bottom))]">
                <div
                  className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                  aria-label={`${label} 목록`}
                >
                  {options.length ? (
                    options.map((tag) => (
                      <button
                        type="button"
                        key={tag}
                        aria-pressed={selected.includes(tag)}
                        onClick={() => toggleTag(tag)}
                        className="flex min-h-12 items-center justify-between rounded-xl border border-[var(--seed-color-stroke-neutral-subtle)] bg-[var(--seed-color-bg-layer-default)] px-4 text-left font-semibold aria-pressed:border-[var(--seed-color-stroke-brand-solid)] aria-pressed:bg-[var(--seed-color-bg-brand-weak)] aria-pressed:text-[var(--seed-color-fg-brand)]"
                      >
                        <span>#{tag}</span>
                        <span aria-hidden="true">
                          {selected.includes(tag) ? "✓" : ""}
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="text-[var(--seed-color-fg-neutral-subtle)]">
                      아직 생성된 태그가 없어요.
                    </p>
                  )}
                </div>
              </BottomSheet.Body>
            </BottomSheet.Content>
          </BottomSheet.Positioner>
        </BottomSheet.Root>
        <ActionButton
          size="medium"
          variant="neutralWeak"
          onClick={() => setCreating((value) => !value)}
        >
          ＋ 추가
        </ActionButton>
      </div>
      {creating && (
        <div className="mt-2.5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <TextField.Root>
            <TextField.Input
              autoFocus
              aria-label="새 태그 이름"
              value={newTag}
              onChange={(event) => setNewTag(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") createTag();
              }}
              placeholder="새 태그 이름"
            />
          </TextField.Root>
          <ActionButton
            variant="neutralSolid"
            disabled={!newTag.trim()}
            onClick={createTag}
          >
            생성
          </ActionButton>
        </div>
      )}
    </section>
  );
}
