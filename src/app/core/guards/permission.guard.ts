import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { PermissionService } from '../services/permission/permission.service';
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
 * Accepts route data `requiredPermissions` as string[] or PermissionRequirement.
 */
export const permissionGuard: CanActivateFn = (route): boolean | UrlTree => {
  const router = inject(Router);
  const permissionService = inject(PermissionService);

  const requirement = normalizePermissionRequirement(
    (route.data?.['requiredPermissions'] as PermissionInput) ?? (route.data?.['permissions'] as PermissionInput)
  );

  if (!requirement) {
    return true;
  }

  const owned = permissionService.permissionList();
  const allowed = satisfiesPermissionRequirement(owned, requirement);

  return allowed ? true : router.parseUrl('/exception/403');
};
