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
- The Inversion: Generation is Cheap, Verification is Not
- The Problem with Vibe Coding (predictable failure modes: correctness drift, scope creep, context collapse, vigilance fatigue)
- XP's Original Bet (why tight feedback loops beat upfront certainty; technical discipline vs. process)
- What Changed When AI Joined the Team (the trust deficit; software as bipedal; moving the bottleneck)

## Chapter 1: The Manifesto
- Pillars and Rejection Criteria
  - Pillar 1: Verification is the Work (rejection test: does this increase unverified change?)
  - Pillar 2: Judgment is Not Delegatable (rejection test: real judgment vs. rubber stamp?)
  - Pillar 3: The Discipline Scales with the Tools (rejection test: holds up if AI is 2x faster?)
  - Pillar 4: Context is Infrastructure (rejection test: could a fresh session act without asking?)
- Putting Rejection Criteria into Daily Practice

## Chapter 2: XP Practices Carried Over, Modified
- The Trust Factory Engine
- Pairing (asymmetric: AI drives, human navigates)
- Test-Driven Development (TDD as the load-bearing verification loop)
- Refactoring (bounding unrequested refactors vs. cheap edits)
- Continuous Integration (risk-tiered trunk integration)
- Small Releases (verified candidates vs. generated candidates)
- On-Site Customer (substituting domain gap surfacing)
- Simple Design / YAGNI (preventing speculative AI over-generation)
- Coding Standards (context prompt enforcement across agents)
- Collective Ownership (tension with Agent Role Topology: code vs. review authority)
- Sustainable Pace (protecting human vigilance vs. endless machine throughput)

## Chapter 3: Native aiXP Practices
- Spec-First Prompting (grounding intent before code generation)
- Domain Gap Surfacing (prompting the AI to identify missing business rules)
- Agent Role Topology (flat hierarchy: Lead/Spec, Scoped Implementers, Independent Reviewer)
- Executive Code Review (context-free evaluation: "make the code speak")
- Context Stewardship (maintaining repository memory and living CLAUDE.md infrastructure)
- Vigilance Budgeting (session limits, 4-item working memory wall, fatigue mitigation)
- Prioritization Authority (human retaining roadmap and judgment control)

## Chapter 4: DevOps & SRE Practices Adopted
- Risk-Tiered Merge Authority (matching review rigor to blast radius)
- Observability & Traceability in Agent Sessions (logging prompts, decisions, and diffs)
- Deployment Gating & Production Verification (smoke tests and canary checks)
- Blameless Post-Mortems for AI Failures (debugging prompt and context failure modes)

## Chapter 5: Testing Strategy
- The Verification Bottleneck
- The Four Testing Tiers (Unit, Integration, Contract, E2E)
- TDD as Both Specification and Mechanical Safety Net
- Regression Suite Maintenance at Machine Speed
- Test Flakiness and AI Hallucination Traps

## Chapter 6: Versioning & Release Identity
- Shipping with Predictability
- Semantic Versioning in Rapid-Fire Cycles
- Release Candidates vs. Generated Candidates
- Traceability: Linking Commits, Prompts, and Release Notes

## Chapter 7: aiXP in Context: The AI-Native SDLC
- Where aiXP Fits in the Industry Landscape
- Comparison with Enterprise AI Playbooks (e.g. Anthropic August 2026 framework)
- The Solo Practitioner vs. Enterprise Headcount
- Why Process Frameworks (Scrum/SAFe) Fail AI Teams

## Chapter 8: Scaling Beyond the Solo Practitioner
- Multi-Human, Multi-Agent Collaboration
- Desk-Level Discipline vs. Team Coordination
- Shared Context Infrastructure Across Developers
- Managing Concurrent Agent Swarms Without Chaos

## Chapter 9: What aiXP Is Not (Anti-Patterns & Failure Modes)
- Catalog of Failure Modes
- The Rubber-Stamp Reviewer
- The Undifferentiated Agent Swarm
- The Context-Free Prompt
- The Infinite Refactor Rabbit Hole
- "Faster Typing" vs. Engineering Velocity

## Appendix: The Original 12 XP Practices
- Summary and Reference of Kent Beck's 1999 Extreme Programming Practices

## Bibliography & References
- Annotated Citations, Lineage Sources, and Field References
