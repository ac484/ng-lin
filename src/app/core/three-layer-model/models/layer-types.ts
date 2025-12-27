/**
 * Three-Layer Event Model - Core Type Definitions
 * 
 * Based on blueprint: docs/strategy-governance/blueprint/system/03-three-layer-model.md
 * 
 * L0 (Governance): Defines rules, permissions, and scope
 * L1 (Fact): Immutable construction events with evidence
 * L2 (Derived): Calculated insights from L1 facts
 */

// ============================================================================
// L0: Governance Layer Types
// ============================================================================

export type GovernanceEventType =
  | 'governance.contract_activated'
  | 'governance.contract_suspended'
  | 'governance.contract_terminated'
  | 'governance.approval_rule_defined'
  | 'governance.budget_allocated'
  | 'governance.policy_updated'
  | 'governance.access_granted'
  | 'governance.access_revoked';

export interface GovernanceEvent {
  type: GovernanceEventType;
  timestamp: Date;
  actor: string; // Who made this governance decision
  correlationId?: string;

  // Governance-specific fields
  scope?: {
    contracts?: string[];
    locations?: string[];
    teams?: string[];
    budget?: number;
  };

  rules?: {
    approvalRequired?: boolean;
    approvers?: string[];
    conditions?: Record<string, any>;
  };

  metadata?: {
    reason?: string;
    approvedBy?: string;
    effectiveDate?: Date;
    expiryDate?: Date;
  };
}

// ============================================================================
// L1: Fact Layer Types
// ============================================================================

export type ConstructionEventType =
  | 'construction.concrete_pour_completed'
  | 'construction.rebar_installed'
  | 'construction.formwork_erected'
  | 'construction.material_delivered'
  | 'construction.worker_checked_in'
  | 'construction.worker_checked_out'
  | 'construction.equipment_used'
  | 'construction.safety_incident'
  | 'construction.weather_recorded'
  | 'qc.inspection_performed'
  | 'qc.test_result_recorded'
  | 'qc.defect_detected'
  | 'qc.defect_corrected'
  | 'acceptance.approval_given'
  | 'acceptance.rejection_given'
  | 'acceptance.final_acceptance';

export type EvidenceType = 'photo' | 'signature' | 'gps' | 'sensor' | 'document';

export interface Evidence {
  type: EvidenceType;
  timestamp: Date;
  url?: string; // For photo/document
  data?: any; // For signature/sensor data
  hash?: string; // For integrity verification
  metadata?: Record<string, any>;
}

export interface ConstructionEvent {
  // Core fields (REQUIRED)
  id: string;
  type: ConstructionEventType;
  timestamp: Date;
  actor: string; // Who did this

  // Location (REQUIRED)
  target: {
    type: 'confirmed' | 'provisional';
    location?: string; // e.g., "B1F-C3-column"
    coordinates?: { lat: number; lng: number };
    provisional_description?: string; // If type is 'provisional'
  };

  // Evidence (REQUIRED - at least one)
  evidence: Evidence[];

  // Context
  contractId?: string;
  taskId?: string;
  correlationId?: string;

  // Immutability tracking
  corrects?: string; // ID of event this corrects
  correctionReason?: string;

  // Metadata
  metadata?: Record<string, any>;
}

// Correction event for L1 errors
export interface CorrectionEvent extends ConstructionEvent {
  corrects: string; // Required for corrections
  correctionReason: string;
  originalEvent: {
    id: string;
    type: ConstructionEventType;
    timestamp: Date;
  };
}

// ============================================================================
// L2: Derived Layer Types
// ============================================================================

export interface DerivedState {
  id: string;
  type: DerivedStateType;
  calculatedAt: Date;
  calculatedBy: string; // Service or user that calculated

  // Source events (for audit trail)
  sourceEvents: string[]; // IDs of L1 events used

  // Calculated metrics
  metrics: Record<string, number | string | boolean>;

  // Validity
  validUntil?: Date; // When this calculation expires
  stale?: boolean; // If source events changed

  metadata?: Record<string, any>;
}

export type DerivedStateType =
  | 'progress.task_completion'
  | 'progress.overall_completion'
  | 'cost.actual_vs_budget'
  | 'cost.forecast'
  | 'quality.defect_rate'
  | 'quality.inspection_pass_rate'
  | 'schedule.actual_vs_planned'
  | 'schedule.critical_path';

// ============================================================================
// Common Types
// ============================================================================

export interface LayerMetadata {
  layer: 'L0' | 'L1' | 'L2';
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date; // Only for L0 and L2
  updatedBy?: string; // Only for L0 and L2
}

export interface EventContext {
  correlationId: string;
  causationId?: string; // Event that caused this event
  userId: string;
  tenantId?: string;
  blueprintId?: string;
}
