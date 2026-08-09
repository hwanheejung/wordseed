/* global console, process */

import { readFile, writeFile } from "node:fs/promises";

const [inputPath, outputPath] = process.argv.slice(2);
if (!inputPath || !outputPath) {
  throw new Error("Usage: node scripts/migrate-legacy-json.mjs <input> <output>");
}

// Each number is the zero-based meaning index for the corresponding legacy
// test example. These were reviewed in small batches rather than inferred by
// array position, since legacy tests lived at card level.
const MULTI_MEANING_TEST_TARGETS = {
  manage: [0, 1, 1],
  emerge: [0, 1],
  balance: [3, 2],
  coordinate: [0, 1],
  worthwhile: [0, 1],
  judge: [2, 1],
  substantially: [0, 1],
  utilize: [1, 0],
  cue: [0, 0],
  magnify: [0, 1],
  affirm: [0, 0],
  principal: [1, 0],
  peculiar: [0, 1],
  measure: [0, 1, 2],
  exhaust: [0, 1],
  count: [0, 3],
  gratify: [0, 1],
  article: [0, 2],
  analyze: [0, 1],
  seek: [0, 1],
  engage: [0, 1],
  sum: [0, 1],
  category: [2, 0],
  ordinary: [1, 0],
  local: [2, 0],
  account: [0, 1, 2],
  blend: [0, 1],
  cognitive: [0, 1],
  drain: [0, 1],
  colonize: [0, 1],
  manifestation: [0, 0, 1],
  agency: [0, 0],
  principle: [0, 2],
  figure: [0, 2],
  perspective: [3, 4],
  gaze: [0, 1],
  subdivision: [1, 1],
  alert: [0, 1],
  outstanding: [0, 1],
  sentence: [0, 2],
  bill: [0, 1],
  tear: [0, 2],
  apology: [0, 0],
  comparable: [1, 1],
  companion: [1, 0],
  credit: [0, 1],
  compound: [0, 1],
  unwind: [0, 0, 1],
  neglect: [0, 1],
  obligation: [1, 0],
  abandon: [1, 1],
  imaginary: [0, 0],
  consonant: [0, 1],
  rule: [0, 2],
  bulk: [0, 1],
};

const INVALID_ACCEPTED_VARIANTS = new Set(["consonent"]);
const PART_OF_SPEECH_NORMALIZATION = {
  "adj.": "adjective",
  "n.": "noun",
  "v.": "verb",
};
const MEANING_ADDITIONS = {
  local: [
    {
      definitionKo: "현지인",
      definitionEn: "a person who lives in a particular area",
      partOfSpeech: "noun",
      pronunciation: "/ˈloʊkəl/",
      examples: [
        {
          en: "A local showed us the fastest route to the museum.",
          ko: "한 현지인이 박물관으로 가는 가장 빠른 길을 알려 주었다.",
          type: "sentence",
        },
      ],
    },
  ],
};
const KOREAN_EXAMPLE_TRANSLATIONS = {
  "Jackson Pollock’s paintings are characterized by fascinating combinations of colors and shapes.":
    "잭슨 폴록의 그림은 색과 형태의 매혹적인 조합이 특징이다.",
  "There was much speculation in the office as to who the new employee would be.":
    "새 직원이 누가 될지에 대해 사무실에서 많은 추측이 오갔다.",
  "Erosion rates are highest in places with unconsolidated soil.":
    "고결되지 않은 토양이 있는 곳에서 침식 속도가 가장 높다.",
  "The writer’s speech was so outstanding that years later people still quote from it.":
    "그 작가의 연설은 매우 뛰어나서 수년이 지난 뒤에도 사람들이 여전히 인용한다.",
  "Susan has quite a few outstanding debts this month.":
    "수전은 이번 달에 미지불 채무가 꽤 많다.",
  "Jerusalem is a city that is known for its constellation of cultures.":
    "예루살렘은 다양한 문화가 어우러진 것으로 알려진 도시다.",
  "The doctor said that scratching an insect bite would only compound the itchiness.":
    "의사는 벌레 물린 곳을 긁으면 가려움만 더 심해질 것이라고 말했다.",
  "A compound of copper and zinc is called brass.":
    "구리와 아연의 혼합물은 황동이라고 불린다.",
};

