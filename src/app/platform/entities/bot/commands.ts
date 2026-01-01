/**
 * Bot Entity Commands
 */

export interface CreateBotCommand {
  readonly type: 'CreateBot';
  readonly payload: {
    readonly name: string;
    readonly botType: 'automation' | 'integration' | 'assistant';
    readonly ownerId: string;
  };
}

export interface UpdateBotCommand {
  readonly type: 'UpdateBot';
  readonly payload: {
    readonly botId: string;
    readonly updates: Partial<{ name: string; isEnabled: boolean }>;
  };
}

export interface DisableBotCommand {
  readonly type: 'DisableBot';
  readonly payload: {
    readonly botId: string;
  };
}

export interface ExecuteBotActionCommand {
  readonly type: 'ExecuteBotAction';
  readonly payload: {
    readonly botId: string;
    readonly actionType: string;
    readonly parameters?: Record<string, unknown>;
  };
}

export type BotCommand = 
  | CreateBotCommand 
  | UpdateBotCommand 
  | DisableBotCommand 
  | ExecuteBotActionCommand;
