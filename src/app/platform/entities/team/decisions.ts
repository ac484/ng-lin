/**
 * Team Entity Decisions
 */

export function decideCanCreateTeam(params: {
  name: string;
  orgId: string;
  userId: string;
}): { allowed: boolean; reason?: string } {
  if (!params.name?.trim()) {
    return { allowed: false, reason: 'Team name is required' };
  }
  if (!params.orgId) {
    return { allowed: false, reason: 'Organization ID is required' };
  }
  return { allowed: true };
}

export function decideCanModifyTeam(params: {
  teamId: string;
  userId: string;
  userRole: string;
}): { allowed: boolean; reason?: string } {
  if (!params.teamId) {
    return { allowed: false, reason: 'Team ID is required' };
  }
  return { allowed: true };
}
