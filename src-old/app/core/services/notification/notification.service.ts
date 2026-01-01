import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NzMessageService } from 'ng-zorro-antd/message';
import { filter } from 'rxjs/operators';

import { EVENT_BUS } from '../../../platform/event-bus/constants';
import { IEventBus } from '../../../platform/event-bus/interfaces';
import { DomainEvent } from '../../../platform/event-bus/models';

type MessageType = 'success' | 'info' | 'warning' | 'error';

interface NormalizedMessage {
  readonly type: MessageType;
  readonly message: string;
  readonly description?: string;
}

/**
 * Cross-domain notification service
 *
 * Listens on Event Bus and surfaces important events to UI toast/alert channels,
 * providing a unified message formatter for success/error/warning/info.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly eventBus = inject<IEventBus>(EVENT_BUS);
  private readonly message = inject(NzMessageService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.bindEventBus();
  }

  /**
   * Public helpers to emit UI notifications
   */
  success(message: string, description?: string): void {
    this.show({ type: 'success', message, description });
  }

  info(message: string, description?: string): void {
    this.show({ type: 'info', message, description });
  }

  warning(message: string, description?: string): void {
    this.show({ type: 'warning', message, description });
  }

  error(message: string, description?: string): void {
    this.show({ type: 'error', message, description });
  }

  /**
   * Wire event bus stream → UI toast channel
   */
  private bindEventBus(): void {
    this.eventBus
      .observeAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(event => this.shouldHandle(event.eventType))
      )
      .subscribe(event => {
        const normalized = this.normalize(event);
        this.show(normalized);
      });
  }

  private shouldHandle(eventType: string): boolean {
    // Handle failed events
    if (eventType.endsWith('.failed')) {
      return true;
    }
    // Handle notification namespace events
    if (eventType.startsWith('notification.')) {
      return true;
    }
    // Handle audit events
    if (eventType.startsWith('audit.')) {
      return true;
    }
    return false;
  }

  private normalize(event: DomainEvent<any>): NormalizedMessage {
    const { eventType, payload } = event;

    if (eventType.endsWith('.failed')) {
      return {
        type: 'error',
        message: '事件處理失敗',
        description: payload?.message ?? payload?.reason ?? event.toString()
      };
    }

    if (eventType === 'audit.escalated') {
      return {
        type: 'warning',
        message: 'Audit policy escalated',
        description: payload?.decision?.reasons?.join('; ') ?? payload?.message
      };
    }

    if (eventType === 'audit.flagged') {
      return {
        type: 'warning',
        message: 'Audit policy flagged for review',
        description: payload?.decision?.reasons?.join('; ') ?? payload?.message
      };
    }

    if (eventType.startsWith('notification.')) {
      return {
        type: 'info',
        message: payload?.title ?? '通知訊息',
        description: payload?.description ?? payload?.body
      };
    }

    return {
      type: 'info',
      message: eventType,
      description: payload?.message ?? payload?.description
    };
  }

  private show(message: NormalizedMessage): void {
    const { type, description } = message;
    const nzContent = description ? `${message.message} — ${description}` : message.message;

    switch (type) {
      case 'success':
        this.message.success(nzContent, { nzDuration: 3000 });
        break;
      case 'warning':
        this.message.warning(nzContent, { nzDuration: 5000 });
        break;
      case 'error':
        this.message.error(nzContent, { nzDuration: 8000 });
        break;
      default:
        this.message.info(nzContent, { nzDuration: 3000 });
        break;
    }
  }
}
