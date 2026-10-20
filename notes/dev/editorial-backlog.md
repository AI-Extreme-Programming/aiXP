# Editorial Backlog & Manuscript Status

This document tracks editorial tasks, section-by-section revisits, and manuscript progress across the aiXP writing project.

---

## Manuscript Status Overview

| Chapter | Title | Status | Primary Next Step |
|---|---|---|---|
| `00.01` | [[00.01-preface\|Preface]] | Polished | Audience and scope complete |
| `00.02` | [[00.02-how-to-read\|How to Read This Book]] | Polished | Re-align cross-references to actual 4-part structure |
| `01.01` | [[01.01-vibe-coding\|The Problem with Vibe Coding]] | Polished | Includes Kent Beck "Seed Corn" callout |
| `01.02` | [[01.02-xp-background\|XP's Original Bet]] | Polished | Includes Kent Beck "Unsettled Frontier" callout |
| `01.03` | [[01.03-what-changed\|What Changed When AI Joined the Team]] | Polished | Includes Kent Beck "Trust Deficit" callout |
| `02.01` | [[02.01-manifesto\|Pillars and Rejection Criteria]] | Polished | Includes Kent Beck "Trust Factory" callout |
| `03.01` | [[03.01-xp-practices-carried-over\|XP Practices Carried Over]] | Draft | Expand table into full narrative prose sections |
| `03.02` | [[03.02-new-practices\|New Practices, Native to aiXP]] | Review | Add practitioner workflows & topology diagram |
| `03.03` | [[03.03-devops-practices\|DevOps/SRE Practices Adopted]] | Review | Expand practical rollout examples |
| `03.04` | [[03.04-testing-tiers\|Testing Tiers & Strategy]] | Polished | Primer complete |
| `03.05` | [[03.05-versioning\|Versioning & Release Identity]] | Polished | Primer complete |
| `04.01` | [[04.01-comparison-ai-native-sdlc\|Comparison: aiXP vs. AI-Native SDLC]] | Polished | Anthropic Aug 2026 playbook comparison |
| `04.02` | [[04.02-scaling\|Scaling Beyond the Solo Practitioner]] | Review | Review desk-level vs. team coordination interface |
| `04.03` | [[04.03-anti-patterns\|What aiXP Is Not]] | Polished | Catalog of failure modes complete |
| `05.02` | [[05.02-appendix-original-12\|Appendix — Original 12 XP Practices]] | Polished | Reference complete |
| `05.03` | [[05.03-bibliography\|Bibliography]] | Polished | Hyperlinked all citations; cleaned out drafting prompts |

---

## High-Priority Editorial Tasks

- [x] **Fix Preface Fragment:** [[00.01-preface#Who is this for?]] smoothed out sentence fragment into a clean audience description.
- [ ] **Settle Practice Inventory & Numbering ("15 vs. 25"):** Reconcile the promise in [[00.02-how-to-read]] ("fifteen practices organized into three groups") with Part III's actual inventory:
  - `03.01` currently has 10 classic practices (tabular, unnumbered).
  - `03.02` has 10 native practices (numbered 1-10).
  - `03.03` has 5 DevOps practices (numbered 11-15).
  - Total = 25 practices. Settle whether to unify the numbering across all practices or curate a 15-practice core (e.g. 5 + 5 + 5).
- [ ] **Re-align Legacy Outline Cross-References:** Update outdated section pointers left over from earlier outline drafts:
  - In [[00.02-how-to-read]]: update reference to "Parts 4 and 5" (they are now `03.04` and `03.05` within Part III).
  - In [[05.03-bibliography]]: update references to "Part 6" and "Part 5".
- [ ] **Expand [[03.01-xp-practices-carried-over|03.01 — XP Practices]]:** Transform the summary table into detailed narrative sections matching the flow of Parts I, II, and IV. High-leverage practices to give dedicated depth:
  - TDD as load-bearing specification and fast verification loop.
  - Asymmetric Pairing (AI driving, human navigating for architectural drift).
  - Bounded Refactoring (screening for scope creep rather than effort).
  - Sustainable Pace (managing vigilance fatigue vs. token volume).
  - Collective Ownership vs. Review Authority.
- [ ] **Agent Topology Diagram:** In [[03.02-new-practices#3. Agent Role Topology]], add a Mermaid diagram visualizing the Lead/Spec Agent, Scoped Implementers, and Independent Executive Reviewer.
- [ ] **Working Memory Ceiling Reference:** Double-check Nelson Cowan's cognitive chunking research citation (~4 items in working memory) referenced in [[03.02-new-practices#7. Vigilance Budgeting]].

---

## Open Architecture & Method Questions

Tracked in detail in [[notes/dev/open-questions|notes/dev/open-questions.md]]:
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
- Use `> [!TODO]` callouts for visible editorial work items that should not be missed.
- Use `<!-- TODO: ... -->` for notes that must stay hidden from VitePress readers.
- Use `<!-- REVISIT: ... -->` for phrasing or flow checks.
- Use `<!-- CITE: ... -->` for claims needing verification.
