import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { validateEnvironment } from "../config/environment";
import { PrismaClient } from "../generated/prisma/client";

async function checkDatabase(): Promise<void> {
  const { DATABASE_URL: connectionString } = validateEnvironment(process.env);
  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    const [
      userCount,
      usersWithNativeLanguageCount,
      entryCount,
      expressionCount,
      senseCount,
      synsetCount,
      definitionCount,
      senseRelationCount,
      synsetRelationCount,
      narrativeCount,
      senseExampleCount,
      synsetExampleCount,
      formCount,
      entryLanguages,
      definitionLanguages,
      narrativeLanguages,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { nativeLanguageTag: { not: null } } }),
      prisma.dictionaryEntry.count(),
      prisma.dictionaryEntry.count({ where: { kind: "EXPRESSION" } }),
      prisma.dictionarySense.count(),
      prisma.dictionarySynset.count(),
      prisma.dictionarySynsetDefinition.count(),
      prisma.dictionarySenseRelation.count(),
      prisma.dictionarySynsetRelation.count(),
      prisma.dictionarySenseNarrative.count(),
      prisma.dictionarySenseExample.count(),
      prisma.dictionarySynsetExample.count(),
      prisma.dictionaryForm.count(),
      prisma.dictionaryEntry.findMany({
        distinct: ["languageTag"],
        select: { languageTag: true },
      }),
      prisma.dictionarySynsetDefinition.findMany({
        distinct: ["languageTag"],
        select: { languageTag: true },
      }),
      prisma.dictionarySenseNarrative.findMany({
        distinct: ["languageTag"],
        select: { languageTag: true },
      }),
    ]);

    process.stdout.write(
      [
        "Database connected.",
        `Users: ${userCount} (${usersWithNativeLanguageCount} with a native language).`,
        `Dictionary entries: ${entryCount} (${expressionCount} expressions).`,
        `Entry languages: ${entryLanguages
          .map(({ languageTag }) => languageTag)
          .sort()
          .join(", ")}.`,
        `Senses: ${senseCount}.`,
        `Synsets: ${synsetCount} with ${definitionCount} localized definitions.`,
        `Definition languages: ${definitionLanguages
          .map(({ languageTag }) => languageTag)
          .sort()
          .join(", ")}.`,
        `Sense narratives: ${narrativeCount}.`,
        `Narrative languages: ${narrativeLanguages
          .map(({ languageTag }) => languageTag)
          .sort()
          .join(", ")}.`,
        `Sense examples: ${senseExampleCount}.`,
        `Synset examples: ${synsetExampleCount}.`,
        `Sense forms: ${formCount}.`,
        `Sense relations: ${senseRelationCount}.`,
        `Synset relations: ${synsetRelationCount}.`,
        "",
      ].join("\n"),
    );
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase().catch((error: unknown) => {
  const message =
    error instanceof Error ? (error.stack ?? error.message) : String(error);

  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
