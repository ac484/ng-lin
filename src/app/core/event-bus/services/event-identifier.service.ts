import { Injectable, inject } from '@angular/core';
import {
  EventIdentifier,
  Namespace,
  NamespaceValidation,
  ParsedEventReference,
  SequenceConfig,
  IdentifiedEvent,
  EventLevel
} from '../models/event-identifier.model';

/**
 * Event Identifier Service
 * 
 * Implements the two-tier identifier system (namespace#sequence)
 * following GitHub's design philosophy for multi-tenant event identification.
 * 
 * Key responsibilities:
 * - Generate event identifiers with namespace + sequence
 * - Parse and validate event references
 * - Manage sequence numbers per namespace
 * - Ensure global uniqueness and tenant isolation
 * 
 * @example
 * ```typescript
 * const service = inject(EventIdentifierService);
 * 
 * // Generate identifier
 * const id = service.generateEventId('qrl', 'trading', 'order', 1024);
 * // Result: { namespace: "qrl.trading.order", sequence: 1024, fullReference: "qrl.trading.order#1024" }
 * 
 * // Parse reference
 * const parsed = service.parseEventId('qrl.trading.order#1024');
 * // Result: { success: true, identifier: {...} }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class EventIdentifierService {
  /** In-memory sequence counters (keyed by namespace) */
  private sequenceCounters = new Map<string, number>();

  /**
   * Generate a new event identifier
   * 
   * @param tenant Tenant identifier
   * @param context Business context
   * @param aggregate Aggregate/entity type
   * @param sequence Sequence number (auto-increment if not provided)
   * @returns Generated event identifier
   */
  generateEventId(
    tenant: string,
    context: string,
    aggregate: string,
    sequence?: number
  ): EventIdentifier {
    const namespace = this.buildNamespace(tenant, context, aggregate);
    const seq = sequence ?? this.getNextSequence(namespace);

    return {
      namespace,
      sequence: seq,
      fullReference: `${namespace}#${seq}`,
      namespaceStructure: { tenant, context, aggregate, fullPath: namespace }
    };
  }

  /**
   * Build namespace path from components
   * 
   * @param tenant Tenant identifier
   * @param context Business context
   * @param aggregate Aggregate type
   * @returns Namespace path (tenant.context.aggregate)
   */
  buildNamespace(tenant: string, context: string, aggregate: string): string {
    return `${tenant}.${context}.${aggregate}`;
  }

  /**
   * Parse namespace into components
   * 
   * @param namespace Namespace path
   * @returns Namespace structure
   */
  parseNamespace(namespace: string): Namespace | null {
    const parts = namespace.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [tenant, context, aggregate] = parts;
    return {
      tenant,
      context,
      aggregate,
      fullPath: namespace
    };
  }

  /**
   * Parse event reference (namespace#sequence)
   * 
   * @param fullReference Full event reference string
   * @returns Parsed event reference result
   */
  parseEventId(fullReference: string): ParsedEventReference {
    const match = fullReference.match(/^(.+)#(\d+)$/);
    
    if (!match) {
      return {
        success: false,
        error: 'Invalid event reference format. Expected: namespace#sequence'
      };
    }

    const namespace = match[1];
    const sequence = parseInt(match[2], 10);

    const namespaceStructure = this.parseNamespace(namespace);
    if (!namespaceStructure) {
      return {
        success: false,
        error: 'Invalid namespace format. Expected: tenant.context.aggregate'
      };
    }

    return {
      success: true,
      identifier: {
        namespace,
        sequence,
        fullReference,
        namespaceStructure
      }
    };
  }

  /**
   * Validate namespace format and structure
   * 
   * @param namespace Namespace to validate
   * @returns Validation result
   */
  validateNamespace(namespace: string): NamespaceValidation {
    const errors: string[] = [];

    // Check format
    if (!namespace || typeof namespace !== 'string') {
      errors.push('Namespace must be a non-empty string');
      return { valid: false, errors };
    }

    // Parse into components
    const parts = namespace.split('.');
    if (parts.length !== 3) {
      errors.push('Namespace must have exactly 3 parts: tenant.context.aggregate');
      return { valid: false, errors };
    }

    const [tenant, context, aggregate] = parts;

    // Validate each component
    if (!this.isValidComponent(tenant)) {
      errors.push('Tenant must contain only alphanumeric characters, hyphens, and underscores');
    }
    if (!this.isValidComponent(context)) {
      errors.push('Context must contain only alphanumeric characters, hyphens, and underscores');
    }
    if (!this.isValidComponent(aggregate)) {
      errors.push('Aggregate must contain only alphanumeric characters, hyphens, and underscores');
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    return {
      valid: true,
      namespace: { tenant, context, aggregate, fullPath: namespace }
    };
  }

  /**
   * Check if a component name is valid
   * 
   * @param component Component to validate
   * @returns Whether component is valid
   */
  private isValidComponent(component: string): boolean {
    return /^[a-zA-Z0-9_-]+$/.test(component);
  }

  /**
   * Get next sequence number for namespace
   * 
   * @param namespace Namespace path
   * @returns Next sequence number
   */
  private getNextSequence(namespace: string): number {
    const current = this.sequenceCounters.get(namespace) ?? 0;
    const next = current + 1;
    this.sequenceCounters.set(namespace, next);
    return next;
  }

  /**
   * Get current sequence for namespace
   * 
   * @param namespace Namespace path
   * @returns Current sequence number
   */
  getCurrentSequence(namespace: string): number {
    return this.sequenceCounters.get(namespace) ?? 0;
  }

  /**
   * Set sequence counter for namespace
   * 
   * @param namespace Namespace path
   * @param sequence Sequence number to set
   */
  setSequence(namespace: string, sequence: number): void {
    if (sequence < 0) {
      throw new Error('Sequence must be non-negative');
    }
    this.sequenceCounters.set(namespace, sequence);
  }

  /**
   * Reset sequence counter for namespace
   * 
   * @param namespace Namespace path
   */
  resetSequence(namespace: string): void {
    this.sequenceCounters.delete(namespace);
  }

  /**
   * Create an identified event at a specific level
   * 
   * @param identifier Event identifier
   * @param level Event level (L-1, L0, L1, L2)
   * @param eventType Event type (for L1 and above)
   * @param payload Event payload
   * @param metadata Event metadata
   * @returns Identified event
   */
  createIdentifiedEvent(
    identifier: EventIdentifier,
    level: EventLevel,
    eventType?: string,
    payload?: unknown,
    metadata?: Record<string, unknown>
  ): IdentifiedEvent {
    return {
      identifier,
      level,
      eventType,
      timestamp: new Date(),
      payload,
      metadata
    };
  }

  /**
   * Generate full event reference for display
   * 
   * @param tenant Tenant identifier
   * @param context Business context
   * @param aggregate Aggregate type
   * @param sequence Sequence number
   * @returns Full reference string
   */
  formatEventReference(
    tenant: string,
    context: string,
    aggregate: string,
    sequence: number
  ): string {
    const namespace = this.buildNamespace(tenant, context, aggregate);
    return `${namespace}#${sequence}`;
  }

  /**
   * Check if two event identifiers are equal
   * 
   * @param id1 First identifier
   * @param id2 Second identifier
   * @returns Whether identifiers are equal
   */
  areIdentifiersEqual(id1: EventIdentifier, id2: EventIdentifier): boolean {
    return id1.fullReference === id2.fullReference;
  }

  /**
   * Extract tenant from event identifier
   * 
   * @param identifier Event identifier
   * @returns Tenant identifier
   */
  extractTenant(identifier: EventIdentifier): string | null {
    return identifier.namespaceStructure?.tenant ?? null;
  }

  /**
   * Extract context from event identifier
   * 
   * @param identifier Event identifier
   * @returns Context identifier
   */
  extractContext(identifier: EventIdentifier): string | null {
    return identifier.namespaceStructure?.context ?? null;
  }

  /**
   * Extract aggregate from event identifier
   * 
   * @param identifier Event identifier
   * @returns Aggregate identifier
   */
  extractAggregate(identifier: EventIdentifier): string | null {
    return identifier.namespaceStructure?.aggregate ?? null;
  }

  /**
   * Check if identifier belongs to tenant
   * 
   * @param identifier Event identifier
   * @param tenant Tenant to check
   * @returns Whether identifier belongs to tenant
   */
  belongsToTenant(identifier: EventIdentifier, tenant: string): boolean {
    return this.extractTenant(identifier) === tenant;
  }

  /**
   * Get all namespaces with active sequences
   * 
   * @returns Array of namespace paths
   */
  getActiveNamespaces(): string[] {
    return Array.from(this.sequenceCounters.keys());
  }

  /**
   * Get sequence configuration for namespace
   * 
   * @param namespace Namespace path
   * @returns Sequence configuration
   */
  getSequenceConfig(namespace: string): SequenceConfig {
    return {
      namespace,
      currentSequence: this.getCurrentSequence(namespace),
      increment: 1,
      startFrom: 1,
      lastUpdated: new Date()
    };
  }
}
