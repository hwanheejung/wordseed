import type { ToeflSpeakingQuestionSet } from "../types/toefl-speaking-question";

export function selectRandomQuestionSet(
  questionSets: ToeflSpeakingQuestionSet[],
  previousQuestionSetId?: string,
  random = Math.random,
) {
  const candidates = questionSets.filter(
    ({ id }) => id !== previousQuestionSetId,
  );
  const availableQuestionSets = candidates.length > 0 ? candidates : questionSets;
  const randomIndex = Math.floor(random() * availableQuestionSets.length);

  return availableQuestionSets[randomIndex];
}
