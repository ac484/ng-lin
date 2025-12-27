/**
 * Generic resource repository reference.
 * Useful for guards and services that need to resolve ownership.
 */
export interface CoreRepositoryRef {
  id: string;
  type: 'user' | 'organization' | 'team' | 'partner';
}

/**
 * Minimal repository metadata.
 */
export interface CoreRepositoryMetadata {
  repository: CoreRepositoryRef;
  name?: string;
  description?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
