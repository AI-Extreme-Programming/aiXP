# Claude Context - aiXP Writing Project

## What this vault is

A writing project, not a codebase. The deliverable is a paper, talk, post, or book (format undecided) on **aiXP** - a proposed software engineering discipline for AI-assisted development, grounded in the author's months of daily practice pairing with Claude Code on real projects.

## Vault structure

- `docs/` - VitePress project root; dev server via `npm run docs:dev`
- `docs/aixp/` - primary working source material (`01` through `09` arranged in three parts, followed by `10.xx` appendices)
- `docs/.vitepress/config.mts` - nav/sidebar config; update when adding pages under `docs/aixp/`
- `docs/index.md` - site landing page
- `notes/` - scratch/draft material (e.g. `aiXP-draft.md`)
- `app.json` - project config (purpose TBD)

New content pages go under `docs/aixp/`. Don't add top-level markdown without updating the sidebar.

## Voice and editorial guardrails

- Consult and follow `notes/dev/editorial-voice-and-style-guide.md` before drafting or editing any manuscript sections.
- Direct, technically precise - no hype language ("revolutionary," "unlock," etc.)
- Vibe coding is not software engineering: treat this as settled, do not soften it
- Distinguish always between: (a) tested in production, (b) adapted by analogy, (c) speculative
- No invented examples, case studies, or fabricated citations
- Every borrowed concept (Lean, SRE, Kanban, XP) gets attributed to its origin
- Open questions live in `notes/dev/open-questions.md` - surface them, don't resolve unilaterally
- Editorial backlog and chapter status live in `notes/dev/editorial-backlog.md`

## Standing positions (settled - don't re-litigate)

- TDD is load-bearing in aiXP, not merely one practice among many
- Agent Role Topology stays flat by design
- Executive code review is context-free by design ("make the code speak")
- aiXP is a practitioner-scale discipline within the broader AI-native movement

## Notes for Claude

- Working dynamic: Human is the Navigator (holds judgment, priorities, architecture); Claude is the Driver (executes bounded tasks cleanly; never improvises priorities or assumes judgment).
- Always consult `notes/dev/editorial-voice-and-style-guide.md` before starting any writing.
- Use standard Markdown links `[Label](path.md)` everywhere (in manuscript, dev notes, and chat). Do not use `[[wikilinks]]`.
- No em dashes anywhere - user writes with regular hyphens ('-').
- Never edit or modify vault files unless the user specifically and explicitly asks for an edit.
- File prefixes (e.g. 00.01, 00.02, 05.02) are solely Obsidian sort keys; skipped numbers do not matter and fractional numbers (e.g. 00.02.5) may be used for sorting insertions.
- Theme: GitHubDHC v2.3.1 (installed from official Obsidian community theme release).

---

_Last updated: 2026-10-19_
