import { DestroyRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NotificationRepository } from '@core/account/repositories/notification.repository';
import { NotificationType } from '@core/types';
import { EVENT_BUS } from '../../event-bus/constants/event-bus-tokens';
import { IEventBus } from '../../event-bus/interfaces';
import { DomainEvent, Subscription } from '../../event-bus/models';
import { AuditPolicyAlertSinkService } from './audit-policy-alert-sink.service';

describe('AuditPolicyAlertSinkService', () => {
  let service: AuditPolicyAlertSinkService;
  let eventBus: jasmine.SpyObj<IEventBus>;
  let notificationRepository: jasmine.SpyObj<NotificationRepository>;
  const subscriptions: Record<string, (event: DomainEvent) => Promise<void> | void> = {};

  beforeEach(() => {
    Object.keys(subscriptions).forEach(key => delete subscriptions[key]);
    eventBus = jasmine.createSpyObj<IEventBus>('EventBus', ['subscribe', 'unsubscribe']);
    notificationRepository = jasmine.createSpyObj<NotificationRepository>('NotificationRepository', ['create']);

    eventBus.subscribe.and.callFake(async (eventType: string, handler: (event: DomainEvent) => Promise<void> | void) => {
      subscriptions[eventType] = handler;
      const subscription: Subscription = {
        eventType,
        handler,
        unsubscribe: () => undefined
      };
      return subscription;
    });

    eventBus.unsubscribe.and.callFake(async () => undefined);
    notificationRepository.create.and.returnValue(
      Promise.resolve({
        userId: 'user-123',
        type: NotificationType.ALERT,
        title: 't',
        description: 'd'
      })
    );

    TestBed.configureTestingModule({
      providers: [
        AuditPolicyAlertSinkService,
        { provide: EVENT_BUS, useValue: eventBus },
        { provide: NotificationRepository, useValue: notificationRepository },
        { provide: DestroyRef, useValue: { onDestroy: () => undefined } }
      ]
    });

    service = TestBed.inject(AuditPolicyAlertSinkService);
  });

  it('should subscribe to policy alert topics on initialize', async () => {
    await service.initialize();

    expect(eventBus.subscribe).toHaveBeenCalledWith('audit.policy.flagged', jasmine.any(Function));
    expect(eventBus.subscribe).toHaveBeenCalledWith('audit.policy.escalated', jasmine.any(Function));
  });

  it('should route policy events to notification repository', async () => {
    await service.initialize();
    const handler = subscriptions['audit.policy.escalated'];

    const event = {
      eventType: 'audit.policy.escalated',
      payload: {
        actorId: 'user-999',
        auditEventId: 'audit-evt-001',
        decision: { rule: 'Security High Severity', reasons: ['High risk'] }
      }
    } as unknown as DomainEvent<any>;

    await handler(event);

    expect(notificationRepository.create).toHaveBeenCalled();
    const created = notificationRepository.create.calls.mostRecent().args[0];
    expect(created.userId).toBe('user-999');
    expect(created.type).toBe(NotificationType.ALERT);
    expect(created.title.toLowerCase()).toContain('escalated');
  });
});
