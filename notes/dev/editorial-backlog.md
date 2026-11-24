# Editorial Backlog and Manuscript Status

This document tracks editorial tasks, section-by-section revisits, and manuscript progress across the aiXP writing project.

---

## Manuscript Status Overview

The manuscript is organized into a cohesive 9-chapter practitioner workflow, framed by Front Matter and Back Matter. Multi-part sections (Preface and Introduction) compile into single long-form pages in VitePress via `<!--@include: ...-->` while preserving atomic notes in Obsidian.

| Section / Chapter | Sub-Notes (Included via `<!--@include-->`) | Status | Primary Next Step |
| :--- | :--- | :--- | :--- |
| [[docs/aixp/00.01.50-preface.md\|Front Matter]] | `00.01.60-how-to-read.md`, `00.01.70-conventions.md` | Polished | Single-page roll-up complete; author voice preserved verbatim |
| [[docs/aixp/00.02.50-introduction.md\|Introduction]] | `00.02.60-vibe-coding.md`, `00.02.70-xp-background.md`, `00.02.80-what-changed.md` | Polished | Single-page roll-up complete; Kent Beck callouts integrated |
| [[docs/aixp/01.01.50-manifesto.md\|Chapter 1: The Manifesto]] | n/a | Polished | Five pillars and operational rejection criteria complete |
| [[docs/aixp/01.02.50-intent-and-context.md\|Chapter 2: Intent and Context]] | n/a | Polished | Authentic artifacts integrated from BojuBot, QuKi-Notes, and Lunar Shader case study; Context Stewardship & Document Tiering in |
| [[docs/aixp/01.03.50-terminal-loop.md\|Chapter 3: The Terminal Loop]] | n/a | Polished | Core bones, two-level loop, 3-tier risk triage, and BojuBot/QuKi-Notes artifacts in |
| [[docs/aixp/01.04.50-judgment-and-roles.md\|Chapter 4: Judgment, Roles, and Cognitive Budgeting]] | n/a | Polished | Role topology, Load-Bearing brief rule, multi-agent Executive Review template & interrogation, Vigilance Budgeting, Human Reserved List |
| [[docs/aixp/01.05.50-field-protocol.md\|Field Protocol: The Loop in Practice]] | n/a | Polished | Master 3-subgraph lifecycle diagram, Primary->Sub-Agent dispatch, git worktree isolation, Lessons Ratchet, QuKi-Notes PR #350 case study |
| [[docs/aixp/02.05.50-verification-and-testing.md\|Chapter 5: Verification Strategy and Integration]] | n/a | Polished | 4-tier testing ladder, Agentic UI test-driving vs scripted assertions, Continuous Integration & Risk-Tiered Merge Authority |
| [[docs/aixp/02.06.50-delivery-and-release.md\|Chapter 6: Delivery, Release, and Observability]] | n/a | In Progress | ScooterGitTemplate commit/release-please rules and Zero Attribution + no-blame `mistakes.md` traceability integrated |
| [[docs/aixp/02.07.50-anti-patterns.md\|Chapter 7: What aiXP Is Not: Anti-Patterns and Traps]] | n/a | In Progress | Catalog of failure modes and traps: The Skimmed Read & Reassurance Trap callout integrated |
| [[docs/aixp/03.08.50-scaling.md\|Chapter 8: Scaling Beyond the Solo Practitioner]] | n/a | Draft | Multi-human, multi-agent collaboration patterns |
| [[docs/aixp/03.09.50-future-of-the-craft.md\|Chapter 9: The Future of the Craft]] | n/a | Draft | Long-horizon craft synthesis |
| [[docs/aixp/04.01.50-appendix-original-12.md\|Appendix A: Original 12 XP Practices]] | n/a | Polished | Kent Beck 1999 Extreme Programming reference |
| [[docs/aixp/04.02.50-appendix-ai-native-sdlc.md\|Appendix B: Field Comparison: aiXP and the AI-Native SDLC]] | n/a | In Progress | Field Comparison against Anthropic AI-Native SDLC playbook; positioning and divergence mapped |
| [[docs/aixp/04.03.50-bibliography.md\|Appendix C: Bibliography and Lineage]] | n/a | Polished | Citations linked; Jason Gorman, Dave Farley, Gojko Adzic, Kent Beck added |

---

## Active Editorial Tasks

