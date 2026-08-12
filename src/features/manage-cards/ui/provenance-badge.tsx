import { Badge } from "@seed-design/react";
import type { Provenance } from "../types/card-draft";

interface ProvenanceBadgeProps {
  provenance?: Provenance;
}

export function ProvenanceBadge({ provenance }: ProvenanceBadgeProps) {
  if (!provenance) return null;

  const labels = {
    source: "입력한 내용",
    ai: "자동 완성",
    user: "직접 입력",
    fallback: "자동 완성",
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
