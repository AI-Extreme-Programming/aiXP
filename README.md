# aiXP [![starline](https://raw.githubusercontent.com/ScottKirvan/aiXP/refs/heads/starlines/ScottKirvan/aiXP/starline.svg)](https://github.com/qoomon/starlines)
<div align="center">

  <img src="assets/media/logo.jpg" alt="logo" width="200" height="auto" />
    <h1><a href="https://github.com/ScottKirvan/aiXP">ScottKirvan/aiXP</a></h1>
  <h3>Extreme Programming for Human-AI Teams of 1 to N</h3>
  
  
<!-- Badges -->
<p>
  <a href="https://github.com/ScottKirvan/aiXP/graphs/contributors">
    <img src="https://img.shields.io/github/contributors/ScottKirvan/aiXP" alt="contributors" />
  </a>
  <a href="">
    <img src="https://img.shields.io/github/last-commit/ScottKirvan/aiXP" alt="last update" />
  </a>
  <a href="https://github.com/ScottKirvan/aiXP/network/members">
    <img src="https://img.shields.io/github/forks/ScottKirvan/aiXP" alt="forks" />
  </a>
  <a href="https://github.com/ScottKirvan/aiXP/stargazers">
    <img src="https://img.shields.io/github/stars/ScottKirvan/aiXP" alt="stars" />
  </a>
  <a href="https://github.com/ScottKirvan/aiXP/issues/">
    <img src="https://img.shields.io/github/issues/ScottKirvan/aiXP" alt="open issues" />
  </a>
  <a href="https://github.com/ScottKirvan/aiXP/blob/main/LICENSE.md">
    <img src="https://img.shields.io/github/license/ScottKirvan/aiXP.svg" alt="license" />
  </a>
  <a href="https://discord.gg/TN6XJSNK5Y">
    <!--<img src="https://img.shields.io/discord/704680098577514527?style=flat-square&label=%F0%9F%92%AC%20discord&color=00ACD7">-->
    <img src="https://img.shields.io/discord/1052011377415438346?style=flat-square&label=discord&color=00ACD7">
  </a>
</p>
   
<h4>
    <a href="https://www.scottkirvan.com/aiXP/">Read the draft</a>
  <span> · </span>
    <a href="https://github.com/ScottKirvan/aiXP/issues/new?template=bug_report.md">Report Bug</a>
  <span> · </span>
    <a href="https://github.com/ScottKirvan/aiXP/issues/new?template=feature_request.md">Request Feature</a>
  </h4>
</div>

**aiXP** is a working draft of a proposed software engineering discipline: Extreme Programming for human-AI teams of 1 to N. It starts from XP's bet that tight feedback loops beat upfront certainty, argues that AI makes that bet stronger, and works out the practices for a world where the cost of software shifts from writing code to verifying, bounding and integrating it. It draws on classic XP, Lean and SRE, and on the author's daily practice pairing with Claude Code on real projects.

The draft is at the brainstorm stage: chapters are incomplete, and open questions are kept in the text rather than resolved early.

Reading
-------
Read the draft at **[scottkirvan.com/aiXP](https://www.scottkirvan.com/aiXP/)**. It's built from `docs/` with [VitePress](https://vitepress.dev/) and deployed to GitHub Pages on every change to `docs/`.

Repo Layout
-----------
```
aiXP
├───.github
│   ├───release-please           # Release-Please configuration
│   └───workflows                # Docs deploy, releases, pre-release staging, starline
├───assets/media                 # Images and logos
├───docs                         # VitePress site
│   ├───.vitepress               # Site config (nav and sidebar)
│   └───aixp                     # The chapters, PP.SS-slug.md in reading order
├───notes                        # CHANGELOG, VERSION, drafts and archive
├───CLAUDE.md                    # Context and editorial guardrails for AI agents
├───CODE_OF_CONDUCT.md
├───CONTRIBUTING.md
└───LICENSE.md
```

Releases are cut by [Release-Please](https://github.com/googleapis/release-please) from [Conventional Commits](https://www.conventionalcommits.org/); see the [CHANGELOG](notes/CHANGELOG.md).

Contributions / Contact
-----------------------
- Please [file an issue](https://github.com/ScottKirvan/aiXP/issues/new), or [grab a fork](https://github.com/ScottKirvan/aiXP/fork), hack away, and submit a [pull request](https://github.com/ScottKirvan/aiXP/pulls).
- Contact me at [linkedin.com/in/scottkirvan/](https://www.linkedin.com/in/scottkirvan/)
- You can also contact me at my [discord](https://discord.gg/TN6XJSNK5Y) server, I'm cptvideo.

Credits
-------
**aiXP Copyright (c) 2026:** [Scott Kirvan](https://github.com/ScottKirvan) - licensed under the [MIT License](LICENSE.md).
*Repository scaffolding from [ScooterGitTemplate](https://github.com/ScottKirvan/ScooterGitTemplate).*

Project Link:  [aiXP](https://github.com/ScottKirvan/aiXP)  
[CHANGELOG](notes/CHANGELOG.md)  
[TODO](notes/TODO.md)
