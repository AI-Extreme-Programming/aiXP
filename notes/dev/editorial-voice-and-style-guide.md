# Editorial Voice & Style Guide

This guide defines the authorial voice, stylistic expectations, and structural standards for the **aiXP** manuscript, drawing heavily from the pragmatic, practitioner-first tradition of classic O'Reilly technical books (reference: [O'Reilly Style Guide](https://oreillymedia.github.io/production-resources/styleguide/)).

Consult this document before drafting or editing any manuscript sections.

---

## 1. Core Voice and Stance

* **Practitioner-to-Practitioner:** Write as an engineer with dirt under their fingernails speaking directly to another engineer. Direct, unsentimental, unpretentious.
* **Conversational First-Person:** Use first-person ("I" / "we"), active verbs, and contractions to maintain a readable, collaborative tone, as recommended in the O'Reilly guide.
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

## 4. Headings & Formatting Rules (O'Reilly Conventions)

* **No Code Font in Headings:** Headings must *never* contain inline code formatting, bold, italics, or raw filenames. Write `### Using CLAUDE.md in Sessions`, not `### Using `CLAUDE.md` in Sessions`. Save monospace backticks for body text.
* **No Stacked Headings:** Every heading must be followed immediately by introductory body text. Never place an H2 directly above an H3, and never follow a heading directly with a bullet list or callout without an orienting sentence.
* **Title Case for Headings:** Use standard Title Case for all major headings and chapter titles (e.g. *What Changed When AI Joined the Team* rather than sentence case).
* **Expand Acronyms on First Use:** Spell out acronyms on their first occurrence in each chapter (e.g. *Architecture Decision Records (ADRs)*, *Test-Driven Development (TDD)*, *Software Development Life Cycle (SDLC)*).
* **Descriptive Links:** Never use generic link text like "click here" or bare URLs. Use descriptive anchor text (e.g. `[Manifesto for Agile Software Development](https://agilemanifesto.org/)`).

---

## 5. Typography & Syntax Guardrails

* **No Em-Dashes (`—`):** The author writes exclusively with standard ASCII hyphens (`-`). Never use `—` or `–`.
* **Filename Prefixes as Sort Keys:** Prefixes like `00.01`, `00.02`, `05.02` are solely Obsidian sort keys. Skipped numbers are intentional sort boundaries, not missing content. Fractional numbers (e.g. `00.02.5`) are standard for intermediate insertions.
* **Markdown Links (No Wikilinks):** Use standard Markdown link syntax `[Label](path.md)` throughout the manuscript, dev notes, and chat discussions. Do not use `[[wikilinks]]`. This ensures native compatibility with VitePress site generation and portability across tools while working seamlessly in Obsidian.
* **Manuscript Callouts:** Use standard Obsidian/GitHub callouts (`> [!NOTE]`, `> [!TIP]`, `> [!WARNING]`, `> [!TODO]`). Use HTML comments (`<!-- TODO: ... -->`) for notes and annotations meant to stay hidden from the compiled VitePress book.

---

## 6. Concrete Visuals & Field Notes

* **Field Notes:** Include short, authentic anecdotes from real terminal sessions (e.g. hitting the 4-session working memory wall, catching subtle architectural drift, or handling a runaway subagent).
* **Clear Diagrams:** Use simple Mermaid flowcharts and topologies (e.g. the human-AI verification loop, Agent Role Topology) to anchor complex ideas visually.
