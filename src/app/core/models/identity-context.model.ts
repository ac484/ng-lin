export interface IdentityContext {
  tenantId?: string | null;
  userId?: string | null;
  roles?: string[];
  permissions?: string[];
  scopes?: string[];
  correlationId?: string;
  attributes?: Record<string, unknown>;
}

export interface SessionContext extends IdentityContext {
  sessionId?: string;
  deviceId?: string;
  issuedAt?: string;
  expiresAt?: string;
}

export interface ContextProvider {
  getIdentityContext(): IdentityContext;
  updateContext(context: Partial<IdentityContext>): IdentityContext;
  clearContext(): void;
  ensureCorrelationId(): string;
}

export interface ContextGuard {
  ensureContext(): IdentityContext;
}
