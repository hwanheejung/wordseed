import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { validateEnvironment } from "../config/environment";
import { canonicalizeDictionaryLemma } from "../dictionary/domain/dictionary-lexeme";
import { dictionarySeedLexemes, dictionarySeedSenseRelations, dictionarySeedSynsetRelations, dictionarySeedSynsets } from "../dictionary/infrastructure/seed/dictionary-seed-data";
import { PrismaClient } from "../generated/prisma/client";

const LANGUAGE_ID = "80000000-0000-4000-8000-000000000001";
const SOURCE_ID = "81000000-0000-4000-8000-000000000001";
function uuidForCategory(index: number): string { return `82000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`; }
function canonicalFormId(lexemeId: string): string { return `7${lexemeId.slice(1)}`; }

async function seedDatabase(): Promise<void> {
  const { DATABASE_URL: connectionString } = validateEnvironment(process.env);
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  try {
    await prisma.$transaction(async (transaction) => {
      await transaction.user.upsert({ where: { id: "90000000-0000-4000-8000-000000000001" }, create: { id: "90000000-0000-4000-8000-000000000001", authSubject: "91000000-0000-4000-8000-000000000001", nativeLanguageTag: "ko", onboardingCompletedAt: new Date("2026-01-01T00:00:00.000Z"), timeZone: "Asia/Seoul" }, update: {} });
      await transaction.dictionaryLanguage.upsert({ where: { code: "en" }, create: { id: LANGUAGE_ID, code: "en", name: "English", defaultScriptCode: "Latn" }, update: { name: "English", defaultScriptCode: "Latn" } });
      await transaction.dictionarySource.upsert({ where: { id: SOURCE_ID }, create: { id: SOURCE_ID, kind: "WORDSEED_EDITORIAL", name: "Wordseed dictionary seed" }, update: {} });

      const categoryIds = new Map<string, string>();
      const categoryCodes = [...new Set(dictionarySeedLexemes.map(({ lexicalCategoryCode }) => lexicalCategoryCode))];
      for (const [index, code] of categoryCodes.entries()) {
        const id = uuidForCategory(index);
        categoryIds.set(code, id);
        await transaction.dictionaryLexicalCategory.upsert({ where: { languageId_code: { languageId: LANGUAGE_ID, code } }, create: { id, languageId: LANGUAGE_ID, code, displayName: code.toLowerCase().replaceAll("_", " ") }, update: {} });
      }
      for (const synset of dictionarySeedSynsets) {
        await transaction.dictionarySynset.upsert({ where: { id: synset.id }, create: { id: synset.id }, update: {} });
        for (const definition of synset.definitions) await transaction.dictionarySynsetDefinition.upsert({ where: { synsetId_languageTag: { synsetId: synset.id, languageTag: definition.languageTag } }, create: { synsetId: synset.id, ...definition }, update: { text: definition.text } });
      }

      for (const lexeme of dictionarySeedLexemes) {
        const canonicalLemma = canonicalizeDictionaryLemma(lexeme.canonicalLemma);
        const lexicalCategoryId = categoryIds.get(lexeme.lexicalCategoryCode);
        if (!lexicalCategoryId) throw new Error(`Missing lexical category ${lexeme.lexicalCategoryCode}.`);
        await transaction.dictionaryLexeme.upsert({ where: { id: lexeme.id }, create: { id: lexeme.id, languageId: LANGUAGE_ID, lexicalCategoryId, canonicalLemma }, update: { lexicalCategoryId, canonicalLemma } });
        await transaction.dictionaryLemma.upsert({ where: { lexemeId_languageTag_value: { lexemeId: lexeme.id, languageTag: lexeme.languageTag, value: canonicalLemma } }, create: { lexemeId: lexeme.id, languageTag: lexeme.languageTag, value: canonicalLemma, isPrimary: true }, update: { isPrimary: true } });
        const baseFormId = canonicalFormId(lexeme.id);
        await transaction.dictionaryForm.upsert({ where: { id: baseFormId }, create: { id: baseFormId, lexemeId: lexeme.id }, update: { lexemeId: lexeme.id } });
        await transaction.dictionaryFormRepresentation.upsert({ where: { formId_languageTag_value: { formId: baseFormId, languageTag: lexeme.languageTag, value: canonicalLemma } }, create: { formId: baseFormId, languageTag: lexeme.languageTag, value: canonicalLemma }, update: {} });
        if (canonicalLemma === "converse") {
          const spokenAsVerb = lexeme.lexicalCategoryCode === "VERB";
          const pronunciation = { id: `83${lexeme.id.slice(2)}`, ipa: spokenAsVerb ? "/kənˈvɜːrs/" : "/ˈkɒnvɜːs/", dialectTag: "en-US" };
          await transaction.dictionaryPronunciation.upsert({ where: { id: pronunciation.id }, create: { ...pronunciation, formId: baseFormId, sourceId: SOURCE_ID }, update: { ...pronunciation, formId: baseFormId } });
        }
        for (const form of lexeme.forms ?? []) {
          await transaction.dictionaryForm.upsert({ where: { id: form.id }, create: { id: form.id, lexemeId: lexeme.id }, update: { lexemeId: lexeme.id } });
          await transaction.dictionaryFormRepresentation.upsert({ where: { formId_languageTag_value: { formId: form.id, languageTag: lexeme.languageTag, value: form.surface } }, create: { formId: form.id, languageTag: lexeme.languageTag, value: form.surface }, update: {} });
          const feature = await transaction.dictionaryGrammaticalFeature.upsert({ where: { key: form.featureKey }, create: { key: form.featureKey, label: form.featureKey.slice(5).toLowerCase().replaceAll("_", " ") }, update: {} });
          await transaction.dictionaryFormFeature.upsert({ where: { formId_featureId: { formId: form.id, featureId: feature.id } }, create: { formId: form.id, featureId: feature.id }, update: {} });
        }
        for (const [order, sense] of lexeme.senses.entries()) {
          await transaction.dictionarySense.upsert({ where: { id: sense.id }, create: { id: sense.id, lexemeId: lexeme.id, synsetId: sense.synsetId, order: order + 1 }, update: { lexemeId: lexeme.id, synsetId: sense.synsetId, order: order + 1 } });
          const synset = dictionarySeedSynsets.find(({ id }) => id === sense.synsetId);
          if (!synset) throw new Error(`Missing synset ${sense.synsetId}.`);
          for (const definition of synset.definitions) await transaction.dictionarySenseGloss.upsert({ where: { senseId_languageTag: { senseId: sense.id, languageTag: definition.languageTag } }, create: { senseId: sense.id, ...definition }, update: { text: definition.text } });
          await transaction.dictionarySenseUsage.upsert({ where: { id: `84${sense.id.slice(2)}` }, create: { id: `84${sense.id.slice(2)}`, senseId: sense.id, score: sense.usageScore, corpus: "wordseed-seed", sourceId: SOURCE_ID }, update: { score: sense.usageScore } });
          for (const narrative of sense.narratives ?? []) await transaction.dictionarySenseNarrative.upsert({ where: { id: narrative.id }, create: { id: narrative.id, senseId: sense.id, kind: narrative.kind, languageTag: narrative.languageTag, markdown: narrative.markdown, generatedBy: narrative.generatedBy, promptVersion: narrative.promptVersion, sourceId: SOURCE_ID }, update: { markdown: narrative.markdown } });
          for (const example of sense.examples ?? []) {
            await transaction.dictionaryExample.upsert({ where: { id: example.id }, create: { id: example.id, senseId: sense.id, languageTag: example.sourceLanguageTag, text: example.sourceText, sourceId: SOURCE_ID }, update: { senseId: sense.id, text: example.sourceText } });
            for (const translation of example.translations) await transaction.dictionaryExampleTranslation.upsert({ where: { id: translation.id }, create: { ...translation, exampleId: example.id, sourceId: SOURCE_ID }, update: { text: translation.text } });
          }
        }
      }
      for (const relation of dictionarySeedSenseRelations) await transaction.dictionarySenseRelation.upsert({ where: { sourceSenseId_targetSenseId_kind: relation }, create: { ...relation, sourceId: SOURCE_ID }, update: {} });
      for (const relation of dictionarySeedSynsetRelations) await transaction.dictionarySynsetRelation.upsert({ where: { sourceSynsetId_targetSynsetId_kind: relation }, create: { ...relation, sourceId: SOURCE_ID }, update: {} });
    });
    process.stdout.write(`Seeded ${dictionarySeedLexemes.length} dictionary lexemes.\n`);
  } finally { await prisma.$disconnect(); }
}
seedDatabase().catch((error: unknown) => { process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`); process.exitCode = 1; });
