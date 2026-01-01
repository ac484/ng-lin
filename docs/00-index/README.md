# System Navigation

> Quick reference and navigation hub for the Causality-Driven Event-Sourced Process System.

## Documentation Map

### Foundations
- **[01-vision](../01-vision)** - WHY this architecture exists
- **[02-paradigm](../02-paradigm)** - Core paradigm: Events, Causality, Multi-View

### Architecture & Design
- **[03-architecture](../03-architecture)** - Layered structure (Event → Decision → Projection → UI)
- **[04-core-model](../04-core-model)** - Events, Decisions, Projections, Processes
- **[05-process-layer](../05-process-layer)** - Saga & Process Manager patterns
- **[06-projection-decision](../06-projection-decision)** - How projections and decisions work

### Operations & Governance
- **[07-operability](../07-operability)** - Monitoring, debugging, time-travel, replay
- **[08-governance](../08-governance)** - Event versioning, schema evolution, policies

### Critical References
- **[09-anti-patterns](../09-anti-patterns)** - What NOT to do (read this first!)
- **[10-reference](../10-reference)** - Official resources and external links
- **[99-appendix](../99-appendix)** - Glossary, catalogs, migration guides

---

## Quick Reference

### Architectural Guarantees
1. Task is the ONLY business entity
2. Events are the ONLY source of truth
3. State = replay(events)
4. Multiple views = projections (NOT models)
5. Decisions are centralized

### Core Concepts
- **Event**: Immutable fact (TaskCreated, TaskStarted)
- **Projection**: Derived view (List, Board, Why)
- **Decision**: Business rule enforcement (decideStartTask)
- **Saga/Process**: Long-running workflow coordination
- **Causality**: Event dependency tracking (causedBy)

### Event Flow
```
Command → Decision (validate) → Event (emit) → Event Store (persist) → Projection (replay) → UI (observe)
```

---

## Navigation by Role

### For Developers
1. Start: [02-paradigm](../02-paradigm) - Understand the paradigm shift
2. Then: [04-core-model](../04-core-model) - Learn event/decision/projection structures
3. Practice: [06-projection-decision](../06-projection-decision) - See code patterns
4. Avoid: [09-anti-patterns](../09-anti-patterns) - Don't make these mistakes

### For Architects
1. Start: [01-vision](../01-vision) - Understand goals and constraints
2. Then: [03-architecture](../03-architecture) - See layered structure
3. Deep Dive: [05-process-layer](../05-process-layer) - Process coordination
4. Governance: [08-governance](../08-governance) - Evolution strategies

### For Project Managers
1. Start: [01-vision](../01-vision) - Business value and use cases
2. Then: [09-anti-patterns](../09-anti-patterns) - Risk mitigation
3. Operations: [07-operability](../07-operability) - Monitoring and debugging

---

## Implementation Roadmap

### Phase 1: Platform Layer (~170 files)
- User, Organization, Team, Collaborator, Bot entities
- Platform event store & processes
- Platform UI components

### Phase 2: Task Domain (~100 files)
- Task events, decisions, projections
- Task processes, commands, models
- Task UI components (7 views)

### Phase 3: Integration & Testing
- Platform ↔ Task integration
- E2E test expansion
- Dev Tools updates

**Total**: ~340 files

---

## Status Indicators

### Core Layer ✅ (100% Complete - 63 files)
- Foundation, Governance, Observability, Error/Result systems

### Infrastructure Layer ✅ (100% Complete - 40+ files)
- Abstractions, Firebase providers (Event Store, Auth, Repository, Storage, Functions)

### Platform Layer 🗹 (Structure Defined - ~170 files)
- User, Organization, Team, Collaborator, Bot entities
- Platform processes & UI

### Task Domain 🗹 (Structure Defined - ~100 files)
- Events, Decisions, Projections, Processes
- Commands, Models, UI (7 views)

---

## Key Documents

| Document | Purpose |
|----------|---------|
| [Task.md](../../Task.md) | Task as only business entity |
| [SaaS.md](../../SaaS.md) | Platform Layer multi-tenant design |
| [0-目錄-v2-Task-SaaS.md](../../0-目錄-v2-Task-SaaS.md) | Complete file structure (~340 files) |
| [Causality-Driven System](../../Causality-Driven%20Event-Sourced%20Process%20System/) | Enable, Disable, SYS principles |

---

## Critical Reminders

❗ **Task is the ONLY business entity** - No other domain aggregates allowed
❗ **Events are immutable** - Never UPDATE or DELETE events
❗ **Projections are pure functions** - No side effects, no DB writes
❗ **Decisions validate first** - No event without decision approval
❗ **Read anti-patterns** - Know what NOT to do

---

**Version**: v2.0  
**Last Updated**: 2025-12-31
