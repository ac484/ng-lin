/**
 * EventBus - In-memory event publishing and subscription
 * 
 * Simple event bus for coordinating events within the core system.
 * For production, integrate with Firebase or external message broker.
 */

import { DomainEvent } from '../events/BaseEvents';

type EventHandler<T = any> = (event: DomainEvent<T>) => void | Promise<void>;

/**
 * Simple in-memory event bus
 */
export class EventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private allEventHandlers: Set<EventHandler> = new Set();

  /**
   * Subscribe to specific event type
   */
  subscribe(eventType: string, handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }

  /**
   * Subscribe to all events
   */
  subscribeAll(handler: EventHandler): () => void {
    this.allEventHandlers.add(handler);
    return () => {
      this.allEventHandlers.delete(handler);
    };
  }

  /**
   * Publish event to subscribers
   */
  async publish(event: DomainEvent): Promise<void> {
    // Call handlers for specific event type
    const typeHandlers = this.handlers.get(event.eventType);
    if (typeHandlers) {
      for (const handler of typeHandlers) {
        try {
          await handler(event);
        } catch (error) {
          console.error(`Error handling event ${event.eventType}:`, error);
        }
      }
    }

    // Call handlers subscribed to all events
    for (const handler of this.allEventHandlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`Error in all-events handler:`, error);
      }
    }
  }

  /**
   * Clear all subscriptions
   */
  clear(): void {
    this.handlers.clear();
    this.allEventHandlers.clear();
  }
}

/**
 * Global event bus instance
 */
export const eventBus = new EventBus();
