import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useRef } from "react";
import { VocabularyCardView } from "@/entities/card";
import type { ConcealableCardField } from "@/entities/card";
import type { StudyQueueItem } from "../types/study-queue-item";
import { speak } from "@/shared/utils/speech";
import { getRemainingCardLayerCount } from "../utils/card-stack";

export function SwipeableCardStack({
  item,
  previousItem,
  nextItem,
  navigationRevision,
  concealedFields = [],
  showAllMeanings = false,
  onNavigate,
}: {
  item: StudyQueueItem;
  previousItem?: StudyQueueItem;
  nextItem?: StudyQueueItem;
  navigationRevision: number;
  concealedFields?: ConcealableCardField[];
  showAllMeanings?: boolean;
  onNavigate: (direction: "next" | "previous") => void;
}) {
  const navigationPending = useRef(false);
  const dragIntent = useRef(false);
  const dragStartX = useRef(0);
  const [viewportRef, emblaApi] = useEmblaCarousel({
    active: Boolean(previousItem || nextItem),
    align: "center",
    containScroll: false,
    dragFree: false,
    duration: 24,
    skipSnaps: false,
    startIndex: 1,
    watchDrag: (_api, event) =>
      !(event.target as HTMLElement).closest("button"),
  });
  const layerCount = getRemainingCardLayerCount(item);
  const slides = [previousItem ?? item, item, nextItem ?? item];

  // Synchronize Embla selection events with the card-session navigation callback.
  useEffect(() => {
    if (!emblaApi) return;

    const handleSelect = () => {
      const selectedIndex = emblaApi.selectedScrollSnap();
      if (selectedIndex === 1 || navigationPending.current) return;

      if (!dragIntent.current) {
        emblaApi.scrollTo(1, true);

        return;
      }

      const destination = selectedIndex === 2 ? nextItem : previousItem;
      if (!destination) {
        dragIntent.current = false;
        emblaApi.scrollTo(1);

        return;
      }

      navigationPending.current = true;
      dragIntent.current = false;
      onNavigate(selectedIndex === 2 ? "next" : "previous");
    };

    emblaApi.on("select", handleSelect);

    return () => {
      emblaApi.off("select", handleSelect);
    };
  }, [emblaApi, nextItem, onNavigate, previousItem]);

  // Synchronize Embla's selected slide when the active meaning changes.
  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit({ startIndex: 1 });
    emblaApi.scrollTo(1, true);
    navigationPending.current = false;
    dragIntent.current = false;
  }, [emblaApi, navigationRevision]);

  return (
    <div
      className="relative -mx-5 isolate h-full min-h-0 px-5 pb-12"
      aria-label={`${item.meaning.expression || item.card.term} 카드, 좌우로 밀어 이전 또는 다음 뜻 보기`}
    >
      {Array.from({ length: Math.max(0, layerCount - 1) }, (_, index) => (
        <div
          className="absolute inset-x-5 top-0 bottom-12 origin-bottom rounded-[28px] border border-[var(--seed-color-stroke-neutral-subtle)] bg-[var(--seed-color-bg-layer-default)] shadow-[0_10px_28px_rgba(0,0,0,.07)] transition-transform duration-[160ms] ease-[cubic-bezier(.23,1,.32,1)]"
          key={index}
          style={{
            transform: `translate3d(${(index + 2) * 5}px, ${(index + 2) * 5}px, 0)`,
            zIndex: 1 - index,
          }}
          aria-hidden="true"
        />
      ))}
      <div
        ref={viewportRef}
        className="relative z-5 h-[calc(100%-48px)] overflow-hidden touch-pan-y"
        onPointerDown={(event) => {
          dragStartX.current = event.clientX;
          dragIntent.current = false;
        }}
        onPointerMove={(event) => {
          if (Math.abs(event.clientX - dragStartX.current) > 24)
            dragIntent.current = true;
        }}
        onPointerUp={() =>
          window.setTimeout(() => (dragIntent.current = false))
        }
        onPointerCancel={() => {
          dragIntent.current = false;
        }}
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
                concealedFields={concealedFields}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
