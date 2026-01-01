/**
 * Task Domain Events
 * 
 * Events representing state changes in Task aggregate.
 * Tasks are the primary business entity.
 */

import { DomainEvent } from './BaseEvents';

/**
 * Task created event payload
 */
export interface TaskCreatedPayload {
  title: string;
  description?: string;
  parentTaskId?: string;
  projectId: string;
  assigneeId?: string;
  dueDate?: Date;
}

/**
 * Task updated event payload
 */
export interface TaskUpdatedPayload {
  title?: string;
  description?: string;
  assigneeId?: string;
  dueDate?: Date;
}

/**
 * Task status changed event payload
 */
export interface TaskStatusChangedPayload {
  fromStatus: TaskStatus;
  toStatus: TaskStatus;
  reason?: string;
}

/**
 * Task status enum
 */
export enum TaskStatus {
  Todo = 'TODO',
  InProgress = 'IN_PROGRESS',
  Done = 'DONE',
  Cancelled = 'CANCELLED'
}

/**
 * Task split event payload
 */
export interface TaskSplitPayload {
  childTasks: Array<{
    title: string;
    description?: string;
    estimatedAmount?: number;
  }>;
}

/**
 * Task domain events
 */
export type TaskCreatedEvent = DomainEvent<TaskCreatedPayload>;
export type TaskUpdatedEvent = DomainEvent<TaskUpdatedPayload>;
export type TaskStatusChangedEvent = DomainEvent<TaskStatusChangedPayload>;
export type TaskSplitEvent = DomainEvent<TaskSplitPayload>;

/**
 * Union type of all task events
 */
export type TaskEvent = 
  | TaskCreatedEvent 
  | TaskUpdatedEvent 
  | TaskStatusChangedEvent 
  | TaskSplitEvent;

/**
 * Task event type constants
 */
export const TaskEventTypes = {
  TASK_CREATED: 'TASK_CREATED',
  TASK_UPDATED: 'TASK_UPDATED',
  TASK_STATUS_CHANGED: 'TASK_STATUS_CHANGED',
  TASK_SPLIT: 'TASK_SPLIT',
} as const;
