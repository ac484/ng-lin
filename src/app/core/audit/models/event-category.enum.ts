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
  PERFORMANCE = 'PERFORMANCE'
}
