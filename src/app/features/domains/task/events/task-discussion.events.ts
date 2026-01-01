/**
 * Task Discussion Events
 * 
 * Events for task discussions and threaded conversations.
 */

import { DomainEvent } from '../../../../core/foundation/base/domain-event.base';

export interface TaskDiscussionStartedEvent extends DomainEvent {
  readonly type: 'task.discussion.started';
  readonly payload: {
    readonly discussionId: string;
    readonly taskId: string;
    readonly startedBy: string;
    readonly topic: string;
    readonly startedAt: Date;
  };
}

export interface TaskMessagePostedEvent extends DomainEvent {
  readonly type: 'task.discussion.message.posted';
  readonly payload: {
    readonly messageId: string;
    readonly discussionId: string;
    readonly taskId: string;
    readonly authorId: string;
    readonly content: string;
    readonly postedAt: Date;
  };
}

export type TaskDiscussionEvent = TaskDiscussionStartedEvent | TaskMessagePostedEvent;
