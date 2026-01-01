/**
 * Task Events Module
 * 
 * All domain events for the task entity.
 */

export * from './task-core.events';
export * from './task-lifecycle.events';
export * from './task-comment.events';
export * from './task-discussion.events';
export * from './task-attachment.events';

// Union type of all task events
import type { TaskCoreEvent } from './task-core.events';
import type { TaskLifecycleEvent } from './task-lifecycle.events';
import type { TaskCommentEvent } from './task-comment.events';
import type { TaskDiscussionEvent } from './task-discussion.events';
import type { TaskAttachmentEvent } from './task-attachment.events';

export type TaskEvent = 
  | TaskCoreEvent 
  | TaskLifecycleEvent 
  | TaskCommentEvent 
  | TaskDiscussionEvent 
  | TaskAttachmentEvent;
