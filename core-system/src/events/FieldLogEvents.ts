/**
 * FieldLog Domain Events
 * 
 * Events representing daily construction site logs and progress tracking.
 * FieldLog captures daily site activities, status changes, and observations.
 */

import { DomainEvent } from './BaseEvents';

/**
 * FieldLog created event payload
 */
export interface FieldLogCreatedPayload {
  date: string; // YYYY-MM-DD format
  projectId: string;
  weatherCondition?: string;
  temperature?: number;
  notes?: string;
  createdBy: string;
}

/**
 * FieldLog updated event payload
 */
export interface FieldLogUpdatedPayload {
  notes?: string;
  weatherCondition?: string;
  temperature?: number;
}

/**
 * Task status recorded in FieldLog
 */
export interface TaskStatusRecordedPayload {
  taskId: string;
  status: string;
  progress: number; // 0-100
  notes?: string;
}

/**
 * Invoice status recorded in FieldLog
 */
export interface InvoiceStatusRecordedPayload {
  invoiceId: string;
  status: string;
  notes?: string;
}

/**
 * Attachment added to FieldLog (photos, documents)
 */
export interface AttachmentAddedPayload {
  attachmentId: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  category: 'PHOTO' | 'DOCUMENT' | 'VIDEO' | 'OTHER';
  notes?: string;
}

/**
 * FieldLog domain events
 */
export type FieldLogCreatedEvent = DomainEvent<FieldLogCreatedPayload>;
export type FieldLogUpdatedEvent = DomainEvent<FieldLogUpdatedPayload>;
export type TaskStatusRecordedEvent = DomainEvent<TaskStatusRecordedPayload>;
export type InvoiceStatusRecordedEvent = DomainEvent<InvoiceStatusRecordedPayload>;
export type AttachmentAddedEvent = DomainEvent<AttachmentAddedPayload>;

/**
 * Union type of all FieldLog events
 */
export type FieldLogEvent = 
  | FieldLogCreatedEvent 
  | FieldLogUpdatedEvent 
  | TaskStatusRecordedEvent 
  | InvoiceStatusRecordedEvent 
  | AttachmentAddedEvent;

/**
 * FieldLog event type constants
 */
export const FieldLogEventTypes = {
  FIELDLOG_CREATED: 'FIELDLOG_CREATED',
  FIELDLOG_UPDATED: 'FIELDLOG_UPDATED',
  TASK_STATUS_RECORDED: 'TASK_STATUS_RECORDED',
  INVOICE_STATUS_RECORDED: 'INVOICE_STATUS_RECORDED',
  ATTACHMENT_ADDED: 'ATTACHMENT_ADDED',
} as const;
