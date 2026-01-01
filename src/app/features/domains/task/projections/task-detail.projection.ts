/**
 * Task Detail Projection
 * 
 * Complete task view with all details, comments, discussions, and attachments.
 */

import { TaskEvent } from '../events';

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
}

/**
 * Build task detail projection from events
 */
export function buildTaskDetailProjection(events: TaskEvent[]): TaskDetailProjection | null {
  // Implementation details would replay all events to build the complete view
  // This is a placeholder showing the structure
  return null;
}
