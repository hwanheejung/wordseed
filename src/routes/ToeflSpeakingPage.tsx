import { ToeflSpeakingPractice } from "@/features/practice-toefl-speaking";
import { navigate } from "@/shared/navigation";

export function ToeflSpeakingPage() {
  return <ToeflSpeakingPractice onExit={() => navigate({ page: "toefl" })} />;
}
