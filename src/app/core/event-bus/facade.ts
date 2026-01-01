// Minimal facade for Feature imports
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
