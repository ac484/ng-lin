/**
 * Task Domain UI Layer
 *
 * This module contains all UI components for the Task domain.
 *
 * Structure:
 * - components/task-list - List view with filtering and search
 * - components/task-detail - Detail view with comments, discussions, attachments
 * - task.routes.ts - Routing configuration
 *
 * Components consume:
 * - Task projections for read models (buildTaskDetailProjection, buildTaskListProjection)
 * - Platform event store for real-time updates (PlatformEventStoreService)
 * - Angular 19+ signals for reactive state management
 *
 * Key Features:
 * - Event-driven reactive updates
 * - Pure projection-based state (State = replay(events))
 * - Real-time subscriptions to task events
 * - Standalone components with lazy loading
 */

// Export components
export { TaskListComponent } from './components/task-list/task-list.component';
export { TaskDetailComponent } from './components/task-detail/task-detail.component';

// Export routes
export { routes as taskRoutes } from './task.routes';
