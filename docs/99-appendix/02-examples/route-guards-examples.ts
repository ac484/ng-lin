/**
 * Example Route Configuration with Auth Guards
 *
 * This file demonstrates various ways to protect routes using Firebase Auth
 * integration with @delon/auth guards.
 */

import { Routes } from '@angular/router';
import { PermissionAction } from '@core/governance/authorization';
import { authGuard, requireRoles, requirePermission, guestGuard } from '@core/guards';
import { authSimpleCanActivate } from '@delon/auth';

/**
 * Application Routes with Authentication Examples
 */
export const routes: Routes = [
  // ======================
  // Public Routes (No Auth)
  // ======================
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },

  // ======================
  // Guest-Only Routes
  // ======================
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component'),
        canActivate: [guestGuard] // Redirect to home if already logged in
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component'),
        canActivate: [guestGuard]
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/forgot-password/forgot-password.component'),
        canActivate: [guestGuard]
      }
    ]
  },

  // ======================
  // Protected Routes (Basic Auth)
  // ======================
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component'),
    canActivate: [authGuard] // Basic authentication check
  },

  // Using @delon's built-in guard (equivalent to authGuard)
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component'),
    canActivate: [authSimpleCanActivate]
  },

  // ======================
  // Role-Based Routes
  // ======================
  {
    path: 'admin',
    canActivate: [requireRoles(['admin'])], // Only admins
    children: [
      {
        path: '',
        loadComponent: () => import('./features/admin/admin-dashboard.component')
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/user-management.component')
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/admin/admin-settings.component')
      }
    ]
  },

  // Editor role (admin OR editor)
  {
    path: 'editor',
    loadComponent: () => import('./features/editor/editor.component'),
    canActivate: [requireRoles(['admin', 'editor'])]
  },

  // Multiple roles required
  {
    path: 'moderation',
    loadComponent: () => import('./features/moderation/moderation.component'),
    canActivate: [requireRoles(['admin', 'moderator'])]
  },

  // ======================
  // Permission-Based Routes
  // ======================
  {
    path: 'issues',
    children: [
      // List - requires READ permission
      {
        path: '',
        loadComponent: () => import('./features/issue/issue-list.component'),
        canActivate: [authGuard] // All authenticated users can list
      },

      // View - requires READ permission
      {
        path: ':id',
        loadComponent: () => import('./features/issue/issue-detail.component'),
        canActivate: [requirePermission(PermissionAction.READ, 'issue')]
      },

      // Create - requires CREATE permission
      {
        path: 'new',
        loadComponent: () => import('./features/issue/issue-create.component'),
        canActivate: [requirePermission(PermissionAction.CREATE, 'issue')]
      },

      // Edit - requires UPDATE permission
      {
        path: ':id/edit',
        loadComponent: () => import('./features/issue/issue-edit.component'),
        canActivate: [requirePermission(PermissionAction.UPDATE, 'issue')]
      },

      // Delete - requires DELETE permission
      {
        path: ':id/delete',
        loadComponent: () => import('./features/issue/issue-delete.component'),
        canActivate: [requirePermission(PermissionAction.DELETE, 'issue')]
      }
    ]
  },

  // Projects with custom resource ID parameter
  {
    path: 'projects',
    children: [
      {
        path: ':projectId',
        loadComponent: () => import('./features/project/project-detail.component'),
        canActivate: [requirePermission(PermissionAction.READ, 'project', 'projectId')]
      },
      {
        path: ':projectId/settings',
        loadComponent: () => import('./features/project/project-settings.component'),
        canActivate: [requirePermission(PermissionAction.UPDATE, 'project', 'projectId')]
      }
    ]
  },

  // ======================
  // Nested Routes with Multiple Guards
  // ======================
  {
    path: 'organization',
    canActivate: [authGuard], // Parent requires auth
    children: [
      {
        path: '',
        loadComponent: () => import('./features/organization/organization-home.component')
      },
      {
        path: 'members',
        loadComponent: () => import('./features/organization/members.component'),
        canActivate: [requireRoles(['admin', 'owner'])] // Child requires specific roles
      },
      {
        path: 'billing',
        loadComponent: () => import('./features/organization/billing.component'),
        canActivate: [requireRoles(['owner'])] // Only owners can access billing
      }
    ]
  },

  // ======================
  // Lazy-Loaded Modules with Guards
  // ======================
  {
    path: 'reports',
    loadChildren: () => import('./features/reports/reports.routes'),
    canActivate: [requireRoles(['admin', 'analyst'])]
  },

  // ======================
  // Error Pages
  // ======================
  {
    path: 'forbidden',
    loadComponent: () => import('./shared-ui/error-pages/forbidden.component')
  },
  {
    path: 'not-found',
    loadComponent: () => import('./shared-ui/error-pages/not-found.component')
  },

  // ======================
  // Catch-All (404)
  // ======================
  {
    path: '**',
    redirectTo: '/not-found'
  }
];

