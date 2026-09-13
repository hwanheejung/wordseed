import { gzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import {
  buildOewnStagingDataset,
  createImportReport,
  parseOewnGzip,
  parseSourceManifest,
  writeOewnStagingArtifacts,
} from "./oewn-importer";

const manifest = parseSourceManifest({
  source: "Open English WordNet",
  version: "2025",
  downloadUrl: "https://example.com/english-wordnet-2025.xml.gz",
  projectUrl: "https://example.com/oewn",
  license: "CC-BY-4.0",
  licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  sha256: "a".repeat(64),
});

const fixtureXml = `<?xml version="1.0" encoding="UTF-8"?>
<LexicalResource>
  <Lexicon language="en" license="https://creativecommons.org/licenses/by/4.0" version="2025">
    <LexicalEntry id="source-grind-v">
      <Lemma writtenForm="grind" partOfSpeech="v"/>
      <Sense id="source-grind-sense" synset="source-grind-synset"/>
    </LexicalEntry>
    <LexicalEntry id="source-toil-v">
      <Lemma writtenForm="toil" partOfSpeech="v"/>
      <Sense id="source-toil-sense" synset="source-grind-synset"/>
    </LexicalEntry>
    <LexicalEntry id="source-dead-end-n">
      <Lemma writtenForm="dead end" partOfSpeech="n"/>
      <Sense id="source-dead-end-sense" synset="source-dead-end-synset"/>
    </LexicalEntry>
    <Synset id="source-grind-synset">
      <Definition>  work steadily at something difficult  </Definition>
      <Example>she continued to grind</Example>
    </Synset>
    <Synset id="source-dead-end-synset">
      <Definition>a situation offering no progress</Definition>
    </Synset>
  </Lexicon>
</LexicalResource>`;

describe("OEWN importer", () => {
  it("builds deterministic OEWN staging entries and reports missing targets", async () => {
    const inputPath = await writeFixture();
    const targets = ["grind", "toil", "dead end", "not in source"];

    const firstSelection = await parseOewnGzip(inputPath, targets);
    const secondSelection = await parseOewnGzip(inputPath, targets);
    const firstDataset = buildOewnStagingDataset(firstSelection, manifest);
    const secondDataset = buildOewnStagingDataset(secondSelection, manifest);
    const report = createImportReport(firstSelection, firstDataset, manifest, targets.length);

    expect(firstDataset).toEqual(secondDataset);
    expect(firstDataset.entries).toHaveLength(3);
    expect(firstDataset.synsets).toHaveLength(2);
    const sharedSynsetId = firstDataset.entries.find(
      (entry) => entry.headword === "grind",
    )?.senses[0]?.sourceSynsetId;
    expect(
      firstDataset.entries.find((entry) => entry.headword === "toil")?.senses[0]
        ?.sourceSynsetId,
    ).toBe(sharedSynsetId);
    expect(firstDataset.entries.find((entry) => entry.headword === "dead end")?.kind).toBe(
      "EXPRESSION",
    );
    expect(
      firstDataset.synsets.find((synset) => synset.sourceSynsetId === sharedSynsetId)
        ?.definitions[0]?.text,
    ).toBe("work steadily at something difficult");
    expect(
      firstDataset.synsets.find((synset) => synset.sourceSynsetId === sharedSynsetId)
        ?.examples[0]?.sourceText,
    ).toBe("she continued to grind");
    expect(report.missingTargets).toEqual(["not in source"]);
    expect(report.relations).toEqual({
      imported: 0,
      status: "omitted",
      reason: "OEWN relation mapping is outside the first importer scope.",
    });
  });

  it("keeps source traceability in staging YAML", async () => {
    const inputPath = await writeFixture();
    const outputDirectory = await mkdtemp(join(tmpdir(), "wordseed-oewn-output-"));
    const selection = await parseOewnGzip(inputPath, ["grind", "dead end"]);
    const dataset = buildOewnStagingDataset(selection, manifest);
    const report = createImportReport(selection, dataset, manifest, 2);

    await writeOewnStagingArtifacts(outputDirectory, selection, dataset, report);

    const candidates = await readFile(join(outputDirectory, "candidates.jsonl"), "utf8");
    const entryYaml = await readFile(
      join(outputDirectory, "staging", "entries", "en", "g.yaml"),
      "utf8",
    );
    const synsetId = dataset.entries.find((entry) => entry.headword === "grind")
      ?.senses[0]?.sourceSynsetId;
    expect(synsetId).toBeDefined();
    const synsetYaml = await readFile(
      join(
        outputDirectory,
        "staging",
        "synsets",
        "en",
        "verb",
        `${createHash("sha256").update(synsetId ?? "").digest("hex").slice(0, 2)}.yaml`,
      ),
      "utf8",
    );
    const stagingSource = `${entryYaml}\n${synsetYaml}`;
    expect(candidates).toContain("sourceSenseId");
    expect(candidates).toContain("source-grind-sense");
    expect(stagingSource).toContain("sourceSenseId");
    expect(stagingSource).toContain("sourceSynsetId");
    expect(stagingSource).toContain("source-grind-sense");
    expect(stagingSource).not.toMatch(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
    );
    expect(parse(entryYaml)).toMatchObject({
      schemaVersion: 1,
      languageTag: "en",
      entries: [{ headword: "grind" }],
    });
    expect(parse(synsetYaml)).toMatchObject({
      schemaVersion: 1,
      languageTag: "en",
      synsets: [{ sourceSynsetId: synsetId }],
    });
  });

  it("rejects malformed consumed XML attributes at the source boundary", async () => {
    const malformedXml = fixtureXml.replace('partOfSpeech="v"', 'partOfSpeech="x"');
    const inputPath = await writeFixture(malformedXml);

    await expect(parseOewnGzip(inputPath, ["grind"])).rejects.toThrow();
  });
});

async function writeFixture(xml: string = fixtureXml): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "wordseed-oewn-fixture-"));
  const inputPath = join(directory, "fixture.xml.gz");
  await writeFile(inputPath, gzipSync(xml));
  return inputPath;
}
