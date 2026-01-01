# Core System - Event-Sourced, Causality-Driven Backend

## Overview

This is the backend core system implementing Event Sourcing and Causality-Driven architecture for the GigHub construction site progress tracking system.

## Architecture Principles

### Event = Fact
Events describe what has already happened, not commands or intentions.

### State = Derived
All state is derived from event replay. State is not the source of truth.

### Causality = Explicit
Every event explicitly records its cause, trigger, and process.

### Replay = Deterministic
The same event sequence always produces the same state.

## Structure

```
core-system/
├── src/
│   ├── aggregates/          # Core Aggregate containers
│   │   ├── ProjectAggregate.ts
│   │   ├── TaskAggregate.ts
│   │   ├── InvoiceAggregate.ts
│   │   └── FieldLogAggregate.ts
│   │
│   ├── events/              # Event definitions
│   │   ├── TaskEvents.ts
│   │   ├── InvoiceEvents.ts
│   │   ├── FieldLogEvents.ts
│   │   └── AggregateEvents.ts
│   │
│   ├── repositories/        # Event storage and replay
│   │   ├── EventStore.ts
│   │   └── AggregateRepository.ts
│   │
│   ├── services/            # Core business services / Saga / ProcessManager
│   │   ├── TaskService.ts
│   │   ├── InvoiceService.ts
│   │   ├── FieldLogService.ts
│   │   └── SagaManager.ts
│   │
│   ├── projections/         # Read Model / Query
│   │   ├── TaskProjection.ts
│   │   ├── InvoiceProjection.ts
│   │   ├── FieldLogProjection.ts
│   │   └── ProjectSummaryProjection.ts
│   │
│   ├── utils/               # Utilities and shared functions
│   │   ├── EventBus.ts
│   │   ├── IDGenerator.ts
│   │   └── TimeUtils.ts
│   │
│   └── index.ts             # Core system entry point
│
└── tests/                   # Unit tests
    ├── aggregates/
    ├── services/
    └── projections/
```

## Key Concepts

### Aggregates
Represent complete business units (Project / Contract / Order) that:
- Aggregate all internal events
- Manage internal state consistency
- Support multiple invoicing, task changes, log tracking
- Support FieldLog + logs

### Event Stream
Each aggregate manages its own event sequence with guaranteed causality:
```
TaskCreated → Child TaskCreated → TaskCompleted 
→ FieldLogCreated + Log → InvoiceRequested → InvoiceApproved 
→ InvoicePaid → Next Day FieldLog
```

### Saga / Process Manager
Manages causality across Aggregates / Tasks / Invoices / Logs

### Projection / Read Model
Supports:
- Task tree queries
- Multi-day FieldLog queries and statistics
- Multiple invoice statistics
- Project overview

## Integration with Angular App

The core system is consumed by the Angular SaaS frontend through:
1. Event publishing to Firebase
2. API endpoints (Cloud Functions)
3. Projection queries (Firestore queries)

## Development Guidelines

1. All files must be under 4000 characters
2. Use TypeScript strict mode
3. No `any` types - use proper interfaces
4. Events are immutable
5. All business logic in pure functions
6. State derived from events only
