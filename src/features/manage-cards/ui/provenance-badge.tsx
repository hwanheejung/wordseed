import { Badge } from "@seed-design/react";
import type { Provenance } from "../types/card-draft";

interface ProvenanceBadgeProps {
  provenance?: Provenance;
}

export function ProvenanceBadge({ provenance }: ProvenanceBadgeProps) {
  if (!provenance) return null;

  const labels = {
    source: "원문",
    ai: "AI",
    user: "직접 입력",
    fallback: "기본값",
  } as const;

  return (
    <Badge
      tone={provenance === "ai" ? "informative" : "neutral"}
      variant="weak"
    >
      {labels[provenance]}
    </Badge>
  );
}
