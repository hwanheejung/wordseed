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
import { useAppNavigation } from "./navigation/use-app-navigation";

export default function App() {
  const { entry, navigate } = useAppNavigation();

  return (
    <div
      className={`relative mx-auto flex h-dvh w-full max-w-[520px] flex-col overflow-hidden bg-[var(--seed-color-bg-layer-default)] shadow-[0_0_40px_rgba(0,0,0,.06)] [&>main]:min-h-0! [&>main]:flex-1 [&>main]:overflow-x-hidden [&>main]:overflow-y-auto [&>main]:overscroll-contain min-[700px]:h-[calc(100dvh-48px)] min-[700px]:rounded-[30px] ${entry.page === "home" || entry.page === "add" || entry.page === "library" ? "pb-[calc(76px+var(--seed-safe-area-bottom))]" : ""}`}
    >
      {match(entry)
        .with({ page: "home" }, () => (
          <HomePage
            onAdd={() => navigate({ page: "add" })}
            onOpenLibrary={() => navigate({ page: "library" })}
            onStartStudy={() => navigate({ page: "study" })}
            onStartFocusStudy={() => navigate({ page: "focus-study" })}
            onStartFillInTheBlankTest={() =>
              navigate({ page: "fill-in-the-blank-test" })
            }
            onStartMeaning={(meaningId) =>
              navigate({ page: "study", meaningId })
            }
            onOpenCards={(cardIds, startIndex) =>
              navigate({ page: "card", cardIds, startIndex })
            }
            onStartTag={(tag) => navigate({ page: "study", tag })}
          />
        ))
        .with({ page: "add" }, () => (
          <AddCardPage
            onBack={() => navigate({ page: "home" })}
            onComplete={() => navigate({ page: "home" })}
          />
        ))
        .with({ page: "study" }, ({ tag, meaningId }) => (
          <StudyPage
            tag={tag}
            meaningId={meaningId}
            onBack={() => navigate({ page: "home" })}
          />
        ))
        .with({ page: "focus-study" }, () => (
          <FocusStudyPage
            onBack={() => navigate({ page: "home" })}
          />
        ))
        .with({ page: "fill-in-the-blank-test" }, () => (
          <FillInTheBlankTestPage
            onBack={() => navigate({ page: "home" })}
          />
        ))
        .with({ page: "card" }, ({ cardIds, startIndex }) => (
          <CardPage
            cardIds={cardIds}
            startIndex={startIndex}
            onBack={() => navigate({ page: "library" })}
            onDeleted={() => navigate({ page: "library" })}
          />
        ))
        .with({ page: "library" }, () => (
          <LibraryPage
            onBack={() => navigate({ page: "home" })}
            onOpen={(cardIds, startIndex) =>
              navigate({ page: "card", cardIds, startIndex })
            }
          />
        ))
        .exhaustive()}
      {(entry.page === "home" ||
        entry.page === "add" ||
        entry.page === "library") && (
        <SnackbarAvoidOverlap>
          <BottomNavigation
            activePage={entry.page}
            onHome={() => navigate({ page: "home" })}
            onAdd={() => navigate({ page: "add" })}
            onLibrary={() => navigate({ page: "library" })}
          />
        </SnackbarAvoidOverlap>
      )}
    </div>
  );
}
