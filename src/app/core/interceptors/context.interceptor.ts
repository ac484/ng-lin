import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { IdentityContextService } from '../services/identity-context.service';

/**
 * Propagate identity/session context with every HTTP request.
 * Preserves existing headers and only fills missing values.
 */
export const contextInterceptor: HttpInterceptorFn = (req, next) => {
  const contextService = inject(IdentityContextService);
  const propagation = contextService.buildPropagationHeaders();

  const setHeaders: Record<string, string> = {};
  for (const [key, value] of Object.entries(propagation)) {
    if (!value) continue;
    if (req.headers.has(key)) continue;
    setHeaders[key] = value;
  }

  const cloned = Object.keys(setHeaders).length ? req.clone({ setHeaders }) : req;
  return next(cloned);
};
