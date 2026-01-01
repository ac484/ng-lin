# Architecture Tree Implementation Guide

## Overview

This document provides a practical implementation guide for the Architecture Tree structure adopted by ng-lin.

## Structure Visualization

```
ng-lin/
│
├── 📦 core-system/                  # Event-Sourced Backend Core
│   │
│   ├── 📂 src/
│   │   ├── 📁 aggregates/           # Aggregate Roots (DDD)
│   │   │   ├── TaskAggregate.ts     ✅ Implemented
│   │   │   ├── InvoiceAggregate.ts  ⏳ Pending
│   │   │   ├── FieldLogAggregate.ts ⏳ Pending
│   │   │   └── ProjectAggregate.ts  ⏳ Pending
│   │   │
│   │   ├── 📁 events/               # Domain Events (Immutable Facts)
│   │   │   ├── BaseEvents.ts        ✅ Implemented
│   │   │   ├── TaskEvents.ts        ✅ Implemented
│   │   │   ├── InvoiceEvents.ts     ✅ Implemented
│   │   │   └── FieldLogEvents.ts    ✅ Implemented
│   │   │
│   │   ├── 📁 repositories/         # Event Storage & Replay
│   │   │   ├── EventStore.ts        ✅ Implemented
│   │   │   └── AggregateRepository.ts ⏳ Pending
│   │   │
│   │   ├── 📁 services/             # Domain Services / Saga / Process Manager
│   │   │   ├── TaskService.ts       ⏳ Pending
│   │   │   ├── InvoiceService.ts    ⏳ Pending
│   │   │   ├── FieldLogService.ts   ⏳ Pending
│   │   │   └── SagaManager.ts       ⏳ Pending
│   │   │
│   │   ├── 📁 projections/          # Read Models (CQRS Query Side)
│   │   │   ├── TaskProjection.ts    ⏳ Pending
│   │   │   ├── InvoiceProjection.ts ⏳ Pending
│   │   │   ├── FieldLogProjection.ts ⏳ Pending
│   │   │   └── ProjectSummaryProjection.ts ⏳ Pending
│   │   │
│   │   ├── 📁 utils/                # Shared Utilities
│   │   │   ├── EventBus.ts          ✅ Implemented
│   │   │   ├── IDGenerator.ts       ✅ Implemented
│   │   │   └── TimeUtils.ts         ✅ Implemented
│   │   │
│   │   └── index.ts                 ✅ Entry Point
│   │
│   ├── 📂 tests/                    # Unit Tests
│   │   ├── aggregates/
│   │   ├── services/
│   │   └── projections/
│   │
│   └── README.md                    ✅ Documentation
│
├── 🎨 angular-app/                  # Angular SaaS Frontend
│   │
│   ├── 📂 src/
│   │   ├── app/
│   │   │   ├── core/                # Core Angular services
│   │   │   ├── features/            # Feature modules
│   │   │   │   ├── tasks/           ⏳ Pending
│   │   │   │   ├── fieldlogs/       ⏳ Pending
│   │   │   │   └── invoices/        ⏳ Pending
│   │   │   ├── shared/              # Shared components
│   │   │   └── layout/              # Layout components
│   │   ├── assets/
│   │   └── environments/
│   │
│   └── README.md                    ✅ Documentation
│
├── 📂 src/                          # Legacy (Backward Compatibility)
│   └── app/                         # Original Angular code
│
├── 📂 docs/                         # Documentation
│   ├── 00-index/                    # Navigation
│   ├── 02-paradigm/                 # Core Principles
│   ├── 03-architecture/             # Architecture Design
│   ├── 04-core-model/               # Event/Causality/Time Models
│   ├── 05-process-layer/            # Saga/Process Manager
│   ├── 06-projection-decision/      # Projections & Queries
│   └── 08-governance/               # ADRs
│       └── ADR-001-architecture-tree-structure.md ✅
│
├── 架構樹.md                        # Architecture Tree (Original)
├── 架構.md                          # Architecture Overview
└── README.md                        ✅ Updated

Legend: ✅ Implemented | ⏳ Pending | ❌ Not Started
```

## Data Flow

