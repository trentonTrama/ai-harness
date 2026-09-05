#!/usr/bin/env -S npx tsx
/**
 * Validate this repo as a Claude Code plugin marketplace.
 *
 * Checks:
 *   - .claude-plugin/marketplace.json exists, is valid JSON, has required fields
 *   - every plugin entry resolves to a real directory with a valid plugin.json
 *   - plugin names are unique, kebab-case, and match their manifest
 *   - every skill has a SKILL.md with `name` and `description` frontmatter
 *   - skill directory names match the skill's declared name
 *   - referenced component dirs (commands/agents/hooks) contain the right files
 *
 * Exit code 0 = clean, 1 = one or more errors.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SEMVER_RE = /^\d+\.\d+\.\d+(?:[-+].*)?$/;

const errors: string[] = [];
const warnings: string[] = [];

const error = (msg: string): void => void errors.push(msg);
const warn = (msg: string): void => void warnings.push(msg);
const rel = (path: string): string => relative(ROOT, path) || ".";

/** A `plugins[]` entry in marketplace.json. Every field is unknown until checked. */
interface PluginEntry {
  name?: unknown;
  source?: unknown;
  description?: unknown;
  version?: unknown;
}

interface Marketplace {
  name?: unknown;
  owner?: unknown;
  plugins?: unknown;
}

