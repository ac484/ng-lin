/**
 * Core organization model for multi-tenant contexts.
 */
export interface CoreOrganization {
  id: string;
  name: string;
  ownerId: string;
  description?: string;
  status?: 'active' | 'suspended' | 'archived';
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CoreOrganizationMembership {
  organizationId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt?: string | Date;
}
