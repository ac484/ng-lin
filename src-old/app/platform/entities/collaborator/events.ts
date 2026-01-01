/**
 * Collaborator Entity Events
 */

import { DomainEvent } from '../../../core/foundation/base/domain-event.base';

export interface CollaboratorInvitedEvent extends DomainEvent {
  readonly type: 'collaborator.invited';
  readonly payload: {
    readonly collaboratorId: string;
    readonly userId: string;
    readonly resourceType: 'org' | 'team' | 'task';
    readonly resourceId: string;
    readonly role: string;
    readonly invitedAt: Date;
  };
}

export interface CollaboratorAcceptedEvent extends DomainEvent {
  readonly type: 'collaborator.accepted';
  readonly payload: {
    readonly collaboratorId: string;
    readonly acceptedAt: Date;
  };
}

export interface CollaboratorRemovedEvent extends DomainEvent {
  readonly type: 'collaborator.removed';
  readonly payload: {
    readonly collaboratorId: string;
    readonly removedAt: Date;
  };
}

export type CollaboratorEvent = 
  | CollaboratorInvitedEvent 
  | CollaboratorAcceptedEvent 
  | CollaboratorRemovedEvent;
