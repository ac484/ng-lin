/**
 * Task Lifecycle Events
 * 
 * Events for task lifecycle state transitions.
 */

import { DomainEvent } from '../../../../core/foundation/base/domain-event.base';

export interface TaskStartedEvent extends DomainEvent {
  readonly type: 'task.started';
  readonly payload: {
    readonly taskId: string;
    readonly startedBy: string;
    readonly startedAt: Date;
  };
}

export interface TaskCompletedEvent extends DomainEvent {
  readonly type: 'task.completed';
  readonly payload: {
    readonly taskId: string;
    readonly completedBy: string;
    readonly completedAt: Date;
  };
}

export interface TaskCancelledEvent extends DomainEvent {
  readonly type: 'task.cancelled';
  readonly payload: {
    readonly taskId: string;
    readonly cancelledBy: string;
    readonly reason?: string;
    readonly cancelledAt: Date;
  };
}

export type TaskLifecycleEvent = TaskStartedEvent | TaskCompletedEvent | TaskCancelledEvent;
