# Process Layer: Saga & Process Manager

> **Coordinating long-running workflows via events.**

## Overview

The Process Layer orchestrates multi-step workflows that span multiple events and commands.

### Two Patterns

**Saga** (Choreography): Decentralized, event-driven coordination
**Process Manager** (Orchestration): Centralized, stateful coordination

---

## Saga Pattern (Choreography)

### Principle
Events trigger reactions automatically without central coordinator.

### Example: Task Collaboration Saga
```typescript
// Event → Reactions mapping
const TaskCollaborationSaga = {
  'TaskCommentAdded': [
    async (event) => {
      await notifyAssignee(event.aggregateId);
      await updateDiscussionTimestamp(event.aggregateId);
    }
  ],
  
  'TaskAssigned': [
    async (event) => {
      await notifyNewAssignee(event.data.assigneeId);
      if (event.data.oldAssignee) {
        await notifyPreviousAssignee(event.data.oldAssignee);
      }
      await refreshTaskBoard();
    }
  ],
  
  'TaskCompleted': [
    async (event) => {
      await notifyReporter(event.data.createdBy);
      await archiveDiscussion(event.aggregateId);
      await updateMetrics();
    }
  ]
};
```

### Characteristics
- ✅ Decentralized
- ✅ Event-driven
- ✅ Loosely coupled
- ✅ Easy to extend

### When to Use
- Simple workflows (2-3 steps)
- Low coupling requirements
- Multiple independent reactions

---

## Process Manager Pattern (Orchestration)

### Principle
Stateful coordinator manages workflow explicitly.

### Example: Task Lifecycle Process
```typescript
class TaskLifecycleProcess {
  private processId: string;
  private state: {
    taskId: string;
    status: 'Created' | 'InProgress' | 'Completed';
    assignee?: string;
    timeoutScheduled?: number;
  };
  
  async handle(event: TaskEvent): Promise<Command[]> {
    const commands = [];
    
    switch (event.type) {
      case 'TaskCreated':
        this.state = {
          taskId: event.aggregateId,
          status: 'Created'
        };
        commands.push({
          type: 'NotifyReporter',
          userId: event.data.createdBy
        });
        break;
        
      case 'TaskStarted':
        this.state.status = 'InProgress';
        this.state.assignee = event.data.startedBy;
        
        // Schedule timeout check (3 days)
        const timeoutId = await this.scheduleTimeout(
          event.aggregateId,
          3 * 24 * 60 * 60 * 1000
        );
        this.state.timeoutScheduled = timeoutId;
        
        commands.push({
          type: 'NotifyAssignee',
          userId: event.data.startedBy
        });
        break;
        
      case 'TaskCompleted':
        this.state.status = 'Completed';
        
        // Cancel timeout if active
        if (this.state.timeoutScheduled) {
          await this.cancelTimeout(this.state.timeoutScheduled);
        }
        
        commands.push({
          type: 'NotifyReporter',
          userId: event.data.createdBy
        });
        
        // Close process
        await this.complete();
        break;
    }
    
    return commands;
  }
  
  private async scheduleTimeout(taskId: string, ms: number): Promise<number> {
    return setTimeout(() => {
      this.emit({
        type: 'TaskTimeoutReached',
        taskId
      });
    }, ms);
  }
  
  private async cancelTimeout(id: number): Promise<void> {
    clearTimeout(id);
  }
  
  private async complete(): Promise<void> {
    // Persist process completion
    // Clean up resources
  }
}
```

### Characteristics
- ✅ Centralized control
- ✅ Stateful (tracks progress)
- ✅ Explicit workflow
- ✅ Compensation capable

### When to Use
- Complex workflows (&gt;3 steps)
- Need timeout/cancellation
- Require compensation (rollback)
- Explicit state tracking needed

---

## Compensation Events

### Principle
Use events to undo/rollback failed workflows.

### Example: Task Creation Rollback
```typescript
// Normal flow
TaskCreated → TaskAssigned → TaskStarted

// Failure during TaskStarted
TaskStarted (fails) → TaskCreationCompensated
  → TaskAssignmentRevoked
  → TaskDeleted
```

### Implementation
```typescript
async function compensateTaskCreation(processId: string) {
  const events = await loadProcessEvents(processId);
  
  // Emit compensation events in reverse
  await emit({
    type: 'TaskAssignmentRevoked',
    taskId: events[1].aggregateId,
    causedBy: [events[1].id]
  });
  
  await emit({
    type: 'TaskCreationCompensated',
    taskId: events[0].aggregateId,
    causedBy: [events[0].id]
  });
}
```

---

## Event Choreography vs Orchestration

| Aspect | Saga (Choreography) | Process Manager (Orchestration) |
|--------|---------------------|--------------------------------|
| Control | Decentralized | Centralized |
| State | Stateless reactions | Stateful coordinator |
| Complexity | Simple workflows | Complex workflows |
| Coupling | Loose | Tighter |
| Timeout | Hard to implement | Easy with state |
| Compensation | Event-driven | Explicit rollback |

---

## Real-World Examples

### Example 1: Task Lifecycle Process
```
TaskCreated
  ↓ (PM schedules monitoring)
TaskAssigned
  ↓ (PM notifies assignee)
TaskStarted
  ↓ (PM schedules 3-day timeout)
TaskCompleted OR TaskTimeout
  ↓ (PM closes process)
```

### Example 2: Collaboration Saga
```
TaskCommentAdded
  ↘ NotifyAssignee (async)
  ↘ UpdateDiscussionTimestamp (async)
  ↘ IncrementCommentCount (async)
```

---

## Implementation Guidelines

### Process Manager Best Practices
- ✅ One process per long-running workflow
- ✅ Store process state persistently
- ✅ Handle duplicate events (idempotency)
- ✅ Use correlation_id to track workflow
- ✅ Implement timeouts and cancellation
- ✅ Provide compensation logic

### Saga Best Practices
- ✅ Keep reactions simple and focused
- ✅ Ensure idempotency (may replay)
- ✅ No shared mutable state
- ✅ Use event metadata (causedBy, correlationId)
- ✅ Log failures for debugging

---

## Location

```
src/app/features/task/processes/
├── task-lifecycle.process.ts     # Process Manager
├── task-collaboration.saga.ts    # Saga
└── index.ts
```

---

**Version**: v2.0  
**Last Updated**: 2025-12-31
