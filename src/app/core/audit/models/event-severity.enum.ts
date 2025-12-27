/**
 * Event Severity Enum
 *
 * Aligns with docs/⭐️/AUDIT_SYSTEM_TASK_BREAKDOWN.md (LOW/MEDIUM/HIGH/CRITICAL)
 * while keeping backward-compatible AuditLevel alias for existing consumers.
 *
 * @see docs/⭐️/audit-layers/LAYER_4_CLASSIFICATION_ENGINE.md
 */
export enum EventSeverity {
  /** Routine operations, informational signals */
  LOW = 'LOW',
  /** Notable events needing monitoring */
  MEDIUM = 'MEDIUM',
  /** High-risk actions requiring attention */
  HIGH = 'HIGH',
  /** Critical incidents requiring immediate action */
  CRITICAL = 'CRITICAL'
}

/**
 * Backward-compatible alias used by existing imports.
 */
export type AuditLevel = EventSeverity;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const AuditLevel = EventSeverity;

/**
 * Risk Score Thresholds
 * Used for mapping risk scores to severity levels
 */
export const RISK_SCORE_THRESHOLDS = {
  LOW: { min: 0, max: 25 },
  MEDIUM: { min: 26, max: 50 },
  HIGH: { min: 51, max: 75 },
  CRITICAL: { min: 76, max: 100 }
} as const;

/**
 * Helper function to get severity from risk score
 */
export function getSeverityFromRiskScore(riskScore: number): EventSeverity {
  if (riskScore <= RISK_SCORE_THRESHOLDS.LOW.max) {
    return EventSeverity.LOW;
  } else if (riskScore <= RISK_SCORE_THRESHOLDS.MEDIUM.max) {
    return EventSeverity.MEDIUM;
  } else if (riskScore <= RISK_SCORE_THRESHOLDS.HIGH.max) {
    return EventSeverity.HIGH;
  } else {
    return EventSeverity.CRITICAL;
  }
}

/**
 * Normalize legacy AuditLevel values (INFO/WARNING/ERROR/CRITICAL) to EventSeverity.
 */
export function normalizeSeverity(
  level: EventSeverity | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'
): EventSeverity {
  switch (level) {
    case EventSeverity.LOW:
    case 'INFO':
      return EventSeverity.LOW;
    case EventSeverity.MEDIUM:
    case 'WARNING':
      return EventSeverity.MEDIUM;
    case EventSeverity.HIGH:
    case 'ERROR':
      return EventSeverity.HIGH;
    case EventSeverity.CRITICAL:
    case 'CRITICAL':
    default:
      return EventSeverity.CRITICAL;
  }
}
