/**
 * Platform In-Memory Event Bus
 * 
 * Simple in-memory implementation of the event bus.
 * Suitable for development and single-instance deployments.
 */

import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IEventBus } from '../../interfaces';
import { DomainEvent, EventHandler, SubscribeOptions, Subscription, generateEventId } from '../../models';

interface InternalSubscription {
  id: string;
  eventType: string;
  handler: EventHandler;
  options?: SubscribeOptions;
}

@Injectable({ providedIn: 'root' })
export class InMemoryEventBus implements IEventBus {
  private readonly events$ = new Subject<DomainEvent>();
  private readonly subscriptions = new Map<string, InternalSubscription>();

  /**
   * Publish a single event
   */
  async publish(event: DomainEvent): Promise<void> {
    // Emit to all subscribers
    this.events$.next(event);

    // Call direct handlers
    for (const sub of this.subscriptions.values()) {
      if (this.matchesEventType(event.eventType, sub.eventType)) {
        if (!sub.options?.filter || sub.options.filter(event)) {
          try {
            await sub.handler(event);
          } catch (error) {
            console.error(`Error in event handler for ${event.eventType}:`, error);
          }
        }
      }
    }
  }

  /**
   * Publish multiple events in batch
   */
  async publishBatch(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }

  /**
   * Subscribe to events of a specific type
   */
  async subscribe<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>,
    options?: SubscribeOptions
  ): Promise<Subscription> {
    const id = generateEventId();
    const subscription: InternalSubscription = {
      id,
      eventType,
      handler: handler as EventHandler,
      options
    };

    this.subscriptions.set(id, subscription);

    return {
      id,
      eventType,
      unsubscribe: () => {
        this.subscriptions.delete(id);
      }
    };
  }

  /**
   * Unsubscribe from a subscription
   */
  async unsubscribe(subscription: Subscription): Promise<void> {
    this.subscriptions.delete(subscription.id);
  }

  /**
   * Observe events of a specific type
   */
  observe<T extends DomainEvent>(eventType: string): Observable<T> {
    return this.events$.pipe(
      filter(event => this.matchesEventType(event.eventType, eventType))
    ) as Observable<T>;
  }

  /**
   * Observe all events
   */
  observeAll(): Observable<DomainEvent> {
    return this.events$.asObservable();
  }

  /**
   * Check if an event type matches a pattern
   * Supports wildcards: 'user.*' matches 'user.created', 'user.updated', etc.
   */
  private matchesEventType(eventType: string, pattern: string): boolean {
    if (pattern === '*') return true;
    if (pattern === eventType) return true;
    
    // Wildcard matching: 'user.*' matches 'user.created', 'user.updated'
    if (pattern.endsWith('.*')) {
      const prefix = pattern.slice(0, -2);
      return eventType.startsWith(prefix + '.');
    }
    
    return false;
  }
}
