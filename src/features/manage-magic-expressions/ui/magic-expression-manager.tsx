import { ContentDialog, ResponsiveDialog, TextField } from "@seed-design/react";
import { type CSSProperties, useEffect, useState } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import {
  createMagicExpression,
  loadMagicExpressions,
  moveMagicExpression,
  removeMagicExpression,
  type MagicExpression,
  updateMagicExpression,
} from "@/entities/magic-expression";
import { EmptyState } from "@/shared/ui/empty-state";
import { MagicExpressionList } from "./magic-expression-list";

type DialogState =
  | { name: "closed" }
  | { name: "edit"; expression: MagicExpression }
  | { name: "delete"; expression: MagicExpression };

interface Draft {
  title: string;
  description: string;
}

interface EditorViewport {
  height: number;
  offsetTop: number;
}

interface MagicExpressionManagerProps {
  addOpen: boolean;
  onAddOpenChange: (open: boolean) => void;
}

const EMPTY_DRAFT: Draft = { title: "", description: "" };

export function MagicExpressionManager({
  addOpen,
  onAddOpenChange,
}: MagicExpressionManagerProps) {
  const [expressions, setExpressions] = useState(loadMagicExpressions);
  const [dialog, setDialog] = useState<DialogState>({ name: "closed" });
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [editorViewport, setEditorViewport] = useState(readEditorViewport);
  const editorOpen = addOpen || dialog.name === "edit";
  const canSave = Boolean(draft.title.trim() && draft.description.trim());

  function handleSave() {
    if (!canSave) return;

    const input = { title: draft.title, description: draft.description };
    setExpressions(
      dialog.name === "edit"
        ? updateMagicExpression(dialog.expression.id, input)
        : createMagicExpression(input),
    );
    setDraft(EMPTY_DRAFT);
    onAddOpenChange(false);
    setDialog({ name: "closed" });
  }

  function handleDelete() {
    if (dialog.name !== "delete") return;

    setExpressions(removeMagicExpression(dialog.expression.id));
    setDialog({ name: "closed" });
  }

  function handleEdit(expression: MagicExpression) {
    setDraft({
      title: expression.title,
      description: expression.description,
    });
    setDialog({ name: "edit", expression });
  }

  function handleMove(expressionId: string, targetIndex: number) {
    setExpressions(moveMagicExpression(expressionId, targetIndex));
  }

  function handleEditorOpenChange(open: boolean) {
    if (open) return;

    setDraft(EMPTY_DRAFT);
    onAddOpenChange(false);
    setDialog({ name: "closed" });
  }

  // Synchronize the editor surface with the mobile browser's visual viewport.
  useEffect(() => {
    if (!editorOpen) return;

    const updateViewport = () => setEditorViewport(readEditorViewport());

    updateViewport();
    window.addEventListener("resize", updateViewport);
    window.visualViewport?.addEventListener("resize", updateViewport);
    window.visualViewport?.addEventListener("scroll", updateViewport);

    return () => {
      window.removeEventListener("resize", updateViewport);
      window.visualViewport?.removeEventListener("resize", updateViewport);
      window.visualViewport?.removeEventListener("scroll", updateViewport);
    };
  }, [editorOpen]);

  return (
    <>
      <main className="p-5 pb-10">
        {expressions.length ? (
          <MagicExpressionList
            expressions={expressions}
            onEdit={handleEdit}
            onDelete={(expression) =>
              setDialog({ name: "delete", expression })
            }
            onMove={handleMove}
          />
        ) : (
          <EmptyState
            title="저장한 표현이 없어요"
            description="자주 쓰는 표현을 추가해 답변 재료를 모아보세요."
          />
        )}
      </main>

      <ResponsiveDialog.Root
        open={editorOpen}
        onOpenChange={handleEditorOpenChange}
      >
        <ResponsiveDialog.Backdrop className="!z-40" />
        <ResponsiveDialog.Positioner
          className="!z-40"
          style={
            {
              "--magic-expression-editor-height": `${editorViewport.height}px`,
              top: `${editorViewport.offsetTop}px`,
              bottom: "auto",
              height: `${editorViewport.height}px`,
            } as CSSProperties
          }
        >
          <ResponsiveDialog.Content className="max-md:!flex max-md:!h-[var(--magic-expression-editor-height)] max-md:!max-h-[var(--magic-expression-editor-height)] max-md:flex-col max-md:rounded-t-[var(--seed-radius-r6)] max-md:rounded-b-none">
            <ResponsiveDialog.Header className="shrink-0">
              <ResponsiveDialog.Title>
                {dialog.name === "edit" ? "표현 수정" : "표현 추가"}
              </ResponsiveDialog.Title>
              <ResponsiveDialog.Description>
                반복해서 활용할 문장이나 답변 틀을 저장해요.
              </ResponsiveDialog.Description>
            </ResponsiveDialog.Header>
            <ResponsiveDialog.Body className="min-h-0 overflow-y-auto overscroll-contain touch-pan-y pb-2 max-md:flex-1">
              <ExpressionFields draft={draft} onChange={setDraft} />
            </ResponsiveDialog.Body>
            <ResponsiveDialog.Footer className="shrink-0 bg-[var(--seed-color-bg-layer-floating)]">
              <div className="grid grid-cols-2 gap-2.5">
                <ResponsiveDialog.CloseButton asChild>
                  <ActionButton variant="neutralWeak">취소</ActionButton>
                </ResponsiveDialog.CloseButton>
                <ActionButton disabled={!canSave} onClick={handleSave}>
                  저장
                </ActionButton>
              </div>
            </ResponsiveDialog.Footer>
          </ResponsiveDialog.Content>
        </ResponsiveDialog.Positioner>
      </ResponsiveDialog.Root>

      <ContentDialog.Root
        open={dialog.name === "delete"}
        onOpenChange={(open) => {
          if (!open) setDialog({ name: "closed" });
        }}
      >
        <ContentDialog.Backdrop className="!z-40" />
        <ContentDialog.Positioner className="!z-40">
          <ContentDialog.Content>
            {dialog.name === "delete" && (
              <>
                <ContentDialog.Header>
                  <ContentDialog.Title>표현을 삭제할까요?</ContentDialog.Title>
                  <ContentDialog.Description>
                    ‘{dialog.expression.title}’ 표현이 이 기기에서 삭제돼요.
                  </ContentDialog.Description>
                </ContentDialog.Header>
                <ContentDialog.Footer>
                  <ContentDialog.CloseButton asChild>
                    <ActionButton variant="neutralWeak">취소</ActionButton>
                  </ContentDialog.CloseButton>
                  <ActionButton
                    className="!bg-[var(--seed-color-bg-critical-solid)]"
                    onClick={handleDelete}
                  >
                    표현 삭제
                  </ActionButton>
                </ContentDialog.Footer>
              </>
            )}
          </ContentDialog.Content>
        </ContentDialog.Positioner>
      </ContentDialog.Root>
    </>
  );
}

