import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { validateEnvironment } from "../config/environment";
import { PrismaClient } from "../generated/prisma/client";
import { DictionaryEntryKind } from "../generated/prisma/enums";

const seedEntries = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    headword: "grind",
    normalizedHeadword: "grind",
    kind: DictionaryEntryKind.WORD,
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    headword: "grind to a halt",
    normalizedHeadword: "grind to a halt",
    kind: DictionaryEntryKind.EXPRESSION,
  },
] as const;

async function seedDatabase(): Promise<void> {
  const { DATABASE_URL: connectionString } = validateEnvironment(process.env);
  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    for (const entry of seedEntries) {
      await prisma.dictionaryEntry.upsert({
        where: { normalizedHeadword: entry.normalizedHeadword },
        create: entry,
        update: {
          headword: entry.headword,
          kind: entry.kind,
        },
      });
    }

    process.stdout.write(`Seeded ${seedEntries.length} dictionary entries.\n`);
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
