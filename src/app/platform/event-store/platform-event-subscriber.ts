/**
 * Platform Event Subscriber
 * 
 * Type-safe subscriber for platform entity events.
 * Provides convenience methods and reactive streams for consuming platform events.
 * 
 * @example
 * ```typescript
 * // Subscribe to user created events
 * subscriber.onUserCreated$.subscribe(event => {
 *   console.log('New user:', event.payload);
 * });
 * 
 * // Subscribe to all organization events
 * subscriber.onOrganizationEvents$.subscribe(event => {
 *   console.log('Organization event:', event);
 * });
 * ```
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { PlatformEventStoreService } from './platform-event-store.service';
import type { DomainEvent } from '../../core/event-bus';

/**
 * Platform Event Subscriber Service
 * 
 * Provides reactive streams for consuming platform entity events.
 * All streams are hot observables that emit events as they occur.
 */
@Injectable({ providedIn: 'root' })
export class PlatformEventSubscriberService {
  private readonly eventStore = inject(PlatformEventStoreService);

  // ============ User Event Streams ============

  /**
   * Stream of user created events
   */
  readonly onUserCreated$: Observable<DomainEvent> = this.eventStore
    .subscribe('user.created', () => {});

  /**
   * Stream of user updated events
   */
  readonly onUserUpdated$: Observable<DomainEvent> = this.eventStore
    .subscribe('user.updated', () => {});

  /**
   * Stream of user deactivated events
   */
  readonly onUserDeactivated$: Observable<DomainEvent> = this.eventStore
    .subscribe('user.deactivated', () => {});

  /**
   * Stream of all user events
   */
  readonly onUserEvents$: Observable<DomainEvent> = this.eventStore
    .getEventsForNamespace('user');

  // ============ Organization Event Streams ============

  /**
   * Stream of organization created events
   */
  readonly onOrganizationCreated$: Observable<DomainEvent> = this.eventStore
    .subscribe('organization.created', () => {});

  /**
   * Stream of organization updated events
   */
  readonly onOrganizationUpdated$: Observable<DomainEvent> = this.eventStore
    .subscribe('organization.updated', () => {});

  /**
   * Stream of all organization events
   */
  readonly onOrganizationEvents$: Observable<DomainEvent> = this.eventStore
    .getEventsForNamespace('organization');

  // ============ Team Event Streams ============

  /**
   * Stream of team created events
   */
  readonly onTeamCreated$: Observable<DomainEvent> = this.eventStore
    .subscribe('team.created', () => {});

  /**
   * Stream of team member added events
   */
  readonly onTeamMemberAdded$: Observable<DomainEvent> = this.eventStore
    .subscribe('team.member.added', () => {});

  /**
   * Stream of all team events
   */
  readonly onTeamEvents$: Observable<DomainEvent> = this.eventStore
    .getEventsForNamespace('team');

  // ============ Collaborator Event Streams ============

  /**
   * Stream of collaborator invited events
   */
  readonly onCollaboratorInvited$: Observable<DomainEvent> = this.eventStore
    .subscribe('collaborator.invited', () => {});

  /**
   * Stream of collaborator accepted events
   */
  readonly onCollaboratorAccepted$: Observable<DomainEvent> = this.eventStore
    .subscribe('collaborator.accepted', () => {});

  /**
   * Stream of all collaborator events
   */
  readonly onCollaboratorEvents$: Observable<DomainEvent> = this.eventStore
    .getEventsForNamespace('collaborator');

  // ============ Bot Event Streams ============

  /**
   * Stream of bot created events
   */
  readonly onBotCreated$: Observable<DomainEvent> = this.eventStore
    .subscribe('bot.created', () => {});

  /**
   * Stream of bot action executed events
   */
  readonly onBotActionExecuted$: Observable<DomainEvent> = this.eventStore
    .subscribe('bot.action.executed', () => {});

  /**
   * Stream of all bot events
   */
  readonly onBotEvents$: Observable<DomainEvent> = this.eventStore
    .getEventsForNamespace('bot');

  // ============ Utility Methods ============

  /**
   * Get events for a specific user
   */
  getUserEvents(userId: string): Observable<DomainEvent> {
    return this.eventStore.getEventsForAggregate('user', userId);
  }

  /**
   * Get events for a specific organization
   */
  getOrganizationEvents(orgId: string): Observable<DomainEvent> {
    return this.eventStore.getEventsForAggregate('organization', orgId);
  }

  /**
   * Get events for a specific team
   */
  getTeamEvents(teamId: string): Observable<DomainEvent> {
    return this.eventStore.getEventsForAggregate('team', teamId);
  }

  /**
   * Get events for a specific collaborator
   */
  getCollaboratorEvents(collaboratorId: string): Observable<DomainEvent> {
    return this.eventStore.getEventsForAggregate('collaborator', collaboratorId);
  }

  /**
   * Get events for a specific bot
   */
  getBotEvents(botId: string): Observable<DomainEvent> {
    return this.eventStore.getEventsForAggregate('bot', botId);
  }
}
