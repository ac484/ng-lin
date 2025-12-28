# Agent Chain Strategy – GigHub

Defines AI agent collaboration workflow, dependencies, priorities, and triggers.

## Overview

Multiple AI agents collaborate using a **chain reaction pattern** with clear dependencies and priorities.

## Agent Dependency Graph

```
Architecture Agent (P0) - Foundation
    ↓
Feature Agent (P1) - Implementation
    ↓ parallel
    ├→ Test Agent (P1)
    └→ Security Agent (P2)
        ↓
Code Review Agent (P1)
        ↓
Documentation Agent (P2)
    ↓
CI/CD Agent (P3)
```

## Agent Layers

### L0: Foundation (P0)
**Agents**: Architecture, Configuration  
**Purpose**: Define system structure and decisions  
**Execution**: Sequential, must complete before others

### L1: Development (P1)
**Agents**: Feature, Refactor, Test  
**Purpose**: Implement features and write tests  
**Execution**: Parallel where possible

### L2: Quality (P1-P2)
**Agents**: Code Review, Security, Performance  
**Purpose**: Ensure quality and security  
**Execution**: Sequential after development

### L3: Deployment (P2-P3)
**Agents**: Documentation, CI/CD  
**Purpose**: Prepare for deployment  
**Execution**: Sequential, after quality checks

## Key Agent Definitions

### Architecture Agent (P0)
- **Input**: Requirements, technical constraints
- **Output**: ADRs, module structure, interfaces
- **Triggers**: Feature Agent, Refactor Agent

### Feature Agent (P1)
- **Dependencies**: Architecture Agent
- **Angular 20 Rules**: `@if/@for/@switch`, standalone, `inject()`
- **Triggers**: Test Agent (parallel), Code Review Agent
- **Quality**: Strict mode, ESLint, 80%+ coverage

### Test Agent (P1)
- **Dependencies**: Feature Agent (parallel)
- **Types**: Unit, component, integration, E2E
- **Coverage**: 80%+ for new code

### Code Review Agent (P1)
- **Dependencies**: Feature, Test Agents
- **Focus**: Angular 20 syntax, ng-zorro, RxJS
- **Triggers**: Refactor Agent, Security Agent

### Security Agent (P2)
- **Focus**: XSS, CSRF, input validation
- **Output**: Security checklist, vulnerability report

### Documentation Agent (P2)
- **Updates**: README, ADRs, API docs, AGENTS.md
- **Standards**: Clear examples, current architecture

### CI/CD Agent (P3)
- **Checks**: Lint, test, build, security scan

## Priority Queue

- **P0**: Critical foundation (Architecture, Config)
- **P1**: Core development (Feature, Test, Code Review)
- **P2**: Quality enhancement (Security, Performance, Docs)
- **P3**: Deployment automation (CI/CD)

## Workflow Example

```
1. Architecture Agent creates module structure
2. Feature Agent implements feature
   - Test Agent runs in parallel
3. Code Review Agent validates
4. Security Agent scans
5. Documentation Agent updates docs
6. CI/CD Agent deploys
```

## Integration with AGENTS.md

Agents must:
- Read relevant AGENTS.md files before work
- Follow constraints and patterns
- Update documentation when changing interfaces
- Validate against allowed content rules

## Quick Reference

| Agent | Priority | Dependencies | Triggers |
|-------|----------|--------------|----------|
| Architecture | P0 | None | Feature, Refactor |
| Feature | P1 | Architecture | Test, Code Review |
| Test | P1 | Feature (parallel) | Code Review |
| Code Review | P1 | Feature, Test | Security, Docs |
| Security | P2 | Code Review | Docs |
| Documentation | P2 | Code Review | CI/CD |
| CI/CD | P3 | All quality checks | - |

---

Version: 2.0 | Updated: 2025-12-28
