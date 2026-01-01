/**
 * Team Entity Commands
 */

export interface CreateTeamCommand {
  readonly type: 'CreateTeam';
  readonly payload: {
    readonly name: string;
    readonly orgId: string;
    readonly description?: string;
  };
}

export interface UpdateTeamCommand {
  readonly type: 'UpdateTeam';
  readonly payload: {
    readonly teamId: string;
    readonly updates: Partial<{ name: string; description: string }>;
  };
}

export interface DeleteTeamCommand {
  readonly type: 'DeleteTeam';
  readonly payload: {
    readonly teamId: string;
  };
}

export type TeamCommand = CreateTeamCommand | UpdateTeamCommand | DeleteTeamCommand;
