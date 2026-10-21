# Proposed Table of Contents

## Preface
1. Origin & Field Context (lifetime in software, 1+ year pairing under fire, mobility reality)
2. What This Is Not (not a claim AI makes software easy; volume vs. discipline)
3. Who Is This For? (experienced engineers, juniors, leadership/architects)
4. Tooling & Platform Assumptions (CLI-first, agent-agnostic)
5. Conventions Used in This Book (Navigator/Driver, 3 confidence tiers, callout types)
6. Living the Discipline (how this book was developed)
7. Companion Repository & Feedback (source repo, templates, errata)
8. How to Read This Book (reading tracks for XP veterans, juniors, managers, and quick skim)

## Introduction
1. The Inversion: Generation is Cheap, Verification is Not
2. The Problem with Vibe Coding (predictable failure modes: drift, creep, collapse, fatigue)
3. XP's Original Bet (why tight feedback loops beat upfront certainty)
4. What Changed When AI Joined the Team (the trust deficit; software as bipedal)

## Chapter 1: The Manifesto
1. The Four Pillars (Verification is the Work, Judgment is Non-Delegatable, Scales with Tools, Context is Infrastructure)
2. Rejection Criteria as Operational Gating Tests
3. Putting the Manifesto into Practice

## Chapter 2: Intent and Context (Before the Code)
1. Spec-First Prompting (grounding intent and acceptance criteria upfront)
2. Domain Gap Surfacing (forcing the AI to interrogate missing business rules)
3. Context Stewardship (maintaining repository memory, ADRs, and living context files)
4. Coding Standards as Context Infrastructure (deterministic prompt constraints)

## Chapter 3: The Terminal Loop (Writing and Refactoring)
1. Asymmetric Pairing (human Navigator holds intent; AI Driver executes)
2. Test-Driven Development (TDD as the primary specification and verification engine)
3. Bounded Refactoring (curbing unrequested refactors and scope creep)
4. Simple Design and YAGNI (defending against machine-speed over-engineering)

## Chapter 4: Judgment, Roles, and Cognitive Budgeting
1. Agent Role Topology (flat hierarchy: Lead/Spec, Scoped Implementers, Independent Reviewers)
2. Executive Code Review (context-free diff evaluation: "make the code speak")
3. Vigilance Budgeting (session ceilings, the 4-item cognitive wall, fatigue mitigation)
4. Prioritization Authority (preserving human ownership of the technical roadmap)

## Chapter 5: Verification Strategy and Integration
1. The Verification Bottleneck (why tests are throughput, not tax)
2. The Four Testing Tiers (Unit, Integration, Contract, E2E)
3. Continuous Integration and Risk-Tiered Merge Authority (matching review rigor to blast radius)
4. Regression Suite Maintenance at Machine Speed

## Chapter 6: Delivery, Release, and Observability
1. Small Releases and Verified Candidates (why generated output is not a release)
2. Semantic Versioning and Release Identity in Rapid Cycles
3. Agent Session Observability and Traceability (audit trails for prompts and diffs)
4. Deployment Gating and Blameless Post-Mortems for AI Failures

## Chapter 7: Scaling Beyond the Solo Practitioner
1. Multi-Human, Multi-Agent Collaboration
2. Desk-Level Discipline vs. Team Coordination
3. Shared Context Infrastructure Across Developers
4. Managing Concurrent Agent Swarms Without Chaos

## Chapter 8: aiXP in the Modern Landscape
1. Situating aiXP (practitioner discipline vs. enterprise process frameworks)
2. Comparison with the AI-Native SDLC (e.g. Anthropic August 2026 playbook)
3. Why Scrum and SAFe Miss the Terminal

## Chapter 9: What aiXP Is Not (Anti-Patterns and Traps)
1. Catalog of Failure Modes
2. The Rubber-Stamp Reviewer
3. The Undifferentiated Agent Swarm
4. The Prompt-and-Pray Trap
5. The Infinite Refactor Rabbit Hole

## Appendix: The Original 12 XP Practices
1. Kent Beck's 1999 Extreme Programming Reference
2. Historical Lineage Mapping (1999 Assumptions vs. AI-Native Realities)

## Bibliography & References
1. Lineage References (Beck, Fowler, Lean, SRE)
2. Cognitive Load and Working Memory Research
3. Industry Playbooks and Reports
