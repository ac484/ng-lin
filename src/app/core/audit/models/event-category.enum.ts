/**
 * Event Category Enum
 *
 * Aligns with docs/⭐️/AUDIT_SYSTEM_TASK_BREAKDOWN.md (11 categories) while keeping
 * backward-compatible aliases used by existing specs and collectors.
 *
 * @see docs/⭐️/audit-layers/LAYER_4_CLASSIFICATION_ENGINE.md
 * @see docs/⭐️/audit-schemas/SCHEMA_REGISTRY.md
 */
export enum EventCategory {
  /** User actions (UI/API operations) */
  USER_ACTION = 'USER_ACTION',
  /** AI generated or assisted decisions */
  AI_DECISION = 'AI_DECISION',
  /** Data ingress/egress and movement */
  DATA_FLOW = 'DATA_FLOW',
  /** Security and access control events */
  SECURITY = 'SECURITY',
  /** Platform and infrastructure operations */
  SYSTEM = 'SYSTEM',
  /** Compliance-relevant events */
  COMPLIANCE = 'COMPLIANCE',
  /** Blueprint lifecycle and governance */
  BLUEPRINT = 'BLUEPRINT',
  /** Task lifecycle and workflow */
  TASK = 'TASK',
  /** Organization / tenant administration */
  ORGANIZATION = 'ORGANIZATION',
  /** External system integrations */
  INTEGRATION = 'INTEGRATION',
  /** Performance and capacity signals */
  PERFORMANCE = 'PERFORMANCE',

  // Legacy aliases (kept for backward compatibility in specs/services)
  AUTH = 'USER_ACTION',
  AUTHENTICATION = 'USER_ACTION',
  AUTHORIZATION = 'SECURITY',
  PERMISSION = 'SECURITY',
  DATA_ACCESS = 'DATA_FLOW',
  DATA_MODIFICATION = 'DATA_FLOW',
  SYSTEM_EVENT = 'SYSTEM',
  SECURITY_INCIDENT = 'SECURITY',
  COMPLIANCE_EVENT = 'COMPLIANCE',
  PERFORMANCE_ISSUE = 'PERFORMANCE',
  ERROR_EXCEPTION = 'SYSTEM'
}

/**
 * Backward-compatible alias used by existing imports.
 */
export type AuditCategory = EventCategory;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const AuditCategory = EventCategory;
