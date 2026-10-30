

- maintainability
- fatique

---

question for every page:  is it telling a story, is it coherent, does it wander, does it make the reader want to continue, are there any threads i've left untouched?

"If I have seen further than others, it is by standing upon the shoulders of giants." — Isaac Newton

## Spec Development Pitfalls

- [ ]  monkeys
- [ ] recording history
- [ ] dropping engineer voice in lieu of a more narrative tone
- [ ] building in shortcuts and dead ends:  "v1 doesn't include...." -- don't let the agent define v1 or take certain things off the table.  When it does so, it can be creating a design that builds you into a corner, requiring a rewrite for future growth -- remind it that we're engineers, we don't take shortcuts, we do the hard work now to minimize user and maintainer friction in the future.
- [ ] a good working boundary during spec design: 
	- [ ] one question at a time, asked in full
		- interview style works well, 
		- allows you to explore a question until it's exhausted and fully scoped
		- avoid the built in assumptions (answers to questions) that are required in order to ask every qeustion in one turn. Questions evolve.  Let them.
	- [ ] no release boundaries invented by the agent.
	- [ ] plan ahead: design for requirements that can be seen coming. no built-in shortcuts.
- [ ] SRS, SDD, FMT, ATS, roadmap, TBD, README
- [ ] writing your spec from a session with a lot of research context in it can often make the task difficult because of the agents propensity to make excuses and justify decisions - it will bring in unrelated references to projects and names it internally feels is important.
- [ ] proposal - let the agent know that the spec is inherently a proposal, so it doesn't mark everything "proposed", which you'll just have to clean out and talk the agent through in the future.


formal spec type list:

* Product & Requirements
   * Product Requirement Documents (PRDs)
   * User Stories & Acceptance Criteria (e.g., Gherkin)
   * Functional Specifications
 * Architecture & Technical Design
   * Technical Design Documents (TDDs / RFCs)
   * Architecture Decision Records (ADRs)
   * System Context & Component Diagrams (e.g., C4 model)
 * Interface & Contract Specifications
   * OpenAPI / Swagger (REST)
   * Protocol Buffers / gRPC
   * GraphQL Schemas
   * AsyncAPI (Event-driven architectures)
   * JSON Schema / Apache Avro
 * Testing & Behavioral Specifications
   * BDD Executable Specifications (Cucumber / Behave)
   * Consumer-Driven Contracts (Pact)
 * Design & UI Specifications
   * Design Tokens (Figma / Style Dictionary)
   * Component Documentation & Variant Specs (Storybook)
 * Infrastructure & Compliance Specifications
   * Infrastructure as Code (Terraform / OpenTofu / Pulumi)
   * Container Orchestration Manifests (Kubernetes YAML / Helm)
   * Software Bill of Materials (SBOM / SPDX / CycloneDX)
  


Extreme Programming for Machine-Speed Development  
(or your current: Embrace Change at Machine Speed)


## A note on intent 

A recurring thread in developing this has been how few working engineers seem to have a coherent model of practices like regression suite maintenance, tiered release strategy, or versioning discipline - not because these are obscure, but because they're rarely taught as a connected system, and AI tooling is what now makes running that full system affordable at small scale. Part of the goal here isn't just documenting one practitioner's method - it's making practices that used to require org-scale headcount teachable to individuals and small teams who now have the tooling to actually run them.

"practitioner-first"

---
Acceptance Test-Driven Development (ATDD) & Specification by Example
Unlike the singular lineage of Kent Beck and Extreme Programming, Acceptance Test-Driven Development emerged across overlapping branches that pulled customer intent directly into executable automation:
Pugh, Ken. Lean-Agile Acceptance Test-Driven Development: Better Software Through Collaboration. Addison-Wesley, 2010.
The foundational text codifying ATDD as a distinct practice, focusing on the "Three Amigos" cadence (business, developer, tester) to eliminate translation errors before writing code.
Gärtner, Markus. ATDD by Example: A Practical Guide to Acceptance Test-Driven Development. Addison-Wesley Signature Series (Kent Beck), 2012.
The direct structural sister volume to Beck’s TDD by Example, demonstrating real-world acceptance test harnesses and refactoring loops.
Cunningham, Ward, and Martin, Robert C. Fit / FitNesse. 2002–present.
The early mechanical bridge between business tables and executable suites that proved acceptance tests could act as a living, automated specification long before modern agentic tooling.
Adzic, Gojko. Specification by Example: How Successful Teams Deliver the Right Software. Manning, 2011.
The definitive treatment on treating tests not as verification gates built after the fact, but as living, executable documentation that defines system boundaries.
North, Dan. Introducing BDD (Behavior-Driven Development). Better Software, 2006.
The root evolution of TDD that swapped verification jargon for human-readable behavioral contracts (Given/When/Then), later embodied in tools like Cucumber and JBehave.

---



