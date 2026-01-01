/**
 * User Entity Decisions
 * 
 * Pure functions that encapsulate business rules and decision logic
 * for user entity operations. All functions are deterministic.
 */

/**
 * Decision: Can a user be created with the given information?
 */
export function decideCanCreateUser(params: {
  email: string;
  displayName: string;
  existingEmails: string[];
}): { allowed: boolean; reason?: string } {
  if (!params.email || !params.email.includes('@')) {
    return { allowed: false, reason: 'Invalid email format' };
  }

  if (!params.displayName || params.displayName.trim().length === 0) {
    return { allowed: false, reason: 'Display name is required' };
  }

  if (params.existingEmails.includes(params.email)) {
    return { allowed: false, reason: 'Email already exists' };
  }

  return { allowed: true };
}

/**
 * Decision: Can a user profile be updated?
 */
export function decideCanUpdateUser(params: {
  userId: string;
  updates: Record<string, unknown>;
  currentUserRole: string;
}): { allowed: boolean; reason?: string } {
  if (!params.userId) {
    return { allowed: false, reason: 'User ID is required' };
  }

  if (Object.keys(params.updates).length === 0) {
    return { allowed: false, reason: 'No updates provided' };
  }

  // Add role-based checks here if needed
  return { allowed: true };
}

/**
 * Decision: Can a user account be deactivated?
 */
export function decideCanDeactivateUser(params: {
  userId: string;
  requestorRole: string;
}): { allowed: boolean; reason?: string } {
  if (!params.userId) {
    return { allowed: false, reason: 'User ID is required' };
  }

  // Add authorization checks here
  return { allowed: true };
}
