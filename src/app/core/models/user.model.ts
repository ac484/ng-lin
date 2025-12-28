/**
 * Core user identity model exposed to features and guards.
 */
export interface CoreUserIdentity {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  roles?: string[];
  tenantIds?: string[];
  metadata?: Record<string, unknown>;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export type CoreUserRole = 'owner' | 'admin' | 'member' | 'guest';
