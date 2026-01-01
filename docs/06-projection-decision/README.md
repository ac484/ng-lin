# Projections & Decisions

> **How state is derived and business rules are enforced.**

## Projection Anatomy

### What is a Projection?
A **pure function** that derives state from events.

### Projection Pattern
```typescript
interface Projection<TState, TResult> {
  // Initialize empty state
  init(): TState;
  
  // Apply event to current state (pure function)
  apply(state: TState, event: DomainEvent): TState;
  
  // Extract final result
  result(state: TState): TResult;
}
```

### Example: Task List Projection
```typescript
class TaskListProjection implements Projection<Map<string, Task>, Task[]> {
  init(): Map<string, Task> {
    return new Map();
  }
  
  apply(tasks: Map<string, Task>, event: TaskEvent): Map<string, Task> {
    const newTasks = new Map(tasks); // Immutability
    
    switch (event.type) {
      case 'TaskCreated':
        newTasks.set(event.aggregateId, {
          id: event.aggregateId,
          title: event.data.title,
          status: 'Todo'
        });
        break;
        
      case 'TaskStarted':
        const task = newTasks.get(event.aggregateId);
        if (task) {
          newTasks.set(event.aggregateId, {
            ...task,
            status: 'Doing'
          });
        }
        break;
        
      case 'TaskCompleted':
        const t = newTasks.get(event.aggregateId);
        if (t) {
          newTasks.set(event.aggregateId, {
            ...t,
            status: 'Done'
          });
        }
        break;
    }
    
    return newTasks;
  }
  
  result(tasks: Map<string, Task>): Task[] {
    return Array.from(tasks.values());
  }
}
```

---

## Projection Rules

### Pure Function Requirements
✅ **No side effects**: No DB writes, no HTTP calls, no console.log
✅ **Deterministic**: Same events → same result
✅ **Immutable**: Return new state, don't mutate input
✅ **Idempotent**: Replay produces identical result

### Performance Guidelines
- Use Map for O(1) lookups
- Avoid nested loops (O(n²))
- Cache projection results when possible
- Use snapshots for large event streams (&gt;10k events)

---

## Multiple Views Example

### Same Events, Different Questions

**Events**:
```typescript
[
  { type: 'TaskCreated', taskId: 't1', title: 'Fix bug' },
  { type: 'TaskStarted', taskId: 't1' },
  { type: 'TaskCommentAdded', taskId: 't1', comment: 'Working on it' },
  { type: 'TaskCompleted', taskId: 't1' }
]
```

**View 1: List (Summary)**
```typescript
projectList(events) → [{ id: 't1', title: 'Fix bug', status: 'Done' }]
```

**View 2: Board (Columns)**
```typescript
projectBoard(events) → { todo: [], doing: [], done: [t1] }
```

**View 3: Why (Explanation)**
```typescript
projectWhy('t1', events) → [
  { type: 'TaskCreated', explanation: 'Task was created' },
  { type: 'TaskStarted', explanation: 'Work began' },
  { type: 'TaskCommentAdded', explanation: 'Comment added' },
  { type: 'TaskCompleted', explanation: 'Task completed' }
]
```

**View 4: Discussion (Comments)**
```typescript
projectDiscussion('t1', events) → {
  comments: [{ content: 'Working on it', timestamp: ... }]
}
```

---

## Decision Anatomy

### What is a Decision?
A **pure function** that validates commands and produces events.

### Decision Pattern
```typescript
type Decision =
  | { type: 'Approved'; events: DomainEvent[] }
  | { type: 'Rejected'; reason: string };

type DecisionFunction<TCommand> = (
  command: TCommand,
  events: DomainEvent[]
) => Decision;
```

### Example: Start Task Decision
```typescript
function decideStartTask(
  command: StartTaskCommand,
  events: TaskEvent[]
): Decision {
  // Reconstruct current state
  const state = reconstructTask(events);
  
  // Business rule 1: Must be Todo
  if (state.status !== 'Todo') {
    return {
      type: 'Rejected',
      reason: `Task must be Todo (current: ${state.status})`
    };
  }
  
  // Business rule 2: Must have assignee
  if (!state.assignee) {
    return {
      type: 'Rejected',
      reason: 'Task must be assigned before starting'
    };
  }
  
  // Business rule 3: User must be assignee
  if (command.userId !== state.assignee) {
    return {
      type: 'Rejected',
      reason: 'Only assignee can start task'
    };
  }
  
  // Approved: emit event
  return {
    type: 'Approved',
    events: [{
      id: generateId(),
      type: 'TaskStarted',
      aggregateId: command.taskId,
      causedBy: [lastEvent(events).id],
      correlationId: command.correlationId,
      timestamp: Date.now(),
      data: { startedBy: command.userId }
    }]
  };
}
```

