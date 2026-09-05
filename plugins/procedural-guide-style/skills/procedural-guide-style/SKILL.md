---
name: procedural-guide-style
description: Write or revise procedural guides, how-to documents, field guides, workflows, runbooks, SOPs, and technical walkthroughs in the user's personal documentation voice — plain-language phases, verb-first bullets, hyper-specific technical nouns, and Markdown schema tables. Use this skill whenever the user asks for a guide, a process writeup, a checklist, a workflow, a runbook, "how do I do X" documentation, or asks to review, edit, or restyle an existing procedural document. Also use it when the user is drafting notes that describe a repeatable process, even if they don't call it a guide. Do NOT use it for conversational replies, emails, Slack messages, or strategic prose — that is a different voice.
---

# Procedural Guide Style

This skill encodes one specific register: **the procedural field guide.** It is not the user's conversational voice or their strategic-writing voice. It applies when the deliverable is a document that tells someone how to execute a repeatable process.

The governing instinct behind every rule below: the reader is a competent practitioner who wants the procedure and nothing else. No warm-up, no persuasion, no send-off.

---

## The Ruleset

### Structure

**1. Open by naming the shape or the threshold of the work.** One declarative sentence, then straight into the content. Two valid openings:

- *Shape* — states the phases ahead: `Triage separates into three questions answered in order: what is broken, what changed, and what is the fastest safe reversal.`
- *Threshold* — states what gates what, and why order matters: `Most disqualifying findings are in the title history, so the records pass comes first.`

Never open with a rhetorical claim or a ranking (`Title problems kill a deal faster than mechanical ones` fails — it argues instead of orienting). Never open with context-setting, stakes, or a hook.

**2. Flat bullet list is the default. Phase headers are the exception.** Add headers only when the phases genuinely gate each other — when you cannot start phase 2 until phase 1 produces something. A feeding schedule, an inspection sweep, or any sequence of independent steps stays as one flat list. When in doubt, go flat.

**3. Phase headers are bolded, named, and optionally numbered.** `**Pass 2: Ratio**` or `**Correlate Change**`. Numbering is for strictly ordinal work; bare names are fine otherwise.

**4. Phase preambles are conditional.** A one-line objective sentence under a header only when the phase needs a stated *why* or the bullets would otherwise be ambiguous. Omit it when the bullets speak for themselves. Do not add a preamble to every phase for symmetry.

**5. No transitions, no summary, no outro.** Sections butt directly against each other. The document ends on its last bullet or its table. Never write "Now that you've validated access..." or "With these steps complete, you're ready to..." or any closing paragraph.

**6. General method first, then local instantiation.** When a procedure has a universal form and a region-, tool-, or org-specific version, give the universal method, then break out the specific case with real URL patterns in backticks and bracketed placeholder tokens: `https://example.gov/lookup?pin=[10-digit-PIN]`.

### Bullets

**7. Verb-first or subject-first. No bolded category lead-ins.** Write `* Use Google Earth Pro on desktop.` — never `* **Google Earth Pro:** Use this to...`. Declarative subject-first is fine when stating a fact rather than an action: `Tax records will identify the legal owner.`

**8. Tool → action → outcome.** When a bullet names a tool, it names what the tool is for. No tool without a job, no job without a method.

**9. A second sentence carries inference only.** Add one when there is a non-obvious conclusion the reader should draw from the result — `A puck above 22g indicates retained water and a channeling problem upstream of grind.` Never add a second sentence to elaborate, restate, or soften.

**10. Bracket both failure modes on any diagnostic signal.** A bullet that names one direction of failure is incomplete — the reader cannot find the middle from one end. Whenever a bullet describes a taste, reading, symptom, or measurement that indicates a problem, name the opposite condition too.

> Taste for sourness at the front of the palate, which usually indicates underextraction. Bitterness with a dry finish indicates the opposite — pull shorter or grind coarser.

**11. Constraints are ordinary bullets.** Safety notes, hard limits, and things to avoid sit inline in the list at the point they become relevant. No callout blocks, no warning icons, no bolded `WARNING`, no separate "Cautions" section.

### Language

**12. Technical nouns, plain verbs.** Terminology stays hyper-specific to the domain — *p99 latency, hyperfocal distance, azimuth, transfer case, REID.* The verbs and connective tissue around those nouns stay conversational. `Hold grind constant` is lab register; write `Keep the grind setting the same` instead. Precision lives in the nouns, not in stiff phrasing.

**13. Keep articles on specific singular nouns.** Compression happens at the sentence level, never the article level. `adjust the output weight`, not `adjust output weight`. `Pull the error rate and p99 latency`, not `Pull error rate`. Bare plurals and mass nouns are fine as-is: `Check Flickr and Instagram geotags`, `Start with geospatial data`.

**14. Hedge on a calibrated scale.** Use *strongly indicates, usually indicates, often yields, generally.* Inferences are graded by confidence — never stated as certainties, never hedged into mush.

**15. Expand an acronym once, then run it bare.** `REID (Real Estate ID)` on first use, `REID` thereafter. Domain terms that are not acronyms get no definition at all — assume fluency.

**16. Numbers are specific.** `f/5.6 or f/8`, `25–30 seconds`, `the 90 minutes preceding first alert`, `1:2 to 1:2.5`. No "a few," no "several," no vague ranges.

### Tables

**17. Schemas and parameter sets go in standard Markdown tables, placed last.** No conversational padding above or below. Property names bolded, descriptions as noun phrases without terminal periods, data types as single words or constrained sets.

| Property | Data Type | Description |
| --- | --- | --- |
| **Name** | Text | Location identifier or primary structure |
| **Access** | Status | Public, Permission Needed, Private, Unknown |
| **Priority** | 1-5 | Return value based on composition strength |

Bold marks structure only — headers and table keys. Never a bullet label.

---

## Banned Moves

These appear in default LLM documentation prose and must not appear here:

- Marketing hype, dramatic hooks, forced metaphors
- "In today's world," "It's worth noting," "Remember that"
- Bolded lead-in labels on bullets
- Emoji, callout boxes, horizontal-rule decoration between every section
- Closing encouragement of any kind
- Restating in a summary what the bullets already said
- Defining domain terms the reader obviously knows
- Symmetry for its own sake — equal-length phases, a preamble under every header, a fixed bullet count per section

---

## Working Process

When **writing new**: pick the opening type (shape or threshold), decide flat vs. phased using rule 2, draft the bullets, then run the revision checklist.

When **revising an existing draft**: read `references/revision-checklist.md` and pass over the draft rule by rule. Report what you changed rather than silently rewriting.

Read `references/exemplars.md` for four annotated reference documents across different domains. Consult it when you need to see how a rule behaves in practice, particularly rules 1, 2, 9, and 10 — those are the ones most often applied wrongly from the description alone.
