import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve, sep } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const sourceRoot = join(projectRoot, "src");
const codeExtensions = new Set([".ts", ".tsx"]);
const layeredOrder = {
  shared: 0,
  entities: 1,
  features: 2,
  widgets: 3,
  routes: 4,
};
const slicedLayers = new Set(["entities", "features", "widgets"]);
const errors = [];

function walk(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function sourceParts(path) {
  return relative(sourceRoot, path).split(sep);
}

function resolveImport(importer, specifier) {
  const base = specifier.startsWith("@/")
    ? join(sourceRoot, specifier.slice(2))
    : specifier.startsWith(".")
      ? resolve(dirname(importer), specifier)
      : undefined;
  if (!base) return undefined;
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    join(base, "index.ts"),
    join(base, "index.tsx"),
  ];
  return candidates.find(
    (candidate) => existsSync(candidate) && statSync(candidate).isFile(),
  );
}

const files = walk(sourceRoot).filter((path) => codeExtensions.has(extname(path)));

for (const path of files) {
  const parts = sourceParts(path);
  if (
    slicedLayers.has(parts[0]) &&
    (parts[2] === "model" || parts[2] === "lib")
  )
    errors.push(
      `${relative(projectRoot, path)}: use a concrete segment instead of ${parts[2]}/`,
    );

  const contents = readFileSync(path, "utf8");
  const isSlicePublicApi =
    slicedLayers.has(parts[0]) &&
    parts.length === 3 &&
    (parts[2] === "index.ts" || parts[2] === "index.tsx");
  if (isSlicePublicApi && /export\s+\*\s+from/.test(contents))
    errors.push(
      `${relative(projectRoot, path)}: slice public APIs require explicit exports`,
    );
  const imports = contents.matchAll(
    /(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g,
  );
  for (const match of imports) {
    const target = resolveImport(path, match[1]);
    if (!target || !target.startsWith(sourceRoot)) continue;
    const targetParts = sourceParts(target);
    const sourceLayer = parts[0];
    const targetLayer = targetParts[0];
    if (sourceLayer === "app") continue;
    if (!(sourceLayer in layeredOrder)) continue;
    if (targetLayer === "app") {
      errors.push(
        `${relative(projectRoot, path)}: ${sourceLayer} cannot import app`,
      );
      continue;
    }
    if (!(targetLayer in layeredOrder)) continue;
    const sameSlice =
      slicedLayers.has(sourceLayer) &&
      sourceLayer === targetLayer &&
      parts[1] === targetParts[1];
    const importsSliceInternals =
      slicedLayers.has(targetLayer) &&
      !sameSlice &&
      !(
        targetParts.length === 3 &&
        (targetParts[2] === "index.ts" || targetParts[2] === "index.tsx")
      );
    if (importsSliceInternals)
      errors.push(
        `${relative(projectRoot, path)}: import ${targetLayer}/${targetParts[1]} through its root public API`,
      );
    if (sourceLayer === targetLayer) {
      const sharedInternal = sourceLayer === "shared";
      const colocatedTest = parts.at(-1)?.includes(".test.");
      if (!sameSlice && !sharedInternal && !colocatedTest)
        errors.push(
          `${relative(projectRoot, path)}: cross-import from ${sourceLayer}/${parts[1]} to ${targetLayer}/${targetParts[1]}`,
        );
      continue;
    }
    if (layeredOrder[targetLayer] >= layeredOrder[sourceLayer])
      errors.push(
        `${relative(projectRoot, path)}: upward import from ${sourceLayer} to ${targetLayer}`,
      );
  }
}

for (const layer of slicedLayers) {
  const layerPath = join(sourceRoot, layer);
  if (!existsSync(layerPath)) continue;
  for (const slice of readdirSync(layerPath)) {
    const slicePath = join(layerPath, slice);
    if (!statSync(slicePath).isDirectory()) continue;
    const hasCode = walk(slicePath).some((path) => codeExtensions.has(extname(path)));
    if (hasCode && !existsSync(join(slicePath, "ui")))
      errors.push(`src/${layer}/${slice}: every slice requires a ui/ segment`);
  }
}

if (errors.length) {
  globalThis.console.error(errors.join("\n"));
  globalThis.process.exitCode = 1;
} else {
  globalThis.console.log("Structure check passed.");
}
