/**
 * User Entity Events
 * 
 * Domain events for user lifecycle management in the platform layer.
 * These events represent state changes in user entities.
 */

import { DomainEvent } from '../../../core/foundation/base/domain-event.base';

/**
 * Event published when a new user is created in the system
 */
export interface UserCreatedEvent extends DomainEvent {
  readonly type: 'user.created';
  readonly payload: {
    readonly userId: string;
    readonly email: string;
    readonly displayName: string;
    readonly createdAt: Date;
  };
}

/**
 * Event published when user profile is updated
 */
export interface UserUpdatedEvent extends DomainEvent {
  readonly type: 'user.updated';
  readonly payload: {
    readonly userId: string;
    readonly updates: Partial<{
      displayName: string;
      email: string;
      photoURL: string;
    }>;
    readonly updatedAt: Date;
  };
}

/**
 * Event published when user account is deactivated
 */
export interface UserDeactivatedEvent extends DomainEvent {
  readonly type: 'user.deactivated';
  readonly payload: {
    readonly userId: string;
    readonly reason?: string;
    readonly deactivatedAt: Date;
  };
}

/**
 * Union type of all user events
 */
export type UserEvent = UserCreatedEvent | UserUpdatedEvent | UserDeactivatedEvent;
