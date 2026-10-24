# CLAUDE.md — aiXP (aiXP)

## Project

A writing project, not a codebase. The deliverable is a paper/talk/post/book (format
undecided) on **aiXP** — a proposed software engineering discipline for AI-assisted
development, grounded in the author's daily practice pairing with Claude Code on real
projects.

## Key Files and Structure

- `docs/` — VitePress project root; run with `npm run docs:dev` from inside `docs/`
- `docs/.vitepress/config.mts` — nav/sidebar config; update when adding pages
- `docs/aixp/` — primary content, filenames use a `PP.SS-slug.md` prefix (Part.Section)
  that encodes reading order and must stay in sync with the sidebar in `config.mts`:
  - `00.0x` — Front Matter (preface, how to read)
  - `01.0x` — Part I: Background (vibe coding, XP background, what changed)
  - `02.0x` — Part II: The Manifesto
  - `03.0x` — Part III: The Practices (XP carryover, new practices, DevOps/SRE,
    testing, versioning)
  - `04.0x` — Part IV: Context and Comparison (AI-native SDLC, scaling, anti-patterns)
  - `05.0x` — Back Matter (open questions, appendix, bibliography)
- `docs/index.md` — site landing page
- `notes/` — scratch/draft material (e.g. `notes/aiXP-draft.md`)
- `app.json` — currently an empty placeholder (`{}`); purpose not yet decided
- `_claude-context.md` — BojuBot's persistent memory across sessions (Obsidian plugin).
  Read it alongside this file — it carries the editorial/voice guardrails below plus
  any newer session notes; treat it as the source of truth if the two ever diverge and
  reconcile them back into this file.

## Voice and Editorial Guardrails

- Direct, technically precise — no hype language ("revolutionary," "unlock," etc.)
- Vibe coding is not software engineering: treat this as settled, do not soften it
- Distinguish always between: (a) tested in production, (b) adapted by analogy,
  (c) speculative
- No invented examples, case studies, or fabricated citations
- Every borrowed concept (Lean, SRE, Kanban, XP) gets attributed to its origin
- Open questions live in `docs/aixp/05.01-open-questions.md` — surface them, don't
  resolve unilaterally

## Standing Positions (settled — don't re-litigate)

- TDD is load-bearing in aiXP, not merely one practice among many
- Agent Role Topology stays flat by design
- Executive code review is context-free by design ("make the code speak")
- aiXP is a practitioner-scale discipline within the broader AI-native movement

## Build and Deploy

- Dev server: `cd docs && npm run docs:dev`
- Production build: `cd docs && npm run docs:build`
- Deployed to GitHub Pages via `.github/workflows/docs.yml` on push to `main`
  (uses reusable workflow at `ScottKirvan/.github`)
- Live URL: `https://www.scottkirvan.com/aiXP/`

## Known Gotchas

- `base: '/aiXP/'` in `docs/.vitepress/config.mts` is load-bearing for GitHub
  Pages asset resolution. Do not remove it — without it, CSS/JS 404 on the deployed
  site (the page loads but has no stylesheet).
- Obsidian vault backup commits run automatically and push directly to `main`. They
  have previously removed the `base` setting accidentally. If the deployed site loses
  its stylesheet, check whether a vault backup commit touched `config.mts`.
- The docs package is named `"aixp-docs"` (`docs/package.json` and its lockfile); the
  name is cosmetic and doesn't affect builds.

## Keeping This File Current

This file is the primary context for any agent working in this repo — keep it accurate
as the project evolves. When you learn what the project is, add a brief description at
the top. As key files, build commands, and architectural decisions emerge, record them
here so future sessions start with full context rather than re-deriving it.

Update this file in the same commit as the work it documents.

## Working Conventions

- Never commit or push directly to `main`. Always branch first, then PR.
- Branch names must describe the work (e.g. `fix/login-timeout`, `feat/export-csv`).
  No random characters, UUIDs, or generated suffixes to ensure uniqueness — if a name
  is already taken, pick a more specific descriptive name instead.
- If a branch name is pre-assigned by tooling (a hosted agent session, a CI runner)
  rather than chosen by you, verify it against this convention before the first push.
  Rename locally (`git branch -m <name>`) if it doesn't match — being handed a name
  isn't an exemption from the rule.
- One concern per branch and PR. If work naturally splits into independent problems,
  split the branches too — resist bundling unrelated changes into one PR.
