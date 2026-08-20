import { z } from "zod";
import {
  DEFAULT_MAGIC_EXPRESSIONS,
  LEGACY_DEFAULT_PAIRS,
} from "../constants/default-magic-expressions";
import type {
  CreateMagicExpressionInput,
  MagicExpression,
} from "../types/magic-expression";

const STORAGE_KEY = "wordseed:toefl-magic-expressions";

const magicExpressionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
});

const storedCollectionSchema = z.object({
  version: z.literal(2),
  items: z.array(magicExpressionSchema),
});

const legacyStoredCollectionSchema = z.object({
  version: z.literal(1),
  items: z.array(magicExpressionSchema),
});

interface StoredMagicExpressionCollection {
  version: 2;
  items: MagicExpression[];
}

export function loadMagicExpressions(): MagicExpression[] {
  const storedValue = window.localStorage.getItem(STORAGE_KEY);
  if (storedValue === null) return seedDefaultMagicExpressions();

  try {
    const storedJson: unknown = JSON.parse(storedValue);
    const parsed = storedCollectionSchema.safeParse(storedJson);
    if (parsed.success) return parsed.data.items;

    const legacy = legacyStoredCollectionSchema.safeParse(storedJson);
    if (legacy.success) {
      const migrated = migrateLegacyDefaults(legacy.data.items);
      writeMagicExpressions(migrated);

      return migrated;
    }
  } catch {
    // Invalid local data is replaced with a valid default collection below.
  }

  return seedDefaultMagicExpressions();
}

export function createMagicExpression(
  input: CreateMagicExpressionInput,
): MagicExpression[] {
  const expression: MagicExpression = {
    id: globalThis.crypto.randomUUID(),
    title: input.title.trim(),
    description: input.description.trim(),
  };
  const next = [...loadMagicExpressions(), expression];
  writeMagicExpressions(next);

  return next;
}

export function updateMagicExpression(
  id: string,
  input: CreateMagicExpressionInput,
): MagicExpression[] {
  const next = loadMagicExpressions().map((expression) =>
    expression.id === id
      ? {
          ...expression,
          title: input.title.trim(),
          description: input.description.trim(),
        }
      : expression,
  );
  writeMagicExpressions(next);

  return next;
}

export function removeMagicExpression(id: string): MagicExpression[] {
  const next = loadMagicExpressions().filter(
    (expression) => expression.id !== id,
  );
  writeMagicExpressions(next);

  return next;
}

function seedDefaultMagicExpressions(): MagicExpression[] {
  const defaults = DEFAULT_MAGIC_EXPRESSIONS.map((expression) => ({
    ...expression,
  }));
  writeMagicExpressions(defaults);

  return defaults;
}

function writeMagicExpressions(items: MagicExpression[]) {
  const collection: StoredMagicExpressionCollection = {
    version: 2,
    items,
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
}

function migrateLegacyDefaults(items: MagicExpression[]): MagicExpression[] {
  const ids = new Set(items.map(({ id }) => id));
  const replacements = new Map<string, MagicExpression>();
  const removedIds = new Set<string>();

  for (const [firstId, secondId, replacementId] of LEGACY_DEFAULT_PAIRS) {
    if (!ids.has(firstId) || !ids.has(secondId)) continue;

    const replacement = DEFAULT_MAGIC_EXPRESSIONS.find(
      ({ id }) => id === replacementId,
    );
    if (!replacement) continue;

    replacements.set(firstId, { ...replacement });
    removedIds.add(secondId);
  }

  return items.flatMap((item) => {
    const replacement = replacements.get(item.id);
    if (replacement) return [replacement];
    if (removedIds.has(item.id)) return [];

    return [item];
  });
}
