# Quick Reference

> Essential concepts and patterns at a glance

## Core Guarantees

**MUST BE TRUE:**
1. ✅ Task is ONLY business entity
2. ✅ Events are ONLY source of truth
3. ✅ State = replay(events)
4. ✅ Multiple views = projections
5. ✅ Decisions are centralized

## Event Anatomy

```typescript
interface DomainEvent {
  id: string;              // Unique event ID
  type: string;            // Event type (e.g., "TaskStarted")
  aggregateId: string;     // Which Task
  causedBy: string[];      // Predecessor event IDs
  timestamp: number;       // When it happened
  data: T;                 // Event payload
}
```

## Causality Chain

```
TaskCreated(id=1, causedBy=[])
  ↓
TaskAssigned(id=2, causedBy=[1])
  ↓
TaskStarted(id=3, causedBy=[2])
  ↓
TaskCommentAdded(id=4, causedBy=[3])
```

## 7 Task Projections

| Projection | Purpose | Rebuild Strategy |
|------------|---------|------------------|
| task-list | Flat summary | Full replay |
| task-board | Kanban columns | Filter by status |
| task-why | Event history | Chronological |
| task-discussion | Threaded view | Group by thread |
| task-comment | Comments only | Filter comment events |
| task-attachment | Files list | Filter attachment events |
| task-timeline | All events | Chronological with metadata |

## Decision Patterns

```typescript
// Decision validates BEFORE emitting event
function decideStartTask(
  events: DomainEvent[], 
  command: StartTaskCommand
): Result<TaskStarted> {
  const state = replay(events);
  
  if (state.status !== 'assigned') {
    return Err('Task must be assigned first');
  }
  
  if (state.assignee !== command.userId) {
    return Err('Only assignee can start task');
  }
  
  return Ok({
    type: 'TaskStarted',
    aggregateId: command.taskId,
    causedBy: [last(events).id],
    data: { startedBy: command.userId }
  });
}
```

## ❌ Anti-Patterns

**NEVER create events for:**
- UI interactions (ButtonClicked)
- I/O operations (HttpRequestSent)
- Technical errors (DatabaseErrorOccurred)
- High-frequency data (PriceUpdated)
- Data sync (EntityUpdated)

## ✅ Event Checklist

Before creating an event, ask:
- [ ] Is this an immutable fact?
- [ ] Can I explain it to business people?
- [ ] Will it matter in 10 years?
- [ ] Is it needed to rebuild state?
- [ ] Does it have causality (causedBy)?

## Layer Responsibilities

| Layer | Responsibility | Never Do |
|-------|----------------|----------|
| UI | Display | Mutate state |
| Projection | Derive views | Decide |
| Process | Workflows | Business rules |
| Decision | Validate | Persist |
| Event | Record facts | Mutate |
| Event Store | Persist/query | Delete |

## Common Commands

```bash
npm start    # Dev server
npm test     # Unit tests
npm run e2e  # E2E tests
```

## Key Locations

```
src/app/
  core/               # 63 files ✅
  infrastructure/     # 40+ files ✅
  platform/           # ~170 files
  features/task/      # ~100 files
    events/           # Domain events
    decisions/        # Rules
    projections/      # 7 views
    processes/        # Workflows
```

## Troubleshooting

**Event missing?** → Check causedBy chain
**Projection sync?** → Rebuild from t=0
**Decision error?** → Review business rules
**Causality broken?** → Event Store validation

## Links

- [Task.md](../Task.md), [SaaS.md](../SaaS.md)
- [Enable.md](../Causality-Driven%20Event-Sourced%20Process%20System/Enable.md), [Disable.md](../Causality-Driven%20Event-Sourced%20Process%20System/Disable.md)

---

**Last Updated**: 2025-12-31
