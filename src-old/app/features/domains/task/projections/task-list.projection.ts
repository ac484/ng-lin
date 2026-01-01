/**
 * Task List Projection
 * 
 * Optimized view for displaying tasks in a list or board view.
 * Lightweight projection with only essential information for list rendering.
 * 
 * @example
 * ```typescript
 * const events = await getAllTaskEvents();
 * const tasks = buildTaskListProjection(events);
 * const activeTasks = tasks.filter(t => t.status !== 'completed');
 * ```
 */

import type { DomainEvent } from '../../../../platform/event-bus/models';

export interface TaskListProjection {
  readonly taskId: string;
  readonly title: string;
  readonly status: string;
  readonly priority?: string;
  readonly creatorId: string;
  readonly assigneeId?: string;
  readonly assignee?: string; // Display name for assignee
  readonly orgId?: string;
  readonly teamId?: string;
  readonly createdAt: Date;
  readonly updatedAt?: Date;
  readonly commentCount: number;
  readonly attachmentCount: number;
  readonly discussionCount: number;
}

// Backward compatibility alias
export type TaskListItem = TaskListProjection;

/**
 * Alias for backward compatibility
 */
export type TaskListItem = TaskListProjection;

/**
 * Build task list projection from events
 * 
 * Groups events by taskId and builds a lightweight view for each task.
 * Optimized for list/board rendering with minimal data.
 * 
 * @param events - Array of all task events
 * @returns Array of task list items, one per unique taskId
 */
export function buildTaskListProjection(events: DomainEvent[]): TaskListProjection[] {
  // Group events by taskId
  const taskEventsMap = new Map<string, DomainEvent[]>();
  
  for (const event of events) {
    const taskId = event.aggregateId;
    const existing = taskEventsMap.get(taskId) || [];
    taskEventsMap.set(taskId, [...existing, event]);
  }

  // Build projection for each task
  const projections: TaskListProjection[] = [];

  for (const [taskId, taskEvents] of taskEventsMap.entries()) {
    const projection = buildSingleTaskListItem(taskEvents);
    if (projection) {
      projections.push(projection);
    }
  }

  // Sort by creation date (newest first)
  return projections.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Build a single task list item from its events
 */
function buildSingleTaskListItem(events: DomainEvent[]): TaskListProjection | null {
  if (events.length === 0) return null;

  let projection: Partial<TaskListProjection> = {
    commentCount: 0,
    attachmentCount: 0,
    discussionCount: 0
  };

  // Replay events for this task
  for (const event of events) {
    const payload = event.payload as any;

    switch (event.eventType) {
      case 'task.created':
        projection = {
          taskId: payload.taskId,
          title: payload.title,
          status: 'pending',
          priority: payload.priority,
          creatorId: payload.creatorId,
          assigneeId: payload.assigneeId,
          orgId: payload.orgId,
          teamId: payload.teamId,
          createdAt: event.timestamp,
          commentCount: 0,
          attachmentCount: 0,
          discussionCount: 0
        };
        break;

      case 'task.updated':
        projection = {
          ...projection,
          title: payload.title ?? projection.title,
          priority: payload.priority ?? projection.priority,
          assigneeId: payload.assigneeId ?? projection.assigneeId,
          updatedAt: event.timestamp
        };
        break;

      case 'task.started':
        projection = {
          ...projection,
          status: 'in_progress',
          updatedAt: event.timestamp
        };
        break;

      case 'task.completed':
        projection = {
          ...projection,
          status: 'completed',
          updatedAt: event.timestamp
        };
        break;

      case 'task.cancelled':
        projection = {
          ...projection,
          status: 'cancelled',
          updatedAt: event.timestamp
        };
        break;

      case 'task.deleted':
        projection = {
          ...projection,
          status: 'deleted',
          updatedAt: event.timestamp
        };
        break;

      // Count comments
      case 'task.comment.added':
        projection = {
          ...projection,
          commentCount: (projection.commentCount || 0) + 1
        };
        break;

      case 'task.comment.deleted':
        projection = {
          ...projection,
          commentCount: Math.max(0, (projection.commentCount || 0) - 1)
        };
        break;

      // Count attachments
      case 'task.attachment.uploaded':
        projection = {
          ...projection,
          attachmentCount: (projection.attachmentCount || 0) + 1
        };
        break;

      case 'task.attachment.deleted':
        projection = {
          ...projection,
          attachmentCount: Math.max(0, (projection.attachmentCount || 0) - 1)
        };
        break;

      // Count discussions
      case 'task.discussion.started':
        projection = {
          ...projection,
          discussionCount: (projection.discussionCount || 0) + 1
        };
        break;
    }
  }

  // Return null if no task was created
  if (!projection.taskId) {
    return null;
  }

  return projection as TaskListProjection;
}

/**
 * Filter task list by status
 */
export function filterByStatus(
  tasks: TaskListProjection[],
  status: string | string[]
): TaskListProjection[] {
  const statuses = Array.isArray(status) ? status : [status];
  return tasks.filter(t => statuses.includes(t.status));
}

/**
 * Filter task list by assignee
 */
export function filterByAssignee(
  tasks: TaskListProjection[],
  assigneeId: string
): TaskListProjection[] {
  return tasks.filter(t => t.assigneeId === assigneeId);
}

/**
 * Filter task list by organization
 */
export function filterByOrganization(
  tasks: TaskListProjection[],
  orgId: string
): TaskListProjection[] {
  return tasks.filter(t => t.orgId === orgId);
}

/**
 * Group tasks by status for board view
 */
export function groupByStatus(
  tasks: TaskListProjection[]
): Map<string, TaskListProjection[]> {
  const groups = new Map<string, TaskListProjection[]>();
  
  for (const task of tasks) {
    const existing = groups.get(task.status) || [];
    groups.set(task.status, [...existing, task]);
  }
  
  return groups;
}
