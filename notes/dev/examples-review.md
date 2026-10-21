# Examples Review: Chapter 2 (Intent and Context)

This note captures an unvarnished assessment of how the production artifacts from sibling repositories (`BojuBot` and `QuKi-Notes`) map into [[docs/aixp/02.00-intent-and-context|Chapter 2 (Intent and Context)]].

---

## Executive Summary

Two of the four examples are **rock solid, direct fits** (Spec-First Prompting and Context Stewardship).
The other two (Domain Gap Surfacing and Coding Standards) are **valuable, authentic artifacts**, but reveal a slight conceptual stretch or title mismatch between the abstract chapter outline and actual repository practice.

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
- **Artifacts:** `QuKi-Notes/CLAUDE.md` (Autonomy bounds and "Two-strike auto-comply") and `BojuBot/CLAUDE.md` (5-step bug fix workflow)
- **Rating:** 6.5/10 (Great material, but semantic mismatch with the title)
- **Why It Works:**
  - The "Two-strike auto-comply" rule, "STATE THE CONSTRAINT AND STOP", and the 5-step bug fix workflow are standout, battle-tested agent interaction constraints.
- **Where the Mismatch Is:**
  - The title is "Coding Standards as Context Infrastructure". Developers hear "coding standards" and think formatting, linting, naming conventions, or style rules.
  - The featured excerpt actually demonstrates **Agent Autonomy Bounds and Interaction Protocols**.
  - Note: QuKi Notes *does* have hard coding standards enforced by tests (e.g. the CSS variable rule requiring Obsidian `--background-primary` variables, with tests failing if literal fonts or undeclared colors are used), but those were not featured in favor of the autonomy rules.

---

## Recommendations for Refinement

1. **Section 4 (Coding Standards):**
   - *Option A (Adjust the content):* Keep the title "Coding Standards as Context Infrastructure" and incorporate QuKi Notes' automated theme/variable test rules alongside the red/green testing requirement.
   - *Option B (Adjust the heading):* Rename the section to **"Operational Constraints as Context Infrastructure"** (or *Interaction Protocols*), making the "Two-Strike" and "Stop when blocked" rules a seamless fit.
2. **Section 2 (Domain Gap Surfacing):**
   - Add a brief bridging sentence clarifying that in cross-platform systems engineering, platform runtime boundaries (OS, hardware, WebView) represent the highest-risk domain gaps.
