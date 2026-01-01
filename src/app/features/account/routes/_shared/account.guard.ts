import { CanActivateFn } from '@angular/router';
import { authGuard } from '@core';

/**
 * Delegates to the core auth guard.
 */
export const accountGuard: CanActivateFn = authGuard;
