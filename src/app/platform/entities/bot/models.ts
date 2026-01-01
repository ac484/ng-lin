/**
 * Bot Entity Read Models
 */

export interface BotModel {
  readonly id: string;
  readonly name: string;
  readonly type: 'automation' | 'integration' | 'assistant';
  readonly ownerId: string;
  readonly isEnabled: boolean;
  readonly createdAt: Date;
  readonly updatedAt?: Date;
}

export interface BotSummary {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly isEnabled: boolean;
  readonly actionCount: number;
}