---

## Decision Rules

### Validation Requirements
✅ **Load events, not database**: State from replay
✅ **Pure function**: Same input → same output
✅ **Can reject**: Explicit "no" with reason
✅ **Explicit causality**: causedBy field required
✅ **Single responsibility**: One decision per command

### Error Handling
```typescript
// ❌ BAD: Throw exceptions
function decide(command, events) {
  if (invalid) throw new Error('Invalid');
}

// ✅ GOOD: Return rejection
function decide(command, events) {
  if (invalid) return reject('Invalid');
}
```

---

## Idempotency Guarantees

### Projections
Replaying same events always produces same result.

```typescript
const events = [TaskCreated, TaskStarted];

// First replay
const state1 = replay(events); // { status: 'Doing' }

// Second replay (same events)
const state2 = replay(events); // { status: 'Doing' }

// state1 === state2 (guaranteed)
```

### Decisions
Same command + same events = same decision.

```typescript
const command = { type: 'StartTask', taskId: 't1' };
const events = [TaskCreated];

// First call
const decision1 = decideStartTask(command, events);

// Second call (same inputs)
const decision2 = decideStartTask(command, events);

// decision1 === decision2 (guaranteed)
```

---

## Advanced Patterns

### Snapshot Optimization
For large event streams (&gt;10k events), use snapshots.

```typescript
interface Snapshot {
  aggregateId: string;
  state: TaskState;
  lastEventId: string;
}

function projectWithSnapshot(
  snapshot: Snapshot | null,
  events: TaskEvent[]
): TaskState {
  // Start from snapshot instead of empty state
  let state = snapshot ? snapshot.state : init();
  
  // Only replay events after snapshot
  const newEvents = snapshot
    ? events.filter(e => e.id > snapshot.lastEventId)
    : events;
  
  for (const event of newEvents) {
    state = apply(state, event);
  }
  
  return state;
}
```

### Multi-Aggregate Projection
Combine events from multiple aggregates (use cautiously).

```typescript
function projectTeamTaskSummary(
  taskEvents: TaskEvent[],
  userEvents: UserEvent[]
): TeamSummary {
  const tasks = projectTaskList(taskEvents);
  const users = projectUserList(userEvents);
  
  return {
    totalTasks: tasks.length,
    activeTasks: tasks.filter(t => t.status === 'Doing').length,
    teamMembers: users.length
  };
}
```

---

## Testing

### Projection Tests
```typescript
test('TaskListProjection handles TaskCreated', () => {
  const projection = new TaskListProjection();
  let state = projection.init();
  
  state = projection.apply(state, {
    type: 'TaskCreated',
    aggregateId: 't1',
    data: { title: 'Test task' }
  });
  
  const result = projection.result(state);
  expect(result).toHaveLength(1);
  expect(result[0].title).toBe('Test task');
});
```

### Decision Tests
```typescript
test('decideStartTask rejects if not Todo', () => {
  const command = { type: 'StartTask', taskId: 't1', userId: 'u1' };
  const events = [
    { type: 'TaskCreated', ... },
    { type: 'TaskCompleted', ... } // Already completed
  ];
  
  const decision = decideStartTask(command, events);
  
  expect(decision.type).toBe('Rejected');
  expect(decision.reason).toContain('Todo');
});
```

---

## Location

```
src/app/features/task/
├── projections/
│   ├── task-list.projection.ts
│   ├── task-board.projection.ts
│   ├── task-why.projection.ts
│   ├── task-discussion.projection.ts
│   └── index.ts
└── decisions/
    ├── decide-create-task.ts
    ├── decide-start-task.ts
    ├── decide-complete-task.ts
    └── index.ts
```

---

**Version**: v2.0  
**Last Updated**: 2025-12-31
