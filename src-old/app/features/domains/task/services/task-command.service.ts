/**
 * Task Command Service
 * 
 * Handles all task commands by integrating with Firebase Callable Functions.
 * Implements command pattern for task operations.
 * 
 * Architecture:
 * - Receives commands from UI layer
 * - Validates command data
 * - Calls Firebase Cloud Functions
 * - Publishes domain events on success
 * - Returns results to caller
 * 
 * @example
 * ```typescript
 * const commandService = inject(TaskCommandService);
 * 
 * // Create a task
 * const result = await commandService.createTask({
 *   title: 'New Task',
 *   description: 'Task description',
 *   creatorId: currentUserId
 * });
 * 
 * if (result.success) {
 *   console.log('Task created:', result.taskId);
 * }
 * ```
 */

import { Injectable, inject } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { Auth } from '@angular/fire/auth';

import { PlatformEventStoreService } from '@app/platform/event-store';
import {
  CreateTaskCommand,
  UpdateTaskCommand,
  DeleteTaskCommand,
  StartTaskCommand,
  CompleteTaskCommand,
  AddCommentCommand
} from '../commands/task.commands';
import { TaskCreatedEvent, TaskUpdatedEvent, TaskDeletedEvent } from '../events';

/**
 * Common result structure for command operations
 */
export interface CommandResult<T = unknown> {
  readonly success: boolean;
  readonly message?: string;
  readonly data?: T;
  readonly error?: string;
}

/**
 * Task creation result
 */
export interface TaskCreationResult {
  readonly taskId: string;
  readonly message: string;
}

/**
 * Task Command Service
 * 
 * Provides methods for executing task commands using Firebase Cloud Functions.
 */
@Injectable({ providedIn: 'root' })
export class TaskCommandService {
  private readonly functions = inject(Functions);
  private readonly auth = inject(Auth);
  private readonly eventStore = inject(PlatformEventStoreService);

  /**
   * Create a new task
   * 
   * @param command - Create task command with task details
   * @returns Promise resolving to command result with taskId
   */
  async createTask(command: CreateTaskCommand['payload']): Promise<CommandResult<TaskCreationResult>> {
    try {
      // Validate authentication
      if (!this.auth.currentUser) {
        return {
          success: false,
          error: 'User must be authenticated to create tasks'
        };
      }

      // Call Firebase Cloud Function
      const createTaskFn = httpsCallable<typeof command, { success: boolean; taskId: string; message: string }>(
        this.functions,
        'createTask'
      );

      const result = await createTaskFn({
        title: command.title,
        description: command.description,
        assignedTo: command.creatorId,
        tags: []
      });

      if (result.data.success) {
        // Publish TaskCreatedEvent to event store
        await this.publishTaskCreatedEvent({
          taskId: result.data.taskId,
          ...command
        });

        return {
          success: true,
          message: result.data.message,
          data: {
            taskId: result.data.taskId,
            message: result.data.message
          }
        };
      }

      return {
        success: false,
        error: result.data.message || 'Failed to create task'
      };
    } catch (error) {
      console.error('Error creating task:', error);
      return {
        success: false,
        error: this.extractErrorMessage(error)
      };
    }
  }

  /**
   * Update an existing task
   * 
   * @param command - Update task command with changes
   * @returns Promise resolving to command result
   */
  async updateTask(command: UpdateTaskCommand['payload']): Promise<CommandResult> {
    try {
      // Validate authentication
      if (!this.auth.currentUser) {
        return {
          success: false,
          error: 'User must be authenticated to update tasks'
        };
      }

      // Call Firebase Cloud Function
      const updateTaskFn = httpsCallable<typeof command, { success: boolean; message: string }>(
        this.functions,
        'updateTask'
      );

      const result = await updateTaskFn({
        taskId: command.taskId,
        ...command.updates
      });

      if (result.data.success) {
        // Publish TaskUpdatedEvent to event store
        await this.publishTaskUpdatedEvent(command);

        return {
          success: true,
          message: result.data.message
        };
      }

      return {
        success: false,
        error: result.data.message || 'Failed to update task'
      };
    } catch (error) {
      console.error('Error updating task:', error);
      return {
        success: false,
        error: this.extractErrorMessage(error)
      };
    }
  }

  /**
   * Delete a task
   * 
   * @param command - Delete task command
   * @returns Promise resolving to command result
   */
  async deleteTask(command: DeleteTaskCommand['payload']): Promise<CommandResult> {
    try {
      // Validate authentication
      if (!this.auth.currentUser) {
        return {
          success: false,
          error: 'User must be authenticated to delete tasks'
        };
      }

      // Call Firebase Cloud Function
      const deleteTaskFn = httpsCallable<typeof command, { success: boolean; message: string }>(
        this.functions,
        'deleteTask'
      );

      const result = await deleteTaskFn(command);

      if (result.data.success) {
        // Publish TaskDeletedEvent to event store
        await this.publishTaskDeletedEvent(command.taskId);

        return {
          success: true,
          message: result.data.message
        };
      }

      return {
        success: false,
        error: result.data.message || 'Failed to delete task'
      };
    } catch (error) {
      console.error('Error deleting task:', error);
      return {
        success: false,
        error: this.extractErrorMessage(error)
      };
    }
  }

