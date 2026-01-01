import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';

import { PlatformEventStoreService } from '@app/platform/event-store';
import { ErrorHandlingService } from '@app/shared/services/error-handling.service';
import { TaskCommandService } from '../../../services/task-command.service';
import { buildTaskDetailProjection, TaskDetailProjection } from '../../../projections/task-detail.projection';
import type { TaskEvent } from '../../../events';

/**
 * Task Detail Component
 *
 * Displays complete task details built from event projection.
 * Demonstrates advanced event-driven architecture:
 * - Fetches aggregate events for specific task
 * - Builds detailed projection with comments, discussions, attachments
 * - Subscribes to real-time event updates
 * - Uses Angular 19+ signals for reactive state
 *
 * Architecture:
 * - UI Layer: This component (display + user interaction)
 * - Projection Layer: buildTaskDetailProjection (pure function)
 * - Event Store: PlatformEventStoreService (event sourcing)
 *
 * @example
 * ```typescript
 * // In routes.ts
 * { path: 'tasks/:id', component: TaskDetailComponent }
 * ```
 */
@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzDescriptionsModule,
    NzTagModule,
    NzButtonModule,
    NzIconModule,
    NzSpinModule,
    NzEmptyModule,
    NzTimelineModule,
    NzDividerModule,
    NzListModule,
    NzAvatarModule
  ],
  template: `
    <nz-card [nzTitle]="cardTitle" [nzExtra]="extraTemplate">
      <ng-template #extraTemplate>
        <button nz-button (click)="handleBack()">
          <i nz-icon nzType="arrow-left"></i>
          返回
        </button>
      </ng-template>

      @if (loading()) {
        <div class="text-center p-lg">
          <nz-spin nzSimple [nzSize]="'large'"></nz-spin>
        </div>
      } @else if (!taskDetail()) {
        <nz-empty nzNotFoundContent="找不到任務"></nz-empty>
      } @else {
        <!-- Task Details -->
        <nz-descriptions nzBordered [nzColumn]="2">
          <nz-descriptions-item nzTitle="任務 ID">
            {{ taskDetail()?.taskId }}
          </nz-descriptions-item>
          <nz-descriptions-item nzTitle="狀態">
            <nz-tag [nzColor]="getStatusColor(taskDetail()?.status || '')">
              {{ getStatusLabel(taskDetail()?.status || '') }}
            </nz-tag>
          </nz-descriptions-item>
          <nz-descriptions-item nzTitle="標題" [nzSpan]="2">
            {{ taskDetail()?.title }}
          </nz-descriptions-item>
          <nz-descriptions-item nzTitle="描述" [nzSpan]="2">
            {{ taskDetail()?.description || '無描述' }}
          </nz-descriptions-item>
          <nz-descriptions-item nzTitle="優先級">
            <nz-tag [nzColor]="getPriorityColor(taskDetail()?.priority || '')">
              {{ getPriorityLabel(taskDetail()?.priority || '') }}
            </nz-tag>
          </nz-descriptions-item>
          <nz-descriptions-item nzTitle="負責人">
            {{ taskDetail()?.assignee || '未指派' }}
          </nz-descriptions-item>
          <nz-descriptions-item nzTitle="建立時間">
            {{ formatDateTime(taskDetail()?.createdAt) }}
          </nz-descriptions-item>
          <nz-descriptions-item nzTitle="更新時間">
            {{ formatDateTime(taskDetail()?.updatedAt) }}
          </nz-descriptions-item>
        </nz-descriptions>

        <nz-divider></nz-divider>

        <!-- Comments Section -->
        <h3>
          <i nz-icon nzType="message"></i>
          評論 ({{ taskDetail()?.comments.length || 0 }})
        </h3>
        @if (taskDetail()?.comments.length === 0) {
          <nz-empty nzNotFoundContent="暫無評論"></nz-empty>
        } @else {
          <nz-list>
            @for (comment of taskDetail()?.comments; track comment.commentId) {
              @if (!comment.deletedAt) {
                <nz-list-item>
                  <nz-list-item-meta>
                    <nz-list-item-meta-avatar>
                      <nz-avatar nzIcon="user"></nz-avatar>
                    </nz-list-item-meta-avatar>
                    <nz-list-item-meta-title>
                      {{ comment.authorId }}
                      <span class="text-grey ml-sm">{{ formatDateTime(comment.createdAt) }}</span>
                      @if (comment.updatedAt && comment.updatedAt !== comment.createdAt) {
                        <nz-tag nzColor="default" class="ml-sm">已編輯</nz-tag>
                      }
                    </nz-list-item-meta-title>
                    <nz-list-item-meta-description>
                      {{ comment.content }}
                    </nz-list-item-meta-description>
                  </nz-list-item-meta>
                </nz-list-item>
              }
            }
          </nz-list>
        }

        <nz-divider></nz-divider>

        <!-- Discussions Section -->
        <h3>
          <i nz-icon nzType="comment"></i>
          討論 ({{ taskDetail()?.discussions.length || 0 }})
        </h3>
        @if (taskDetail()?.discussions.length === 0) {
          <nz-empty nzNotFoundContent="暫無討論"></nz-empty>
        } @else {
          @for (discussion of taskDetail()?.discussions; track discussion.discussionId) {
            <nz-card [nzTitle]="discussion.topic" class="mb-md">
              <nz-timeline>
                @for (message of discussion.messages; track message.messageId) {
                  <nz-timeline-item>
                    <p>
                      <strong>{{ message.authorId }}</strong>
                      <span class="text-grey ml-sm">{{ formatDateTime(message.postedAt) }}</span>
                    </p>
                    <p>{{ message.content }}</p>
                  </nz-timeline-item>
                }
              </nz-timeline>
            </nz-card>
          }
        }

        <nz-divider></nz-divider>

        <!-- Attachments Section -->
        <h3>
          <i nz-icon nzType="paper-clip"></i>
          附件 ({{ taskDetail()?.attachments.length || 0 }})
        </h3>
        @if (taskDetail()?.attachments.length === 0) {
          <nz-empty nzNotFoundContent="暫無附件"></nz-empty>
        } @else {
          <nz-list>
            @for (attachment of taskDetail()?.attachments; track attachment.attachmentId) {
              @if (!attachment.deletedAt) {
                <nz-list-item>
                  <nz-list-item-meta>
                    <nz-list-item-meta-avatar>
                      <i nz-icon nzType="file" [nzTheme]="'twotone'"></i>
                    </nz-list-item-meta-avatar>
                    <nz-list-item-meta-title>
                      {{ attachment.fileName }}
                    </nz-list-item-meta-title>
                    <nz-list-item-meta-description>
                      {{ formatFileSize(attachment.fileSize) }} •
                      上傳於 {{ formatDateTime(attachment.uploadedAt) }}
                    </nz-list-item-meta-description>
                  </nz-list-item-meta>
                  <ul nz-list-item-actions>
                    <nz-list-item-action>
                      <a (click)="handleDownload(attachment.fileUrl)">下載</a>
                    </nz-list-item-action>
                  </ul>
                </nz-list-item>
              }
            }
          </nz-list>
        }
      }
    </nz-card>
  `,
  styles: [
    `
      .text-grey {
        color: #999;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskDetailComponent implements OnInit {
  private readonly eventStore = inject(PlatformEventStoreService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly errorHandler = inject(ErrorHandlingService);
  private readonly commandService = inject(TaskCommandService);

  // Reactive state using Angular 19+ signals
  protected readonly loading = signal<boolean>(true);
  protected readonly taskDetail = signal<TaskDetailProjection | null>(null);
  protected readonly cardTitle = signal<string>('任務詳情');

  async ngOnInit(): Promise<void> {
    const taskId = this.route.snapshot.paramMap.get('id');
    if (!taskId) {
      void this.router.navigate(['/tasks']);
      return;
    }

    await this.loadTaskDetail(taskId);
    this.subscribeToTaskEvents(taskId);
  }

  /**
   * Load task details by building projection from aggregate events
   * Demonstrates Event Sourcing: State = replay(events for specific aggregate)
   */
  private async loadTaskDetail(taskId: string): Promise<void> {
    try {
      this.loading.set(true);

      // Get all events for this specific task aggregate
      const events = await this.eventStore.getEventsForAggregateAsync('task', taskId);

      // Build detailed projection from events (pure function)
      const detail = buildTaskDetailProjection(events as unknown as TaskEvent[]);

      // Update reactive state
      this.taskDetail.set(detail);
      if (detail) {
        this.cardTitle.set(`任務詳情 - ${detail.title}`);
      }
    } catch (error) {
      this.errorHandler.handleError(error, {
        userMessage: '載入任務詳情失敗',
        showToast: true,
        context: 'TaskDetail.loadTaskDetail',
        metadata: { taskId },
        sendToTracking: true
      });
      this.taskDetail.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Subscribe to real-time task events for this specific task
   * Automatically rebuilds projection when new events arrive
   */
  private subscribeToTaskEvents(taskId: string): void {
    this.eventStore.subscribe('task', async (event: any) => {
      // Only reload if the event is for this specific task
      if (event.aggregateId === taskId) {
        await this.loadTaskDetail(taskId);
      }
    });
  }

  /**
   * Navigate back to task list
   */
  protected handleBack(): void {
    void this.router.navigate(['/tasks']);
  }

  /**
   * Handle attachment download
   */
  protected handleDownload(url: string): void {
    window.open(url, '_blank');
  }

  // UI Helper Methods
  protected getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      pending: 'default',
      in_progress: 'processing',
      completed: 'success',
      cancelled: 'error'
    };
    return colorMap[status] || 'default';
  }

  protected getStatusLabel(status: string): string {
    const labelMap: Record<string, string> = {
      pending: '待處理',
      in_progress: '進行中',
      completed: '已完成',
      cancelled: '已取消'
    };
    return labelMap[status] || status;
  }

  protected getPriorityColor(priority: string): string {
    const colorMap: Record<string, string> = {
      low: 'default',
      medium: 'warning',
      high: 'error',
      urgent: 'error'
    };
    return colorMap[priority] || 'default';
  }

  protected getPriorityLabel(priority: string): string {
    const labelMap: Record<string, string> = {
      low: '低',
      medium: '中',
      high: '高',
      urgent: '緊急'
    };
    return labelMap[priority] || priority;
  }

  protected formatDateTime(date: Date | string | undefined): string {
    if (!date) return '—';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  protected formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
