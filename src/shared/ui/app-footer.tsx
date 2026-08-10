import type { ReactNode } from "react";

interface AppFooterProps {
  children: ReactNode;
  className?: string;
}

export function AppFooter({ children, className = "" }: AppFooterProps) {
  return (
    <footer
      className={`z-12 shrink-0 border-t border-[var(--seed-color-stroke-neutral-subtle)] bg-[color-mix(in_srgb,var(--seed-color-bg-layer-default)_94%,transparent)] px-5 pt-3 pb-[calc(12px+var(--seed-safe-area-bottom))] backdrop-blur-[18px] ${className}`}
    >
      {children}
    </footer>
  );
}