function ExpressionFields({
  draft,
  onChange,
}: {
  draft: Draft;
  onChange: (draft: Draft) => void;
}) {
  return (
    <div className="grid gap-4">
      <div>
        <label className="field-label !mt-0" htmlFor="expression-title">
          제목
        </label>
        <TextField.Root>
          <TextField.Input
            id="expression-title"
            aria-label="제목"
            value={draft.title}
            onChange={(event) =>
              onChange({ ...draft, title: event.target.value })
            }
            placeholder="예: 의견 시작하기"
          />
        </TextField.Root>
      </div>
      <div className="[&_textarea]:min-h-[180px]">
        <label
          className="field-label !mt-0"
          htmlFor="expression-description"
        >
          내용 <span>Markdown</span>
        </label>
        <TextField.Root>
          <TextField.Textarea
            id="expression-description"
            aria-label="내용"
            value={draft.description}
            onChange={(event) =>
              onChange({ ...draft, description: event.target.value })
            }
            placeholder="예: **Personally**, I prefer this option."
          />
        </TextField.Root>
      </div>
    </div>
  );
}

function readEditorViewport(): EditorViewport {
  return {
    height: window.visualViewport?.height ?? window.innerHeight,
    offsetTop: window.visualViewport?.offsetTop ?? 0,
  };
}
