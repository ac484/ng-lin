# Multi-Tenant Account Architecture

## Overview

ng-lin implements a multi-tenant architecture inspired by GitHub's SaaS design, supporting multiple account types and collaboration layers for flexible, scalable project management.

## Account Types

The system supports three core account types at the Account Layer:

### 1. Personal Account

Individual user accounts that serve as the foundation of the identity system.

**Characteristics:**
- Single user ownership
- Direct resource control
- Basic collaboration capabilities
- Can be a member of multiple organizations

**Use Cases:**
- Personal projects
- Individual learning and experimentation
- Collaboration on team projects

**Example:**
```typescript
{
  id: "user-123",
  type: AccountType.Personal,
  handle: "qrl",
  name: "QRL User",
  email: "qrl@example.com",
  status: AccountStatus.Active
}
```

### 2. Organization Account

Multi-user entity accounts representing companies, teams, or groups.

**Characteristics:**
- Multiple members with different roles
- Centralized billing and resource management
- Team structure support
- Advanced access control

**Use Cases:**
- Company-wide projects
- Team collaboration
- Enterprise resource management
- Multi-project coordination

**Example:**
```typescript
{
  id: "org-456",
  type: AccountType.Organization,
  handle: "acme",
  name: "ACME Corporation",
  billingEmail: "billing@acme.com",
  status: AccountStatus.Active,
  size: "enterprise"
}
```

**Organization Roles:**
- **Owner**: Full administrative access, including billing
- **Admin**: Administrative access without billing control
- **Member**: Standard access to organization resources
- **Viewer**: Read-only access

### 3. BOT Account

Automated agent accounts for system integration and automation.

**Characteristics:**
- Owned by a user or organization
- API-driven access
- Limited to programmatic operations
- Specific capability scopes

**Use Cases:**
- CI/CD automation
- Automated monitoring and alerts
- External system integration
- Scheduled tasks and workflows

**Example:**
```typescript
{
  id: "bot-789",
  type: AccountType.Bot,
  handle: "acme-ci-bot",
  name: "ACME CI/CD Bot",
  ownerId: "org-456",
  ownerType: AccountType.Organization,
  capabilities: ["read:events", "write:tasks", "read:audit"],
  status: AccountStatus.Active
}
```

## Collaboration Layers

Beyond account types, the system provides collaboration mechanisms at different scopes:

### 1. Teams (Organization Level)

Groups within organizations for organizing members around specific purposes.

**Structure:**
```typescript
{
  id: "team-001",
  organizationId: "org-456",
  handle: "backend-team",
  name: "Backend Development Team",
  visibility: "private"
}
```

**Team Roles:**
- **Maintainer**: Can manage team membership and settings
- **Member**: Standard team member access

**Use Cases:**
- Department organization
- Project-based grouping
- Access control boundaries
- Permission scoping

### 2. Partners (Collaboration Permissions)

Cross-account collaboration with specific permission grants.

**Structure:**
```typescript
{
  id: "partner-001",
  accountId: "user-123",
  accountType: AccountType.Personal,
  targetAccountId: "org-456",
  role: "write",
  grantedBy: "user-owner",
  grantedAt: Date
}
```

**Permission Levels:**
- **read**: View-only access
- **write**: Can modify resources
- **admin**: Administrative access

**Use Cases:**
- External consultant access
- Inter-organization collaboration
- Temporary permissions
- Vendor/partner integration

### 3. Collaborators (Project Level)

Granular, resource-specific access control.

**Structure:**
```typescript
{
  id: "collab-001",
  resourceId: "project-123",
  resourceType: "contract",
  accountId: "user-789",
  accountType: AccountType.Personal,
  permission: "write",
  status: "accepted"
}
```

**Permission Levels:**
- **read**: View project resources
- **write**: Modify project resources
- **admin**: Manage project settings and collaborators

**Use Cases:**
- Project-specific access
- External contributor management
- Fine-grained permissions
- Guest access

## Multi-Tenant Boundaries

### Tenant Identification

Tenants are identified at the namespace level in the event identifier system:

```
<tenant>.<context>.<aggregate>#<sequence>
```

**Examples:**
```
qrl.trading.order#1024          // Personal account tenant
acme.project-alpha.task#42      // Organization tenant
openai.chatgpt.conversation#1   // Another organization
```

### Tenant Isolation

**Data Isolation:**
- Each tenant's data is logically separated
- Namespace-based filtering in queries
- Access control at tenant boundary

**Resource Isolation:**
- Events scoped to tenant namespace
- Tasks and contracts bound to tenant
- Audit logs filtered by tenant

**Permission Isolation:**
- Roles and permissions tenant-specific
- Cross-tenant access requires explicit grants
- Team membership scoped to organizations

## Architecture Layers

### Three-Layer Tenant Model

```
┌─────────────────────────────────────────────────┐
│  Account Layer                                  │
│  - Personal Accounts                            │
│  - Organization Accounts                        │
│  - BOT Accounts                                 │
└─────────────────┬───────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────┐
│  Collaboration Layer                            │
│  - Teams (Organization grouping)                │
│  - Partners (Cross-account permissions)         │
│  - Collaborators (Resource-specific access)     │
└─────────────────┬───────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────┐
│  Resource Layer                                 │
│  - Contracts (L-1)                              │
│  - Events (L0/L1/L2)                            │
│  - Tasks                                        │
│  - Audit Logs                                   │
└─────────────────────────────────────────────────┘
```

### Permission Execution

```
Request → Extract User Context
       → Resolve Account (Personal/Org/Bot)
       → Determine Resource Owner
       → Check User Role in Owner Context
       → Apply Resource-specific Policies
       → Allow/Deny
```

## Initial Version Support

The initial version (MVP) supports:

