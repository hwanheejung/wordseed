import { Chip, Flex, TextField } from "@seed-design/react";
import { useState } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import { normalizeTags } from "@/entities/card";
import type { VocabularyCard } from "@/entities/card";
import { useAppSnackbar } from "@/shared/hooks/use-app-snackbar";
import { AppFooter } from "@/shared/ui/app-footer";
import { AppHeader } from "@/shared/ui/app-header";
import { deleteVocabularyCard } from "../actions/delete-card";
import { saveDrafts } from "../actions/save-drafts";
import type {
  CardDraft,
  DraftExample,
  DraftMeaning,
} from "../types/card-draft";
import { validateDrafts } from "../validators/draft-validation";
import { ProvenanceBadge } from "./provenance-badge";
import { TagSelector } from "./tag-selector";

interface CardReviewProps {
  drafts: CardDraft[];
  availableTags: string[];
  active: number;
  onDraftsChange: (drafts: CardDraft[]) => void;
  onActiveChange: (active: number) => void;
  onBack: () => void;
  onSaved: (cards: VocabularyCard[]) => void | Promise<void>;
  onDeleted: () => void | Promise<void>;
}

interface CardDraftPatch {
  term?: string;
  meanings?: DraftMeaning[];
  tags?: string[];
}

interface DraftMeaningPatch {
  expression?: string;
  definitionKo?: string;
  definitionEn?: string;
  partOfSpeech?: string;
  pronunciation?: string;
  acceptedVariants?: string[];
  synonyms?: string[];
  antonyms?: string[];
  examples?: DraftExample[];
  fillInBlankExamples?: DraftExample[];
}

interface DraftExamplePatch {
  en?: string;
  ko?: string;
  answer?: string;
  type?: DraftExample["type"];
}

