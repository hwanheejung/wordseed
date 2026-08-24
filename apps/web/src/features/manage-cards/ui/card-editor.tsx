import { useState } from "react";
import type { VocabularyCard } from "@/entities/card";
import { cardToDraft } from "../helpers/card-draft-mappers";
import type { CardDraft } from "../types/card-draft";
import { CardReview } from "./card-review";

interface CardEditorProps {
  card: VocabularyCard;
  availableTags: string[];
  onClose: () => void;
  onSaved: (card: VocabularyCard) => void;
  onDeleted: (cardId: string) => void;
}

export function CardEditor({
  card,
  availableTags,
  onClose,
  onSaved,
  onDeleted,
}: CardEditorProps) {
  const [drafts, setDrafts] = useState<CardDraft[]>([cardToDraft(card)]);

  return (
    <CardReview
      drafts={drafts}
      availableTags={availableTags}
      active={0}
      onDraftsChange={setDrafts}
      onActiveChange={() => undefined}
      onBack={onClose}
      onSaved={(savedCards) => {
        if (savedCards[0]) onSaved(savedCards[0]);
        onClose();
      }}
      onDeleted={() => onDeleted(card.id)}
    />
  );
}
