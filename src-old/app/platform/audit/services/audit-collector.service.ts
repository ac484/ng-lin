/**
 * Platform Audit Collector Service
 * 
 * Collects and routes audit events to storage.
 */

import { Injectable, inject } from '@angular/core';
import { AuditEvent, AuditLevel, AuditCategory } from '../models';
import { generateEventId } from '../../event-bus/models';

@Injectable({ providedIn: 'root' })
export class AuditCollectorService {
  private readonly events: AuditEvent[] = [];

  /**
   * Collect an audit event
   */
  async collect(event: Partial<AuditEvent>): Promise<void> {
    const auditEvent: AuditEvent = {
      id: event.id || generateEventId(),
      timestamp: event.timestamp || new Date(),
      level: event.level || AuditLevel.INFO,
      category: event.category || AuditCategory.SYSTEM,
      action: event.action || 'unknown',
      actorId: event.actorId,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
      blueprintId: event.blueprintId,
      organizationId: event.organizationId,
      details: event.details,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      result: event.result,
      errorMessage: event.errorMessage
    };

    // Store in memory (in production, this would go to a database)
    this.events.push(auditEvent);

    // Log to console in development
    if (auditEvent.level === AuditLevel.ERROR || auditEvent.level === AuditLevel.CRITICAL) {
      console.error('[Audit]', auditEvent);
    } else {
      console.log('[Audit]', auditEvent);
    }
  }

  /**
   * Get all collected audit events
   */
  getEvents(): AuditEvent[] {
    return [...this.events];
  }

  /**
   * Clear all collected events (for testing)
   */
  clear(): void {
    this.events.length = 0;
  }
}
