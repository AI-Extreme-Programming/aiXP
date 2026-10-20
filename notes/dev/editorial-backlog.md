# Editorial Backlog & Manuscript Status

This document tracks editorial tasks, section-by-section revisits, and manuscript progress across the aiXP writing project.

---

## Manuscript Status Overview

| Chapter | Title | Status | Primary Next Step |
|---|---|---|---|
| `00.01` | [Preface](../../docs/aixp/00.01-preface.md) | Polished | Audience and scope complete |
| `00.02` | [How to Read This Book](../../docs/aixp/00.02-how-to-read.md) | Polished | Re-align cross-references to actual 4-part structure |
| `01.01` | [The Problem with Vibe Coding](../../docs/aixp/01.01-vibe-coding.md) | Polished | Includes Kent Beck "Seed Corn" callout |
| `01.02` | [XP's Original Bet](../../docs/aixp/01.02-xp-background.md) | Polished | Includes Kent Beck "Unsettled Frontier" callout |
| `01.03` | [What Changed When AI Joined the Team](../../docs/aixp/01.03-what-changed.md) | Polished | Includes Kent Beck "Trust Deficit" callout |
| `02.01` | [Pillars and Rejection Criteria](../../docs/aixp/02.01-manifesto.md) | Polished | Includes Kent Beck "Trust Factory" callout |
| `03.01` | [XP Practices Carried Over](../../docs/aixp/03.01-xp-practices-carried-over.md) | Draft | Rewrite matrix into narrative loop based on Kent Beck comparison |
| `03.02` | [New Practices, Native to aiXP](../../docs/aixp/03.02-new-practices.md) | Review | Add practitioner workflows & topology diagram |
| `03.03` | [DevOps/SRE Practices Adopted](../../docs/aixp/03.03-devops-practices.md) | Review | Expand practical rollout examples |
| `03.04` | [Testing Tiers & Strategy](../../docs/aixp/03.04-testing-tiers.md) | Polished | Primer complete |
| `03.05` | [Versioning & Release Identity](../../docs/aixp/03.05-versioning.md) | Polished | Primer complete |
| `04.01` | [Comparison: aiXP vs. AI-Native SDLC](../../docs/aixp/04.01-comparison-ai-native-sdlc.md) | Polished | Anthropic Aug 2026 playbook comparison |
| `04.02` | [Scaling Beyond the Solo Practitioner](../../docs/aixp/04.02-scaling.md) | Review | Review desk-level vs. team coordination interface |
| `04.03` | [What aiXP Is Not](../../docs/aixp/04.03-anti-patterns.md) | Polished | Catalog of failure modes complete |
| `05.02` | [Appendix - Original 12 XP Practices](../../docs/aixp/05.02-appendix-original-12.md) | Polished | Reference complete |
| `05.03` | [Bibliography](../../docs/aixp/05.03-bibliography.md) | Polished | Hyperlinked all citations; cleaned out drafting prompts |

---

## Editorial Tasks

- [x] **Fix Preface Fragment:** [00.01-preface#Who is this for?](../../docs/aixp/00.01-preface.md#who-is-this-for) smoothed out sentence fragment into a clean audience description.
- [ ] **Rewrite [03.01 - XP Practices](../../docs/aixp/03.01-xp-practices-carried-over.md):** Transform from Claude's textbook matrix into an authentic XP developer loop inspired by Kent Beck's *Trust Factory* (see detailed breakdown below).
- [ ] **Settle Practice Inventory & Numbering ("15 vs. 25"):** Reconcile the promise in [00.02-how-to-read](../../docs/aixp/00.02-how-to-read.md) ("fifteen practices organized into three groups") with Part III's actual inventory:
  - `03.01` currently has 10 classic practices (tabular, unnumbered).
  - `03.02` has 10 native practices (numbered 1-10).
  - `03.03` has 5 DevOps practices (numbered 11-15).
  - Total = 25 practices. Settle whether to unify the numbering across all practices or curate a 15-practice core (e.g. 5 + 5 + 5).
- [ ] **Re-align Legacy Outline Cross-References:** Update outdated section pointers left over from earlier outline drafts:
  - In [00.02-how-to-read](../../docs/aixp/00.02-how-to-read.md): update reference to "Parts 4 and 5" (they are now `03.04` and `03.05` within Part III).
  - In [05.03-bibliography](../../docs/aixp/05.03-bibliography.md): update references to "Part 6" and "Part 5".
- [ ] **Agent Topology Diagram:** In [03.02-new-practices#3. Agent Role Topology](../../docs/aixp/03.02-new-practices.md#3-agent-role-topology), add a Mermaid diagram visualizing the Lead/Spec Agent, Scoped Implementers, and Independent Executive Reviewer.
- [ ] **Working Memory Ceiling Reference:** Double-check Nelson Cowan's cognitive chunking research citation (~4 items in working memory) referenced in [03.02-new-practices#7. Vigilance Budgeting](../../docs/aixp/03.02-new-practices.md#7-vigilance-budgeting).

---

## Practice Inventory: Kent Beck's *Trust Factory* (8) vs. aiXP (10)

Detailed comparison between Kent Beck's 8 trust-manufacturing practices in *Trust Factory* (June 2, 2026) and the 10 classic XP practices currently listed in [03.01-xp-practices-carried-over](../../docs/aixp/03.01-xp-practices-carried-over.md):

### 1. Kent Beck's 8 Practices (*Trust Factory*)
1. **Programmer testing** (TDD)
2. **Pairing**
3. **Continuous integration**
4. **Weekly planning** (classic Planning Game)
5. **Customer on the team** (On-site Customer)
6. **Continuous deployment** (evolution of Small Releases)
7. **Refactoring**
8. **Observability** (modern DevOps addition, not in the original 1999 XP 12)

### 2. aiXP's Current 10 Carried-Over Practices
1. Pairing
2. Refactoring
3. Sustainable pace (40-hour week)
4. On-site customer
5. Small releases
6. Simple design / YAGNI
7. Testing (TDD)
8. Coding Standards
9. Collective Ownership
10. Continuous Integration

*(Original 12 omitted here: Planning Game, Metaphor)*

### 3. Comparison & Alignment Matrix

| Category | Practices | Notes for Chapter 03.01 Rewrite |
|---|---|---|
| **In both lists (6)** | Testing (TDD), Pairing, Continuous Integration, Customer on Team, Small Releases / Continuous Deployment, Refactoring | The core mechanical engine. Instantly recognizable to XP practitioners. This forms the primary spine of the rewrite. |
| **In aiXP's 10, omitted by Beck (4)** | Simple Design / YAGNI, Sustainable Pace, Coding Standards, Collective Ownership | Beck skipped these in his trust essay. In aiXP: Sustainable Pace becomes Vigilance Budgeting; Coding Standards becomes context prompt enforcement; Collective Ownership is in tension with Agent Role Topology. |
| **In Beck's 8, handled elsewhere in aiXP (2)** | Weekly Planning, Observability | aiXP handles planning under Spec-First Prompting / Prioritization Authority (`03.02`), and Observability under DevOps practices (`03.03`). |

### 4. Roadmap for Chapter 03.01 Rewrite
- Claude originally drafted `03.01` as a dry, tabular 10-row compliance matrix starting from the 1999 textbook.
- Beck's *Trust Factory* list is far more recognizable because it reflects the practitioner's daily rhythm: writing tests, pairing, integrating, deploying, and refactoring.
- The rewrite should abandon the rigid matrix format and present the practices as an authentic engineering loop that manufactures trust between the human, the AI agents, and the codebase.

---

## Open Architecture & Method Questions

Tracked in detail in [open-questions.md](./open-questions.md):
- [ ] **XP Metaphor:** Formalize whether system naming/architecture in Context Stewardship replaces Metaphor, or if Metaphor survives as domain ubiquitous language.
- [ ] **On-Site Customer:** Settle whether it is considered "adapted" or "fully replaced" by Spec-First Prompting + Domain Gap Surfacing.
- [ ] **Format/Scope Target:** Decide whether to keep as a lean VitePress monograph/web book or prepare for expanded long-form distribution.

---

## File Organization & Page Numbering Rules

- **Numbering is for Obsidian sort order only:** File prefixes (`00.01`, `00.02`, `01.01`, `05.02`, etc.) exist solely to order notes properly in the Obsidian file explorer.
- **Skipped numbers do not matter:** Gaps like skipping from `04.03` to `05.02` are intentional sort boundaries, not missing chapters.
- **Fractional numbering for insertions:** Decimal/fractional keys (e.g. `00.02.5`) are valid and expected when inserting a page between two existing notes without requiring renumbering of subsequent files.

---

## Conventions for Inline Notes

When leaving notes in the manuscript text:
- Use `<!-- TODO: ... -->` for notes that must stay hidden from VitePress readers.
- Use `<!-- REVISIT: ... -->` for phrasing or flow checks.
- Use `<!-- CITE: ... -->` for claims needing verification.

---

Structurally, the book has a very strong, logical spine. It reads like a serious engineering monograph rather than a collection of blog posts.

Here is an honest structural breakdown of what is working, where the seams show, and where the architecture needs alignment:

### 1. What Works Exceptionally Well (The Core Arc)

The intellectual flow from chapter to chapter is compelling:

- **The Setup (Part I):** Moves from the trap ([The Problem with Vibe Coding](../../docs/aixp/01.01-vibe-coding.md)), to the heritage ([XP's Original Bet](../../docs/aixp/01.02-xp-background.md)), to the economic reality ([What Changed](../../docs/aixp/01.03-what-changed.md)). It answers *"Why are we here?"* cleanly and authoritatively.
- **The Stance (Part II):** Placing the [Manifesto](../../docs/aixp/02.01-manifesto.md) right between the background and the mechanics gives the reader a philosophical compass before diving into the weeds.
- **The Boundaries (Part IV):** Moving from internal practices to external reality ([Industry Comparison](../../docs/aixp/04.01-comparison-ai-native-sdlc.md)), team reality ([Scaling](../../docs/aixp/04.02-scaling.md)), and concrete traps ([What aiXP Is Not](../../docs/aixp/04.03-anti-patterns.md)) closes the book with strong guardrails.

### 2. The Structural Friction Points (Where the Seams Show)

#### A. The "15 vs. 25 Practices" Math Mismatch

In [00.02-how-to-read](../../docs/aixp/00.02-how-to-read.md), the text explicitly tells the reader:

> *"fifteen practices organized into three groups (XP-derived, aiXP-native, DevOps/SRE-adopted)..."*

However, the actual chapters tell a different story:

- [03.01-xp-practices-carried-over](../../docs/aixp/03.01-xp-practices-carried-over.md) lists **10** classic XP practices (in a table, unnumbered).
- [03.02-new-practices](../../docs/aixp/03.02-new-practices.md) lists **10** native practices, numbered **1 through 10**.
- [03.03-devops-practices](../../docs/aixp/03.03-devops-practices.md) lists **5** DevOps practices, numbered **11 through 15**.

That adds up to **25 practices**, not 15. The reader will be confused about whether the 10 carried-over practices "count" as core practices or if they are background context. (Notice that if the three groups were 5 + 5 + 5, that would equal 15, matching the original promise). This ties right into your instinct that [03.01-xp-practices-carried-over](../../docs/aixp/03.01-xp-practices-carried-over.md) needs a ground-up rewrite.

#### B. Ghost References from Earlier Outline Drafts

A few chapters still refer to an older outline where primers and back matter had different part numbers:

- In [00.02-how-to-read](../../docs/aixp/00.02-how-to-read.md): *"The testing and versioning primers (Parts 4 and 5)..."* (They are actually sections 03.04 and 03.05 within Part III).
- In [05.03-bibliography](../../docs/aixp/05.03-bibliography.md): It still mentions *"for direct comparison - see Part 6"* and *"referenced in Part 5"*.
- In the file tree: There is no `05.01`. Back Matter jumps directly from Part IV to `05.02-appendix-original-12.md`.

#### C. Format Asymmetry in Part III

- Chapters `01.xx`, `02.xx`, and `04.xx` are written in fluid, narrative prose with a clear authorial voice.
- Part III currently shifts suddenly into "reference document" mode: `03.01` is a tabular matrix, `03.02` is a series of dense specification bullets, and `03.04`/`03.05` are quick primers.
- Bringing narrative depth to `03.01` and `03.02` (treating them like lived practitioner patterns with examples rather than a feature matrix) will bring Part III up to the quality of Parts I and II.

### 3. Recommendations to Tighten the Structure

1. **Settle the Practice Inventory:** Decide whether aiXP has:
   - **15 practices** (e.g. 5 essential XP carryovers, 5 aiXP-native practices, and 5 DevOps extensions), or
   - A unified numbering scheme that includes all practices without contradicting [00.02-how-to-read](../../docs/aixp/00.02-how-to-read.md).
2. **Re-align Legacy Numbering:** Update the cross-references in [00.02-how-to-read](../../docs/aixp/00.02-how-to-read.md) and [05.03-bibliography](../../docs/aixp/05.03-bibliography.md) so they match the actual 4-part sidebar structure.
3. **Renumber the Appendix:** Rename `05.02-appendix-original-12.md` to `05.01` (and update `config.mts`) so Back Matter doesn't have a missing first file.