### ✅ Supported Features

1. **Personal Accounts**
   - Individual user registration and login
   - Personal project creation
   - Basic profile management

2. **Basic Multi-User Collaboration**
   - Collaborator invitations (project level)
   - Partner permissions (read/write/admin)
   - Role-based access control

3. **Project-Level Permissions**
   - Collaborator management
   - Resource-specific access grants
   - Permission verification

### 🔮 Future Versions

Features planned for later releases:

1. **Organization Accounts (Full)**
   - Organization creation and management
   - Multi-member organizations
   - Billing and subscription management
   - Organization-level settings

2. **Teams (Advanced)**
   - Team creation and management
   - Team-based permissions
   - Nested team structures
   - Team activity tracking

3. **BOT Accounts**
   - Bot registration and configuration
   - API token management
   - Bot capability scoping
   - Bot activity monitoring

4. **Enterprise Features**
   - SSO integration
   - Advanced audit logging
   - Compliance controls
   - Custom role definitions

## Usage Examples

### Account Context Switching

```typescript
import { inject } from '@angular/core';
import { AccountContextService } from '@core/services/account-context.service';

// In your component
const accountContext = inject(AccountContextService);

// Get current account
const current = accountContext.getCurrentAccount();
// { accountId: "user-123", accountType: "personal", handle: "qrl" }

// Switch to organization
await accountContext.switchAccount("org-456");

// Get available accounts
const accounts = accountContext.getAvailableAccounts();
// [
//   { accountId: "user-123", type: "personal", handle: "qrl", name: "QRL User" },
//   { accountId: "org-456", type: "organization", handle: "acme", name: "ACME Corp", role: "admin" }
// ]
```

### Tenant-Scoped Event Generation

```typescript
import { inject } from '@angular/core';
import { EventIdentifierService } from '@core/services/event-identifier.service';
import { AccountContextService } from '@core/services/account-context.service';

const identifierService = inject(EventIdentifierService);
const accountContext = inject(AccountContextService);

// Get current tenant
const tenant = accountContext.getCurrentAccount().accountHandle;

// Generate tenant-scoped event
const eventId = identifierService.generateEventId(
  tenant,           // Current tenant
  'trading',        // Context
  'order',          // Aggregate
  1024              // Sequence
);
// Result: "qrl.trading.order#1024" or "acme.trading.order#1024"
```

### Permission Checking

```typescript
import { inject } from '@angular/core';
import { PermissionService } from '@core/services/permission.service';

const permissionService = inject(PermissionService);

// Check if user can access resource
const canAccess = await permissionService.canAccess(
  'user-123',           // User ID
  'contract-456',       // Resource ID
  'write'               // Required permission
);

if (canAccess) {
  // Perform operation
}
```

### Collaborator Management

```typescript
import { inject } from '@angular/core';
import { CollaboratorService } from '@core/services/collaborator.service';

const collaboratorService = inject(CollaboratorService);

// Invite collaborator
await collaboratorService.invite({
  resourceId: 'contract-123',
  resourceType: 'contract',
  accountId: 'user-789',
  accountType: AccountType.Personal,
  permission: 'write'
});

// List collaborators
const collaborators = await collaboratorService.list('contract-123');

// Remove collaborator
await collaboratorService.remove('collab-001');
```

## Security Considerations

### Tenant Boundary Enforcement

- **All queries must filter by tenant**: Never allow cross-tenant data leakage
- **Validate namespace ownership**: Ensure users can only access their tenant's namespaces
- **Enforce role-based permissions**: Check user roles before operations
- **Audit all cross-tenant grants**: Log partner and collaborator permissions

### Access Control Best Practices

1. **Principle of Least Privilege**: Grant minimum necessary permissions
2. **Explicit Grants**: Require explicit permission grants, deny by default
3. **Time-Limited Access**: Consider expiration for temporary collaborators
4. **Regular Audits**: Review and revoke unused permissions
5. **Separation of Duties**: Owner/Admin/Member role separation

## Database Schema

### Firestore Collections

```typescript
// Accounts collection
/accounts/{accountId}
{
  id: "user-123",
  type: "personal",
  handle: "qrl",
  name: "QRL User",
  email: "qrl@example.com",
  status: "active",
  createdAt: Timestamp
}

// Organization memberships
/organizationMemberships/{membershipId}
{
  organizationId: "org-456",
  userId: "user-123",
  role: "admin",
  status: "active",
  joinedAt: Timestamp
}

// Teams
/teams/{teamId}
{
  organizationId: "org-456",
  handle: "backend-team",
  name: "Backend Development Team",
  visibility: "private"
}

// Collaborators
/collaborators/{collaboratorId}
{
  resourceId: "contract-123",
  resourceType: "contract",
  accountId: "user-789",
  permission: "write",
  status: "accepted"
}
```

## Migration Path

### Phase 1: Personal Accounts (MVP)
- User registration and authentication
- Personal project creation
- Basic collaborator invitations

### Phase 2: Basic Organizations
- Organization creation
- Member invitations
- Simple role-based access

### Phase 3: Advanced Organizations
- Team creation and management
- Advanced permissions
- Organization settings

### Phase 4: BOT Accounts
- Bot registration
- API token generation
- Capability scoping

### Phase 5: Enterprise Features
- SSO integration
- Advanced audit logging
- Custom roles and policies

## Related Documentation

- [Event Identifier System](./EVENT_IDENTIFIER_SYSTEM.md)
- [SaaS Multi-Tenant Architecture](./SaaS.md)
- [Identity & Auth](./Identity%20%26%20Auth.md)
- [Permission Model](../Permission.md)

## References

- GitHub's multi-tenant architecture
- AWS multi-tenant SaaS guidance
- NIST access control guidelines
