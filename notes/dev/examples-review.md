# Examples Review: Chapter 2 (Intent and Context)

This note captures an unvarnished assessment of how the production artifacts from sibling repositories (`BojuBot` and `QuKi-Notes`) map into [[docs/aixp/02.00-intent-and-context|Chapter 2 (Intent and Context)]].

---

## Executive Summary

Three of the four examples are **rock solid, 10/10 direct fits** (Spec-First Prompting, Context Stewardship, and Coding Standards via CI/automated tests).
The remaining one (Domain Gap Surfacing) is a **compelling, authentic artifact** showing how hardware boundaries and unconfirmed architectural conjectures are isolated under fire.

---

## Detailed Section Breakdown

### 1. Spec-First Prompting
- **Artifact:** `BojuBot/notes/dev/specs/agent-backends-spec.md` (Antigravity CLI / `AgentBackend` seam spec)
- **Rating:** 10/10 (Rock solid)
- **Why It Works:**
  - Authored on the `dev` branch *before* implementation code was generated.
  - Phased milestone gating (`Phase 0-3`) explicitly defines what is "Shippable on its own" versus internal milestones.
  - Documents empirical Windows CLI research findings (`--print` behavior) versus unverified design intent.
  - Settle low-level NDJSON input/output contracts and explicit non-goals (e.g. forbidding SQLite database parsing).

### 2. Domain Gap Surfacing
- **Artifact:** `QuKi-Notes/CLAUDE.md` (Android WebView text input boundary and `[Proposed - unconfirmed]` convention)
- **Rating:** 7.5/10 (Strong, with one nuance)
- **Why It Works:**
  - The `[Proposed - unconfirmed]` convention is an exact, mechanical hit for the core premise: forcing the AI to visibly tag speculative architectural proposals so they are not mistaken for settled decisions.
  - The Android WebView input note isolates a physical hardware boundary where synthetic desktop test suites pass, but real mobile keyboard behavior can only be confirmed on a physical device.
- **Where the Stretch Is:**
  - "Domain Gap" in standard software architecture typically implies business domain rules (accounting, tax, healthcare regulations).
  - In cross-platform client tooling, the platform runtime (OS, WebView, IME) effectively *is* the domain. However, a reader expecting a business-logic gap may feel the term is slightly reframed.

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

1. **Section 4 (Coding Standards):** Updated in [[docs/aixp/02.00-intent-and-context|Chapter 2]] to feature the full two-layer architecture: prompt directives in `CLAUDE.md`, mechanical test suites enforcing styling (`colourVariables.test.ts`), and the automated multi-package CI pipeline (`ci.yml`).
2. **Section 2 (Domain Gap Surfacing):** Grounded in the reality that for cross-platform client and developer tooling, platform runtime boundaries (OS, WebView, mobile IME) represent the highest-risk domain gaps where synthetic tests pass but only physical hardware verification holds truth.
