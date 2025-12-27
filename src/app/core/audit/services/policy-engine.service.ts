/**
 * Audit Policy Engine Service (Layer 4.1 - Policy/Rules)
 *
 * Minimal implementation to mirror the parent system's audit policy/rules layer:
 * - Evaluates audit events against configurable rules
 * - Supports actions: allow, suppress (drop), flag (annotate), escalate (mark + notify)
 * - Designed to run inside the collector before persistence
 *
 * No external storage or wrappers are introduced; rules are kept in-memory and
 * Firebase-friendly. Future extensions (rule CRUD, remote config, alert sinks)
 * can build on this service without changing the collector contract.
 */

import { Injectable } from '@angular/core';
import { AuditEvent } from '../models/audit-event.interface';
import { EventSeverity } from '../models/event-severity.enum';
import { EventCategory } from '../models/event-category.enum';

export type PolicyAction = 'allow' | 'suppress' | 'flag' | 'escalate';

export interface PolicyDecision {
  action: PolicyAction;
  rule: string;
  reasons: string[];
  notify?: boolean;
  tags?: string[];
}

export interface AuditPolicyRule {
  name: string;
  description: string;
  match: (event: AuditEvent) => boolean;
  action: PolicyAction;
  notify?: boolean;
  tags?: string[];
}

@Injectable({ providedIn: 'root' })
export class PolicyEngineService {
  /**
   * Default rule set aligned with parent system priorities:
   * - Escalate security/compliance failures and auth failures
   * - Suppress low-signal read noise on data.* reads (kept in storage tier via retention)
   * - Flag AI/system generated changes for later review
   */
  private readonly rules: AuditPolicyRule[] = [
    {
      name: 'Security High Severity',
      description: 'Escalate security.* events with HIGH/CRITICAL severity',
      match: (event) =>
        event.eventType.startsWith('security.') &&
        ((event.severity ?? event.level) === EventSeverity.HIGH || (event.severity ?? event.level) === EventSeverity.CRITICAL),
      action: 'escalate',
      notify: true,
      tags: ['security', 'escalate']
    },
    {
      name: 'Auth Failure',
      description: 'Escalate authentication failures for login/mfa/password',
      match: (event) =>
        /^auth\.(login|signin|mfa|password)/i.test(event.eventType) &&
        event.metadata?.result === 'failure',
      action: 'escalate',
      notify: true,
      tags: ['auth', 'failure']
    },
    {
      name: 'Sensitive Data Export',
      description: 'Escalate PII/sensitive data export attempts',
      match: (event) => /(pii|sensitive|personal)\.(export|read|accessed)/i.test(event.eventType),
      action: 'escalate',
      notify: true,
      tags: ['data', 'pii']
    },
    {
      name: 'Noisy Data Reads',
      description: 'Suppress low-signal data.read events to reduce noise',
      match: (event) => /^data\.(read|fetched|queried|viewed)$/i.test(event.eventType),
      action: 'suppress',
      tags: ['noise']
    },
    {
      name: 'AI Generated Actions',
      description: 'Flag AI generated events for later review',
       match: (event) => event.aiGenerated === true || event.actor?.type === 'ai',
      action: 'flag',
      notify: false,
      tags: ['ai', 'review']
    },
    {
      name: 'Compliance Category',
      description: 'Escalate compliance.* events automatically',
      match: (event) => event.category === EventCategory.COMPLIANCE,
      action: 'escalate',
      notify: true,
      tags: ['compliance']
    }
  ];

  /**
   * Evaluate a single audit event and return the policy decision.
   * If no rule matches, default action is allow.
   */
  evaluate(event: AuditEvent): PolicyDecision {
    for (const rule of this.rules) {
      if (rule.match(event)) {
        return {
          action: rule.action,
          rule: rule.name,
          reasons: [rule.description],
          notify: rule.notify,
          tags: rule.tags
        };
      }
    }

    return {
      action: 'allow',
      rule: 'default-allow',
      reasons: ['No matching policy rule']
    };
  }

  /**
   * Evaluate a batch of events.
   */
  evaluateBatch(events: AuditEvent[]): PolicyDecision[] {
    return events.map((event) => this.evaluate(event));
  }
}
