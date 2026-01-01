/**
 * Platform Event Bus Interface
 * 
 * Minimal event bus contract for platform services.
 */

import { Observable } from 'rxjs';
import { DomainEvent, EventHandler, SubscribeOptions, Subscription } from '../models';

export interface IEventBus {
  /**
   * Publish a single event to the bus
   */
  publish(event: DomainEvent): Promise<void>;
  
  /**
   * Publish multiple events in a batch
   */
  publishBatch(events: DomainEvent[]): Promise<void>;
  
  /**
   * Subscribe to events of a specific type
   */
  subscribe<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>,
    options?: SubscribeOptions
  ): Promise<Subscription>;
  
  /**
   * Unsubscribe from an event subscription
   */
  unsubscribe(subscription: Subscription): Promise<void>;
  
  /**
   * Get an observable stream of events for a specific type
   */
  observe<T extends DomainEvent>(eventType: string): Observable<T>;
  
  /**
   * Get an observable stream of all events
   */
  observeAll(): Observable<DomainEvent>;
}
