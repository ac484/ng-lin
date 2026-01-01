# Core Model Definitions

> **Events, Decisions, Projections, Processes - the building blocks.**

## Event Structure

### Domain Event Interface
```typescript
interface DomainEvent<T = unknown> {
  id: string;                  // UUID
  type: string;                // Event type name
  aggregateId: string;         // Entity ID (taskId)
  causedBy: string[];          // Predecessor event IDs
  correlationId: string;       // Process/workflow ID
  timestamp: number;           // Unix milliseconds
  data: T;                     // Event payload
}
```

### Task Event Catalog

**Lifecycle Events**:
```typescript
TaskCreated         { title, description, createdBy }
TaskStarted         { startedBy, startedAt }
TaskPaused          { pausedBy, reason }
TaskResumed         { resumedBy }
TaskCompleted       { completedBy, completedAt }
TaskArchived        { archivedBy, reason }
TaskDeleted         { deletedBy, reason }
```

**Discussion Events**:
```typescript
TaskCommentAdded    { commentId, content, authorId }
TaskCommentEdited   { commentId, newContent }
TaskCommentDeleted  { commentId, deletedBy }
TaskDiscussionStarted { discussionId, topic }
TaskDiscussionClosed { discussionId, closedBy }
```

**Attachment Events**:
```typescript
TaskAttachmentUploaded { attachmentId, filename, url }
TaskAttachmentDeleted  { attachmentId, deletedBy }
```

**Assignment Events**:
```typescript
TaskAssigned        { assigneeId, assignedBy }
TaskUnassigned      { unassignedBy }
TaskReassigned      { oldAssignee, newAssignee }
```

---

## Decision Functions

### Decision Interface
```typescript
type Decision =
  | { type: 'Approved'; events: DomainEvent[] }
  | { type: 'Rejected'; reason: string };

type DecisionFunction<TCommand, TEvent> = (
  command: TCommand,
  events: TEvent[]
) => Decision;
```

### Task Decision Catalog

**decideCreateTask**:
```typescript
function decideCreateTask(
  command: CreateTaskCommand,
  events: TaskEvent[]
): Decision {
  // Business rule: Title required
  if (!command.title || command.title.trim() === '') {
    return reject('Task title is required');
  }
  
  // Business rule: No duplicate task
  const exists = events.some(e => 
    e.type === 'TaskCreated' && 
    e.data.title === command.title
  );
  if (exists) {
    return reject('Task with this title already exists');
  }
  
  return approve([{
    type: 'TaskCreated',
    aggregateId: generateId(),
    causedBy: [],
    data: { title: command.title, createdBy: command.userId }
  }]);
}
```

**decideStartTask**:
```typescript
function decideStartTask(
  command: StartTaskCommand,
  events: TaskEvent[]
): Decision {
  const state = reconstructTask(events);
  
  // Business rule: Must be Todo
  if (state.status !== 'Todo') {
    return reject('Task must be Todo to start');
  }
  
  // Business rule: Must have assignee
  if (!state.assignee) {
    return reject('Task must be assigned before starting');
  }
  
  return approve([{
    type: 'TaskStarted',
    aggregateId: command.taskId,
    causedBy: [lastEvent.id],
    data: { startedBy: command.userId }
  }]);
}
```

**decideCompleteTask**:
```typescript
function decideCompleteTask(
  command: CompleteTaskCommand,
  events: TaskEvent[]
): Decision {
  const state = reconstructTask(events);
  
  // Business rule: Must be Doing
  if (state.status !== 'Doing') {
    return reject('Task must be Doing to complete');
  }
  
  // Business rule: Assignee only
  if (command.userId !== state.assignee) {
    return reject('Only assignee can complete task');
  }
  
  return approve([{
    type: 'TaskCompleted',
    aggregateId: command.taskId,
    causedBy: [lastEvent.id],
    data: { completedBy: command.userId }
  }]);
}
```

---

## Projection Types

### Projection Interface
```typescript
interface Projection<TState> {
  init(): TState;
  apply(state: TState, event: DomainEvent): TState;
  result(state: TState): unknown;
}
```

### Task Projections

