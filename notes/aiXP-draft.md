# aiXP: Extreme Programming for Human-AI Teams of 1 to N

*Working draft - brainstorm stage*

## Premise

Extreme Programming was built on one bet: **tight feedback loops beat upfront certainty.** That bet gets stronger with AI-assisted development, not weaker - loops that took hours now take minutes. But XP's specific practices were calibrated for a world where *writing code was the expensive step*. AI inverts that: writing code is now nearly free, which means the practices built to manage the cost of writing code need to be re-aimed at managing the cost of **verifying, bounding, and integrating** code instead.

aiXP is not "XP with a chatbot." It's what XP's own logic demands once the cost structure of software changes.

*A note on intent:* a recurring thread in developing this has been how few working engineers seem to have a coherent model of practices like regression suite maintenance, tiered release strategy, or versioning discipline - not because these are obscure, but because they're rarely taught as a connected system, and AI tooling is what now makes running that full system affordable at small scale. Part of the goal here isn't just documenting one practitioner's method - it's making practices that used to require org-scale headcount teachable to individuals and small teams who now have the tooling to actually run them.

---

## Contents

- [Part 1 - XP Practices Carried Over, Modified](#part-1--xp-practices-carried-over-modified)
- [Part 2 - New Practices, Native to aiXP](#part-2--new-practices-native-to-aixp)
- [Part 3 - DevOps/SRE Practices Adopted into aiXP](#part-3--devopssre-practices-adopted-into-aixp)
- [Part 4 - Testing Tiers & Strategy: A Primer for aiXP](#part-4--testing-tiers--strategy-a-primer-for-aixp)
- [Part 5 - Versioning & Release Identity: A Primer for aiXP](#part-5--versioning--release-identity-a-primer-for-aixp)
- [Part 6 - Comparison: aiXP vs. the AI-Native SDLC](#part-6--comparison-aixp-vs-the-ai-native-sdlc)
- [Open Questions / Still Brainstorming](#open-questions--still-brainstorming)
- [Appendix - The Original 12 XP Practices](#appendix--the-original-12-xp-practices-reference)
- [Bibliography / References for Further Study](#bibliography--references-for-further-study)

---

## Part 1 - XP Practices Carried Over, Modified

| Practice | Classic XP | aiXP modification | Why it changed |
|---|---|---|---|
| **Pairing** | Two humans, driver + navigator, shared mental model, roughly symmetric skill | Asymmetric: AI drives (generates), human navigates - but navigation shifts from "catch the next line" to "catch architectural drift and intent mismatch." Requires a distinct skill and checklist, not just old pairing with a new partner. | AI outpaces human line-by-line review; the bottleneck moves from typing speed to judgment speed. |
| **Refactoring** | Continuous, but effortful - "simplest thing that could work" is rational because gold-plating is costly | Refactoring is now cheap in effort but risky in scope - the danger is unrequested refactors slipping through. Practice shifts from *encouraging* refactoring to *bounding* it: diff review explicitly screens for scope creep, not just correctness. | Effort is no longer the constraint; unreviewed change volume is. |
| **Sustainable pace** | Protects against human fatigue from overwork | Protects against **vigilance fatigue** - the risk of rubber-stamping the 40th diff of the day. Session limits become a core practice, not a nice-to-have; token-burn-as-productivity-metric is explicitly rejected. | The AI doesn't tire, but the human's review quality degrades with volume exactly the way coding quality used to degrade with hours. |
| **On-site customer** | A domain expert, physically present, cheaply queryable, defines priority and acceptance | Replaced by **spec-first prompting + domain gap surfacing** (see Part 2) - a manufactured, asynchronous substitute for a domain expert who isn't actually available. XP's "naive" assumption of a freely available customer is explicitly acknowledged as aspirational even in human teams. | Real customers/domain experts are rarely available at the cadence XP assumed - this was already XP's weakest link before AI; AI's speed makes the gap more costly, not less. |
| **Small releases** | Ship small increments frequently, get real feedback | Retained largely as-is, but "release" now has to mean "verified candidate," not "generated candidate" - see Merge/Integration Authority below. | Generation speed no longer implies release-readiness; the gate moved. |
| **Simple design / YAGNI** | Avoid speculative complexity because building it costs real time | Retained, but harder to enforce because AI will happily build speculative complexity fast and cheap if asked or if under-specified. Ties directly into Lean's "eliminate waste" lens - waste is now an output-volume problem, not an effort problem. | Cheapness of generation removes the natural friction that used to discourage over-building. |
| **Testing (TDD)** | Write the test first, then the code to pass it - drives design, provides a safety net for change | **Elevated, not just carried over.** TDD is arguably the single most important aiXP practice, more central than it was in plain XP. The test becomes both the spec handed to the AI and the fast, cheap verification loop that AI-generated code specifically requires - without it, there's no fast way to know whether generated code does what was intended. Where classic XP treated TDD as one good practice among twelve, aiXP treats it as close to load-bearing. | AI can generate plausible-looking, wrong code at high volume; TDD is the fastest mechanical check against that, and it's the one practice purpose-built for exactly this failure mode. |
| **Coding Standards** | Shared conventions so code reads uniformly regardless of author | Retained and reinforced - enforced as a living artifact the AI is required to follow (see Context Stewardship), not just a human team agreement. More important with multiple agents plus a human producing code than with an all-human team, since inconsistency compounds faster at generation speed. | Multiple authors (human + N agents) need one enforced style or the codebase drifts into unreviewable inconsistency quickly. |
| **Collective Ownership** | Anyone on the team can change any code; no single owner | Genuinely in tension with Agent Role Topology, not a clean carryover - worth resolving deliberately rather than assuming. Ownership of *code* can stay collective (any agent/human can touch any file), but ownership of *review authority* is deliberately hierarchical (see Agent Role Topology). The two aren't the same axis, and conflating them is a likely source of confusion when teaching this. | Undifferentiated agent swarms (no ownership structure) fail differently than undifferentiated human teams did - see Agent Role Topology. Collective ownership of code doesn't imply collective ownership of judgment. |
| **Continuous Integration** | Frequent merges to trunk, automated build/test | Retained as a hard requirement, but needs explicit **risk-tiering** to avoid the human becoming a bottleneck on every branch regardless of risk. | Branch volume from concurrent agents can outpace a single human's manual verification capacity. |

---

## Part 2 - New Practices, Native to aiXP

### 1. Spec-First Prompting
Formal specification (customer story taken to ADR-level rigor) written *before* implementation begins, developed collaboratively with AI but with close human authorship and manual rewrites on weak points. Functions as the "on-site customer" substitute - externalizes intent before generation rather than relying on rapid clarification during generation, because generation now outpaces the clarification loop.

### 2. Domain Gap Surfacing
Explicit, visible flagging within the spec itself of which sections represent the author's genuine domain expertise versus best-guess or AI-assisted content. Weak sections get straw-polled with outside opinions. Prevents a spec from reading as uniformly authoritative when it isn't - directly addresses the structural flaw of a solo (or small) team being forced to serve as its own domain expert.

### 3. Agent Role Topology
Before a work cycle starts, explicitly define which agents are peers, which are subordinate/specialist implementers, and which hold review/veto authority. Default failure mode this prevents: treating multiple agents as an undifferentiated swarm ("launch N agents at the backlog") rather than a structured team with accountability. Typical topology:
- **Spec/Review-owning agent** - holds the spec and architectural context, pairs directly with the human on step-by-step task breakdown
- **Implementation sub-agents** - receive scoped tasks, report back, don't carry the full review context (keeps the review agent's context clean)
- **Independent verification agent** - no docs, no prior context, code-only review ("make the code speak") to test whether intent survives without external explanation

### 4. Executive Code Review (Adversarial, Context-Free)
A formal, line-by-line review pass - no summarizing, no shortcuts - conducted by a session with *no access to specs or docs*, only the code. Explicitly hunts for: security flaws, dead/unreachable code paths, unimplemented stubs, god files, refactor candidates, and scope creep against the spec. Distinct from and complementary to human/deep review - this catches self-documentation failure and drift; it doesn't replace judgment-level review.

### 5. Merge/Integration Authority
A single accountable party (currently: the human) holds final authority over what lands on trunk, regardless of how many agents proposed candidate changes. Concurrent agents *propose*; one party *disposes*. Risk-tiering is already practiced, but the exhausting residual category is **new, user-facing, non-unit-testable requirements** (visual layout, feel, UX judgment calls) - these resist mechanical verification and currently force either full manual on-device testing or the human coding it directly (see Practice 8). Batched candidate builds are used occasionally now; formalizing this as a deliberate method (rather than an ad hoc fallback) is expected to help with resource/fatigue planning going forward. Simulator/emulator automation is identified as the next concrete build-out - work started, not yet in regular use - aimed at shrinking the population of branches that require full manual on-device verification.

### 6. Context Stewardship
Living context artifacts (architecture notes, decision records, CLAUDE.md-equivalents) maintained as a first-class practice, not documentation overhead. Unlike classic XP's allergy to heavy docs, this documentation earns its keep because it is read by the AI pair partner every session - it's the mechanism that lets a stateless collaborator behave statefully.

### 7. Vigilance Budgeting
Explicit session/output limits adopted *by choice*, not imposed by cost. Frames restraint as a quality practice (protects review attention) rather than a budget constraint - and rejects token-volume-as-productivity metrics as actively harmful to the discipline.

**Empirical finding (practitioner-observed, worth stating explicitly rather than left implicit):** the practical concurrent-session ceiling for a solo aiXP practitioner appears to be bounded by working memory, not tooling - roughly 4 concurrently held contexts (e.g. two applications in active development plus a devops agent, each demanding real judgment), consistent with cognitive science estimates of working memory capacity (~4 chunks, per Cowan's updated revision of the older "7±2" figure). This matters because it reframes the ceiling: more parallel sessions doesn't increase throughput past this point, it degrades review quality, because each additional session competes for the same fixed pool of engaged attention rather than adding capacity. The practical lever isn't holding more sessions - it's distinguishing sessions that need active engaged judgment from ones that only need occasional glancing (a routine devops agent monitored ambiently shouldn't occupy the same "slot" as a session mid-decision on an architecture question), and treating hitting the wall as a signal to context-switch out rather than push through.

**On flat vs. nested hierarchy:** even as tooling begins to support nested sub-agents (agents spawning their own agents), the recommendation here is to deliberately keep the practiced hierarchy flat. Nesting increases what can be *generated* in parallel, but generation was never the constraint - review and judgment are, and those don't parallelize the way generation does. A flatter hierarchy stays within a practitioner's actual capacity to hold, verify, and be accountable for what's happening, which matters more for teachability and manageability than raw throughput.

### 8. Perception-Gated Work
A named category for work whose verification loop is human judgment, not test output - visual layout, spacing, wording, timing, "does this feel right." Mechanical verification (unit tests, simulator automation) doesn't cover this category and pretending otherwise is a common source of AI-frontend frustration industry-wide. The AI stays in a support role rather than exiting the loop; the division of labor inverts rather than disappears. Two recurring sub-patterns:

- **Instrumented tweaking** - the AI adds a parameter or knob specifically so the human-judgment loop (fonts, spacing, timing) can iterate quickly without a round-trip through prompting each time. The AI's contribution here is meta-work: building the tool that lets the human bypass the AI for the actual iteration.
- **Pseudocode-down** - for heavier algorithmic lifts within perception-gated work, the human supplies the logic at pseudocode level (the judgment/design part) and the AI handles faithful implementation (the mechanical translation part). Differs from ordinary spec-first prompting in that the "spec" is executable-adjacent, not prose.

---

### 9. Prioritization Authority (Planning Game, adapted)
Classic XP's Planning Game was joint estimation and prioritization between customer and developers. Spec-First Prompting covers the *content* half (what should be built and why); this practice covers the *sequencing* half, which isn't automatically resolved by having a good spec: what gets built next, and which agent(s) it's routed to. With no on-site customer setting priority in real time, this becomes another responsibility that collapses onto the human - worth naming explicitly rather than assuming it's implicitly handled by Agent Role Topology or Spec-First Prompting alone.

### 10. Event-Triggered Delegation
Extends risk-tiering one step earlier than Merge/Integration Authority does - from "how much verification does this change need before merge" to "does this task need a human to manually initiate it at all." The default failure mode this addresses: the human as sole semaphore for every task regardless of risk, which doesn't scale and is a real source of fatigue distinct from review fatigue (Vigilance Budgeting) - this is *initiation* fatigue.

For a class of low-risk, well-bounded, pattern-matched tasks (routine housekeeping, scheduled dependency checks, a file landing in a known location that always gets the same treatment), initiation itself can be automated rather than requiring the human to notice and manually start a session. Concretely, in Claude Code: non-interactive/headless invocation (`claude -p`) combined with an external trigger - a file watcher, a cron schedule, a git webhook, a CI event - lets a session start itself when a known, low-risk condition is met, with tool permissions and scope narrowed to match the task's risk tier. High-risk or judgment-requiring tasks stay manually initiated; only tasks that would already pass a low risk tier under Merge/Integration Authority are candidates for self-triggering. The practice is the *judgment call about which tasks qualify*, not the automation mechanism itself - the mechanism is just plumbing once the risk-tiering judgment has been made.

---

## Part 3 - DevOps/SRE Practices Adopted into aiXP

These aren't XP-derived - they come from a separate lineage (DevOps, SRE) - but they fit the same gap the merge/integration bottleneck exposed: once verification can't all happen pre-merge without becoming a bottleneck, some of the safety net has to move to *after* merge, in a controlled way. Naming these explicitly, rather than leaving them implicit in Merge/Integration Authority.

### 10. Trunk-Based Development
Short-lived branches, frequent integration to trunk - not new to software, but worth stating as a required discipline rather than an assumption, given that concurrent agents can generate branch volume a solo/small team never produced by hand. Long-lived branches compound the review backlog exactly where fatigue is already concentrated.

### 11. Feature Flags / Progressive Delivery
Decouples *merge* from *release*. Code can land on trunk and pass through CI without being exposed to real users yet - which lowers the stakes of merging, directly easing the Merge/Integration Authority bottleneck. Especially relevant to Perception-Gated Work: a UI change can merge behind a flag, get toggled on for the developer only, iterated on in place, then released once it's actually right - without every intermediate tweak needing a full manual on-device pass.

### 12. Observability as the Post-Merge Feedback Loop
For a small team without dedicated QA, production telemetry becomes the primary catch mechanism for exactly the category that resists pre-merge automation - Perception-Gated Work and other non-unit-testable behavior. This is the practice that makes it *safe* to lean on Feature Flags rather than exhaustive manual pre-release testing: ship narrow, watch what happens, widen exposure once it's confirmed clean.

### 13. Error Budgets (adapted)
An explicit, stated tolerance for a certain rate of post-merge issues, in exchange for not gatekeeping every change with maximal pre-merge scrutiny. Formalizes a trade-off that's currently being made implicitly and inconsistently (sometimes full manual test, sometimes "I'll just code it myself") - makes the risk-tiering decision explicit and consistent rather than ad hoc, and gives a defensible answer to "why wasn't this tested more before it shipped."

### 14. Blameless Postmortems (adapted)
When something does slip through despite the review layers, a short retrospective on *which layer of the process failed* - spec, agent role topology, executive review, or verification gap - rather than which agent or which output was at fault. Keeps the focus on refining the discipline itself rather than assigning blame to a tool that can't learn from blame anyway.

---

## Part 4 - Testing Tiers & Strategy: A Primer for aiXP

Most engineers have heard these terms without a coherent model of how they chain together, and the full ladder has historically only been affordable at team/org scale - a solo or small team couldn't sustain most of these tiers without AI doing a chunk of the labor. Worth spelling out explicitly, since this is one of the areas AI tooling changes from "aspirational" to "actually achievable" at small scale.

**The ladder, in order of increasing exposure:**

1. **Unit tests** - smallest possible scope, one function/module in isolation. This is where TDD (Practice, Part 1) lives - written *before* the implementation, driving the AI's generation rather than checking it after the fact.
2. **Integration tests** - verify units work together correctly (does the API call actually reach the database layer correctly, does the UI component receive the right shape of data). Sits inside Continuous Integration as a CI gate.
3. **Regression tests** - an accumulating suite that locks in every bug fix so it can't silently return. AI tooling is unusually good here: every time a bug is found and fixed, generating the regression test that would have caught it is close to free, whereas historically this was the tier most teams let atrophy because writing regression tests after the fact felt like unrewarding overhead.
4. **Internal / "dogfooding"** - using your own build before anyone else does. For a solo/small team, this is effectively you as the first internal user - but Feature Flags (Practice, Part 3) let you extend this tier further than one person alone could: ship behind a flag, use it yourself in production-real conditions for a while, before deciding to widen exposure.
5. **Alpha** - a small, trusted external group, still expecting rough edges, fast feedback loop. This is where Domain Gap Surfacing's straw-polling arguably belongs on the code/product side, not just the spec side - the same instinct (get outside eyes on your weak points) applies to a working build, not only a document.
6. **Beta** - wider exposure, feature-complete but not fully hardened, still pre-GA. Feature Flags + Progressive Delivery is the natural mechanism here - widen the flag's audience percentage rather than doing a hard cutover.
7. **Release / General Availability** - full exposure. Observability (Practice, Part 3) takes over as the primary detection mechanism from here on, since pre-release testing tiers can no longer catch everything by definition.
8. **Patch / hotfix cycle** - the fast-turnaround loop for issues found in production. Tied directly to Error Budgets (how much post-release breakage is tolerable before the process itself needs review) and Blameless Postmortems (what layer of the earlier tiers should have caught this, and didn't).

*Illustrative example only, not a prescription - cadence has to fit your own risk tolerance and user base:* a severity-tiered response, e.g. security/data-loss issues patched within hours regardless of the normal release rhythm; functional regressions affecting real usage patched within a day or two; cosmetic/minor issues simply roll into the next regular release rather than triggering an out-of-band patch. The point isn't the specific thresholds - it's that having *any* explicit tiering, decided in advance, is what keeps a hotfix decision fast and non-agonized-over when something breaks, rather than re-litigating "how urgent is this, really" under pressure each time.

**Why AI tooling specifically changes the economics of this ladder:**

- **Regression suites stop atrophying.** The traditional failure mode - regression tests never get written because it's tedious, unrewarded work done after the interesting part is over - is exactly the kind of task AI handles well and cheaply. This tier alone is probably the single biggest quality lever most under-resourced teams (solo or small) leave unused.
- **Internal/alpha tiers become viable without hiring.** These tiers traditionally required either enough internal headcount to dogfood meaningfully or a QA/beta-coordination function most small teams can't staff. AI-driven exploratory testing (an agent probing edge cases, generating unusual inputs, simulating varied user paths) can approximate some of what a QA team's alpha-tier value used to require.
- **The ladder's cost curve flattens.** Historically, each additional tier cost roughly linear additional effort, which is why small teams collapse tiers together (skip straight from "I tested it" to "it's live"). AI reduces the marginal cost of maintaining several of these tiers simultaneously, which is arguably what makes the full aiXP practice set (spec-first, TDD-as-load-bearing, executive review, risk-tiered merge, feature-flagged rollout, observability) coherent as a *system* rather than an unaffordable wishlist.

**Where this connects back to existing aiXP practices:** Perception-Gated Work is the category most likely to slip through tiers 1–3 untested (it's not unit-testable by nature) - which is precisely why tiers 4–6 (internal → alpha → beta, gated by Feature Flags) matter more for aiXP than they did in classic XP's small-releases model, and why Observability has to close the loop for whatever slips past all of them.

---

## Part 5 - Versioning & Release Identity: A Primer for aiXP

Another area most engineers use without a coherent model, and another place AI tooling changes what's affordable at small scale - because much of it can be derived automatically if the underlying discipline (Coding Standards, Context Stewardship) is followed consistently.

**The common schemes:**

- **Semantic Versioning (SemVer)** - `MAJOR.MINOR.PATCH` (e.g. `2.4.1`). MAJOR bumps on breaking changes, MINOR on backward-compatible new functionality, PATCH on backward-compatible fixes. The dominant scheme for libraries/APIs where other code depends on your interface staying stable.
- **Calendar Versioning (CalVer)** - version tied to release date (e.g. `2026.08`, or `26.08.1`). Common for products where "when was this released" matters more to users than "how big a change was this" - browsers, OSes, some SaaS products.
- **Build/commit-based versioning** - a version tied directly to a commit hash or build number, common in continuous-deployment contexts where "release" isn't really a discrete event at all.

**Where AI tooling changes the economics:**

- **Version-bump classification becomes near-automatic.** Deciding whether a change is MAJOR/MINOR/PATCH under SemVer requires correctly judging whether an interface change is breaking - tedious and error-prone to do by hand, especially solo. An AI reviewing a diff against the existing public interface can flag breaking changes reliably enough to suggest (not decide) the correct bump, provided it has access to what the *actual* public contract is - which is exactly why this depends on Context Stewardship being current, not an afterthought.
- **Changelog generation becomes close to free, if commit discipline exists.** The **Conventional Commits** convention (commit messages prefixed `feat:`, `fix:`, `BREAKING CHANGE:`, etc.) exists specifically to make changelogs and version bumps machine-derivable. This is worth folding directly into Coding Standards (Part 1) as an explicit sub-requirement: if the AI (and human) are required to write commits in this format, changelog drafting and version-bump suggestion both become close to automatic rather than a manual chore that gets skipped under time pressure - which is the traditional failure mode this tier suffers from at small scale.
- **The discipline that makes this work is the same discipline that makes everything else in this document work.** Automated versioning isn't a separate practice so much as a downstream benefit of Coding Standards and Context Stewardship being taken seriously - another argument, alongside the testing-tier ladder in Part 4, for why this practice set holds together as a system rather than a checklist of unrelated good ideas.

**Not prescribing a scheme here** - SemVer fits libraries/APIs, CalVer fits products, and which one is right depends on who consumes your version numbers and why they care. Worth stating explicitly in whatever you publish, since this is another area where people cargo-cult a scheme (usually SemVer, because it's the one they've heard of) without asking whether it matches what they're actually versioning.

---

## Part 6 - Comparison: aiXP vs. the AI-Native SDLC

Anthropic published "The AI-Native SDLC playbook" on August 21, 2026 - its Applied AI team's own best practices for integrating Claude across a six-stage loop (Plan, Design, Build, Test, Deploy, Maintain), driven by committed artifacts (`intent.md`, `spec.md`, `plan.md`, diff+tests, PR+findings, incident record) that each trigger the next stage. Worth a direct comparison: it's independently-arrived-at guidance from the people who build the tooling, and it both validates several aiXP practices and diverges from others in instructive ways.

### Where the two converge (independent validation)

- **The WIP/session ceiling.** The playbook's parallel-sessions guidance states outright that the practical ceiling is how many streams one person can review properly - the same empirical finding as Practice 7's working-memory ceiling, arrived at independently.
- **Context Stewardship** - `CLAUDE.md`, read every session, corrected whenever a mistake repeats, is functionally identical to Practice 6.
- **TDD as load-bearing, especially for fixes** - the playbook's feedback-loop play: write the failing test first, commit it, then use a hook to block the agent from editing that test file while it fixes the code. Same instinct as the elevated Testing/TDD practice in Part 1, with the "don't let the AI weaken its own check" idea made literal as tooling (a hook) rather than a habit.
- **Event-Triggered Delegation, more fully realized.** The playbook's Maintain stage closes the loop exactly as Practice 10 anticipates: a deterministic monitor breaches a threshold, invokes Claude headlessly, and the output re-enters as a fresh `intent.md`. The playbook extends this further than aiXP currently has - from "low-risk task self-triggers" to "production incidents regenerate the planning cycle automatically" - a plausible next step for Practice 10.

### Where the two diverge

1. **Scale assumption.** The playbook's "AI-native" column retains distinct human roles - product owner, tech lead, platform engineer, release manager, policy owner - just faster and artifact-driven. It's DevOps-at-org-scale reimagined for agents. aiXP is explicitly built for the 1-to-n case, where those roles collapse onto one or a few people - a scenario the playbook doesn't address.
2. **Review philosophy - a genuine disagreement, not just a gap.** The playbook's PR-review agent works *with* full context (`CLAUDE.md`, `spec.md`, `plan.md`), optimizing human attention toward judging intent and risk. aiXP's Executive Review agent (Practice 4) is deliberately context-free - no docs, "make the code speak" - optimizing instead for whether the code is self-explanatory without its paper trail, a failure mode the playbook's approach doesn't check for at all.
3. **No practitioner-wellbeing dimension.** The playbook's success metrics are entirely org-level (DORA metrics, review time, change failure rate). Nothing addresses reviewer fatigue or degraded judgment under volume - Vigilance Budgeting (Practice 7) has no counterpart here.
4. **No manifesto stance.** The playbook is purely operational - "here's how" - with no "here's what we reject and why." aiXP's pillars-plus-rejection-criteria ambition has no equivalent; it's the difference between a playbook and a stated philosophy.
5. **Missing from the playbook entirely:** Domain Gap Surfacing, versioning/SemVer discipline, the alpha/beta testing-tier ladder, and any XP-lineage practice-by-practice mapping. The playbook's `intent.md`/`spec.md`/`plan.md` chain is structurally close to Spec-First Prompting, but framed as pipeline plumbing rather than a discipline of judgment.

### Strategic implication

"AI-native" is emerging fast as the industry's default umbrella term - Anthropic, AWS (AI-DLC), Atlassian, and IBM are all converging on it independently, within the same week as of this writing. Worth positioning aiXP not as a competing freestanding name, but as **a practitioner-scale discipline within the AI-native movement** - specifically the solo/small-team, judgment-and-verification layer that org-scale playbooks like this one largely assume away. This is a positioning choice about where the clearest evidence and least crowded niche currently sit, not a claim that aiXP's practices are structurally incapable of scaling. The practices (Agent Role Topology, Merge/Integration Authority, Spec-First Prompting, risk-tiering, Executive Review) have no inherent ceiling - XP itself started small and was later stretched to larger orgs (Scaled Agile, LeSS). What's calibrated specifically to n=1 is the *empirical findings*, not the *discipline* - the ~4-session ceiling is one practitioner's working-memory limit, not a proven team-level constant, and questions like distributed Merge/Integration Authority at n>1 remain genuinely open rather than solved.

---

## Open Questions / Still Brainstorming
- How far can merge verification be automated before "final human pass" becomes a rubber stamp rather than a real gate?
- Does Agent Role Topology need a formal notation (like a RACI chart) to be teachable, or does that over-formalize something that should stay adaptive?
- Is aiXP a strict superset of XP (all practices retained/modified) or does something like on-site customer get fully replaced rather than adapted? Affects framing: "XP, updated" vs. "a new methodology descended from XP."
- **"Metaphor" (original XP practice)** - a shared conceptual model/naming scheme keeping everyone's mental model of the system aligned. Weakest fit of the twelve originals; not force-fit into Part 2 above. Open question: does this map onto system-level naming conventions anchored via Context Stewardship, or is it genuinely obsolete once the AI can hold and query the literal architecture rather than needing a shared metaphor to reason about it?
- Manifesto-level framing - leaning away from Agile's "A over B" value-pairs format, toward a **pillars + rejection criteria** structure instead: a short set of pillars, each paired with a "what aiXP is not" and a test ("if a practice conflicts with this pillar, reject or refactor it"). Fits better than value-pairs because the practices here arose from specific failure modes (vigilance fatigue, scope creep, undifferentiated swarms, the domain-expert-alone flaw), not abstract preferences - pillars-plus-rejection-test is more actionable for real engineering decisions. Likely belongs early (sets boundaries before practices), not as a closing summary.
- **Format/scope decision, still open:** paper, talk, post, or book-length treatment. A book raises the bar - needs either deeper case-study detail (before/after code, real incidents) from this practice, outside practitioner input, or an explicit framing as "here's what one practitioner built and why" rather than a general prescription. Worth deciding whether the goal is a leaner, more credible solo-practitioner account or a broader claim needing more validation - the shorter formats can also serve as a way to pressure-test the ideas before committing to book length.

---

## Appendix - The Original 12 XP Practices (Reference)

For reference, Kent Beck's original twelve Extreme Programming practices, unmodified:

1. **Planning Game** - customer and developers jointly determine scope of releases and iterations
2. **Small Releases** - release working software frequently, in small increments
3. **Metaphor** - a shared story/conceptual model guiding system design and naming
4. **Simple Design** - build the simplest thing that could possibly work; avoid speculative complexity
5. **Testing** - write tests first (unit tests especially); code isn't done until it passes them
6. **Refactoring** - continuously restructure code without changing behavior, to keep design clean
7. **Pair Programming** - all production code written by two people at one machine
8. **Collective Ownership** - anyone can change any code anywhere in the system at any time
9. **Continuous Integration** - integrate and test changes frequently, at least daily
10. **40-Hour Week** - sustainable pace; overtime is a symptom of a deeper problem, not a solution
11. **On-Site Customer** - a real customer, available full-time, to answer questions and set priority
12. **Coding Standards** - team-wide conventions so code looks like it was written by one person

---

## Bibliography / References for Further Study

**Extreme Programming (primary sources)**
- Kent Beck, *Extreme Programming Explained: Embrace Change* (2nd ed., 2004) - the canonical source for the 12 practices
- Kent Beck & Cynthia Andres, *Planning Extreme Programming* (2000)
- Ron Jeffries, Ann Anderson, Chet Hendrickson, *Extreme Programming Installed* (2000)

**Agile / Kanban / Lean**
- *Manifesto for Agile Software Development* - agilemanifesto.org - the four value-pairs, useful as a structural contrast point for whatever manifesto format you land on
- Mary Poppendieck & Tom Poppendieck, *Lean Software Development: An Agile Toolkit* (2003) - source of the "eliminate waste" framing referenced under Simple Design/YAGNI
- David J. Anderson, *Kanban: Successful Evolutionary Change for Your Technology Business* (2010) - WIP limits, pull systems

**Architecture / Design Discipline**
- Neal Ford, Rebecca Parsons, Patrick Kua, *Building Evolutionary Architectures* (2017) - source of "fitness functions," relevant to bounding refactoring/scope creep and possibly Metaphor's replacement
- Eric Evans, *Domain-Driven Design* (2003) - relevant background for Domain Gap Surfacing and ADR-level spec work
- Michael Nygard's ADR format (original blog post: "Documenting Architecture Decisions," 2011) - likely the direct ancestor of your spec-first ADR practice

**DevOps / SRE (relevant to Merge/Integration Authority)**
- Gene Kim, Kevin Behr, George Spafford, *The Phoenix Project* (2013) - narrative introduction to DevOps flow concepts
- Google, *Site Reliability Engineering* (2016, free online: sre.google/books) - error budgets, postmortems, relevant to your merge-bottleneck/candidate-build thinking
- Jez Humble & David Farley, *Continuous Delivery* (2010) - the deeper technical background behind CI/CD risk-tiering

**Adjacent "AI-Native SDLC" Literature (for direct comparison - see Part 6)**
- Anthropic Applied AI team, "The AI-Native SDLC playbook," claude.com/blog, August 21, 2026 - the primary comparison point for Part 6; org-scale, artifact-driven (intent.md/spec.md/plan.md), no XP lineage
- AWS (Raja SP), "AI-Driven Development Lifecycle (AI-DLC)," 2025 - a competing org-scale framing, worth reading alongside the Anthropic playbook for contrast
- Search for "AI-native SDLC" plus the current year before citing further - this term is being actively contested and redefined by multiple vendors concurrently; treat any single source as one perspective among several, not settled terminology

**AI-Assisted Development (current, fast-moving - verify recency before citing)**
- Anthropic's own engineering blog and docs on Claude Code (claude.com/docs) - primary source for how the tool you're using is intended to be used, worth checking for anything you cite about its capabilities
- GitHub's engineering blog on Copilot usage patterns - useful comparative data on AI-pairing at scale in human teams, different context (large orgs, not solo/small-team) but relevant contrast
- Search for recent (2025–2026) papers/preprints on "AI pair programming," "LLM code review," and "agentic software development" via arXiv (cs.SE category) - this space moves fast enough that anything older than a year should be treated as historical rather than current

**Adjacent/Contrasting Methodologies (mentioned but not adopted)**
- Harlan Mills et al. on Cleanroom Software Engineering - IBM technical reports, 1980s; mostly of historical interest but relevant to the "formal spec, AI implements faithfully" thread
- Dan North, "Introducing BDD" (2006, original article) - Given/When/Then framing, relevant to Spec-First Prompting's executable-adjacent variants

**Versioning / Release Discipline**
- Tom Preston-Werner, *Semantic Versioning 2.0.0* - semver.org - the canonical SemVer spec
- *Conventional Commits* - conventionalcommits.org - the commit-message convention referenced under Part 5, worth reading directly before folding into your own Coding Standards
- CalVer - calver.org - informal reference for calendar-based versioning schemes and when teams choose it over SemVer

*Note: several of the AI-specific sources above will go stale quickly given how fast this space is moving - worth re-searching immediately before citing anything in a final draft, rather than relying on what's listed here.*
