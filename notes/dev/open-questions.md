# Open Questions and Settled Design Decisions

This document tracks active architecture debates, resolved method questions, and open editorial considerations for the **aiXP** manuscript.

---

## Active Open Questions

1. **Automation Ceilings on Merge Verification:**
   How far can continuous integration and automated test suites carry merge verification before the "final human review pass" inevitably degenerates into a superficial rubber stamp? (Explored in Chapter 5 and Chapter 6).
2. **Agent Role Topology Notation:**
   Does Agent Role Topology need a formal notation (like a modified RACI matrix or prompt schema) to be easily teachable to enterprise teams, or does that over-formalize something best communicated as a pragmatic division between Lead/Spec, Scoped Implementers, and Independent Executive Reviewers?
3. **Packaging `ScooterGitTemplate` for the Community:**
   How should `ScooterGitTemplate` be positioned and maintained alongside the monograph? 
   - Should it include ready-to-use `.github/ci-templates/` (matching the existing `.github/gitignore-templates/`) so that teams have immediate turnkey CI for Node, Python, C++, Unity, and Unreal?
   - Should it include an ADR/spec template directory (`notes/dev/specs/`) to jumpstart Spec-First Prompting?
4. **Metaphor in the AI Era:**
   Kent Beck's original 12 XP practices included "System Metaphor" (a shared story or conceptual vocabulary that everyone on the team uses to describe how the system works). In human-AI pairing, does Metaphor simply map onto ubiquitous naming conventions anchored in Context Stewardship (`CLAUDE.md`), or is it obsolete now that the AI holds and queries the literal AST and architecture directly?

---

## Settled Design Decisions

1. **Manifesto Architecture (Settled):**
   - *Decision:* Rejected the classic Agile Manifesto "A over B" value-pair syntax in favor of **Four Pillars paired with Operational Rejection Criteria**.
   - *Rationale:* In machine-speed development, value-pairs are too easily rationalized away. Rejection criteria provide concrete, falsifiable gating tests (e.g., *"If generated code cannot be verified mechanically, it is rejected"*).
   - *Location:* [[docs/aixp/01.00-manifesto|01.00-manifesto.md]].

2. **The "On-Site Customer" Resolution (Settled):**
   - *Decision:* In human-AI pairing (especially in teams of 1 to N), the On-Site Customer is neither an impossible full-time human in the bullpen nor an AI "imposter customer." It is replaced by the **80/20 Polymath and Sandboxed Tutor** protocol.
   - *Rationale:* The human Navigator uses an isolated, non-coding research session to rapidly acquire 80% domain competency, gated by the Feynman bar: *you haven't learned it until you can teach it.* Once the developer can pass an automated reverse-grill, they step into the coding loop as the authentic domain authority.
   - *Location:* [[02.50-intent-and-context|02.00-intent-and-context.md]].

3. **Manuscript Format and Scope (Settled):**
   - *Decision:* A 9-chapter practitioner monograph published via VitePress and maintained in an Obsidian vault.
   - *Rationale:* Avoids the historical silos ("carried over" vs. "new" vs. "devops") in favor of an active practitioner workflow (Intent -> Terminal Loop -> Judgment -> Verification -> Delivery -> Scale -> Modern Landscape -> Anti-Patterns).
   - *Page Architecture:* Multi-part sections (Preface and Introduction) compile into single comprehensive pages using VitePress `<!--@include: ...-->` while keeping atomic notes in Obsidian.

4. **Authorial Voice Integrity (Settled):**
   - *Decision:* The author's approved prose (especially in the Preface and Manifesto) is locked and out-of-bounds for unprompted AI rewrites or paraphrasing.
   - *Rationale:* The human Navigator holds the voice, philosophy, and priority calls. The AI Driver operates strictly within bounded tasks.
