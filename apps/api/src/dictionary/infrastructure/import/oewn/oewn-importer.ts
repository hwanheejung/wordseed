import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { createGunzip } from "node:zlib";
import { SaxesParser, type SaxesTagPlain } from "saxes";
import { stringify } from "yaml";
import { z } from "zod";
import {
  canonicalizeDictionaryHeadword,
  DictionaryEntryKind,
  DictionaryPartOfSpeech,
  type DictionaryPartOfSpeech as DictionaryPartOfSpeechValue,
} from "../../../domain/dictionary-entry";

const sourcePartOfSpeechSchema = z.enum(["n", "v", "a", "s", "r"]);
const lexiconAttributesSchema = z.object({
  language: z.literal("en"),
  license: z.url(),
  version: z.string().min(1),
});
const lemmaAttributesSchema = z.object({
  writtenForm: z.string().min(1),
  partOfSpeech: sourcePartOfSpeechSchema,
});
const senseAttributesSchema = z.object({
  id: z.string().min(1),
  synset: z.string().min(1),
});
const synsetAttributesSchema = z.object({ id: z.string().min(1) });

const sourceManifestSchema = z.object({
  source: z.string().min(1),
  version: z.string().min(1),
  downloadUrl: z.url(),
  projectUrl: z.url(),
  license: z.string().min(1),
  licenseUrl: z.url(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
});

const targetsSchema = z.array(z.string().min(1)).min(1);

export type OewnSourceManifest = z.infer<typeof sourceManifestSchema>;

interface SelectedLexicalSense {
  sourceSenseId: string;
  sourceSynsetId: string;
  headword: string;
  partOfSpeech: DictionaryPartOfSpeechValue;
}

interface SelectedSynset {
  definitions: readonly string[];
  examples: readonly string[];
}

export interface OewnSenseCandidate extends SelectedLexicalSense {
  definition: string;
  examples: readonly string[];
}

export interface ParsedOewnSelection {
  lexicon: {
    language: "en";
    license: string;
    version: string;
  };
  candidates: readonly OewnSenseCandidate[];
  foundTargets: readonly string[];
  missingTargets: readonly string[];
  skippedSensesWithoutDefinition: number;
}

export interface OewnStagingDataset {
  attribution: {
    schemaVersion: 1;
    purpose: "OEWN_STAGING";
    source: string;
    version: string;
    projectUrl: string;
    license: string;
    licenseUrl: string;
    transformed: true;
  };
  entries: readonly OewnStagingEntry[];
  synsets: readonly OewnStagingSynset[];
}

interface OewnStagingEntry {
  headword: string;
  languageTag: "en";
  kind: "WORD" | "EXPRESSION";
  senses: readonly OewnStagingSense[];
}

interface OewnStagingSense {
  sourceSenseId: string;
  sourceSynsetId: string;
  commonnessScore: null;
  narratives: readonly [];
  examples: readonly [];
  forms: readonly [];
}

interface OewnStagingSynset {
  sourceSynsetId: string;
  partOfSpeech: DictionaryPartOfSpeechValue;
  definitions: readonly {
    languageTag: "en";
    text: string;
  }[];
  examples: readonly {
    sourceLanguageTag: "en";
    sourceText: string;
    translations: readonly [];
  }[];
}

export interface OewnImportReport {
  source: string;
  sourceVersion: string;
  targetCount: number;
  foundTargets: readonly string[];
  missingTargets: readonly string[];
  candidateSenseCount: number;
  generatedEntryCount: number;
  generatedSenseCount: number;
  generatedSynsetCount: number;
  skippedSensesWithoutDefinition: number;
  relations: {
    imported: 0;
    status: "omitted";
    reason: string;
  };
}

interface ParseState {
  currentLexicalEntry: {
    selectedLemma: {
      headword: string;
      partOfSpeech: DictionaryPartOfSpeechValue;
    } | null;
  } | null;
  currentSynset: {
    id: string;
    definitions: string[];
    examples: string[];
  } | null;
  currentTextElement: "Definition" | "Example" | null;
  currentText: string;
}

export async function parseOewnGzip(
  inputPath: string,
  targets: readonly string[],
): Promise<ParsedOewnSelection> {
  if (!inputPath.endsWith(".xml.gz")) {
    throw new Error(`Expected an OEWN .xml.gz input file, received: ${inputPath}`);
  }

  const normalizedTargetToOriginal = new Map(
    targets.map((target) => [normalizeHeadwordKey(target), canonicalizeDictionaryHeadword(target)]),
  );
  const selectedLexicalSenses: SelectedLexicalSense[] = [];
  const selectedSynsets = new Map<string, SelectedSynset>();
  const wantedSynsetIds = new Set<string>();
  const foundTargetKeys = new Set<string>();
  const state: ParseState = {
    currentLexicalEntry: null,
    currentSynset: null,
    currentTextElement: null,
    currentText: "",
  };
  let lexicon: ParsedOewnSelection["lexicon"] | null = null;

  const parser = new SaxesParser({ xmlns: false });
  parser.on("opentag", (tag: SaxesTagPlain) => {
    if (tag.name === "Lexicon") {
      lexicon = lexiconAttributesSchema.parse(tag.attributes);
      return;
    }

    if (tag.name === "LexicalEntry") {
      state.currentLexicalEntry = { selectedLemma: null };
      return;
    }

    if (tag.name === "Lemma" && state.currentLexicalEntry) {
      const lemma = lemmaAttributesSchema.parse(tag.attributes);
      const normalizedHeadword = normalizeHeadwordKey(lemma.writtenForm);
      const targetHeadword = normalizedTargetToOriginal.get(normalizedHeadword);

      if (targetHeadword) {
        state.currentLexicalEntry.selectedLemma = {
          headword: targetHeadword,
          partOfSpeech: mapPartOfSpeech(lemma.partOfSpeech),
        };
        foundTargetKeys.add(normalizedHeadword);
      }
      return;
    }

    if (tag.name === "Sense" && state.currentLexicalEntry?.selectedLemma) {
      const sense = senseAttributesSchema.parse(tag.attributes);
      selectedLexicalSenses.push({
        sourceSenseId: sense.id,
        sourceSynsetId: sense.synset,
        ...state.currentLexicalEntry.selectedLemma,
      });
      wantedSynsetIds.add(sense.synset);
      return;
    }

    if (tag.name === "Synset") {
      const synset = synsetAttributesSchema.parse(tag.attributes);
      state.currentSynset = wantedSynsetIds.has(synset.id)
        ? { id: synset.id, definitions: [], examples: [] }
        : null;
      return;
    }

    if (
      state.currentSynset &&
      (tag.name === "Definition" || tag.name === "Example")
    ) {
      state.currentTextElement = tag.name;
      state.currentText = "";
    }
  });
  parser.on("text", (text: string) => {
    if (state.currentTextElement) {
      state.currentText += text;
    }
  });
  parser.on("closetag", (tag: SaxesTagPlain) => {
    if (
      state.currentSynset &&
      state.currentTextElement &&
      tag.name === state.currentTextElement
    ) {
      const normalizedText = normalizeContentText(state.currentText);
      if (normalizedText) {
        const destination =
          state.currentTextElement === "Definition"
            ? state.currentSynset.definitions
            : state.currentSynset.examples;
        destination.push(normalizedText);
      }
      state.currentTextElement = null;
      state.currentText = "";
      return;
    }

    if (tag.name === "LexicalEntry") {
      state.currentLexicalEntry = null;
      return;
    }

    if (tag.name === "Synset" && state.currentSynset) {
      selectedSynsets.set(state.currentSynset.id, {
        definitions: state.currentSynset.definitions,
        examples: state.currentSynset.examples,
      });
      state.currentSynset = null;
    }
  });

  const stream = createReadStream(inputPath).pipe(createGunzip());
  try {
    for await (const chunk of stream) {
      parser.write(readStreamChunk(chunk));
    }
    parser.close();
  } catch (error) {
    throw new Error(`Failed to parse OEWN input ${basename(inputPath)}.`, { cause: error });
  }

  if (!lexicon) {
    throw new Error("The OEWN input does not contain valid Lexicon metadata.");
  }

  let skippedSensesWithoutDefinition = 0;
  const candidates = selectedLexicalSenses.flatMap((sense) => {
    const synset = selectedSynsets.get(sense.sourceSynsetId);
    const definition = synset?.definitions[0];
    if (!definition) {
      skippedSensesWithoutDefinition += 1;
      return [];
    }
    return [{ ...sense, definition, examples: synset.examples }];
  });

  const foundTargets = targets.filter((target) => foundTargetKeys.has(normalizeHeadwordKey(target)));
  const missingTargets = targets.filter(
    (target) => !foundTargetKeys.has(normalizeHeadwordKey(target)),
  );

  return {
    lexicon,
    candidates: [...candidates].sort(compareCandidates),
    foundTargets,
    missingTargets,
    skippedSensesWithoutDefinition,
  };
}

export function buildOewnStagingDataset(
  selection: ParsedOewnSelection,
  manifest: OewnSourceManifest,
): OewnStagingDataset {
  const candidatesByHeadword = new Map<string, OewnSenseCandidate[]>();
  for (const candidate of selection.candidates) {
    const key = normalizeHeadwordKey(candidate.headword);
    const existingCandidates = candidatesByHeadword.get(key) ?? [];
    existingCandidates.push(candidate);
    candidatesByHeadword.set(key, existingCandidates);
  }
  const entries = [...candidatesByHeadword.values()]
    .map((candidates) => buildStagingEntry(candidates))
    .sort((left, right) => left.headword.localeCompare(right.headword, "en"));
  const candidatesBySynset = new Map<string, OewnSenseCandidate[]>();
  for (const candidate of selection.candidates) {
    const existingCandidates = candidatesBySynset.get(candidate.sourceSynsetId) ?? [];
    existingCandidates.push(candidate);
    candidatesBySynset.set(candidate.sourceSynsetId, existingCandidates);
  }
  const synsets = [...candidatesBySynset.entries()]
    .map(([sourceSynsetId, candidates]) =>
      buildStagingSynset(sourceSynsetId, candidates),
    )
    .sort((left, right) => left.sourceSynsetId.localeCompare(right.sourceSynsetId));

  return {
    attribution: {
      schemaVersion: 1,
      purpose: "OEWN_STAGING",
      source: manifest.source,
      version: manifest.version,
      projectUrl: manifest.projectUrl,
      license: manifest.license,
      licenseUrl: manifest.licenseUrl,
      transformed: true,
    },
    entries,
    synsets,
  };
}

export function createImportReport(
  selection: ParsedOewnSelection,
  dataset: OewnStagingDataset,
  manifest: OewnSourceManifest,
  targetCount: number,
): OewnImportReport {
  return {
    source: manifest.source,
    sourceVersion: manifest.version,
    targetCount,
    foundTargets: selection.foundTargets,
    missingTargets: selection.missingTargets,
    candidateSenseCount: selection.candidates.length,
    generatedEntryCount: dataset.entries.length,
    generatedSenseCount: dataset.entries.reduce(
      (count, entry) => count + entry.senses.length,
      0,
    ),
    generatedSynsetCount: dataset.synsets.length,
    skippedSensesWithoutDefinition: selection.skippedSensesWithoutDefinition,
    relations: {
      imported: 0,
      status: "omitted",
      reason: "OEWN relation mapping is outside the first importer scope.",
    },
  };
}

export async function writeOewnStagingArtifacts(
  outputDirectory: string,
  selection: ParsedOewnSelection,
  dataset: OewnStagingDataset,
  report: OewnImportReport,
): Promise<void> {
  await mkdir(outputDirectory, { recursive: true });
  const candidatesJsonl = selection.candidates
    .map((candidate) => JSON.stringify(candidate))
    .join("\n");
  await Promise.all([
    writeAtomically(join(outputDirectory, "candidates.jsonl"), `${candidatesJsonl}\n`),
    writeAtomically(
      join(outputDirectory, "import-report.json"),
      `${JSON.stringify(report, null, 2)}\n`,
    ),
  ]);
  await writeOewnStagingYamlShards(outputDirectory, dataset);
}

export function parseSourceManifest(value: unknown): OewnSourceManifest {
  return sourceManifestSchema.parse(value);
}

export function parseTargets(value: unknown): readonly string[] {
  const targets = targetsSchema.parse(value).map(canonicalizeDictionaryHeadword);
  if (new Set(targets.map(normalizeHeadwordKey)).size !== targets.length) {
    throw new Error("Dictionary import targets must be unique after normalization.");
  }
  return targets;
}

function buildStagingEntry(
  candidates: readonly OewnSenseCandidate[],
): OewnStagingEntry {
  const firstCandidate = candidates[0];
  if (!firstCandidate) {
    throw new Error("Cannot build a dictionary entry without a sense candidate.");
  }

  const uniqueCandidates = [
    ...new Map(
      candidates.map((candidate) => [candidate.sourceSynsetId, candidate]),
    ).values(),
  ];
  const senses = uniqueCandidates.sort(compareCandidates).map((candidate) => {
    return {
      sourceSenseId: candidate.sourceSenseId,
      sourceSynsetId: candidate.sourceSynsetId,
      commonnessScore: null,
      narratives: [] as const,
      examples: [] as const,
      forms: [] as const,
    };
  });

  return {
    headword: firstCandidate.headword,
    languageTag: "en",
    kind: firstCandidate.headword.includes(" ")
      ? DictionaryEntryKind.EXPRESSION
      : DictionaryEntryKind.WORD,
    senses,
  };
}

function buildStagingSynset(
  sourceSynsetId: string,
  candidates: readonly OewnSenseCandidate[],
): OewnStagingSynset {
  const firstCandidate = candidates[0];
  if (!firstCandidate) {
    throw new Error("Cannot build a dictionary synset without a candidate.");
  }
  if (candidates.some((candidate) => candidate.partOfSpeech !== firstCandidate.partOfSpeech)) {
    throw new Error(`OEWN synset ${sourceSynsetId} has conflicting parts of speech.`);
  }

  const definitions = [...new Set(candidates.map((candidate) => candidate.definition))]
    .sort((left, right) => left.localeCompare(right, "en"))
    .map((definition) => ({
      languageTag: "en" as const,
      text: definition,
    }));
  const examples = [...new Set(candidates.flatMap((candidate) => candidate.examples))]
    .sort((left, right) => left.localeCompare(right, "en"))
    .map((example) => ({
      sourceLanguageTag: "en" as const,
      sourceText: example,
      translations: [] as const,
    }));

  return {
    sourceSynsetId,
    partOfSpeech: firstCandidate.partOfSpeech,
    definitions,
    examples,
  };
}

async function writeOewnStagingYamlShards(
  outputDirectory: string,
  dataset: OewnStagingDataset,
): Promise<void> {
  const stagingDirectory = join(outputDirectory, "staging");
  const temporaryDirectory = join(outputDirectory, ".staging.tmp");
  await rm(temporaryDirectory, { recursive: true, force: true });
  await mkdir(temporaryDirectory, { recursive: true });

  const entriesByShard = groupBy(dataset.entries, (entry) => entryShardKey(entry.headword));
  const synsetsByShard = groupBy(
    dataset.synsets,
    (synset) =>
      `${synset.partOfSpeech.toLocaleLowerCase("en")}/${sourceIdShardKey(synset.sourceSynsetId)}`,
  );
  const writes: Promise<void>[] = [
    writeYaml(join(temporaryDirectory, "attribution.yaml"), dataset.attribution),
  ];
  for (const [shard, entries] of [...entriesByShard.entries()].sort(compareShardEntries)) {
    writes.push(
      writeYaml(join(temporaryDirectory, "entries", "en", `${shard}.yaml`), {
        schemaVersion: 1,
        languageTag: "en",
        entries,
      }),
    );
  }
  for (const [shard, synsets] of [...synsetsByShard.entries()].sort(compareShardEntries)) {
    writes.push(
      writeYaml(join(temporaryDirectory, "synsets", "en", `${shard}.yaml`), {
        schemaVersion: 1,
        languageTag: "en",
        synsets,
      }),
    );
  }
  await Promise.all(writes);
  await rm(stagingDirectory, { recursive: true, force: true });
  await rename(temporaryDirectory, stagingDirectory);
}

function groupBy<T>(values: readonly T[], keyOf: (value: T) => string): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  for (const value of values) {
    const key = keyOf(value);
    const group = grouped.get(key) ?? [];
    group.push(value);
    grouped.set(key, group);
  }
  return grouped;
}

