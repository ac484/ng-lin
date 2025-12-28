---
post_title: 'Documentation Audit and Simplification'
author1: 'Copilot Agent'
post_slug: 'documentation-audit-simplification'
microsoft_alias: 'copilot'
featured_image: '/docs/Image.png'
categories: ['documentation']
tags: ['docs', 'governance', 'audit']
ai_note: 'Prepared with AI assistance; review for accuracy.'
summary: 'Inventory and simplification plan that classifies docs, flags redundancies, and defines canonical sources with unified style rules.'
post_date: '2025-12-28'
---

## Summary
- Collected 173 markdown files across the documentation tree.
- Classified by domain and mapped canonical sources to reduce duplication.
- Flagged redundant or outdated files and defined keep/retire decisions.
- Added formatting and language rules to unify future edits.


## Simplification Priority (精簡優先)
- Focus on core messages first: remove duplicated paragraphs and keep only canonical references per domain map.
- Convert long paragraphs into bullet lists or tables; avoid restating the same rationale in multiple sections.
- Prefer short summaries (3-5 lines) at the top of each doc, followed by actionable checklists.
- When overlaps exist, keep the Core doc and reduce Secondary/Historical versions to a one-paragraph pointer.
- Normalize heading depth to H2/H3 only; strip decorative headings or repeated titles.

## Inventory by Domain

| Domain | Purpose | File count | Canonical anchor |
| --- | --- | --- | --- |
| ⭐️ | Strategic architecture snapshots and task breakdowns | 33 | ⭐️/AUDIT_SYSTEM_MASTER_INDEX.md for architecture indexes |
| strategy-governance | Principles, architecture guides, blueprint specs | 46 | strategy-governance/architecture/README.md |
| identity-tenancy | Identity, auth, tenancy runbooks and reports | 17 | identity-tenancy/identity/VALIDATION_REPORT.md |
| change-control | Contract APIs and data models | 8 | change-control/api/介面規格)/README.md |
| automation-delivery | Event bus and deployment runbooks | 12 | automation-delivery/event-bus/VALIDATION_REPORT.md |
| observability-operations | Monitoring indexes and checklists | 5 | observability-operations/operations/README.md |
| enablement-experience | Design, onboarding, UI theme | 19 | enablement-experience/getting-started/README.md |
| security-compliance | Audit logs, security baselines | 10 | security-compliance/audit/VALIDATION_REPORT.md |
| ai-governance | AI agent scope and profiles | 4 | ai-governance/README.md |
| reference | Layered technical references | 9 | reference/SKELETON.md |
| collaboration | Collaboration model | 1 | collaboration/README.md |
| legacy-archive | Historical material only | 1 | legacy-archive/README.md |
| root loose files | Standalone guides (firebase.md, Github.md, Permission.md, PRD/prd.md, Layer L-1~L2.md, event_sourcing_guide.md) | 6 | Move into relevant domains (see actions) |

