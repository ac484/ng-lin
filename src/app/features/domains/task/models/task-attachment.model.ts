/**
 * Task Attachment Model
 */

export interface TaskAttachmentModel {
  readonly id: string;
  readonly taskId: string;
  readonly fileName: string;
  readonly fileSize: number;
  readonly fileType: string;
  readonly uploadedBy: string;
  readonly uploadedAt: Date;
  readonly downloadUrl?: string;
}