function compareShardEntries<T>(left: readonly [string, T], right: readonly [string, T]): number {
  return left[0].localeCompare(right[0], "en");
}

function entryShardKey(headword: string): string {
  const firstCharacter = normalizeHeadwordKey(headword)[0];
  return firstCharacter && /^[a-z]$/.test(firstCharacter) ? firstCharacter : "other";
}

async function writeYaml(filePath: string, value: unknown): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, stringify(value, { lineWidth: 0 }), "utf8");
}

function sourceIdShardKey(sourceId: string): string {
  return createHash("sha256").update(sourceId).digest("hex").slice(0, 2);
}

function mapPartOfSpeech(source: z.infer<typeof sourcePartOfSpeechSchema>): DictionaryPartOfSpeechValue {
  switch (source) {
    case "n":
      return DictionaryPartOfSpeech.NOUN;
    case "v":
      return DictionaryPartOfSpeech.VERB;
    case "a":
    case "s":
      return DictionaryPartOfSpeech.ADJECTIVE;
    case "r":
      return DictionaryPartOfSpeech.ADVERB;
  }
}

function normalizeHeadwordKey(headword: string): string {
  return canonicalizeDictionaryHeadword(headword).toLocaleLowerCase("en");
}

function normalizeContentText(text: string): string {
  return text.normalize("NFKC").trim().replace(/\s+/g, " ");
}

function compareCandidates(left: OewnSenseCandidate, right: OewnSenseCandidate): number {
  return (
    normalizeHeadwordKey(left.headword).localeCompare(normalizeHeadwordKey(right.headword), "en") ||
    left.partOfSpeech.localeCompare(right.partOfSpeech, "en") ||
    left.definition.localeCompare(right.definition, "en") ||
    left.sourceSenseId.localeCompare(right.sourceSenseId, "en")
  );
}

async function writeAtomically(filePath: string, content: string): Promise<void> {
  const temporaryPath = join(dirname(filePath), `.${basename(filePath)}.tmp`);
  await writeFile(temporaryPath, content, "utf8");
  await rename(temporaryPath, filePath);
}

function readStreamChunk(chunk: unknown): string {
  if (typeof chunk === "string") {
    return chunk;
  }
  if (Buffer.isBuffer(chunk)) {
    return chunk.toString("utf8");
  }
  throw new TypeError("Expected the OEWN input stream to yield text or Buffer chunks.");
}
