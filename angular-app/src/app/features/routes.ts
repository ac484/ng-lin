import { Routes } from '@angular/router';

export const routes: Routes = [
  // passport - lazy loaded (features/auth)
  { path: '', loadChildren: () => import('./auth/routes').then(m => m.routes) },
  // exception - lazy loaded
  { path: 'exception', loadChildren: () => import('./exception/routes').then(m => m.routes) },
  // 404 fallback
  { path: '**', redirectTo: 'exception/404' }
];

