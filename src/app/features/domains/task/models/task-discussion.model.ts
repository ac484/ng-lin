/**
 * Task Discussion Model
 */

export interface TaskDiscussionModel {
  readonly id: string;
  readonly taskId: string;
  readonly topic: string;
  readonly startedBy: string;
  readonly startedAt: Date;
  readonly messages: TaskMessageModel[];
}

export interface TaskMessageModel {
  readonly id: string;
  readonly discussionId: string;
  readonly authorId: string;
  readonly content: string;
  readonly postedAt: Date;
}