export function CardReview({
  drafts,
  availableTags: providedTags,
  active,
  onDraftsChange,
  onActiveChange,
  onBack,
  onSaved,
  onDeleted,
}: CardReviewProps) {
  const [busy, setBusy] = useState(false);
  const [batchTags, setBatchTags] = useState<string[]>([]);
  const [createdTags, setCreatedTags] = useState<string[]>([]);
  const notify = useAppSnackbar();
  const draft = drafts[active];
  const availableTags = normalizeTags([
    ...providedTags,
    ...drafts.flatMap((item) => item.tags ?? []),
    ...createdTags,
  ]).sort((a, b) => a.localeCompare(b, "ko"));

  const registerTag = (tag: string) =>
    setCreatedTags((current) => normalizeTags([...current, tag]));

  const update = (patch: CardDraftPatch) =>
    onDraftsChange(
      drafts.map((item, index) =>
        index === active ? { ...item, ...patch } : item,
      ),
    );

  const updateMeaning = (meaningIndex: number, patch: DraftMeaningPatch) =>
    update({
      meanings: draft.meanings.map((meaning, index) =>
        index === meaningIndex ? { ...meaning, ...patch } : meaning,
      ),
    });

  const updateExample = (
    meaningIndex: number,
    exampleIndex: number,
    value: string,
  ) => {
    const meaning = draft.meanings[meaningIndex];
    updateMeaning(meaningIndex, {
      examples: meaning.examples.map((example, index) =>
        index === exampleIndex ? { ...example, en: value } : example,
      ),
    });
  };

  const addMeaning = () =>
    update({
      meanings: [
        ...draft.meanings,
        {
          expression: draft.term,
          definitionKo: "",
          provenance: "user",
          examples: [{ en: "", type: "sentence", provenance: "user" }],
          acceptedVariants: [draft.term],
          synonyms: [],
          antonyms: [],
          fillInBlankExamples: [
            {
              en: "",
              ko: "",
              answer: "",
              type: "sentence",
              provenance: "user",
            },
            {
              en: "",
              ko: "",
              answer: "",
              type: "dialogue",
              provenance: "user",
            },
          ],
        },
      ],
    });

  const addExample = (meaningIndex: number) =>
    updateMeaning(meaningIndex, {
      examples: [
        ...draft.meanings[meaningIndex].examples,
        { en: "", type: "sentence", provenance: "user" },
      ],
    });

  const updateFillInBlankExample = (
    meaningIndex: number,
    exampleIndex: number,
    patch: DraftExamplePatch,
  ) =>
    updateMeaning(meaningIndex, {
      fillInBlankExamples: (
        draft.meanings[meaningIndex].fillInBlankExamples ?? []
      ).map((example, index) =>
        index === exampleIndex
          ? { ...example, ...patch, provenance: "user" }
          : example,
      ),
    });

  const addFillInBlankExample = (meaningIndex: number) =>
    updateMeaning(meaningIndex, {
      fillInBlankExamples: [
        ...(draft.meanings[meaningIndex].fillInBlankExamples ?? []),
        { en: "", ko: "", answer: "", type: "sentence", provenance: "user" },
      ],
    });

  const applyTagsToAll = () => {
    if (!batchTags.length) return notify("적용할 태그를 선택해 주세요.");
    onDraftsChange(
      drafts.map((item) => ({
        ...item,
        tags: normalizeTags([...(item.tags ?? []), ...batchTags]),
      })),
    );
    notify(`${drafts.length}개 카드에 태그를 추가했어요.`);
  };

  const saveAll = async () => {
    const validationIssue = validateDrafts(drafts);
    if (validationIssue) {
      onActiveChange(validationIssue.cardIndex);
      window.scrollTo({ top: 0, behavior: "smooth" });
      notify(validationIssue.message, "critical");

      return;
    }
    setBusy(true);
    try {
      const savedCards = await saveDrafts(drafts, confirmOverwrite);
      notify(`${drafts.length}개의 카드를 저장했어요.`, "positive");
      await onSaved(savedCards);
    } finally {
      setBusy(false);
    }
  };

  if (!draft) return null;

  return (
    <>
      <AppHeader
        title="카드 검토"
        subtitle={`${active + 1} / ${drafts.length} · 저장 전에 수정할 수 있어요`}
        onBack={onBack}
        action={
          drafts.length > 1 ? (
            <ActionButton
              size="small"
              variant="neutralWeak"
              loading={busy}
              onClick={saveAll}
            >
              모두 저장
            </ActionButton>
          ) : undefined
        }
      />
      <main className="p-5">
        {drafts.length > 1 && (
          <section className="mb-3.5 rounded-[18px] border border-[var(--seed-color-stroke-brand-weak)] bg-[var(--seed-color-bg-brand-weak)] p-4 [&>section]:mt-0">
            <TagSelector
              label="모든 카드에 추가할 태그"
              options={availableTags}
              selected={batchTags}
              onChange={setBatchTags}
              onCreate={registerTag}
            />
            <ActionButton
              className="w-full justify-center"
              variant="neutralSolid"
              disabled={!batchTags.length}
              onClick={applyTagsToAll}
            >
              선택한 태그 전체 적용
            </ActionButton>
          </section>
        )}
        {drafts.length > 1 && (
          <Flex
            className="!gap-2 overflow-x-auto !pt-0.5 !pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>*]:shrink-0"
            align="center"
          >
            {drafts.map((item, index) => (
              <Chip.Root
                key={`${item.term}-${index}`}
                size="small"
                variant={active === index ? "solid" : "outlineStrong"}
                onClick={() => onActiveChange(index)}
              >
                <Chip.Label>{item.term || index + 1}</Chip.Label>
              </Chip.Root>
            ))}
          </Flex>
        )}
        <section className="rounded-3xl border border-[var(--seed-color-stroke-neutral-subtle)] p-[18px] [&_textarea]:min-h-[76px]">
          {draft.meanings.some(
            (meaning) =>
              meaning.provenance === "source" ||
              meaning.provenance === "ai" ||
              meaning.examples.some(
                (example) =>
                  example.provenance === "source" ||
                  example.provenance === "ai",
              ) ||
              meaning.fillInBlankExamples?.some(
                (example) =>
                  example.provenance === "source" ||
                  example.provenance === "ai",
              ),
          ) && (
            <div className="flex gap-3 rounded-2xl bg-[var(--seed-color-bg-positive-weak)] p-3.5 text-[var(--seed-color-fg-positive-contrast)] [&_b]:m-0 [&_b]:block [&_p]:mt-[3px] [&_p]:mb-0 [&_p]:text-[length:var(--seed-font-size-t2)]">
              <span className="font-black">✓</span>
              <div>
                <b>원문 정보를 우선했어요</b>
                <p>AI가 보완한 항목은 파란색으로 표시돼요.</p>
              </div>
            </div>
          )}
          <label className="field-label">단어 · 표현</label>
          <TextField.Root>
            <TextField.Input
              aria-label="단어 또는 표현"
              value={draft.term}
              onChange={(event) => {
                const term = event.target.value;
                update({
                  term,
                  meanings: draft.meanings.map((meaning) => ({
                    ...meaning,
                    expression:
                      meaning.expression === draft.term
                        ? term
                        : meaning.expression,
                  })),
                });
              }}
            />
          </TextField.Root>
          <TagSelector
            label="태그"
            options={availableTags}
            selected={draft.tags ?? []}
            onChange={(tags) => update({ tags })}
            onCreate={registerTag}
          />
          <div className="mt-5 flex items-center justify-between gap-3 [&_.field-label]:m-0">
            <label className="field-label">뜻과 예문</label>
            <ActionButton
              size="small"
              variant="neutralWeak"
              onClick={addMeaning}
            >
              ＋ 뜻 추가
            </ActionButton>
          </div>
          <div className="mt-2.5 grid gap-3">
            {draft.meanings.map((meaning, meaningIndex) => (
              <section
                className="rounded-[18px] border border-[var(--seed-color-stroke-neutral-subtle)] bg-[var(--seed-color-bg-layer-fill)] p-4"
                key={meaningIndex}
              >
                <div className="label-with-tag !mt-0">
                  <b>뜻 {meaningIndex + 1}</b>
                  {meaning.provenance && (
                    <ProvenanceBadge provenance={meaning.provenance} />
                  )}
                </div>
                <label className="field-label">이 뜻의 학습 표현</label>
                <TextField.Root>
                  <TextField.Input
                    aria-label={`뜻 ${meaningIndex + 1}의 학습 표현`}
                    value={meaning.expression}
                    onChange={(event) =>
                      updateMeaning(meaningIndex, {
                        expression: event.target.value,
                      })
                    }
                    placeholder={draft.term || "예: account for"}
                  />
                </TextField.Root>
                <label className="field-label">한국어 뜻</label>
                <TextField.Root>
                  <TextField.Textarea
                    aria-label={`뜻 ${meaningIndex + 1}`}
                    value={meaning.definitionKo}
                    onChange={(event) =>
                      updateMeaning(meaningIndex, {
                        definitionKo: event.target.value,
                      })
                    }
                    placeholder="뜻을 입력해 주세요"
                  />
                </TextField.Root>
                <div className="grid grid-cols-2 gap-2.5 [&_.field-label]:mt-3.5">
                  <div>
                    <label className="field-label">이 뜻의 품사</label>
                    <TextField.Root>
                      <TextField.Input
                        aria-label={`뜻 ${meaningIndex + 1}의 품사`}
                        value={meaning.partOfSpeech ?? ""}
                        onChange={(event) =>
                          updateMeaning(meaningIndex, {
                            partOfSpeech: event.target.value,
                          })
                        }
                        placeholder="verb"
                      />
                    </TextField.Root>
                  </div>
                  <div>
                    <label className="field-label">이 뜻의 발음</label>
                    <TextField.Root>
                      <TextField.Input
                        aria-label={`뜻 ${meaningIndex + 1}의 발음`}
                        value={meaning.pronunciation ?? ""}
                        onChange={(event) =>
                          updateMeaning(meaningIndex, {
                            pronunciation: event.target.value,
                          })
                        }
                        placeholder="/tʃɑːrdʒ/"
                      />
                    </TextField.Root>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5 [&_.field-label]:mt-3.5">
                  <div>
                    <label className="field-label">이 뜻의 동의어</label>
                    <TextField.Root>
                      <TextField.Input
                        aria-label={`뜻 ${meaningIndex + 1}의 동의어`}
                        value={(meaning.synonyms ?? []).join(", ")}
                        onChange={(event) =>
                          updateMeaning(meaningIndex, {
                            synonyms: event.target.value.split(","),
                          })
                        }
                        placeholder="예: explain, clarify"
                      />
                    </TextField.Root>
                  </div>
                  <div>
                    <label className="field-label">이 뜻의 반의어</label>
                    <TextField.Root>
                      <TextField.Input
                        aria-label={`뜻 ${meaningIndex + 1}의 반의어`}
                        value={(meaning.antonyms ?? []).join(", ")}
                        onChange={(event) =>
                          updateMeaning(meaningIndex, {
                            antonyms: event.target.value.split(","),
                          })
                        }
                        placeholder="예: confuse, obscure"
                      />
                    </TextField.Root>
                  </div>
                </div>
                {meaning.examples.map((example, exampleIndex) => (
                  <div className="mt-4" key={exampleIndex}>
                    <div className="label-with-tag">
                      <small>이 뜻의 예문 {exampleIndex + 1}</small>
                      {example.provenance && (
                        <ProvenanceBadge provenance={example.provenance} />
                      )}
                    </div>
                    <TextField.Root>
                      <TextField.Textarea
                        aria-label={`뜻 ${meaningIndex + 1}의 예문 ${exampleIndex + 1}`}
                        value={example.en}
                        onChange={(event) =>
                          updateExample(
                            meaningIndex,
                            exampleIndex,
                            event.target.value,
                          )
                        }
                        placeholder="이 뜻이 드러나는 예문을 입력해 주세요"
                      />
                    </TextField.Root>
                  </div>
                ))}
                <div className="mt-2 flex justify-between gap-2">
                  <ActionButton
                    size="small"
                    variant="ghost"
                    onClick={() => addExample(meaningIndex)}
                  >
                    ＋ 예문 추가
                  </ActionButton>
                  {draft.meanings.length > 1 && (
                    <ActionButton
                      size="small"
                      variant="ghost"
                      className="!text-[var(--seed-color-fg-critical)]"
                      onClick={() =>
                        update({
                          meanings: draft.meanings.filter(
                            (_, index) => index !== meaningIndex,
                          ),
                        })
                      }
                    >
                      뜻 삭제
                    </ActionButton>
                  )}
                </div>
              </section>
            ))}
          </div>
          <section className="mt-[18px] border-t border-[var(--seed-color-stroke-neutral-subtle)] pt-[18px]">
            <div className="flex items-start justify-between gap-3 [&_.field-label]:m-0 [&_p]:mt-[5px] [&_p]:mb-0 [&_p]:text-[length:var(--seed-font-size-t2)] [&_p]:leading-[1.45] [&_p]:text-[var(--seed-color-fg-neutral-subtle)]">
              <div>
                <label className="field-label">뜻별 빈칸 문맥</label>
                <p>각 뜻을 독립적으로 테스트할 새 문맥을 준비해요.</p>
              </div>
            </div>
            {draft.meanings.map((meaning, meaningIndex) => (
              <section className="" key={meaning.id ?? meaningIndex}>
                <div className="mt-5 flex items-center justify-between gap-3 [&_.field-label]:m-0">
                  <b>
                    뜻 {meaningIndex + 1} ·{" "}
                    {meaning.definitionKo || "뜻 미입력"}
                  </b>
                  <ActionButton
                    size="small"
                    variant="neutralWeak"
                    onClick={() => addFillInBlankExample(meaningIndex)}
                  >
                    ＋ 문맥 추가
                  </ActionButton>
                </div>
                <div className="grid gap-3.5 [&_textarea]:min-h-[92px]">
                  {(meaning.fillInBlankExamples ?? []).map(
                    (example, exampleIndex) => (
                      <div className="mt-4" key={exampleIndex}>
                        <div className="label-with-tag">
                          <small>
                            {example.type === "dialogue" ? "대화" : "예문"}{" "}
                            {exampleIndex + 1}
                          </small>
                          {example.en && example.provenance && (
                            <ProvenanceBadge provenance={example.provenance} />
                          )}
                        </div>
                        <TextField.Root>
                          <TextField.Textarea
                            aria-label={`빈칸 문맥 ${exampleIndex + 1}`}
                            value={example.en}
                            onChange={(event) =>
                              updateFillInBlankExample(
                                meaningIndex,
                                exampleIndex,
                                {
                                  en: event.target.value,
                                },
                              )
                            }
                            placeholder={`${draft.term || "정답 표현"}을 자연스럽게 활용한 새로운 문맥`}
                          />
                        </TextField.Root>
                        <label className="field-label">한국어 해석</label>
                        <TextField.Root>
                          <TextField.Input
                            aria-label={`빈칸 문맥 ${exampleIndex + 1}의 한국어 해석`}
                            value={example.ko ?? ""}
                            onChange={(event) =>
                              updateFillInBlankExample(
                                meaningIndex,
                                exampleIndex,
                                {
                                  ko: event.target.value,
                                },
                              )
                            }
                            placeholder="문맥의 자연스러운 한국어 해석"
                          />
                        </TextField.Root>
                        <label className="field-label">
                          빈칸 처리할 정답 구간
                        </label>
                        <TextField.Root>
                          <TextField.Input
                            aria-label={`빈칸 문맥 ${exampleIndex + 1}의 정답 구간`}
                            value={example.answer ?? ""}
                            onChange={(event) =>
                              updateFillInBlankExample(
                                meaningIndex,
                                exampleIndex,
                                {
                                  answer: event.target.value,
                                },
                              )
                            }
                            placeholder="예: had a technician repair"
                          />
                        </TextField.Root>
                        {(meaning.fillInBlankExamples ?? []).length > 2 && (
                          <ActionButton
                            size="small"
                            variant="ghost"
                            className="!text-[var(--seed-color-fg-critical)]"
                            onClick={() =>
                              updateMeaning(meaningIndex, {
                                fillInBlankExamples: (
                                  meaning.fillInBlankExamples ?? []
                                ).filter((_, index) => index !== exampleIndex),
                              })
                            }
                          >
                            문맥 삭제
                          </ActionButton>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </section>
            ))}
          </section>
        </section>
        {draft.id && (
          <section className="mt-5 flex items-center justify-between gap-4 rounded-[18px] border border-[var(--seed-color-stroke-critical-weak)] bg-[var(--seed-color-bg-critical-weak)] p-4 [&_b]:m-0 [&_b]:block [&_p]:mt-1 [&_p]:mb-0 [&_p]:text-[length:var(--seed-font-size-t2)] [&_p]:leading-[1.4] [&_p]:text-[var(--seed-color-fg-neutral-subtle)]">
            <div>
              <b>카드 삭제</b>
              <p>이 단어와 학습 기록을 단어장에서 삭제해요.</p>
            </div>
            <ActionButton
              variant="ghost"
              className="!text-[var(--seed-color-fg-critical)]"
              aria-label={`${draft.term} 카드 삭제`}
              onClick={async () => {
                if (!window.confirm(`‘${draft.term}’ 카드를 삭제할까요?`))
                  return;
                await deleteVocabularyCard(draft.id!);
                notify(`‘${draft.term}’ 카드를 삭제했어요.`, "positive");
                await onDeleted();
              }}
            >
              삭제
            </ActionButton>
          </section>
        )}
      </main>
      <AppFooter className="grid grid-cols-[auto_minmax(82px,.35fr)_1fr] items-center gap-2.5">
        <span
          className="min-w-[42px] text-center text-[length:var(--seed-font-size-t2)] font-bold text-[var(--seed-color-fg-neutral-subtle)]"
          aria-live="polite"
        >
          {active + 1} / {drafts.length}
        </span>
        <ActionButton
          variant="neutralWeak"
          disabled={active === 0}
          onClick={() => onActiveChange(active - 1)}
        >
          이전
        </ActionButton>
        {active < drafts.length - 1 ? (
          <ActionButton
            variant="neutralSolid"
            onClick={() => onActiveChange(active + 1)}
          >
            다음 카드
          </ActionButton>
        ) : (
          <ActionButton loading={busy} onClick={saveAll}>
            모두 저장
          </ActionButton>
        )}
      </AppFooter>
    </>
  );
}

function confirmOverwrite(term: string) {
  return window.confirm(
    `‘${term}’ 카드가 이미 있어요. 기존 카드를 업데이트할까요?\n취소하면 이 카드는 건너뜁니다.`,
  );
}
