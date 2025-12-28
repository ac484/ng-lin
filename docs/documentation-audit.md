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
- Completed full inventory and domain classification (table above).
- Declared canonical sources per domain and listed redundancies with keep/archive decisions.
- Published simplified canonical map and formatting rules to guide future edits.
- No content deletions performed; follow status map before future removals.
