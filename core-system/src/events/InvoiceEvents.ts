/**
 * Invoice Domain Events
 * 
 * Events representing invoicing lifecycle and payment tracking.
 */

import { DomainEvent } from './BaseEvents';

/**
 * Invoice requested event payload
 */
export interface InvoiceRequestedPayload {
  invoiceNumber: string;
  amount: number;
  taskIds: string[];
  requestedBy: string;
  notes?: string;
}

/**
 * Invoice approved event payload
 */
export interface InvoiceApprovedPayload {
  approvedBy: string;
  approvedAt: Date;
  approvalNotes?: string;
}

/**
 * Invoice paid event payload
 */
export interface InvoicePaidPayload {
  paidAmount: number;
  paidAt: Date;
  paymentMethod: string;
  paymentReference?: string;
}

/**
 * Invoice rejected event payload
 */
export interface InvoiceRejectedPayload {
  rejectedBy: string;
  rejectedAt: Date;
  reason: string;
}

/**
 * Invoice status enum
 */
export enum InvoiceStatus {
  Requested = 'REQUESTED',
  Approved = 'APPROVED',
  Paid = 'PAID',
  Rejected = 'REJECTED'
}

/**
 * Invoice domain events
 */
export type InvoiceRequestedEvent = DomainEvent<InvoiceRequestedPayload>;
export type InvoiceApprovedEvent = DomainEvent<InvoiceApprovedPayload>;
export type InvoicePaidEvent = DomainEvent<InvoicePaidPayload>;
export type InvoiceRejectedEvent = DomainEvent<InvoiceRejectedPayload>;

/**
 * Union type of all invoice events
 */
export type InvoiceEvent = 
  | InvoiceRequestedEvent 
  | InvoiceApprovedEvent 
  | InvoicePaidEvent 
  | InvoiceRejectedEvent;

/**
 * Invoice event type constants
 */
export const InvoiceEventTypes = {
  INVOICE_REQUESTED: 'INVOICE_REQUESTED',
  INVOICE_APPROVED: 'INVOICE_APPROVED',
  INVOICE_PAID: 'INVOICE_PAID',
  INVOICE_REJECTED: 'INVOICE_REJECTED',
} as const;
