/**
 * Bot Entity Events
 */

import { DomainEvent } from '../../../core/foundation/base/domain-event.base';

export interface BotCreatedEvent extends DomainEvent {
  readonly type: 'bot.created';
  readonly payload: {
    readonly botId: string;
    readonly name: string;
    readonly type: 'automation' | 'integration' | 'assistant';
    readonly ownerId: string;
    readonly createdAt: Date;
  };
}

export interface BotUpdatedEvent extends DomainEvent {
  readonly type: 'bot.updated';
  readonly payload: {
    readonly botId: string;
    readonly updates: Partial<{ name: string; isEnabled: boolean }>;
    readonly updatedAt: Date;
  };
}

export interface BotDisabledEvent extends DomainEvent {
  readonly type: 'bot.disabled';
  readonly payload: {
    readonly botId: string;
    readonly disabledAt: Date;
  };
}

export interface BotActionExecutedEvent extends DomainEvent {
  readonly type: 'bot.action.executed';
  readonly payload: {
    readonly botId: string;
    readonly actionType: string;
    readonly result: 'success' | 'failure';
    readonly executedAt: Date;
  };
}

export type BotEvent = 
  | BotCreatedEvent 
  | BotUpdatedEvent 
  | BotDisabledEvent 
  | BotActionExecutedEvent;
