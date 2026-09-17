import { z } from "zod";

const localDatabaseUrl =
  "postgresql://wordseed:wordseed@127.0.0.1:5432/wordseed_dev?schema=public";
const localSupabaseUrl = "http://127.0.0.1:54321";

const environmentSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PORT: z.coerce.number().int().min(1).max(65_535).default(4000),
    CORS_ORIGINS: z
      .string()
      .default("")
      .transform((value) =>
        value
          .split(",")
          .map((origin) => origin.trim())
          .filter((origin) => origin.length > 0),
      ),
    DATABASE_URL: z.url().optional(),
    SUPABASE_URL: z.url().optional(),
    ALLOW_EMAIL_TEST_LOGIN: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
    SUPABASE_JWT_AUDIENCE: z.string().trim().min(1).default("authenticated"),
  })
  .superRefine((configuration, context) => {
    if (configuration.NODE_ENV === "production" && configuration.ALLOW_EMAIL_TEST_LOGIN) {
      context.addIssue({
        code: "custom",
        message: "ALLOW_EMAIL_TEST_LOGIN must be false in production.",
        path: ["ALLOW_EMAIL_TEST_LOGIN"],
      });
    }

    if (
      configuration.NODE_ENV === "production" &&
      configuration.DATABASE_URL === undefined
    ) {
      context.addIssue({
        code: "custom",
        message: "DATABASE_URL is required in production.",
        path: ["DATABASE_URL"],
      });
    }

    if (
      configuration.NODE_ENV === "production" &&
      configuration.SUPABASE_URL === undefined
    ) {
      context.addIssue({
        code: "custom",
        message: "SUPABASE_URL is required in production.",
        path: ["SUPABASE_URL"],
      });
    }
  })
  .transform((configuration) => ({
    ...configuration,
    DATABASE_URL: configuration.DATABASE_URL ?? localDatabaseUrl,
    SUPABASE_URL: configuration.SUPABASE_URL ?? localSupabaseUrl,
  }));

export type ApiEnvironment = z.output<typeof environmentSchema>;

export function validateEnvironment(
  configuration: Record<string, unknown>,
): ApiEnvironment {
  const result = environmentSchema.safeParse(configuration);

  if (!result.success) {
    throw new Error(
      `Invalid API environment configuration:\n${z.prettifyError(result.error)}`,
      { cause: result.error },
    );
  }

  return result.data;
}
