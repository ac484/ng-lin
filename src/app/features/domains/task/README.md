# Task Domain

## Overview

The Task Domain is the **sole business entity** in ng-lin, following the principles defined in Task.md. All business logic and workflows are centered around tasks, with other entities (comments, discussions, attachments) existing as aspects of tasks rather than independent entities.

## Architecture Principles

### 1. Task is the Only Business Entity
- Task is the single aggregate root in the business domain
- Comments, discussions, and attachments are task events, not separate entities
- All business logic flows through task decisions and processes

### 2. Event Sourcing
- Task state is derived from event replay
- Events are the single source of truth
- All state changes are captured as events
- State = replay(events)

### 3. Multiple Projections for Multiple Views
- Task Detail: Complete task view with all data
- Task List: Optimized list view for browsing
- Task Timeline: Event history for audit trail
- Task Board: Kanban view (future)
- Task Why: Causality and reasoning view (future)

## Domain Structure

```
task/
├── events/           # Domain events (6 files)
│   ├── task-core.events.ts       # TaskCreated, TaskUpdated, TaskDeleted
│   ├── task-lifecycle.events.ts  # TaskStarted, TaskCompleted, TaskCancelled
│   ├── task-comment.events.ts    # Comment add/edit/delete events
│   ├── task-discussion.events.ts # Discussion and message events
│   ├── task-attachment.events.ts # Attachment upload/delete events
│   └── index.ts
├── decisions/        # Business rules (pure functions)
│   └── task.decisions.ts         # All decision logic
├── projections/      # Read models
│   ├── task-detail.projection.ts
│   ├── task-list.projection.ts
│   ├── task-timeline.projection.ts
│   └── index.ts
├── processes/        # Process managers (Sagas)
│   └── task-lifecycle.process.ts
├── commands/         # Command definitions
│   └── task.commands.ts
├── models/           # Read-side models (5 files)
│   ├── task.model.ts
│   ├── task-comment.model.ts
│   ├── task-discussion.model.ts
│   ├── task-attachment.model.ts
│   └── index.ts
├── ui/               # UI components (to be implemented)
├── README.md
└── index.ts
```

## Event Types

### Core Events
- `task.created` - Task is created
- `task.updated` - Task properties are updated
- `task.deleted` - Task is deleted

### Lifecycle Events
- `task.started` - Task work begins
- `task.completed` - Task is finished
- `task.cancelled` - Task is cancelled

### Comment Events
- `task.comment.added` - Comment is added
- `task.comment.edited` - Comment is edited
- `task.comment.deleted` - Comment is deleted

### Discussion Events
- `task.discussion.started` - Discussion thread is created
- `task.discussion.message.posted` - Message posted to discussion

### Attachment Events
- `task.attachment.uploaded` - File attached to task
- `task.attachment.deleted` - Attachment removed

## Decision Functions

All business rules are implemented as pure functions in `decisions/task.decisions.ts`:

- `decideCreateTask` - Can a task be created?
- `decideStartTask` - Can a task be started?
- `decideCompleteTask` - Can a task be completed?
- `decideAddComment` - Can a comment be added?
- `decideUploadAttachment` - Can a file be attached?

## Projections

### Task Detail Projection
Complete task view including:
- Core task data
- All comments
- All discussions with messages
- All attachments

### Task List Projection
Lightweight view for listing tasks:
- Basic task info
- Status and priority
- Comment/attachment counts

### Task Timeline Projection
Audit trail showing:
- All events in chronological order
- Actor information
- Event descriptions

## Commands

All task operations are expressed as commands:

**Lifecycle:**
- `CreateTaskCommand`
- `UpdateTaskCommand`
- `DeleteTaskCommand`
- `StartTaskCommand`
- `CompleteTaskCommand`

**Comments:**
- `AddCommentCommand`
- `EditCommentCommand`
- `DeleteCommentCommand`

**Attachments:**
- `UploadAttachmentCommand`
- `DeleteAttachmentCommand`

## Process Manager

`TaskLifecycleProcess` coordinates:
- Task state transitions
- Notification triggering
- Audit trail creation
- Integration with platform entities (user, org, team)

## Integration with Platform

Tasks reference platform entities but don't depend on them:
- `creatorId` → User
- `assigneeId` → User
- `orgId` → Organization
- `teamId` → Team

This allows tasks to exist independently while maintaining relationships.

## Implementation Status

- ✅ Event definitions (6 files)
- ✅ Decision functions (1 file)
- ✅ Projections structure (3 files)
- ✅ Commands (1 file)
- ✅ Models (5 files)
- ✅ Process manager structure (1 file)
- ⏳ Full projection implementations
- ⏳ UI components

## Next Steps

1. Implement projection build functions
2. Implement process manager logic
3. Create UI components for each view
4. Add comprehensive tests
5. Integrate with existing features

## Alignment with Documentation

This structure aligns with:
- `docs/dev/0-目錄-v2-Task-SaaS.md` - Task domain architecture
- Task.md - Task as sole business entity principle
- SYS.md - Event sourcing and causality patterns
- Enable.md - DDD and projection patterns

---

**Version**: 1.0  
**Last Updated**: 2026-01-01  
**Status**: Structure established, implementation in progress
