import { BottomSheet } from "@seed-design/react";
import { useState } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import { Checkbox } from "seed-design/ui/checkbox";
import type { ConcealableCardField } from "@/entities/card";
import type { CardVisibilityPreferences } from "../types/card-visibility";

interface CardVisibilitySheetProps {
  open: boolean;
  preferences: CardVisibilityPreferences;
  onOpenChange: (open: boolean) => void;
  onApply: (fields: ConcealableCardField[]) => void;
}

const FIELD_OPTIONS: Array<{
  value: ConcealableCardField;
  label: string;
}> = [
  { value: "expression", label: "단어·표현" },
  { value: "partOfSpeech", label: "품사" },
  { value: "pronunciation", label: "발음" },
  { value: "definitionKo", label: "한국어 뜻" },
  { value: "definitionEn", label: "영어 뜻" },
  { value: "synonyms", label: "동의어" },
  { value: "antonyms", label: "반의어" },
  { value: "exampleEn", label: "영어 예문" },
  { value: "exampleKo", label: "예문 해석" },
];

export function CardVisibilitySheet({
  open,
  preferences,
  onOpenChange,
  onApply,
}: CardVisibilitySheetProps) {
  const [draft, setDraft] = useState(preferences.concealedFields);

  const toggle = (field: ConcealableCardField) =>
    setDraft((current) =>
      current.includes(field)
        ? current.filter((item) => item !== field)
        : [...current, field],
    );

  return (
    <BottomSheet.Root open={open} onOpenChange={onOpenChange}>
      <BottomSheet.Backdrop className="!z-[100]" />
      <BottomSheet.Positioner className="!z-[100]">
        <BottomSheet.Content className="max-h-[calc(100dvh-24px)] min-h-[50dvh]">
          <BottomSheet.Handle />
          <BottomSheet.Header>
            <BottomSheet.Title>카드 가리기 설정</BottomSheet.Title>
            <BottomSheet.Description>
              처음에는 먹물로 가려두고, 누르는 동안 확인해요.
            </BottomSheet.Description>
          </BottomSheet.Header>
          <BottomSheet.Body className="min-h-0 overflow-y-auto overscroll-contain">
            <div className="grid gap-2 py-2">
              {FIELD_OPTIONS.map((option) => (
                <Checkbox
                  key={option.value}
                  checked={draft.includes(option.value)}
                  onCheckedChange={() => toggle(option.value)}
                  label={option.label}
                  inputProps={{
                    "aria-label": `${option.label} 가리기`,
                  }}
                />
              ))}
            </div>
          </BottomSheet.Body>
          <BottomSheet.Footer className="shrink-0 pb-[calc(12px+var(--seed-safe-area-bottom))]">
            <div className="grid w-full grid-cols-[3fr_7fr] gap-2">
              <ActionButton variant="neutralWeak" onClick={() => setDraft([])}>
                초기화
              </ActionButton>
              <ActionButton
                onClick={() => {
                  onApply(draft);
                  onOpenChange(false);
                }}
              >
                적용하기
              </ActionButton>
            </div>
          </BottomSheet.Footer>
        </BottomSheet.Content>
      </BottomSheet.Positioner>
    </BottomSheet.Root>
  );
}
