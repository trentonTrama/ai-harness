#!/usr/bin/env -S npx tsx
/**
 * Require a version bump when a plugin's files change.
 *
 * Compares the working tree against a base ref (BASE_REF, else origin/main). For every
 * plugin whose files changed since the merge base, the plugin's `version` must be
 * strictly greater than it was at the merge base, and the marketplace entry must agree.
 *
 * A plugin that did not exist at the merge base is new — no bump is required.
 * If the base ref cannot be resolved (a shallow clone, a fresh repo), the check is
 * skipped rather than failed.
 *
 * Exit code 0 = clean, 1 = a plugin changed without a bump.
 */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BASE_REF = process.env["BASE_REF"] ?? "origin/main";

const errors: string[] = [];

function git(...args: string[]): string {
  return execFileSync("git", args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
}

function gitOrNull(...args: string[]): string | null {
  try {
    return git(...args);
  } catch {
    return null;
  }
}

interface Version {
  major: number;
  minor: number;
  patch: number;
}

function parseVersion(raw: unknown): Version | null {
  const match = /^(\d+)\.(\d+)\.(\d+)/.exec(String(raw));
  if (match === null) return null;
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

/** Returns >0 if a is newer than b, 0 if equal, <0 if older. */
function compareVersions(a: Version, b: Version): number {
  return a.major - b.major || a.minor - b.minor || a.patch - b.patch;
}

function readJson(text: string): Record<string, unknown> | null {
  try {
    const data: unknown = JSON.parse(text);
    return typeof data === "object" && data !== null && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function main(): number {
  if (gitOrNull("rev-parse", "--verify", `${BASE_REF}^{commit}`) === null) {
    console.log(`Base ref '${BASE_REF}' not found — skipping the version-bump check.`);
    return 0;
  }

  const mergeBase = gitOrNull("merge-base", "HEAD", BASE_REF);
  if (mergeBase === null) {
    console.log(`No merge base with '${BASE_REF}' — skipping the version-bump check.`);
    return 0;
  }

  const changed = new Set(
    git("diff", "--name-only", mergeBase, "--").split("\n").filter((line) => line !== ""),
  );
  if (changed.size === 0) {
    console.log(`No changes against ${BASE_REF} — nothing to check.`);
    return 0;
  }

  const marketplace = readJson(
    readFileSync(join(ROOT, ".claude-plugin", "marketplace.json"), "utf8"),
  );
  const plugins = marketplace?.["plugins"];
  if (!Array.isArray(plugins)) {
    console.log("marketplace.json has no plugins array — nothing to check.");
    return 0;
  }

  console.log(`Comparing against ${BASE_REF} (merge base ${mergeBase.slice(0, 8)})`);

  for (const entry of plugins) {
    if (typeof entry !== "object" || entry === null) continue;
    const record = entry as Record<string, unknown>;
    const name = String(record["name"] ?? "");
    const source = record["source"];
    if (typeof source !== "string" || !source.startsWith("./")) continue;

    const prefix = `${source.replace(/^\.\//, "").replace(/\/$/, "")}/`;
    const touched = [...changed].filter((file) => file.startsWith(prefix));
    if (touched.length === 0) {
      console.log(`  ${name}: unchanged`);
      continue;
    }

    const manifestPath = `${prefix}.claude-plugin/plugin.json`;
    const currentManifest = readJson(readFileSync(join(ROOT, manifestPath), "utf8"));
    const current = parseVersion(currentManifest?.["version"]);
    if (current === null) {
      errors.push(`${manifestPath}: version is missing or not semver`);
      continue;
    }

    const baseText = gitOrNull("show", `${mergeBase}:${manifestPath}`);
    if (baseText === null) {
      console.log(`  ${name}: new plugin (${touched.length} file(s)) — no bump required`);
      continue;
    }

    const base = parseVersion(readJson(baseText)?.["version"]);
    if (base === null) {
      console.log(`  ${name}: base version unreadable — skipping`);
      continue;
    }

    const baseStr = `${base.major}.${base.minor}.${base.patch}`;
    const currentStr = `${current.major}.${current.minor}.${current.patch}`;
    const delta = compareVersions(current, base);

    if (delta > 0) {
      console.log(`  ${name}: ${baseStr} -> ${currentStr} (${touched.length} file(s) changed)`);
    } else {
      const verb = delta === 0 ? "was not bumped" : "went backwards";
      errors.push(
        `${name}: ${touched.length} file(s) changed but the version ${verb} ` +
          `(${baseStr} -> ${currentStr}). Bump 'version' in ${manifestPath}.\n` +
          touched.map((f) => `      ${f}`).join("\n"),
      );
    }

    // the marketplace entry has to agree, or installs resolve a stale version
    const entryVersion = parseVersion(record["version"]);
    if (entryVersion !== null && compareVersions(entryVersion, current) !== 0) {
      errors.push(
        `${name}: marketplace.json says ` +
          `${entryVersion.major}.${entryVersion.minor}.${entryVersion.patch} but ` +
          `${manifestPath} says ${currentStr}. Update both together.`,
      );
    }
  }

  console.log();
  for (const e of errors) console.log(`error: ${e}`);
  if (errors.length > 0) {
    console.log(`\nFAILED — ${errors.length} error(s)`);
    return 1;
  }
  console.log("OK — every changed plugin has a version bump");
  return 0;
}

process.exit(main());
