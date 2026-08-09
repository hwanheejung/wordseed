import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useRef } from "react";
import { VocabularyCardView } from "@/entities/card";
import type { StudyQueueItem } from "../types/study-queue-item";
import { speak } from "@/shared/utils/speech";

export function SwipeableCardStack({
  item,
  items,
  showAllMeanings = false,
  onNavigate,
}: {
  item: StudyQueueItem;
  items: StudyQueueItem[];
  showAllMeanings?: boolean;
  onNavigate: (direction: "next" | "previous") => void;
}) {
  const navigationPending = useRef(false);
  const [viewportRef, emblaApi] = useEmblaCarousel({
    active: items.length > 1,
    align: "center",
    containScroll: false,
    dragFree: false,
    duration: 24,
    skipSnaps: false,
    startIndex: 1,
    watchDrag: (_api, event) =>
      !(event.target as HTMLElement).closest("button"),
  });
  const sameCardCount = items.findIndex(
    (candidate) => candidate.card.id !== item.card.id,
  );
  const layerCount = Math.min(
    3,
    sameCardCount === -1 ? items.length : sameCardCount,
  );
  const slides = [items.at(-1) ?? item, item, items[1] ?? item];

  // Synchronize Embla selection events with the card-session navigation callback.
  useEffect(() => {
    if (!emblaApi) return;

    const handleSelect = () => {
      const selectedIndex = emblaApi.selectedScrollSnap();
      if (selectedIndex === 1 || navigationPending.current) return;
      navigationPending.current = true;
      onNavigate(selectedIndex === 2 ? "next" : "previous");
    };

    emblaApi.on("select", handleSelect);

    return () => {
      emblaApi.off("select", handleSelect);
    };
  }, [emblaApi, onNavigate]);

  // Synchronize Embla's selected slide when the active meaning changes.
  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit({ startIndex: 1 });
    emblaApi.scrollTo(1, true);
    navigationPending.current = false;
  }, [emblaApi, item.meaning.id]);

  return (
    <div
      className="relative -mx-5 isolate h-full min-h-0 px-5 pb-12"
      aria-label={`${item.meaning.expression || item.card.term} 카드, 좌우로 밀어 이전 또는 다음 뜻 보기`}
    >
      {Array.from({ length: Math.max(0, layerCount - 1) }, (_, index) => (
        <div
          className="absolute inset-x-5 top-0 bottom-12 origin-bottom rounded-[28px] border border-[var(--seed-color-stroke-neutral-subtle)] bg-[var(--seed-color-bg-layer-default)] shadow-[0_10px_28px_rgba(0,0,0,.07)]"
          key={index}
          style={{
            transform: `translateY(${(index + 1) * 16}px) scale(${1 - (index + 1) * 0.03})`,
            zIndex: layerCount - index,
          }}
          aria-hidden="true"
        />
      ))}
      <div
        ref={viewportRef}
        className="relative z-5 h-[calc(100%-48px)] overflow-hidden touch-pan-y"
      >
        <div className="-ml-5 flex h-full cursor-grab select-none active:cursor-grabbing">
          {slides.map((slide, index) => (
            <div
              className="h-full min-w-0 flex-[0_0_100%] pl-5 [&>article]:h-full"
              key={`${index}-${slide.meaning.id}`}
              aria-hidden={index !== 1}
            >
              <VocabularyCardView
                fragment={slide.card}
                meaningId={showAllMeanings ? undefined : slide.meaning.id}
                onPronounce={speak}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