/**
 * Example: Lazy-Loaded Reports Module Routes
 *
 * File: src/app/features/reports/reports.routes.ts
 */
export const reportsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./reports-dashboard.component')
  },
  {
    path: 'sales',
    loadComponent: () => import('./sales-report.component'),
    canActivate: [requirePermission(PermissionAction.READ, 'report')]
  },
  {
    path: 'analytics',
    loadComponent: () => import('./analytics-report.component'),
    canActivate: [requireRoles(['admin', 'analyst'])]
  }
];

/**
 * Guard Usage Summary
 *
 * 1. authGuard
 *    - Basic authentication check
 *    - Use for any route that requires login
 *
 * 2. authSimpleCanActivate
 *    - @delon's built-in guard
 *    - Equivalent to authGuard
 *    - Integrates with DA_SERVICE_TOKEN
 *
 * 3. requireRoles(['role1', 'role2'])
 *    - Checks if user has ANY of the specified roles
 *    - Use for role-based access control
 *
 * 4. requirePermission(action, resourceType, resourceIdParam?)
 *    - Checks if user has permission for specific action on resource
 *    - Use for fine-grained permission control
 *    - resourceIdParam defaults to 'id'
 *
 * 5. guestGuard
 *    - Allows only unauthenticated users
 *    - Use for login/register pages
 *    - Redirects authenticated users to home
 */

/**
 * Best Practices
 *
 * 1. Place most restrictive guards on parent routes
 * 2. Use canActivateChild for protecting all child routes
 * 3. Combine guards when needed (auth + role/permission)
 * 4. Always have a fallback route (404)
 * 5. Test guards with different user roles/permissions
 * 6. Use lazy loading for large feature modules
 * 7. Keep guard logic simple and focused
 */

/**
 * Component Usage Examples
 */

// Example: Check permissions in component
/*
import { Component, inject, computed } from '@angular/core';
import { AuthorizationService, Resource, PermissionAction } from '@core/governance/authorization';

@Component({
  selector: 'app-issue-detail',
  template: `
    @if (canEdit()) {
      <button (click)="edit()">Edit</button>
    }
    @if (canDelete()) {
      <button (click)="delete()">Delete</button>
    }
  `
})
export class IssueDetailComponent {
  private authService = inject(AuthorizationService);
  private issueId = input.required<string>();

  canEdit = computed(() => 
    this.authService.can(
      PermissionAction.UPDATE,
      new Resource({ type: 'issue', id: this.issueId() })
    )
  );

  canDelete = computed(() =>
    this.authService.can(
      PermissionAction.DELETE,
      new Resource({ type: 'issue', id: this.issueId() })
    )
  );
}
*/

/**
 * Testing Routes with Guards
 */

// Example: Testing component with auth guard
/*
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthorizationService } from '@core/governance/authorization';
import { signal } from '@angular/core';

describe('DashboardComponent with authGuard', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let router: Router;
  let mockAuthService: jasmine.SpyObj<AuthorizationService>;

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj('AuthorizationService', ['requireAuth']);
    mockAuthService.requireAuth.and.returnValue({ isOk: () => true });

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthorizationService, useValue: mockAuthService }
      ]
    });

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(DashboardComponent);
  });

  it('should allow access when authenticated', async () => {
    await router.navigate(['/dashboard']);
    expect(mockAuthService.requireAuth).toHaveBeenCalled();
  });

  it('should redirect to login when not authenticated', async () => {
    mockAuthService.requireAuth.and.returnValue({ isErr: () => true });
    await router.navigate(['/dashboard']);
    expect(router.url).toBe('/auth/login');
  });
});
*/
