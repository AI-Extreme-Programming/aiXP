# Editorial Voice & Style Guide

This guide defines the authorial voice, stylistic expectations, and structural standards for the **aiXP** manuscript, drawing heavily from the pragmatic, practitioner-first tradition of classic O'Reilly technical books.

Consult this document before drafting or editing any manuscript sections.

---

## 1. Core Voice and Stance

* **Practitioner-to-Practitioner:** Write as an engineer with dirt under their fingernails speaking directly to another engineer. Direct, unsentimental, unpretentious.
* **Zero Hype / Zero Marketing Fluff:** Absolutely no breathless AI enthusiasm ("revolutionary," "unlock," "game-changing," "seamless"). Treat AI as a fast, tireless, but context-blind collaborator that requires rigid guardrails.
* **Firm on Settled Stances:** 
  * *Vibe coding is not software engineering:* Treat this as settled; do not soften it.
  * *Software is bipedal:* Code and trust must move forward together. Generating code without manufacturing trust is reckless.
  * *Verification is the work:* When generation costs drop to near-zero, verification and judgment become the entire bottleneck.
* **Empirical Honesty:** Always distinguish clearly between:
  1. **Tested in production:** Practices run daily for months in real codebases.
  2. **Adapted by analogy:** Practices borrowed from classic XP, Lean, or SRE and modified for AI pairing.
  3. **Speculative:** Exploratory concepts not yet battle-tested.
* **No Fabrications:** Never invent case studies, metrics, or citations. Attribute all borrowed concepts to their origins.

---

## 2. The O'Reilly Practice Pattern (Structure for Part III)

When drafting or expanding practices in Part III, avoid dry academic checklists or feature matrices. Structure each practice around a consistent, problem-first engineering pattern:

1. **The Problem / Failure Mode:** What specific pain, bug, or failure occurs in the terminal if this practice is skipped? (e.g. the 40th diff rubber-stamped, unrequested refactors slipping in).
2. **The Mechanism:** What the practice is, defined simply in plain English.
3. **The Concrete Artifact:** What this looks like on disk (an actual prompt, a `CLAUDE.md` snippet, an ADR, a test harness, or a before/after diff).
4. **The Trade-Offs & Costs:** What this costs you (e.g. slower raw feature volume in exchange for zero latent defects; upfront markdown drafting before coding).
5. **Boundary Conditions (When NOT to use):** Explicit scenarios where the practice is overkill or counterproductive.

---

## 3. Working Dynamic: Navigator vs. Driver

When collaborating with an AI pair partner on this project:

* **Human = Navigator:** Holds the architecture, judgment, priority calls, and editorial direction.
* **AI = Driver:** Executes specific, bounded tasks cleanly and accurately.
* **Strict Discipline:** The AI must never invent priority tiers, improvise structure beyond what was requested, or assume judgment roles. Trust is manufactured through small, predictable, well-bounded steps.

---

## 4. Typography & Syntax Guardrails

* **No Em-Dashes (`—`):** The author writes exclusively with standard ASCII hyphens (`-`). Never use `—` or `–`.
* **File Prefixes as Sort Keys:** Prefixes like `00.01`, `00.02`, `05.02` are solely Obsidian sort keys. Skipped numbers are intentional sort boundaries, not missing content. Fractional numbers (e.g. `00.02.5`) are standard for intermediate insertions.
* **Wikilinks:** Use bare `[[wikilink]]` syntax in Obsidian notes and chat discussions (no code backticks, no `file://`).
* **Manuscript Callouts:** Use standard Obsidian/GitHub callouts (`> [!NOTE]`, `> [!TIP]`, `> [!WARNING]`, `> [!TODO]`). Use HTML comments (`<!-- TODO: ... -->`) for notes meant to stay hidden from the compiled VitePress book.

---

## 5. Concrete Visuals & Field Notes

* **Field Notes:** Include short, authentic anecdotes from real terminal sessions (e.g. hitting the 4-session working memory wall, catching subtle architectural drift, or handling a runaway subagent).
* **Clear Diagrams:** Use simple Mermaid flowcharts and topologies (e.g. the human-AI verification loop, Agent Role Topology) to anchor complex ideas visually.
