import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { validateEnvironment } from "../config/environment";
import { PrismaClient } from "../generated/prisma/client";

async function checkDatabase(): Promise<void> {
  const { DATABASE_URL: connectionString } = validateEnvironment(process.env);
  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    const entryCount = await prisma.dictionaryEntry.count();

    process.stdout.write(
      `Database connected. Dictionary entries: ${entryCount}.\n`,
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
