/**
 * RBAC (Role-Based Access Control) Models
 * IDCTX-P2-001: RBAC role model (org/blueprint/project hierarchy)
 * 
 * Aligned with GitHub control plane: Organization → Team → Repository
 */

/**
 * Role hierarchy levels aligned with GitHub structure
 */
export enum RoleLevel {
  /** Organization-level role (GitHub Owner/Member) */
  ORGANIZATION = 'organization',
  /** Team-level role (GitHub Team) */
  TEAM = 'team',
  /** Blueprint-level role (GitHub Repository) */
  BLUEPRINT = 'blueprint',
  /** Project-level role (GitHub Project/Issue) */
  PROJECT = 'project'
}

/**
 * Predefined role types aligned with GitHub repository roles
 */
export enum RoleType {
  /** Full admin control (GitHub Admin) */
  ADMIN = 'admin',
  /** Maintain but can't do sensitive operations (GitHub Maintain) */
  MAINTAIN = 'maintain',
  /** Can push code (GitHub Write) */
  WRITE = 'write',
  /** Can manage issues/PRs (GitHub Triage) */
  TRIAGE = 'triage',
  /** Read-only access (GitHub Read) */
  READ = 'read',
  /** No access */
  NONE = 'none'
}

/**
 * Organization-level roles (GitHub Organization)
 * Prefixed with GitHub to avoid naming conflicts
 */
export enum GitHubOrganizationRole {
  /** Organization owner - full control */
  OWNER = 'org:owner',
  /** Organization member - basic access */
  MEMBER = 'org:member',
  /** Billing manager - billing access only */
  BILLING_MANAGER = 'org:billing'
}

/**
 * Role definition with permissions
 */
export interface Role {
  readonly id: string;
  readonly name: string;
  readonly level: RoleLevel;
  readonly type: RoleType;
  readonly permissions: string[];
  readonly description?: string;
  readonly inheritsFrom?: string[];
  readonly isSystem?: boolean;
}

/**
 * User role assignment
 */
export interface UserRole {
  readonly userId: string;
  readonly roleId: string;
  readonly scope: {
    organizationId?: string;
    teamId?: string;
    blueprintId?: string;
    projectId?: string;
  };
  readonly grantedAt: Date;
  readonly grantedBy: string;
  readonly expiresAt?: Date;
}

/**
 * Permission scoped to a resource
 */
export interface ScopedPermission {
  readonly permission: string;
  readonly scope: {
    organizationId?: string;
    teamId?: string;
    blueprintId?: string;
    projectId?: string;
    resourceType?: string;
    resourceId?: string;
  };
}

/**
 * GitHub-aligned role hierarchy
 */
export const GITHUB_ROLE_HIERARCHY: Record<RoleType, RoleType[]> = {
  [RoleType.ADMIN]: [RoleType.MAINTAIN, RoleType.WRITE, RoleType.TRIAGE, RoleType.READ],
  [RoleType.MAINTAIN]: [RoleType.WRITE, RoleType.TRIAGE, RoleType.READ],
  [RoleType.WRITE]: [RoleType.TRIAGE, RoleType.READ],
  [RoleType.TRIAGE]: [RoleType.READ],
  [RoleType.READ]: [],
  [RoleType.NONE]: []
};

/**
 * Check if a role includes another role through hierarchy
 */
export function roleIncludes(role: RoleType, requiredRole: RoleType): boolean {
  if (role === requiredRole) return true;
  const inherited = GITHUB_ROLE_HIERARCHY[role] || [];
  return inherited.includes(requiredRole);
}

/**
 * Get all permissions for a role including inherited
 */
export function getRolePermissions(role: Role, allRoles: Role[]): string[] {
  const permissions = new Set(role.permissions);
  
  if (role.inheritsFrom) {
    for (const parentId of role.inheritsFrom) {
      const parent = allRoles.find(r => r.id === parentId);
      if (parent) {
        const parentPerms = getRolePermissions(parent, allRoles);
        parentPerms.forEach(p => permissions.add(p));
      }
    }
  }
  
  return Array.from(permissions);
}
