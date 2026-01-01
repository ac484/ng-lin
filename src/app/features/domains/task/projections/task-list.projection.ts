/**
 * Task List Projection
 * 
 * Optimized view for displaying tasks in a list.
 */

import { TaskEvent } from '../events';

export interface TaskListProjection {
  readonly taskId: string;
  readonly title: string;
  readonly status: string;
  readonly priority?: string;
  readonly creatorId: string;
  readonly assigneeId?: string;
  readonly createdAt: Date;
  readonly updatedAt?: Date;
  readonly commentCount: number;
  readonly attachmentCount: number;
}

/**
 * Build task list projection from events
 */
export function buildTaskListProjection(events: TaskEvent[]): TaskListProjection[] {
  // Implementation would build a lightweight list view
  return [];
}
