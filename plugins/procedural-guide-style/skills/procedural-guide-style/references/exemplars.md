# Annotated Exemplars

Five reference documents across different domains, each annotated with the rules it demonstrates. Read the document first, then the annotation.

**Contents**
1. Location Scouting Pipeline — phased, terminal table, local instantiation
2. Espresso Dial-In — phased with gating, both-ends diagnostics
3. Production Incident Triage — phased, inline constraints, no table
4. Sourdough Starter Revival — flat list, no headers *(closest to ideal form)*
5. Contributing to a Style Skill — flat list with a terminal table, self-referential
6. Failure gallery — the same content written wrong

---

## 1. Location Scouting Pipeline

The scouting pipeline breaks down into three distinct operational phases: discovery, validation, and field execution.

**Phase 1: Desk Scouting**

Start with geospatial data to locate off-grid rural decay, abandoned structures, and atmospheric sinks before checking ground-level aesthetics.

* Use Google Earth Pro on desktop. The historical imagery slider shows overgrown structures, torn-down buildings, and structural changes over decades.
* Correlate contour lines and river valleys using CalTopo or Gaia GPS to locate morning fog sinks. Look for clear nights, high humidity, light wind, and dropping temperatures.
* Cross-reference lightpollutionmap.info with Clear Outside to validate dark sky conditions through multi-tier cloud layering.
* Map sun and moon azimuths with PhotoPills or Sun Surveyor to verify if a structure's orientation aligns with your intended lighting.
* Check Flickr and Instagram geotags for standard compositions, then intentionally target the gaps in coverage.

**Phase 2: Access and Ownership Validation**

* Use GIS parcel viewers to find the exact right-of-way, zoning, and historic aerial layers.
* Look for assessed improvement values near zero on parcels with visible structures. This strongly indicates derelict or abandoned buildings.
* Tax records will identify the legal owner, mailing address, and recent sale dates.
* Note any mismatched mailing and property addresses, which usually indicates an absentee owner or vacant property.

For local Wake County research, all 100 NC counties utilize a 10-digit, grid-derived PIN.

* iMaps (Raleigh/Wake GIS) provides geographic boundary data at `https://maps.raleighnc.gov/imaps/?pin=[10-digit-PIN]`
* The Real Estate Search holds the ownership record via an internal REID (Real Estate ID) at `https://services.wake.gov/realestate/Account.asp?id=[REID]`

**Phase 3: Site Walk**

Execute site visits mid-day without the intent to shoot final frames. The objective is structural analysis and constraint mapping.

* Shoot phone reference frames to map foreground depth and check sightlines for wide-angle hyperfocal distance calculations at f/5.6 or f/8.
* Document parking availability, walking distance, rural cell coverage gaps, and line-of-sight obstructions that dictate where to stage tripod setups or red wash lighting.
* Avoid active rail corridors, which are strictly private and hazardous.
* Send a short letter to the absentee address for private rural parcels. Proactive permission often yields better access than trespassing.

**Obsidian Tracker Schema**

| Property | Data Type | Description |
| --- | --- | --- |
| **Name** | Text | Location identifier or primary structure |
| **Map Link** | URL | Direct link to parcel or coordinates |
| **Subject** | Categorical | Rural Decay, Industrial, Astro, Nature |
| **Access** | Status | Public, Permission Needed, Private, Unknown |
| **Optimal Light** | Text | Front-lit, Back-lit, Astro, Sunrise/Sunset |
| **Seasonality** | Text | Best time of year (e.g., winter for bare trees) |
| **Status** | State | Pending Scout, Walked, Shot, Dead End |
| **Reference** | Asset | Attached phone snaps and focal length notes |
| **Priority** | 1-5 | Return value based on composition strength |

**Annotation**

- Rule 1 (shape opening): names three phases in one sentence, no preamble beyond that.
- Rule 4 (conditional preamble): Phases 1 and 3 get an objective line; Phase 2 does not, because its bullets are self-evident. This asymmetry is correct and deliberate.
- Rule 6 (local instantiation): general parcel-viewer method first, then the Wake County carve-out with backticked URL templates and bracketed tokens.
- Rule 9 (inference second sentence): `assessed improvement values near zero... This strongly indicates derelict or abandoned buildings.` The second sentence draws a conclusion the reader would not otherwise make.
- Rule 11 (inline constraints): the rail corridor warning is bullet four of Phase 3, not a callout.
- Rule 5 (no outro): document ends on the table.

---

## 2. Espresso Dial-In

Dialing in a new coffee runs three passes: baseline shot, ratio correction, then grind correction.

