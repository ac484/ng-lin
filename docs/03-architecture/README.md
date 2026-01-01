# System Architecture

> **Layered structure from immutable events to observable UI.**

## Architecture Layers

```
┌─────────────────────────────────────┐
│      UI Layer (Angular 20)          │ ← Observes state via Signals
├─────────────────────────────────────┤
│   Projection Layer (Pure Functions) │ ← Derives views from events
├─────────────────────────────────────┤
│   Process Layer (Saga/PM)           │ ← Coordinates workflows
├─────────────────────────────────────┤
│   Decision Layer (Business Rules)   │ ← Validates commands
├─────────────────────────────────────┤
│   Event Layer (Immutable Facts)     │ ← Source of truth
├─────────────────────────────────────┤
│   Event Store (Firebase/Firestore)  │ ← Persistence
└─────────────────────────────────────┘
```

---

## Flow Diagram

### Write Flow (Command → Event)
```
User Action
  ↓
Command (StartTaskCommand)
  ↓
Decision Layer
  ├─ Load events for aggregate
  ├─ Validate business rules
  ├─ Approve or Reject
  ↓
Event (TaskStarted)
  ↓
Event Store (append)
  ↓
Projections (notify)
  ↓
UI Update (via Signal)
```

### Read Flow (Query → Projection)
```
UI Query (getTaskList)
  ↓
Projection Layer
  ├─ Load events from store
  ├─ Replay to derive state
  ├─ Return result
  ↓
UI Display (via async pipe)
```

---

## Layer Details

### 1. Event Layer (Immutable Facts)

**Responsibility**: Record immutable business facts

**Structure**:
```typescript
interface DomainEvent {
  id: string;
  type: string;
  aggregateId: string;
  causedBy: string[];
  correlationId: string;
  timestamp: number;
  data: T;
}
```

**Guarantees**:
- ✅ Append-only (no UPDATE/DELETE)
- ✅ Immutable after persistence
- ✅ Complete causal chain
- ✅ Chronological ordering

**Location**: `src/app/features/task/events/`

---

### 2. Decision Layer (Business Rules)

**Responsibility**: Validate commands and enforce business rules

**Pattern**:
```typescript
function decideStartTask(
  command: StartTaskCommand,
  events: TaskEvent[]
): Decision {
  const state = reconstructTask(events);
  
  if (state.status !== 'Todo') {
    return reject('Task must be Todo');
  }
  
  if (!state.assignee) {
    return reject('Task needs assignee');
  }
  
  return approve([{
    type: 'TaskStarted',
    aggregateId: command.taskId,
    causedBy: [lastEvent.id],
    data: { startedBy: command.userId }
  }]);
}
```

**Guarantees**:
- ✅ Pure functions (deterministic)
- ✅ Load events, not database
- ✅ Can reject with reasons
- ✅ Explicit causality

**Location**: `src/app/features/task/decisions/`

---

### 3. Projection Layer (Derived Views)

**Responsibility**: Derive multiple views from same event stream

**Pattern**:
```typescript
function projectTaskList(events: TaskEvent[]): TaskListItem[] {
  const tasks = new Map();
  
  for (const event of events) {
    switch (event.type) {
      case 'TaskCreated':
        tasks.set(event.aggregateId, {
          id: event.aggregateId,
          title: event.data.title,
          status: 'Todo'
        });
        break;
      case 'TaskStarted':
        tasks.get(event.aggregateId).status = 'Doing';
        break;
      case 'TaskCompleted':
        tasks.get(event.aggregateId).status = 'Done';
        break;
    }
  }
  
  return Array.from(tasks.values());
}
```

**Projection Types**:
- **List**: Flat task summary
- **Board**: Status columns (Todo/Doing/Done)
- **Why**: Event history with explanations
- **Discussion**: Comment threads
- **Comment**: Comment view
- **Attachment**: File list
- **Timeline**: Chronological event view

