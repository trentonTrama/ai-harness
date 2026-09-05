# Working in this repo

This repo is a Claude Code plugin marketplace: a manifest at `.claude-plugin/marketplace.json` and one directory per plugin under `plugins/`. Every change is validated by `npm run check` and by CI, so the fastest path is to make the change and run the validator rather than reasoning about the schema.

## Layout

```
.claude-plugin/marketplace.json     lists every plugin — name, source, description, version
plugins/<name>/
  .claude-plugin/plugin.json        the plugin's own manifest
  CLAUDE.md                         how to change that plugin, when it has editorial rules
  skills/<skill-name>/SKILL.md      the skill, with `name` and `description` frontmatter
  skills/<skill-name>/references/   material the skill loads on demand
scripts/validate-marketplace.ts     manifest and skill validation
scripts/check-version-bump.ts       requires a version bump when a plugin changes
```

## Versioning

Every plugin carries its version in two places, and they must agree: `plugins/<name>/.claude-plugin/plugin.json` and the plugin's entry in `.claude-plugin/marketplace.json`. An install resolves the marketplace entry, so a disagreement ships a version that does not exist.

Bump the version in both files whenever you change any file under `plugins/<name>/`. CI enforces this on pull requests — `check-version-bump.ts` diffs against the base branch and fails if a plugin's files moved without its version moving. A plugin that did not exist on the base branch is new, so no bump is required for the pull request that introduces it.

Use semver against the plugin's consumers: patch for a wording fix, minor for a new rule or reference file, major for a change that makes existing usage wrong.

## Adding a plugin

1. Create `plugins/<name>/.claude-plugin/plugin.json` with `name`, `description`, and a semver `version`.
2. Add components under `skills/`, `commands/`, `agents/`, or `hooks/`. A skill lives at `skills/<skill-name>/SKILL.md`, and its frontmatter `name` must match its directory name — the validator fails on a mismatch.
3. Register it in the `plugins` array of `.claude-plugin/marketplace.json` with a `./plugins/<name>` source and the same version as `plugin.json`.
4. Run `npm run check`.

## Changing a plugin's content

Some plugins carry their own `CLAUDE.md` with rules about how their content may change — `plugins/procedural-guide-style/CLAUDE.md` governs that skill's ruleset. Read it before editing that plugin. A plugin-level `CLAUDE.md` takes precedence over this file for anything inside that plugin.

## Validating

```bash
npm run check
```

That runs three things: `tsc --noEmit` over the scripts, the marketplace validator, and the version-bump check. The version-bump check compares against `origin/main` by default; override it with `BASE_REF=<ref>` when you are working off a different base.

```bash
claude plugin validate .
```

The Claude Code CLI has its own manifest check. CI runs both, plus a JSON syntax sweep and markdown linting. The markdown lint validates relative links under `plugins/` and rejects trailing whitespace, so a link to a file that does not exist fails the build — paths named in backticks are not checked, and have to be verified by hand.
