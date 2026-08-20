import questionSetsJson from "./toefl-speaking-question-sets.json";
import { toeflSpeakingQuestionSetsSchema } from "../types/toefl-speaking-question";

export const TOEFL_SPEAKING_QUESTION_SETS =
  toeflSpeakingQuestionSetsSchema.parse(questionSetsJson);
