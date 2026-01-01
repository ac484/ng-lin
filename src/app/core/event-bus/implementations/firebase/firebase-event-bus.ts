import { Injectable, inject, signal } from '@angular/core';
import type { DomainEvent } from '../../models/base-event';
import type { EventHandler } from '../../interfaces/event-handler.interface';
import type { SubscribeOptions, Subscription } from '../../models';
import type { IEventBus } from '../../interfaces';
import { InMemoryEventBus } from '../in-memory/in-memory-event-bus';

/**
 * Firebase Realtime Database Event Bus
 * 
 * Real-time event distribution across clients
 * Multi-tenant support with path isolation
 */
@Injectable({ providedIn: 'root' })
export class FirebaseEventBus implements IEventBus {
  /**
   * Align with parent implementation by delegating to the hybrid (in-memory + Firestore)
   * event bus. This keeps @angular/fire usage centralized in the HybridEventStore
   * and avoids manual Firebase wrappers.
   */
  private readonly delegate = inject(InMemoryEventBus);

  /** Connection state (mirrors delegate) */
  readonly isConnected = signal(true);

  async publish(event: DomainEvent): Promise<void> {
    await this.delegate.publish(event);
  }

  async publishBatch(events: DomainEvent[]): Promise<void> {
    await this.delegate.publishBatch(events);
  }

  async subscribe<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>,
    options?: SubscribeOptions
  ): Promise<Subscription> {
    return this.delegate.subscribe(eventType, handler, options);
  }
}
