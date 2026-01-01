# Core Paradigm: Event Sourcing + Causality + Multi-View

> **Fundamental paradigm shift**: From storing state to storing facts.

## The Paradigm Shift

### Traditional (CRUD) Approach ❌
```typescript
// Store current state only
interface Task {
  id: string;
  status: 'Todo' | 'Doing' | 'Done';
  updatedAt: Date;
}

// Lost information:
// - WHY is it 'Done'?
// - WHO changed it?
// - WHEN did each transition happen?
// - WHAT was the decision process?
```

### Event Sourcing Approach ✅
```typescript
// Store immutable facts
type TaskEvent =
  | { type: 'TaskCreated', taskId, title, createdBy }
  | { type: 'TaskStarted', taskId, startedBy, causedBy }
  | { type: 'TaskCompleted', taskId, completedBy, causedBy };

// Preserved information:
// - Complete history
// - Causal relationships
// - Decision trail
// - Time-travel capability
```

---

## Core Principle 1: Events Are Immutable Facts

### What is an Event?
An event represents something that **has already happened** and **cannot be undone**.

**Characteristics**:
- Past tense name (TaskCreated, not CreateTask)
- Immutable (never UPDATE or DELETE)
- Append-only
- Contains causality metadata

**Event Structure**:
```typescript
interface DomainEvent {
  id: string;                  // Unique event ID
  type: string;                // Event type (TaskCreated)
  aggregateId: string;         // Entity ID (taskId)
  causedBy: string[];          // Predecessor event IDs
  correlationId: string;       // Workflow/process ID
  timestamp: number;           // When it happened
  data: T;                     // Event payload
}
```

### Events vs Logs
- **Events**: Business-meaningful facts (OrderPlaced)
- **Logs**: Technical observations (RequestReceived)

---

## Core Principle 2: State = replay(events)

State is **always derived**, never stored directly.

```typescript
// State reconstruction
function reconstructTask(events: TaskEvent[]): TaskState {
  let state = { status: 'Todo', comments: [] };
  
  for (const event of events) {
    switch (event.type) {
      case 'TaskCreated':
        state = { ...state, title: event.data.title };
        break;
      case 'TaskStarted':
        state = { ...state, status: 'Doing' };
        break;
      case 'TaskCompleted':
        state = { ...state, status: 'Done' };
        break;
      case 'TaskCommentAdded':
        state.comments.push(event.data.comment);
        break;
    }
  }
  
  return state;
}
```

**Key Insight**: Current state is just one possible interpretation of events.

---

## Core Principle 3: Multiple Views from Same Events

Different projections answer different questions:

```typescript
// TaskListProjection: "What tasks exist?"
function projectList(events) {
  return events
    .filter(e => e.type === 'TaskCreated')
    .map(e => ({ id: e.aggregateId, title: e.data.title }));
}

// TaskBoardProjection: "What's the status distribution?"
function projectBoard(events) {
  const tasks = reconstructAllTasks(events);
  return {
    todo: tasks.filter(t => t.status === 'Todo'),
    doing: tasks.filter(t => t.status === 'Doing'),
    done: tasks.filter(t => t.status === 'Done'),
  };
}

// TaskWhyProjection: "Why is this task Done?"
function projectWhy(taskId, events) {
  return events
    .filter(e => e.aggregateId === taskId)
    .map(e => ({
      type: e.type,
      reason: explainEvent(e),
      causedBy: e.causedBy
    }));
}
```

**No Synchronization**: Views are consistent because they derive from the same source.

---

## Core Principle 4: Causality Tracking

Every event knows **what caused it**.

```typescript
// Event chain example
const events = [
  { type: 'TaskCreated', id: 'e1', causedBy: [] },
  { type: 'TaskStarted', id: 'e2', causedBy: ['e1'] },
  { type: 'TaskCommentAdded', id: 'e3', causedBy: ['e2'] },
  { type: 'TaskCompleted', id: 'e4', causedBy: ['e2', 'e3'] },
];

// Causal graph:
// e1 (Created) → e2 (Started) → e3 (Comment)
//                             ↘ e4 (Completed)
```

**Benefits**:
- Root cause analysis
- Impact analysis
- Replay validation
- Distributed debugging

---

## Core Principle 5: Decision Centralization

All business rules live in **Decision Functions**.

```typescript
// Decision function (pure, deterministic)
function decideStartTask(events: TaskEvent[]): Decision {
  const state = reconstructTask(events);
  
  // Business rule enforcement
  if (state.status !== 'Todo') {
    return {
      type: 'Rejected',
      reason: 'Task must be Todo to start'
    };
  }
  
  if (!state.assignee) {
    return {
      type: 'Rejected',
      reason: 'Task must have assignee'
    };
  }
  
  return {
    type: 'Approved',
    events: [{ type: 'TaskStarted', ... }]
  };
}
```

**Key Rules**:
- Decisions load events, not database
- Decisions are pure functions (same input → same output)
- Decisions can reject (say "no")
- Only decisions can prevent events

---

## Paradigm Comparison Table

| Aspect | CRUD | Event Sourcing |
|--------|------|---------------|
| **State** | Stored directly | Derived from events |
| **History** | Lost (or audit table) | Built-in complete history |
| **Why** | Unknown | Traceable via causality |
| **Time-Travel** | Impossible | replay(events, until: timestamp) |
| **Views** | One model | Multiple projections |
| **Updates** | UPDATE statement | New event emitted |
| **Consistency** | Locks, transactions | Append-only, causality |

---

## Task Domain Example

### Events (Immutable Facts)
```
TaskCreated         → "Task exists"
TaskStarted         → "Work began"
TaskCommentAdded    → "Discussion happened"
TaskCompleted       → "Work finished"
```

### Projections (Derived Views)
```
List View      → Shows all tasks with current status
Board View     → Groups tasks by status columns
Why View       → Explains event history
Discussion View → Shows comment thread
Timeline View  → Chronological event view
```

### Decisions (Business Rules)
```
decideStartTask     → Can this task be started?
decideCompleteTask  → Can this task be completed?
decideAddComment    → Can a comment be added?
```

---

## Mental Model Shift

**Old Way**: "What is the current state?"
**New Way**: "What facts have occurred, and what do they imply?"

**Old Way**: "Update the task status to Done"
**New Way**: "Emit TaskCompleted event, replay to observe status"

**Old Way**: "One view = one table"
**New Way**: "Same events = infinite possible views"

---

## Common Misconceptions

❌ "Events are just logs" → Events are business facts
❌ "Projections are caches" → Projections are views
❌ "State is duplicated" → State is derived, not duplicated
❌ "Event Sourcing is slow" → Replay is fast with snapshots
❌ "Only for high-scale systems" → Valuable for explainability

---

## Next Steps

- Read [04-core-model](../04-core-model) for event/decision/projection structures
- Read [09-anti-patterns](../09-anti-patterns) to avoid common mistakes
- See [06-projection-decision](../06-projection-decision) for code patterns

---

**Version**: v2.0  
**Last Updated**: 2025-12-31
