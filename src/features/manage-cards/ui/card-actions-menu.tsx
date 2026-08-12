import {
  IconDot3VerticalLine,
  IconEyeLine,
  IconPencilLine,
  IconTrashcanLine,
} from "@karrotmarket/react-monochrome-icon";
import { ContentDialog, Icon, Menu } from "@seed-design/react";
import { useState } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import type { VocabularyCard } from "@/entities/card";
import { useAppSnackbar } from "@/shared/hooks/use-app-snackbar";
import { deleteVocabularyCard } from "../actions/delete-card";

interface CardActionsMenuProps {
  card: VocabularyCard;
  onEdit: () => void;
  onDeleted: (cardId: string) => void;
  onVisibility: () => void;
}

export function CardActionsMenu({
  card,
  onEdit,
  onDeleted,
  onVisibility,
}: CardActionsMenuProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const notify = useAppSnackbar();

  const handleDelete = async () => {
    setDeleting(true);

    try {
      await deleteVocabularyCard(card.id);
      notify(`‘${card.term}’ 카드를 삭제했어요.`, "positive");
      setDeleteOpen(false);
      onDeleted(card.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Menu.Root size="medium" placement="bottom-end" gutter={6}>
        <Menu.Trigger asChild>
          <ActionButton
            variant="neutralWeak"
            size="medium"
            layout="iconOnly"
            aria-label={`${card.term} 카드 메뉴`}
          >
            <Icon svg={<IconDot3VerticalLine />} />
          </ActionButton>
        </Menu.Trigger>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.Item onClick={onVisibility}>
              <Icon svg={<IconEyeLine />} />
              <Menu.ItemLabel>가릴 항목</Menu.ItemLabel>
            </Menu.Item>
            <Menu.Item onClick={onEdit}>
              <Icon svg={<IconPencilLine />} />
              <Menu.ItemLabel>카드 수정</Menu.ItemLabel>
            </Menu.Item>
            <Menu.Item
              className="!text-[var(--seed-color-fg-critical)]"
              onClick={() => setDeleteOpen(true)}
            >
              <Icon svg={<IconTrashcanLine />} />
              <Menu.ItemLabel>카드 삭제</Menu.ItemLabel>
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Menu.Root>

      <ContentDialog.Root open={deleteOpen} onOpenChange={setDeleteOpen}>
        <ContentDialog.Backdrop />
        <ContentDialog.Positioner>
          <ContentDialog.Content>
            <ContentDialog.Header>
              <ContentDialog.Title>카드를 삭제할까요?</ContentDialog.Title>
              <ContentDialog.Description>
                ‘{card.term}’ 카드와 학습 기록이 모두 삭제돼요.
              </ContentDialog.Description>
            </ContentDialog.Header>
            <ContentDialog.Footer>
              <ContentDialog.CloseButton asChild>
                <ActionButton variant="neutralWeak">취소</ActionButton>
              </ContentDialog.CloseButton>
              <ActionButton
                loading={deleting}
                className="!bg-[var(--seed-color-bg-critical-solid)]"
                onClick={() => void handleDelete()}
              >
                카드 삭제
              </ActionButton>
            </ContentDialog.Footer>
          </ContentDialog.Content>
        </ContentDialog.Positioner>
      </ContentDialog.Root>
    </>
  );
}
