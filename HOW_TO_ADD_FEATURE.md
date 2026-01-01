# How to Add a New Feature

This guide shows how to add a new feature following the Event-Sourced architecture tree structure.

## Example: Adding "Task Assignment" Feature

### Step 1: Define Events

```typescript
// core-system/src/events/TaskEvents.ts (add to existing file)

/**
 * Task assigned event payload
 */
export interface TaskAssignedPayload {
  assigneeId: string;
  assignedBy: string;
  previousAssigneeId?: string;
  notes?: string;
}

/**
 * Task assignment events
 */
export type TaskAssignedEvent = DomainEvent<TaskAssignedPayload>;

/**
 * Add to TaskEventTypes constant
 */
export const TaskEventTypes = {
  // ... existing types
  TASK_ASSIGNED: 'TASK_ASSIGNED',
} as const;
```

### Step 2: Update Aggregate

```typescript
// core-system/src/aggregates/TaskAggregate.ts (update existing)

export class TaskAggregate {
  // ... existing code
  
  /**
   * Assign task to user
   */
  assignTask(assigneeId: string, assignedBy: string, notes?: string): void {
    if (!this.state) {
      throw new Error('Cannot assign non-existent task');
    }
    
    const event: TaskAssignedEvent = {
      id: generateEventId(),
      aggregateId: this.state.id,
      aggregateType: 'Task',
      eventType: TaskEventTypes.TASK_ASSIGNED,
      version: this.state.version + 1,
      data: {
        assigneeId,
        assignedBy,
        previousAssigneeId: this.state.assigneeId,
        notes
      },
      metadata: {
        causedBy: 'assign-task-command',
        causedByUser: assignedBy,
        causedByAction: 'ASSIGN_TASK',
        timestamp: now(),
        blueprintId: this.state.blueprintId
      }
    };
    
    this.apply(event);
  }
  
  private apply(event: DomainEvent, isNew: boolean = true): void {
    switch (event.eventType) {
      // ... existing cases
      case TaskEventTypes.TASK_ASSIGNED:
        this.applyTaskAssigned(event);
        break;
    }
    
    if (isNew) {
      this.uncommittedEvents.push(event);
    }
  }
  
  private applyTaskAssigned(event: DomainEvent<TaskAssignedPayload>): void {
    if (!this.state) return;
    
    this.state.assigneeId = event.data.assigneeId;
    this.state.updatedAt = event.metadata.timestamp;
    this.state.version = event.version;
  }
}
```

### Step 3: Create Service (if needed)

```typescript
// core-system/src/services/TaskService.ts

import { TaskAggregate } from '../aggregates/TaskAggregate';
import { IEventStore } from '../repositories/EventStore';
import { eventBus } from '../utils/EventBus';

export class TaskService {
  constructor(private eventStore: IEventStore) {}
  
  /**
   * Assign task to user
   */
  async assignTask(
    taskId: string,
    assigneeId: string,
    assignedBy: string,
    notes?: string
  ): Promise<void> {
    // Load aggregate from events
    const events = await this.eventStore.getEvents(taskId);
    const aggregate = TaskAggregate.replayFrom(events);
    
    // Execute command
    aggregate.assignTask(assigneeId, assignedBy, notes);
    
    // Save uncommitted events
    const newEvents = aggregate.getUncommittedEvents();
    for (const event of newEvents) {
      await this.eventStore.append(event);
      await eventBus.publish(event);
    }
    
    aggregate.markEventsAsCommitted();
  }
}
```

### Step 4: Update Projection

```typescript
// core-system/src/projections/TaskProjection.ts

export class TaskProjection {
  constructor(private firestore: Firestore) {}
  
  async handleEvent(event: DomainEvent): Promise<void> {
    switch (event.eventType) {
      case TaskEventTypes.TASK_CREATED:
        await this.handleTaskCreated(event);
        break;
      case TaskEventTypes.TASK_ASSIGNED:
        await this.handleTaskAssigned(event);
        break;
      // ... other cases
    }
  }
  
  private async handleTaskAssigned(
    event: DomainEvent<TaskAssignedPayload>
  ): Promise<void> {
    const docRef = this.firestore
      .collection('task_projections')
      .doc(event.aggregateId);
    
    await docRef.update({
      assigneeId: event.data.assigneeId,
      previousAssigneeId: event.data.previousAssigneeId,
      assignedBy: event.data.assignedBy,
      assignedAt: event.metadata.timestamp,
      updatedAt: event.metadata.timestamp,
      version: event.version
    });
  }
}
```

### Step 5: Create Angular Component

```typescript
// angular-app/src/app/features/tasks/task-assign.component.ts

import { Component, input, inject } from '@angular/core';
import { TaskService } from './task.service';

@Component({
  selector: 'app-task-assign',
  template: `
    <div class="assign-task">
      <h3>Assign Task</h3>
      <select [(ngModel)]="selectedUserId">
        <option *ngFor="let user of users()" [value]="user.id">
          {{ user.name }}
        </option>
      </select>
      <textarea [(ngModel)]="notes" placeholder="Assignment notes"></textarea>
      <button (click)="assign()">Assign</button>
    </div>
  `
})
export class TaskAssignComponent {
  taskId = input.required<string>();
  users = input.required<any[]>();
  
  private taskService = inject(TaskService);
  
  selectedUserId = '';
  notes = '';
  
  assign() {
    this.taskService.assignTask(
      this.taskId(),
      this.selectedUserId,
      this.notes
    ).subscribe(() => {
      console.log('Task assigned successfully');
    });
  }
}
```

### Step 6: Update Angular Service

