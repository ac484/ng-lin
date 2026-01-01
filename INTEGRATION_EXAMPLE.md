# Integration Example: Creating a Task

This example demonstrates how the Angular app integrates with the Event-Sourced core system.

## Scenario: User Creates a Task

### Step 1: User Action (Angular Component)

```typescript
// angular-app/src/app/features/tasks/task-create.component.ts
import { Component, inject } from '@angular/core';
import { TaskService } from './task.service';

@Component({
  selector: 'app-task-create',
  template: `
    <form (ngSubmit)="createTask()">
      <input [(ngModel)]="title" placeholder="Task Title" />
      <textarea [(ngModel)]="description" placeholder="Description"></textarea>
      <button type="submit">Create Task</button>
    </form>
  `
})
export class TaskCreateComponent {
  private taskService = inject(TaskService);
  
  title = '';
  description = '';
  
  createTask() {
    this.taskService.createTask({
      title: this.title,
      description: this.description,
      projectId: 'project-123',
      blueprintId: 'blueprint-001'
    });
  }
}
```

### Step 2: Angular Service (Bridge to Core System)

```typescript
// angular-app/src/app/features/tasks/task.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Import types from core system
import { 
  DomainEvent, 
  TaskCreatedPayload,
  TaskEventTypes 
} from '../../../../core-system/src';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private http = inject(HttpClient);
  
  /**
   * Create a new task
   * This sends a command that will generate a TaskCreatedEvent
   */
  createTask(command: {
    title: string;
    description?: string;
    projectId: string;
    blueprintId: string;
  }): Observable<any> {
    // Call Cloud Function or direct Firebase
    return this.http.post('/api/tasks/create', command);
  }
  
  /**
   * Query tasks (from projection)
   */
  getTasks(projectId: string): Observable<any[]> {
    return this.http.get<any[]>(`/api/tasks?projectId=${projectId}`);
  }
}
```

### Step 3: Cloud Function (Uses Core System)

```typescript
// functions-event/src/tasks/create-task.ts
import { https } from 'firebase-functions';
import { 
  TaskAggregate,
  TaskCreatedPayload,
  DomainEvent,
  TaskEventTypes,
  generateEventId,
  generateAggregateId,
  now
} from '../../../core-system/src';
import { eventStore } from '../config/event-store';

export const createTask = https.onCall(async (data, context) => {
  // Validate authentication
  if (!context.auth) {
    throw new https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const userId = context.auth.uid;
  const { title, description, projectId, blueprintId } = data;
  
  // Create TaskCreatedEvent
  const event: DomainEvent<TaskCreatedPayload> = {
    id: generateEventId(),
    aggregateId: generateAggregateId('task'),
    aggregateType: 'Task',
    eventType: TaskEventTypes.TASK_CREATED,
    version: 1,
    data: {
      title,
      description,
      projectId,
      assigneeId: userId
    },
    metadata: {
      causedBy: 'user-command',
      causedByUser: userId,
      causedByAction: 'CREATE_TASK',
      timestamp: now(),
      blueprintId,
      correlationId: generateEventId()
    }
  };
  
  // Store event
  await eventStore.append(event);
  
  // Return task ID
  return { 
    taskId: event.aggregateId,
    eventId: event.id 
  };
});
```

### Step 4: Event Processing (Projection Update)

```typescript
// functions-event/src/projections/task-projection-updater.ts
import { firestore } from 'firebase-functions';
import { TaskEventTypes } from '../../../core-system/src';

export const updateTaskProjection = firestore
  .document('events/{eventId}')
  .onCreate(async (snap, context) => {
    const event = snap.data();
    
    // Only process Task events
    if (event.aggregateType !== 'Task') return;
    
    const db = admin.firestore();
    const projectionRef = db.collection('task_projections').doc(event.aggregateId);
    
    switch (event.eventType) {
      case TaskEventTypes.TASK_CREATED:
        // Create projection
        await projectionRef.set({
          id: event.aggregateId,
          title: event.data.title,
          description: event.data.description,
          status: 'TODO',
          projectId: event.data.projectId,
          assigneeId: event.data.assigneeId,
          createdAt: event.metadata.timestamp,
          createdBy: event.metadata.causedByUser,
          version: event.version
        });
        break;
        
      case TaskEventTypes.TASK_STATUS_CHANGED:
        // Update projection
        await projectionRef.update({
          status: event.data.toStatus,
          updatedAt: event.metadata.timestamp,
          version: event.version
        });
        break;
    }
  });
```

