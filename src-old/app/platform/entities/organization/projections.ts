/**
 * Organization Entity Projections
 * 
 * Read models for organization queries.
 */

import { OrgEvent } from './events';

/**
 * Organization overview projection
 */
export interface OrgOverviewProjection {
  readonly orgId: string;
  readonly name: string;
  readonly description?: string;
  readonly ownerId: string;
  readonly memberCount: number;
  readonly teamCount: number;
  readonly createdAt: Date;
  readonly updatedAt?: Date;
}

/**
 * Build organization overview projection from events
 */
export function buildOrgOverviewProjection(events: OrgEvent[]): OrgOverviewProjection[] {
  const orgMap = new Map<string, OrgOverviewProjection>();

  for (const event of events) {
    switch (event.type) {
      case 'org.created':
        orgMap.set(event.payload.orgId, {
          orgId: event.payload.orgId,
          name: event.payload.name,
          ownerId: event.payload.ownerId,
          memberCount: 0,
          teamCount: 0,
          createdAt: event.payload.createdAt,
        });
        break;

      case 'org.updated':
        const existing = orgMap.get(event.payload.orgId);
        if (existing) {
          orgMap.set(event.payload.orgId, {
            ...existing,
            name: event.payload.updates.name ?? existing.name,
            description: event.payload.updates.description ?? existing.description,
            updatedAt: event.payload.updatedAt,
          });
        }
        break;

      case 'org.deleted':
        orgMap.delete(event.payload.orgId);
        break;
    }
  }

  return Array.from(orgMap.values());
}
