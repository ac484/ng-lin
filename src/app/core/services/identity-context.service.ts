import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { AuthFacade } from '../auth';
import { ContextProvider, IdentityContext, SessionContext } from '../models/identity-context.model';
import { TenantContextService } from './tenant/tenant-context.service';

function generateCorrelationId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `cid-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

function generateDeviceId(): string {
  // Try to get from localStorage first for device consistency
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('device-id') : null;
  if (stored) return stored;
  
  const deviceId = `dev-${Math.random().toString(36).slice(2)}-${Date.now()}`;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('device-id', deviceId);
  }
  return deviceId;
}

function getDeviceInfo() {
  if (typeof navigator === 'undefined') return undefined;
  
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language
  };
}

/**
 * Identity Context Service
 * IDCTX-P1-004: Attach tenant/device context to session payload
 */
@Injectable({ providedIn: 'root' })
export class IdentityContextService implements ContextProvider {
  private readonly auth = inject(AuthFacade);
  private readonly tenantContext = inject(TenantContextService);
  private readonly session = signal<SessionContext>({
    correlationId: generateCorrelationId(),
    deviceId: generateDeviceId(),
    deviceInfo: getDeviceInfo(),
    issuedAt: new Date().toISOString()
  });

  readonly identityContext = computed(() => this.getIdentityContext());

  constructor() {
    effect(() => {
      const user = this.auth.currentUserSignal();
      if (user?.uid) {
        this.updateContext({ userId: user.uid });
      }
    });

    effect(() => {
      const tenantId = this.tenantContext.getTenantId();
      if (tenantId) {
        this.updateContext({ tenantId });
      }
    });
  }

  ensureCorrelationId(): string {
    const current = this.session().correlationId;
    if (current) return current;

    const fresh = generateCorrelationId();
    this.session.update(ctx => ({ ...ctx, correlationId: fresh }));
    return fresh;
  }

  getIdentityContext(): IdentityContext {
    const current = this.session();
    const tenantId = current.tenantId ?? this.tenantContext.getTenantId();
    const userId = current.userId ?? this.auth.getCurrentUserId();

    return {
      ...current,
      tenantId,
      userId,
      correlationId: current.correlationId ?? this.ensureCorrelationId()
    };
  }

  updateContext(context: Partial<IdentityContext>): IdentityContext {
    this.session.update(existing => ({
      ...existing,
      ...context,
      correlationId: context.correlationId ?? existing.correlationId ?? generateCorrelationId()
    }));
    return this.getIdentityContext();
  }

  clearContext(): void {
    this.session.set({ 
      correlationId: generateCorrelationId(),
      deviceId: generateDeviceId(),
      deviceInfo: getDeviceInfo(),
      issuedAt: new Date().toISOString()
    });
  }

  buildPropagationHeaders(): Record<string, string> {
    const ctx = this.getIdentityContext();
    const headers: Record<string, string> = {};

    if (ctx.correlationId) headers['X-Correlation-Id'] = ctx.correlationId;
    if (ctx.tenantId) headers['X-Tenant-Id'] = ctx.tenantId;
    if (ctx.userId) headers['X-User-Id'] = ctx.userId;
    if (ctx.roles?.length) headers['X-Roles'] = ctx.roles.join(',');
    if (ctx.permissions?.length) headers['X-Permissions'] = ctx.permissions.join(',');
    if (ctx.scopes?.length) headers['X-Scopes'] = ctx.scopes.join(' ');

    return headers;
  }
}
