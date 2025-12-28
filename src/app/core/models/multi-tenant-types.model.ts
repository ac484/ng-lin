/**
 * Multi-Tenant Account Architecture Types
 * 
 * ⚠️ IMPORTANT: This file defines FUTURE multi-tenant architecture types.
 * 
 * These types extend and complement existing account models:
 * - src/app/features/account/core/models/account.model.ts (current Account)
 * - src/app/core/models/organization.model.ts (CoreOrganization)
 * - src/app/core/models/user.model.ts (CoreUserIdentity)
 * 
 * DO NOT USE THESE TYPES YET - They are for documentation and future implementation.
 * The current MVP uses Personal Accounts only.
 * 
 * Future Migration Plan:
 * - Phase 1 (MVP): Personal accounts only (existing Account model)
 * - Phase 2: Add Organization account features (merge with CoreOrganization)
 * - Phase 3: Add BOT accounts and Teams
 * - Phase 4: Full multi-tenant collaboration layers
 * 
 * Following GitHub's multi-tenant design with support for:
 * - Personal Accounts
 * - Organization Accounts
 * - BOT Accounts
 * - Collaboration layers (Teams, Partners, Collaborators)
 * 
 * @see docs/identity-tenancy/MULTI_TENANT_ACCOUNT_ARCHITECTURE.md for architecture details
 */

/**
 * Account type enumeration
 */
export enum AccountType {
  /** Individual user account */
  Personal = 'personal',
  
  /** Organization/company account */
  Organization = 'organization',
  
  /** Automated agent/bot account */
  Bot = 'bot'
}

/**
 * Account status
 */
export enum AccountStatus {
  /** Account is active and operational */
  Active = 'active',
  
  /** Account is suspended (temporarily disabled) */
  Suspended = 'suspended',
  
  /** Account is archived (soft deleted) */
  Archived = 'archived',
  
  /** Account is pending activation */
  Pending = 'pending'
}

/**
 * Base account interface
 * Common properties for all account types
 */
export interface BaseAccount {
  /** Unique account identifier */
  id: string;
  
  /** Account type */
  type: AccountType;
  
  /** Account display name */
  name: string;
  
  /** Account handle/username (unique, URL-friendly) */
  handle: string;
  
  /** Account status */
  status: AccountStatus;
  
  /** Account creation timestamp */
  createdAt: Date;
  
  /** Last updated timestamp */
  updatedAt: Date;
  
  /** Account metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Personal account (individual user)
 */
export interface PersonalAccount extends BaseAccount {
  type: AccountType.Personal;
  
  /** User's email address */
  email: string;
  
  /** User's display name */
  displayName: string;
  
  /** User's avatar URL */
  avatarUrl?: string;
  
  /** User's bio/description */
  bio?: string;
  
  /** User's location */
  location?: string;
  
  /** User's website */
  website?: string;
  
  /** User preferences */
  preferences?: {
    language?: string;
    timezone?: string;
    notifications?: boolean;
  };
}

/**
 * Organization account (company/team)
 */
export interface OrganizationAccount extends BaseAccount {
  type: AccountType.Organization;
  
  /** Organization billing email */
  billingEmail: string;
  
  /** Organization description */
  description?: string;
  
  /** Organization logo URL */
  logoUrl?: string;
  
  /** Organization website */
  website?: string;
  
  /** Organization location */
  location?: string;
  
  /** Organization size */
  size?: 'small' | 'medium' | 'large' | 'enterprise';
  
  /** Organization settings */
  settings?: {
    /** Allow members to create teams */
    allowTeamCreation?: boolean;
    
    /** Require 2FA for members */
    require2FA?: boolean;
    
    /** Default member role */
    defaultMemberRole?: OrganizationRole;
  };
}

/**
 * BOT account (automated agent)
 */
export interface BotAccount extends BaseAccount {
  type: AccountType.Bot;
  
  /** Bot owner (user or organization) */
  ownerId: string;
  
  /** Bot owner type */
  ownerType: AccountType.Personal | AccountType.Organization;
  
  /** Bot description */
  description: string;
  
  /** Bot avatar URL */
  avatarUrl?: string;
  
  /** Bot capabilities/permissions */
  capabilities?: string[];
  
  /** Bot configuration */
  configuration?: Record<string, unknown>;
  
  /** API token (hashed) */
  tokenHash?: string;
  