### Priority 1: ScooterGitTemplate as the Official aiXP Template Repository
- [ ] **Establish as the Official aiXP Repository Starter:** Position `ScooterGitTemplate` as the reference GitHub template repository for practitioners starting an aiXP project.
- [ ] **Add Starter CI Templates (`.github/ci-templates/`):** Mirror the existing `.github/gitignore-templates/` structure by adding turnkey CI workflows for common environments (Node.js, Python, C++, Unity, Unreal Engine) incorporating `reusable-actionlint.yml`, static typechecking, linting, and automated unit test execution.
- [ ] **Add ADR / Feature Spec Starter Kit:** Add a minimal `notes/dev/specs/` or `notes/dev/adr/` directory with a standardized markdown template (`0001-template.md`: Context, Decision, Consequences, Status, Out of Scope) to encourage Spec-First Prompting from day zero.
- [ ] **Feature in Manuscript:** Reference `ScooterGitTemplate` in Chapter 2 (Context Stewardship), Chapter 6 (Delivery and Release), and Front Matter (`00.01.70-conventions.md`) as the companion starter repo.

### Priority 2: Chapter 3 Iteration ([01.03.50-terminal-loop.md](docs/aixp/01.03.50-terminal-loop.md))
- [x] **Establish Structural Bones:** Integrated the Inner Terminal Loop diagram, connectionist context-window overfitting framing, two-level Primary-to-Sub-Agent loop + 3-tier risk triage, Outer Red Lock vs. Inner Driver TDD (with `QuKi-Notes` PR #358 A/B verification example), Perception-Gated Work (*Instrumented Tweaking* and *Pseudocode-Down*), the `BojuBot` Phase 1 `AgentBackend` pure-refactor seam artifact, and Kent Beck's Four Rules of Simple Design / Lean waste attribution.
- [ ] **Iterate on Flow & Multi-Stack Examples (see [sibling-repos-field-cases.md](notes/dev/sibling-repos-field-cases.md)):**
  - Consider adding C++ (`CambrianaCore` allocator failure injection / floating-point determinism) or Android/Kotlin (`UplinkStatus` pure-JVM `ProbeEngine` seam extraction) alongside `BojuBot` and `QuKi-Notes`.

### Priority 3: Cross-Repo Field Cases for Chapters 4-8 (Full Catalog in [sibling-repos-field-cases.md](notes/dev/sibling-repos-field-cases.md))
- [ ] **Chapter 2 Optional Additions ([01.02.50-intent-and-context.md](docs/aixp/01.02.50-intent-and-context.md)):**
  - `QuKi-Notes`: "The Word Is Usually the Bug" (how "database" caused agents to build a stateful registry) & the 6-Tier Hierarchy of Truth for legacy rewrites.
  - `CambrianaCore`: Formal `SRS` / `SDD` / `FMT` / `ATS` spec constellations for zero-tolerance systems.
- [ ] **Chapter 4 ([01.04.50-judgment-and-roles.md](docs/aixp/01.04.50-judgment-and-roles.md)):**
  - [x] Aligned `Agent Role Topology`, `Executive Code Review`, and `Vigilance Budgeting` with Chapter 3's 3-tier risk-triage model and the `QuKi-Notes` / `CambrianaCore` **load-bearing vs. reversible** sub-agent briefing rule.
  - [x] Added `The Human Reserved List` callout (destructive ops, security/auth, schema drops/rollbacks, budget ceilings).
  - [x] Added executable prompt template for read-only Executive Code Review agent (dead code, god classes, real defects, ranked by severity).
  - [ ] `QuKi-Notes_devops`: Physical session directories (`Agents/quiki-spec`, `quiki-dev`, `quiki-devops`, `quiki-docs`) + independent Spec A/B test verification.
  - [ ] `BojuStudio_devops_agent`: Portable git-tracked agent memory (`notes/dev/memory/MEMORY.md`).
- [ ] **Field Protocol ([01.05.50-field-protocol.md](docs/aixp/01.05.50-field-protocol.md)):**
  - [x] Added master three-subgraph lifecycle diagram (Outer Intent Loop -> Inner Terminal Loop -> Release & Integration Gates).
  - [x] Added Primary-to-Sub-Agent dispatch diagram, Git worktree isolation (`git worktree`), and `The Lessons Ratchet` callout.
  - [x] Integrated real `QuKi-Notes` PR #350 case study across rounds 1-3.
- [ ] **Chapter 5 ([02.05.50-verification-and-testing.md](docs/aixp/02.05.50-verification-and-testing.md)):**
  - [x] Aligned `Continuous Integration and Risk-Tiered Merge Authority` and `Regression Suite Maintenance` with the 3-tier risk-triage spectrum (including `RepoWatch`'s static source guard and low-stakes direct-to-`main` exception).
  - [x] Added `Agentic UI Test-Driving vs. Scripted Assertions` (Playwright autonomous driver vs deterministic assertions).
  - [ ] `GitHubDHC`: Headless AppImage + `xvfb-run` WCAG AA contrast and DOM drift harness for a buildless CSS theme.
  - [ ] `PosseRenkei`: Live sandbox testing (`just live-test`) when vendor SDKs/docs lie (Bluesky video upload, GitHub API headers) + independent HTTP read-back verification.
  - [ ] `BojuVue`: Testing the packed tarball (`package.exports.test.ts`) for SSR and export map integrity.
  - [ ] `aiXP`: Automated PDF/X-1a print preflight (`check-pdfx.py`).
- [ ] **Chapter 6 ([02.06.50-delivery-and-release.md](docs/aixp/02.06.50-delivery-and-release.md)):**
  - [x] Integrated `ScooterGitTemplate` Conventional Commits + `release-please` + `pre-release-staging/{tag}` workflow and replaced false AI attribution claims with Zero AI Attribution + no-blame `mistakes.md` / `MEMORY.md` operational learning.
  - [ ] `report-relay_dev`: Zero-dependency 4-file Cloudflare Worker for in-app GitHub issue reporting.
- [ ] **Chapter 7 ([02.07.50-anti-patterns.md](docs/aixp/02.07.50-anti-patterns.md)):**
  - [x] Added `The Skimmed Read` anti-pattern (truncated tool reads missing negative constraints).
  - [x] Added `The Reassurance Trap: When "Not a Bug" Is Definitely a Bug` callout.
  - [ ] `QuKi-Notes_devops`: The "Green Test Mirage" - Phase 3.59 cold-launch Android keyboard focus marked "Complete" across four PRs in widget tests while failing on hardware, resolved by killing the code and changing the requirement (`#342`).
  - [ ] `GOMAC` & `UE_StageHand`: Respecting air-gapped hardware (*TheFlea* on the Sprinter van) and unautomated lifecycle stages (live Unreal Editor Slate overlays).
- [ ] **Chapter 8 ([03.08.50-scaling.md](docs/aixp/03.08.50-scaling.md)):**
  - `aiXP`: Git worktree isolation (`git worktree add ../aiXP-<slug>`) against background auto-commit daemons (`obsidian-git`).
  - `GOMAC`: Separating Claude-specific rules (`CLAUDE.md`) from tool-agnostic team docs (`notes/dev/gomac-project-overview.md`).

### Completed Milestones
- [x] **Full 9-Chapter TOC Restructuring:** Eliminated historical silos ("carried over" vs. "new" vs. "devops") in favor of a sequential 9-chapter practitioner workflow.
- [x] **Obsidian / VitePress Filename Synchronization:** Refactored filenames so the primary number matches the part and chapter (`01.01.50`, `01.02.50`, etc.), keeping Obsidian directory sorting in sync with the VitePress sidebar.
- [x] **Single-Page Section Architecture:** Configured VitePress `<!--@include: ...-->` directives in `00.01.50-preface.md` and `00.02.50-introduction.md` while preserving atomic notes in Obsidian.
- [x] **Right-Hand Sidebar H3 Headings:** Configured `outline: { level: [2, 3], label: 'On this page' }` in `docs/.vitepress/config.mts`.
- [x] **Preface Restoration:** Restored author's original approved text verbatim in `00.01.50-preface.md`; moved mechanical conventions into `00.01.70-conventions.md`.
- [x] **Chapter 2 Authentic Artifacts:** Replaced synthetic examples with authentic production excerpts from `BojuBot` (feature specs, locked architecture), `QuKi-Notes` (context stewardship, theming test enforcement, CI pipelines, Android WebView hardware boundaries), and the Lunar Surface Shader field case.
- [x] **Sibling Repository Fleet Survey:** Cataloged 16 active repositories across 8 technology stacks in [sibling-repos-field-cases.md](notes/dev/sibling-repos-field-cases.md).
- [x] **Working-Loop & Zero-Attribution Alignment (Chapters 3-6 & Field Protocol):** Replaced 1-on-1 human-reads-every-diff assumptions, synthetic 2-terminal processes, and false AI attribution claims across `01.03.50`, `01.04.50`, `01.05.50`, `02.05.50`, and `02.06.50`.

---

## File Organization and Conventions

- **Filename Prefixes as Sort Keys:** Prefixes (`00.01`, `01.00`, `02.00`, `10.01`) exist solely to align Obsidian explorer sorting with VitePress reading order.
- **Section Inlining:** Multi-file sections use `<!--@include: ./sub-note.md-->` within their master page (`00.01` and `00.10`). Sub-notes must start at heading level `##` (H2) and omit YAML frontmatter.
- **No Em-Dashes:** Strictly use standard ASCII hyphens (`-`). Never use `—` or `–`.
- **Title Case Headings:** All section and sub-section headers must use standard Title Case without code formatting or backticks.
- **Inline Annotations:** Use `<!-- TODO: ... -->` for hidden development notes and `> [!NOTE]` / `> [!WARNING]` for reader-facing callouts.
