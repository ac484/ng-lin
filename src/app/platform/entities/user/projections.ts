/**
 * User Entity Projections
 * 
 * Read models generated from user events.
 * Projections are materialized views optimized for specific query patterns.
 */

import { UserEvent } from './events';

/**
 * User list projection for displaying users in a list view
 */
export interface UserListProjection {
  readonly userId: string;
  readonly email: string;
  readonly displayName: string;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly lastUpdatedAt?: Date;
}

/**
 * User profile projection for detailed user information
 */
export interface UserProfileProjection {
  readonly userId: string;
  readonly email: string;
  readonly displayName: string;
  readonly photoURL?: string;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt?: Date;
  readonly deactivatedAt?: Date;
  readonly deactivationReason?: string;
}

/**
 * Build user list projection from events
 */
export function buildUserListProjection(events: UserEvent[]): UserListProjection[] {
  const userMap = new Map<string, UserListProjection>();

  for (const event of events) {
    switch (event.type) {
      case 'user.created':
        userMap.set(event.payload.userId, {
          userId: event.payload.userId,
          email: event.payload.email,
          displayName: event.payload.displayName,
          isActive: true,
          createdAt: event.payload.createdAt,
        });
        break;

      case 'user.updated':
        const existing = userMap.get(event.payload.userId);
        if (existing) {
          userMap.set(event.payload.userId, {
            ...existing,
            displayName: event.payload.updates.displayName ?? existing.displayName,
            email: event.payload.updates.email ?? existing.email,
            lastUpdatedAt: event.payload.updatedAt,
          });
        }
        break;

      case 'user.deactivated':
        const user = userMap.get(event.payload.userId);
        if (user) {
          userMap.set(event.payload.userId, {
            ...user,
            isActive: false,
          });
        }
        break;
    }
  }

  return Array.from(userMap.values());
}
