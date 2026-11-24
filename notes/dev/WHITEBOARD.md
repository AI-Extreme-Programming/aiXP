

---

"If I have seen further than others, it is by standing upon the shoulders of giants." — Isaac Newton


## Formal Spec Type List (Destination: Appendix Reference & Scoping Prompt)

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
  


--- 

---

https://youtu.be/b9EbCb5A408?is=1K6c1TPN2nfpWSRT 

---

### 1. Macro Structure: Premature Tactical Deep-Dive in the Introduction

In [00.01.60-how-to-read.md](app://obsidian.md/docs/aixp/00.01.60-how-to-read.md#L13), the Introduction is framed as:

> _"diagnosing what goes wrong with 'vibe coding', what Extreme Programming's original bet was and why it transfers, and how the economics of software inverted when AI entered the terminal."_

However, [00.02.70-xp-background.md](app://obsidian.md/docs/aixp/00.02.70-xp-background.md) expands well beyond historical framing into tactical methodology:

- Lines 30-45 detail **Acceptance Test-Driven Design (ATDD)** mechanics.
- Lines 47-61 define formal spec constellations (**SRS**, **SDD**, **ATS**, **FMT**).
- Lines 63-85 explain **Living Micro-Specs** with a full Mermaid lifecycle diagram.

**The Structural Issue:** This introduces detailed practice artifacts (SRS/SDD/ATS/FMT, micro-spec loops) _before_ the reader has reached [Chapter 1: The Manifesto](app://obsidian.md/docs/aixp/01.01.50-manifesto.md) (the foundational pillars) and directly undercuts [Chapter 2: Intent and Context](app://obsidian.md/docs/aixp/01.02.50-intent-and-context.md) (where specs and contracts are formally taught). The Introduction transitions from diagnosis into operational training before establishing its premise.

---

### 3. Tonal Whiplash in `00.02.60-vibe-coding.md`

In [00.02.60-vibe-coding.md](app://obsidian.md/docs/aixp/00.02.60-vibe-coding.md):

- Lines 28-43 (_The Case for Vibe_) warmly defend vibe coding for weekend prototyping, disposable spikes, and hackathons (_"intoxicatingly fun,"_ _"exhilarating creative experience"_).
- Line 44 (_The Executive Delusion_) pivots immediately into a scathing indictment of corporate C-suites firing developers (_"epidemic of magical thinking,"_ _"staggering poverty of leadership ambition"_).

**The Seam:** Both arguments are sound, but juxtaposed directly, the transition is abrupt. The connective tissue is missing: corporate leadership's fatal mistake was taking those exact weekend hackathon demos and assuming they represented sustainable enterprise engineering. Adding that single conceptual bridge would unify the two sections.