interface PluginManifest {
  name?: unknown;
  description?: unknown;
  version?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDir(path: string): boolean {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

function isFile(path: string): boolean {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

function loadJson(path: string): Record<string, unknown> | null {
  let text: string;
  try {
    text = readFileSync(path, "utf8");
  } catch {
    error(`${rel(path)}: file not found`);
    return null;
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (exc) {
    error(`${rel(path)}: invalid JSON (${(exc as Error).message})`);
    return null;
  }

  if (!isRecord(data)) {
    error(`${rel(path)}: top level must be a JSON object`);
    return null;
  }
  return data;
}

/** Parse the leading `---` YAML block. Only scalar `key: value` pairs are needed. */
function parseFrontmatter(path: string): Record<string, string> | null {
  const text = readFileSync(path, "utf8");
  if (!text.startsWith("---")) {
    error(`${rel(path)}: missing YAML frontmatter (file must start with '---')`);
    return null;
  }

  const end = text.indexOf("\n---", 3);
  if (end === -1) {
    error(`${rel(path)}: frontmatter block is not closed with '---'`);
    return null;
  }

  const fields: Record<string, string> = {};
  let key: string | null = null;

  for (const line of text.slice(3, end).split("\n")) {
    if (line.trim() === "" || line.trimStart().startsWith("#")) continue;

    if (/^\s/.test(line) && key !== null) {
      // folded continuation of the previous value
      fields[key] = `${fields[key] ?? ""} ${line.trim()}`;
      continue;
    }

    const colon = line.indexOf(":");
    if (colon === -1) {
      error(`${rel(path)}: unparseable frontmatter line: ${JSON.stringify(line)}`);
      return null;
    }

    key = line.slice(0, colon).trim();
    fields[key] = line
      .slice(colon + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "");
  }

  return fields;
}

function listDirs(path: string): string[] {
  return readdirSync(path)
    .map((entry) => join(path, entry))
    .filter(isDir)
    .sort();
}

function walkFiles(path: string, ext: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(path)) {
    const full = join(path, entry);
    if (isDir(full)) out.push(...walkFiles(full, ext));
    else if (entry.endsWith(ext)) out.push(full);
  }
  return out.sort();
}

function validateSkill(skillDir: string, pluginName: string): void {
  const skillMd = join(skillDir, "SKILL.md");
  if (!isFile(skillMd)) {
    error(`${rel(skillDir)}: skill directory has no SKILL.md`);
    return;
  }

  const fields = parseFrontmatter(skillMd);
  if (fields === null) return;

  const dirName = skillDir.split("/").pop() ?? "";
  const { name, description } = fields;

  if (!name) {
    error(`${rel(skillMd)}: frontmatter is missing required field 'name'`);
  } else {
    if (!NAME_RE.test(name)) {
      error(`${rel(skillMd)}: skill name '${name}' must be kebab-case`);
    }
    if (name !== dirName) {
      error(
        `${rel(skillMd)}: skill name '${name}' does not match directory name '${dirName}'`,
      );
    }
  }

  if (!description) {
    error(`${rel(skillMd)}: frontmatter is missing required field 'description'`);
  } else if (description.length > 1024) {
    warn(`${rel(skillMd)}: description is ${description.length} chars; keep it under 1024`);
  }

  console.log(`    skill: ${dirName} (${pluginName})`);
}

function validatePlugin(entry: PluginEntry, index: number, seen: Set<string>): void {
  const label = `marketplace.json plugins[${index}]`;

  const name = entry.name;
  if (typeof name !== "string" || name === "") {
    error(`${label}: missing required field 'name'`);
    return;
  }
  if (!NAME_RE.test(name)) {
    error(`${label}: plugin name '${name}' must be kebab-case`);
  }
  if (seen.has(name)) {
    error(`${label}: duplicate plugin name '${name}'`);
  }
  seen.add(name);

  if (!entry.description) {
    error(`${label} (${name}): missing required field 'description'`);
  }

  const source = entry.source;
  if (source === undefined || source === null || source === "") {
    error(`${label} (${name}): missing required field 'source'`);
    return;
  }
  if (typeof source !== "string") {
    // object sources (git/github) point outside this repo; nothing local to check
    console.log(`  plugin: ${name} (external source, skipped)`);
    return;
  }

  const pluginDir = resolve(ROOT, source);
  if (!isDir(pluginDir)) {
    error(`${label} (${name}): source '${source}' is not a directory`);
    return;
  }

  console.log(`  plugin: ${name} -> ${source}`);

  const manifestPath = join(pluginDir, ".claude-plugin", "plugin.json");
  const manifest = loadJson(manifestPath) as PluginManifest | null;
  if (manifest !== null) {
    if (manifest.name !== name) {
      error(
        `${rel(manifestPath)}: name '${String(manifest.name)}' does not match ` +
          `marketplace entry '${name}'`,
      );
    }
    if (!manifest.description) {
      error(`${rel(manifestPath)}: missing required field 'description'`);
    }
    if (manifest.version !== undefined && !SEMVER_RE.test(String(manifest.version))) {
      error(`${rel(manifestPath)}: version '${String(manifest.version)}' is not semver`);
    }
  }

  if (entry.version !== undefined && !SEMVER_RE.test(String(entry.version))) {
    error(`${label} (${name}): version '${String(entry.version)}' is not semver`);
  }

  // an install resolves the marketplace entry, so a disagreement ships a stale version
  if (
    manifest !== null &&
    entry.version !== undefined &&
    manifest.version !== undefined &&
    String(entry.version) !== String(manifest.version)
  ) {
    error(
      `${label} (${name}): version '${String(entry.version)}' does not match ` +
        `${rel(manifestPath)} version '${String(manifest.version)}'`,
    );
  }

  const skillsDir = join(pluginDir, "skills");
  if (isDir(skillsDir)) {
    const skillDirs = listDirs(skillsDir);
    if (skillDirs.length === 0) {
      warn(`${rel(skillsDir)}: directory exists but contains no skills`);
    }
    for (const skillDir of skillDirs) validateSkill(skillDir, name);

    if (isFile(join(skillsDir, "SKILL.md"))) {
      error(
        `${rel(skillsDir)}: SKILL.md must live in a named subdirectory, ` +
          "not directly under skills/",
      );
    }
  }

  const commandsDir = join(pluginDir, "commands");
  if (isDir(commandsDir) && walkFiles(commandsDir, ".md").length === 0) {
    warn(`${rel(commandsDir)}: directory exists but contains no .md commands`);
  }

  const agentsDir = join(pluginDir, "agents");
  if (isDir(agentsDir)) {
    for (const agentMd of walkFiles(agentsDir, ".md")) {
      const fields = parseFrontmatter(agentMd);
      if (fields === null) continue;
      for (const required of ["name", "description"] as const) {
        if (!fields[required]) {
          error(`${rel(agentMd)}: frontmatter is missing '${required}'`);
        }
      }
    }
  }

  const hooksPath = join(pluginDir, "hooks", "hooks.json");
  if (isFile(hooksPath)) loadJson(hooksPath);

  const componentDirs = ["skills", "commands", "agents", "hooks"];
  if (!componentDirs.some((d) => isDir(join(pluginDir, d)))) {
    warn(`${rel(pluginDir)}: plugin has no skills, commands, agents, or hooks`);
  }
}

function report(): void {
  console.log();
  for (const w of warnings) console.log(`warning: ${w}`);
  for (const e of errors) console.log(`error: ${e}`);
  console.log();
  if (errors.length > 0) {
    console.log(`FAILED — ${errors.length} error(s), ${warnings.length} warning(s)`);
  } else {
    console.log(`OK — 0 errors, ${warnings.length} warning(s)`);
  }
}

function main(): number {
  const marketplacePath = join(ROOT, ".claude-plugin", "marketplace.json");
  console.log(`Validating marketplace: ${rel(marketplacePath)}`);

  const marketplace = loadJson(marketplacePath) as Marketplace | null;
  if (marketplace === null) {
    report();
    return 1;
  }

  const name = marketplace.name;
  if (typeof name !== "string" || name === "") {
    error("marketplace.json: missing required field 'name'");
  } else if (!NAME_RE.test(name)) {
    error(`marketplace.json: name '${name}' must be kebab-case`);
  }

  const owner = marketplace.owner;
  if (!isRecord(owner) || !owner["name"]) {
    error("marketplace.json: 'owner' must be an object with a 'name'");
  }

  const plugins = marketplace.plugins;
  if (!Array.isArray(plugins) || plugins.length === 0) {
    error("marketplace.json: 'plugins' must be a non-empty array");
    report();
    return 1;
  }

  const seen = new Set<string>();
  plugins.forEach((entry, index) => {
    if (!isRecord(entry)) {
      error(`marketplace.json plugins[${index}]: entry must be an object`);
      return;
    }
    validatePlugin(entry as PluginEntry, index, seen);
  });

  report();
  return errors.length > 0 ? 1 : 0;
}

process.exit(main());
