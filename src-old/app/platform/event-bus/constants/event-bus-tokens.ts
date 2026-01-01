/**
 * Platform Event Bus Tokens
 * 
 * Dependency injection tokens for event bus services.
 */

import { InjectionToken } from '@angular/core';
import { IEventBus } from '../interfaces';

/**
 * Injection token for the event bus
 */
export const EVENT_BUS = new InjectionToken<IEventBus>('PLATFORM_EVENT_BUS');

/**
 * Injection token for the event store (if different from bus)
 */
export const EVENT_STORE = new InjectionToken<IEventBus>('PLATFORM_EVENT_STORE');
