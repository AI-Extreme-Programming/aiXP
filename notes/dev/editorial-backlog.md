# Editorial Backlog and Manuscript Status

This document tracks editorial tasks, section-by-section revisits, and manuscript progress across the aiXP writing project.

---

## Manuscript Status Overview

The manuscript is organized into a cohesive 9-chapter practitioner workflow, framed by Front Matter and Back Matter. Multi-part sections (Preface and Introduction) compile into single long-form pages in VitePress via `<!--@include: ...-->` while preserving atomic notes in Obsidian.

| Section / Chapter | Master Page | Sub-Notes (Included via `<!--@include-->`) | Status | Primary Next Step |
|---|---|---|---|---|
| **Front Matter** | `00.01-preface.md` | `00.02-how-to-read.md`, `00.03-conventions.md` | Polished | Single-page roll-up complete; author voice preserved verbatim |
| **Introduction** | `00.10-introduction.md` | `00.11-vibe-coding.md`, `00.12-xp-background.md`, `00.13-what-changed.md` | Polished | Single-page roll-up complete; Kent Beck callouts integrated |
| **Chapter 1** | `01.00-manifesto.md` | n/a | Polished | Four pillars and operational rejection criteria complete |
| **Chapter 2** | `02.00-intent-and-context.md` | n/a | Polished | Authentic artifacts integrated from BojuBot, QuKi Notes, and Lunar Shader case study |
| **Chapter 3** | `03.00-terminal-loop.md` | n/a | Draft | Replace placeholder comments with authentic TDD / pairing examples |
| **Chapter 4** | `04.00-judgment-and-roles.md` | n/a | Draft | Expand Agent Role Topology and Vigilance Budgeting with real field data |
| **Chapter 5** | `05.00-verification-and-testing.md` | n/a | Draft | Integrate real CI / regression test harnesses (e.g. BojuBot `agy-bridge-check`) |
| **Chapter 6** | `06.00-delivery-and-release.md` | n/a | Draft | Feature Release-Please, conventional commits, and pre-release staging workflows |
| **Chapter 7** | `07.00-scaling.md` | n/a | Draft | Multi-human, multi-agent collaboration patterns |
| **Chapter 8** | `08.00-modern-landscape.md` | n/a | Draft | Compare against Anthropic AI-Native SDLC playbook and enterprise frameworks |
| **Chapter 9** | `09.00-anti-patterns.md` | n/a | Draft | Catalog of failure modes and traps |
| **Appendix** | `10.01-appendix-original-12.md` | n/a | Polished | Kent Beck 1999 Extreme Programming reference |
| **Bibliography** | `10.02-bibliography.md` | n/a | Polished | Citations linked; drafting prompts removed |

---

## Active Editorial Tasks

### Priority 1: ScooterGitTemplate as the Official aiXP Template Repository
- [ ] **Establish as the Official aiXP Repository Starter:** Position `ScooterGitTemplate` as the reference GitHub template repository for practitioners starting an aiXP project.
- [ ] **Add Starter CI Templates (`.github/ci-templates/`):** Mirror the existing `.github/gitignore-templates/` structure by adding turnkey CI workflows for common environments (Node.js, Python, C++, Unity, Unreal Engine) incorporating `reusable-actionlint.yml`, static typechecking, linting, and automated unit test execution.
- [ ] **Add ADR / Feature Spec Starter Kit:** Add a minimal `notes/dev/specs/` or `notes/dev/adr/` directory with a standardized markdown template (`0001-template.md`: Context, Decision, Consequences, Status, Out of Scope) to encourage Spec-First Prompting from day zero.
- [ ] **Feature in Manuscript:** Reference `ScooterGitTemplate` in Chapter 2 (Context Stewardship), Chapter 6 (Delivery and Release), and Front Matter (`00.03-conventions.md`) as the companion starter repo.

### Priority 2: Chapter 3 Artifact Integration (The Terminal Loop)
- [ ] **Replace Placeholder Comments in `03.00-terminal-loop.md`:**
  - *Asymmetric Pairing:* Integrate the human-Navigator / AI-Driver command loop rules from `QuKi-Notes/CLAUDE.md`.
  - *TDD & Red/Green Bug Fixes:* Feature the mandatory red/green test reproduction requirement from QuKi Notes and BojuBot.
  - *Bounded Refactoring:* Document the strict constraint against unrequested refactors and the blast-radius minimization principle.
  - *Simple Design & YAGNI:* Show how context constraints suppress the impulse to over-engineer forward abstractions.

### Completed Milestones
- [x] **Full 9-Chapter TOC Restructuring:** Eliminated historical silos ("carried over" vs. "new" vs. "devops") in favor of a sequential 9-chapter practitioner workflow.
- [x] **Obsidian / VitePress Filename Synchronization:** Refactored filenames so the primary number matches the chapter (`01.00`, `02.00`, etc.), keeping Obsidian directory sorting in sync with the VitePress sidebar.
- [x] **Single-Page Section Architecture:** Configured VitePress `<!--@include: ...-->` directives in `00.01-preface.md` and `00.10-introduction.md` while preserving atomic notes in Obsidian.
- [x] **Right-Hand Sidebar H3 Headings:** Configured `outline: { level: [2, 3], label: 'On this page' }` in `docs/.vitepress/config.mts`.
- [x] **Preface Restoration:** Restored author's original approved text verbatim in `00.01-preface.md`; moved mechanical conventions into `00.03-conventions.md`.
- [x] **Chapter 2 Authentic Artifacts:** Replaced synthetic examples with authentic production excerpts from `BojuBot` (feature specs, locked architecture), `QuKi-Notes` (context stewardship, theming test enforcement, CI pipelines, Android WebView hardware boundaries), and the Lunar Surface Shader field case.

---

## File Organization and Conventions

- **Filename Prefixes as Sort Keys:** Prefixes (`00.01`, `01.00`, `02.00`, `10.01`) exist solely to align Obsidian explorer sorting with VitePress reading order.
- **Section Inlining:** Multi-file sections use `<!--@include: ./sub-note.md-->` within their master page (`00.01` and `00.10`). Sub-notes must start at heading level `##` (H2) and omit YAML frontmatter.
- **No Em-Dashes:** Strictly use standard ASCII hyphens (`-`). Never use `—` or `–`.
- **Title Case Headings:** All section and sub-section headers must use standard Title Case without code formatting or backticks.
- **Inline Annotations:** Use `<!-- TODO: ... -->` for hidden development notes and `> [!NOTE]` / `> [!WARNING]` for reader-facing callouts.
