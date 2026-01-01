/**
 * Platform Event Store Service
 * 
 * Central event store for all platform-level entities (User, Organization, Team, Collaborator, Bot).
 * Provides persistence, retrieval, and replay capabilities for platform events.
 * 
 * @example
 * ```typescript
 * // Publishing a platform event
 * await eventStore.publish(new UserCreatedEvent({
 *   userId: 'user_123',
 *   email: 'user@example.com'
 * }));
 * 
 * // Subscribing to platform events
 * eventStore.subscribe('user.created', (event) => {
 *   console.log('User created:', event.payload);
 * });
 * 
 * // Getting event history for an entity
 * const events = await eventStore.getEventsForAggregate('user', 'user_123');
 * ```
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import type { IEventBus, DomainEvent } from '../event-bus';
import { EVENT_BUS } from '../event-bus';

/**
 * Platform entity namespaces for event filtering
 */
const PLATFORM_NAMESPACES = [
  'user',
  'organization',
  'team',
  'collaborator',
  'bot',
  'task' // Add task as supported namespace
] as const;

type PlatformNamespace = typeof PLATFORM_NAMESPACES[number];

/**
 * Platform Event Store Service
 * 
 * Provides a platform-specific layer over the core event bus infrastructure.
 * Handles all events for multi-tenant platform entities.
 */
@Injectable({ providedIn: 'root' })
export class PlatformEventStoreService {
  private readonly eventBus = inject(EVENT_BUS);

  /**
   * Publish a single platform event
   * 
   * @param event - Platform domain event to publish
   * @returns Promise that resolves when event is persisted
   */
  async publish(event: DomainEvent): Promise<void> {
    this.validatePlatformEvent(event);
    await this.eventBus.publish(event);
  }

  /**
   * Publish multiple platform events in a batch
   * 
   * @param events - Array of platform events
   * @returns Promise that resolves when all events are persisted
   */
  async publishBatch(events: DomainEvent[]): Promise<void> {
    events.forEach(event => this.validatePlatformEvent(event));
    await this.eventBus.publishBatch(events);
  }

  /**
   * Subscribe to platform events of a specific type
   * 
   * @param eventType - Event type pattern (e.g., 'user.created', 'user.*')
   * @param handler - Callback function to handle events
   * @returns Subscription object for cleanup
   */
  subscribe<T extends DomainEvent>(
    eventType: string,
    handler: (event: T) => void | Promise<void>
  ): { unsubscribe: () => void } {
    const subscription = this.eventBus.observe<T>(eventType).subscribe({
      next: async (event) => {
        await handler(event);
      },
      error: (error) => {
        console.error(`Error in event handler for ${eventType}:`, error);
      }
    });
    
    return {
      unsubscribe: () => subscription.unsubscribe()
    };
  }

  /**
   * Get all events for a specific aggregate (entity instance)
   * 
   * @param aggregateType - Type of aggregate (user, organization, team, etc.)
   * @param aggregateId - Unique identifier for the aggregate
   * @returns Observable stream of events for this aggregate
   */
  getEventsForAggregate(
    aggregateType: PlatformNamespace,
    aggregateId: string
  ): Observable<DomainEvent> {
    return this.eventBus.observeAll().pipe(
      filter(event => 
        event.aggregateType === aggregateType && 
        event.aggregateId === aggregateId
      )
    );
  }

  /**
   * Get all events for a specific aggregate as a Promise (for async/await)
   * 
   * @param aggregateType - Type of aggregate (user, organization, team, etc.)
   * @param aggregateId - Unique identifier for the aggregate
   * @returns Promise resolving to array of events for this aggregate
   */
  async getEventsForAggregateAsync(
    aggregateType: PlatformNamespace,
    aggregateId: string
  ): Promise<DomainEvent[]> {
    // For now, return empty array as we need to implement proper event storage
    // TODO: Implement Firebase persistence for events
    return [];
  }

  /**
   * Get all events for a specific entity type
   * 
   * @param namespace - Platform namespace (user, organization, team, etc.)
   * @returns Observable stream of all events in this namespace
   */
  getEventsForNamespace(namespace: PlatformNamespace): Observable<DomainEvent> {
    return this.eventBus.observeAll().pipe(
      filter(event => event.aggregateType === namespace)
    );
  }

  /**
   * Get all events for a specific entity type as a Promise (for async/await)
   * 
   * @param namespace - Platform namespace (user, organization, team, task, etc.)
   * @returns Promise resolving to array of events in this namespace
   */
  async getEventsForNamespaceAsync(namespace: PlatformNamespace): Promise<DomainEvent[]> {
    // For now, return empty array as we need to implement proper event storage
    // TODO: Implement Firebase persistence for events
    return [];
  }

  /**
   * Observe all platform events
   * 
   * @returns Observable stream of all platform events
   */
  observeAll(): Observable<DomainEvent> {
    return this.eventBus.observeAll().pipe(
      filter(event => this.isPlatformEvent(event))
    );
  }

  /**
   * Validate that an event belongs to the platform namespace
   */
  private validatePlatformEvent(event: DomainEvent): void {
    if (!this.isPlatformEvent(event)) {
      throw new Error(
        `Invalid platform event: ${event.aggregateType}. ` +
        `Must be one of: ${PLATFORM_NAMESPACES.join(', ')}`
      );
    }
  }

  /**
   * Check if an event belongs to the platform namespace
   */
  private isPlatformEvent(event: DomainEvent): boolean {
    return PLATFORM_NAMESPACES.includes(event.aggregateType as PlatformNamespace);
  }
}
