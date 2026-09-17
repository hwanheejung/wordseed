import { randomBytes } from "node:crypto";
import { chmod, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import process from "node:process";
import { fileURLToPath, URL } from "node:url";
import { config } from "dotenv";
import { z } from "zod";

const envPath = fileURLToPath(new URL("../.env", import.meta.url));
config({ path: envPath, quiet: true });
if (process.env.NODE_ENV === "production" || process.env.ALLOW_EMAIL_TEST_LOGIN !== "true") {
  throw new Error("Enable ALLOW_EMAIL_TEST_LOGIN only in a development environment first.");
}
const databaseUrl = new URL(process.env.DATABASE_URL ?? "");
if (!["localhost", "127.0.0.1"].includes(databaseUrl.hostname) || databaseUrl.pathname !== "/wordseed_dev") {
  throw new Error("The test account workflow is restricted to local wordseed_dev.");
}
const supabaseUrl = z.url().parse(process.env.SUPABASE_URL);
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_PUBLISABLE_KEY;
if (!publishableKey) throw new Error("A Supabase publishable key is required.");
const adminKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
let email = process.env.MOBILE_TEST_EMAIL;
let password = process.env.MOBILE_TEST_PASSWORD;

async function storeSettings(values) {
  const lines = (await readFile(envPath, "utf8")).split("\n").filter((line) => !Object.hasOwn(values, line.split("=", 1)[0]));
  await writeFile(envPath, `${lines.join("\n").trimEnd()}\n${Object.entries(values).map(([key, value]) => `${key}=${value}`).join("\n")}\n`, { mode: 0o600 });
  await chmod(envPath, 0o600);
}

if (!email || !password) {
  if (!adminKey) throw new Error("Add SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) to apps/api/.env. Never put it in mobile config.");
  email = `wordseed-mobile-test-${randomBytes(5).toString("hex")}@example.com`;
  password = randomBytes(24).toString("base64url");
  const response = await globalThis.fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: { apikey: adminKey, Authorization: `Bearer ${adminKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  if (!response.ok) throw new Error(`Supabase test account creation failed (HTTP ${response.status}).`);
  const user = z.object({ id: z.uuid() }).parse(await response.json());
  await storeSettings({ MOBILE_TEST_EMAIL: email, MOBILE_TEST_PASSWORD: password, MOBILE_TEST_AUTH_SUBJECT: user.id });
  process.stdout.write("Created one confirmed Supabase test user; credentials saved only in apps/api/.env.\n");
}

const tokenResponse = await globalThis.fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
  method: "POST",
  headers: { apikey: publishableKey, "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
if (!tokenResponse.ok) throw new Error(`Test sign-in failed (HTTP ${tokenResponse.status}); no user credentials were changed.`);
const session = z.object({ access_token: z.string().min(1), user: z.object({ id: z.uuid() }) }).parse(await tokenResponse.json());
await storeSettings({ MOBILE_TEST_AUTH_SUBJECT: session.user.id });

// Exercise the real Nest/Apollo/JWT/Prisma path in-process. Never call app.listen().
const require = createRequire(import.meta.url);
const { NestFactory } = require("@nestjs/core");
const { AbstractGraphQLDriver } = require("@nestjs/graphql");
const { AppModule } = require("../dist/app.module.js");
const app = await NestFactory.create(AppModule, { logger: false });
try {
  await app.init();
  const apollo = app.get(AbstractGraphQLDriver).instance;
  async function execute(query, variables = {}, authenticated = true) {
    const result = await apollo.executeOperation({ query, variables }, { contextValue: { req: { headers: authenticated ? { authorization: `Bearer ${session.access_token}` } : {} } } });
    if (result.body.kind !== "single") throw new Error("Expected a single GraphQL result.");
    return result.body.singleResult;
  }
  const signedIn = await execute("mutation { completeSignIn { id } }");
  const userId = z.object({ data: z.object({ completeSignIn: z.object({ id: z.uuid() }) }) }).parse(signedIn).data.completeSignIn.id;
  const dictionary = await execute('{ dictionaryLexemes(first: 1) { edges { node { canonicalLemma senses { id } } } } }');
  const entry = z.object({ data: z.object({ dictionaryLexemes: z.object({ edges: z.array(z.object({ node: z.object({ canonicalLemma: z.string(), senses: z.array(z.object({ id: z.uuid() })).min(1) }) })).min(1) }) }) }).parse(dictionary).data.dictionaryLexemes.edges[0].node;
  const senseId = entry.senses[0].id;
  const mutation = "mutation Save($id: ID!) { saveDictionarySense(senseId: $id) { id addedAt } }";
  const savedResult = z.object({ data: z.object({ saveDictionarySense: z.object({ id: z.uuid(), addedAt: z.string() }) }) });
  const [left, right] = await Promise.all([execute(mutation, { id: senseId }), execute(mutation, { id: senseId })]);
  const saved = savedResult.parse(left).data.saveDictionarySense;
  const repeated = savedResult.parse(right).data.saveDictionarySense;
  if (saved.id !== repeated.id || saved.addedAt !== repeated.addedAt) throw new Error("Concurrent save identity/time verification failed.");
  const list = await execute("{ mySavedLearningItems { totalCount edges { node { id } } } }");
  const page = z.object({ data: z.object({ mySavedLearningItems: z.object({ totalCount: z.number(), edges: z.array(z.object({ node: z.object({ id: z.uuid() }) })) }) }) }).parse(list).data.mySavedLearningItems;
  if (page.edges.filter(({ node }) => node.id === saved.id).length !== 1) throw new Error("Saved item list verification failed.");
  const missing = await execute(mutation, { id: "00000000-0000-4000-8000-000000000000" });
  if (missing.errors?.[0]?.extensions?.code !== "NOT_FOUND") throw new Error("Missing Sense rejection failed.");
  const anonymous = await execute("{ mySavedLearningItems { totalCount } }", {}, false);
  if (anonymous.errors?.[0]?.extensions?.code !== "UNAUTHENTICATED") throw new Error("Unauthenticated rejection failed.");
  process.stdout.write(`Verified test user ${email}, local user ${userId}; one saved Sense from '${entry.canonicalLemma}'.\n`);
  process.stdout.write("Verified real JWT, completeSignIn, concurrent repeated save, original timestamp, own list, missing Sense and unauthenticated rejection without opening a port.\n");
} finally {
  await app.close();
}
