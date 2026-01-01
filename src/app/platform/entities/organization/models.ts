/**
 * Organization Entity Read Models
 */

export interface OrgModel {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly ownerId: string;
  readonly createdAt: Date;
  readonly updatedAt?: Date;
}

export interface OrgSummary {
  readonly id: string;
  readonly name: string;
  readonly memberCount: number;
}
