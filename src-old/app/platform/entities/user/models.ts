/**
 * User Entity Read Models
 * 
 * Read-side data structures for user queries.
 * These models are optimized for read operations and UI display.
 */

/**
 * Basic user information model
 */
export interface UserModel {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly photoURL?: string;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt?: Date;
}

/**
 * Extended user profile model with additional details
 */
export interface UserProfileModel extends UserModel {
  readonly deactivatedAt?: Date;
  readonly deactivationReason?: string;
  readonly organizationIds: string[];
  readonly teamIds: string[];
}

/**
 * User summary for list displays
 */
export interface UserSummary {
  readonly id: string;
  readonly displayName: string;
  readonly email: string;
  readonly photoURL?: string;
  readonly isActive: boolean;
}
