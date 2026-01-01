import { TenantType } from '../services/tenant/tenant-context.service';

export interface GithubContextMapping {
  organization?: string | null;
  team?: string | null;
  repository?: string | null;
  role?: string | null;
}

export interface IdentityContext {
  tenantId: string | null;
  tenantType?: TenantType;
  userId: string | null;
  organizationId?: string | null;
  teamId?: string | null;
  repositoryId?: string | null;
  roles: string[];
  permissions: string[];
  scopes: string[];
  correlationId: string;
  github?: GithubContextMapping;
  extra?: Record<string, unknown>;
}

export interface SessionContext extends IdentityContext {
  requestId?: string;
  actorEmail?: string | null;
}

export interface ContextGuard {
  ensureContext(): IdentityContext;
}

export function createCorrelationId(): string {
  return `corr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}
