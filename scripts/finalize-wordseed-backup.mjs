/* global console, process */

import { readFile, writeFile } from "node:fs/promises";

const [inputPath] = process.argv.slice(2);
if (!inputPath) throw new Error("Usage: node scripts/finalize-wordseed-backup.mjs <backup.json>");
const data = JSON.parse(await readFile(inputPath, "utf8"));
const cards = new Map(data.cards.map((card) => [card.id, card]));
const meaning = (term, definition) => data.meanings.find((item) => cards.get(item.cardId)?.term === term && item.definitionKo.includes(definition));
const test = (en, ko, answer, type = "sentence") => ({ en, ko, answer, type });

const additions = [
  ["balance", "균형", test("The gymnast regained her balance after landing.", "체조 선수는 착지한 뒤 균형을 되찾았다.", "balance")],
  ["balance", "저울", test("The jeweler weighed the stone on a precision balance.", "보석상은 정밀 저울로 보석의 무게를 쟀다.", "balance")],
  ["judge", "재판", test("The tribunal will judge the dispute under international law.", "그 재판소는 국제법에 따라 분쟁을 재판할 것이다.", "judge")],
  ["cue", "신호를", test("The stage manager cued the actor to enter.", "무대 감독은 배우에게 등장하라는 신호를 보냈다.", "cued")],
  ["magnify", "과장", test("The headline magnified a minor disagreement into a major crisis.", "그 제목은 사소한 의견 충돌을 큰 위기로 과장했다.", "magnified")],
  ["affirm", "지지", test("The appeals court affirmed the original ruling.", "항소 법원은 원심 판결을 유지했다.", "affirmed")],
  ["count", "계산에", test("Remember to count maintenance costs in the annual budget.", "연간 예산에 유지비를 포함하는 것을 잊지 마세요.", "count")],
  ["count", "중요", test("Your vote counts in a close election.", "접전인 선거에서는 당신의 한 표가 중요하다.", "counts")],
  ["article", "물품", test("Every article in the shipment was inspected for damage.", "배송품의 각 물품은 파손 여부를 검사받았다.", "article")],
  ["engage", "약혼", test("They got engaged during a trip to Jeju.", "그들은 제주 여행 중 약혼했다.", "got engaged")],
  ["local", "현지", test("We asked a local guide to show us the old market.", "우리는 현지 안내원에게 오래된 시장을 보여 달라고 부탁했다.", "local")],
  ["figure", "모습", test("A lone figure appeared at the end of the road.", "길 끝에 외로운 사람의 형체가 나타났다.", "figure")],
  ["figure", "도형", test("Calculate the area of the shaded figure.", "색칠된 도형의 넓이를 계산하세요.", "figure")],
  ["subdivision", "부분", test("The subdivision of the project into smaller tasks improved efficiency.", "프로젝트를 더 작은 작업으로 나누자 효율이 높아졌다.", "subdivision")],
  ["alert", "경계", test("The airport remained on high alert after the security threat.", "공항은 보안 위협 이후 높은 경계 태세를 유지했다.", "high alert")],
  ["sentence", "선고", test("The defendant received a ten-year sentence.", "피고인은 10년 형을 선고받았다.", "sentence")],
  ["bill", "법안", test("Lawmakers debated the bill late into the night.", "의원들은 밤늦게까지 그 법안을 토론했다.", "bill")],
  ["bill", "부리", test("The duck used its broad bill to search for food.", "오리는 넓은 부리로 먹이를 찾았다.", "bill")],
  ["tear", "구멍", test("A small tear appeared along the seam of the bag.", "가방 솔기를 따라 작은 찢어진 틈이 생겼다.", "tear")],
  ["credit", "계좌", test("A credit of fifty dollars appeared on my statement.", "내 거래 명세서에 50달러 입금액이 표시되었다.", "credit")],
  ["abandon", "버리", test("The crew had to abandon the sinking ship.", "선원들은 침몰하는 배를 버리고 떠나야 했다.", "abandon")],
  ["rule", "관례", test("As a rule, the clinic calls patients the day before an appointment.", "그 병원은 대체로 예약 전날 환자에게 전화한다.", "As a rule")],
];

for (const [term, definition, example] of additions) {
  const target = meaning(term, definition);
  if (!target) throw new Error(`Missing target ${term}: ${definition}`);
  if (!target.testExamples.some((item) => item.en === example.en)) target.testExamples.push(example);
}

const engaged = meaning("engage", "약혼");
if (engaged) {
  engaged.expression = "get engaged";
  engaged.definitionKo = "약혼하다";
  engaged.definitionEn = "to agree to marry someone";
  engaged.acceptedVariants = ["get engaged", "got engaged", "become engaged", "became engaged"];
  engaged.synonyms = ["become engaged", "promise to marry"];
  engaged.antonyms = ["break off an engagement"];
}

const cueSignal = data.meanings.find((item) => cards.get(item.cardId)?.term === "cue" && item.position === 0);
const cueClue = data.meanings.find((item) => cards.get(item.cardId)?.term === "cue" && item.definitionKo === "단서");
if (cueSignal && cueClue) {
  cueSignal.definitionKo = "신호; 어떤 행동을 시작하게 하는 단서";
  cueSignal.examples.push(...cueClue.examples);
  cueSignal.testExamples.push(...cueClue.testExamples);
  cueSignal.synonyms = ["signal", "prompt", "indication"];
  cueSignal.antonyms = [];
}
const coordinateRare = data.meanings.find((item) => cards.get(item.cardId)?.term === "coordinate" && item.definitionKo === "동등한");
const removedIds = new Set([cueClue?.id, coordinateRare?.id].filter(Boolean));
data.meanings = data.meanings.filter((item) => !removedIds.has(item.id));
data.reviewEvents = data.reviewEvents.filter((event) => !removedIds.has(event.meaningId));

for (const card of data.cards) {
  data.meanings
    .filter((item) => item.cardId === card.id)
    .sort((a, b) => a.position - b.position)
    .forEach((item, position) => {
      item.position = position;
      item.searchTokens = Array.from(new Set([
        item.expression,
        item.definitionKo,
        item.definitionEn,
        ...(item.synonyms ?? []),
        ...(item.antonyms ?? []),
      ].filter(Boolean).flatMap((value) => value.split(/[\s,;/·]+/)).map((value) => value.normalize("NFKC").trim().toLocaleLowerCase()).filter(Boolean)));
    });
}
data.meanings.sort((a, b) => a.cardId.localeCompare(b.cardId) || a.position - b.position);
data.exportedAt = new Date().toISOString();

const cardIds = new Set(data.cards.map((card) => card.id));
const meaningIds = new Set(data.meanings.map((item) => item.id));
if (data.reviewEvents.some((event) => !cardIds.has(event.cardId) || !meaningIds.has(event.meaningId))) throw new Error("Broken review reference.");
if (data.meanings.some((item) => item.testExamples.length < 2)) throw new Error("A meaning still has fewer than two tests.");
if (data.meanings.some((item) => item.testExamples.some((example) => !example.en.toLocaleLowerCase().includes(example.answer.toLocaleLowerCase())))) throw new Error("Invalid answer span.");

await writeFile(inputPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
console.log(`Finalized ${data.cards.length} cards, ${data.meanings.length} meanings, and ${data.reviewEvents.length} review events.`);
