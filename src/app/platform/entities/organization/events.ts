/**
 * Organization Entity Events
 * 
 * Domain events for organization lifecycle management in the platform layer.
 */

import { DomainEvent } from '../../../core/foundation/base/domain-event.base';

/**
 * Event published when a new organization is created
 */
export interface OrgCreatedEvent extends DomainEvent {
  readonly type: 'org.created';
  readonly payload: {
    readonly orgId: string;
    readonly name: string;
    readonly ownerId: string;
    readonly createdAt: Date;
  };
}

/**
 * Event published when organization details are updated
 */
export interface OrgUpdatedEvent extends DomainEvent {
  readonly type: 'org.updated';
  readonly payload: {
    readonly orgId: string;
    readonly updates: Partial<{
      name: string;
      description: string;
    }>;
    readonly updatedAt: Date;
  };
}

/**
 * Event published when organization is deleted
 */
export interface OrgDeletedEvent extends DomainEvent {
  readonly type: 'org.deleted';
  readonly payload: {
    readonly orgId: string;
    readonly deletedAt: Date;
  };
}

/**
 * Union type of all organization events
 */
export type OrgEvent = OrgCreatedEvent | OrgUpdatedEvent | OrgDeletedEvent;
