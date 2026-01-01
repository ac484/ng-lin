/**
 * Platform Event Publisher
 * 
 * Type-safe publisher for platform entity events.
 * Provides convenience methods for publishing User, Organization, Team, Collaborator, and Bot events.
 * 
 * @example
 * ```typescript
 * // Publish a user created event
 * await publisher.publishUserCreated({
 *   userId: 'user_123',
 *   email: 'user@example.com',
 *   displayName: 'John Doe'
 * });
 * 
 * // Publish an organization created event
 * await publisher.publishOrganizationCreated({
 *   orgId: 'org_456',
 *   name: 'Acme Corp'
 * });
 * ```
 */

import { Injectable, inject } from '@angular/core';
import { PlatformEventStoreService } from './platform-event-store.service';
import type { DomainEvent } from '../../core/event-bus';

/**
 * Helper to create a platform domain event
 */
function createPlatformEvent<T = any>(
  eventType: string,
  aggregateType: string,
  aggregateId: string,
  payload: T,
  metadata?: Partial<DomainEvent['metadata']>
): DomainEvent {
  return {
    eventId: generateEventId(),
    eventType,
    timestamp: new Date(),
    aggregateId,
    aggregateType,
    payload,
    metadata: {
      version: '1.0',
      source: 'platform',
      ...metadata
    }
  } as DomainEvent;
}

/**
 * Generate a unique event ID
 */
function generateEventId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `evt_${timestamp}_${random}`;
}

/**
 * Platform Event Publisher Service
 * 
 * Provides typed methods for publishing platform entity events.
 * All methods validate and route events through the platform event store.
 */
@Injectable({ providedIn: 'root' })
export class PlatformEventPublisherService {
  private readonly eventStore = inject(PlatformEventStoreService);

  // ============ User Events ============

  /**
   * Publish a user created event
   */
  async publishUserCreated(payload: {
    userId: string;
    email: string;
    displayName: string;
    createdAt?: Date;
  }): Promise<void> {
    const event = createPlatformEvent(
      'user.created',
      'user',
      payload.userId,
      { ...payload, createdAt: payload.createdAt ?? new Date() }
    );
    await this.eventStore.publish(event);
  }

  /**
   * Publish a user updated event
   */
  async publishUserUpdated(payload: {
    userId: string;
    updates: Partial<{
      displayName: string;
      email: string;
      photoURL: string;
    }>;
    updatedAt?: Date;
  }): Promise<void> {
    const event = createPlatformEvent(
      'user.updated',
      'user',
      payload.userId,
      { ...payload, updatedAt: payload.updatedAt ?? new Date() }
    );
    await this.eventStore.publish(event);
  }

  /**
   * Publish a user deactivated event
   */
  async publishUserDeactivated(payload: {
    userId: string;
    reason?: string;
    deactivatedAt?: Date;
  }): Promise<void> {
    const event = createPlatformEvent(
      'user.deactivated',
      'user',
      payload.userId,
      { ...payload, deactivatedAt: payload.deactivatedAt ?? new Date() }
    );
    await this.eventStore.publish(event);
  }

  // ============ Organization Events ============

  /**
   * Publish an organization created event
   */
  async publishOrganizationCreated(payload: {
    orgId: string;
    name: string;
    createdBy: string;
    createdAt?: Date;
  }): Promise<void> {
    const event = createPlatformEvent(
      'organization.created',
      'organization',
      payload.orgId,
      { ...payload, createdAt: payload.createdAt ?? new Date() }
    );
    await this.eventStore.publish(event);
  }

  /**
   * Publish an organization updated event
   */
  async publishOrganizationUpdated(payload: {
    orgId: string;
    updates: Partial<{
      name: string;
      description: string;
    }>;
    updatedAt?: Date;
  }): Promise<void> {
    const event = createPlatformEvent(
      'organization.updated',
      'organization',
      payload.orgId,
      { ...payload, updatedAt: payload.updatedAt ?? new Date() }
    );
    await this.eventStore.publish(event);
  }

  // ============ Team Events ============

  /**
   * Publish a team created event
   */
  async publishTeamCreated(payload: {
    teamId: string;
    orgId: string;
    name: string;
    createdBy: string;
    createdAt?: Date;
  }): Promise<void> {
    const event = createPlatformEvent(
      'team.created',
      'team',
      payload.teamId,
      { ...payload, createdAt: payload.createdAt ?? new Date() },
      { organizationId: payload.orgId }
    );
    await this.eventStore.publish(event);
  }

  /**
   * Publish a team member added event
   */
  async publishTeamMemberAdded(payload: {
    teamId: string;
    userId: string;
    role: string;
    addedBy: string;
    addedAt?: Date;
  }): Promise<void> {
    const event = createPlatformEvent(
      'team.member.added',
      'team',
      payload.teamId,
      { ...payload, addedAt: payload.addedAt ?? new Date() }
    );
    await this.eventStore.publish(event);
  }

  // ============ Collaborator Events ============

  /**
   * Publish a collaborator invited event
   */
  async publishCollaboratorInvited(payload: {
    collaboratorId: string;
    email: string;
    invitedBy: string;
    entityType: 'organization' | 'team';
    entityId: string;
    role: string;
    invitedAt?: Date;
  }): Promise<void> {
    const event = createPlatformEvent(
      'collaborator.invited',
      'collaborator',
      payload.collaboratorId,
      { ...payload, invitedAt: payload.invitedAt ?? new Date() }
    );
    await this.eventStore.publish(event);
  }

  /**
   * Publish a collaborator accepted invitation event
   */
  async publishCollaboratorAccepted(payload: {
    collaboratorId: string;
    userId: string;
    acceptedAt?: Date;
  }): Promise<void> {
    const event = createPlatformEvent(
      'collaborator.accepted',
      'collaborator',
      payload.collaboratorId,
      { ...payload, acceptedAt: payload.acceptedAt ?? new Date() }
    );
    await this.eventStore.publish(event);
  }

  // ============ Bot Events ============

  /**
   * Publish a bot created event
   */
  async publishBotCreated(payload: {
    botId: string;
    name: string;
    type: string;
    createdBy: string;
    createdAt?: Date;
  }): Promise<void> {
    const event = createPlatformEvent(
      'bot.created',
      'bot',
      payload.botId,
      { ...payload, createdAt: payload.createdAt ?? new Date() }
    );
    await this.eventStore.publish(event);
  }

  /**
   * Publish a bot action executed event
   */
  async publishBotActionExecuted(payload: {
    botId: string;
    action: string;
    result: 'success' | 'failure';
    details?: Record<string, any>;
    executedAt?: Date;
  }): Promise<void> {
    const event = createPlatformEvent(
      'bot.action.executed',
      'bot',
      payload.botId,
      { ...payload, executedAt: payload.executedAt ?? new Date() }
    );
    await this.eventStore.publish(event);
  }
}
