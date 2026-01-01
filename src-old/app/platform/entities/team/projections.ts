/**
 * Team Entity Projections
 */

import { TeamEvent } from './events';

export interface TeamProjection {
  readonly teamId: string;
  readonly name: string;
  readonly description?: string;
  readonly orgId: string;
  readonly memberCount: number;
  readonly createdAt: Date;
  readonly updatedAt?: Date;
}

export function buildTeamProjection(events: TeamEvent[]): TeamProjection[] {
  const teamMap = new Map<string, TeamProjection>();
  
  for (const event of events) {
    switch (event.type) {
      case 'team.created':
        teamMap.set(event.payload.teamId, {
          teamId: event.payload.teamId,
          name: event.payload.name,
          orgId: event.payload.orgId,
          memberCount: 0,
          createdAt: event.payload.createdAt,
        });
        break;
      case 'team.updated':
        const existing = teamMap.get(event.payload.teamId);
        if (existing) {
          teamMap.set(event.payload.teamId, {
            ...existing,
            ...event.payload.updates,
            updatedAt: event.payload.updatedAt,
          });
        }
        break;
      case 'team.deleted':
        teamMap.delete(event.payload.teamId);
        break;
    }
  }
  
  return Array.from(teamMap.values());
}
