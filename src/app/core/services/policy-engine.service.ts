import { Injectable, inject, signal, computed } from '@angular/core';
import { AuthFacade } from '../auth/auth.facade';
import { TenantContextService } from './tenant/tenant-context.service';
import { PermissionService } from './permission/permission.service';
import {
  PolicyRule,
  PolicyContext,
  PolicyEvaluationResult,
  evaluatePolicyRule,
  AttributeType,
  AttributeOperator,
  LogicOperator
} from '../models/abac.model';
import { Role, RoleType, roleIncludes } from '../models/rbac.model';

/**
 * Policy Decision Point (PDP)
 * IDCTX-P2-002: ABAC rule engine
 * IDCTX-P2-004: Policy Decision Point implementation
 * 
 * Evaluates access requests against RBAC roles and ABAC policies
 */
@Injectable({ providedIn: 'root' })
export class PolicyEngineService {
  private readonly auth = inject(AuthFacade);
  private readonly tenantContext = inject(TenantContextService);
  private readonly permissionService = inject(PermissionService);
  
  // Policy storage (in production, load from Firestore)
  private readonly policies = signal<PolicyRule[]>([]);
  private readonly roles = signal<Role[]>([]);
  
  readonly activePolicies = computed(() => 
    this.policies().filter(p => p.isActive !== false)
  );
  
  /**
   * Evaluate if user can perform action on resource
   */
  async canAccess(
    action: string,
    resourceType?: string,
    resourceId?: string,
    context?: Partial<PolicyContext>
  ): Promise<PolicyEvaluationResult> {
    const evalContext = await this.buildContext(action, resourceType, resourceId, context);
    
    // First check RBAC permissions
    const rbacResult = this.evaluateRBAC(action, evalContext);
    if (!rbacResult.allowed) {
      return rbacResult;
    }
    
    // Then check ABAC policies
    return this.evaluateABAC(action, evalContext);
  }
  
  /**
   * Build evaluation context from current state
   */
  private async buildContext(
    action: string,
    resourceType?: string,
    resourceId?: string,
    partial?: Partial<PolicyContext>
  ): Promise<PolicyContext> {
    const userId = this.auth.getCurrentUserId();
    const tenantId = this.tenantContext.getTenantId();
    const permissions = this.permissionService.permissionList();
    
    return {
      user: {
        userId: userId ?? undefined,
        roles: partial?.user?.roles || [],
        permissions,
        clearance: partial?.user?.clearance,
        attributes: partial?.user?.attributes || {}
      },
      resource: {
        type: resourceType,
        id: resourceId,
        owner: partial?.resource?.owner,
        tags: partial?.resource?.tags || [],
        attributes: partial?.resource?.attributes || {}
      },
      environment: {
        timestamp: new Date(),
        ipAddress: partial?.environment?.ipAddress,
        location: partial?.environment?.location,
        attributes: partial?.environment?.attributes || {}
      },
      tenant: {
        tenantId: tenantId ?? undefined,
        subscription: partial?.tenant?.subscription,
        attributes: partial?.tenant?.attributes || {}
      },
      action: {
        operation: action,
        severity: partial?.action?.severity,
        attributes: partial?.action?.attributes || {}
      }
    };
  }
  
  /**
   * Evaluate RBAC permissions
   */
  private evaluateRBAC(
    action: string,
    context: PolicyContext
  ): PolicyEvaluationResult {
    const userPermissions = new Set(context.user.permissions || []);
    
    // Check if user has direct permission
    if (userPermissions.has(action)) {
      return {
        allowed: true,
        matchedRules: ['rbac:direct-permission'],
        reason: `User has direct permission: ${action}`
      };
    }
    
    // Check role-based permissions
    const userRoles = context.user.roles || [];
    for (const roleId of userRoles) {
      const role = this.roles().find(r => r.id === roleId);
      if (role?.permissions.includes(action)) {
        return {
          allowed: true,
          matchedRules: [`rbac:role:${roleId}`],
          reason: `Permission granted by role: ${role.name}`
        };
      }
    }
    
    return {
      allowed: false,
      matchedRules: [],
      reason: 'No RBAC permission found'
    };
  }
  
  /**
   * Evaluate ABAC policies
   */
  private evaluateABAC(
    action: string,
    context: PolicyContext
  ): PolicyEvaluationResult {
    const applicable = this.activePolicies().filter(p => 
      p.actions.includes(action) || p.actions.includes('*')
    );
    
    // Sort by priority (higher first)
    applicable.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    
    const matchedAllows: string[] = [];
    
    for (const policy of applicable) {
      const matches = evaluatePolicyRule(policy, context);
      
      if (matches && policy.effect === 'deny') {
        return {
          allowed: false,
          matchedRules: [policy.id],
          deniedBy: policy.id,
          reason: policy.description || `Denied by policy: ${policy.name}`
        };
      }
      
      if (matches && policy.effect === 'allow') {
        matchedAllows.push(policy.id);
      }
    }
    
    if (matchedAllows.length > 0) {
      return {
        allowed: true,
        matchedRules: matchedAllows,
        reason: 'Allowed by ABAC policies'
      };
    }
    
    return {
      allowed: false,
      matchedRules: [],
      reason: 'No matching ABAC policy found'
    };
  }
  
  /**
   * Add policy to engine
   */
  addPolicy(policy: PolicyRule): void {
    this.policies.update(policies => [...policies, policy]);
  }
  
  /**
   * Remove policy from engine
   */
  removePolicy(policyId: string): void {
    this.policies.update(policies => policies.filter(p => p.id !== policyId));
  }
  
  /**
   * Add role definition
   */
  addRole(role: Role): void {
    this.roles.update(roles => [...roles, role]);
  }
  
  /**
   * Initialize default GitHub-aligned policies
   */
  initializeDefaultPolicies(): void {
    // Example: Require elevated clearance for restricted resources
    this.addPolicy({
      id: 'pol-001-restricted-access',
      name: 'Restricted Resource Access',
      description: 'Require confidential clearance for restricted resources',
      effect: 'deny',
      conditions: {
        logic: LogicOperator.AND,
        rules: [
          {
            type: AttributeType.RESOURCE,
            key: 'tags',
            operator: AttributeOperator.CONTAINS,
            value: 'restricted'
          },
          {
            type: AttributeType.USER,
            key: 'clearance',
            operator: AttributeOperator.NOT_EQUALS,
            value: 'restricted'
          }
        ]
      },
      actions: ['read', 'write', 'delete'],
      priority: 100,
      isActive: true
    });
    
    // Example: Cross-tenant access prevention
    this.addPolicy({
      id: 'pol-002-tenant-isolation',
      name: 'Tenant Isolation',
      description: 'Prevent cross-tenant access',
      effect: 'deny',
      conditions: {
        logic: LogicOperator.AND,
        rules: [
          {
            type: AttributeType.TENANT,
            key: 'tenantId',
            operator: AttributeOperator.EXISTS,
            value: true
          },
          {
            type: AttributeType.RESOURCE,
            key: 'attributes.tenantId',
            operator: AttributeOperator.NOT_EQUALS,
            value: '{{tenant.tenantId}}' // Will be evaluated at runtime
          }
        ]
      },
      actions: ['*'],
      priority: 200,
      isActive: true
    });
  }
}
