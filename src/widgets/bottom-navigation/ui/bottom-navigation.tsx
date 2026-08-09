import { forwardRef } from "react";
import { navigate } from "@/shared/navigation";

interface BottomNavigationProps {
  activePage: "home" | "add" | "library";
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
    </nav>
  ),
);

BottomNavigation.displayName = "BottomNavigation";
