export interface IdentityContext {
  tenantId?: string | null;
  userId?: string | null;
  roles?: string[];
  permissions?: string[];
  scopes?: string[];
  correlationId?: string;
  attributes?: Record<string, unknown>;
  // GitHub alignment fields
  organization?: string;
  team?: string;
  repository?: string;
  role?: string;
}

export interface SessionContext extends IdentityContext {
  sessionId?: string;
  deviceId?: string;
  deviceInfo?: {
    userAgent?: string;
    platform?: string;
    language?: string;
  };
  issuedAt?: string;
  expiresAt?: string;
  refreshToken?: string;
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
