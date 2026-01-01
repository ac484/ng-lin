/**
 * Global Event Bus Public API
 * 
 * Complete enterprise-grade event bus implementation following GitHub architecture.
 * Supports multiple backends (in-memory, Firebase, Supabase, Kafka).
 * 
 * Phase 5: Domain Integration
 * - Domain event definitions for core entities
 * - Production-ready consumer implementations
 * - Full integration examples
 */

// Core models
export * as EventBusModels from './models';

// Interfaces
export * as EventBusInterfaces from './interfaces';

// Implementations
export * as EventBusImplementations from './implementations';

// Services (includes base consumer and re-exports of implementations)
export * as EventBusServices from './services';

// Decorators
export * as EventBusDecorators from './decorators';

// Constants
export * as EventBusConstants from './constants';

// Errors
export * as EventBusErrors from './errors';

// Domain Events (Phase 5)
export * as EventBusDomainEvents from './domain-events';

// Consumers (Phase 5)
export * as EventBusConsumers from './consumers';

// Utils
export * as EventBusUtils from './utils';

// Testing
export * as EventBusTesting from './testing';

// Examples (for reference and testing)
export * as EventBusExamples from './examples';

// Minimal facade-style re-exports for feature usage
export { EVENT_BUS } from './constants/event-bus-tokens';
export {
  SYSTEM_EVENTS,
  DOMAIN_NAMESPACES,
  AUDIT_POLICY_EVENTS,
  EVENT_SUFFIXES,
  EVENT_PATTERNS,
  buildEventType,
  matchesPattern
} from './constants/event-types.constants';
export type { IEventBus } from './interfaces/event-bus.interface';
export type { DomainEvent, EventHandler, SubscribeOptions, Subscription } from './models';
export { InMemoryEventBus } from './implementations/in-memory/in-memory-event-bus';