- Conventional commits: `feat:` / `fix:` / `docs:` / `chore:` / `refactor:` / `test:`.
  Breaking: `feat!:`.
- `feat:` is for genuinely new user-facing capabilities only. Bug fixes and corrections
  use `fix:`, even when they close a tracked issue.
- Unit tests must be written alongside all new code. All bug fixes require red/green
  tests — a failing test that reproduces the bug, then the fix that makes it pass.
- CI, lint, and formatting must all pass before committing or opening a PR. Discover
  the project's commands from the CI config, `package.json`, `Makefile`, or equivalent
  — do not assume they match another project's toolchain.
- Prefer narrow, localised changes. Favour modularity that contains the blast radius
  of future edits — a fix or feature should not require touching unrelated parts of
  the codebase. If it does, that's a design signal worth surfacing.
- Refactoring is a first-class activity, not something to defer. Improve structure as
  you go rather than accumulating technical debt for a later pass.
- When working in unfamiliar domain territory, prefer primary sources — official docs,
  specs, RFCs — over general knowledge. Flag domain uncertainty explicitly rather than
  proceeding on an assumption.
- Default to writing no comments. Add one only when the *why* is non-obvious — a
  hidden constraint, a subtle invariant, a workaround for a specific bug. If code is
  hard to understand, the fix is clearer naming and structure, not a comment explaining
  what it does.

## No Shortcuts

Nothing is deferred without explicit permission from the user. A known issue is still
a bug — do not mark it "won't fix", "by design", or "out of scope" unilaterally.

If a library or package cannot meet the stated requirements, the answer is to find an
alternative or do the work from first principles — not to defer the requirement or
revise it to fit the limitation. The requirements define what the project needs; the
implementation serves the requirements, not the other way around.

## Communication

Ask questions in natural language. Never use a multiple choice / structured question
tool — including Claude Code's `AskUserQuestion` tool — if clarification is needed,
just ask directly in plain text. This is a project-wide preference, not a
per-session one: some interfaces render binned/multiple-choice questions poorly,
and forcing a question into fixed options loses the nuance an open question
would surface. Standard engineering practice is to ask a real question and read
a real answer, not to pick from a menu.

## Autonomy

Make implementation decisions independently — don't ask permission for technical
choices within the stated requirements. Escalate only when something would change
scope, defer a requirement, or contradict what the user has described as the goal.

## Attribution

No attribution of any kind in commit messages, PR bodies, or issue text — no
"Generated with", "Co-Authored-By", "Created by Claude", or any AI/tool credit lines.

**Verify by reading the repo, not from memory.** Some git hosting integrations inject
a footer server-side even into a request that omitted one — treat that as expected
behavior, not a surprise. After every commit and after every PR create/update, re-read
the actual result and strip any attribution found, regardless of source:
- Run `git log` and read the actual commit messages
- Re-fetch and read the actual PR body text
- Remove any attribution found, regardless of source

A commit or PR is not finished until this read-back check has run — don't rely on what
you wrote, check what actually landed.

## GitHub Issues and PRs

Issue and PR templates live in `ScottKirvan/.github` (or your org's equivalent) and
apply to this repo automatically via GitHub's community health file fallback.

- Bug reports → `[BUG]` title prefix, `bug_report.md` sections
- Feature requests → `[FEATURE]` title prefix, `feature_request.md` sections
- General → `[GENERAL]` title prefix, `general_report.md` sections
- PRs → fill all checklist sections; no attribution anywhere in the body

Before creating any issue: check for duplicates first — `gh issue list --state open
--limit 100` where the `gh` CLI is available, or the equivalent GitHub search/list
tool (e.g. an MCP GitHub server's `search_issues`/`list_issues`) in hosted sessions
that don't have `gh`. Don't skip the check just because the literal command doesn't
apply in a given environment.
Create issues only when explicitly asked — don't preemptively file future work.

## Sub-Agent Workflow

When using sub-agents for implementation:

- Brief sub-agents on **what** to build, not **how** — implementation decisions belong
  to the sub-agent, which serves as an independent second opinion on the approach.
- Sub-agents follow all conventions in this file except they do not create PRs.
- After a sub-agent completes, review its diff and tests before creating the PR.
  This review is a genuine code review, not a compliance check — evaluate correctness,
  requirement alignment, and test quality independently.
- Simple issues found in review may be fixed directly. Significant deviations from the
  stated requirements or complex problems go back to the sub-agent rather than being
  patched over.
- Create the PR only after review passes.
