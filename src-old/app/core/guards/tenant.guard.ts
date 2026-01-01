import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { TenantContextService, TenantType } from '../services/tenant/tenant-context.service';

type TenantTypeInput = TenantType | TenantType[] | undefined;

function matchesTenantType(current: TenantType, expected: TenantTypeInput): boolean {
  if (!expected) return true;
  if (!current) return false;
  return Array.isArray(expected) ? expected.includes(current) : current === expected;
}

/**
 * Tenant guard ensures a tenant is present (and optionally of a given type).
 */
export const tenantGuard: CanActivateFn = route => {
  const router = inject(Router);
  const tenantContext = inject(TenantContextService);

  const tenantId = tenantContext.currentTenantId();
  const tenantType = tenantContext.currentTenantType();
  const expectedType = route.data?.['tenantType'] as TenantTypeInput;

  if (!tenantId) {
    return router.parseUrl('/exception/403');
  }

  return matchesTenantType(tenantType, expectedType) ? true : router.parseUrl('/exception/403');
};
