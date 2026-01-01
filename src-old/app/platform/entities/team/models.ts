/**
 * Team Entity Read Models
 */

export interface TeamModel {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly orgId: string;
  readonly createdAt: Date;
  readonly updatedAt?: Date;
}

export interface TeamSummary {
  readonly id: string;
  readonly name: string;
  readonly memberCount: number;
}
