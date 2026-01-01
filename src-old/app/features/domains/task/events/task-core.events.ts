/**
 * Task Core Events
 * 
 * Core lifecycle events for task entities.
 */

import { DomainEvent } from '../../../../platform/event-bus/models';

export interface TaskCreatedEvent extends DomainEvent {
  readonly type: 'task.created';
  readonly payload: {
    readonly taskId: string;
    readonly title: string;
    readonly description?: string;
    readonly creatorId: string;
    readonly orgId?: string;
    readonly teamId?: string;
    readonly createdAt: Date;
  };
}

export interface TaskUpdatedEvent extends DomainEvent {
  readonly type: 'task.updated';
  readonly payload: {
    readonly taskId: string;
    readonly updates: Partial<{
      title: string;
      description: string;
      priority: string;
      status: string;
    }>;
    readonly updatedAt: Date;
  };
}

export interface TaskDeletedEvent extends DomainEvent {
  readonly type: 'task.deleted';
  readonly payload: {
    readonly taskId: string;
    readonly deletedAt: Date;
  };
}

export type TaskCoreEvent = TaskCreatedEvent | TaskUpdatedEvent | TaskDeletedEvent;
