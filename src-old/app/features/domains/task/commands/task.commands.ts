/**
 * Task Commands
 * 
 * All command definitions for task operations.
 */

// Task Lifecycle Commands
export interface CreateTaskCommand {
  readonly type: 'CreateTask';
  readonly payload: {
    readonly title: string;
    readonly description?: string;
    readonly creatorId: string;
    readonly orgId?: string;
    readonly teamId?: string;
  };
}

export interface UpdateTaskCommand {
  readonly type: 'UpdateTask';
  readonly payload: {
    readonly taskId: string;
    readonly updates: Partial<{
      title: string;
      description: string;
      priority: string;
      status: string;
    }>;
  };
}

export interface DeleteTaskCommand {
  readonly type: 'DeleteTask';
  readonly payload: {
    readonly taskId: string;
  };
}

export interface StartTaskCommand {
  readonly type: 'StartTask';
  readonly payload: {
    readonly taskId: string;
    readonly userId: string;
  };
}

export interface CompleteTaskCommand {
  readonly type: 'CompleteTask';
  readonly payload: {
    readonly taskId: string;
    readonly userId: string;
  };
}

// Comment Commands
export interface AddCommentCommand {
  readonly type: 'AddComment';
  readonly payload: {
    readonly taskId: string;
    readonly authorId: string;
    readonly content: string;
  };
}

export interface EditCommentCommand {
  readonly type: 'EditComment';
  readonly payload: {
    readonly commentId: string;
    readonly taskId: string;
    readonly content: string;
  };
}

export interface DeleteCommentCommand {
  readonly type: 'DeleteComment';
  readonly payload: {
    readonly commentId: string;
    readonly taskId: string;
  };
}

// Attachment Commands
export interface UploadAttachmentCommand {
  readonly type: 'UploadAttachment';
  readonly payload: {
    readonly taskId: string;
    readonly fileName: string;
    readonly fileSize: number;
    readonly fileType: string;
    readonly uploadedBy: string;
  };
}

export interface DeleteAttachmentCommand {
  readonly type: 'DeleteAttachment';
  readonly payload: {
    readonly attachmentId: string;
    readonly taskId: string;
  };
}

// Union type of all task commands
export type TaskCommand = 
  | CreateTaskCommand
  | UpdateTaskCommand
  | DeleteTaskCommand
  | StartTaskCommand
  | CompleteTaskCommand
  | AddCommentCommand
  | EditCommentCommand
  | DeleteCommentCommand
  | UploadAttachmentCommand
  | DeleteAttachmentCommand;
