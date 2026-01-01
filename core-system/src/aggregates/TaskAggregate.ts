/**
 * TaskAggregate - Task aggregate root
 * 
 * Manages task lifecycle and enforces business rules.
 * State is derived entirely from events.
 */

import { DomainEvent } from '../events/BaseEvents';
import { 
  TaskStatus, 
  TaskCreatedPayload, 
  TaskUpdatedPayload,
  TaskStatusChangedPayload,
  TaskEventTypes
} from '../events/TaskEvents';

/**
 * Task state
 */
export interface TaskState {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  parentTaskId?: string;
  projectId: string;
  assigneeId?: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

/**
 * Task aggregate
 */
export class TaskAggregate {
  private state: TaskState | null = null;
  private uncommittedEvents: DomainEvent[] = [];

  /**
   * Get current state
   */
  getState(): TaskState | null {
    return this.state;
  }

  /**
   * Get uncommitted events
   */
  getUncommittedEvents(): DomainEvent[] {
    return [...this.uncommittedEvents];
  }

  /**
   * Mark events as committed
   */
  markEventsAsCommitted(): void {
    this.uncommittedEvents = [];
  }

  /**
   * Replay from events (for event sourcing)
   */
  static replayFrom(events: DomainEvent[]): TaskAggregate {
    const aggregate = new TaskAggregate();
    events.forEach(event => aggregate.apply(event, false));
    return aggregate;
  }

  /**
   * Apply event to aggregate
   */
  private apply(event: DomainEvent, isNew: boolean = true): void {
    switch (event.eventType) {
      case TaskEventTypes.TASK_CREATED:
        this.applyTaskCreated(event);
        break;
      case TaskEventTypes.TASK_UPDATED:
        this.applyTaskUpdated(event);
        break;
      case TaskEventTypes.TASK_STATUS_CHANGED:
        this.applyTaskStatusChanged(event);
        break;
    }

    if (isNew) {
      this.uncommittedEvents.push(event);
    }
  }

  private applyTaskCreated(event: DomainEvent<TaskCreatedPayload>): void {
    this.state = {
      id: event.aggregateId,
      title: event.data.title,
      description: event.data.description,
      status: TaskStatus.Todo,
      parentTaskId: event.data.parentTaskId,
      projectId: event.data.projectId,
      assigneeId: event.data.assigneeId,
      dueDate: event.data.dueDate,
      createdAt: event.metadata.timestamp,
      updatedAt: event.metadata.timestamp,
      version: event.version
    };
  }

  private applyTaskUpdated(event: DomainEvent<TaskUpdatedPayload>): void {
    if (!this.state) return;
    
    if (event.data.title) this.state.title = event.data.title;
    if (event.data.description) this.state.description = event.data.description;
    if (event.data.assigneeId) this.state.assigneeId = event.data.assigneeId;
    if (event.data.dueDate) this.state.dueDate = event.data.dueDate;
    this.state.updatedAt = event.metadata.timestamp;
    this.state.version = event.version;
  }

  private applyTaskStatusChanged(event: DomainEvent<TaskStatusChangedPayload>): void {
    if (!this.state) return;
    
    this.state.status = event.data.toStatus;
    this.state.updatedAt = event.metadata.timestamp;
    this.state.version = event.version;
  }
}
