#!/usr/bin/env python3
"""Validate this repo as a Claude Code plugin marketplace.

Checks:
  - .claude-plugin/marketplace.json exists, is valid JSON, has required fields
  - every plugin entry resolves to a real directory with a valid plugin.json
  - plugin names are unique, kebab-case, and match their manifest
  - every skill has a SKILL.md with `name` and `description` frontmatter
  - skill directory names match the skill's declared name
  - referenced component dirs (commands/agents/hooks) contain the right files

Exit code 0 = clean, 1 = one or more errors.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NAME_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
SEMVER_RE = re.compile(r"^\d+\.\d+\.\d+(?:[-+].*)?$")

errors: list[str] = []
warnings: list[str] = []


def error(msg: str) -> None:
    errors.append(msg)


def warn(msg: str) -> None:
    warnings.append(msg)


def load_json(path: Path) -> dict | None:
    try:
        with path.open(encoding="utf-8") as fh:
            data = json.load(fh)
    except FileNotFoundError:
        error(f"{rel(path)}: file not found")
        return None
    except json.JSONDecodeError as exc:
        error(f"{rel(path)}: invalid JSON ({exc})")
        return None
    if not isinstance(data, dict):
        error(f"{rel(path)}: top level must be a JSON object")
        return None
    return data


def rel(path: Path) -> str:
    try:
        return str(path.relative_to(ROOT))
    except ValueError:
        return str(path)


def parse_frontmatter(path: Path) -> dict[str, str] | None:
    """Parse the leading `---` YAML block. Only scalar `key: value` pairs are needed."""
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        error(f"{rel(path)}: missing YAML frontmatter (file must start with '---')")
        return None
    parts = text.split("---", 2)
    if len(parts) < 3:
        error(f"{rel(path)}: frontmatter block is not closed with '---'")
        return None

    fields: dict[str, str] = {}
    key: str | None = None
    for line in parts[1].splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if line[:1].isspace() and key:  # folded continuation
            fields[key] += " " + line.strip()
            continue
        if ":" not in line:
            error(f"{rel(path)}: unparseable frontmatter line: {line!r}")
            return None
        key, value = line.split(":", 1)
        key = key.strip()
        fields[key] = value.strip().strip("'\"")
    return fields


def validate_skill(skill_dir: Path, plugin_name: str) -> None:
    skill_md = skill_dir / "SKILL.md"
    if not skill_md.is_file():
        error(f"{rel(skill_dir)}: skill directory has no SKILL.md")
        return

    fields = parse_frontmatter(skill_md)
    if fields is None:
        return

    name = fields.get("name")
    description = fields.get("description")

    if not name:
        error(f"{rel(skill_md)}: frontmatter is missing required field 'name'")
    else:
        if not NAME_RE.match(name):
            error(f"{rel(skill_md)}: skill name {name!r} must be kebab-case")
        if name != skill_dir.name:
            error(
                f"{rel(skill_md)}: skill name {name!r} does not match "
                f"directory name {skill_dir.name!r}"
            )

    if not description:
        error(f"{rel(skill_md)}: frontmatter is missing required field 'description'")
    elif len(description) > 1024:
        warn(f"{rel(skill_md)}: description is {len(description)} chars; keep it under 1024")

    print(f"    skill: {skill_dir.name} ({plugin_name})")


def validate_plugin(entry: dict, index: int, seen: set[str]) -> None:
    label = f"marketplace.json plugins[{index}]"

    name = entry.get("name")
    if not isinstance(name, str) or not name:
        error(f"{label}: missing required field 'name'")
        return
    if not NAME_RE.match(name):
        error(f"{label}: plugin name {name!r} must be kebab-case")
    if name in seen:
        error(f"{label}: duplicate plugin name {name!r}")
    seen.add(name)

    if not entry.get("description"):
        error(f"{label} ({name}): missing required field 'description'")

    source = entry.get("source")
    if not source:
        error(f"{label} ({name}): missing required field 'source'")
        return
    if not isinstance(source, str):
        # object sources (git/github) point outside this repo; nothing local to check
        print(f"  plugin: {name} (external source, skipped)")
        return

    plugin_dir = (ROOT / source).resolve()
    if not plugin_dir.is_dir():
        error(f"{label} ({name}): source {source!r} is not a directory")
        return

    print(f"  plugin: {name} -> {source}")

    manifest_path = plugin_dir / ".claude-plugin" / "plugin.json"
    manifest = load_json(manifest_path)
    if manifest is not None:
        if manifest.get("name") != name:
            error(
                f"{rel(manifest_path)}: name {manifest.get('name')!r} does not match "
                f"marketplace entry {name!r}"
            )
        if not manifest.get("description"):
            error(f"{rel(manifest_path)}: missing required field 'description'")
        version = manifest.get("version")
        if version and not SEMVER_RE.match(str(version)):
            error(f"{rel(manifest_path)}: version {version!r} is not semver")

    version = entry.get("version")
    if version and not SEMVER_RE.match(str(version)):
        error(f"{label} ({name}): version {version!r} is not semver")

    skills_dir = plugin_dir / "skills"
    if skills_dir.is_dir():
        skill_dirs = sorted(d for d in skills_dir.iterdir() if d.is_dir())
        if not skill_dirs:
            warn(f"{rel(skills_dir)}: directory exists but contains no skills")
        for skill_dir in skill_dirs:
            validate_skill(skill_dir, name)
        stray = [f for f in skills_dir.iterdir() if f.is_file() and f.name == "SKILL.md"]
        if stray:
            error(
                f"{rel(skills_dir)}: SKILL.md must live in a named subdirectory, "
                "not directly under skills/"
            )

    commands_dir = plugin_dir / "commands"
    if commands_dir.is_dir() and not list(commands_dir.rglob("*.md")):
        warn(f"{rel(commands_dir)}: directory exists but contains no .md commands")

    agents_dir = plugin_dir / "agents"
    if agents_dir.is_dir():
        for agent_md in sorted(agents_dir.rglob("*.md")):
            fields = parse_frontmatter(agent_md)
            if fields is None:
                continue
            for required in ("name", "description"):
                if not fields.get(required):
                    error(f"{rel(agent_md)}: frontmatter is missing '{required}'")

    hooks_path = plugin_dir / "hooks" / "hooks.json"
    if hooks_path.exists():
        load_json(hooks_path)

    if not any(
        (plugin_dir / d).is_dir() for d in ("skills", "commands", "agents", "hooks")
    ):
        warn(f"{rel(plugin_dir)}: plugin has no skills, commands, agents, or hooks")


def main() -> int:
    marketplace_path = ROOT / ".claude-plugin" / "marketplace.json"
    print(f"Validating marketplace: {rel(marketplace_path)}")

    marketplace = load_json(marketplace_path)
    if marketplace is None:
        report()
        return 1

    name = marketplace.get("name")
    if not isinstance(name, str) or not name:
        error("marketplace.json: missing required field 'name'")
    elif not NAME_RE.match(name):
        error(f"marketplace.json: name {name!r} must be kebab-case")

    owner = marketplace.get("owner")
    if not isinstance(owner, dict) or not owner.get("name"):
        error("marketplace.json: 'owner' must be an object with a 'name'")

    plugins = marketplace.get("plugins")
    if not isinstance(plugins, list) or not plugins:
        error("marketplace.json: 'plugins' must be a non-empty array")
        report()
        return 1

    seen: set[str] = set()
    for index, entry in enumerate(plugins):
        if not isinstance(entry, dict):
            error(f"marketplace.json plugins[{index}]: entry must be an object")
            continue
        validate_plugin(entry, index, seen)

    report()
    return 1 if errors else 0


def report() -> None:
    print()
    for w in warnings:
        print(f"warning: {w}")
    for e in errors:
        print(f"error: {e}")
    print()
    if errors:
        print(f"FAILED — {len(errors)} error(s), {len(warnings)} warning(s)")
    else:
        print(f"OK — 0 errors, {len(warnings)} warning(s)")


if __name__ == "__main__":
    sys.exit(main())
