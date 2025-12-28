/**
 * Identity Context Enrichment Middleware
 * 
 * IDCTX-P3-002: EventBus Payload auto-attach Context
 * 
 * Automatically enriches all events with identity context including:
 * - tenantId
 * - userId  
 * - correlationId
 * - deviceId
 * - roles
 * 
 * This middleware works in conjunction with TenantValidationMiddleware
 * to provide complete context propagation across the event bus.
 */

import { Injectable, inject } from '@angular/core';
import { DomainEvent } from '../models/base-event';
import { IdentityContextService } from '../../services/identity-context.service';

/**
 * Identity Context Enrichment Middleware
 */
@Injectable({ providedIn: 'root' })
export class IdentityContextMiddleware {
  private readonly identityContext = inject(IdentityContextService);
  
  /**
   * Enrich event with full identity context
   * 
   * Adds/updates event metadata with:
   * - userId: Current authenticated user
   * - tenantId: Current tenant context
   * - correlationId: Request correlation ID
   * - deviceId: Current device identifier
   * - roles: User's current roles
   * 
   * @param event - Domain event to enrich
   * @returns Event with enriched metadata
   */
  enrich<T extends DomainEvent>(event: T): T {
    const context = this.identityContext.getIdentityContext();
    
    // Build enriched metadata preserving existing values
    const enrichedMetadata = {
      ...event.metadata,
      userId: event.metadata.userId ?? context.userId ?? undefined,
      tenantId: event.metadata.tenantId ?? context.tenantId ?? undefined,
      correlationId: event.metadata.correlationId ?? context.correlationId ?? undefined,
      deviceId: event.metadata.deviceId ?? undefined, // Could be added to IdentityContext
      roles: event.metadata.roles ?? context.roles ?? undefined
    };
    
    // Return event with enriched metadata
    return {
      ...event,
      metadata: enrichedMetadata
    } as T;
  }
  
  /**
   * Enrich batch of events
   * 
   * @param events - Array of events to enrich
   * @returns Array of enriched events
   */
  enrichBatch<T extends DomainEvent>(events: T[]): T[] {
    return events.map(event => this.enrich(event));
  }
  
  /**
   * Get current identity context snapshot
   * Useful for manual event creation
   */
  getContextSnapshot() {
    const context = this.identityContext.getIdentityContext();
    
    return {
      userId: context.userId ?? undefined,
      tenantId: context.tenantId ?? undefined,
      correlationId: context.correlationId ?? undefined,
      deviceId: undefined, // Will be captured from IdentityContext if available
      roles: context.roles ?? undefined
    };
  }
  
  /**
   * Check if identity context is available
   */
  hasIdentityContext(): boolean {
    const context = this.identityContext.getIdentityContext();
    return !!(context.userId || context.tenantId);
  }
}
