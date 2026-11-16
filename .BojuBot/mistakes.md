# BojuBot Mistakes

Running log of workflow, platform, and agent slips. Keep entries concise.

---

## 2026-11-16 - Guessed Skill Frontmatter After Failing to Fetch URL

**What happened:** Given a link to BojuBot's skills documentation (`scottkirvan.com/BojuBot/guide/skills.html`), the agent could not read the page directly, guessed the YAML frontmatter schema for a new skill (`HelloWorld.md`), and silently spun on search queries when execution failed. BojuBot ignored the unrecognized fields and autoran the prompt with literal `{{message}}` un-interpolated.

**Why it happened:**
1. Antigravity backend only provides `search_web`, not a direct URL reader, despite orientation stating it can "read web pages."
2. The agent guessed the schema instead of stopping and asking for the text.
3. BojuBot silently executes skills with `autorun: true` even if form fields fail to parse.

**Going forward:**
- **Agent:** If given a URL and no URL-fetch tool exists, stop immediately and ask for the snippet; never guess configuration schemas.
- **BojuBot:** Add a `skills` topic to `help` query in UI Bridge, clarify search-only web access in orientation, and consider warning before autorunning templates with unparsed placeholders.
