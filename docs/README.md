# Documentation Governance

This document defines the structure, ownership, and governance of platform documentation.

---

## Structure Overview

See [INDEX.md](INDEX.md) for complete documentation organization.
See [documentation-audit.md](documentation-audit.md) for canonical sources, redundancy notes, and formatting rules.

## Folder Descriptions

### ai-governance
AI roles, authority, decision protocols, safety rules, review checklists.

### strategy-governance  
Platform principles, ownership, decision framework, risk gates, compliance.

### identity-tenancy
AuthN/Z, roles & permissions, org tenancy, account context switching.

### change-control
Architecture, feature design, API/data/event contracts, versioning, ADRs.

### collaboration
Contribution models, issue management, PR workflows, discussion guidelines.

### automation-delivery
CI/CD pipelines, workflows, runners, OIDC, deployment playbooks.

### security-compliance
Security baselines, secrets management, access policies, audits.

### observability-operations
Monitoring, metrics/SLIs/SLOs, logging/tracing, runbooks, incident response.

### enablement-experience
Onboarding, getting started, UX guidelines, design system, UI themes.

### legacy-archive
Historical or duplicate docs pending rewrite; track migrations.

---

## README Guidelines

1. **One README per domain** — defines purpose, scope, navigation
2. **Secondary folders** — README only if complex
3. **Lower-level folders** — README optional
4. **Content:** Concise, describes scope and rules

---

## File Naming Convention

```
01-topic-overview.md
02-topic-interface-spec.md  
03-topic-architecture-diagram.md
04-topic-data-model-schema.md
```

---

## README Template

```md
# [Folder Name]

**Purpose:** Short description  
**Scope:** Include/exclude rules  
**Structure:** Subfolders and key files  
**Related:** References to other domains
```
