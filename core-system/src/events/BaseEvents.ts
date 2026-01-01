/**
 * Core Event Types
 * 
 * Base interfaces for all events in the Event-Sourced system.
 * Events are immutable facts about what has happened.
 */

/**
 * Causality metadata for event tracking
 */
export interface CausalityMetadata {
  /** ID of the event that caused this event */
  causedBy: string;
  /** User who triggered this event */
  causedByUser: string;
  /** Action that caused this event */
  causedByAction: string;
  /** Timestamp when event occurred */
  timestamp: Date;
  /** Blueprint/tenant ID for multi-tenant boundary */
  blueprintId: string;
  /** Process/Saga ID if part of a long-running process */
  processId?: string;
  /** Correlation ID for tracing */
  correlationId?: string;
}

/**
 * Base event interface
 * All domain events must extend this interface
 */
export interface DomainEvent<TPayload = any> {
  /** Unique event ID */
  id: string;
  /** Aggregate ID this event belongs to */
  aggregateId: string;
  /** Type of aggregate (Task, Invoice, FieldLog, etc.) */
  aggregateType: string;
  /** Specific event type */
  eventType: string;
  /** Event payload data */
  data: TPayload;
  /** Causality metadata */
  metadata: CausalityMetadata;
  /** Event version for schema evolution */
  version: number;
}

/**
 * Event envelope for storage
 */
export interface EventEnvelope {
  event: DomainEvent;
  /** Storage timestamp */
  storedAt: Date;
  /** Storage position/sequence number */
  position: number;
}

/**
 * Event stream for an aggregate
 */
export interface EventStream {
  aggregateId: string;
  aggregateType: string;
  events: DomainEvent[];
  version: number;
}

/**
 * Snapshot for optimization
 */
export interface Snapshot<TState = any> {
  aggregateId: string;
  aggregateType: string;
  state: TState;
  version: number;
  timestamp: Date;
}
