# Optimized Documentation Index

Canonical navigation and ownership map. Use this page instead of `docs/INDEX.md` and `docs/document-index.md`; raw inventory lives in [`raw_doc_index.csv`](./raw_doc_index.csv).

## Pillar ownership (canonical entry points)

| Pillar | Canonical folder | Entry point | Responsibilities | Notes |
| --- | --- | --- | --- | --- |
| Strategy & Governance | `strategy-governance/` | `strategy-governance/README.md` | Platform structure, branching/risk gates, architecture decisions | Replace ⭐️ strategy summaries with links here |
| Identity & Tenancy | `identity-tenancy/` | `identity-tenancy/README.md` | AuthN/Z, roles, multi-tenancy, permission system | Use `identity/` + `multi-tenancy/` sub-suites; retire root duplicates |
| Change Control & Reference | `change-control/`, `reference/` | `change-control/README.md`, `reference/FRONTEND.md` (root) | Contracts, APIs, schemas, layer reference | Convert verbose READMEs to links; keep specs here |
| Automation & Delivery | `automation-delivery/` | `automation-delivery/README.md` + `event-bus/` | CI/CD, Functions, Event Bus ops | Treat ⭐️/Global Event Bus as exec summary only |
| Security & Compliance (Audit) | `security-compliance/` | `security-compliance/README.md` + `audit/` suite | Security baselines, audit system, validation reports | Make `security-compliance/audit/*` the source; link ⭐️ audit summaries |
| Observability & Operations | `observability-operations/` | `observability-operations/operations/README.md` | Monitoring, SLO/SLI, runbooks | Keep concise runbooks; drop duplicate status notes |
| Enablement & Experience | `enablement-experience/` | `enablement-experience/README.md` | Onboarding, UX/theme, design guardrails | Merge overlapping READMEs into this entry |
| AI Governance | `ai-governance/` | `ai-governance/README.md` | AI agent boundaries, behavior rules | Keep short policies; cross-link from governance |
| Legacy / Archive | `legacy-archive/` | `legacy-archive/README.md` | Historical/duplicate content pending rewrite | Do not add new content; migrate or delete |

## Duplication handling

- Navigation: this file supersedes `docs/INDEX.md` and `docs/document-index.md`; keep the CSV as the only raw inventory artifact.
- Audit/Event Bus: keep `security-compliance/audit/` and `automation-delivery/event-bus/` as sources; ⭐️ files remain optional exec summaries.
- Root loose files (`PRD`, `Permission.md`, `Layer L-1~L2.md`, `Github.md`) should migrate into `strategy-governance/` and be removed after merge.
- Empty/minimal placeholders (e.g., `collaboration/`) should be folded into governance or deleted.
- Delete legacy navigation files once links are updated; treat `optimized-index.md` as the single entry.

## Usage

1. Add new documentation only under the canonical folder above and declare its pillar in the opening section.
2. Before adding a new file, check `raw_doc_index.csv` for existing coverage; modify the canonical entry instead of creating a parallel document.
3. When consolidating, link executive summaries (⭐️) to their source suites and drop repeated prose.
