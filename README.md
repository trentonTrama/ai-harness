# ai-harness

A [Claude Code](https://claude.com/claude-code) plugin marketplace — an AI-guided
workspace with subagents and customizable skills.

## Install

Add the marketplace, then install the plugins you want:

```
/plugin marketplace add trentonTrama/ai-harness
/plugin install procedural-guide-style@ai-harness
```

Or from a local clone:

```
/plugin marketplace add /path/to/ai-harness
```

## Plugins

| Plugin | What it does |
| --- | --- |
| `procedural-guide-style` | Writes and revises procedural guides, runbooks, SOPs, and technical walkthroughs in a plain-language field-guide voice. |

## Layout

```
.claude-plugin/marketplace.json     marketplace manifest — lists every plugin
plugins/<name>/
  .claude-plugin/plugin.json        plugin manifest
  skills/<skill-name>/SKILL.md      skill definition + frontmatter
  skills/<skill-name>/references/   supporting material loaded on demand
scripts/validate-marketplace.ts     local + CI validation (TypeScript)
```

## Adding a plugin

1. Create `plugins/<name>/.claude-plugin/plugin.json` with `name`, `description`,
   and a semver `version`.
2. Add components under `skills/`, `commands/`, `agents/`, or `hooks/`.
   A skill lives at `skills/<skill-name>/SKILL.md` and its frontmatter `name`
   must match the directory name.
3. Register it in the `plugins` array of `.claude-plugin/marketplace.json`.
4. Run `npm run check`.

## Validating

The validator is TypeScript, run with [tsx](https://tsx.is). Install once:

```bash
npm install
```

Then typecheck and validate:

```bash
npm run check
```

The Claude Code CLI has its own manifest check, which CI runs as well:

```bash
claude plugin validate .
```

All of it runs on every push and pull request via
[`.github/workflows/validate.yml`](.github/workflows/validate.yml), alongside
markdown and frontmatter linting in
[`.github/workflows/lint.yml`](.github/workflows/lint.yml).
