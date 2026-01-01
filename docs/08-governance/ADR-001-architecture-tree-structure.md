# ADR-001: Implement Architecture Tree Structure for Event-Sourced System

## Status
**Accepted** - 2026-01-01

## Context

The ng-lin project is implementing an Event-Sourced, Causality-Driven system for construction site progress tracking. Previously, all code was cramped into the `src/` directory, which:

1. Mixed frontend (Angular) with backend logic (Event-Sourced core)
2. Made it difficult to understand system boundaries
3. Created development burden with unclear responsibilities
4. Did not clearly reflect the architectural principles

The architecture documents (`架構樹.md` and `docs/dev/0-目錄-v2-Task-SaaS.md`) outlined a clear separation between:
- **core-system/**: Event-Sourced backend with Aggregates, Events, Projections
- **angular-app/**: SaaS frontend consuming the core system

## Decision

We have restructured the project following the Architecture Tree pattern:

### New Structure

```
ng-lin/
├── core-system/              # Backend: Event-Sourced, Causality-Driven
│   ├── src/
│   │   ├── aggregates/       # DDD Aggregate Roots
│   │   ├── events/           # Domain Events (Facts)
│   │   ├── repositories/     # Event Store
│   │   ├── services/         # Saga/Process Managers
│   │   ├── projections/      # Read Models
│   │   └── utils/            # Shared utilities
│   └── tests/
│
├── angular-app/              # Frontend: Angular SaaS
│   └── src/
│       └── app/
│           ├── core/
│           ├── features/
│           ├── shared/
│           └── layout/
│
└── src/                      # Legacy (backward compatibility)
```

### Implementation Phases

**Phase 1: Core System Structure** ✅
- Created `core-system/` with subdirectories
- Implemented base event types and interfaces
- Created TaskAggregate, EventStore, EventBus
- Added utility functions (IDGenerator, TimeUtils)

**Phase 2: Angular App Migration** ✅
- Created `angular-app/` structure
- Copied existing Angular code to `angular-app/src/`
- Preserved backward compatibility with `src/`

**Phase 3: Documentation** ✅
- Updated README.md with new structure
- Created core-system/README.md
- Created angular-app/README.md
- This ADR

## Rationale

### Benefits

1. **Clear Separation of Concerns**
   - Backend logic (Event-Sourced) separate from frontend (Angular)
   - Easier to understand and maintain each layer

2. **Follows Architecture Documents**
   - Aligns with `架構樹.md`
   - Implements structure from `docs/dev/0-目錄-v2-Task-SaaS.md`

3. **Event Sourcing Principles**
   - Events are first-class citizens in `core-system/src/events/`
   - Clear Aggregate boundaries
   - Explicit Causality metadata

4. **Scalability**
   - Core system can be independently tested
   - Frontend can be swapped or multiple frontends can consume core
   - Cloud Functions can directly use core-system

5. **Development Experience**
   - Clearer mental model
   - Reduced cognitive load
   - Better team collaboration (frontend vs backend)

### Trade-offs

1. **Build Complexity**
   - Need to coordinate builds between core-system and angular-app
   - Mitigated by keeping both as TypeScript projects

2. **Backward Compatibility**
   - Keeping `src/` for now to avoid breaking existing references
   - Will migrate gradually

3. **Learning Curve**
   - Team needs to understand Event Sourcing concepts
   - Mitigated by comprehensive documentation

## Consequences

### Positive

- ✅ Clearer architecture boundaries
- ✅ Better alignment with DDD and Event Sourcing
- ✅ Easier to implement core principles (Event=Fact, State=Derived, Causality=Explicit)
- ✅ Reduced development burden
- ✅ Better testability

### Negative

- ⚠️ Need to update build scripts
- ⚠️ Need to update import paths
- ⚠️ Team needs training on new structure

### Neutral

- Core system is TypeScript-based (not a separate language/runtime)
- Can be deployed together or separately
- Firebase Cloud Functions can import from core-system

## Implementation Notes

### Files Created

**Core System:**
- `core-system/README.md` - Documentation
- `core-system/src/events/BaseEvents.ts` - Base event types
- `core-system/src/events/TaskEvents.ts` - Task domain events
- `core-system/src/events/InvoiceEvents.ts` - Invoice domain events
- `core-system/src/events/FieldLogEvents.ts` - FieldLog domain events
- `core-system/src/aggregates/TaskAggregate.ts` - Task aggregate
- `core-system/src/repositories/EventStore.ts` - Event storage
- `core-system/src/utils/EventBus.ts` - Event bus
- `core-system/src/utils/IDGenerator.ts` - ID generation
- `core-system/src/utils/TimeUtils.ts` - Time utilities
- `core-system/src/index.ts` - Entry point

**Angular App:**
- `angular-app/README.md` - Documentation
- `angular-app/src/` - Copied from existing `src/`

### Next Steps

1. Update `angular.json` to support both structures
2. Update `tsconfig.json` with path mappings
3. Create integration examples
4. Implement remaining aggregates (Invoice, FieldLog, Project)
5. Add Saga/Process Manager implementations
6. Add Projection implementations
7. Write comprehensive tests
8. Gradually migrate imports from `src/` to use core-system and angular-app

## References

- [架構樹.md](../../架構樹.md) - Architecture tree document
- [docs/dev/0-目錄-v2-Task-SaaS.md](../../docs/dev/0-目錄-v2-Task-SaaS.md) - Detailed structure
- [docs/02-paradigm/core-principles.md](../../docs/02-paradigm/core-principles.md) - Core principles
- [docs/04-core-model/event-model.md](../../docs/04-core-model/event-model.md) - Event model

## Approval

- **Author**: GitHub Copilot
- **Date**: 2026-01-01
- **Status**: Implemented
