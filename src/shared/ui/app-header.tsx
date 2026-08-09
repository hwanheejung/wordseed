import { IconArrowLeftLine } from "@karrotmarket/react-monochrome-icon";
import { Icon } from "@seed-design/react";
import type { ReactNode } from "react";
import { ActionButton } from "seed-design/ui/action-button";

export function AppHeader({
  title,
  subtitle,
  onBack,
  action,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  action?: ReactNode;
}) {
  return (
    <header className="z-10 shrink-0 border-b border-[var(--seed-color-stroke-neutral-subtle)] bg-[color-mix(in_srgb,var(--seed-color-bg-layer-default)_92%,transparent)] px-5 pt-[calc(14px+var(--seed-safe-area-top))] pb-3.5 backdrop-blur-[18px] min-[700px]:rounded-t-[30px] min-[700px]:pt-3.5">
      <div className="flex min-h-12 items-center gap-3">
        {onBack ? (
          <ActionButton
            variant="neutralWeak"
            size="medium"
            layout="iconOnly"
            onClick={onBack}
            aria-label="뒤로 가기"
          >
            <Icon svg={<IconArrowLeftLine />} />
          </ActionButton>
        ) : (
          <div className="grid size-10 place-items-center rounded-[14px] bg-[var(--seed-color-bg-brand-solid)] text-xl font-extrabold text-white shadow-[0_6px_16px_color-mix(in_srgb,var(--seed-color-bg-brand-solid)_28%,transparent)]">
            W
          </div>
        )}
        <div className="min-w-0">
          <h1 className="m-0 text-[length:var(--seed-font-size-t7)] leading-[var(--seed-line-height-t7)] tracking-[-.03em]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 mb-0 text-[length:var(--seed-font-size-t3)] text-[var(--seed-color-fg-neutral-subtle)]">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="ml-auto shrink-0">{action}</div>}
      </div>
    </header>
  );
}
