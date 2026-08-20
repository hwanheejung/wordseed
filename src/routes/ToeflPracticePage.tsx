import {
  IconAUppercaseALowercaseLine,
  IconDocumentPenLine,
  IconMicrophoneLine,
  IconQUppercaseChatbubbleRightLine,
} from "@karrotmarket/react-monochrome-icon";
import { Badge, Icon } from "@seed-design/react";
import type { ReactNode } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import { navigate } from "@/shared/navigation";
import { AppHeader } from "@/shared/ui/app-header";

export function ToeflPracticePage() {
  return (
    <>
      <AppHeader title="TOEFL" subtitle="틈틈이 연습해요" />
      <main className="min-h-[calc(100vh-84px)] p-5 pb-[100px]">
        <PracticeSection title="Speaking">
          <PracticeCard
            task="Task 2"
            title="인터뷰"
            description="주제별 질문에 답하는 연습이에요"
            icon={<IconMicrophoneLine />}
            secondaryAction={{
              label: "Magic Expression",
              ariaLabel: "Magic Expression 보기",
              onClick: () => navigate({ page: "toefl-magic-expressions" }),
            }}
            onStart={() => navigate({ page: "toefl-speaking" })}
          />
        </PracticeSection>

        <PracticeSection title="Writing">
          <PracticeCard
            task="Task 2"
            title="이메일 쓰기"
            description="상황과 목적에 맞는 이메일을 작성해요"
            icon={<IconDocumentPenLine />}
          />
          <PracticeCard
            task="Task 3"
            title="토론 글쓰기"
            description="다른 의견을 읽고 내 생각을 정리해요"
            icon={<IconQUppercaseChatbubbleRightLine />}
          />
        </PracticeSection>

        <PracticeSection title="Reading">
          <PracticeCard
            task="Task 1"
            title="단어 완성"
            description="문맥과 앞글자를 보고 단어를 떠올려요"
            icon={<IconAUppercaseALowercaseLine />}
          />
        </PracticeSection>
      </main>
    </>
  );
}

interface PracticeSectionProps {
  title: string;
  children: ReactNode;
}

function PracticeSection({ title, children }: PracticeSectionProps) {
  return (
    <section className="mt-7 first:mt-0" aria-labelledby={`${title}-title`}>
      <h2
        id={`${title}-title`}
        className="mb-3 text-[length:var(--seed-font-size-t5)] tracking-[-.02em]"
      >
        {title}
      </h2>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

interface PracticeCardProps {
  task: string;
  title: string;
  description: string;
  icon: ReactNode;
  secondaryAction?: {
    label: string;
    ariaLabel: string;
    onClick: () => void;
  };
  onStart?: () => void;
}

function PracticeCard({
  task,
  title,
  description,
  icon,
  secondaryAction,
  onStart,
}: PracticeCardProps) {
  return (
    <article className="rounded-[22px] flex flex-col gap-4 border border-[var(--seed-color-stroke-neutral-subtle)] bg-[var(--seed-color-bg-layer-default)] p-4">
      <div className="flex items-start gap-3.5">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[var(--seed-color-bg-brand-weak)] text-[var(--seed-color-fg-brand)]">
          <Icon svg={icon} size="xlarge" />
        </span>
        <div className="min-w-0 flex-1">
          <Badge tone="neutral" variant="weak">
            {task}
          </Badge>
          <h3 className="mt-2 mb-1 text-[length:var(--seed-font-size-t6)] tracking-[-.025em]">
            {title}
          </h3>
          <p className="m-0 text-[length:var(--seed-font-size-t3)] leading-[1.5] text-[var(--seed-color-fg-neutral-subtle)]">
            {description}
          </p>
        </div>
      </div>
      <div className={secondaryAction ? "grid grid-cols-2 gap-2.5" : "grid"}>
        {secondaryAction && (
          <ActionButton
            variant="neutralWeak"
            size="small"
            onClick={secondaryAction.onClick}
            aria-label={secondaryAction.ariaLabel}
          >
            {secondaryAction.label}
          </ActionButton>
        )}
        <ActionButton
          className="w-full"
          variant={onStart ? "brandSolid" : "neutralWeak"}
          size="small"
          disabled={!onStart}
          onClick={onStart}
          aria-label={onStart ? `${title} 연습 시작` : `${title} 연습 준비 중`}
        >
          {onStart ? "연습하기" : "준비 중"}
        </ActionButton>
      </div>
    </article>
  );
}
