import { Injectable, computed, inject, signal } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { AuthFacade } from '../auth';
import { IdentityContext, SessionContext, createCorrelationId } from '../models/identity-context.model';
import { PermissionService } from './permission/permission.service';
import { TenantContextService } from './tenant/tenant-context.service';

function parseCustomClaims(claimsString?: string): Record<string, unknown> {
  if (!claimsString) return {};
  try {
    return JSON.parse(claimsString) as Record<string, unknown>;
  } catch {
    return {};
  }
}

@Injectable({ providedIn: 'root' })
export class IdentityContextService {
  private readonly auth = inject(AuthFacade);
  private readonly permissionService = inject(PermissionService);
  private readonly tenantContext = inject(TenantContextService);
  private readonly correlationId = signal(this.generateCorrelationId());

  private readonly identityContext = computed<IdentityContext>(() => {
    const tenantId = this.tenantContext.currentTenantId();
    const tenantType = this.tenantContext.currentTenantType();
    const roles = this.resolveRoles();
    const permissions = this.permissionService.permissionList();
    const userId = this.auth.getCurrentUserId();

    return {
      tenantId,
      tenantType,
      userId,
      organizationId: tenantType === 'organization' ? tenantId : null,
      teamId: tenantType === 'team' ? tenantId : null,
      repositoryId: null,
      roles,
      permissions,
      scopes: [],
      correlationId: this.correlationId(),
      github: {
        organization: tenantType === 'organization' ? tenantId : undefined,
        team: tenantType === 'team' ? tenantId : undefined,
        repository: null,
        role: roles[0] ?? null
      }
    };
  });

  getContext(): IdentityContext {
    return this.identityContext();
  }

  getSessionContext(): SessionContext {
    const base = this.identityContext();
    const user = this.auth.currentUser;
    return {
      ...base,
      actorEmail: user?.email ?? null,
      requestId: base.correlationId
    };
  }

  refreshCorrelationId(): string {
    const next = this.generateCorrelationId();
    this.correlationId.set(next);
    return next;
  }

  private resolveRoles(): string[] {
    const user = this.auth.currentUser as any;
    if (!user) return [];

    const customClaims = parseCustomClaims(user?.reloadUserInfo?.customAttributes);
    const roles = customClaims['roles'];
    if (Array.isArray(roles)) {
      return roles.filter(role => typeof role === 'string');
    }

    const singleRole = customClaims['role'];
    if (typeof singleRole === 'string' && singleRole.length > 0) {
      return [singleRole];
    }

    return [];
  }

  private generateCorrelationId(): string {
    try {
      return uuidv4();
    } catch {
      return createCorrelationId();
    }
  }
}