**Pass 1: Baseline**

Pull one shot at known-good settings before changing anything. The objective is a reference point, not a drinkable shot.

* Set the grinder to your last working position and dose 18g into a 20g VST basket.
* Pull to 36g output and record the shot time from first drip, not from pump start.
* Weigh the spent puck after knocking out. A puck above 22g indicates retained water and a channeling problem upstream of grind.

**Pass 2: Ratio**

* Keep the grind setting the same and adjust only the output weight, in 2g steps, to land between 1:2 and 1:2.5.
* Taste for sourness at the front of the palate, which usually indicates underextraction. Bitterness with a dry, lingering finish indicates the opposite — you have gone too far and should shorten the pull.
* Stop adjusting the ratio once flavor separation is audible in the cup. Grind handles the rest.

**Pass 3: Grind**

* Move the burr one detent finer and repeat Pass 1 without changing the dose.
* Target 25–30 seconds to 36g for a medium roast, 28–34 for a light roast.
* Watch the flow at the spout. A shot that gushes within 8 seconds is too coarse; one that drips past 15 seconds without a stream is too fine.
* Avoid changing the dose and the grind in the same pull. You lose the variable isolation that makes the next shot readable.

| Variable | Range | Effect |
| --- | --- | --- |
| Dose | 17–19g | Bed depth, headspace |
| Ratio | 1:2 – 1:2.5 | Concentration, body |
| Grind | Detent ±1 | Resistance, shot time |
| Temp | 92–96°C | Acidity vs. bitterness |

**Annotation**

- Rule 2 (headers justified): each pass consumes the output of the previous one, so the gating is real. Headers earn their place here.
- Rule 10 (both ends): the sourness bullet and the flow bullet each name both failure directions. This is the rule most often missed on a first draft.
- Rule 12 (plain verbs): `Keep the grind setting the same`, not `Hold grind constant`. The nouns stay technical (*VST basket, detent, bed depth*).
- Rule 13 (articles): `adjust only the output weight`, `without changing the dose`, `Stop adjusting the ratio`.
- Rule 16 (specific numbers): every threshold is a figure — 22g, 8 seconds, 25–30 seconds.

---

## 3. Production Incident Triage

Triage separates into three questions answered in order: what is broken, what changed, and what is the fastest safe reversal.

**Establish Blast Radius**

* Pull the error rate and p99 latency from the service dashboard before reading any logs.
* Check whether the degradation is regional or global using the load balancer's per-zone view.
* Confirm whether synthetic checks are failing alongside real traffic. Synthetics passing while real traffic fails usually indicates an auth or data-dependent path; both failing together points to infrastructure.

**Correlate Change**

* Query the deploy log for anything shipped inside the 90 minutes preceding first alert.
* Include config flags and feature toggles, not just code deploys. Flag flips are the most common cause and the least visible in deploy history.
* Check upstream vendor status pages before assuming the change is yours.

**Reverse**

* Roll back the most recent change first even when causation is unproven. Confirming the hypothesis costs more than the rollback.
* Avoid database migrations as a rollback target. Forward-fix instead.
* Post the timeline in the incident channel as you go, not at resolution.

**Annotation**

- Rule 1 (shape opening): three questions, stated in execution order.
- Rule 4: no preamble under any header — the bullets carry themselves. Compare against Exemplar 1, where two of three phases needed one.
- Rule 10 (both ends): the synthetics bullet splits both outcomes of the same check.
- Rule 11: `Avoid database migrations as a rollback target` sits inline, no warning styling.
- Rule 17 does not apply — there is no schema, so there is no table. Do not manufacture one.

---

## 4. Sourdough Starter Revival

*This is the closest to the target form. When unsure how to structure something, default toward this shape.*

A neglected starter is usually dormant rather than dead. Revival takes three to five days of consistent feeding before you can judge it.

* Discard everything except 20g of starter, including the dark hooch layer on top.
* Feed at 1:5:5 by weight using filtered water at 26°C and unbleached bread flour.
* Hold the temperature between 24–27°C between feedings. A proofing box or an oven with the light on both work.
* Feed once every 24 hours for the first two days, then twice daily once you see any rise.
* Watch for a doubling window under 8 hours. That is the threshold for leavening capability, not the presence of bubbles.
* Add 10% whole rye to a stalled feeding. Rye carries more wild yeast and enzyme activity than white flour.
* Discard the starter only after five days of twice-daily feeding with no rise. Surface mold in pink or orange is the one condition that ends revival immediately.

**Annotation**

