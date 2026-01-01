/**
 * Shared Services Module
 *
 * Exports UI-related shared services only.
 * Business logic services have been moved to @core.
 *
 * @module shared/services
 */

// Export TenantContextService from platform services
export { TenantContextService } from '@app/platform/services';
export type { TenantContext } from '@app/platform/services/tenant-context.service';

// Backward compatibility alias
export { TenantContextService as WorkspaceContextService } from '@app/platform/services';

export * from './menu-management.service';
export * from './breadcrumb.service';
export * from './permission/permission.service';
