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

  // Legacy compatibility properties (stubs for now)
  readonly contextType = computed(() => 'user' as const);
  readonly contextId = computed(() => this.context()?.userId || '');
  readonly currentUser = computed(() => null as any);
  readonly organizations = computed(() => [] as any[]);
  readonly teams = computed(() => [] as any[]);
  readonly partners = computed(() => [] as any[]);
  readonly bots = computed(() => [] as any[]);
  readonly teamsByOrganization = computed(() => ({} as Record<string, any[]>));
  readonly partnersByOrganization = computed(() => ({} as Record<string, any[]>));
  readonly contextLabel = computed(() => '');
  readonly contextIcon = computed(() => '');
  readonly switching = signal(false);

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

  // Legacy compatibility methods (stubs for now)
  switchToUser(userId?: string): void {
    console.warn('switchToUser not yet implemented');
  }

  switchToOrganization(orgId: string): void {
    console.warn('switchToOrganization not yet implemented');
  }

  switchToTeam(teamId: string): void {
    console.warn('switchToTeam not yet implemented');
  }

  switchToPartner(partnerId: string): void {
    console.warn('switchToPartner not yet implemented');
  }

  switchToBot(botId: string): void {
    console.warn('switchToBot not yet implemented');
  }

  getTeamsForOrg(orgId: string): any[] {
    return [];
  }

  getPartnersForOrg(orgId: string): any[] {
    return [];
  }

  reloadData(): void {
    console.warn('reloadData not yet implemented');
  }
}

