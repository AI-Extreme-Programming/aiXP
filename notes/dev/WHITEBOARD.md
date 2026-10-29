>[!TODO xyz]
> hello
> - can
> - I 
> - put
> - a 
> - list
> - in 
> - [ ] here?


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
  

PDF build:  colophon - I didn’t specify where that should go - move it to the front if that’s more common - I think that’s where I’m used to seeing it.  

Extreme Programming for Machine-Speed Development  
(or your current: Embrace Change at Machine Speed)


## A note on intent 

A recurring thread in developing this has been how few working engineers seem to have a coherent model of practices like regression suite maintenance, tiered release strategy, or versioning discipline - not because these are obscure, but because they're rarely taught as a connected system, and AI tooling is what now makes running that full system affordable at small scale. Part of the goal here isn't just documenting one practitioner's method - it's making practices that used to require org-scale headcount teachable to individuals and small teams who now have the tooling to actually run them.




