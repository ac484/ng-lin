/**
 * Task Comment Events
 * 
 * Events for task comments and discussions.
 */

import { DomainEvent } from '../../../../platform/event-bus/models';

export interface TaskCommentAddedEvent extends DomainEvent {
  readonly type: 'task.comment.added';
  readonly payload: {
    readonly commentId: string;
    readonly taskId: string;
    readonly authorId: string;
    readonly content: string;
    readonly addedAt: Date;
  };
}

export interface TaskCommentEditedEvent extends DomainEvent {
  readonly type: 'task.comment.edited';
  readonly payload: {
    readonly commentId: string;
    readonly taskId: string;
    readonly content: string;
    readonly editedAt: Date;
  };
}

export interface TaskCommentDeletedEvent extends DomainEvent {
  readonly type: 'task.comment.deleted';
  readonly payload: {
    readonly commentId: string;
    readonly taskId: string;
    readonly deletedAt: Date;
  };
}

export type TaskCommentEvent = 
  | TaskCommentAddedEvent 
  | TaskCommentEditedEvent 
  | TaskCommentDeletedEvent;
