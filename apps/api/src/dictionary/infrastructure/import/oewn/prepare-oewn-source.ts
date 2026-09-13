import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseOewnCliArguments } from "./oewn-cli-arguments";
import {
  buildOewnStagingDataset,
  createImportReport,
  parseOewnGzip,
  parseSourceManifest,
  parseTargets,
  writeOewnStagingArtifacts,
} from "./oewn-importer";

void main();

async function main(): Promise<void> {
  const { inputArgument, outputArgument } = parseOewnCliArguments(process.argv.slice(2));
  const inputPath = resolve(inputArgument);
  const outputDirectory = resolve(
    outputArgument ?? ".cache/dictionary-import/oewn-2025",
  );
  const manifest = parseSourceManifest(
    JSON.parse(await readFile("dictionary-import/oewn-2025.json", "utf8")) as unknown,
  );
  const targets = parseTargets(
    JSON.parse(await readFile("dictionary-import/targets.json", "utf8")) as unknown,
  );
  const inputSha256 = await calculateSha256(inputPath);

  if (inputSha256 !== manifest.sha256) {
    throw new Error(
      `OEWN checksum mismatch. Expected ${manifest.sha256}, received ${inputSha256}.`,
    );
  }

  const selection = await parseOewnGzip(inputPath, targets);
  if (selection.lexicon.version !== manifest.version) {
    throw new Error(
      `OEWN version mismatch. Expected ${manifest.version}, received ${selection.lexicon.version}.`,
    );
  }
  if (normalizeUrl(selection.lexicon.license) !== normalizeUrl(manifest.licenseUrl)) {
    throw new Error(
      `OEWN license mismatch. Expected ${manifest.licenseUrl}, received ${selection.lexicon.license}.`,
    );
  }

  const dataset = buildOewnStagingDataset(selection, manifest);
  const report = createImportReport(selection, dataset, manifest, targets.length);
  await writeOewnStagingArtifacts(outputDirectory, selection, dataset, report);

  process.stdout.write(
    `Prepared ${report.generatedEntryCount} entries, ${report.generatedSenseCount} senses, and ${report.generatedSynsetCount} synsets for staging. ` +
      `${report.missingTargets.length} of ${report.targetCount} targets were not found. ` +
      `Output: ${outputDirectory}\n`,
  );
}

async function calculateSha256(filePath: string): Promise<string> {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(filePath)) {
    if (!Buffer.isBuffer(chunk)) {
      throw new TypeError("Expected the OEWN file stream to yield Buffer chunks.");
    }
    hash.update(chunk);
  }
  return hash.digest("hex");
}

function normalizeUrl(url: string): string {
  return url.replace(/\/$/, "");
}