```
User Action (Angular App)
    ↓
Command Handler (Angular Service)
    ↓
Core System (Aggregate)
    ↓
Domain Event Published
    ↓
Event Store (Firestore)
    ↓
    ├→ Saga/Process Manager (if needed)
    │      ↓
    │  Orchestrate next steps
    │
    └→ Projection Updates (Read Models)
           ↓
       Query Results (Angular App)
```

## Event Flow Example

### Creating a Task

```typescript
// 1. Angular Component
taskService.createTask(command) 

// 2. Angular Service → Core System
→ TaskAggregate.create(...)

// 3. Core System → Generate Event
→ TaskCreatedEvent {
    id: "evt-123",
    aggregateId: "task-456",
    aggregateType: "Task",
    eventType: "TASK_CREATED",
    data: { title, description, ... },
    metadata: {
      causedBy: "user-action",
      causedByUser: "user-789",
      causedByAction: "CREATE_TASK",
      timestamp: Date.now(),
      blueprintId: "blueprint-001"
    }
  }

// 4. Publish Event
→ eventBus.publish(event)
→ eventStore.append(event)

// 5. Event Handlers
→ TaskProjection.handleTaskCreated(event)
→ FieldLogService.recordTaskCreation(event) // if needed

// 6. Query Updated Projection
→ Angular App receives updated task list
```

## Integration Patterns

### Pattern 1: Direct Core Import (Recommended for Cloud Functions)

```typescript
// In Cloud Functions
import { TaskAggregate, TaskCreatedEvent } from '../../core-system/src';

export const createTask = functions.https.onCall(async (data, context) => {
  const event: TaskCreatedEvent = {
    // ... create event
  };
  
  const aggregate = TaskAggregate.replayFrom([event]);
  // ... process
});
```

### Pattern 2: API Service Layer (Recommended for Angular)

```typescript
// In Angular App
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class TaskApiService {
  constructor(private http: HttpClient) {}
  
  createTask(command: CreateTaskCommand) {
    // Call Cloud Function
    return this.http.post('/api/tasks', command);
  }
  
  getTasks() {
    // Query Firestore projection
    return this.firestore.collection('task_projections').get();
  }
}
```

### Pattern 3: Event Subscription (Real-time Updates)

```typescript
// In Angular Component
this.taskProjection$ = this.firestore
  .collection('task_projections')
  .valueChanges();
  
// Updates automatically when events are processed
```

## Development Workflow

### Adding a New Feature

1. **Define Events** in `core-system/src/events/`
2. **Create Aggregate** in `core-system/src/aggregates/`
3. **Implement Projection** in `core-system/src/projections/`
4. **Add Service Layer** (if needed) in `core-system/src/services/`
5. **Create Angular Components** in `angular-app/src/app/features/`
6. **Wire up API calls** in Angular services
7. **Test end-to-end**

### Testing Strategy

```
Unit Tests (core-system/tests/)
    ↓
Integration Tests (test event flow)
    ↓
E2E Tests (angular-app/e2e/)
```

## Best Practices

### DO ✅

- Keep files under 4000 characters
- Use TypeScript strict mode
- Define clear event types
- Write deterministic aggregates
- Test event replay
- Document causality
- Use proper typing

### DON'T ❌

- Modify events after creation
- Mix frontend and backend logic
- Skip causality metadata
- Use mutable state in aggregates
- Ignore event versioning
- Create circular dependencies

## Migration Path

### Phase 1: Structure ✅
- Create directory structure
- Implement base types
- Set up documentation

### Phase 2: Core Implementation ⏳
- Complete all aggregates
- Implement all projections
- Add saga/process managers

### Phase 3: Angular Integration ⏳
- Create feature components
- Wire up API services
- Implement real-time updates

### Phase 4: Testing & Documentation ⏳
- Comprehensive tests
- User documentation
- API documentation

### Phase 5: Deprecation ⏳
- Remove legacy `src/` structure
- Update all imports
- Final cleanup

## Resources

- [Core System README](../core-system/README.md)
- [Angular App README](../angular-app/README.md)
- [ADR-001](../docs/08-governance/ADR-001-architecture-tree-structure.md)
- [Event Model](../docs/04-core-model/event-model.md)
- [Causality Model](../docs/04-core-model/causality-model.md)
