/**
 * Task Attachment Events
 * 
 * Events for file attachments on tasks.
 */

import { DomainEvent } from '../../../../core/foundation/base/domain-event.base';

export interface TaskAttachmentUploadedEvent extends DomainEvent {
  readonly type: 'task.attachment.uploaded';
  readonly payload: {
    readonly attachmentId: string;
    readonly taskId: string;
    readonly fileName: string;
    readonly fileSize: number;
    readonly fileType: string;
    readonly uploadedBy: string;
    readonly uploadedAt: Date;
  };
}

export interface TaskAttachmentDeletedEvent extends DomainEvent {
  readonly type: 'task.attachment.deleted';
  readonly payload: {
    readonly attachmentId: string;
    readonly taskId: string;
    readonly deletedAt: Date;
  };
}

export type TaskAttachmentEvent = 
  | TaskAttachmentUploadedEvent 
  | TaskAttachmentDeletedEvent;
