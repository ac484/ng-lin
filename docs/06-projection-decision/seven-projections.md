# Seven Task Projections

> Same event stream, seven different perspectives

## Overview

Projections are **derived views** from the same immutable event stream. Each interprets events differently.

**Core**: `State = replay(events, projection_logic)`

## The 7 Projections

### 1. task-list (Flat Summary)
**Purpose**: Quick task overview  
**Events**: TaskCreated, TaskUpdated, TaskStatusChanged  
**Strategy**: Full replay

### 2. task-board (Kanban)
**Purpose**: Visualize workflow  
**Events**: TaskStatusChanged  
**Strategy**: Group by status (pending/assigned/started/completed)

### 3. task-why (Event History)
**Purpose**: Explain current state with causality  
**Events**: ALL  
**Strategy**: Chronological with `causedBy` chain

### 4. task-discussion (Threads)
**Purpose**: Threaded conversations  
**Events**: TaskDiscussionStarted, DiscussionReplyAdded  
**Strategy**: Group by thread ID

### 5. task-comment (Timeline)
**Purpose**: Flat comments  
**Events**: TaskCommentAdded, CommentEdited, CommentDeleted  
**Strategy**: Chronological filter

### 6. task-attachment (Files)
**Purpose**: File attachments  
**Events**: AttachmentUploaded, AttachmentRemoved  
**Strategy**: Filter attachment events

### 7. task-timeline (Audit Log)
**Purpose**: Complete history  
**Events**: ALL  
**Strategy**: Chronological all

## Example: Projection Function

```typescript
function projectTaskList(events: DomainEvent[]): TaskListItem[] {
  const tasks = new Map();
  
  for (const event of events) {
    if (event.type === 'TaskCreated') {
      tasks.set(event.aggregateId, {
        id: event.aggregateId,
        title: event.data.title,
        status: 'pending'
      });
    } else if (event.type === 'TaskAssigned') {
      tasks.get(event.aggregateId).status = 'assigned';
    }
  }
  
  return Array.from(tasks.values());
}
```

## Guarantees

1. **Idempotent**: Same events → same result
2. **Eventually Consistent**: All projections show same facts
3. **Independent**: Rebuild any without affecting others
4. **Cacheable**: Cache with event ID watermark

## Rebuild Strategy

```typescript
async function rebuildProjection(name: string, fromEventId?: string) {
  const events = fromEventId 
    ? await eventStore.getEventsSince(fromEventId)
    : await eventStore.getAllEvents();
  
  const state = applyProjection(name, events);
  await saveProjectionState(name, state, lastEventId);
}
```

## Summary

| Projection | Events | Use Case |
|------------|--------|----------|
| task-list | All state changes | Quick overview |
| task-board | Status changes | Workflow viz |
| task-why | ALL | Causality analysis |
| task-discussion | Discussion events | Conversations |
| task-comment | Comment events | Flat comments |
| task-attachment | Attachment events | Files |
| task-timeline | ALL | Complete audit |

---

**Last Updated**: 2025-12-31