```typescript
// angular-app/src/app/features/tasks/task.service.ts (update)

export class TaskService {
  // ... existing code
  
  /**
   * Assign task to user
   */
  assignTask(
    taskId: string, 
    assigneeId: string, 
    notes?: string
  ): Observable<void> {
    return this.http.post<void>('/api/tasks/assign', {
      taskId,
      assigneeId,
      notes
    });
  }
}
```

### Step 7: Create Cloud Function

```typescript
// functions-event/src/tasks/assign-task.ts

import { https } from 'firebase-functions';
import { TaskService } from '../../../core-system/src/services/TaskService';
import { eventStore } from '../config/event-store';

export const assignTask = https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new https.HttpsError('unauthenticated', 'Must be authenticated');
  }
  
  const { taskId, assigneeId, notes } = data;
  const userId = context.auth.uid;
  
  const taskService = new TaskService(eventStore);
  
  await taskService.assignTask(taskId, assigneeId, userId, notes);
  
  return { success: true };
});
```

### Step 8: Write Tests

```typescript
// core-system/tests/aggregates/TaskAggregate.test.ts

describe('TaskAggregate', () => {
  test('should assign task and emit event', () => {
    // Given: existing task
    const createEvent = createTaskCreatedEvent('task-123');
    const aggregate = TaskAggregate.replayFrom([createEvent]);
    
    // When: assign task
    aggregate.assignTask('user-456', 'user-789', 'Important task');
    
    // Then: state updated
    expect(aggregate.getState()?.assigneeId).toBe('user-456');
    
    // And: event emitted
    const events = aggregate.getUncommittedEvents();
    expect(events).toHaveLength(1);
    expect(events[0].eventType).toBe('TASK_ASSIGNED');
    expect(events[0].data.assigneeId).toBe('user-456');
    expect(events[0].data.assignedBy).toBe('user-789');
  });
  
  test('should track previous assignee', () => {
    // Given: task already assigned to user-111
    const events = [
      createTaskCreatedEvent('task-123', { assigneeId: 'user-111' }),
    ];
    const aggregate = TaskAggregate.replayFrom(events);
    
    // When: reassign to user-222
    aggregate.assignTask('user-222', 'user-789');
    
    // Then: previous assignee recorded
    const newEvent = aggregate.getUncommittedEvents()[0];
    expect(newEvent.data.previousAssigneeId).toBe('user-111');
    expect(newEvent.data.assigneeId).toBe('user-222');
  });
  
  test('should replay assignment correctly', () => {
    // Given: event stream
    const events = [
      createTaskCreatedEvent('task-123'),
      createTaskAssignedEvent('task-123', 'user-456')
    ];
    
    // When: replay
    const aggregate = TaskAggregate.replayFrom(events);
    
    // Then: state correct
    expect(aggregate.getState()?.assigneeId).toBe('user-456');
  });
});
```

## Checklist for Adding New Features

### Phase 1: Design
- [ ] Define domain events (what happened?)
- [ ] Identify aggregate boundaries
- [ ] Plan causality relationships
- [ ] Document business rules

### Phase 2: Core System
- [ ] Add event definitions to `core-system/src/events/`
- [ ] Update aggregate in `core-system/src/aggregates/`
- [ ] Create/update service in `core-system/src/services/`
- [ ] Update projection in `core-system/src/projections/`
- [ ] Write unit tests

### Phase 3: Backend Integration
- [ ] Create Cloud Function
- [ ] Wire up event handling
- [ ] Test end-to-end

### Phase 4: Frontend Integration
- [ ] Create Angular components
- [ ] Update Angular services
- [ ] Add real-time subscriptions
- [ ] Test UI

### Phase 5: Documentation
- [ ] Update README files
- [ ] Add integration examples
- [ ] Document API endpoints
- [ ] Create user guide

## Best Practices

### Event Design
- Events are past tense (TaskAssigned, not AssignTask)
- Include all necessary data for replay
- Never modify events after creation
- Version events for schema evolution

### Aggregate Design
- Keep aggregates focused on one business concept
- Enforce business rules in aggregate methods
- State is derived from events only
- No external dependencies in aggregates

### Service Design
- Services coordinate aggregates
- Services handle event publishing
- Keep services stateless
- Use dependency injection

### Projection Design
- Projections are read-only
- Optimize for query patterns
- Can have multiple projections for same events
- Handle event ordering carefully

### Testing Strategy
1. **Unit Tests**: Test aggregates in isolation
2. **Integration Tests**: Test event flow
3. **E2E Tests**: Test complete user scenarios
4. **Replay Tests**: Verify deterministic replay

## Common Patterns

### Pattern 1: Command → Event → Projection
```
User Command → Aggregate → Event → Store → Projection → UI Update
```

### Pattern 2: Saga for Multi-Aggregate
```
Event A → Saga detects → Commands B & C → Events B & C
```

### Pattern 3: Projection Optimization
```
Event Stream → Multiple Projections (list view, detail view, search index)
```

## Troubleshooting

### Problem: Events not appearing in projection
- Check event store write was successful
- Verify projection listener is running
- Check event type filtering
- Review Firestore triggers

### Problem: State inconsistent after replay
- Verify event ordering
- Check for missing events
- Review aggregate apply logic
- Test with isolated events

### Problem: Performance issues
- Add event snapshots for large aggregates
- Optimize projection queries
- Use caching where appropriate
- Consider event compaction

## Resources

- [Core System README](../core-system/README.md)
- [Integration Example](../INTEGRATION_EXAMPLE.md)
- [Event Model Documentation](../docs/04-core-model/event-model.md)
- [Testing Guide](../docs/07-operability/testing-guide.md)
