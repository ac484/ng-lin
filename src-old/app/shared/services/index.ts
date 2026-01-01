/**
 * Shared Services Module
 *
 * Exports UI-related shared services only.
 * Business logic services have been moved to @core.
 *
 * @module shared/services
 */

// Export TenantContextService from platform services
export { TenantContextService } from '../../platform/services';
export type { TenantContext } from '../../platform/services/tenant-context.service';

// Backward compatibility alias
export { TenantContextService as WorkspaceContextService } from '../../platform/services';

export * from './menu-management.service';
export * from './breadcrumb.service';
export * from './permission/permission.service';
