/* global console, process */

import { readFile, writeFile } from "node:fs/promises";

const [inputPath] = process.argv.slice(2);
if (!inputPath) throw new Error("Usage: node scripts/curate-wordseed-backup.mjs <backup.json>");

const data = JSON.parse(await readFile(inputPath, "utf8"));
if (data.version !== 1 || !Array.isArray(data.cards) || !Array.isArray(data.meanings)) {
  throw new Error("Expected a Wordseed v2 backup.");
}

const normalize = (value = "") => value.normalize("NFKC").trim().toLocaleLowerCase();
const unique = (values = []) => Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
const searchTokens = (...values) => unique(values.flatMap((value) => value?.split(/[\s,;/·]+/) ?? []).map(normalize));
const cardById = new Map(data.cards.map((card) => [card.id, card]));
const termFor = (meaning) => cardById.get(meaning.cardId)?.term;
const statusPriority = { unknown: 0, confusing: 1, correct: 2 };

for (const meaning of data.meanings) {
  meaning.synonyms = unique(meaning.synonyms);
  meaning.antonyms = unique(meaning.antonyms);
}

const findOriginal = (term, position) =>
  data.meanings.find((meaning) => termFor(meaning) === term && meaning.position === position);

const patchMeaning = (term, position, patch) => {
  const meaning = findOriginal(term, position);
  if (!meaning) throw new Error(`Missing meaning ${term}:${position}`);
  Object.assign(meaning, patch);
};

patchMeaning("coordinate", 1, {
  expression: "coordinate with",
  definitionKo: "~와 조화를 이루다; ~에 맞추다",
  definitionEn: "to match or harmonize with something",
  synonyms: ["harmonize with", "match"],
  antonyms: ["clash with"],
});
patchMeaning("worthwhile", 0, {
  definitionKo: "시간이나 노력을 들일 가치가 있는; 보람 있는",
  definitionEn: "worth the time, effort, or money spent",
  synonyms: ["valuable", "rewarding"],
  antonyms: ["worthless", "pointless"],
});
patchMeaning("count", 1, {
  expression: "count ... in",
  definitionKo: "계산에 넣다; 포함하다",
  definitionEn: "to include something in a calculation or total",
  examples: [{
    en: "Be sure to count the delivery fee in the final price.",
    ko: "최종 가격을 계산할 때 배송비를 반드시 포함하세요.",
    type: "sentence",
  }],
  synonyms: ["include", "factor in"],
  antonyms: ["exclude", "leave out"],
});
patchMeaning("companion", 2, {
  expression: "companion guide",
  definitionKo: "본 자료를 보충하는 안내서",
  definitionEn: "a guide designed to accompany and supplement another work",
  examples: [{
    en: "The museum published a companion guide to the exhibition.",
    ko: "박물관은 그 전시를 위한 보충 안내서를 출간했다.",
    type: "sentence",
  }],
  testExamples: [{
    en: "This companion guide explains the technical terms used in the documentary.",
    ko: "이 보충 안내서는 다큐멘터리에 사용된 전문 용어를 설명한다.",
    type: "sentence",
    answer: "companion guide",
  }],
  synonyms: ["supplementary guide", "handbook"],
  antonyms: [],
});
patchMeaning("credit", 2, {
  definitionKo: "계좌에 더해진 금액; 대변 항목",
  definitionEn: "an amount added to a bank account or recorded on the credit side",
  examples: [{
    en: "The bank posted a credit to my account.",
    ko: "은행이 내 계좌에 입금액을 반영했다.",
    type: "sentence",
  }],
  synonyms: ["deposit", "account credit"],
  antonyms: ["debit", "withdrawal"],
});
patchMeaning("be slated to", 0, {
  examples: [{
    en: "The new office is slated to open next spring.",
    ko: "새 사무실은 내년 봄에 문을 열 예정이다.",
    type: "sentence",
  }],
});
patchMeaning("comprehensive", 0, {
  definitionKo: "포괄적인; 종합적인",
  synonyms: ["thorough", "extensive", "all-inclusive"],
  antonyms: ["limited", "incomplete"],
});
patchMeaning("exploit", 0, {
  definitionKo: "자원이나 기회를 활용하다; 부당하게 이용하다",
  definitionEn: "to make use of a resource or opportunity, sometimes unfairly",
  synonyms: ["utilize", "take advantage of"],
  antonyms: [],
});

