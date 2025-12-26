import { DomainEvent } from '@core/event-bus/models';
import { AuditEvent } from '../models/audit-event.interface';
import { PolicyDecision } from '../services/policy-engine.service';

export class AuditPolicyDecisionEvent extends DomainEvent<{
  auditEvent: AuditEvent;
  decision: PolicyDecision;
}> {
  readonly eventType: string;

  constructor(params: {
    auditEvent: AuditEvent;
    decision: PolicyDecision;
    source?: string;
  }) {
    super(
      {
        auditEvent: params.auditEvent,
        decision: params.decision
      },
      {
        aggregateId: params.auditEvent.blueprintId ?? 'unknown',
        aggregateType: 'audit',
        source: params.source ?? 'audit-policy-engine'
      }
    );

    this.eventType = `audit.policy.${params.decision.action}`;
  }
}
