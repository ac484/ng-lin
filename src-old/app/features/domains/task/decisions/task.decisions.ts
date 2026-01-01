/**
 * Task Decisions
 * 
 * Pure functions encapsulating all task business rules.
 * All decision functions are deterministic and side-effect free.
 */

// Task Creation Decisions
export function decideCreateTask(params: {
  title: string;
  creatorId: string;
}): { allowed: boolean; reason?: string } {
  if (!params.title?.trim()) {
    return { allowed: false, reason: 'Task title is required' };
  }
  if (!params.creatorId) {
    return { allowed: false, reason: 'Creator ID is required' };
  }
  return { allowed: true };
}

// Task Lifecycle Decisions
export function decideStartTask(params: {
  taskId: string;
  userId: string;
  currentStatus: string;
}): { allowed: boolean; reason?: string } {
  if (params.currentStatus === 'completed') {
    return { allowed: false, reason: 'Cannot start a completed task' };
  }
  if (params.currentStatus === 'in_progress') {
    return { allowed: false, reason: 'Task is already in progress' };
  }
  return { allowed: true };
}

export function decideCompleteTask(params: {
  taskId: string;
  userId: string;
  currentStatus: string;
}): { allowed: boolean; reason?: string } {
  if (params.currentStatus === 'completed') {
    return { allowed: false, reason: 'Task is already completed' };
  }
  return { allowed: true };
}

// Comment Decisions
export function decideAddComment(params: {
  taskId: string;
  authorId: string;
  content: string;
}): { allowed: boolean; reason?: string } {
  if (!params.content?.trim()) {
    return { allowed: false, reason: 'Comment content is required' };
  }
  return { allowed: true };
}

// Attachment Decisions
export function decideUploadAttachment(params: {
  taskId: string;
  fileName: string;
  fileSize: number;
  maxFileSize: number;
}): { allowed: boolean; reason?: string } {
  if (params.fileSize > params.maxFileSize) {
    return { allowed: false, reason: 'File size exceeds maximum allowed' };
  }
  if (!params.fileName?.trim()) {
    return { allowed: false, reason: 'File name is required' };
  }
  return { allowed: true };
}
