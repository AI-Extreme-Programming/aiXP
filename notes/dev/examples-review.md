# Examples Review: Chapter 2 (Intent and Context)

This note captures an unvarnished assessment of how the production artifacts from sibling repositories (`BojuBot` and `QuKi-Notes`) map into [[02.50-intent-and-context|Chapter 2 (Intent and Context)]].

---

## Executive Summary

All four examples in Chapter 2 are now **rock solid, 10/10 direct fits** grounded in authentic production work, practitioner experience, and technical reality.

---

## Detailed Section Breakdown

### 1. Spec-First Prompting
- **Artifact:** `BojuBot/notes/dev/specs/agent-backends-spec.md` (Antigravity CLI / `AgentBackend` seam spec)
- **Rating:** 10/10 (Rock solid)
- **Why It Works:**
  - Authored on the `dev` branch *before* implementation code was generated.
  - Phased milestone gating (`Phase 0-3`) explicitly defines what is "Shippable on its own" versus internal milestones.
  - Documents empirical Windows CLI research findings (`--print` behavior) versus unverified design intent.
  - Settles low-level NDJSON input/output contracts and explicit non-goals (e.g. forbidding SQLite database parsing).

### 2. Domain Gap Surfacing
- **Framework & Artifacts:** The 80/20 Polymath & Sandboxed Tutor protocol; Field Case: The Lunar Surface Shader; `QuKi-Notes/CLAUDE.md` (Android WebView boundary and `[Proposed - unconfirmed]` convention).
- **Rating:** 10/10 (Rock solid after grounding in the 80/20 polymath workflow)
- **Why It Works:**
  - Diagnoses the breakdown of Kent Beck's 1999 "On-Site Customer" and the AI inversion ("The Imposter Customer" that hallucinates domain rules with zero hesitation).
  - Establishes a four-step teachable protocol: Gap Trigger -> Sandboxed Tutor (epistemic isolation) -> Reverse-Grill Feynman Bar ("you haven't learned it until you can teach it") -> Spec Authoring.
  - Uses the lunar surface shader case study to show how naive AI generation (Lambertian billiard ball) fails physically without domain understanding of retroreflective regolith and the opposition surge.
  - Bridges into client tooling via QuKi Notes' hardware isolation and proposal firewalling.

### 3. Context Stewardship
- **Artifacts:** `QuKi-Notes/CLAUDE.md` ("Keeping This File Current") and `BojuBot/CLAUDE.md` ("Architecture (locked - don't revisit without discussion)")
- **Rating:** 10/10 (Home run)
- **Why It Works:**
  - The QuKi Notes directive defines the operational lifecycle of repository memory: update the context file in the same commit as the code, and omit narrative history so prompt context remains dense and current.
  - BojuBot's locked architecture list demonstrates the direct payoff: preventing stateless AI sessions from re-introducing Windows shell quoting bugs or wasting token budget re-debating settled decisions.

### 4. Coding Standards as Context Infrastructure
- **Artifacts:** `QuKi-Notes/CLAUDE.md` (Theming rules, CI mandate, autonomy bounds, two-strike rule) and `QuKi-Notes/.github/workflows/ci.yml` (actionlint, typecheck, lint, test)
- **Rating:** 10/10 (Rock solid after CI & mechanical test integration)
- **Why It Works:**
  - Solves the "soft prompt" failure mode: natural language admonitions to write clean code are backed by mechanical, automated verification.
  - Demonstrates coding standards literally written as unit tests: `colourVariables.test.ts` fails in CI if an agent uses hardcoded colors or literal font families instead of Obsidian CSS variables.
  - Documents the two-layer defense: `CLAUDE.md` directs the agent to discover and satisfy CI commands locally before committing; GitHub Actions CI (`actionlint` -> `typecheck` -> `test`) enforces it deterministically before merge.
  - Pairs mechanical standards with explicit autonomy limits ("STATE THE CONSTRAINT AND STOP" and "Two-strike auto-comply") to prevent agent improvisation when hitting blockers.

---

## Current Status and Completed Refinements

1. **Section 4 (Coding Standards):** Updated in [[02.50-intent-and-context|Chapter 2]] to feature the full two-layer architecture: prompt directives in `CLAUDE.md`, mechanical test suites enforcing styling (`colourVariables.test.ts`), and the automated multi-package CI pipeline (`ci.yml`).
2. **Section 2 (Domain Gap Surfacing):** Restructured around the **80/20 Polymath and Sandboxed Tutor** protocol, featuring the **Lunar Surface Shader** field case (retroreflective regolith / opposition surge vs naive Lambertian AI generation) and backed by the automated reverse-grill Feynman bar ("until I can teach it"). Supported by QuKi Notes' hardware isolation and proposal firewalling.
