/**
 * Collaborator Entity Decisions
 */

export function decideCanInviteCollaborator(params: {
  userId: string;
  resourceId: string;
  inviterRole: string;
}): { allowed: boolean; reason?: string } {
  if (!params.userId) {
    return { allowed: false, reason: 'User ID is required' };
  }
  if (!params.resourceId) {
    return { allowed: false, reason: 'Resource ID is required' };
  }
  return { allowed: true };
}

export function decideCanModifyCollaborator(params: {
  collaboratorId: string;
  userId: string;
  userRole: string;
}): { allowed: boolean; reason?: string } {
  if (!params.collaboratorId) {
    return { allowed: false, reason: 'Collaborator ID is required' };
  }
  return { allowed: true };
}
