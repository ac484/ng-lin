/**
 * Platform Audit Models
 * 
 * Minimal audit event model for platform audit logging.
 */

export enum AuditLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export enum AuditCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  DATA_ACCESS = 'data_access',
  DATA_MODIFICATION = 'data_modification',
  SYSTEM = 'system',
  SECURITY = 'security',
  COMPLIANCE = 'compliance'
}

/**
 * Audit Event Interface
 */
export interface AuditEvent {
  /** Unique event ID */
  id: string;
  
  /** Timestamp */
  timestamp: Date;
  
  /** Event level */
  level: AuditLevel;
  
  /** Event category */
  category: AuditCategory;
  
  /** Event action/type */
  action: string;
  
  /** Actor (user) who performed the action */
  actorId?: string;
  
  /** Target resource type */
  resourceType?: string;
  
  /** Target resource ID */
  resourceId?: string;
  
  /** Tenant/Blueprint context */
  blueprintId?: string;
  
  /** Organization context */
  organizationId?: string;
  
  /** Event details/payload */
  details?: Record<string, any>;
  
  /** IP address */
  ipAddress?: string;
  
  /** User agent */
  userAgent?: string;
  
  /** Result of the action */
  result?: 'success' | 'failure' | 'partial';
  
  /** Error message if failure */
  errorMessage?: string;
}