  /**
   * Start a task (change status to in-progress)
   * 
   * @param command - Start task command
   * @returns Promise resolving to command result
   */
  async startTask(command: StartTaskCommand['payload']): Promise<CommandResult> {
    try {
      // Validate authentication
      if (!this.auth.currentUser) {
        return {
          success: false,
          error: 'User must be authenticated to start tasks'
        };
      }

      // Update task status to in-progress
      return await this.updateTask({
        taskId: command.taskId,
        updates: {
          status: 'in-progress'
        }
      });
    } catch (error) {
      console.error('Error starting task:', error);
      return {
        success: false,
        error: this.extractErrorMessage(error)
      };
    }
  }

  /**
   * Complete a task (change status to completed)
   * 
   * @param command - Complete task command
   * @returns Promise resolving to command result
   */
  async completeTask(command: CompleteTaskCommand['payload']): Promise<CommandResult> {
    try {
      // Validate authentication
      if (!this.auth.currentUser) {
        return {
          success: false,
          error: 'User must be authenticated to complete tasks'
        };
      }

      // Update task status to completed
      return await this.updateTask({
        taskId: command.taskId,
        updates: {
          status: 'completed'
        }
      });
    } catch (error) {
      console.error('Error completing task:', error);
      return {
        success: false,
        error: this.extractErrorMessage(error)
      };
    }
  }

  /**
   * Add a comment to a task
   * 
   * @param command - Add comment command
   * @returns Promise resolving to command result
   */
  async addComment(command: AddCommentCommand['payload']): Promise<CommandResult> {
    try {
      // Validate authentication
      if (!this.auth.currentUser) {
        return {
          success: false,
          error: 'User must be authenticated to add comments'
        };
      }

      // TODO: Implement comment functionality when available
      console.log('Add comment:', command);

      return {
        success: true,
        message: 'Comment functionality not yet implemented'
      };
    } catch (error) {
      console.error('Error adding comment:', error);
      return {
        success: false,
        error: this.extractErrorMessage(error)
      };
    }
  }

  /**
   * Publish TaskCreatedEvent to event store
   */
  private async publishTaskCreatedEvent(data: {
    taskId: string;
    title: string;
    description?: string;
    creatorId: string;
    orgId?: string;
    teamId?: string;
  }): Promise<void> {
    try {
      const event = new TaskCreatedEvent({
        taskId: data.taskId,
        title: data.title,
        description: data.description || '',
        creatorId: data.creatorId,
        orgId: data.orgId,
        teamId: data.teamId,
        createdAt: new Date()
      });

      await this.eventStore.publish(event);
    } catch (error) {
      console.error('Failed to publish TaskCreatedEvent:', error);
      // Don't throw - event publishing failure shouldn't fail the command
    }
  }

  /**
   * Publish TaskUpdatedEvent to event store
   */
  private async publishTaskUpdatedEvent(data: {
    taskId: string;
    updates: Partial<{ title: string; description: string; priority: string; status: string }>;
  }): Promise<void> {
    try {
      const event = new TaskUpdatedEvent({
        taskId: data.taskId,
        updates: data.updates,
        updatedAt: new Date()
      });

      await this.eventStore.publish(event);
    } catch (error) {
      console.error('Failed to publish TaskUpdatedEvent:', error);
      // Don't throw - event publishing failure shouldn't fail the command
    }
  }

  /**
   * Publish TaskDeletedEvent to event store
   */
  private async publishTaskDeletedEvent(taskId: string): Promise<void> {
    try {
      const event = new TaskDeletedEvent({
        taskId,
        deletedAt: new Date()
      });

      await this.eventStore.publish(event);
    } catch (error) {
      console.error('Failed to publish TaskDeletedEvent:', error);
      // Don't throw - event publishing failure shouldn't fail the command
    }
  }

  /**
   * Extract user-friendly error message from Firebase error
   */
  private extractErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null) {
      const err = error as { message?: string; code?: string };
      if (err.message) {
        return err.message;
      }
      if (err.code) {
        return this.translateErrorCode(err.code);
      }
    }

    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Translate Firebase error codes to user-friendly messages
   */
  private translateErrorCode(code: string): string {
    const errorMessages: Record<string, string> = {
      'unauthenticated': '請先登入後再執行此操作',
      'permission-denied': '您沒有權限執行此操作',
      'not-found': '找不到指定的任務',
      'already-exists': '任務已存在',
      'invalid-argument': '輸入資料無效',
      'deadline-exceeded': '操作逾時，請稍後再試',
      'unavailable': '服務暫時無法使用，請稍後再試'
    };

    return errorMessages[code] || `錯誤代碼: ${code}`;
  }
}
