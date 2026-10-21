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
2. The Problem with Vibe Coding (predictable failure modes: correctness drift, scope creep, context collapse, vigilance fatigue)
3. XP's Original Bet (why tight feedback loops beat upfront certainty; technical discipline vs. process)
4. What Changed When AI Joined the Team (the trust deficit; software as bipedal; moving the bottleneck)

## Chapter 1: The Manifesto
1. The Four Pillars & Rejection Criteria
   - Pillar 1: Verification is the Work (rejection test: does this increase unverified change?)
   - Pillar 2: Judgment is Not Delegatable (rejection test: real judgment vs. rubber stamp?)
   - Pillar 3: The Discipline Scales with the Tools (rejection test: holds up if AI is 2x faster?)
   - Pillar 4: Context is Infrastructure (rejection test: could a fresh session act without asking?)
2. Putting Rejection Criteria into Daily Practice (the gating questions)

## Chapter 2: XP Practices Carried Over, Modified
1. The Trust Factory Loop
2. Pairing (asymmetric: AI drives, human navigates)
3. Test-Driven Development (TDD as the load-bearing verification loop)
4. Refactoring (bounding unrequested refactors vs. cheap edits)
5. Continuous Integration (risk-tiered trunk integration)
6. Small Releases (verified candidates vs. generated candidates)
7. On-Site Customer (substituting domain gap surfacing)
8. Simple Design / YAGNI (preventing speculative AI over-generation)
9. Coding Standards (context prompt enforcement across agents)
10. Collective Ownership (tension with Agent Role Topology: code vs. review authority)
11. Sustainable Pace (protecting human vigilance vs. endless machine throughput)

## Chapter 3: Native aiXP Practices
1. Spec-First Prompting (grounding intent before code generation)
2. Domain Gap Surfacing (prompting the AI to identify missing business rules)
3. Agent Role Topology (flat hierarchy: Lead/Spec, Scoped Implementers, Independent Reviewer)
4. Executive Code Review (context-free evaluation: "make the code speak")
5. Context Stewardship (maintaining repository memory and living CLAUDE.md infrastructure)
6. Vigilance Budgeting (session limits, 4-item working memory wall, fatigue mitigation)
7. Prioritization Authority (human retaining roadmap and judgment control)

## Chapter 4: DevOps & SRE Practices Adopted
1. Risk-Tiered Merge Authority (matching review rigor to blast radius)
2. Observability & Traceability in Agent Sessions (logging prompts, decisions, and diffs)
3. Deployment Gating & Production Verification (smoke tests and canary checks)
4. Blameless Post-Mortems for AI Failures (debugging prompt and context failure modes)

## Chapter 5: Testing Strategy
1. The Verification Bottleneck
2. The Four Testing Tiers (Unit, Integration, Contract, E2E)
3. TDD as Both Specification and Mechanical Safety Net
4. Regression Suite Maintenance at Machine Speed
5. Test Flakiness and AI Hallucination Traps

## Chapter 6: Versioning & Release Identity
1. Shipping with Predictability
2. Semantic Versioning in Rapid-Fire Cycles
3. Release Candidates vs. Generated Candidates
4. Traceability: Linking Commits, Prompts, and Release Notes

## Chapter 7: aiXP in Context: The AI-Native SDLC
1. Where aiXP Fits in the Industry Landscape
2. Comparison with Enterprise AI Playbooks (e.g. Anthropic August 2026 framework)
3. The Solo Practitioner vs. Enterprise Headcount
4. Why Process Frameworks (Scrum/SAFe) Fail AI Teams

## Chapter 8: Scaling Beyond the Solo Practitioner
1. Multi-Human, Multi-Agent Collaboration
2. Desk-Level Discipline vs. Team Coordination
3. Shared Context Infrastructure Across Developers
4. Managing Concurrent Agent Swarms Without Chaos

## Chapter 9: What aiXP Is Not (Anti-Patterns & Failure Modes)
1. Catalog of Failure Modes
2. The Rubber-Stamp Reviewer
3. The Undifferentiated Agent Swarm
4. The Context-Free Prompt
5. The Infinite Refactor Rabbit Hole
6. "Faster Typing" vs. Engineering Velocity

## Appendix: The Original 12 XP Practices
1. Kent Beck's 1999 Extreme Programming Practices Reference
2. Mapping from 1999 Assumptions to AI-Native Realities

## Bibliography & References
1. Kent Beck / Tidy First & XP Lineage
2. Lean, DevOps & SRE References
3. Cognitive Load & Working Memory Research
4. Industry AI Playbooks and Reports
