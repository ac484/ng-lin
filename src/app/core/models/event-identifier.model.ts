/**
 * Event Identifier System - Two-Tier Structure
 * Following GitHub's design philosophy: Namespace + Sequence
 * 
 * Format: <namespace>#<sequence>
 * Example: qrl.trading.order#1024
 * 
 * @see docs/identity-tenancy for multi-tenant architecture
 */

/**
 * Namespace structure: tenant.context.aggregate
 * 
 * - tenant: Identifies the tenant boundary (organization/user)
 * - context: Business context within the tenant
 * - aggregate: Specific aggregate/entity type
 * 
 * @example
 * {
 *   tenant: "qrl",
 *   context: "trading",
 *   aggregate: "order"
 * }
 */
export interface Namespace {
  /** Tenant identifier (organization or user) */
  tenant: string;
  
  /** Business context within tenant */
  context: string;
  
  /** Aggregate/entity type */
  aggregate: string;
  
  /** Full namespace path (computed) */
  readonly fullPath?: string;
}

/**
 * Event Identifier with two-tier structure
 * 
 * Provides:
 * - Uniqueness: Global uniqueness through namespace + sequence
 * - Governance: Natural multi-tenant isolation
 * - Scalability: Independent scaling per namespace
 * - Distributed: Decentralized sequence generation
 * 
 * @example
 * {
 *   namespace: "qrl.trading.order",
 *   sequence: 1024,
 *   fullReference: "qrl.trading.order#1024"
 * }
 */
export interface EventIdentifier {
  /** Namespace path (tenant.context.aggregate) */
  namespace: string;
  
  /** Sequence number within namespace (incremental) */
  sequence: number;
  
  /** Full reference string (namespace#sequence) */
  fullReference: string;
  
  /** Structured namespace (optional, for convenience) */
  namespaceStructure?: Namespace;
}

/**
 * Event level in the four-layer model
 * 
 * - L-1: Raw Sequence (rawSeq)
 * - L0: Namespace + Seq (eventId)
 * - L1: Business Semantic (eventType + eventId)
 * - L2: Policy/Automation/Audit (triggered actions)
 */
export enum EventLevel {
  /** L-1: Raw sequence number */
  RawSequence = -1,
  
  /** L0: Identified event (namespace + sequence) */
  Identified = 0,
  
  /** L1: Semantic event (with business meaning) */
  Semantic = 1,
  
  /** L2: Policy/automation layer */
  Policy = 2
}

/**
 * Event with identifier at specific level
 */
export interface IdentifiedEvent {
  /** Event identifier */
  identifier: EventIdentifier;
  
  /** Event level */
  level: EventLevel;
  
  /** Event type (for L1 and above) */
  eventType?: string;
  
  /** Timestamp when event occurred */
  timestamp: Date;
  
  /** Event payload */
  payload?: unknown;
  
  /** Metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Sequence generator configuration per namespace
 */
export interface SequenceConfig {
  /** Namespace this config applies to */
  namespace: string;
  
  /** Current sequence number */
  currentSequence: number;
  
  /** Sequence increment (default: 1) */
  increment?: number;
  
  /** Starting sequence (default: 1) */
  startFrom?: number;
  
  /** Last updated timestamp */
  lastUpdated: Date;
}

/**
 * Namespace validation result
 */
export interface NamespaceValidation {
  /** Whether namespace is valid */
  valid: boolean;
  
  /** Validation errors (if any) */
  errors?: string[];
  
  /** Parsed namespace structure (if valid) */
  namespace?: Namespace;
}

/**
 * Event reference parser result
 */
export interface ParsedEventReference {
  /** Whether parsing was successful */
  success: boolean;
  
  /** Parsed identifier (if successful) */
  identifier?: EventIdentifier;
  
  /** Parse error message (if failed) */
  error?: string;
}
