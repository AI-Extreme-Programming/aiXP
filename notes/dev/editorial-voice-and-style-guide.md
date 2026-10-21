# Editorial Voice and Style Guide

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
* **No Fabrications:** Never invent case studies, code examples, metrics, or citations. All code snippets and prompts must be sourced directly from authentic production work (e.g. `BojuBot`, `QuKi-Notes`, `ScooterGitTemplate`).

---

## 2. The O'Reilly Practice Pattern (Structure for Chapters 2 through 6)

When drafting or expanding practices in Chapters 2 through 6 (The Practice Core), avoid dry academic checklists or feature matrices. Structure each practice around a consistent, problem-first engineering pattern:

1. **The Problem / Failure Mode:** What specific pain, bug, or failure occurs in the terminal if this practice is skipped? (e.g. the 40th diff rubber-stamped, unrequested refactors slipping in).
2. **The Mechanism:** What the practice is, defined simply in plain English.
3. **The Production Artifact:** What this looks like on disk (an actual prompt, a `CLAUDE.md` excerpt, a real spec, a test harness, or a before/after diff from living repositories). Avoid the label "concrete" in headings.
4. **The Trade-Offs and Costs:** What this costs you (e.g. slower raw feature volume in exchange for zero latent defects; upfront markdown drafting before coding).
5. **Boundary Conditions (When NOT to use):** Explicit scenarios where the practice is overkill or counterproductive.

---

## 3. Working Dynamic: Navigator vs. Driver

When collaborating with an AI pair partner on this project:

* **Human = Navigator:** Holds the architecture, judgment, priority calls, and editorial voice.
* **AI = Driver:** Executes specific, bounded tasks cleanly and accurately within stated requirements.
* **Authorial Voice Integrity:** The author's approved personal prose (in Preface, Manifesto, and personal field notes) is settled law and strictly out-of-bounds for unprompted paraphrasing or "polishing". Structural additions may be appended alongside approved text, but the author's words are never rewritten without explicit, line-by-line direction.
* **Strict Autonomy Bounds:** The AI must never invent priority tiers, improvise structure beyond what was requested, or assume judgment roles. If blocked or unable to satisfy a request, the AI must state the constraint and stop.

---

## 4. Headings and Formatting Rules

* **No Code Font in Headings:** Headings must *never* contain inline code formatting, bold, italics, or raw filenames. Write `### Using CLAUDE.md in Sessions`, not `### Using `CLAUDE.md` in Sessions`. Save monospace backticks for body text.
* **No Stacked Headings:** Every heading must be followed immediately by introductory body text. Never place an H2 directly above an H3, and never follow a heading directly with a bullet list or callout without an orienting sentence.
* **Title Case for Headings:** Use standard Title Case for all major headings and chapter titles (e.g. *What Changed When AI Joined the Team* rather than sentence case).
* **Expand Acronyms on First Use:** Spell out acronyms on their first occurrence in each chapter (e.g. *Architecture Decision Records (ADRs)*, *Test-Driven Development (TDD)*, *Software Development Life Cycle (SDLC)*).
* **Descriptive Links:** Never use generic link text like "click here" or bare URLs. Use descriptive anchor text (e.g. `[Manifesto for Agile Software Development](https://agilemanifesto.org/)`).

---

## 5. Typography and Syntax Guardrails

* **No Em-Dashes (`—` or `–`):** The author writes exclusively with standard ASCII hyphens (`-`). Never use em-dashes or en-dashes.
* **Filename Prefixes as Sort Keys:** Prefixes like `00.01`, `01.00`, `02.00`, `10.01` are solely Obsidian sort keys to keep directory listings aligned with the VitePress sidebar.
* **Markdown Link Syntax:** 
  * In the **manuscript (`docs/`)**: Use standard Markdown link syntax `[Label](path.md)` for native VitePress build compatibility.
  * In **Obsidian vault notes / chat**: Bare wikilinks `[[path/to/note|Label]]` are supported and preferred to avoid Electron security blocks.
* **Manuscript Callouts:** Use standard Obsidian/GitHub callouts (`> [!NOTE]`, `> [!TIP]`, `> [!WARNING]`). Use HTML comments (`<!-- TODO: ... -->`) for notes and annotations meant to stay hidden from the compiled VitePress book.

---

## 6. Concrete Visuals and Case Studies

* **Field Cases:** Include short, authentic anecdotes from real terminal sessions (e.g. the Lunar Surface Shader opposition surge case study, hitting the 4-session working memory wall, or catching subtle Android IME glitches on physical devices).
* **The 80/20 Polymath Pattern:** Emphasize that modern high-leverage builders acquire domain mental models using isolated, sandboxed AI tutors outside the production terminal, gated by the Feynman rule: *you haven't learned it until you can teach it.*
* **Clear Diagrams:** Use simple Mermaid flowcharts and topologies (e.g. the human-AI verification loop, Agent Role Topology) to anchor complex ideas visually.
