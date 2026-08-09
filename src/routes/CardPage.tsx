import { useState } from "react";
import {
  normalizeTags,
  type VocabularyCard,
  useCardCollection,
} from "@/entities/card";
import {
  cardToDraft,
  CardReview,
  type CardDraft,
} from "@/features/manage-cards";
import {
  LearningCardSession,
  startQueueAt,
} from "@/features/study-session";

interface EditState {
  drafts: CardDraft[];
  active: number;
}

interface CardPageProps {
  cardIds: string[];
  startIndex: number;
  onBack: () => void;
  onDeleted: () => void | Promise<void>;
}

export function CardPage({
  cardIds,
  startIndex,
  onBack,
  onDeleted,
}: CardPageProps) {
  const { cards } = useCardCollection();
  const [editState, setEditState] = useState<EditState>();
  const cardsById = new Map(cards.map((card) => [card.id, card]));
  const orderedCards = cardIds
    .map((cardId) => cardsById.get(cardId))
    .filter((card): card is VocabularyCard => Boolean(card));
  const items = startQueueAt(orderedCards, startIndex).flatMap((card) =>
    card.meanings.map((meaning) => ({ card, meaning })),
  );

  const handleEdit = (card: VocabularyCard) =>
    setEditState({ drafts: [cardToDraft(card)], active: 0 });

  const handleSaved = () => setEditState(undefined);

  if (editState)
    return (
      <CardReview
        drafts={editState.drafts}
        availableTags={normalizeTags(cards.flatMap((card) => card.tags))}
        active={editState.active}
        onDraftsChange={(drafts) =>
          setEditState((current) =>
            current ? { ...current, drafts } : current,
          )
        }
        onActiveChange={(active) =>
          setEditState((current) =>
            current ? { ...current, active } : current,
          )
        }
        onBack={() => setEditState(undefined)}
        onSaved={handleSaved}
        onDeleted={onDeleted}
      />
    );

  return (
    <LearningCardSession
      key={items.map((item) => item.card.updatedAt).join("|")}
      title="단어 카드"
      items={items}
      emptyTitle="표시할 단어가 없어요"
      emptyDescription="단어장에서 다른 카드를 선택해 주세요."
      onBack={onBack}
      onEdit={handleEdit}
      subtitle={(item) => `${item.card.meanings.length}개 뜻`}
    />
  );
}
