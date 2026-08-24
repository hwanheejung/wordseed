import "dotenv/config";
import { defineConfig } from "prisma/config";

const localDatabaseUrl =
  "postgresql://wordseed:wordseed@127.0.0.1:5432/wordseed_dev?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? localDatabaseUrl,
  },
});