**TaskListProjection** - Flat summary
```typescript
function projectTaskList(events: TaskEvent[]): TaskListItem[] {
  const tasks = new Map();
  
  for (const event of events) {
    switch (event.type) {
      case 'TaskCreated':
        tasks.set(event.aggregateId, {
          id: event.aggregateId,
          title: event.data.title,
          status: 'Todo',
          createdAt: event.timestamp
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

**TaskBoardProjection** - Kanban columns
```typescript
function projectTaskBoard(events: TaskEvent[]): BoardView {
  const tasks = projectTaskList(events);
  return {
    todo: tasks.filter(t => t.status === 'Todo'),
    doing: tasks.filter(t => t.status === 'Doing'),
    done: tasks.filter(t => t.status === 'Done'),
  };
}
```

**TaskWhyProjection** - Event history explanation
```typescript
function projectTaskWhy(taskId: string, events: TaskEvent[]): WhyView {
  return events
    .filter(e => e.aggregateId === taskId)
    .map(e => ({
      timestamp: e.timestamp,
      type: e.type,
      explanation: explainEvent(e),
      causedBy: e.causedBy
    }));
}
```

**TaskDiscussionProjection** - Comment threads
```typescript
function projectTaskDiscussion(taskId: string, events: TaskEvent[]): DiscussionView {
  const comments = [];
  
  for (const event of events) {
    if (event.aggregateId !== taskId) continue;
    
    if (event.type === 'TaskCommentAdded') {
      comments.push({
        id: event.data.commentId,
        content: event.data.content,
        authorId: event.data.authorId,
        createdAt: event.timestamp
      });
    }
  }
  
  return { comments };
}
```

**TaskTimelineProjection** - Chronological view
```typescript
function projectTaskTimeline(taskId: string, events: TaskEvent[]): TimelineView {
  return events
    .filter(e => e.aggregateId === taskId)
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(e => ({
      timestamp: e.timestamp,
      type: e.type,
      description: formatEventDescription(e)
    }));
}
```

---

## Process Types

### Process Manager Pattern
```typescript
class TaskLifecycleProcess {
  private state: ProcessState;
  
  handle(event: TaskEvent): Command[] {
    const commands = [];
    
    if (event.type === 'TaskStarted') {
      // Notify assignee
      commands.push({
        type: 'NotifyAssignee',
        userId: this.state.assignee
      });
      
      // Schedule timeout check
      commands.push({
        type: 'ScheduleTimeout',
        taskId: event.aggregateId,
        duration: 3 * 24 * 60 * 60 * 1000 // 3 days
      });
    }
    
    if (event.type === 'TaskCompleted') {
      // Notify reporter
      commands.push({
        type: 'NotifyReporter',
        userId: this.state.createdBy
      });
      
      // Close process
      this.state.status = 'Completed';
    }
    
    return commands;
  }
}
```

### Saga Pattern
```typescript
// Event-driven choreography
const TaskCollaborationSaga = {
  'TaskCommentAdded': [
    NotifyTaskAssignee,
    UpdateDiscussionTimestamp
  ],
  'TaskAssigned': [
    NotifyNewAssignee,
    NotifyPreviousAssignee,
    UpdateTaskBoard
  ]
};
```

---

## Command Models

```typescript
// Commands represent user intentions
interface CreateTaskCommand {
  title: string;
  description?: string;
  userId: string;
}

interface StartTaskCommand {
  taskId: string;
  userId: string;
}

interface CompleteTaskCommand {
  taskId: string;
  userId: string;
}

interface AddCommentCommand {
  taskId: string;
  content: string;
  userId: string;
}
```

---

## Read Models (DTOs)

```typescript
// Read models for UI display
interface TaskListItem {
  id: string;
  title: string;
  status: 'Todo' | 'Doing' | 'Done';
  assignee?: string;
  createdAt: number;
}

interface TaskDetail {
  id: string;
  title: string;
  description: string;
  status: string;
  assignee?: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  comments: Comment[];
}

interface Comment {
  id: string;
  content: string;
  authorId: string;
  createdAt: number;
}
```

---

## Key Rules

### Events
- ✅ Past tense names (TaskCreated, not CreateTask)
- ✅ Immutable after persistence
- ✅ Always have `causedBy` field
- ✅ Business-meaningful

### Decisions
- ✅ Pure functions (deterministic)
- ✅ Load events, not database
- ✅ Can reject with clear reasons
- ✅ Return new events on approval

### Projections
- ✅ Pure functions (no side effects)
- ✅ Idempotent (same input → same output)
- ✅ No database writes
- ✅ Multiple views from same events

### Processes
- ✅ Event-driven coordination
- ✅ Compensation on failure
- ✅ Idempotent handlers

---

**Version**: v2.0  
**Last Updated**: 2025-12-31
