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

---

## 2026-11-16 - Did Not Request Shell Permission to Fetch Documentation URL

**What happened:** When lacking a built-in tool to fetch `scottkirvan.com/BojuBot/guide/skills.html`, the agent did not attempt a command or use the UI Bridge to request `run_command` permission, preventing the user from granting access to fetch the page.

**Why it happened:** The agent treated Standard mode's command restriction as an absolute barrier rather than triggering the permission request flow when a shell command (like `curl`) was genuinely required.

**Going forward:**
- **Agent:** When a built-in tool is missing for an operation that genuinely requires external access (e.g., fetching a URL), attempt the command or emit `request-permission` so the user can approve it.
- **BojuBot:** Consider implementing a built-in URL fetch bridge action or tool for backends lacking native page-reading tools.

