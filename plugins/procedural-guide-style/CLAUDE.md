# Contributing to a Style Skill

A rule that cannot be demonstrated is not ready to add, so the exemplar comes before the wording.

* Write the exemplar passage first, word the rule from it, and ship both in the same change. A rule you cannot show working in `skills/procedural-guide-style/references/exemplars.md` is still too abstract to enforce.
* Generate concrete candidate examples and put them to the user before wording a rule change. A rule that reads clearly in the abstract usually hides a boundary case that only surfaces once someone has to classify a real document with it.
* Show at least two candidates that land on opposite verdicts — one that amends, one that overrides. A single example teaches the verdict but not the boundary, and the boundary is the part that gets applied wrongly.
* Check whether a conflict is real before resolving it. A rule that narrows *when* another rule applies does not contradict it.
* Allow an override only when both conditions hold: one document can obey both rules at once, and the new rule names a document class. Failing either condition means you amend the existing rule instead of adding beside it.
* Name the overridden rule inside the text of the override — `overrides rule 2 for runbooks`. Precedence that is only implied usually gets read as a contradiction.
* Edit the superseded rule in place when you amend it. Two rules that disagree with no stated precedence leave the reader guessing which one wins.
* Treat `Runbooks always use phase headers` as an override of rule 2. A runbook obeys both — flat stays the default and runbooks are the named exception.
* Treat `A second sentence may carry a fallback command` as an amendment to rule 9. No bullet carries inference only and a command at the same time, so rule 9 gets edited rather than joined.
* Treat `Runbooks end with a rollback section` as an override of rule 5, named in its own text. An override can bend a ban the same way it bends a default.
* Update the annotations whenever rule numbers shift. Exemplar annotations and the failure gallery both cite rules by number, and a renumbering silently breaks every citation.
* Revise this file when a change breaks its excerpt in exemplar 5. This document is itself an exemplar, so a rule that makes its prose non-conforming makes the exemplar wrong.

| Change | Exemplar | Conflict check | This file |
| --- | --- | --- | --- |
| **New rule** | Required | Required | Only if the excerpt breaks |
| **Amendment** | Update the existing passage | Not needed | Only if the excerpt breaks |
| **Scoped override** | Required | Must name the rule it bends | Only if the excerpt breaks |
| **Deletion** | Remove the annotations | Not needed | Only if the excerpt breaks |
