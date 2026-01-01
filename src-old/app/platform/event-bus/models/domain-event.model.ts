/**
 * Platform Domain Event Models
 * 
 * Minimal event model for platform event bus.
 * Aligned with platform/domains architecture.
 */

export interface DomainEventMetadata {
  readonly version: string;
  readonly source: string;
  readonly correlationId?: string;
  readonly causationId?: string;
  readonly tenantId?: string | null;
  readonly actorId?: string | null;
  readonly organizationId?: string | null;
  readonly teamId?: string | null;
  readonly blueprintId?: string | null;
  readonly context?: Record<string, unknown>;
}

/**
 * Base Domain Event Interface
 * 
 * All platform events implement this interface.
 */
export interface DomainEvent<TPayload = unknown> {
  /** Unique identifier for this event */
  readonly eventId: string;

  /** Event type identifier (e.g., 'user.created', 'task.completed') */
  readonly eventType: string;

  /** When the event occurred */
  readonly timestamp: Date;

  /** ID of the aggregate (entity) that this event relates to */
  readonly aggregateId: string;

  /** Type of the aggregate (e.g., 'user', 'organization', 'task') */
  readonly aggregateType: string;

  /** Event payload - the actual data of what happened */
  readonly payload: TPayload;

  /** Metadata about the event */
  readonly metadata: Readonly<DomainEventMetadata>;
}

/**
 * Event Handler Function Type
 */
export type EventHandler<T extends DomainEvent = DomainEvent> = (event: T) => void | Promise<void>;

/**
 * Event Subscription Options
 */
export interface SubscribeOptions {
  /** Optional filter predicate */
  filter?: (event: DomainEvent) => boolean;
  /** Handler priority (lower = higher priority) */
  priority?: number;
}

/**
 * Event Subscription
 */
export interface Subscription {
  /** Unique subscription ID */
  readonly id: string;
  /** Event type pattern */
  readonly eventType: string;
  /** Unsubscribe from this subscription */
  unsubscribe(): void;
}

/**
 * Helper to create a domain event
 */
export function createDomainEvent<T = any>(
  eventType: string,
  aggregateType: string,
  aggregateId: string,
  payload: T,
  metadata?: Partial<DomainEventMetadata>
): DomainEvent<T> {
  return {
    eventId: generateEventId(),
    eventType,
    timestamp: new Date(),
    aggregateId,
    aggregateType,
    payload,
    metadata: {
      version: '1.0',
      source: 'platform',
      ...metadata
    }
  };
}

/**
 * Generate a unique event ID
 */
export function generateEventId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `evt_${timestamp}_${random}`;
}
