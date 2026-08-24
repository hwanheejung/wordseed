import { IconBookOpenLine } from "@karrotmarket/react-monochrome-icon";
import { forwardRef } from "react";
import { navigate } from "@/shared/navigation";

interface BottomNavigationProps {
  activePage: "home" | "add" | "library" | "toefl";
}

export const BottomNavigation = forwardRef<HTMLElement, BottomNavigationProps>(
  ({ activePage }, ref) => (
    <nav ref={ref} className="bottom-nav" aria-label="주요 메뉴">
      <button
        className={activePage === "home" ? "active" : ""}
        onClick={() => navigate({ page: "home" })}
      >
        <span>⌂</span>홈
      </button>
      <button
        className={activePage === "add" ? "active" : ""}
        onClick={() => navigate({ page: "add" })}
      >
        <span>＋</span>추가
      </button>
      <button
        className={activePage === "library" ? "active" : ""}
        onClick={() => navigate({ page: "library" })}
      >
        <span>▤</span>단어장
      </button>
      <button
        className={activePage === "toefl" ? "active" : ""}
        onClick={() => navigate({ page: "toefl" })}
      >
        <span aria-hidden="true">
          <IconBookOpenLine size={22} />
        </span>
        TOEFL
      </button>
    </nav>
  ),
);

BottomNavigation.displayName = "BottomNavigation";
