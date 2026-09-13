import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { validateEnvironment } from "../config/environment";
import { canonicalizeDictionaryHeadword } from "../dictionary/domain/dictionary-entry";
import {
  dictionarySeedEntries,
  dictionarySeedRelations,
} from "../dictionary/infrastructure/seed/dictionary-seed-data";
import { PrismaClient } from "../generated/prisma/client";

async function seedDatabase(): Promise<void> {
  const { DATABASE_URL: connectionString } = validateEnvironment(process.env);
  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$transaction(async (transaction) => {
      await transaction.user.upsert({
        where: { id: "90000000-0000-4000-8000-000000000001" },
        create: {
          id: "90000000-0000-4000-8000-000000000001",
          authSubject: "91000000-0000-4000-8000-000000000001",
          nativeLanguageTag: "ko",
          onboardingCompletedAt: new Date("2026-01-01T00:00:00.000Z"),
          timeZone: "Asia/Seoul",
        },
        update: {
          authSubject: "91000000-0000-4000-8000-000000000001",
          nativeLanguageTag: "ko",
          onboardingCompletedAt: new Date("2026-01-01T00:00:00.000Z"),
          timeZone: "Asia/Seoul",
        },
      });

      for (const entry of dictionarySeedEntries) {
        const headword = canonicalizeDictionaryHeadword(entry.headword);
        const persistedEntry = await transaction.dictionaryEntry.upsert({
          where: {
            languageTag_headword: {
              languageTag: entry.languageTag,
              headword,
            },
          },
          create: {
            id: entry.id,
            headword,
            languageTag: entry.languageTag,
            kind: entry.kind,
          },
          update: {
            kind: entry.kind,
          },
        });

        for (const sense of entry.senses) {
          const persistedSense = await transaction.dictionarySense.upsert({
            where: { id: sense.id },
            create: {
              id: sense.id,
              entryId: persistedEntry.id,
              partOfSpeech: sense.partOfSpeech,
              commonnessScore: sense.commonnessScore,
            },
            update: {
              entryId: persistedEntry.id,
              partOfSpeech: sense.partOfSpeech,
              commonnessScore: sense.commonnessScore,
            },
          });

          for (const definition of sense.definitions) {
            await transaction.dictionarySenseDefinition.upsert({
              where: {
                senseId_languageTag: {
                  senseId: persistedSense.id,
                  languageTag: definition.languageTag,
                },
              },
              create: {
                senseId: persistedSense.id,
                languageTag: definition.languageTag,
                text: definition.text,
              },
              update: { text: definition.text },
            });
          }

          for (const narrative of sense.narratives ?? []) {
            await transaction.dictionarySenseNarrative.upsert({
              where: { id: narrative.id },
              create: {
                id: narrative.id,
                senseId: persistedSense.id,
                kind: narrative.kind,
                languageTag: narrative.languageTag,
                markdown: narrative.markdown,
                generatedBy: narrative.generatedBy ?? "seed:v4",
              },
              update: {
                senseId: persistedSense.id,
                kind: narrative.kind,
                languageTag: narrative.languageTag,
                markdown: narrative.markdown,
                generatedBy: narrative.generatedBy ?? "seed:v4",
              },
            });
          }

          for (const example of sense.examples ?? []) {
            const persistedExample = await transaction.dictionaryExample.upsert({
              where: { id: example.id },
              create: {
                id: example.id,
                senseId: persistedSense.id,
                sourceLanguageTag: example.sourceLanguageTag,
                sourceText: example.sourceText,
              },
              update: {
                senseId: persistedSense.id,
                sourceLanguageTag: example.sourceLanguageTag,
                sourceText: example.sourceText,
              },
            });

            for (const translation of example.translations) {
              await transaction.dictionaryExampleTranslation.upsert({
                where: { id: translation.id },
                create: {
                  id: translation.id,
                  exampleId: persistedExample.id,
                  languageTag: translation.languageTag,
                  text: translation.text,
                  generatedBy: translation.generatedBy ?? "seed:v4",
                },
                update: {
                  exampleId: persistedExample.id,
                  languageTag: translation.languageTag,
                  text: translation.text,
                  generatedBy: translation.generatedBy ?? "seed:v4",
                },
              });
            }
          }

          for (const form of sense.forms ?? []) {
            await transaction.dictionaryForm.upsert({
              where: { id: form.id },
              create: {
                id: form.id,
                senseId: persistedSense.id,
                surface: form.surface,
                kind: form.kind,
              },
              update: {
                senseId: persistedSense.id,
                surface: form.surface,
                kind: form.kind,
              },
            });
          }
        }
      }

      for (const relation of dictionarySeedRelations) {
        await transaction.dictionarySenseRelation.upsert({
          where: {
            sourceSenseId_targetSenseId_kind: {
              sourceSenseId: relation.sourceSenseId,
              targetSenseId: relation.targetSenseId,
              kind: relation.kind,
            },
          },
          create: {
            sourceSenseId: relation.sourceSenseId,
            targetSenseId: relation.targetSenseId,
            kind: relation.kind,
          },
          update: {},
        });
      }
    });

    process.stdout.write(
      `Seeded one user, ${dictionarySeedEntries.length} dictionary entries, and ${dictionarySeedRelations.length} sense relations.\n`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase().catch((error: unknown) => {
  const message =
    error instanceof Error ? (error.stack ?? error.message) : String(error);

  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