const relationOverrides = {
  erroneous: [["wrong", "incorrect", "mistaken"], ["correct", "accurate"]],
  flawless: [["perfect", "impeccable"], ["flawed", "imperfect"]],
  viable: [["workable", "feasible"], ["unworkable", "impractical"]],
  prudent: [["wise", "sensible", "cautious"], ["imprudent", "reckless"]],
  credible: [["believable", "plausible"], ["implausible", "unreliable"]],
  incompatible: [["conflicting", "inconsistent"], ["compatible", "consistent"]],
  diverse: [["varied", "heterogeneous"], ["uniform", "homogeneous"]],
  arid: [["dry", "parched"], ["humid", "fertile"]],
  harsh: [["severe", "rough"], ["mild", "gentle"]],
  remote: [["distant", "isolated"], ["nearby", "accessible"]],
  turbulent: [["unstable", "stormy"], ["calm", "stable"]],
  optimistic: [["hopeful", "positive"], ["pessimistic", "gloomy"]],
  valueless: [["worthless", "useless"], ["valuable", "useful"]],
  valuable: [["useful", "precious"], ["worthless", "valueless"]],
  intermittent: [["sporadic", "occasional"], ["continuous", "constant"]],
  intermittently: [["sporadically", "occasionally"], ["continuously", "constantly"]],
  predominant: [["dominant", "principal"], ["minor", "subordinate"]],
  gradual: [["progressive", "incremental"], ["sudden", "abrupt"]],
  common: [["usual", "widespread"], ["rare", "uncommon"]],
  independent: [["autonomous", "self-reliant"], ["dependent", "reliant"]],
};
for (const meaning of data.meanings) {
  const override = relationOverrides[normalize(meaning.expression)];
  if (override) [meaning.synonyms, meaning.antonyms] = override;
}

