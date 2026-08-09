import { Icon, Menu } from "@seed-design/react";
import { IconDot3HorizontalLine } from "@karrotmarket/react-monochrome-icon";
import { useRef } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import { useAppSnackbar } from "@/shared/hooks/use-app-snackbar";
import {
  createLibraryBackup,
  restoreLibraryBackup,
} from "../actions/library-backup";

export function LibraryBackupMenu() {
  const importRef = useRef<HTMLInputElement>(null);
  const notify = useAppSnackbar();

  const download = async () => {
    const blob = new Blob([await createLibraryBackup()], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `wordseed-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const restore = async (file?: File) => {
    if (!file) return;
    try {
      await restoreLibraryBackup(await file.text());
      notify("백업을 복원했어요.", "positive");
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "복원하지 못했어요.",
        "critical",
      );
    }
  };

  return (
    <>
      <Menu.Root size="medium" placement="bottom-end" gutter={6}>
        <Menu.Trigger asChild>
          <ActionButton
            variant="ghost"
            size="medium"
            layout="iconOnly"
            aria-label="단어장 더보기"
          >
            <Icon svg={<IconDot3HorizontalLine />} />
          </ActionButton>
        </Menu.Trigger>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.Item onClick={() => void download()}>
              <Menu.ItemLabel>JSON 내보내기</Menu.ItemLabel>
            </Menu.Item>
            <Menu.Item onClick={() => importRef.current?.click()}>
              <Menu.ItemLabel>가져오기</Menu.ItemLabel>
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Menu.Root>
      <input
        ref={importRef}
        type="file"
        accept="application/json"
        hidden
        onChange={(event) => void restore(event.target.files?.[0])}
      />
    </>
  );
}