- Rule 2 (flat by default): the steps are sequential but nothing gates anything. No headers. This is the default form and it is the preferred one.
- Rule 1 (threshold opening): states the judgment window before any instruction.
- Rule 9: four of seven bullets carry an inference sentence; three do not. Inference sentences appear where needed, not on a schedule.
- Rule 5: ends on the last bullet, mid-procedure, with no wrap-up.

---

## 5. Contributing to a Style Skill

*Excerpted from the plugin's CLAUDE.md; that file is the live document. This shows the one structural combination the exemplars above do not cover — a flat list that still ends in a table.*

A rule that cannot be demonstrated is not ready to add, so the exemplar comes before the wording.

* Check whether a conflict is real before resolving it. A rule that narrows *when* another rule applies does not contradict it.
* Allow an override only when both conditions hold: one document can obey both rules at once, and the new rule names a document class. Failing either condition means you amend the existing rule instead of adding beside it.
* Name the overridden rule inside the text of the override — `overrides rule 2 for runbooks`. Precedence that is only implied usually gets read as a contradiction.
* Edit the superseded rule in place when you amend it. Two rules that disagree with no stated precedence leave the reader guessing which one wins.
* Treat `Runbooks always use phase headers` as an override of rule 2. A runbook obeys both — flat stays the default and runbooks are the named exception.
* Treat `A second sentence may carry a fallback command` as an amendment to rule 9. No bullet carries inference only and a command at the same time, so rule 9 gets edited rather than joined.

| Change | Exemplar | Conflict check | This file |
| --- | --- | --- | --- |
| **New rule** | Required | Required | Only if the excerpt breaks |
| **Amendment** | Update the existing passage | Not needed | Only if the excerpt breaks |
| **Scoped override** | Required | Must name the rule it bends | Only if the excerpt breaks |
| **Deletion** | Remove the annotations | Not needed | Only if the excerpt breaks |

**Annotation**

- Rule 2 (flat by default): the steps are ordered but nothing gates anything — you can check a conflict without having written an exemplar first. No headers.
- Rule 17 (terminal table): the first exemplar here that combines a flat list with a table. The table is a parameter set, not a summary of the bullets, and the document ends on it.
- Rule 1 (threshold opening): names what gates the work — the exemplar precedes the wording — rather than describing the phases ahead.
- Rule 10 (both ends): the two worked cases bracket the decision. One resolves to an override, the other to an amendment, so the reader can find the boundary rather than seeing one side of it.
- Rule 9: the second sentence on each worked case carries the verdict's reasoning, never a restatement of the case.

---

## 6. Failure Gallery

The same content, written wrong. Each pair shows the default LLM instinct and the correction.

**Opening as a rhetorical claim (rule 1)**

- Wrong: `Title problems kill a deal faster than mechanical ones.`
- Right: `Most disqualifying findings are in the title history, so the records pass comes first.`

**Bolded category lead-in (rule 7)**

- Wrong: `* **Google Earth Pro:** This desktop tool lets you view historical imagery.`
- Right: `* Use Google Earth Pro on desktop. The historical imagery slider shows structural changes over decades.`

**Second sentence as elaboration (rule 9)**

- Wrong: `Weigh the spent puck after knocking out. This is an important step that gives you useful information about your shot.`
- Right: `Weigh the spent puck after knocking out. A puck above 22g indicates retained water and a channeling problem upstream of grind.`

**One-ended diagnostic (rule 10)**

- Wrong: `Taste for sourness, which indicates underextraction.`
- Right: `Taste for sourness at the front of the palate, which usually indicates underextraction. Bitterness with a dry, lingering finish indicates the opposite.`

**Lab register in the verbs (rule 12)**

- Wrong: `Hold grind constant and adjust output in 2g increments.`
- Right: `Keep the grind setting the same and adjust only the output weight, in 2g steps.`

**Dropped article on a specific singular (rule 13)**

- Wrong: `Pull error rate and p99 latency from service dashboard.`
- Right: `Pull the error rate and p99 latency from the service dashboard.`

**Uncalibrated hedging (rule 14)**

- Wrong: `This might possibly suggest that the property could be abandoned.`
- Right: `This strongly indicates derelict or abandoned buildings.`

**Constraint as a callout (rule 11)**

- Wrong: `> ⚠️ **WARNING:** Never enter active rail corridors!`
- Right: `* Avoid active rail corridors, which are strictly private and hazardous.`

**Closing summary (rule 5)**

- Wrong: `With your locations validated and your schema in place, you're ready to start shooting. Happy scouting!`
- Right: *(nothing — the table was the end of the document)*
