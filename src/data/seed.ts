import type { VocabularyCard } from "../domain/types";

const now = new Date().toISOString();

export const seedCards: VocabularyCard[] = [
  {
    id: "seed-thrall",
    term: "thrall",
    normalizedTerm: "thrall",
    acceptedVariants: ["thrall"],
    partOfSpeech: "noun",
    pronunciation: "/θrɔːl/",
    meanings: [
      { definitionKo: "완전히 지배당하거나 영향을 받는 상태", definitionEn: "a state of being controlled or captivated", provenance: "source" },
    ],
    synonyms: ["captivity", "bondage", "control"],
    antonyms: ["freedom", "independence"],
    examples: [
      { en: "The author's vivid descriptions held the readers in thrall throughout the suspenseful novel.", ko: "작가의 생생한 묘사는 긴장감 넘치는 소설 내내 독자들을 완전히 사로잡았다.", type: "sentence", provenance: "source" },
    ],
    sourceLabel: "TOEFL reading notes",
    sourceText: "thrall — completely controlled or strongly influenced",
    status: "confusing",
    stage: 0,
    isNew: true,
    nextReviewAt: now,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "seed-induce",
    term: "induce",
    normalizedTerm: "induce",
    acceptedVariants: ["induce", "induces", "induced", "inducing"],
    partOfSpeech: "verb",
    pronunciation: "/ɪnˈduːs/",
    meanings: [
      { definitionKo: "~하도록 유도하다; 유발하다", definitionEn: "to cause something to happen", provenance: "ai" },
    ],
    synonyms: ["prompt", "cause", "lead to"],
    antonyms: ["prevent", "discourage"],
    examples: [
      { en: "The policy may induce companies to reduce unnecessary spending.", ko: "그 정책은 기업이 불필요한 지출을 줄이도록 유도할 수 있다.", type: "sentence", provenance: "source" },
    ],
    sourceLabel: "TOEFL practice passage",
    status: "unknown",
    stage: 0,
    isNew: true,
    nextReviewAt: now,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "seed-pervasive",
    term: "pervasive",
    normalizedTerm: "pervasive",
    acceptedVariants: ["pervasive"],
    partOfSpeech: "adjective",
    pronunciation: "/pərˈveɪsɪv/",
    meanings: [
      { definitionKo: "널리 퍼져 있는, 만연한", definitionEn: "spreading widely throughout an area or group", provenance: "ai" },
    ],
    synonyms: ["widespread", "prevalent", "ubiquitous"],
    antonyms: ["limited", "rare"],
    examples: [
      { en: "Digital technology has become pervasive in modern education.", ko: "디지털 기술은 현대 교육에 널리 퍼지게 되었다.", type: "sentence", provenance: "ai" },
    ],
    status: "correct",
    stage: 1,
    isNew: false,
    nextReviewAt: new Date(Date.now() - 60_000).toISOString(),
    lastReviewedAt: new Date(Date.now() - 86_400_000).toISOString(),
    createdAt: now,
    updatedAt: now,
  },
];
