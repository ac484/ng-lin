/**
 * Collaborator Entity Read Models
 */

export interface CollaboratorModel {
  readonly id: string;
  readonly userId: string;
  readonly resourceType: 'org' | 'team' | 'task';
  readonly resourceId: string;
  readonly role: string;
  readonly status: 'invited' | 'active' | 'removed';
  readonly invitedAt: Date;
  readonly acceptedAt?: Date;
}
