/**
 * ABAC (Attribute-Based Access Control) Models
 * IDCTX-P2-002: ABAC rule engine (tenant, role, clearance, resource tags)
 * 
 * Supports fine-grained attribute-based policies aligned with GitHub Rulesets
 */

/**
 * Attribute types for ABAC evaluation
 */
export enum AttributeType {
  /** User attributes (userId, roles, clearance) */
  USER = 'user',
  /** Resource attributes (type, tags, owner) */
  RESOURCE = 'resource',
  /** Environment attributes (time, location, IP) */
  ENVIRONMENT = 'environment',
  /** Tenant attributes (tenantId, subscription) */
  TENANT = 'tenant',
  /** Action attributes (operation, severity) */
  ACTION = 'action'
}

/**
 * Comparison operators for attribute evaluation
 */
export enum AttributeOperator {
  EQUALS = 'eq',
  NOT_EQUALS = 'ne',
  IN = 'in',
  NOT_IN = 'nin',
  GREATER_THAN = 'gt',
  LESS_THAN = 'lt',
  CONTAINS = 'contains',
  MATCHES = 'matches', // regex
  EXISTS = 'exists'
}

/**
 * Attribute condition for policy evaluation
 */
export interface AttributeCondition {
  readonly type: AttributeType;
  readonly key: string;
  readonly operator: AttributeOperator;
  readonly value: unknown;
}

/**
 * Logical combination of conditions
 */
export enum LogicOperator {
  AND = 'and',
  OR = 'or',
  NOT = 'not'
}

/**
 * Policy rule with attribute conditions
 */
export interface PolicyRule {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly effect: 'allow' | 'deny';
  readonly conditions: {
    readonly logic: LogicOperator;
    readonly rules: AttributeCondition[];
  };
  readonly actions: string[];
  readonly resources?: string[];
  readonly priority?: number;
  readonly isActive?: boolean;
}

/**
 * Policy evaluation context
 */
export interface PolicyContext {
  readonly user: {
    userId?: string;
    roles?: string[];
    permissions?: string[];
    clearance?: string;
    attributes?: Record<string, unknown>;
  };
  readonly resource: {
    type?: string;
    id?: string;
    owner?: string;
    tags?: string[];
    attributes?: Record<string, unknown>;
  };
  readonly environment: {
    timestamp?: Date;
    ipAddress?: string;
    location?: string;
    attributes?: Record<string, unknown>;
  };
  readonly tenant: {
    tenantId?: string;
    subscription?: string;
    attributes?: Record<string, unknown>;
  };
  readonly action: {
    operation: string;
    severity?: string;
    attributes?: Record<string, unknown>;
  };
}

/**
 * Policy evaluation result
 */
export interface PolicyEvaluationResult {
  readonly allowed: boolean;
  readonly matchedRules: string[];
  readonly deniedBy?: string;
  readonly reason?: string;
}

/**
 * GitHub-aligned branch protection attributes
 */
export interface BranchProtectionAttributes {
  readonly branch: string;
  readonly requiredReviews?: number;
  readonly requiredStatusChecks?: string[];
  readonly restrictedUsers?: string[];
  readonly restrictedTeams?: string[];
  readonly dismissStaleReviews?: boolean;
  readonly requireCodeOwnerReviews?: boolean;
}

/**
 * Resource tags for classification
 */
export interface ResourceTags {
  readonly sensitivity?: 'public' | 'internal' | 'confidential' | 'restricted';
  readonly compliance?: string[];
  readonly department?: string;
  readonly project?: string;
  readonly custom?: Record<string, string>;
}

/**
 * User clearance level
 */
export enum ClearanceLevel {
  PUBLIC = 0,
  INTERNAL = 1,
  CONFIDENTIAL = 2,
  RESTRICTED = 3
}

/**
 * Evaluate attribute condition
 */
export function evaluateCondition(
  condition: AttributeCondition,
  context: PolicyContext
): boolean {
  const actualValue = getAttributeValue(condition.type, condition.key, context);
  
  switch (condition.operator) {
    case AttributeOperator.EQUALS:
      return actualValue === condition.value;
    case AttributeOperator.NOT_EQUALS:
      return actualValue !== condition.value;
    case AttributeOperator.IN:
      return Array.isArray(condition.value) && condition.value.includes(actualValue);
    case AttributeOperator.NOT_IN:
      return Array.isArray(condition.value) && !condition.value.includes(actualValue);
    case AttributeOperator.GREATER_THAN:
      return Number(actualValue) > Number(condition.value);
    case AttributeOperator.LESS_THAN:
      return Number(actualValue) < Number(condition.value);
    case AttributeOperator.CONTAINS:
      return String(actualValue).includes(String(condition.value));
    case AttributeOperator.MATCHES:
      return new RegExp(String(condition.value)).test(String(actualValue));
    case AttributeOperator.EXISTS:
      return actualValue !== undefined && actualValue !== null;
    default:
      return false;
  }
}

/**
 * Get attribute value from context
 */
function getAttributeValue(
  type: AttributeType,
  key: string,
  context: PolicyContext
): unknown {
  switch (type) {
    case AttributeType.USER:
      return (context.user as Record<string, unknown>)[key];
    case AttributeType.RESOURCE:
      return (context.resource as Record<string, unknown>)[key];
    case AttributeType.ENVIRONMENT:
      return (context.environment as Record<string, unknown>)[key];
    case AttributeType.TENANT:
      return (context.tenant as Record<string, unknown>)[key];
    case AttributeType.ACTION:
      return (context.action as Record<string, unknown>)[key];
    default:
      return undefined;
  }
}

/**
 * Evaluate policy rule against context
 */
export function evaluatePolicyRule(
  rule: PolicyRule,
  context: PolicyContext
): boolean {
  const { logic, rules } = rule.conditions;
  
  switch (logic) {
    case LogicOperator.AND:
      return rules.every(cond => evaluateCondition(cond, context));
    case LogicOperator.OR:
      return rules.some(cond => evaluateCondition(cond, context));
    case LogicOperator.NOT:
      return !rules.some(cond => evaluateCondition(cond, context));
    default:
      return false;
  }
}
