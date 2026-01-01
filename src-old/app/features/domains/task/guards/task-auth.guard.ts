/**
 * Task Auth Guard
 * 
 * Route guard for task-related routes.
 * Ensures users are authenticated and authorized to access task features.
 * 
 * Multi-tenant access control:
 * - Organization-level: User must belong to the organization
 * - Team-level: User must be a member of the team
 * - Task-level: User must be creator or assignee (for detail views)
 * 
 * @example
 * ```typescript
 * // In routes.ts
 * {
 *   path: 'tasks',
 *   canActivate: [TaskAuthGuard],
 *   children: [
 *     { path: '', component: TaskListComponent },
 *     { path: ':id', component: TaskDetailComponent }
 *   ]
 * }
 * ```
 */

import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateFn } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { map, take } from 'rxjs/operators';

/**
 * Task route authentication guard
 * 
 * Checks if user is authenticated before allowing access to task routes.
 * Redirects to login page if not authenticated.
 */
export const taskAuthGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const auth = inject(Auth);
  const router = inject(Router);

  return authState(auth).pipe(
    take(1),
    map(user => {
      if (user) {
        // User is authenticated
        return true;
      }

      // User is not authenticated - redirect to login
      console.warn('Access denied - user not authenticated');
      router.navigate(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    })
  );
};

/**
 * Task organization access guard
 * 
 * Checks if user has access to organization tasks.
 * Used for organization-level task routes.
 */
export const taskOrgAccessGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const auth = inject(Auth);
  const router = inject(Router);

  return authState(auth).pipe(
    take(1),
    map(user => {
      if (!user) {
        // Not authenticated
        router.navigate(['/auth/login'], {
          queryParams: { returnUrl: state.url }
        });
        return false;
      }

      // Get organization ID from route params or query
      const orgId = route.params['orgId'] || route.queryParams['orgId'];

      if (!orgId) {
        // No organization specified - allow access to general task list
        return true;
      }

      // TODO: Check if user belongs to the organization
      // This requires querying user's organization memberships from Firestore
      // For now, allow access if authenticated
      console.log('Checking organization access for:', orgId);
      return true;
    })
  );
};

/**
 * Task team access guard
 * 
 * Checks if user has access to team tasks.
 * Used for team-level task routes.
 */
export const taskTeamAccessGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const auth = inject(Auth);
  const router = inject(Router);

  return authState(auth).pipe(
    take(1),
    map(user => {
      if (!user) {
        // Not authenticated
        router.navigate(['/auth/login'], {
          queryParams: { returnUrl: state.url }
        });
        return false;
      }

      // Get team ID from route params or query
      const teamId = route.params['teamId'] || route.queryParams['teamId'];

      if (!teamId) {
        // No team specified - allow access to general task list
        return true;
      }

      // TODO: Check if user is a member of the team
      // This requires querying user's team memberships from Firestore
      // For now, allow access if authenticated
      console.log('Checking team access for:', teamId);
      return true;
    })
  );
};

/**
 * Task detail access guard
 * 
 * Checks if user has access to view a specific task.
 * Users can access tasks if they are:
 * - The creator of the task
 * - Assigned to the task
 * - A member of the organization/team that owns the task
 */
export const taskDetailAccessGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const auth = inject(Auth);
  const router = inject(Router);

  return authState(auth).pipe(
    take(1),
    map(user => {
      if (!user) {
        // Not authenticated
        router.navigate(['/auth/login'], {
          queryParams: { returnUrl: state.url }
        });
        return false;
      }

      // Get task ID from route params
      const taskId = route.params['id'];

      if (!taskId) {
        // No task ID - invalid route
        router.navigate(['/tasks']);
        return false;
      }

      // TODO: Check if user has access to this specific task
      // This requires:
      // 1. Fetching task details from Firestore
      // 2. Checking if user is creator or assignee
      // 3. Checking if user is member of task's org/team
      // For now, allow access if authenticated
      console.log('Checking task access for:', taskId);
      return true;
    })
  );
};

/**
 * Task edit permission guard
 * 
 * Checks if user has permission to edit a task.
 * Only task creator and assignee can edit.
 */
export const taskEditPermissionGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const auth = inject(Auth);
  const router = inject(Router);

  return authState(auth).pipe(
    take(1),
    map(user => {
      if (!user) {
        // Not authenticated
        router.navigate(['/auth/login'], {
          queryParams: { returnUrl: state.url }
        });
        return false;
      }

      // Get task ID from route params
      const taskId = route.params['id'];

      if (!taskId) {
        // No task ID - invalid route
        router.navigate(['/tasks']);
        return false;
      }

      // TODO: Check if user has edit permission for this task
      // This requires:
      // 1. Fetching task details from Firestore
      // 2. Checking if user is creator or assignee
      // For now, allow access if authenticated
      console.log('Checking task edit permission for:', taskId);
      return true;
    })
  );
};

/**
 * Helper function to check organization membership
 * 
 * @param userId - User ID to check
 * @param orgId - Organization ID
 * @returns Promise resolving to true if user is member
 */
export async function checkOrganizationMembership(
  userId: string,
  orgId: string
): Promise<boolean> {
  // TODO: Implement Firestore query to check membership
  // Query: organizations/{orgId}/members/{userId}
  console.log('Checking org membership:', { userId, orgId });
  return true;
}

/**
 * Helper function to check team membership
 * 
 * @param userId - User ID to check
 * @param teamId - Team ID
 * @returns Promise resolving to true if user is member
 */
export async function checkTeamMembership(
  userId: string,
  teamId: string
): Promise<boolean> {
  // TODO: Implement Firestore query to check membership
  // Query: teams/{teamId}/members/{userId}
  console.log('Checking team membership:', { userId, teamId });
  return true;
}

/**
 * Helper function to check task access permission
 * 
 * @param userId - User ID to check
 * @param taskId - Task ID
 * @returns Promise resolving to true if user has access
 */
export async function checkTaskAccessPermission(
  userId: string,
  taskId: string
): Promise<boolean> {
  // TODO: Implement Firestore query to check permission
  // Query: tasks/{taskId} and check creatorId, assigneeId, orgId, teamId
  console.log('Checking task access:', { userId, taskId });
  return true;
}