const legacy = JSON.parse(await readFile(inputPath, "utf8"));
if (legacy.version !== 9 || !Array.isArray(legacy.cards)) {
  throw new Error("Expected a version 9 Wordseed export.");
}

const normalize = (value = "") =>
  value.normalize("NFKC").trim().toLocaleLowerCase();

const searchTokens = (...values) =>
  Array.from(
    new Set(
      values
        .flatMap((value) => value?.split(/[\s,;/·]+/) ?? [])
        .map(normalize)
        .filter(Boolean),
    ),
  );

const cleanExample = (example) => ({
  en: example.en.trim(),
  ...(example.ko?.trim() || KOREAN_EXAMPLE_TRANSLATIONS[example.en.trim()]
    ? {
        ko:
          example.ko?.trim() ||
          KOREAN_EXAMPLE_TRANSLATIONS[example.en.trim()],
      }
    : {}),
  type: example.type === "dialogue" ? "dialogue" : "sentence",
});

const cards = [];
const meanings = [];
const testMeaningByCard = new Map();
const BATCH_SIZE = 25;

for (let batchStart = 0; batchStart < legacy.cards.length; batchStart += BATCH_SIZE) {
  const batch = legacy.cards.slice(batchStart, batchStart + BATCH_SIZE);
  for (const legacyCard of batch) {
    const sourceMeanings = [
      ...legacyCard.meanings,
      ...(MEANING_ADDITIONS[legacyCard.normalizedTerm] ?? []),
    ];
    cards.push({
      id: legacyCard.id,
      term: legacyCard.term.trim(),
      normalizedTerm: normalize(legacyCard.normalizedTerm || legacyCard.term),
      tags: Array.from(new Set(legacyCard.tags ?? [])),
      createdAt: legacyCard.createdAt,
      updatedAt: legacyCard.updatedAt,
    });

    const assignments =
      sourceMeanings.length === 1
        ? legacyCard.testExamples.map(() => 0)
        : MULTI_MEANING_TEST_TARGETS[legacyCard.normalizedTerm];
    if (!assignments || assignments.length !== legacyCard.testExamples.length) {
      throw new Error(`Missing reviewed test mapping for ${legacyCard.term}.`);
    }
    testMeaningByCard.set(legacyCard.id, assignments);

    sourceMeanings.forEach((legacyMeaning, position) => {
      const meaningId = `${legacyCard.id}-meaning-${position + 1}`;
      meanings.push({
        id: meaningId,
        cardId: legacyCard.id,
        position,
        definitionKo: legacyMeaning.definitionKo.trim(),
        ...(legacyMeaning.definitionEn?.trim()
          ? { definitionEn: legacyMeaning.definitionEn.trim() }
          : {}),
        searchTokens: searchTokens(
          legacyMeaning.definitionKo,
          legacyMeaning.definitionEn,
          ...(legacyMeaning.synonyms ?? []),
          ...(legacyMeaning.antonyms ?? []),
        ),
        ...((legacyMeaning.partOfSpeech || legacyCard.partOfSpeech)?.trim()
          ? {
              partOfSpeech:
                PART_OF_SPEECH_NORMALIZATION[
                  (legacyMeaning.partOfSpeech || legacyCard.partOfSpeech).trim()
                ] ??
                (legacyMeaning.partOfSpeech || legacyCard.partOfSpeech).trim(),
            }
          : {}),
        ...((legacyMeaning.pronunciation || legacyCard.pronunciation)?.trim()
          ? {
              pronunciation: (
                legacyMeaning.pronunciation || legacyCard.pronunciation
              ).trim(),
            }
          : {}),
        acceptedVariants: Array.from(
          new Set(
            [legacyCard.term, ...(legacyCard.acceptedVariants ?? [])]
              .map(normalize)
              .filter(
                (variant) =>
                  Boolean(variant) && !INVALID_ACCEPTED_VARIANTS.has(variant),
              ),
          ),
        ),
        synonyms: Array.from(
          new Set((legacyMeaning.synonyms ?? []).map((value) => value.trim()).filter(Boolean)),
        ),
        antonyms: Array.from(
          new Set((legacyMeaning.antonyms ?? []).map((value) => value.trim()).filter(Boolean)),
        ),
        examples: (legacyMeaning.examples ?? [])
          .filter((example) => example.en?.trim())
          .map(cleanExample),
        testExamples: legacyCard.testExamples
          .filter((_, testIndex) => assignments[testIndex] === position)
          .map((example) => ({
            ...cleanExample(example),
            answer: example.answer.trim(),
          })),
        status: legacyCard.status,
      });
    });
  }

  const migratedCardIds = new Set(batch.map((card) => card.id));
  const batchMeanings = meanings.filter((meaning) =>
    migratedCardIds.has(meaning.cardId),
  );
  if (
    batchMeanings.length !==
    batch.reduce(
      (total, card) =>
        total +
        card.meanings.length +
        (MEANING_ADDITIONS[card.normalizedTerm]?.length ?? 0),
      0,
    )
  ) {
    throw new Error(`Meaning count mismatch in batch ${batchStart / BATCH_SIZE + 1}.`);
  }
  console.log(
    `Migrated batch ${batchStart / BATCH_SIZE + 1}: cards ${batchStart + 1}-${batchStart + batch.length}`,
  );
}

