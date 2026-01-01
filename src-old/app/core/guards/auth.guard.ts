import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthFacade } from '../auth';

/**
 * Core auth guard backed by AuthFacade signals.
 */
export const authGuard: CanActivateFn = (_route, state): boolean | UrlTree => {
  const auth = inject(AuthFacade);
  const router = inject(Router);

  const authenticated = auth.isAuthenticated();
  if (authenticated) return true;

  const redirect = state.url ? `?redirect=${encodeURIComponent(state.url)}` : '';
  return router.parseUrl(`/passport/login${redirect}`);
};