  /** Last activity timestamp */
  lastActiveAt?: Date;
}

/**
 * Organization role enumeration
 */
export enum OrganizationRole {
  /** Full administrative access */
  Owner = 'owner',
  
  /** Administrative access without billing */
  Admin = 'admin',
  
  /** Standard member access */
  Member = 'member',
  
  /** Read-only access */
  Viewer = 'viewer'
}

/**
 * Organization membership
 * Links users to organizations with roles
 */
export interface OrganizationMembership {
  /** Membership ID */
  id: string;
  
  /** Organization ID */
  organizationId: string;
  
  /** User ID */
  userId: string;
  
  /** User's role in organization */
  role: OrganizationRole;
  
  /** Membership created timestamp */
  joinedAt: Date;
  
  /** Invitation accepted timestamp */
  acceptedAt?: Date;
  
  /** Membership status */
  status: 'active' | 'pending' | 'suspended';
  
  /** Custom permissions (beyond role) */
  customPermissions?: string[];
}

/**
 * Team within organization
 * Groups members for specific purposes
 */
export interface Team {
  /** Team ID */
  id: string;
  
  /** Organization this team belongs to */
  organizationId: string;
  
  /** Team name */
  name: string;
  
  /** Team handle (unique within organization) */
  handle: string;
  
  /** Team description */
  description?: string;
  
  /** Team visibility */
  visibility: 'public' | 'private';
  
  /** Team created timestamp */
  createdAt: Date;
  
  /** Team updated timestamp */
  updatedAt: Date;
  
  /** Team metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Team membership
 * Links users to teams with roles
 */
export interface TeamMembership {
  /** Membership ID */
  id: string;
  
  /** Team ID */
  teamId: string;
  
  /** User ID */
  userId: string;
  
  /** User's role in team */
  role: 'maintainer' | 'member';
  
  /** Joined timestamp */
  joinedAt: Date;
}

/**
 * Partner role (collaboration permission)
 */
export interface PartnerRole {
  /** Partner role ID */
  id: string;
  
  /** Account this role applies to */
  accountId: string;
  
  /** Account type */
  accountType: AccountType;
  
  /** Target account (organization/project) */
  targetAccountId: string;
  
  /** Role/permission level */
  role: 'read' | 'write' | 'admin';
  
  /** Granted timestamp */
  grantedAt: Date;
  
  /** Granted by user */
  grantedBy: string;
  
  /** Expiration timestamp (optional) */
  expiresAt?: Date;
}

/**
 * Collaborator (project-level participant)
 */
export interface Collaborator {
  /** Collaborator ID */
  id: string;
  
  /** Project/resource ID */
  resourceId: string;
  
  /** Resource type */
  resourceType: string;
  
  /** Collaborator account ID */
  accountId: string;
  
  /** Collaborator account type */
  accountType: AccountType;
  
  /** Permission level */
  permission: 'read' | 'write' | 'admin';
  
  /** Invitation status */
  status: 'pending' | 'accepted' | 'declined';
  
  /** Invited by user */
  invitedBy: string;
  
  /** Invited timestamp */
  invitedAt: Date;
  
  /** Accepted timestamp */
  acceptedAt?: Date;
}

/**
 * Account context for current session
 * Represents the active account/organization context
 */
export interface AccountContext {
  /** Current account ID */
  accountId: string;
  
  /** Current account type */
  accountType: AccountType;
  
  /** Current account handle */
  accountHandle: string;
  
  /** Is this the user's personal account? */
  isPersonal: boolean;
  
  /** Current organization (if in org context) */
  organizationId?: string;
  
  /** User's role in organization (if applicable) */
  organizationRole?: OrganizationRole;
  
  /** Current team (if in team context) */
  teamId?: string;
  
  /** Available accounts user can switch to */
  availableAccounts?: {
    accountId: string;
    accountType: AccountType;
    accountHandle: string;
    name: string;
  }[];
}

/**
 * Account switcher option
 * Represents an account the user can switch to
 */
export interface AccountSwitcherOption {
  /** Account ID */
  accountId: string;
  
  /** Account type */
  accountType: AccountType;
  
  /** Account handle */
  handle: string;
  
  /** Account display name */
  name: string;
  
  /** Account avatar/logo URL */
  avatarUrl?: string;
  
  /** User's role (for organizations) */
  role?: OrganizationRole;
  
  /** Is this the current active account? */
  isActive: boolean;
}
