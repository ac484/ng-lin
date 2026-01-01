/**
 * Collaborator Entity Projections
 */

import { CollaboratorEvent } from './events';

export interface CollaboratorProjection {
  readonly collaboratorId: string;
  readonly userId: string;
  readonly resourceType: 'org' | 'team' | 'task';
  readonly resourceId: string;
  readonly role: string;
  readonly status: 'invited' | 'active' | 'removed';
  readonly invitedAt: Date;
  readonly acceptedAt?: Date;
  readonly removedAt?: Date;
}

export function buildCollaboratorProjection(events: CollaboratorEvent[]): CollaboratorProjection[] {
  const collabMap = new Map<string, CollaboratorProjection>();
  
  for (const event of events) {
    switch (event.type) {
      case 'collaborator.invited':
        collabMap.set(event.payload.collaboratorId, {
          collaboratorId: event.payload.collaboratorId,
          userId: event.payload.userId,
          resourceType: event.payload.resourceType,
          resourceId: event.payload.resourceId,
          role: event.payload.role,
          status: 'invited',
          invitedAt: event.payload.invitedAt,
        });
        break;
      case 'collaborator.accepted':
        const invited = collabMap.get(event.payload.collaboratorId);
        if (invited) {
          collabMap.set(event.payload.collaboratorId, {
            ...invited,
            status: 'active',
            acceptedAt: event.payload.acceptedAt,
          });
        }
        break;
      case 'collaborator.removed':
        const active = collabMap.get(event.payload.collaboratorId);
        if (active) {
          collabMap.set(event.payload.collaboratorId, {
            ...active,
            status: 'removed',
            removedAt: event.payload.removedAt,
          });
        }
        break;
    }
  }
  
  return Array.from(collabMap.values());
}
