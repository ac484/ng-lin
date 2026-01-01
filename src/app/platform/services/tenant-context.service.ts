/**
 * Platform Tenant Context Service
 * 
 * Manages tenant/blueprint context for multi-tenant operations.
 */

import { Injectable, signal, computed } from '@angular/core';

export interface TenantContext {
  blueprintId: string;
  organizationId?: string;
  teamId?: string;
  userId?: string;
}

@Injectable({ providedIn: 'root' })
export class TenantContextService {
  private readonly context = signal<TenantContext | null>(null);

  /**
   * Get current tenant context
   */
  readonly current = computed(() => this.context());

  /**
   * Get current blueprint ID
   */
  readonly blueprintId = computed(() => this.context()?.blueprintId);

  /**
   * Get current organization ID
   */
  readonly organizationId = computed(() => this.context()?.organizationId);

  /**
   * Get current team ID
   */
  readonly teamId = computed(() => this.context()?.teamId);

  /**
   * Get current user ID
   */
  readonly userId = computed(() => this.context()?.userId);

  /**
   * Set tenant context
   */
  setContext(context: TenantContext): void {
    this.context.set(context);
  }

  /**
   * Clear tenant context
   */
  clearContext(): void {
    this.context.set(null);
  }

  /**
   * Update partial context
   */
  updateContext(partial: Partial<TenantContext>): void {
    const current = this.context();
    if (current) {
      this.context.set({ ...current, ...partial });
    }
  }
}
