import {
  IconDot3HorizontalLine,
  IconPencilLine,
} from "@karrotmarket/react-monochrome-icon";
import { ContentDialog, Icon, List, Menu, TextField } from "@seed-design/react";
import { useState } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import {
  buildTagStudyGroups,
  normalizeTags,
  type TagStudyGroup,
  useCardsQuery,
} from "@/entities/card";
import { renameLibraryTag } from "@/features/manage-cards";
import { useAppSnackbar } from "@/shared/hooks/use-app-snackbar";
import { navigate } from "@/shared/navigation";
import { AppHeader } from "@/shared/ui/app-header";
import { EmptyState } from "@/shared/ui/empty-state";

interface RenameDialogState {
  originalTag: string;
  name: string;
}

export function AllTagsPage() {
  const { cards } = useCardsQuery();
  const groups = buildTagStudyGroups(cards);
  const notify = useAppSnackbar();
  const [renameDialog, setRenameDialog] = useState<RenameDialogState>();
  const [renaming, setRenaming] = useState(false);
  const normalizedName = normalizeTags([renameDialog?.name])[0] ?? "";
  const canRename = Boolean(
    renameDialog &&
    normalizedName &&
    normalizedName !== renameDialog.originalTag &&
    !renaming,
  );

  const handleRename = async () => {
    if (!renameDialog || !canRename) return;

    setRenaming(true);
    try {
      await renameLibraryTag(renameDialog.originalTag, normalizedName);
      notify(
        `‘${renameDialog.originalTag}’ 태그 이름을 변경했어요.`,
        "positive",
      );
      setRenameDialog(undefined);
    } catch (error) {
      notify(
        `태그 이름을 변경하지 못했어요.\n${error instanceof Error ? error.message : String(error)}`,
        "critical",
      );
    } finally {
      setRenaming(false);
    }
  };

  return (
    <>
      <AppHeader
        title="태그"
        subtitle={`${groups.length}개 태그`}
        onBack={() => navigate({ page: "home" })}
      />
      <main className="p-5">
        {groups.length ? (
          <section aria-label="전체 태그">
            <List.Root>
              {groups.map((group) => (
                <TagCard
                  key={group.tag}
                  group={group}
                  onSelect={(tag) => navigate({ page: "study", tag })}
                  onTest={(tag) =>
                    navigate({ page: "fill-in-the-blank-test", tag })
                  }
                  onRename={(tag) =>
                    setRenameDialog({ originalTag: tag, name: tag })
                  }
                />
              ))}
            </List.Root>
          </section>
        ) : (
          <EmptyState
            title="아직 태그가 없어요"
            description="카드에 태그를 추가하면 태그별로 학습할 수 있어요."
          />
        )}
      </main>

      <ContentDialog.Root
        open={Boolean(renameDialog)}
        onOpenChange={(open) => {
          if (!open && !renaming) setRenameDialog(undefined);
        }}
      >
        <ContentDialog.Backdrop />
        <ContentDialog.Positioner>
          <ContentDialog.Content>
            <ContentDialog.Header>
              <ContentDialog.Title>태그 이름 바꾸기</ContentDialog.Title>
              <ContentDialog.Description>
                이 태그가 등록된 모든 카드에 변경된 이름이 적용돼요.
              </ContentDialog.Description>
            </ContentDialog.Header>
            <ContentDialog.Body>
              <TextField.Root>
                <TextField.Input
                  autoFocus
                  aria-label="새 태그 이름"
                  value={renameDialog?.name ?? ""}
                  onChange={(event) =>
                    setRenameDialog((current) =>
                      current
                        ? { ...current, name: event.target.value }
                        : current,
                    )
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") void handleRename();
                  }}
                />
              </TextField.Root>
            </ContentDialog.Body>
            <ContentDialog.Footer>
              <ContentDialog.CloseButton asChild>
                <ActionButton variant="neutralWeak" disabled={renaming}>
                  취소
                </ActionButton>
              </ContentDialog.CloseButton>
              <ActionButton
                loading={renaming}
                disabled={!canRename}
                onClick={() => void handleRename()}
              >
                이름 바꾸기
              </ActionButton>
            </ContentDialog.Footer>
          </ContentDialog.Content>
        </ContentDialog.Positioner>
      </ContentDialog.Root>
    </>
  );
}

interface TagCardProps {
  group: TagStudyGroup;
  onSelect: (tag: string) => void;
  onTest: (tag: string) => void;
  onRename: (tag: string) => void;
}

function TagCard({ group, onSelect, onTest, onRename }: TagCardProps) {
  return (
    <List.Item>
      <List.Content asChild>
        <button
          className="cursor-pointer text-left"
          onClick={() => onSelect(group.tag)}
        >
          <List.Title>{group.tag}</List.Title>
          <List.Detail>
            학습 {group.correctPercentage}% ({group.correctCount}/
            {group.cardCount})
          </List.Detail>
        </button>
      </List.Content>
      <List.Suffix>
        <Menu.Root size="medium" placement="bottom-end" gutter={6}>
          <Menu.Trigger asChild>
            <ActionButton
              variant="ghost"
              size="small"
              layout="iconOnly"
              aria-label={`${group.tag} 태그 메뉴`}
            >
              <Icon svg={<IconDot3HorizontalLine />} />
            </ActionButton>
          </Menu.Trigger>
          <Menu.Positioner>
            <Menu.Content>
              <Menu.Item onClick={() => onRename(group.tag)}>
                <Icon svg={<IconPencilLine />} />
                <Menu.ItemLabel>이름 바꾸기</Menu.ItemLabel>
              </Menu.Item>
              <Menu.Item onClick={() => onTest(group.tag)}>
                <Menu.ItemLabel>빈칸 테스트</Menu.ItemLabel>
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Menu.Root>
      </List.Suffix>
    </List.Item>
  );
}
