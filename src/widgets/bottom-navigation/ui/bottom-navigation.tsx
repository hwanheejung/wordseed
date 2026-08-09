import { forwardRef } from "react";

interface BottomNavigationProps {
  activePage: "home" | "add" | "library";
  onHome: () => void;
  onAdd: () => void;
  onLibrary: () => void;
}

export const BottomNavigation = forwardRef<HTMLElement, BottomNavigationProps>(
  ({ activePage, onHome, onAdd, onLibrary }, ref) => (
    <nav ref={ref} className="bottom-nav" aria-label="주요 메뉴">
      <button
        className={activePage === "home" ? "active" : ""}
        onClick={onHome}
      >
        <span>⌂</span>홈
      </button>
      <button
        className={activePage === "add" ? "active" : ""}
        onClick={onAdd}
      >
        <span>＋</span>추가
      </button>
      <button
        className={activePage === "library" ? "active" : ""}
        onClick={onLibrary}
      >
        <span>▤</span>단어장
      </button>
    </nav>
  ),
);

BottomNavigation.displayName = "BottomNavigation";
