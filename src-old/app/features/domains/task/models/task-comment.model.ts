/**
 * Task Comment Model
 */

export interface TaskCommentModel {
  readonly id: string;
  readonly taskId: string;
  readonly authorId: string;
  readonly content: string;
  readonly createdAt: Date;
  readonly editedAt?: Date;
  readonly isDeleted: boolean;
}
