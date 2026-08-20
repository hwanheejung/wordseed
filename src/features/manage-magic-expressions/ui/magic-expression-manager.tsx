import {
  IconDot3HorizontalLine,
  IconPencilLine,
  IconTrashcanLine,
} from "@karrotmarket/react-monochrome-icon";
import { ContentDialog, Icon, Menu, TextField } from "@seed-design/react";
import { useState } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import {
  createMagicExpression,
  loadMagicExpressions,
  MagicExpressionCard,
  removeMagicExpression,
  type MagicExpression,
  updateMagicExpression,
} from "@/entities/magic-expression";
import { EmptyState } from "@/shared/ui/empty-state";

type DialogState =
  | { name: "closed" }
  | { name: "edit"; expression: MagicExpression }
  | { name: "delete"; expression: MagicExpression };

interface Draft {
  title: string;
  description: string;
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

  return (
    <>
      <main className="p-5 pb-10">
        {expressions.length ? (
          <section className="grid gap-3" aria-label="저장한 표현">
            {expressions.map((expression) => (
              <MagicExpressionCard
                key={expression.id}
                expression={expression}
                action={
                  <ExpressionActionsMenu
                    expression={expression}
                    onEdit={() => {
                      setDraft({
                        title: expression.title,
                        description: expression.description,
                      });
                      setDialog({ name: "edit", expression });
                    }}
                    onDelete={() =>
                      setDialog({ name: "delete", expression })
                    }
                  />
                }
              />
            ))}
          </section>
        ) : (
          <EmptyState
            title="저장한 표현이 없어요"
            description="자주 쓰는 표현을 추가해 답변 재료를 모아보세요."
          />
        )}
      </main>

      <ContentDialog.Root
        open={editorOpen}
        onOpenChange={(open) => {
          if (open) return;
          setDraft(EMPTY_DRAFT);
          onAddOpenChange(false);
          setDialog({ name: "closed" });
        }}
      >
        <ContentDialog.Backdrop />
        <ContentDialog.Positioner>
          <ContentDialog.Content>
            <ContentDialog.Header>
              <ContentDialog.Title>
                {dialog.name === "edit" ? "표현 수정" : "표현 추가"}
              </ContentDialog.Title>
              <ContentDialog.Description>
                반복해서 활용할 문장이나 답변 틀을 저장해요.
              </ContentDialog.Description>
            </ContentDialog.Header>
            <ContentDialog.Body>
              <ExpressionFields draft={draft} onChange={setDraft} />
            </ContentDialog.Body>
            <ContentDialog.Footer>
              <ContentDialog.CloseButton asChild>
                <ActionButton variant="neutralWeak">취소</ActionButton>
              </ContentDialog.CloseButton>
              <ActionButton disabled={!canSave} onClick={handleSave}>
                저장
              </ActionButton>
            </ContentDialog.Footer>
          </ContentDialog.Content>
        </ContentDialog.Positioner>
      </ContentDialog.Root>

      <ContentDialog.Root
        open={dialog.name === "delete"}
        onOpenChange={(open) => {
          if (!open) setDialog({ name: "closed" });
        }}
      >
        <ContentDialog.Backdrop />
        <ContentDialog.Positioner>
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

function ExpressionActionsMenu({
  expression,
  onEdit,
  onDelete,
}: {
  expression: MagicExpression;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Menu.Root size="medium" placement="bottom-end" gutter={6}>
      <Menu.Trigger asChild>
        <ActionButton
          variant="ghost"
          size="small"
          layout="iconOnly"
          aria-label={`${expression.title} 더보기`}
        >
          <Icon svg={<IconDot3HorizontalLine />} />
        </ActionButton>
      </Menu.Trigger>
      <Menu.Positioner>
        <Menu.Content>
          <Menu.Item onClick={onEdit}>
            <Icon svg={<IconPencilLine />} />
            <Menu.ItemLabel>수정하기</Menu.ItemLabel>
          </Menu.Item>
          <Menu.Item
            className="!text-[var(--seed-color-fg-critical)]"
            onClick={onDelete}
          >
            <Icon svg={<IconTrashcanLine />} />
            <Menu.ItemLabel>삭제하기</Menu.ItemLabel>
          </Menu.Item>
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
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
            autoFocus
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
