/**
 * Organization Entity Decisions
 * 
 * Pure functions for organization business rules.
 */

/**
 * Decision: Can an organization be created?
 */
export function decideCanCreateOrg(params: {
  name: string;
  ownerId: string;
  existingOrgNames: string[];
}): { allowed: boolean; reason?: string } {
  if (!params.name || params.name.trim().length === 0) {
    return { allowed: false, reason: 'Organization name is required' };
  }

  if (!params.ownerId) {
    return { allowed: false, reason: 'Owner ID is required' };
  }

  if (params.existingOrgNames.includes(params.name)) {
    return { allowed: false, reason: 'Organization name already exists' };
  }

  return { allowed: true };
}

/**
 * Decision: Can an organization be modified?
 */
export function decideCanModifyOrg(params: {
  orgId: string;
  userId: string;
  userRole: string;
}): { allowed: boolean; reason?: string } {
  if (!params.orgId) {
    return { allowed: false, reason: 'Organization ID is required' };
  }

  // Add role-based authorization checks
  if (params.userRole !== 'owner' && params.userRole !== 'admin') {
    return { allowed: false, reason: 'Insufficient permissions' };
  }

  return { allowed: true };
}
