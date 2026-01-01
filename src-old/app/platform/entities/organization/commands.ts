/**
 * Organization Entity Commands
 */

export interface CreateOrgCommand {
  readonly type: 'CreateOrg';
  readonly payload: {
    readonly name: string;
    readonly ownerId: string;
    readonly description?: string;
  };
}

export interface UpdateOrgCommand {
  readonly type: 'UpdateOrg';
  readonly payload: {
    readonly orgId: string;
    readonly updates: Partial<{
      name: string;
      description: string;
    }>;
  };
}

export interface DeleteOrgCommand {
  readonly type: 'DeleteOrg';
  readonly payload: {
    readonly orgId: string;
  };
}

export type OrgCommand = CreateOrgCommand | UpdateOrgCommand | DeleteOrgCommand;
