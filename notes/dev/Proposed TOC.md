# Table of Contents & File Map

## Front Matter
- `00.01-preface.md` - Preface (Origin & Field Context, What This Is Not, Who Is This For)
- `00.02-how-to-read.md` - How to Read This Book (Workflow system map, Chapter roadmap, Reading tracks)
- `00.03-conventions.md` - Conventions and Assumptions (Navigator/Driver roles, 3 epistemic tiers, callout types, tooling assumptions, dogfooding note)

## Introduction
- `00.10-introduction.md` - Overview: The Inversion (Generation is Cheap, Verification is Not)
- `00.11-vibe-coding.md` - The Problem with Vibe Coding (drift, creep, collapse, fatigue)
- `00.12-xp-background.md` - XP's Original Bet (why tight feedback loops beat upfront certainty)
- `00.13-what-changed.md` - What Changed When AI Joined the Team (the trust deficit; software as bipedal)

## Chapter 1: The Manifesto (`01.00-manifesto.md`)
1. The Four Pillars (Verification is the Work, Judgment is Non-Delegatable, Scales with Tools, Context is Infrastructure)
2. Rejection Criteria as Operational Gating Tests
3. Putting the Manifesto into Practice

## Chapter 2: Intent and Context (`02.00-intent-and-context.md`)
1. Spec-First Prompting (grounding intent and acceptance criteria upfront)
2. Domain Gap Surfacing (forcing the AI to interrogate missing business rules)
3. Context Stewardship (maintaining repository memory, ADRs, and living context files)
4. Coding Standards as Context Infrastructure (deterministic prompt constraints)

## Chapter 3: The Terminal Loop (`03.00-terminal-loop.md`)
1. Asymmetric Pairing (human Navigator holds intent; AI Driver executes)
2. Test-Driven Development (TDD as the primary specification and verification engine)
3. Bounded Refactoring (curbing unrequested refactors and scope creep)
4. Simple Design and YAGNI (defending against machine-speed over-engineering)

## Chapter 4: Judgment, Roles, and Cognitive Budgeting (`04.00-judgment-and-roles.md`)
1. Agent Role Topology (flat hierarchy: Lead/Spec, Scoped Implementers, Independent Reviewers)
2. Executive Code Review (context-free diff evaluation: "make the code speak")
3. Vigilance Budgeting (session ceilings, 4-item cognitive wall, fatigue mitigation)
4. Prioritization Authority (preserving human ownership of the technical roadmap)

## Chapter 5: Verification Strategy and Integration (`05.00-verification-and-testing.md`)
1. The Verification Bottleneck (why tests are throughput, not tax; Theory of Constraints)
2. The Four Testing Tiers (Unit, Integration, Contract, E2E)
3. Continuous Integration and Risk-Tiered Merge Authority (matching review rigor to blast radius)
4. Regression Suite Maintenance at Machine Speed

## Chapter 6: Delivery, Release, and Observability (`06.00-delivery-and-release.md`)
1. Small Releases and Verified Candidates (why generated output is not a release)
2. Semantic Versioning and Release Identity in Rapid Cycles
3. Agent Session Observability and Traceability (audit trails for prompts and diffs)
4. Deployment Gating and Blameless Post-Mortems for AI Failures

## Chapter 7: Scaling Beyond the Solo Practitioner (`07.00-scaling.md`)
1. Multi-Human, Multi-Agent Collaboration
2. Desk-Level Discipline vs. Team Coordination
3. Shared Context Infrastructure Across Developers
4. Managing Concurrent Agent Swarms Without Chaos

## Chapter 8: aiXP in the Modern Landscape (`08.00-modern-landscape.md`)
1. Situating aiXP (practitioner discipline vs. enterprise process frameworks)
2. Comparison with the AI-Native SDLC (e.g. Anthropic August 2026 playbook)
3. Why Scrum and SAFe Miss the Terminal

## Chapter 9: What aiXP Is Not (`09.00-anti-patterns.md`)
1. Catalog of Failure Modes
2. The Rubber-Stamp Reviewer
3. The Undifferentiated Agent Swarm
4. The Prompt-and-Pray Trap
5. The Infinite Refactor Rabbit Hole

## Appendix: The Original 12 XP Practices (`10.01-appendix-original-12.md`)
1. Kent Beck's 1999 Extreme Programming Reference
2. Historical Lineage Mapping (1999 Assumptions vs. AI-Native Realities)

## Bibliography & References (`10.02-bibliography.md`)
1. Lineage References (Beck, Fowler, Lean, SRE)
2. Cognitive Load and Working Memory Research
3. Industry Playbooks and Reports
