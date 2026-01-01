import { Injectable, computed, signal } from '@angular/core';
import { AccessCheckContext, CoreRole, PermissionRequirement, satisfiesPermissionRequirement } from '../../models/permission.model';

/**
 * Minimal permission service (signals) for cross-feature reuse.
 */
@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly permissions = signal<Set<string>>(new Set());
  private readonly roles = signal<Set<CoreRole>>(new Set());

  readonly permissionList = computed(() => Array.from(this.permissions()));
  readonly roleList = computed(() => Array.from(this.roles()));

  setPermissions(perms: string[]): void {
    this.permissions.set(new Set(perms));
  }

  setRoles(nextRoles: CoreRole[]): void {
    this.roles.set(new Set(nextRoles));
  }

  add(permission: string): void {
    this.permissions.update(set => {
      const next = new Set(set);
      next.add(permission);
      return next;
    });
  }

  remove(permission: string): void {
    this.permissions.update(set => {
      const next = new Set(set);
      next.delete(permission);
      return next;
    });
  }

  has(permission: string): boolean {
    return this.permissions().has(permission);
  }

  addRole(role: CoreRole): void {
    this.roles.update(set => {
      const next = new Set(set);
      next.add(role);
      return next;
    });
  }

  removeRole(role: CoreRole): void {
    this.roles.update(set => {
      const next = new Set(set);
      next.delete(role);
      return next;
    });
  }

  hasRole(role: CoreRole): boolean {
    return this.roles().has(role);
  }

  hasAnyRole(required: CoreRole[] | undefined): boolean {
    if (!required?.length) return true;
    const owned = this.roles();
    return required.some(role => owned.has(role));
  }

  /**
   * Hybrid RBAC + ABAC check
   * - Roles: intersects with requiredRoles
   * - Permissions: evaluated via satisfiesPermissionRequirement
   * - Attributes: passthrough for future ABAC engine (no-op here)
   */
  canAccess(context: AccessCheckContext): boolean {
    const rolesOk = this.hasAnyRole(context.requiredRoles);
    const permReq = context.requiredPermissions;
    const permissionsOk = permReq
      ? satisfiesPermissionRequirement(this.permissionList(), permReq)
      : true;

    // Attributes are reserved for future ABAC backends; treated as neutral here.
    return rolesOk && permissionsOk;
  }
}
