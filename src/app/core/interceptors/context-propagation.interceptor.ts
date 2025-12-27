import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { IdentityContextService } from '../services/identity-context.service';

export const contextPropagationInterceptor: HttpInterceptorFn = (req, next) => {
  const identity = inject(IdentityContextService);
  const context = identity.getContext();

  const headers: Record<string, string> = {};

  if (context.tenantId && !req.headers.has('X-Tenant-Id')) {
    headers['X-Tenant-Id'] = context.tenantId;
  }

  if (context.userId && !req.headers.has('X-User-Id')) {
    headers['X-User-Id'] = context.userId;
  }

  if (context.correlationId && !req.headers.has('X-Correlation-Id')) {
    headers['X-Correlation-Id'] = context.correlationId;
  }

  if (context.roles.length && !req.headers.has('X-Roles')) {
    headers['X-Roles'] = context.roles.join(',');
  }

  if (context.permissions.length && !req.headers.has('X-Permissions')) {
    headers['X-Permissions'] = context.permissions.join(',');
  }

  if (Object.keys(headers).length === 0) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: headers
    })
  );
};
