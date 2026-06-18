import { existsSync, readFileSync, statSync } from "node:fs";

const requiredFiles = [
  "README.md",
  "CHANGELOG.md",
  "manifest.json",
  "package.json",
  "preview.png",
  "preview2.png",
  "src/settings.json",
];

const errors = [];

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    errors.push(`Missing required file: ${file}`);
    continue;
  }
  if (statSync(file).size === 0) {
    errors.push(`Required file is empty: ${file}`);
  }
}

function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    errors.push(`Invalid JSON in ${file}: ${error.message}`);
    return {};
  }
}

const pkg = readJson("package.json");
const manifest = readJson("manifest.json");
const settings = readJson("src/settings.json");
const readme = existsSync("README.md") ? readFileSync("README.md", "utf8") : "";
const changelog = existsSync("CHANGELOG.md") ? readFileSync("CHANGELOG.md", "utf8") : "";

if (pkg.name !== "listening-insights") {
  errors.push(`package.json name must be "listening-insights", got "${pkg.name}"`);
}

if (!/^\d+\.\d+\.\d+$/.test(pkg.version ?? "")) {
  errors.push(`package.json version must be semver, got "${pkg.version}"`);
}

if (manifest.name !== "Listening Insights") {
  errors.push(`manifest.json name must be "Listening Insights", got "${manifest.name}"`);
}

if (manifest.preview !== "preview.png") {
  errors.push(`manifest.json preview must be "preview.png", got "${manifest.preview}"`);
}

if (manifest.branch !== "dist") {
  errors.push(`manifest.json branch must be "dist", got "${manifest.branch}"`);
}

if (!Array.isArray(manifest.authors) || manifest.authors.length === 0) {
  errors.push("manifest.json must include at least one author");
}

if (!Array.isArray(manifest.tags) || manifest.tags.length === 0) {
  errors.push("manifest.json must include marketplace tags");
}

if (settings.nameId !== "listening-insights") {
  errors.push(`src/settings.json nameId must be "listening-insights", got "${settings.nameId}"`);
}

for (const image of ["preview.png", "preview2.png"]) {
  if (existsSync(image) && statSync(image).size < 10_000) {
    errors.push(`${image} looks too small for a release preview`);
  }
}

if (!readme.includes("preview.png") || !readme.includes("preview2.png")) {
  errors.push("README.md must reference preview.png and preview2.png");
}

if (!changelog.includes(`## ${pkg.version}`)) {
  errors.push(`CHANGELOG.md must include section "## ${pkg.version}"`);
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`Release check passed for listening-insights v${pkg.version}`);
