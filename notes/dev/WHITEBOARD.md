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
	- [ ] no release boundaries invented by the agent.
	- [ ] plan ahead: design for requirements that can be seen coming. no built-in shortcuts.
- [ ] SRS, SDD, FMT, ATS, roadmap, TBD


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