### Step 5: Real-time Updates (Angular Listens)

```typescript
// angular-app/src/app/features/tasks/task-list.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { Firestore, collection, collectionData, query, where } from '@angular/fire/firestore';

@Component({
  selector: 'app-task-list',
  template: `
    <div *ngFor="let task of tasks()">
      <h3>{{ task.title }}</h3>
      <p>{{ task.description }}</p>
      <span>Status: {{ task.status }}</span>
    </div>
  `
})
export class TaskListComponent implements OnInit {
  private firestore = inject(Firestore);
  
  tasks = signal<any[]>([]);
  
  ngOnInit() {
    // Real-time subscription to projection
    const tasksCollection = collection(this.firestore, 'task_projections');
    const tasksQuery = query(
      tasksCollection,
      where('projectId', '==', 'project-123')
    );
    
    // Subscribe to updates
    collectionData(tasksQuery, { idField: 'id' })
      .subscribe(tasks => {
        this.tasks.set(tasks);
      });
  }
}
```

## Flow Summary

```
1. User clicks "Create Task" in Angular Component
   ↓
2. Angular Service calls Cloud Function
   ↓
3. Cloud Function uses Core System to create TaskCreatedEvent
   ↓
4. Event is stored in Firestore events collection
   ↓
5. Firestore Trigger detects new event
   ↓
6. Projection Updater processes event and updates task_projections
   ↓
7. Angular Component receives real-time update via Firestore subscription
   ↓
8. UI updates automatically with new task
```

## Event Flow Diagram

```
┌──────────────┐
│   Angular    │
│  Component   │
└──────┬───────┘
       │ Command
       ↓
┌──────────────┐
│   Angular    │
│   Service    │
└──────┬───────┘
       │ HTTP Call
       ↓
┌──────────────┐
│    Cloud     │
│   Function   │
│              │
│  Uses Core   │
│   System     │
└──────┬───────┘
       │ Event
       ↓
┌──────────────┐
│   Firestore  │
│    Events    │
└──────┬───────┘
       │ Trigger
       ↓
┌──────────────┐
│  Projection  │
│   Updater    │
└──────┬───────┘
       │ Write
       ↓
┌──────────────┐
│   Firestore  │
│  Projections │
└──────┬───────┘
       │ Real-time
       ↓
┌──────────────┐
│   Angular    │
│  Component   │
└──────────────┘
```

## Key Points

1. **Events are the source of truth**: Stored in Firestore events collection
2. **Projections are derived**: Updated by processing events
3. **Real-time updates**: Angular subscribes to projection changes
4. **Causality tracked**: Every event records who, what, when, why
5. **Deterministic replay**: Can rebuild projections from events
6. **Separation of concerns**: Core system independent of Angular

## Testing

### Unit Test (Core System)
```typescript
import { TaskAggregate } from '../core-system/src';

test('Task aggregate replays from events correctly', () => {
  const events = [
    createTaskCreatedEvent(),
    createTaskStatusChangedEvent()
  ];
  
  const aggregate = TaskAggregate.replayFrom(events);
  
  expect(aggregate.getState()?.status).toBe('IN_PROGRESS');
});
```

### Integration Test
```typescript
test('Creating task generates correct event', async () => {
  const result = await createTask({
    title: 'Test Task',
    projectId: 'proj-123',
    blueprintId: 'bp-001'
  }, mockContext);
  
  const event = await eventStore.getEvents(result.taskId);
  expect(event[0].eventType).toBe('TASK_CREATED');
});
```
