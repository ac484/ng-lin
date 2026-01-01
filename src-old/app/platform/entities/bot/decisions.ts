/**
 * Bot Entity Decisions
 */

export function decideCanCreateBot(params: {
  name: string;
  type: string;
  ownerId: string;
}): { allowed: boolean; reason?: string } {
  if (!params.name?.trim()) {
    return { allowed: false, reason: 'Bot name is required' };
  }
  if (!params.type) {
    return { allowed: false, reason: 'Bot type is required' };
  }
  if (!params.ownerId) {
    return { allowed: false, reason: 'Owner ID is required' };
  }
  return { allowed: true };
}

export function decideCanPerformBotAction(params: {
  botId: string;
  actionType: string;
  isEnabled: boolean;
}): { allowed: boolean; reason?: string } {
  if (!params.botId) {
    return { allowed: false, reason: 'Bot ID is required' };
  }
  if (!params.isEnabled) {
    return { allowed: false, reason: 'Bot is disabled' };
  }
  return { allowed: true };
}
