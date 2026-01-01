/**
 * EventStore - Event storage and retrieval interface
 * 
 * Defines contract for persisting and retrieving events.
 * Implementations can use Firestore, PostgreSQL, or other storage.
 */

import { DomainEvent, EventEnvelope, EventStream, Snapshot } from '../events/BaseEvents';

/**
 * Event store interface
 */
export interface IEventStore {
  /**
   * Append event to stream
   */
  append(event: DomainEvent): Promise<void>;

  /**
   * Get all events for an aggregate
   */
  getEvents(aggregateId: string): Promise<DomainEvent[]>;

  /**
   * Get events after a specific version
   */
  getEventsAfterVersion(aggregateId: string, version: number): Promise<DomainEvent[]>;

  /**
   * Get events in a time range
   */
  getEventsByTimeRange(
    aggregateId: string, 
    startTime: Date, 
    endTime: Date
  ): Promise<DomainEvent[]>;

  /**
   * Save snapshot for optimization
   */
  saveSnapshot<T>(snapshot: Snapshot<T>): Promise<void>;

  /**
   * Get latest snapshot
   */
  getSnapshot<T>(aggregateId: string): Promise<Snapshot<T> | null>;

  /**
   * Get event stream with metadata
   */
  getStream(aggregateId: string): Promise<EventStream>;
}

/**
 * In-memory event store implementation (for testing)
 */
export class InMemoryEventStore implements IEventStore {
  private events: Map<string, DomainEvent[]> = new Map();
  private snapshots: Map<string, Snapshot> = new Map();

  async append(event: DomainEvent): Promise<void> {
    const aggregateEvents = this.events.get(event.aggregateId) || [];
    aggregateEvents.push(event);
    this.events.set(event.aggregateId, aggregateEvents);
  }

  async getEvents(aggregateId: string): Promise<DomainEvent[]> {
    return this.events.get(aggregateId) || [];
  }

  async getEventsAfterVersion(
    aggregateId: string, 
    version: number
  ): Promise<DomainEvent[]> {
    const events = await this.getEvents(aggregateId);
    return events.filter(e => e.version > version);
  }

  async getEventsByTimeRange(
    aggregateId: string,
    startTime: Date,
    endTime: Date
  ): Promise<DomainEvent[]> {
    const events = await this.getEvents(aggregateId);
    return events.filter(e => 
      e.metadata.timestamp >= startTime && 
      e.metadata.timestamp <= endTime
    );
  }

  async saveSnapshot<T>(snapshot: Snapshot<T>): Promise<void> {
    this.snapshots.set(snapshot.aggregateId, snapshot);
  }

  async getSnapshot<T>(aggregateId: string): Promise<Snapshot<T> | null> {
    return (this.snapshots.get(aggregateId) as Snapshot<T>) || null;
  }

  async getStream(aggregateId: string): Promise<EventStream> {
    const events = await this.getEvents(aggregateId);
    return {
      aggregateId,
      aggregateType: events[0]?.aggregateType || 'Unknown',
      events,
      version: events.length
    };
  }
}
