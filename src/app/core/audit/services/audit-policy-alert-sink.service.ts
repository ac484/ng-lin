import { DestroyRef, Injectable, inject } from '@angular/core';
import { EVENT_BUS } from '../../event-bus/constants/event-bus-tokens';
import { IEventBus } from '../../event-bus/interfaces/event-bus.interface';
import { DomainEvent, Subscription } from '../../event-bus/models';
import { AUDIT_POLICY_EVENTS } from '../../event-bus/constants/event-types.constants';
import { NotificationRepository } from '@core/account/repositories/notification.repository';
import { NotificationType } from '@core/types';

interface AuditPolicyDecision {
  rule?: string;
  action?: string;
  reasons?: string[];
  tags?: string[];
}

interface AuditPolicyEventPayload {
  blueprintId?: string;
  tenantId?: string;
  actorId?: string;
  actor?: { id?: string };
  auditEventId?: string;
  auditEvent?: { id?: string; actor?: { id?: string }; blueprintId?: string };
  decision?: AuditPolicyDecision;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class AuditPolicyAlertSinkService {
  private readonly eventBus = inject<IEventBus>(EVENT_BUS);
  private readonly notificationRepository = inject(NotificationRepository);
  private readonly destroyRef = inject(DestroyRef);

  private readonly subscriptions: Subscription[] = [];
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    await Promise.all([
      this.subscribeToPolicyEvent(AUDIT_POLICY_EVENTS.FLAGGED, 'flagged'),
      this.subscribeToPolicyEvent(AUDIT_POLICY_EVENTS.ESCALATED, 'escalated')
    ]);

    this.destroyRef.onDestroy(() => {
      void this.cleanup();
    });

    this.initialized = true;
  }

  private async subscribeToPolicyEvent(eventType: string, decisionType: 'flagged' | 'escalated'): Promise<void> {
    try {
      const subscription = await this.eventBus.subscribe<DomainEvent<AuditPolicyEventPayload>>(
        eventType,
        async event => {
          await this.routeNotification(event, decisionType);
        }
      );
      this.subscriptions.push(subscription);
    } catch (error) {
      console.error('[AuditPolicyAlertSink]', `Failed to subscribe to ${eventType}`, error);
    }
  }

  private async routeNotification(event: DomainEvent<AuditPolicyEventPayload>, decisionType: 'flagged' | 'escalated'): Promise<void> {
    const payload = event.payload ?? {};
    const decision = payload.decision;
    const actorId = payload.actorId ?? payload.actor?.id ?? payload.auditEvent?.actor?.id ?? 'system';
    const blueprintId = payload.blueprintId ?? payload.auditEvent?.blueprintId ?? payload.tenantId;

    const title =
      decisionType === 'escalated' ? 'Audit policy escalated' : 'Audit policy flagged for review';
    const description =
      decision?.reasons?.join('; ') ?? payload.message ?? 'Audit policy decision requires attention.';

    try {
      await this.notificationRepository.create({
        userId: actorId,
        type: NotificationType.ALERT,
        title,
        description,
        datetime: new Date().toISOString(),
        read: false,
        extra: decision?.rule,
        link: payload.auditEventId ? `/audit/events/${payload.auditEventId}` : undefined
      });
    } catch (error) {
      console.error('[AuditPolicyAlertSink]', 'Failed to route audit policy notification', error, {
        eventType: event.eventType,
        decisionType,
        blueprintId
      });
    }
  }

  private async cleanup(): Promise<void> {
    await Promise.all(this.subscriptions.map(subscription => this.eventBus.unsubscribe(subscription)));
    this.subscriptions.length = 0;
  }
}
