import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { validateEnvironment } from "../config/environment";
import { PrismaClient } from "../generated/prisma/client";

async function checkDatabase(): Promise<void> {
  const { DATABASE_URL: connectionString } = validateEnvironment(process.env);
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  try {
    const [users, languages, categories, lexemes, lemmas, forms, representations, features, pronunciations, senses, glosses, synsets, examples, usages, senseRelations, synsetRelations] = await Promise.all([
      prisma.user.count(), prisma.dictionaryLanguage.count(), prisma.dictionaryLexicalCategory.count(),
      prisma.dictionaryLexeme.count(), prisma.dictionaryLemma.count(), prisma.dictionaryForm.count(),
      prisma.dictionaryFormRepresentation.count(), prisma.dictionaryGrammaticalFeature.count(),
      prisma.dictionaryPronunciation.count(), prisma.dictionarySense.count(), prisma.dictionarySenseGloss.count(),
      prisma.dictionarySynset.count(), prisma.dictionaryExample.count(), prisma.dictionarySenseUsage.count(),
      prisma.dictionarySenseRelation.count(), prisma.dictionarySynsetRelation.count(),
    ]);
    process.stdout.write([
      "Database connected.", `Users: ${users}.`, `Languages: ${languages}; lexical categories: ${categories}.`,
      `Lexemes: ${lexemes}; lemmas: ${lemmas}; senses: ${senses}; glosses: ${glosses}.`,
      `Forms: ${forms}; representations: ${representations}; features: ${features}; pronunciations: ${pronunciations}.`,
      `Synsets: ${synsets}; examples: ${examples}; usages: ${usages}.`,
      `Sense relations: ${senseRelations}; synset relations: ${synsetRelations}.\n`,
    ].join("\n"));
  } finally { await prisma.$disconnect(); }
}
checkDatabase().catch((error: unknown) => { process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`); process.exitCode = 1; });
