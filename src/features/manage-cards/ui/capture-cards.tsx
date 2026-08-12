import { TextField } from "@seed-design/react";
import { useRef, useState } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import { useAppSnackbar } from "@/shared/hooks/use-app-snackbar";
import { AppFooter } from "@/shared/ui/app-footer";
import { AppHeader } from "@/shared/ui/app-header";
import { enrichText, extractImage } from "../api/cards-api";
import { prepareImageForExtraction } from "../helpers/prepare-image-for-extraction";
import type { CardDraft, ExtractedCandidate } from "../types/card-draft";

interface CaptureCardsProps {
  text: string;
  image?: string;
  onTextChange: (text: string) => void;
  onImageChange: (image: string | undefined) => void;
  onBack: () => void;
  onDrafts: (drafts: CardDraft[]) => void;
  onCandidates: (candidates: ExtractedCandidate[]) => void;
}

export function CaptureCards({
  text,
  image,
  onTextChange,
  onImageChange,
  onBack,
  onDrafts,
  onCandidates,
}: CaptureCardsProps) {
  const [busy, setBusy] = useState(false);
  const [optimizingImage, setOptimizingImage] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);
  const photoLibraryRef = useRef<HTMLInputElement>(null);
  const notify = useAppSnackbar();

  const handleImageSelection = async (file?: File) => {
    if (!file) return;
    setOptimizingImage(true);
    try {
      onImageChange(await prepareImageForExtraction(file));
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "사진을 변환하지 못했어요. 다른 사진을 선택해 주세요.",
        "critical",
      );
    } finally {
      setOptimizingImage(false);
    }
  };

  const createCards = async () => {
    if (!text.trim() && !image)
      return notify("단어나 사진을 먼저 추가해 주세요.", "critical");
    setBusy(true);
    try {
      if (image) {
        try {
          onCandidates(await extractImage(image));
        } catch (error) {
          notify(
            error instanceof Error
              ? error.message
              : "사진 분석에 실패했어요. 다시 시도해 주세요.",
            "critical",
          );
        }
      } else {
        try {
          onDrafts(await enrichText(text));
        } catch (error) {
          notify(
            error instanceof Error
              ? error.message
              : "AI 카드 생성에 실패했어요. 다시 시도해 주세요.",
            "critical",
          );
        }
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <AppHeader
        title="단어 추가"
        subtitle="자료를 그대로 가져오고, 빈칸만 AI가 채워요"
        onBack={onBack}
      />
      <main className="p-5">
        <section className="[&_textarea]:min-h-[132px]">
          <label className="field-label" htmlFor="vocabulary-input">
            단어 또는 표현
          </label>
          <TextField.Root size="large">
            <TextField.Textarea
              id="vocabulary-input"
              aria-label="단어 또는 표현"
              value={text}
              onChange={(event) => onTextChange(event.target.value)}
              placeholder={"예: induce\nThe policy may induce companies..."}
            />
          </TextField.Root>
          <p className="field-help">
            단어와 아는 뜻, 예문을 편한 형식으로 입력해 주세요. AI가 항목과
            뜻을 구분해요.
          </p>
        </section>

        <div className="my-[26px] flex items-center gap-3 text-[length:var(--seed-font-size-t2)] text-[var(--seed-color-fg-neutral-subtle)] before:h-px before:flex-1 before:bg-[var(--seed-color-stroke-neutral-subtle)] before:content-[''] after:h-px after:flex-1 after:bg-[var(--seed-color-stroke-neutral-subtle)] after:content-['']">
          <span>또는</span>
        </div>

        <section
          className={`overflow-hidden rounded-3xl border-[1.5px] p-[18px] text-center ${image ? "border-solid border-[var(--seed-color-stroke-neutral-weak)] bg-[var(--seed-color-bg-layer-default)]" : "border-dashed border-[var(--seed-color-stroke-neutral-weak)] bg-[var(--seed-color-bg-layer-fill)]"} [&>img]:block [&>img]:h-[230px] [&>img]:w-full [&>img]:rounded-2xl [&>img]:object-cover`}
        >
          {image ? (
            <img src={image} alt="선택한 학습 자료 미리보기" />
          ) : (
            <div className="px-2.5 pt-6 pb-[18px] [&_b]:block [&_b]:text-[length:var(--seed-font-size-t5)] [&_p]:mt-1.5 [&_p]:mb-0 [&_p]:text-[var(--seed-color-fg-neutral-subtle)]">
              <span className="mx-auto mb-3.5 grid size-14 place-items-center rounded-[18px] bg-[var(--seed-color-bg-brand-weak)] text-[28px] text-[var(--seed-color-fg-brand)]">
                ▧
              </span>
              <b>교재나 노트를 촬영해 보세요</b>
              <p>한 장에 여러 단어가 있어도 괜찮아요.</p>
            </div>
          )}
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            disabled={busy || optimizingImage}
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              void handleImageSelection(file);
            }}
          />
          <input
            ref={photoLibraryRef}
            type="file"
            accept="image/*"
            disabled={busy || optimizingImage}
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              void handleImageSelection(file);
            }}
          />
          <div className="mt-3.5 flex justify-center gap-2">
            <ActionButton
              variant="neutralWeak"
              disabled={busy || optimizingImage}
              onClick={() => cameraRef.current?.click()}
            >
              {image ? "다시 촬영" : "사진 촬영"}
            </ActionButton>
            <ActionButton
              variant="neutralWeak"
              disabled={busy || optimizingImage}
              onClick={() => photoLibraryRef.current?.click()}
            >
              사진첩에서 선택
            </ActionButton>
            {image && (
              <ActionButton
                variant="ghost"
                disabled={busy || optimizingImage}
                onClick={() => onImageChange(undefined)}
              >
                삭제
              </ActionButton>
            )}
          </div>
          {optimizingImage && (
            <p
              className="mt-3 mb-0 text-[length:var(--seed-font-size-t2)] text-[var(--seed-color-fg-neutral-subtle)]"
              aria-live="polite"
            >
              사진 최적화 중...
            </p>
          )}
        </section>
      </main>
      <AppFooter>
        <ActionButton
          size="large"
          loading={busy}
          disabled={busy || optimizingImage || (!text.trim() && !image)}
          onClick={createCards}
          className="w-full justify-center"
        >
          카드 초안 만들기
        </ActionButton>
      </AppFooter>
    </>
  );
}
