# Editorial Backlog and Manuscript Status

This document tracks editorial tasks, section-by-section revisits, and manuscript progress across the aiXP writing project.

---

## Manuscript Status Overview

The manuscript is organized into a cohesive 9-chapter practitioner workflow, framed by Front Matter and Back Matter. Multi-part sections (Preface and Introduction) compile into single long-form pages in VitePress via `<!--@include: ...-->` while preserving atomic notes in Obsidian.

| Section / Chapter | Master Page | Sub-Notes (Included via `<!--@include-->`) | Status | Primary Next Step |
|---|---|---|---|---|
| **Front Matter** | `00.01.50-preface.md` | `00.01.60-how-to-read.md`, `00.01.70-conventions.md` | Polished | Single-page roll-up complete; author voice preserved verbatim |
| **Introduction** | `00.02.50-introduction.md` | `00.02.60-vibe-coding.md`, `00.02.70-xp-background.md`, `00.02.80-what-changed.md` | Polished | Single-page roll-up complete; Kent Beck callouts integrated |
| **Chapter 1** | `01.01.50-manifesto.md` | n/a | Polished | Four pillars and operational rejection criteria complete |
| **Chapter 2** | `01.02.50-intent-and-context.md` | n/a | Polished | Authentic artifacts integrated from BojuBot, QuKi-Notes, and Lunar Shader case study |
| **Chapter 3** | `01.03.50-terminal-loop.md` | n/a | In Progress | Core bones, Inner Loop diagram, Perception-Gated Work, and BojuBot seam artifact in; iterate on prose and additional stack examples |
| **Chapter 4** | `01.04.50-judgment-and-roles.md` | n/a | Draft | Expand Agent Role Topology and Vigilance Budgeting with real field data |
| **Field Protocol** | `01.05.50-field-protocol.md` | n/a | Draft | Verify alignment with Chapters 2-4 terminology |
| **Chapter 5** | `02.05.50-verification-and-testing.md` | n/a | Draft | Integrate real CI / regression test harnesses across stacks |
| **Chapter 6** | `02.06.50-delivery-and-release.md` | n/a | Draft | Feature Release-Please, conventional commits, and pre-release staging workflows |
| **Chapter 7** | `02.07.50-anti-patterns.md` | n/a | Draft | Catalog of failure modes and traps |
| **Chapter 8** | `03.08.50-scaling.md` | n/a | Draft | Multi-human, multi-agent collaboration patterns |
| **Chapter 9** | `03.09.50-future-of-the-craft.md` | n/a | Draft | Long-horizon craft synthesis |
| **Appendix A** | `04.01.50-appendix-original-12.md` | n/a | Polished | Kent Beck 1999 Extreme Programming reference |
| **Appendix B** | `04.02.50-appendix-ai-native-sdlc.md` | n/a | Draft | Compare against Anthropic AI-Native SDLC playbook and enterprise frameworks |
| **Appendix C** | `04.03.50-bibliography.md` | n/a | Polished | Citations linked; drafting prompts removed |

---

## Active Editorial Tasks

### Priority 1: ScooterGitTemplate as the Official aiXP Template Repository
- [ ] **Establish as the Official aiXP Repository Starter:** Position `ScooterGitTemplate` as the reference GitHub template repository for practitioners starting an aiXP project.
- [ ] **Add Starter CI Templates (`.github/ci-templates/`):** Mirror the existing `.github/gitignore-templates/` structure by adding turnkey CI workflows for common environments (Node.js, Python, C++, Unity, Unreal Engine) incorporating `reusable-actionlint.yml`, static typechecking, linting, and automated unit test execution.
- [ ] **Add ADR / Feature Spec Starter Kit:** Add a minimal `notes/dev/specs/` or `notes/dev/adr/` directory with a standardized markdown template (`0001-template.md`: Context, Decision, Consequences, Status, Out of Scope) to encourage Spec-First Prompting from day zero.
- [ ] **Feature in Manuscript:** Reference `ScooterGitTemplate` in Chapter 2 (Context Stewardship), Chapter 6 (Delivery and Release), and Front Matter (`00.01.70-conventions.md`) as the companion starter repo.

