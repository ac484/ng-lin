import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormsModule } from '@angular/forms';

import { PlatformEventStoreService } from '@app/platform/event-store';
import { buildTaskListProjection, filterByStatus, TaskListItem } from '../../../projections/task-list.projection';
import type { TaskEvent } from '../../../events';

/**
 * Task List Component
 *
 * Displays a reactive list of tasks built from event projections.
 * Demonstrates complete event-driven architecture:
 * - Fetches events from PlatformEventStoreService
 * - Builds projections using pure functions
 * - Updates reactively when new events arrive
 * - Uses Angular 19+ signals for state management
 *
 * Architecture:
 * - UI Layer: This component (display + user interaction)
 * - Projection Layer: buildTaskListProjection (pure function)
 * - Event Store: PlatformEventStoreService (event sourcing)
 *
 * @example
 * ```typescript
 * // In routes.ts
 * { path: 'tasks', component: TaskListComponent }
 * ```
 */
@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzTableModule,
    NzTagModule,
    NzButtonModule,
    NzIconModule,
    NzSpinModule,
    NzEmptyModule,
    NzBadgeModule,
    NzSelectModule,
    NzInputModule
  ],
  template: `
    <nz-card nzTitle="任務列表" [nzExtra]="extraTemplate">
      <ng-template #extraTemplate>
        <button nz-button nzType="primary" (click)="handleCreateTask()">
          <i nz-icon nzType="plus"></i>
          新增任務
        </button>
      </ng-template>

      <!-- Filters -->
      <div class="mb-md">
        <nz-select
          [(ngModel)]="statusFilter"
          (ngModelChange)="applyFilters()"
          nzPlaceHolder="狀態篩選"
          class="mr-sm"
          style="width: 150px"
        >
          <nz-option nzValue="all" nzLabel="全部狀態"></nz-option>
          <nz-option nzValue="pending" nzLabel="待處理"></nz-option>
          <nz-option nzValue="in_progress" nzLabel="進行中"></nz-option>
          <nz-option nzValue="completed" nzLabel="已完成"></nz-option>
          <nz-option nzValue="cancelled" nzLabel="已取消"></nz-option>
        </nz-select>

        <nz-input-group [nzSuffix]="suffixIconSearch" style="width: 250px">
          <input
            type="text"
            nz-input
            placeholder="搜尋任務標題"
            [(ngModel)]="searchText"
            (ngModelChange)="applyFilters()"
          />
        </nz-input-group>
        <ng-template #suffixIconSearch>
          <i nz-icon nzType="search"></i>
        </ng-template>
      </div>

      @if (loading()) {
        <div class="text-center p-lg">
          <nz-spin nzSimple [nzSize]="'large'"></nz-spin>
        </div>
      } @else if (filteredTasks().length === 0) {
        <nz-empty
          [nzNotFoundContent]="tasks().length === 0 ? '暫無任務，請新增第一個任務' : '沒有符合條件的任務'"
        ></nz-empty>
      } @else {
        <nz-table
          #taskTable
          [nzData]="filteredTasks()"
          [nzShowPagination]="true"
          [nzPageSize]="10"
          [nzFrontPagination]="true"
        >
          <thead>
            <tr>
              <th>標題</th>
              <th>狀態</th>
              <th>優先級</th>
              <th>負責人</th>
              <th>統計</th>
              <th>建立時間</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            @for (task of taskTable.data; track task.taskId) {
              <tr>
                <td>
                  <a (click)="handleViewTask(task.taskId)" class="point">
                    {{ task.title }}
                  </a>
                </td>
                <td>
                  <nz-tag [nzColor]="getStatusColor(task.status)">
                    {{ getStatusLabel(task.status) }}
                  </nz-tag>
                </td>
                <td>
                  <nz-tag [nzColor]="getPriorityColor(task.priority)">
                    {{ getPriorityLabel(task.priority) }}
                  </nz-tag>
                </td>
                <td>{{ task.assignee || '未指派' }}</td>
                <td>
                  <nz-badge
                    [nzCount]="task.commentCount"
                    [nzShowZero]="true"
                    [nzOverflowCount]="99"
                    nzTitle="評論數"
                  >
                    <i nz-icon nzType="message" class="mr-sm"></i>
                  </nz-badge>
                  <nz-badge
                    [nzCount]="task.attachmentCount"
                    [nzShowZero]="true"
                    [nzOverflowCount]="99"
                    nzTitle="附件數"
                  >
                    <i nz-icon nzType="paper-clip" class="mr-sm"></i>
                  </nz-badge>
                  <nz-badge
                    [nzCount]="task.discussionCount"
                    [nzShowZero]="true"
                    [nzOverflowCount]="99"
                    nzTitle="討論數"
                  >
                    <i nz-icon nzType="message" class="mr-sm"></i>
                  </nz-badge>
                </td>
                <td>{{ formatDate(task.createdAt) }}</td>
                <td>
                  <button
                    nz-button
                    nzType="link"
                    nzSize="small"
                    (click)="handleViewTask(task.taskId)"
                  >
                    查看
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </nz-table>
      }
    </nz-card>
  `,
  styles: [
    `
      .point {
        cursor: pointer;
      }
      .point:hover {
        color: #1890ff;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskListComponent implements OnInit {
  private readonly eventStore = inject(PlatformEventStoreService);
  private readonly router = inject(Router);

  // Reactive state using Angular 19+ signals
  protected readonly loading = signal<boolean>(true);
  protected readonly tasks = signal<TaskListItem[]>([]);
  protected statusFilter = 'all';
  protected searchText = '';

  // Computed filtered tasks
  protected readonly filteredTasks = computed(() => {
    let filtered = this.tasks();

    // Filter by status
    if (this.statusFilter !== 'all') {
      filtered = filterByStatus(filtered, [this.statusFilter]);
    }

    // Filter by search text
    if (this.searchText.trim()) {
      const search = this.searchText.toLowerCase().trim();
      filtered = filtered.filter(task => task.title.toLowerCase().includes(search));
    }

    return filtered;
  });

  async ngOnInit(): Promise<void> {
    await this.loadTasks();
    this.subscribeToTaskEvents();
  }

  /**
   * Load all tasks by building projection from events
   * Demonstrates Event Sourcing: State = replay(events)
   */
  private async loadTasks(): Promise<void> {
    try {
      this.loading.set(true);

      // Get all task events from event store
      const events = await this.eventStore.getEventsForNamespace('task');

      // Build projection from events (pure function)
      const taskList = buildTaskListProjection(events as TaskEvent[]);

      // Update reactive state
      this.tasks.set(taskList);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Subscribe to real-time task events
   * Automatically rebuilds projection when new events arrive
   */
  private subscribeToTaskEvents(): void {
    this.eventStore.subscribe('task', async () => {
      // Reload tasks when any task event occurs
      await this.loadTasks();
    });
  }

  /**
   * Apply filters (triggers computed signal recalculation)
   */
  protected applyFilters(): void {
    // Filters are applied automatically via computed signal
    // This method exists for explicit filter triggering if needed
  }

  /**
   * Navigate to task detail view
   */
  protected handleViewTask(taskId: string): void {
    void this.router.navigate(['/tasks', taskId]);
  }

  /**
   * Navigate to create task form
   */
  protected handleCreateTask(): void {
    void this.router.navigate(['/tasks', 'create']);
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

  protected formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }
}
