import { Routes } from '@angular/router';
import { authGuard, startPageGuard } from '@core';
import { LayoutBlankComponent } from '../layout';

export const routes: Routes = [
  // passport routes (public - no auth required)
  { path: '', loadChildren: () => import('./auth/routes').then(m => m.routes) },
  // Protected routes - require authentication
  {
    path: '',
    component: LayoutBlankComponent,
    canActivate: [startPageGuard, authGuard],
    canActivateChild: [authGuard],
    children: [
      // Dashboard/Home - redirect to blueprints when implemented
      { path: 'home', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', redirectTo: 'passport/login', pathMatch: 'full' }, // Temporary: redirect to login until dashboard is implemented
      // Future protected routes will be added here
      // Example: { path: 'blueprints', loadChildren: () => import('./blueprints/routes').then(m => m.routes) }
    ]
  },
  // exception - lazy loaded (public)
  { path: 'exception', loadChildren: () => import('./exception/routes').then(m => m.routes) },
  // 404 fallback
  { path: '**', redirectTo: 'exception/404' }
];