const mergePlans = {
  worthwhile: [[1, 0]],
  utilize: [[1, 0]],
  category: [[1, 0], [2, 0]],
  ordinary: [[1, 0]],
  analyze: [[1, 0]],
  cognitive: [[1, 0]],
  comparable: [[1, 0]],
  obligation: [[1, 0]],
  imaginary: [[1, 0]],
  agency: [[1, 0], [2, 0]],
  measure: [[2, 1]],
  blend: [[2, 1]],
  principle: [[2, 1]],
  perspective: [[0, 2], [1, 2], [3, 2]],
  companion: [[1, 0], [3, 2]],
};
const redirectedMeaningIds = new Map();
const dedupeObjects = (values) => {
  const seen = new Set();
  return values.filter((value) => {
    const key = JSON.stringify(value);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
for (const [term, plans] of Object.entries(mergePlans)) {
  for (const [fromPosition, toPosition] of plans) {
    const from = findOriginal(term, fromPosition);
    const to = findOriginal(term, toPosition);
    if (!from || !to) throw new Error(`Missing merge target ${term}:${fromPosition}->${toPosition}`);
    to.examples = dedupeObjects([...to.examples, ...from.examples]);
    to.testExamples = dedupeObjects([...to.testExamples, ...from.testExamples]);
    to.acceptedVariants = unique([...to.acceptedVariants, ...from.acceptedVariants]);
    to.synonyms = unique([...to.synonyms, ...from.synonyms]);
    to.antonyms = unique([...to.antonyms, ...from.antonyms]);
    if (statusPriority[from.status] < statusPriority[to.status]) to.status = from.status;
    redirectedMeaningIds.set(from.id, to.id);
  }
}

const droppedMeaningIds = new Set();
for (const [term, position] of [["article", 3], ["apology", 1]]) {
  const meaning = findOriginal(term, position);
  if (meaning) droppedMeaningIds.add(meaning.id);
}

const sense = (definitionKo, definitionEn, partOfSpeech, exampleEn, exampleKo, testEn, testKo, answer, synonyms = [], antonyms = [], expression) => ({
  expression,
  definitionKo,
  definitionEn,
  partOfSpeech,
  examples: [{ en: exampleEn, ko: exampleKo, type: "sentence" }],
  testExamples: [{ en: testEn, ko: testKo, type: "sentence", answer }],
  synonyms,
  antonyms,
});

const splitCards = {
  variable: [
    sense("변하기 쉬운", "likely to change", "adjective", "Demand is highly variable during the winter.", "겨울에는 수요의 변동이 매우 크다.", "The weather is variable in the mountains.", "산에서는 날씨가 자주 변한다.", "variable", ["changeable", "fluctuating"], ["constant", "stable"]),
    sense("변수", "a quantity or factor that can change", "noun", "Temperature was the only variable in the experiment.", "온도는 그 실험에서 유일한 변수였다.", "Researchers controlled every variable except age.", "연구진은 나이를 제외한 모든 변수를 통제했다.", "variable", ["factor", "parameter"], ["constant"]),
  ],
  quote: [
    sense("인용하다", "to repeat someone else's exact words", "verb", "The article quotes a famous scientist.", "그 기사는 유명한 과학자의 말을 인용한다.", "Please quote the source accurately.", "출처를 정확히 인용해 주세요.", "quote", ["cite"], []),
    sense("인용구", "words repeated from another source", "noun", "She opened the speech with a memorable quote.", "그녀는 기억에 남는 인용구로 연설을 시작했다.", "That quote comes from a nineteenth-century novel.", "그 인용구는 19세기 소설에서 나온 것이다.", "quote", ["quotation", "citation"], []),
  ],
  current: [
    sense("현재의", "happening or existing now", "adjective", "Please check the current price.", "현재 가격을 확인해 주세요.", "The current policy expires next month.", "현행 정책은 다음 달에 만료된다.", "current", ["present", "existing"], ["former", "past"]),
    sense("흐름; 해류; 전류", "a continuous flow of water, air, or electricity", "noun", "A strong current carried the boat downstream.", "강한 물살이 배를 하류로 떠밀었다.", "The swimmer was pulled away by the current.", "수영하던 사람은 물살에 떠밀려 갔다.", "current", ["flow", "stream"], []),
  ],
  permit: [
    sense("허락하다", "to allow something", "verb", "The city permitted the restaurant to open late.", "시는 그 식당의 심야 영업을 허가했다.", "The rules do not permit outside food.", "규정상 외부 음식은 허용되지 않는다.", "permit", ["allow", "authorize"], ["forbid", "prohibit"]),
    sense("허가증", "an official document giving permission", "noun", "You need a permit to park here overnight.", "이곳에 밤새 주차하려면 허가증이 필요하다.", "The builder applied for a construction permit.", "건축업자는 건축 허가증을 신청했다.", "permit", ["license", "authorization"], []),
  ],
  trigger: [
    sense("유발하다", "to cause an event or reaction", "verb", "The announcement triggered a wave of protests.", "그 발표는 항의 물결을 촉발했다.", "Dust can trigger an allergic reaction.", "먼지는 알레르기 반응을 유발할 수 있다.", "trigger", ["cause", "provoke", "set off"], ["prevent", "suppress"]),
    sense("방아쇠; 작동 장치", "a device that starts a mechanism", "noun", "He kept his finger away from the trigger.", "그는 손가락을 방아쇠에서 뗀 채로 두었다.", "Pulling the trigger activates the alarm.", "방아쇠를 당기면 경보가 작동한다.", "trigger", ["switch", "activator"], []),
  ],
  term: [
    sense("기간; 임기; 학기", "a fixed period of time", "noun", "The course lasts one term.", "그 과정은 한 학기 동안 진행된다.", "Her term as chair ends in December.", "그녀의 의장 임기는 12월에 끝난다.", "term", ["period", "tenure"], []),
    sense("용어", "a word or phrase used for a specific concept", "noun", "The medical term was unfamiliar to me.", "그 의학 용어는 내게 생소했다.", "The report defines each technical term.", "그 보고서는 각 전문 용어를 정의한다.", "term", ["word", "expression"], []),
    sense("조건", "a condition in an agreement", "noun", "They accepted the terms of the contract.", "그들은 계약 조건을 받아들였다.", "Payment within thirty days is a standard term of the agreement.", "30일 이내 지급은 그 계약의 표준 조건이다.", "term", ["condition", "provision"], []),
  ],
  board: [
    sense("이사회; 위원회", "a group that manages or advises an organization", "noun", "The board approved the new plan.", "이사회는 새 계획을 승인했다.", "The board meets once a month.", "이사회는 한 달에 한 번 회의를 연다.", "board", ["committee", "panel"], []),
    sense("판자", "a long, flat piece of wood or another material", "noun", "He replaced the broken floorboard with a new board.", "그는 부서진 마룻판을 새 판자로 교체했다.", "Lay the board across the two supports.", "두 받침대 위에 판자를 걸쳐 놓으세요.", "board", ["plank", "panel"], []),
    sense("게시판", "a surface used for displaying notices", "noun", "The schedule is posted on the bulletin board.", "일정은 게시판에 붙어 있다.", "She pinned the announcement to the board.", "그녀는 공지를 게시판에 고정했다.", "board", ["noticeboard", "bulletin board"], []),
    sense("탑승하다", "to get onto a bus, train, ship, or aircraft", "verb", "Passengers began to board the plane.", "승객들이 비행기에 탑승하기 시작했다.", "We boarded the train just before departure.", "우리는 출발 직전에 기차에 탔다.", "boarded", ["embark", "get on"], ["disembark", "get off"], "board"),
  ],
  character: [
    sense("성격; 인품", "the qualities that shape a person's nature", "noun", "Her calm character made her a good leader.", "그녀의 침착한 성격은 그녀를 좋은 지도자로 만들었다.", "The interview revealed his generous character.", "그 면접은 그의 관대한 성품을 보여 주었다.", "character", ["personality", "nature"], []),
    sense("특성; 특징", "a distinctive quality of something", "noun", "The neighborhood has retained its historic character.", "그 동네는 역사적인 특색을 유지하고 있다.", "Wood gives the room a warm character.", "목재는 그 방에 따뜻한 분위기를 더한다.", "character", ["quality", "nature"], []),
    sense("등장인물", "a person in a story, film, or play", "noun", "The main character struggles to protect her family.", "주인공은 가족을 지키기 위해 애쓴다.", "My favorite character appears in the final chapter.", "내가 가장 좋아하는 등장인물은 마지막 장에 나온다.", "character", ["figure", "persona"], []),
    sense("문자; 기호", "a written, printed, or encoded symbol", "noun", "The password must contain at least eight characters.", "비밀번호에는 최소 여덟 개의 문자가 포함되어야 한다.", "Enter the verification code as six characters.", "인증 코드를 여섯 문자로 입력하세요.", "characters", ["symbol", "letter"], []),
  ],
  fair: [
    sense("공정한", "treating people equally and reasonably", "adjective", "The judge made a fair decision.", "판사는 공정한 결정을 내렸다.", "Both teams agreed that the result was fair.", "두 팀 모두 결과가 공정했다고 인정했다.", "fair", ["just", "impartial"], ["unfair", "biased"]),
    sense("상당한", "fairly large in amount or degree", "adjective", "The repairs will take a fair amount of time.", "수리에는 상당한 시간이 걸릴 것이다.", "We walked a fair distance before finding a taxi.", "우리는 택시를 찾기 전까지 꽤 먼 거리를 걸었다.", "fair", ["considerable", "substantial"], ["slight", "minimal"]),
    sense("연한 색의; 흰 피부의", "light in color", "adjective", "She has fair hair and blue eyes.", "그녀는 밝은 머리색과 파란 눈을 가지고 있다.", "Use sunscreen to protect fair skin.", "밝은 피부를 보호하려면 자외선 차단제를 사용하세요.", "fair", ["light", "pale"], ["dark"]),
    sense("박람회; 축제 장터", "a public event with exhibitions or entertainment", "noun", "Local farmers sold produce at the county fair.", "지역 농부들은 군 박람회에서 농산물을 팔았다.", "The science fair attracted hundreds of students.", "과학 박람회에는 수백 명의 학생이 참가했다.", "fair", ["exhibition", "festival"], []),
  ],
  order: [
    sense("명령", "an instruction that must be obeyed", "noun", "The officer gave an order to evacuate.", "장교는 대피 명령을 내렸다.", "The crew followed the captain's order.", "승무원들은 선장의 명령을 따랐다.", "order", ["command", "instruction"], ["request"]),
    sense("주문하다; 주문", "to request goods or food; a request for them", "verb / noun", "The manager ordered new supplies for the office.", "관리자는 사무실에 필요한 새 물품을 주문했다.", "I placed an order for two sandwiches.", "나는 샌드위치 두 개를 주문했다.", "order", ["request", "purchase"], ["cancel"]),
    sense("순서", "the sequence in which things are arranged", "noun", "Arrange the files in alphabetical order.", "파일을 알파벳 순서로 정리하세요.", "The names appear in order of arrival.", "이름은 도착 순서대로 표시된다.", "order", ["sequence", "arrangement"], ["disorder"]),
    sense("질서", "a controlled and organized state", "noun", "The teacher restored order in the classroom.", "교사는 교실의 질서를 회복했다.", "Security staff maintained order during the event.", "보안 요원들은 행사 중 질서를 유지했다.", "order", ["organization", "stability"], ["chaos", "disorder"]),
  ],
};

for (const [term, specs] of Object.entries(splitCards)) {
  const card = data.cards.find((candidate) => candidate.term === term);
  const original = data.meanings.filter((meaning) => meaning.cardId === card?.id).sort((a, b) => a.position - b.position);
  if (!card || original.length !== 1) throw new Error(`Expected one bundled meaning for ${term}`);
  const base = original[0];
  const replacements = specs.map((spec, position) => ({
    ...base,
    ...spec,
    id: position === 0 ? base.id : `${card.id}-meaning-curated-${position + 1}`,
    cardId: card.id,
    position,
    expression: spec.expression ?? term,
    pronunciation: base.pronunciation,
    acceptedVariants: unique([spec.expression ?? term]),
    status: position === 0 ? base.status : "unknown",
  }));
  data.meanings = data.meanings.filter((meaning) => meaning.id !== base.id).concat(replacements);
}

data.meanings = data.meanings.filter(
  (meaning) => !redirectedMeaningIds.has(meaning.id) && !droppedMeaningIds.has(meaning.id),
);
data.reviewEvents = data.reviewEvents
  .filter((event) => !droppedMeaningIds.has(event.meaningId))
  .map((event) => ({ ...event, meaningId: redirectedMeaningIds.get(event.meaningId) ?? event.meaningId }));

const answerIn = (example, meaning) => {
  const candidates = unique([meaning.expression, ...meaning.acceptedVariants]).sort((a, b) => b.length - a.length);
  return candidates.find((candidate) => example.en.toLocaleLowerCase().includes(candidate.toLocaleLowerCase()));
};
const inflectedAnswers = { magnify: "magnifies", gratify: "gratified", unwind: "unwound" };
for (const meaning of data.meanings) {
  meaning.examples = dedupeObjects(meaning.examples);
  meaning.testExamples = dedupeObjects(meaning.testExamples);
  if (meaning.testExamples.length < 2) {
    const existing = new Set(meaning.testExamples.map((example) => normalize(example.en)));
    const studyExample = meaning.examples.find((example) => !existing.has(normalize(example.en)) && example.ko?.trim());
    if (studyExample) {
      const answer = answerIn(studyExample, meaning) ?? inflectedAnswers[normalize(meaning.expression)];
      if (answer && studyExample.en.toLocaleLowerCase().includes(answer.toLocaleLowerCase())) {
        meaning.testExamples.push({ ...studyExample, answer });
      }
    }
  }
}

for (const card of data.cards) {
  const meanings = data.meanings.filter((meaning) => meaning.cardId === card.id).sort((a, b) => a.position - b.position);
  meanings.forEach((meaning, position) => {
    meaning.position = position;
    meaning.synonyms = unique(meaning.synonyms);
    meaning.antonyms = unique(meaning.antonyms);
    meaning.searchTokens = searchTokens(
      meaning.expression,
      meaning.definitionKo,
      meaning.definitionEn,
      ...meaning.synonyms,
      ...meaning.antonyms,
    );
  });
}
data.meanings.sort((a, b) => a.cardId.localeCompare(b.cardId) || a.position - b.position);
data.exportedAt = new Date().toISOString();

const cardIds = new Set(data.cards.map((card) => card.id));
const meaningIds = new Set(data.meanings.map((meaning) => meaning.id));
if (cardIds.size !== data.cards.length || meaningIds.size !== data.meanings.length) throw new Error("Duplicate IDs after curation.");
if (data.meanings.some((meaning) => !cardIds.has(meaning.cardId))) throw new Error("Orphan meaning after curation.");
if (data.reviewEvents.some((event) => !cardIds.has(event.cardId) || !meaningIds.has(event.meaningId))) throw new Error("Broken review event after curation.");
if (data.meanings.some((meaning) => !Array.isArray(meaning.synonyms) || !Array.isArray(meaning.antonyms))) throw new Error("Missing relation arrays.");
if (data.meanings.some((meaning) => meaning.testExamples.some((example) => !example.answer || !example.en.toLocaleLowerCase().includes(example.answer.toLocaleLowerCase())))) throw new Error("Invalid test answer span.");

await writeFile(inputPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
console.log(`Curated ${data.cards.length} cards, ${data.meanings.length} meanings, and ${data.reviewEvents.length} review events.`);
