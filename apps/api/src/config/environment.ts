import { z } from "zod";

const localDatabaseUrl =
  "postgresql://wordseed:wordseed@127.0.0.1:5432/wordseed_dev?schema=public";

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
  })
  .superRefine((configuration, context) => {
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
  })
  .transform((configuration) => ({
    ...configuration,
    DATABASE_URL: configuration.DATABASE_URL ?? localDatabaseUrl,
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
