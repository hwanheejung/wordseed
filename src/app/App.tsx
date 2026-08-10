import { match } from "ts-pattern";
import { AddCardPage } from "../routes/AddCardPage";
import { CardPage } from "../routes/CardPage";
import { FocusStudyPage } from "../routes/FocusStudyPage";
import { HomePage } from "../routes/HomePage";
import { LibraryPage } from "../routes/LibraryPage";
import { StudyPage } from "../routes/StudyPage";
import { FillInTheBlankTestPage } from "../routes/FillInTheBlankTestPage";
import { BottomNavigation } from "@/widgets/bottom-navigation";
import { SnackbarAvoidOverlap } from "seed-design/ui/snackbar";
import { useNavigationEntry } from "@/shared/navigation";

export default function App() {
  const entry = useNavigationEntry();

  return (
    <div
      className={`relative mx-auto flex h-dvh w-full max-w-[520px] flex-col overflow-hidden bg-[var(--seed-color-bg-layer-default)] shadow-[0_0_40px_rgba(0,0,0,.06)] [&>main]:min-h-0! [&>main]:flex-1 [&>main]:overflow-x-hidden [&>main]:overflow-y-auto [&>main]:overscroll-contain min-[700px]:h-[calc(100dvh-48px)] min-[700px]:rounded-[30px] ${entry.page === "home" || entry.page === "add" || entry.page === "library" ? "pb-[calc(76px+var(--seed-safe-area-bottom))]" : ""}`}
    >
      {match(entry)
        .with({ page: "home" }, () => (
          <HomePage />
        ))
        .with({ page: "add" }, () => (
          <AddCardPage />
        ))
        .with({ page: "study" }, ({ tag, meaningId }) => (
          <StudyPage tag={tag} meaningId={meaningId} />
        ))
        .with({ page: "focus-study" }, () => (
          <FocusStudyPage />
        ))
        .with({ page: "fill-in-the-blank-test" }, () => (
          <FillInTheBlankTestPage />
        ))
        .with({ page: "card" }, ({ cardIds, startIndex }) => (
          <CardPage cardIds={cardIds} startIndex={startIndex} />
        ))
        .with({ page: "library" }, () => (
          <LibraryPage />
        ))
        .exhaustive()}
      {(entry.page === "home" ||
        entry.page === "add" ||
        entry.page === "library") && (
        <SnackbarAvoidOverlap>
          <BottomNavigation activePage={entry.page} />
        </SnackbarAvoidOverlap>
      )}
    </div>
  );
}
