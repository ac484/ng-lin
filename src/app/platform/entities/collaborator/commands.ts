/**
 * Collaborator Entity Commands
 */

export interface InviteCollaboratorCommand {
  readonly type: 'InviteCollaborator';
  readonly payload: {
    readonly userId: string;
    readonly resourceType: 'org' | 'team' | 'task';
    readonly resourceId: string;
    readonly role: string;
  };
}

export interface AcceptCollaboratorCommand {
  readonly type: 'AcceptCollaborator';
  readonly payload: {
    readonly collaboratorId: string;
  };
}

export interface RemoveCollaboratorCommand {
  readonly type: 'RemoveCollaborator';
  readonly payload: {
    readonly collaboratorId: string;
  };
}

export type CollaboratorCommand = 
  | InviteCollaboratorCommand 
  | AcceptCollaboratorCommand 
  | RemoveCollaboratorCommand;
