# Dev Workflow Mistakes

This is not a blame log. It's a running record of process/workflow slips — mine or an
agent's — worth remembering, so the same mistake doesn't get repeated. Each entry
should be concrete enough to recognize the pattern next time, and say what changes
going forward.

---

## 2026-11-06 — Cross-chapter links written with GitHub-style anchors broke the book build

**What happened:** two links to the manifesto's Pillar 3 heading reached `main` in the
2026-11-05 vault backups, in `01.03.50-terminal-loop.md` and `01.05.50-field-protocol.md`.
Both used `01.01.50-manifesto.md#pillar-3---contracts-govern-what-not-how`. The heading is
`Pillar 3 - Contracts govern what, not how`. GitHub turns each space into a dash, so
` - ` becomes `---`. VitePress collapses runs of spaces and punctuation into a single
dash: `#pillar-3-contracts-govern-what-not-how`. The links didn't jump to the heading on
the site, and the next manual Book Build failed its link check (`integration: check mode
passes against the real manuscript`). Fixed in
[#12](https://github.com/AI-Extreme-Programming/aiXP/pull/12).

**Why it got through:** the vault commits straight to `main`. The link check
(`npm run check` in `book/`) runs only on pull requests and book builds, so nothing
checked the links until a book build ran a day later.

**Going forward (open — to decide):**
- When linking to a heading, use the VitePress anchor: lowercase, with every run of spaces
  and punctuation turned into one dash. Don't copy the anchor GitHub shows.
- Options to catch it sooner: run `cd book && npm run check` before pushing manuscript
  edits, or add a workflow that runs the link check on every push to `main` that touches
  `docs/` (about 20 seconds; it fails within minutes of the vault backup).
