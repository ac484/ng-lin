import { Routes } from '@angular/router';

/**
 * Task Domain Routes
 *
 * Defines routing for the task management module.
 * All routes use lazy-loaded standalone components.
 *
 * Routes:
 * - /tasks - Task list view
 * - /tasks/:id - Task detail view
 * - /tasks/create - Task creation form (future)
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/task-list/task-list.component').then(m => m.TaskListComponent),
    data: { title: '任務列表' }
  },
  {
    path: ':id',
    loadComponent: () => import('./components/task-detail/task-detail.component').then(m => m.TaskDetailComponent),
    data: { title: '任務詳情' }
  }
];
