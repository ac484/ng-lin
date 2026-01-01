/**
 * Team Entity Events
 */

import { DomainEvent } from '../../../core/foundation/base/domain-event.base';

export interface TeamCreatedEvent extends DomainEvent {
  readonly type: 'team.created';
  readonly payload: {
    readonly teamId: string;
    readonly name: string;
    readonly orgId: string;
    readonly createdAt: Date;
  };
}

export interface TeamUpdatedEvent extends DomainEvent {
  readonly type: 'team.updated';
  readonly payload: {
    readonly teamId: string;
    readonly updates: Partial<{ name: string; description: string }>;
    readonly updatedAt: Date;
  };
}

export interface TeamDeletedEvent extends DomainEvent {
  readonly type: 'team.deleted';
  readonly payload: {
    readonly teamId: string;
    readonly deletedAt: Date;
  };
}

export type TeamEvent = TeamCreatedEvent | TeamUpdatedEvent | TeamDeletedEvent;
