/**
 * Task Detail Projection
 * 
 * Complete task view with all details, comments, discussions, and attachments.
 * Built by replaying all task events in chronological order.
 * 
 * @example
 * ```typescript
 * const events = await getTaskEvents(taskId);
 * const detail = buildTaskDetailProjection(events);
 * console.log(detail.title, detail.status, detail.comments.length);
 * ```
 */

import type { DomainEvent } from '../../../core/event-bus';

export interface TaskDetailProjection {
  readonly taskId: string;
  readonly title: string;
  readonly description?: string;
  readonly status: string;
  readonly priority?: string;
  readonly creatorId: string;
  readonly assigneeId?: string;
  readonly orgId?: string;
  readonly teamId?: string;
  readonly createdAt: Date;
  readonly updatedAt?: Date;
  readonly startedAt?: Date;
  readonly completedAt?: Date;
  readonly cancelledAt?: Date;
  readonly comments: TaskCommentView[];
  readonly discussions: TaskDiscussionView[];
  readonly attachments: TaskAttachmentView[];
}

export interface TaskCommentView {
  readonly commentId: string;
  readonly authorId: string;
  readonly content: string;
  readonly addedAt: Date;
  readonly editedAt?: Date;
  readonly isDeleted: boolean;
}

export interface TaskDiscussionView {
  readonly discussionId: string;
  readonly topic: string;
  readonly startedBy: string;
  readonly startedAt: Date;
  readonly messages: TaskMessageView[];
}

export interface TaskMessageView {
  readonly messageId: string;
  readonly authorId: string;
  readonly content: string;
  readonly postedAt: Date;
}

export interface TaskAttachmentView {
  readonly attachmentId: string;
  readonly fileName: string;
  readonly fileSize: number;
  readonly fileType: string;
  readonly uploadedBy: string;
  readonly uploadedAt: Date;
  readonly isDeleted: boolean;
}

/**
 * Build task detail projection from events
 * 
 * Replays all events for a task to build the complete current state.
 * This is the core of Event Sourcing - state is derived from events.
 * 
 * @param events - Array of task events in chronological order
 * @returns Complete task detail projection, or null if no creation event found
 */
export function buildTaskDetailProjection(events: DomainEvent[]): TaskDetailProjection | null {
  if (events.length === 0) return null;

  // Initialize projection state
  let projection: Partial<TaskDetailProjection> = {
    comments: [],
    discussions: [],
    attachments: []
  };

  // Replay events in order
  for (const event of events) {
    const payload = event.payload as any;

    switch (event.eventType) {
      // Core events
      case 'task.created':
        projection = {
          taskId: payload.taskId,
          title: payload.title,
          description: payload.description,
          status: 'pending',
          priority: payload.priority,
          creatorId: payload.creatorId,
          assigneeId: payload.assigneeId,
          orgId: payload.orgId,
          teamId: payload.teamId,
          createdAt: event.timestamp,
          comments: [],
          discussions: [],
          attachments: []
        };
        break;

      case 'task.updated':
        projection = {
          ...projection,
          title: payload.title ?? projection.title,
          description: payload.description ?? projection.description,
          priority: payload.priority ?? projection.priority,
          assigneeId: payload.assigneeId ?? projection.assigneeId,
          updatedAt: event.timestamp
        };
        break;

      case 'task.deleted':
        // Soft delete - keep projection but mark as deleted
        projection = {
          ...projection,
          status: 'deleted',
          updatedAt: event.timestamp
        };
        break;

      // Lifecycle events
      case 'task.started':
        projection = {
          ...projection,
          status: 'in_progress',
          startedAt: event.timestamp,
          updatedAt: event.timestamp
        };
        break;

      case 'task.completed':
        projection = {
          ...projection,
          status: 'completed',
          completedAt: event.timestamp,
          updatedAt: event.timestamp
        };
        break;

      case 'task.cancelled':
        projection = {
          ...projection,
          status: 'cancelled',
          cancelledAt: event.timestamp,
          updatedAt: event.timestamp
        };
        break;

      // Comment events
      case 'task.comment.added':
        projection.comments = [
          ...(projection.comments || []),
          {
            commentId: payload.commentId,
            authorId: payload.authorId,
            content: payload.content,
            addedAt: event.timestamp,
            isDeleted: false
          }
        ];
        break;

      case 'task.comment.edited':
        projection.comments = (projection.comments || []).map(c =>
          c.commentId === payload.commentId
            ? { ...c, content: payload.content, editedAt: event.timestamp }
            : c
        );
        break;

      case 'task.comment.deleted':
        projection.comments = (projection.comments || []).map(c =>
          c.commentId === payload.commentId
            ? { ...c, isDeleted: true }
            : c
        );
        break;

      // Discussion events
      case 'task.discussion.started':
        projection.discussions = [
          ...(projection.discussions || []),
          {
            discussionId: payload.discussionId,
            topic: payload.topic,
            startedBy: payload.startedBy,
            startedAt: event.timestamp,
            messages: []
          }
        ];
        break;

      case 'task.discussion.message.posted':
        projection.discussions = (projection.discussions || []).map(d =>
          d.discussionId === payload.discussionId
            ? {
                ...d,
                messages: [
                  ...d.messages,
                  {
                    messageId: payload.messageId,
                    authorId: payload.authorId,
                    content: payload.content,
                    postedAt: event.timestamp
                  }
                ]
              }
            : d
        );
        break;

      // Attachment events
      case 'task.attachment.uploaded':
        projection.attachments = [
          ...(projection.attachments || []),
          {
            attachmentId: payload.attachmentId,
            fileName: payload.fileName,
            fileSize: payload.fileSize,
            fileType: payload.fileType,
            uploadedBy: payload.uploadedBy,
            uploadedAt: event.timestamp,
            isDeleted: false
          }
        ];
        break;

      case 'task.attachment.deleted':
        projection.attachments = (projection.attachments || []).map(a =>
          a.attachmentId === payload.attachmentId
            ? { ...a, isDeleted: true }
            : a
        );
        break;
    }
  }

  // Return null if no task was created (invalid event stream)
  if (!projection.taskId) {
    return null;
  }

  return projection as TaskDetailProjection;
}
