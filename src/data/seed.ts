import type { VocabularyCard } from "../domain/types";

const now = new Date().toISOString();

export const seedCards: VocabularyCard[] = [
  {
    id: "seed-thrall",
    term: "thrall",
    normalizedTerm: "thrall",
    tags: [],
    createdAt: now,
    updatedAt: now,
    meanings: [
      {
        id: "seed-thrall-meaning-1",
        cardId: "seed-thrall",
        position: 0,
        definitionKo: "완전히 지배당하거나 영향을 받는 상태",
        definitionEn: "a state of being controlled or captivated",
        searchTokens: ["완전히", "지배당하거나", "영향을", "받는", "상태"],
        partOfSpeech: "noun",
        pronunciation: "/θrɔːl/",
        acceptedVariants: ["thrall"],
        examples: [
          {
            en: "The author's vivid descriptions held the readers in thrall throughout the suspenseful novel.",
            ko: "작가의 생생한 묘사는 긴장감 넘치는 소설 내내 독자들을 완전히 사로잡았다.",
            type: "sentence",
          },
        ],
        testExamples: [
          {
            en: "The courtroom was silent, held in thrall by the witness's unexpected testimony.",
            ko: "법정은 증인의 예상치 못한 증언에 완전히 사로잡혀 조용해졌다.",
            answer: "thrall",
            type: "sentence",
          },
          {
            en: "A: Did you notice how quiet the audience was during her story?\nB: Yes, she had the entire room in thrall.",
            ko: "A: 그녀가 이야기하는 동안 관객들이 얼마나 조용했는지 봤어?\nB: 응, 방 안의 모두가 그녀의 이야기에 완전히 사로잡혔어.",
            answer: "thrall",
            type: "dialogue",
          },
        ],
        status: "confusing",
      },
    ],
  },
  {
    id: "seed-induce",
    term: "induce",
    normalizedTerm: "induce",
    tags: [],
    createdAt: now,
    updatedAt: now,
    meanings: [
      {
        id: "seed-induce-meaning-1",
        cardId: "seed-induce",
        position: 0,
        definitionKo: "~하도록 유도하다; 유발하다",
        definitionEn: "to cause something to happen",
        searchTokens: ["유도하다", "유발하다"],
        partOfSpeech: "verb",
        pronunciation: "/ɪnˈduːs/",
        acceptedVariants: ["induce", "induces", "induced", "inducing"],
        examples: [
          {
            en: "The policy may induce companies to reduce unnecessary spending.",
            ko: "그 정책은 기업이 불필요한 지출을 줄이도록 유도할 수 있다.",
            type: "sentence",
          },
        ],
        testExamples: [
          {
            en: "The doctor warned that the medication could induce drowsiness, so I shouldn't drive.",
            ko: "의사는 그 약이 졸음을 유발할 수 있으므로 운전하면 안 된다고 경고했다.",
            answer: "induce",
            type: "sentence",
          },
          {
            en: "A: What could induce more employees to use public transportation?\nB: A reliable commuter subsidy might persuade them.",
            ko: "A: 무엇이 더 많은 직원이 대중교통을 이용하도록 유도할 수 있을까?\nB: 믿을 만한 통근 보조금이 그들을 설득할 수도 있어.",
            answer: "induce",
            type: "dialogue",
          },
        ],
        status: "unknown",
      },
    ],
  },
  {
    id: "seed-pervasive",
    term: "pervasive",
    normalizedTerm: "pervasive",
    tags: [],
    createdAt: now,
    updatedAt: now,
    meanings: [
      {
        id: "seed-pervasive-meaning-1",
        cardId: "seed-pervasive",
        position: 0,
        definitionKo: "널리 퍼져 있는, 만연한",
        definitionEn: "spreading widely throughout an area or group",
        searchTokens: ["널리", "퍼져", "있는", "만연한"],
        partOfSpeech: "adjective",
        pronunciation: "/pərˈveɪsɪv/",
        acceptedVariants: ["pervasive"],
        examples: [
          {
            en: "Digital technology has become pervasive in modern education.",
            ko: "디지털 기술은 현대 교육에 널리 퍼지게 되었다.",
            type: "sentence",
          },
        ],
        testExamples: [
          {
            en: "Smartphone use has become so pervasive that many restaurants now offer charging stations.",
            ko: "스마트폰 사용이 매우 보편화되어 이제 많은 식당에서 충전 시설을 제공한다.",
            answer: "pervasive",
            type: "sentence",
          },
          {
            en: "A: Why is it so hard to avoid online ads?\nB: Because targeted advertising is pervasive across most apps and websites.",
            ko: "A: 왜 온라인 광고를 피하기가 그렇게 어려워?\nB: 맞춤형 광고가 대부분의 앱과 웹사이트에 널리 퍼져 있기 때문이야.",
            answer: "pervasive",
            type: "dialogue",
          },
        ],
        status: "correct",
      },
    ],
  },
];
