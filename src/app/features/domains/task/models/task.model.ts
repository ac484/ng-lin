/**
 * Task Read Model
 */

export interface TaskModel {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  readonly priority?: 'low' | 'medium' | 'high' | 'urgent';
  readonly creatorId: string;
  readonly assigneeId?: string;
  readonly orgId?: string;
  readonly teamId?: string;
  readonly createdAt: Date;
  readonly updatedAt?: Date;
  readonly startedAt?: Date;
  readonly completedAt?: Date;
}
