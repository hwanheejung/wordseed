import { readFile } from "node:fs/promises";
import process from "node:process";
import { fileURLToPath, URL } from "node:url";
import { config } from "dotenv";
import { Client } from "pg";

config({ path: fileURLToPath(new URL("../.env", import.meta.url)), quiet: true });
const databaseUrl = new URL(process.env.DATABASE_URL ?? "");
if (process.env.NODE_ENV === "production" || !["127.0.0.1", "localhost"].includes(databaseUrl.hostname) || databaseUrl.pathname !== "/wordseed_dev") {
  throw new Error("This preparation is restricted to local wordseed_dev.");
}
const client = new Client({ connectionString: databaseUrl.toString() });
try {
  await client.connect();
  const { rows } = await client.query("SELECT to_regclass('public.saved_learning_items') AS table_name");
  if (rows[0].table_name === null) {
    await client.query(await readFile(new URL("../prisma/local/create-saved-learning-items.sql", import.meta.url), "utf8"));
    process.stdout.write("Created saved_learning_items and its constraints in local wordseed_dev.\n");
  } else {
    process.stdout.write("saved_learning_items already exists; no schema changes applied.\n");
  }
  const result = await client.query('SELECT count(*)::int AS sense_count FROM dictionary_senses');
  process.stdout.write(`Existing Dictionary Sense count: ${result.rows[0].sense_count}\n`);
} finally {
  await client.end();
}