### Priority 2: Chapter 3 Iteration ([01.03.50-terminal-loop.md](docs/aixp/01.03.50-terminal-loop.md))
- [x] **Establish Structural Bones:** Integrated the Inner Terminal Loop diagram, connectionist context-window overfitting framing, Outer Red Lock vs. Inner Driver TDD, Perception-Gated Work (*Instrumented Tweaking* and *Pseudocode-Down*), the `BojuBot` Phase 1 `AgentBackend` pure-refactor seam artifact, and Kent Beck's Four Rules of Simple Design / Lean waste attribution.
- [ ] **Iterate on Flow & Multi-Stack Examples (see [sibling-repos-field-cases.md](notes/dev/sibling-repos-field-cases.md)):**
  - Consider adding C++ (`CambrianaCore` allocator failure injection / floating-point determinism) or Android/Kotlin (`UplinkStatus` pure-JVM `ProbeEngine` seam extraction) alongside `BojuBot` and `QuKi-Notes`.

### Priority 3: Cross-Repo Field Cases for Chapters 4-8 (Full Catalog in [sibling-repos-field-cases.md](notes/dev/sibling-repos-field-cases.md))
- [ ] **Chapter 2 Optional Additions ([01.02.50-intent-and-context.md](docs/aixp/01.02.50-intent-and-context.md)):**
  - `QuKi-Notes`: "The Word Is Usually the Bug" (how "database" caused agents to build a stateful registry) & the 6-Tier Hierarchy of Truth for legacy rewrites.
  - `CambrianaCore`: Formal `SRS` / `SDD` / `FMT` / `ATS` spec constellations for zero-tolerance systems.
- [ ] **Chapter 4 ([01.04.50-judgment-and-roles.md](docs/aixp/01.04.50-judgment-and-roles.md)):**
  - `QuKi-Notes_devops`: Physical session directories (`Agents/quiki-spec`, `quiki-dev`, `quiki-devops`, `quiki-docs`) + independent Spec A/B test verification.
  - `QuKi-Notes` & `CambrianaCore`: The **load-bearing vs. reversible** sub-agent briefing test.
  - `BojuStudio_devops_agent`: Portable git-tracked agent memory (`notes/dev/memory/MEMORY.md`).
- [ ] **Chapter 5 ([02.05.50-verification-and-testing.md](docs/aixp/02.05.50-verification-and-testing.md)):**
  - `GitHubDHC`: Headless AppImage + `xvfb-run` WCAG AA contrast and DOM drift harness for a buildless CSS theme.
  - `PosseRenkei`: Live sandbox testing (`just live-test`) when vendor SDKs/docs lie (Bluesky video upload, GitHub API headers) + independent HTTP read-back verification.
  - `RepoWatch` (*Smokey*): Turning a 3-time recurring repo-rename bug into a static source-text Playwright guard (`tests/lint-repo-matching.spec.js`).
  - `BojuVue`: Testing the packed tarball (`package.exports.test.ts`) for SSR and export map integrity.
  - `aiXP`: Automated PDF/X-1a print preflight (`check-pdfx.py`).
- [ ] **Chapter 6 ([02.06.50-delivery-and-release.md](docs/aixp/02.06.50-delivery-and-release.md)):**
  - `BojuStudio_devops_agent` & `ScottKirvan/.github`: Reusable workflows, `release-please`, and two-stage AI release notes (`pre-release-staging/{tag}`).
  - `RepoWatch` vs. `CambrianaCore`: Risk-calibrated merge authority (direct-to-`main` low-stakes exception vs. 3-compiler fingerprint gates).
  - `report-relay_dev`: Zero-dependency 4-file Cloudflare Worker for in-app GitHub issue reporting.
- [ ] **Chapter 7 ([02.07.50-anti-patterns.md](docs/aixp/02.07.50-anti-patterns.md)):**
  - `QuKi-Notes_devops`: The "Green Test Mirage" - Phase 3.59 cold-launch Android keyboard focus marked "Complete" across four PRs in widget tests while failing on hardware, resolved by killing the code and changing the requirement (`#342`).
  - `GOMAC` & `UE_StageHand`: Respecting air-gapped hardware (*TheFlea* on the Sprinter van) and unautomated lifecycle stages (live Unreal Editor Slate overlays).
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

---

## File Organization and Conventions

- **Filename Prefixes as Sort Keys:** Prefixes (`00.01`, `01.00`, `02.00`, `10.01`) exist solely to align Obsidian explorer sorting with VitePress reading order.
- **Section Inlining:** Multi-file sections use `<!--@include: ./sub-note.md-->` within their master page (`00.01` and `00.10`). Sub-notes must start at heading level `##` (H2) and omit YAML frontmatter.
- **No Em-Dashes:** Strictly use standard ASCII hyphens (`-`). Never use `—` or `–`.
- **Title Case Headings:** All section and sub-section headers must use standard Title Case without code formatting or backticks.
- **Inline Annotations:** Use `<!-- TODO: ... -->` for hidden development notes and `> [!NOTE]` / `> [!WARNING]` for reader-facing callouts.
