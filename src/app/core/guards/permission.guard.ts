import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { PermissionService } from '../services/permission/permission.service';
import { PolicyEngineService } from '../services/policy-engine.service';
import { PermissionRequirement, satisfiesPermissionRequirement } from '../models/permission.model';

type PermissionInput = string[] | PermissionRequirement | undefined;

function normalizePermissionRequirement(input: PermissionInput): PermissionRequirement | null {
  if (!input) return null;
  if (Array.isArray(input)) {
    return { anyOf: input };
  }
  return input;
}

/**
 * Permission guard backed by PermissionService signals.
 * IDCTX-P2-003: Update PermissionGuard to new RBAC/ABAC model
 * IDCTX-P2-004: Policy Enforcement Point (PEP) implementation
 * 
 * Accepts route data `requiredPermissions` as string[] or PermissionRequirement.
 * Optionally uses policy engine for ABAC evaluation via `useAbac: true` flag.
 */
export const permissionGuard: CanActivateFn = async (route): Promise<boolean | UrlTree> => {
  const router = inject(Router);
  const permissionService = inject(PermissionService);
  const policyEngine = inject(PolicyEngineService);

  const requirement = normalizePermissionRequirement(
    (route.data?.['requiredPermissions'] as PermissionInput) ?? (route.data?.['permissions'] as PermissionInput)
  );

  if (!requirement) {
    return true;
  }

  // Legacy RBAC check
  const owned = permissionService.permissionList();
  const rbacAllowed = satisfiesPermissionRequirement(owned, requirement);
  
  // If ABAC is enabled for this route, also check policies
  const useAbac = route.data?.['useAbac'] === true;
  if (useAbac && requirement.anyOf?.length) {
    // Check the first permission requirement via ABAC
    const action = requirement.anyOf[0];
    const resourceType = route.data?.['resourceType'] as string | undefined;
    const resourceId = route.data?.['resourceId'] as string | undefined;
    
    const result = await policyEngine.canAccess(action, resourceType, resourceId);
    
    if (!result.allowed) {
      console.warn(`Access denied by policy: ${result.reason}`, result);
      return router.parseUrl('/exception/403');
    }
  }

  return rbacAllowed ? true : router.parseUrl('/exception/403');
};
