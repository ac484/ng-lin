/**
 * Bot Entity Projections
 */

import { BotEvent } from './events';

export interface BotProjection {
  readonly botId: string;
  readonly name: string;
  readonly type: 'automation' | 'integration' | 'assistant';
  readonly ownerId: string;
  readonly isEnabled: boolean;
  readonly actionCount: number;
  readonly lastActionAt?: Date;
  readonly createdAt: Date;
  readonly updatedAt?: Date;
}

export function buildBotProjection(events: BotEvent[]): BotProjection[] {
  const botMap = new Map<string, BotProjection>();
  
  for (const event of events) {
    switch (event.type) {
      case 'bot.created':
        botMap.set(event.payload.botId, {
          botId: event.payload.botId,
          name: event.payload.name,
          type: event.payload.type,
          ownerId: event.payload.ownerId,
          isEnabled: true,
          actionCount: 0,
          createdAt: event.payload.createdAt,
        });
        break;
      case 'bot.updated':
        const existing = botMap.get(event.payload.botId);
        if (existing) {
          botMap.set(event.payload.botId, {
            ...existing,
            name: event.payload.updates.name ?? existing.name,
            isEnabled: event.payload.updates.isEnabled ?? existing.isEnabled,
            updatedAt: event.payload.updatedAt,
          });
        }
        break;
      case 'bot.disabled':
        const bot = botMap.get(event.payload.botId);
        if (bot) {
          botMap.set(event.payload.botId, {
            ...bot,
            isEnabled: false,
          });
        }
        break;
      case 'bot.action.executed':
        const actionBot = botMap.get(event.payload.botId);
        if (actionBot) {
          botMap.set(event.payload.botId, {
            ...actionBot,
            actionCount: actionBot.actionCount + 1,
            lastActionAt: event.payload.executedAt,
          });
        }
        break;
    }
  }
  
  return Array.from(botMap.values());
}
