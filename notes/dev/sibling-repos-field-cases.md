# Sibling Repositories Survey & Field Case Catalog

This document captures how `aiXP` principles are practiced across the 16 active repositories in `07_GitRepos` (plus `ScottKirvan/.github`), how those practices adapt by project type and risk profile, and which authentic field cases and production artifacts can be drawn into the manuscript beyond `BojuBot` and `QuKi-Notes`.

---

## 1. Breadth of the Fleet (16 Repositories Across 8 Runtimes)

| Family / Stack | Repositories | Domain & Runtime Constraints |
|---|---|---|
| **Canonical Seed & Cross-Repo Fleet DevOps** | `ScooterGitTemplate`, `BojuStudio_devops_agent`, `ScottKirvan/.github` | Seed template for all new repos; central DevOps agent workspace managing CI/CD, `release-please`, AI release-note staging (`pre-release-staging/{tag}`), and Discord webhooks across ~20 repos. |
| **Pure C++17 & Unreal Engine 5.7/5.8** | `CambrianaCore`, `UE_Cambriana`, `UE_StageHand`, `ScooterUtils`, `ToolExample` | Engine-independent procedural 3D L-system/turtle/skinning library (`CambrianaCore`) with bit-exact cross-compiler floating-point determinism (MSVC, GCC, Clang) + UE5 C++/Slate plugins. |
| **TypeScript Multi-Runtime & Obsidian** | `BojuBot`, `QuKi-Notes` (TS rewrite), `Obsidian-ScooterUtils` | Desktop/Mobile Electron, Capacitor (Android), PWA, CLI, and MCP server targets from shared TypeScript cores. |
| **Flutter / Dart (v1 Multi-Agent Workspace)** | `QuKi-Notes_devops` | Custom `RenderBox` + `TextInputClient` GFM live editor (`markdown_live_editor`), structured into role-isolated agent folders (`Agents/quiki-spec`, `quiki-dev`, `quiki-devops`, `quiki-docs`). |
| **Vue 3 Component Library & Design System** | `BojuVue`, `GitHubDHC` | Shared Vue 3 + VitePress UI package (`@bojustudio/boju-vue`) and a buildless CSS Obsidian theme verified by a headless AppImage + `xvfb` WCAG contrast harness. |
| **Python 3.11+ CLI & Print Preflight** | `PosseRenkei`, `aiXP` | POSSE social syndication pipeline (Bluesky AT Protocol, Mastodon, Discord, GitHub Releases) and the `aiXP` Pandoc/XeLaTeX/Ghostscript PDF/X-1a print-production pipeline. |
| **Android Native (Kotlin) & Edge Workers** | `UplinkStatus` (*Ping'd*), `report-relay_dev` | Kotlin + Jetpack Compose Android foreground service/status-bar TCP probe; Cloudflare Worker in TypeScript minting RS256 GitHub App JWTs for in-app bug reporting. |
| **Embedded / Vehicle Telemetry & Zero-Build PWA** | `GOMAC`, `RepoWatch` (*Smokey*) | Node/TS/MQTT/Home Assistant telemetry hub for *Gomtuu* (2005 T1N Sprinter van running on an onboard host *TheFlea*); single-file zero-build vanilla HTML/JS PWA health dashboard. |

---

## 2. The Invariant Core vs. Project-Specific Adaptation

### A. The Invariant Spine (Seeded by `ScooterGitTemplate/CLAUDE.md`)
Every repository shares a canonical spine in its `CLAUDE.md`:
1. **Context Stewardship (`Keeping This File Current`):** `CLAUDE.md` must be updated in the same commit as any structural, command, or convention change. It records current truth, never git or PR history.
2. **Change as Experiment:** Small, verifiable steps; one concern per branch/PR; suppress the impulse to run three steps ahead on unverified assumptions.
3. **Pre-Registered Verification:** State concrete, checkable pass/fail criteria *before* running a check. Verify with a fresh command at the moment of the claim - never from memory or by trusting a sub-agent's self-report.
4. **Hard Constraint Escalation:** *"IF YOU CANNOT DO EXACTLY WHAT WAS ASKED - STATE THE CONSTRAINT AND STOP."* Never silently substitute a workaround or revise requirements to fit a library limitation.
5. **Two-Strike Auto-Comply & `[Proposed - unconfirmed]`:** Comply immediately when corrected twice; tag any unconfirmed agent design choice in specs or docs as `[Proposed - unconfirmed]`.
6. **Sub-Agent Briefs (`What`, Not `How`) + Load-Bearing vs. Reversible:** Expanded in `QuKi-Notes/CLAUDE.md` and `CambrianaCore/CLAUDE.md` - if changing a choice later would cascade into sibling components, lock it in the brief; if it is local and reversible, delegate freely.
7. **Zero AI Attribution (Read-Back Verified):** Mandatory post-commit and post-PR read-back check (`git log -1`, `gh pr view`) because hosted agent harnesses inject attribution URLs by default.

### B. How the Techniques Adapt by Project Type & Risk Profile

1. **Mathematical & Cross-Compiler Determinism (`CambrianaCore`)**
   - **Spec Constellation:** Replaces informal notes with a code-indexed spec constellation (`docs/SRS.md`, `docs/SDD-01` through `SDD-09`, `docs/FMT-01`, `docs/ATS-01` with numbered acceptance cases `ATC-01` to `ATC-60`).
   - **Spec Convention:** *"Decisions are stated without rationale or history. Deferred requirements carry explicit design obligations."*
   - **Verification Rigor:**
     - Enforces `/fp:precise` (MSVC) and `-ffp-contract=off` (GCC/Clang) plus compile-time guard `src/math/fp_guard.h`.
     - Custom IEEE-754 elementary math (`src/math/elementary.h`) so `std::sin`/`cos` libm differences cannot cause cross-compiler drift.
     - Committed geometry fingerprint digest (`tests/data/determinism_fingerprint.txt`) verified across MSVC, GCC, and Clang in CI.
     - Custom global allocator failure-injection test (`tests/allocation_failure_test.cpp`) that fails every Nth allocation in turn to prove leak-free `OutOfMemory` recovery (`SDD-05`).
     - Strictest C11/C++17/C++20 header compilation checks (`tests/c_header_check.c`, `tests/cpp20_header_check.cpp`), DLL symbol export verification (`dumpbin` / `nm`), and headless Blender 4.5 glTF import verification (`ATC-60`).

2. **Full-Stack Language Rewrite (`QuKi-Notes` Flutter -> TypeScript)**
   - **Explicit 6-Tier Hierarchy of Truth:** When rewriting a mature app with 370+ historical PRs, old context becomes toxic. `QuKi-Notes/CLAUDE.md` ranks truth sources:
     1. Direct instruction from Scott in the current conversation
     2. `notes/dev/STORAGE_CONTRACT.md`
     3. `notes/dev/BEHAVIOR_SPEC.md`
     4. `notes/dev/quki-rewrite-path.md`
     5. The existing test suite
     6. The existing source code
     - Everything else (old ADRs, code comments, and even open GitHub issues) is declared **"stale by default / unreliable narrative."**
   - **Vocabulary Pinning ("The Word Is Usually the Bug"):** Documents how using the word *"database"* in an early spec caused agents to build a stateful registry instead of scanning the folder on disk. Ambiguous words (`database`, `note`, `document`, `item`) are banned in favor of exact domain terms (`QuKi`, `the folder`, `the sidecar`).
   - **Visual & Physical Boundary:** Combines Playwright E2E + pixel-sampling tests (`e2e/selection.e2e.ts`) + static CSS variable tests (`src/styles/colourVariables.test.ts`) with explicit recognition of what only a physical Android device can verify.

3. **Role-Isolated Multi-Agent Workspaces (`QuKi-Notes_devops` & `BojuStudio_devops_agent`)**
   - **Physical Session Partitioning (`QuKi-Notes_devops`):** Partitions work into four launch directories (`Agents/quiki-spec/`, `Agents/quiki-dev/`, `Agents/quiki-devops/`, `Agents/quiki-docs/`), each with its own role-scoped `CLAUDE.md` and current task brief. The Spec session independently re-verifies diffs and runs A/B failure checks on new tests rather than trusting Implementation session reports.
   - **Honest Failure Accounting:** `QuKi-Notes_devops/CLAUDE.md` documents Phase 3.11 / 3.20 / 3.20a / 3.38 / 3.59 (cold-launch Android keyboard auto-focus), where four PRs were marked "Complete" in tests while failing on real devices. Rather than continuing to hack on `postFrameCallback`, the project owner killed the code and changed the requirement to a startup splash screen (`#342`).
   - **Portable Git-Tracked Agent Memory (`BojuStudio_devops_agent`):** Stores durable operational memory in git at `notes/dev/memory/MEMORY.md` (with linked topic files such as `feedback_release_please_packages_config.md`, `feedback_branch_before_edit.md`, and `project_workflow_architecture.md`) so any machine wakes up with the same institutional memory.

4. **Hostile Third-Party APIs & Sandboxes (`PosseRenkei`)**
   - **Live Sandbox Verification (`just live-test`):** Documents cases where official vendor docs and SDKs were wrong in production:
     - Bluesky `atproto` SDK's `upload_blob` failed on video; required hitting `https://video.bsky.app` with an `aud=did:web:api.bsky.app` service JWT, passing `did` and `name` as query parameters, and reading a flat `jobId` JSON response rather than the documented `jobStatus` wrapper.
     - GitHub REST API docs showed a nonexistent placeholder date in `X-GitHub-Api-Version` that caused `400 Bad Request` until pinned to `2022-11-28`.
   - **Independent Read-Back Verification:** After committing files via the GitHub Git Data API, the test suite makes fresh, separate HTTP `GET` requests and compares base64-decoded bytes against local disk rather than trusting the write endpoint's response.

5. **Air-Gapped Physical Hardware & Multi-Contributor Split (`GOMAC`)**
   - **Network/Hardware Boundary Awareness:** Cloud and remote agent sessions have zero network path to *TheFlea* (the Linux host inside *Gomtuu*, the 2005 T1N Sprinter van). Unverified MQTT topics (`gomac/can/#`, `gomac/ble/#`) must be coded defensively and marked unverified until tested against the live broker.
   - **Context Separation:** `CLAUDE.md` holds only Claude-specific operating rules, while `notes/dev/gomac-project-overview.md` holds human + tool-agnostic domain architecture so non-Claude contributors and tools are not locked out.

6. **Shared Library & Package Boundary Discipline (`BojuVue`)**
   - **Component Definition of Done:**
     1. Data shape designed for external consumers, not copied from a single internal caller.
     2. Every failure and edge path enumerated with deliberate UX.
     3. Pure logic extracted from `.vue` into `.ts` for fast unit testing.
     4. Package exports, SSR importability, and CSS shipment verified against the packed tarball (`src/__tests__/package.exports.test.ts`), not just local source imports.

7. **Calibrated Low-Stakes Exceptions (`RepoWatch` / *Smokey* & `UE_StageHand`)**
   - **Low-Stakes Merge Authority (`RepoWatch`):** Explicitly relaxes PR ceremony (`"default to committing straight to main rather than branch+PR - this is a fun, low-stakes repo for Scott"`), while retaining Playwright behavioral tests and a static source-text regression test (`tests/lint-repo-matching.spec.js`) created after a repo-rename matching bug recurred three times.
   - **Early-Stage Engine Port (`UE_StageHand`):** Explicitly documents that automated tests do not exist yet in the host UE project; verification is currently `Build.bat` compilation + human live-editor testing, with explicit guardrails around Unreal Live Coding file locks.

8. **Visual / Buildless Repos (`GitHubDHC` & `aiXP`)**
   - **Headless Visual TDD (`GitHubDHC`):** A single hand-edited CSS file (`theme.css`) with no build step runs a headless QA harness (`qa/`) that launches the real Obsidian AppImage inside `xvfb-run` across desktop, phone, and tablet viewports in dark and light modes to enforce WCAG AA contrast ratios and catch upstream Obsidian DOM drift.
   - **Worktree Isolation & Print Preflight (`aiXP`):** Uses git worktree isolation (`git worktree add ../aiXP-<slug>`) so agent branch work never collides with Obsidian's 2-minute auto-backup commits on `main`, and runs a Python + Ghostscript PDF/X-1a print preflight suite (`book/tests/`).

---

## 3. Chapter-by-Chapter Catalog of Candidate Field Cases & Artifacts

### Chapter 2 (`docs/aixp/01.02.50-intent-and-context.md`) - Intent, Context & Spec Constellations
- **`QuKi-Notes`: "The Word Is Usually the Bug" & 6-Tier Hierarchy of Truth**
  - *Source:* `../QuKi-Notes/CLAUDE.md` ("Hierarchy of Truth", "The Word Is Usually the Bug", "Vocabulary")
  - *Takeaway:* How using the word *"database"* in an early spec caused agents to build a stateful registry over a plain folder of `.md` files, and how to explicitly rank truth sources when rewriting a legacy codebase whose old ADRs and GitHub issues have become toxic context.
- **`CambrianaCore`: Formal Spec Constellations (`SRS` / `SDD` / `FMT` / `ATS`)**
  - *Source:* `../CambrianaCore/CLAUDE.md`, `../CambrianaCore/docs/`
  - *Takeaway:* Contrasting lightweight `CLAUDE.md` context with a formal C++ spec constellation where decisions are stated without historical rationale and deferred requirements carry explicit design obligations (`SDD-05`: *"every error condition must leave the context clean for reuse"*).
- **`GOMAC`: Separating Agent Rules from Shared Domain Docs**
  - *Source:* `../GOMAC/CLAUDE.md`, `../GOMAC/notes/dev/gomac-project-overview.md`
  - *Takeaway:* Keeping `CLAUDE.md` strictly for agent behavioral rules while placing domain architecture in `notes/dev/` for multi-contributor and multi-tool teams.

### Chapter 3 (`docs/aixp/01.03.50-terminal-loop.md`) - The Terminal Loop & TDD
- **`CambrianaCore`: Determinism & Allocator Failure Injection**
  - *Source:* `../CambrianaCore/tests/allocation_failure_test.cpp`, `../CambrianaCore/src/math/fp_guard.h`, `../CambrianaCore/src/math/elementary.h`
  - *Takeaway:* The Inner Loop at systems-programming rigor - proving leak-free `OutOfMemory` recovery by failing every Nth allocation in turn, and enforcing bit-exact floating-point determinism across MSVC, GCC, and Clang.
- **`PosseRenkei`: When the Docs Lie (Live Sandbox & Read-Back Verification)**
  - *Source:* `../PosseRenkei/CLAUDE.md` ("External API Gotchas (Learned the Hard Way)")
  - *Takeaway:* Why mocked unit tests fail at third-party API boundaries (Bluesky's `video.bsky.app` upload protocol vs. `atproto` SDK docs; GitHub REST API's fake header version date) and why verification requires an independent read-back query.
- **`QuKi-Notes_devops`: Knowing When to Kill a Requirement (Phase 3.59 Cold-Launch Focus)**
  - *Source:* `../QuKi-Notes_devops/CLAUDE.md` (Phase 3.11, 3.20, 3.20a, 3.38, 3.59)
  - *Takeaway:* What happens when the Red/Green widget test loop passes across four PRs while failing on physical Android hardware - and how the human architect stops the loop, deletes the dead `postFrameCallback` code, and changes the requirement to a splash screen.

### Chapter 4 (`docs/aixp/02.04.50-outer-loops.md`) - Outer Loops, CI, and Visual/Physical Harnesses
- **`GitHubDHC`: Mechanical TDD for a Buildless CSS Theme**
  - *Source:* `../GitHubDHC/CLAUDE.md`, `../GitHubDHC/qa/README.md`
  - *Takeaway:* Booting a real Obsidian AppImage under `xvfb-run` in CI across 3 viewports x 2 color schemes to enforce WCAG AA contrast and detect upstream DOM drift on a single CSS file.
- **`RepoWatch` (*Smokey*): Turning a 3-Time Recurring Bug into a Static Source Guard**
  - *Source:* `../RepoWatch/CLAUDE.md`, `../RepoWatch/tests/lint-repo-matching.spec.js`
  - *Takeaway:* Writing a 30-line Playwright static source-text check that scans `index.html` for bare `===` comparisons on `repo.name` after the `Ping-d` -> `UplinkStatus` rename broke matching three separate times.
- **`BojuVue`: Testing the Packed Tarball (`package.exports.test.ts`)**
  - *Source:* `../BojuVue/CLAUDE.md`, `../BojuVue/src/__tests__/package.exports.test.ts`
  - *Takeaway:* Outer-loop verification that packs the library and verifies SSR importability and export resolution as an external consumer experiences them.
- **`aiXP`: Deterministic Print Preflight (`check-pdfx.py`)**
  - *Source:* `CLAUDE.md`, `book/scripts/check-pdfx.py`, `book/tests/`
  - *Takeaway:* Automated verification of PDF/X-1a compliance, trim/bleed boxes, embedded fonts, and zero glyph fallbacks.

### Chapter 5 (`docs/aixp/02.05.50-architecture.md`) - Architecture for Agent Comprehension
- **`CambrianaCore` + `UE_Cambriana`: The Engine-Independent Core Pattern**
  - *Source:* `../CambrianaCore/CLAUDE.md`, `../UE_Cambriana/CLAUDE.md`
  - *Takeaway:* Isolating pure C++17 procedural math and L-system evaluation (`CambrianaCore`) from the massive Unreal Engine 5 header/build surface (`UE_Cambriana`), allowing 60+ acceptance tests to compile and run in milliseconds without booting Unreal.
- **`UplinkStatus` (*Ping'd*): Pure-JVM Seam Extraction on Android**
  - *Source:* `../UplinkStatus/CLAUDE.md`
  - *Takeaway:* Keeping `ProbeConfig`, `ProbeEngine`, and `RollingWindow` 100% free of `android.*` imports so probe scheduling and state transitions run in sub-second JVM unit tests (`./gradlew testDebugUnitTest`) without an emulator.
- **`report-relay_dev`: Zero-Dependency Edge Boundaries**
  - *Source:* `../report-relay_dev/CLAUDE.md`
  - *Takeaway:* Designing a four-file Cloudflare Worker (`index.ts`, `github.ts`, `validate.ts`, `types.ts`) using native Web Crypto APIs so the entire service fits effortlessly inside a single context window with zero runtime dependencies.

### Chapter 6 (`docs/aixp/02.06.50-orchestration.md`) - Multi-Agent Orchestration & Memory
- **`BojuStudio_devops_agent`: Cross-Repo Fleet Orchestrator & Git-Tracked Memory**
  - *Source:* `../BojuStudio_devops_agent/CLAUDE.md`, `../BojuStudio_devops_agent/notes/dev/memory/MEMORY.md`
  - *Takeaway:* Managing 20 sibling repositories from a dedicated DevOps agent workspace, storing portable session memory in git (`notes/dev/memory/`), and separating public reusable workflows (`ScottKirvan/.github`) from private agent state.
- **`QuKi-Notes_devops`: Directory-Scoped Session Roles (`Agents/quiki-spec`, `quiki-dev`, `quiki-devops`, `quiki-docs`)**
  - *Source:* `../QuKi-Notes_devops/CLAUDE.md`
  - *Takeaway:* Physical launch folders with role-specific `CLAUDE.md` files that isolate Spec, Implementation, DevOps, and Docs sessions, paired with independent Spec session A/B test verification.
- **`aiXP`: Worktree Isolation Against Background Daemons**
  - *Source:* `CLAUDE.md` ("Branch & Worktree Isolation (Obsidian Auto-Backup Hazard)")
  - *Takeaway:* Using `git worktree add ../aiXP-<slug>` so implementation agents never collide with Obsidian's `obsidian-git` 2-minute auto-backup commits on `main`.

### Chapter 7 (`docs/aixp/03.07.50-governance.md`) & Chapter 8 (`docs/aixp/03.08.50-scaling.md`) - Governance & Scaling
- **`RepoWatch` vs. `CambrianaCore`: Risk-Calibrated Governance**
  - *Source:* `../RepoWatch/CLAUDE.md` vs. `../CambrianaCore/CLAUDE.md`
  - *Takeaway:* Side-by-side comparison of how `CLAUDE.md` calibrates merge ceremony - direct-to-`main` commits for a Tier-1 personal PWA dashboard vs. 3-compiler fingerprint gates and zero-tolerance spec locking for a foundational C++ geometry kernel.
- **`BojuStudio_devops_agent`: Two-Stage Automated Release Governance**
  - *Source:* `../BojuStudio_devops_agent/CLAUDE.md` ("Standard Release Pipeline")
  - *Takeaway:* How `release-please` opens the version PR, and upon merge, `release-notes-ai.yml` generates user-facing notes onto a staging branch (`pre-release-staging/{tag}`) for human review before publishing to GitHub Releases and Discord.