## Redundancy and Status Map
- **Identity & Auth**: docs/⭐️/Identity & Auth.md duplicates identity-tenancy/Identity & Auth.md. Keep identity-tenancy for current guidance; treat ⭐️ version as historical overview.
- **Global Event Bus**: docs/⭐️/Global Event Bus.md overlaps automation-delivery/event-bus/* runbooks. Keep automation-delivery folder as canonical; mark ⭐️ page as high-level summary only.
- **Global Audit Log**: docs/⭐️/Global Audit Log.* overlaps security-compliance/audit/*. Keep security-compliance/audit for operations; keep AUDIT_SYSTEM_MASTER_INDEX.md for architecture; archive Global-Audit-Log-系統拓撲分析與實施路徑.md after migration.
- **Blueprint duplication**: strategy-governance/blueprint/system/* overlaps ⭐️/Shared Module 完整結構樹圖與設計.md. Keep strategy-governance/blueprint/index.md as source of truth; reference ⭐️ page only for visuals.
- **Legacy artifacts**: Layer L-1~L2.md and legacy-archive/README.md are outdated; keep only for historical notes and exclude from onboarding.

## Simplified Canonical Map
- Architecture & Principles: strategy-governance/architecture/README.md → per-module guides.
- Identity & Tenancy: identity-tenancy/identity/VALIDATION_REPORT.md → supporting runbooks and deployment guides.
- Event Bus & Automation: automation-delivery/event-bus/VALIDATION_REPORT.md → API_REFERENCE.md for integration.
- Audit & Security: security-compliance/audit/VALIDATION_REPORT.md → PRODUCTION_RUNBOOK.md for operations.
- Design & Onboarding: enablement-experience/getting-started/README.md → UI theme and design subfolders as needed.
- AI Governance: ai-governance/README.md → behavior guidelines and character profiles.

## Format and Language Rules
- Headings start at `##`; keep titles concise and action-oriented.
- Use English for section headings; include bilingual notes only when required for clarity.
- Prefer tables for indexes; keep line length under 120 characters.
- Name files with kebab-case or numeric prefixes (e.g., 01-overview.md); avoid spaces when adding new files.
- Each doc begins with a short summary paragraph and a status tag (`Canonical`, `Historical`, `Draft`).
- Link to canonical anchors above instead of duplicating content; mark overlaps explicitly.

## Immediate Actions Applied
- Exported a full document index with filename, path, type, and last-modified timestamps at [document-index.md](document-index.md).
- Completed full inventory and domain classification (table above).
- Declared canonical sources per domain and listed redundancies with keep/archive decisions.
- Published simplified canonical map and formatting rules to guide future edits.
- No content deletions performed; follow status map before future removals.


## Classification and Importance

Purpose categories: user-guide, design/architecture, API/contract, operations/runbook, validation/reporting, governance/policy, onboarding/design-system, historical.
Importance levels: Core (canonical source), Secondary (supporting or high-level summary), Outdated (historical/legacy only).

### Domain classification map
- ⭐️: design/architecture (Secondary unless master indexes noted as Core)
- strategy-governance: governance/policy (Core: architecture/README.md; Secondary: others)
- identity-tenancy: operations/runbook + validation/reporting (Core: identity/VALIDATION_REPORT.md; Secondary: other identity-tenancy files)
- change-control: API/contract (Core: api/介面規格)/README.md)
- automation-delivery: operations/runbook (Core: event-bus/VALIDATION_REPORT.md; Secondary: other event-bus docs)
- observability-operations: operations/runbook (Core: operations/README.md)
- enablement-experience: onboarding/design-system (Core: getting-started/README.md)
- security-compliance: operations/runbook + validation/reporting (Core: audit/VALIDATION_REPORT.md; Outdated: security-compliance/README.md if superseded)
- ai-governance: governance/policy (Core: ai-governance/README.md)
- reference: design/architecture reference (Secondary)
- legacy-archive + Layer L-1~L2.md: historical (Outdated)
- Root loose files (firebase.md, Github.md, Permission.md, PRD/prd.md, event_sourcing_guide.md): Secondary until migrated to domains

## Analysis of Structure and Redundancy
- Headings inconsistent across ⭐️ snapshots vs. domain READMEs; normalize to start at H2 with concise titles.
- Duplicates:
  - Identity & Auth: keep identity-tenancy/Identity & Auth.md (Core), mark ⭐️/Identity & Auth.md as Historical.
  - Global Event Bus: keep automation-delivery/event-bus/VALIDATION_REPORT.md (Core), keep ⭐️/Global Event Bus.md as Secondary overview.
  - Global Audit Log: keep security-compliance/audit/VALIDATION_REPORT.md (Core), keep ⭐️/AUDIT_SYSTEM_MASTER_INDEX.md for architecture, archive Global-Audit-Log-系統拓撲分析與實施路徑.md.
  - Blueprint structures: keep strategy-governance/blueprint/index.md (Core), keep ⭐️/Shared Module 完整結構樹圖與設計.md as Secondary visuals.
- Naming inconsistencies: prefer kebab-case without spaces; avoid mixed languages in filenames for new docs.

## Optimization and Standardization Steps
- Redundant detail trimmed to canonical map; future updates should link to Core docs instead of duplicating content.
- For long narrative sections, prefer bullet lists and tables; ensure status tags (Core/Secondary/Outdated) appear near the top.
- Use unified metadata frontmatter fields: post_title, author1, post_slug, microsoft_alias, featured_image, categories, tags, ai_note, summary, post_date.
- Heading policy: start at `##` within docs folder, limit to H3 for subsections; keep line length <=120 characters.

## Maintenance Plan
- Rescan docs monthly (or after major merges) and regenerate [document-index.md](document-index.md).
- On new docs: assign purpose category + importance tag, add to canonical map if applicable, and ensure metadata/frontmatter present.
- When archiving: move files to legacy-archive/ and update redundancy notes here.
- Keep README links aligned with canonical anchors to avoid drift.