**Guarantees**:
- ✅ Pure functions (no side effects)
- ✅ Idempotent (same input → same output)
- ✅ No database writes
- ✅ Cacheable results

**Location**: `src/app/features/task/projections/`

---

### 4. Process Layer (Saga/Process Manager)

**Responsibility**: Coordinate long-running workflows

**Patterns**:

**Saga (Choreography)**:
```typescript
// Event-driven coordination
TaskStarted
  → Notify assignee
  → Update dashboard
  → Log audit trail
```

**Process Manager (Orchestration)**:
```typescript
class TaskLifecycleProcess {
  handle(event: TaskEvent) {
    if (event.type === 'TaskStarted') {
      this.emit(NotifyAssignee);
      this.scheduleTimeout(3, DaysLater);
    }
    if (event.type === 'TaskCompleted') {
      this.emit(NotifyReporter);
      this.closeProcess();
    }
  }
}
```

**Guarantees**:
- ✅ Event-driven coordination
- ✅ Compensation on failure
- ✅ Idempotent handlers

**Location**: `src/app/features/task/processes/`

---

### 5. UI Layer (Observation)

**Responsibility**: Display state, accept user commands

**Pattern (Angular 20 Signals)**:
```typescript
@Component({
  template: `
    @if (tasks$ | async; as tasks) {
      @for (task of tasks; track task.id) {
        <div>{{ task.title }} - {{ task.status }}</div>
      }
    }
  `
})
export class TaskListComponent {
  tasks$ = this.taskQuery.getTaskList();
  
  startTask(taskId: string) {
    this.taskCommand.startTask({ taskId, userId: this.currentUser.id });
  }
}
```

**Guarantees**:
- ✅ Read-only state observation
- ✅ Commands for mutations
- ✅ No direct state changes
- ✅ Reactive updates (async pipe)

**Location**: `src/app/features/task/ui/`

---

## Platform Layer (Infrastructure)

### Purpose
Multi-tenant infrastructure (NOT business domain)

### Entities
- **User**: Authentication & profile
- **Organization**: Tenant boundary
- **Team**: Collaboration group
- **Collaborator**: Invitation & access
- **Bot**: Automation account

### Structure
Each entity has:
- Events (UserCreated, OrgCreated)
- Decisions (decideCreateUser)
- Projections (user-list, org-tree)
- Commands, Models, UI

**Location**: `src/app/platform/`

---

## Cross-Layer Guarantees

### Immutability
- Events: Never modified after append
- Projections: Pure functions (no side effects)
- Decisions: Deterministic (same input → same output)

### Causality
- Every event has `causedBy`
- Replay respects causal order
- Conflict resolution via causality

### Traceability
- Complete audit trail (events)
- Root cause analysis (causal chains)
- Time-travel replay (historical state)

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| UI | Angular 20 + Signals |
| State Management | RxJS 7.8.x |
| Event Store | Firebase/Firestore |
| Auth | Firebase Auth |
| Storage | Firebase Storage |
| Functions | Firebase Cloud Functions |
| Testing | Playwright E2E |
| Dev Tools | Core Tester Widget |

---

## File Organization

```
src/app/
├── core/                       # Foundation (63 files)
│   ├── foundation/
│   ├── governance/
│   └── observability/
├── infrastructure/             # Adapters (40+ files)
│   ├── abstractions/
│   ├── firebase-event-store/
│   ├── firebase-auth/
│   ├── firebase-repository/
│   ├── firebase-storage/
│   └── firebase-functions/
├── platform/                   # Multi-tenant (170 files)
│   ├── user/
│   ├── organization/
│   ├── team/
│   ├── collaborator/
│   └── bot/
└── features/                   # Business domain (100 files)
    └── task/                   # ONLY business entity
        ├── events/
        ├── decisions/
        ├── projections/
        ├── processes/
        ├── commands/
        ├── models/
        └── ui/
```

**Total**: ~340 files

---

**Version**: v2.0  
**Last Updated**: 2025-12-31