const meaningsByCard = new Map();
for (const meaning of meanings) {
  const group = meaningsByCard.get(meaning.cardId) ?? [];
  group.push(meaning);
  meaningsByCard.set(meaning.cardId, group);
}

const words = (value = "") =>
  new Set(
    normalize(value)
      .replace(/[_\W]+/gu, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2),
  );

const overlap = (left, right) => {
  const leftWords = words(left);
  const rightWords = words(right);
  return [...leftWords].filter((word) => rightWords.has(word)).length;
};

const reviewEvents = (legacy.reviewEvents ?? []).map((event) => {
  const cardMeanings = meaningsByCard.get(event.cardId);
  if (!cardMeanings?.length) {
    throw new Error(`Review event ${event.id} references a missing card.`);
  }
  let meaningIndex = 0;
  if (event.mode === "test" && event.prompt) {
    const legacyCard = legacy.cards.find((card) => card.id === event.cardId);
    const assignments = testMeaningByCard.get(event.cardId);
    let bestScore = -1;
    legacyCard.testExamples.forEach((example, testIndex) => {
      const score = overlap(event.prompt, example.en);
      if (score > bestScore) {
        bestScore = score;
        meaningIndex = assignments[testIndex];
      }
    });
  }
  return {
    ...event,
    meaningId: cardMeanings[meaningIndex]?.id ?? cardMeanings[0].id,
  };
});

const result = {
  version: 1,
  exportedAt: new Date().toISOString(),
  cards,
  meanings,
  reviewEvents,
};

const cardIds = new Set(cards.map((card) => card.id));
const meaningIds = new Set(meanings.map((meaning) => meaning.id));
if (cardIds.size !== cards.length || meaningIds.size !== meanings.length) {
  throw new Error("Migration produced duplicate IDs.");
}
if (
  meanings.some((meaning) => !cardIds.has(meaning.cardId)) ||
  reviewEvents.some(
    (event) =>
      !cardIds.has(event.cardId) || !meaningIds.has(event.meaningId),
  )
) {
  throw new Error("Migration produced broken references.");
}

await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
console.log(
  `Wrote ${cards.length} cards, ${meanings.length} meanings, and ${reviewEvents.length} review events to ${outputPath}`,
);
