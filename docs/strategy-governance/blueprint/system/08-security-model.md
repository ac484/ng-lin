# Security Model - GigHub

> **Document Type**: Security Architecture Specification  
> **Version**: 1.0  
> **Last Updated**: 2025-12-27  
> **Status**: Production Reference  
> **Audience**: Security Team, DevOps, Architects

---

## Table of Contents

1. [Security Overview](#security-overview)
2. [Authentication](#authentication)
3. [Authorization](#authorization)
4. [Data Security](#data-security)
5. [Audit & Compliance](#audit--compliance)
6. [Security Best Practices](#security-best-practices)

---

## Security Overview

### Defense in Depth

GigHub implements multiple layers of security:

```
┌────────────────────────────────────────────┐
│  Layer 1: Network Security                 │
│  - HTTPS/TLS 1.3                          │
│  - Firebase Hosting CDN                   │
└────────────────┬───────────────────────────┘
                 ↓
┌────────────────────────────────────────────┐
│  Layer 2: Authentication                   │
│  - Firebase Auth                          │
│  - Multi-factor authentication (optional) │
└────────────────┬───────────────────────────┘
                 ↓
┌────────────────────────────────────────────┐
│  Layer 3: Authorization                    │
│  - Firestore Security Rules               │
│  - Role-based access control              │
└────────────────┬───────────────────────────┘
                 ↓
┌────────────────────────────────────────────┐
│  Layer 4: Application Security             │
│  - Input validation                       │
│  - XSS protection                         │
│  - Policy enforcement                     │
└────────────────┬───────────────────────────┘
                 ↓
┌────────────────────────────────────────────┐
│  Layer 5: Data Security                    │
│  - Encryption at rest (AES-256)           │
│  - Immutable audit logs                   │
│  - Field-level security                   │
└────────────────────────────────────────────┘
```

---

## Authentication

### Firebase Authentication

**Supported Methods**:
- ✅ Email/Password
- ✅ Google OAuth
- ✅ Anonymous (limited access)
- ⚠️ Phone (planned)
- ⚠️ Multi-factor (planned)

**Implementation**:
```typescript
// Angular service
import { Auth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  
  async signInWithEmail(email: string, password: string): Promise<User> {
    const credential = await signInWithEmailAndPassword(this.auth, email, password);
    return credential.user;
  }
  
  async signInWithGoogle(): Promise<User> {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(this.auth, provider);
    return credential.user;
  }
  
  async signOut(): Promise<void> {
    await this.auth.signOut();
  }
  
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }
}
```

**Token Management** (@delon/auth):
```typescript
import { DA_SERVICE_TOKEN, TokenService } from '@delon/auth';

@Injectable({ providedIn: 'root' })
export class TokenManager {
  private tokenService = inject(DA_SERVICE_TOKEN);
  
  async storeToken(user: User): Promise<void> {
    const token = await user.getIdToken();
    this.tokenService.set({
      token,
      uid: user.uid,
      email: user.email,
      exp: Date.now() + 3600000 // 1 hour
    });
  }
  
  getToken(): string | null {
    const data = this.tokenService.get();
    return data?.token || null;
  }
  
  clearToken(): void {
    this.tokenService.clear();
  }
}
```

---

## Authorization

### Firestore Security Rules

**Core Principles**:
1. **Deny by Default**: All access denied unless explicitly allowed
2. **Authenticated Only**: All operations require authentication
3. **Role-Based**: Permissions based on user roles
4. **Resource-Level**: Fine-grained access control per document

**Security Rules Structure**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    function hasRole(role) {
      return isAuthenticated() && getUserData().roles.hasAny([role]);
    }
    
    function isOwner(ownerId) {
      return isAuthenticated() && request.auth.uid == ownerId;
    }
    
    // L1: Construction Events (IMMUTABLE)
    match /constructionEvents/{eventId} {
      // Read: authenticated users
      allow read: if isAuthenticated();
      
      // Create: authenticated users only, actor must be self
      allow create: if isAuthenticated() && 
                       request.resource.data.actor == request.auth.uid &&
                       request.resource.data.timestamp != null &&
                       request.resource.data.evidence.size() > 0;
      
      // Update/Delete: FORBIDDEN (immutable!)
      allow update, delete: if false;
    }
    
    // Contracts
    match /contracts/{contractId} {
      allow read: if isAuthenticated();
      
      allow create: if hasRole('owner') || hasRole('contractor');
      
      allow update: if hasRole('owner') || hasRole('contractor') || hasRole('admin');
      
      allow delete: if hasRole('admin');
    }
    
    // Tasks
    match /tasks/{taskId} {
      allow read: if isAuthenticated();
      
      allow create: if hasRole('contractor') || hasRole('project_manager');
      
      allow update: if hasRole('contractor') || 
                       hasRole('project_manager') ||
                       isOwner(resource.data.assignee);
      
      allow delete: if hasRole('admin');
    }
    
    // QC Tasks
    match /qcTasks/{qcId} {
      allow read: if isAuthenticated();
      
      allow create: if hasRole('contractor') || hasRole('project_manager');
      
      allow update: if hasRole('inspector') || isOwner(resource.data.inspector);
      
      allow delete: if false; // Cannot delete QC tasks
    }
    
    // Acceptances
    match /acceptances/{acceptanceId} {
      allow read: if isAuthenticated();
      
      allow create: if hasRole('contractor') || hasRole('project_manager');
      
      allow update: if hasRole('owner') || hasRole('contractor');
      
      allow delete: if false; // Cannot delete acceptances
    }
    
    // Audit Logs (IMMUTABLE)
    match /auditLogs/{logId} {
      allow read: if hasRole('admin') || hasRole('auditor');
      
      allow create: if true; // System can create
      
      allow update, delete: if false; // Immutable
    }
    
    // User profiles
    match /users/{userId} {
      allow read: if isAuthenticated();
      
      allow create: if isAuthenticated() && request.auth.uid == userId;
      
      allow update: if isAuthenticated() && request.auth.uid == userId;
      
      allow delete: if hasRole('admin');
    }
  }
}
```

### Role-Based Access Control

**Role Definitions**:
```typescript
enum UserRole {
  Admin = 'admin',
  Owner = 'owner',
  Contractor = 'contractor',
  ProjectManager = 'project_manager',
  Inspector = 'inspector',
  Worker = 'worker',
  Auditor = 'auditor'
}

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  roles: UserRole[];
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Permission Matrix**:

| Action | Admin | Owner | Contractor | PM | Inspector | Worker |
|--------|-------|-------|------------|-----|-----------|--------|
| Create Contract | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Activate Contract | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create Task | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Complete Task | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ |
| Create QC | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Conduct Inspection | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Approve Acceptance | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Approve Payment | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Audit Logs | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Data Security

### Encryption

**In Transit**:
- TLS 1.3 for all connections
- HTTPS enforced (HTTP redirects to HTTPS)
- Certificate pinning (optional)

**At Rest**:
- Firestore: AES-256 encryption (automatic)
- Cloud Storage: AES-256 encryption (automatic)
- Backup encryption enabled

**Implementation**:
```typescript
// No code needed - Firebase handles encryption automatically
// But ensure HTTPS is enforced in firebase.json
{
  "hosting": {
    "headers": [{
      "source": "**",
      "headers": [{
        "key": "Strict-Transport-Security",
        "value": "max-age=31536000; includeSubDomains"
      }]
    }]
  }
}
```

### Data Sanitization

**Input Validation**:
```typescript
import { z } from 'zod';

// Schema validation
const CreateTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000),
  contractId: z.string().uuid(),
  assignee: z.string().email().optional(),
  dueDate: z.date().optional()
});

// Usage
function createTask(data: unknown): Task {
  const validated = CreateTaskSchema.parse(data); // Throws if invalid
  return taskService.create(validated);
}
```

**XSS Prevention**:
```typescript
import { DomSanitizer } from '@angular/platform-browser';

@Component({...})
export class TaskDetailComponent {
  private sanitizer = inject(DomSanitizer);
  
  get sanitizedDescription() {
    // Angular automatically sanitizes
    return this.task.description; // Safe by default
  }
  
  // If you MUST use innerHTML
  get trustedHtml() {
    return this.sanitizer.sanitize(SecurityContext.HTML, this.task.description);
  }
}
```

**SQL Injection Prevention**:
```typescript
// Firestore queries are parameterized by default - no SQL injection risk

// ✅ SAFE: Firestore query
const q = query(
  collection(firestore, 'tasks'),
  where('contractId', '==', contractId), // Parameterized
  where('status', '==', status)
);

// No raw SQL strings to worry about!
```

### Sensitive Data Handling

**PII Protection**:
```typescript
interface UserProfile {
  uid: string;
  email: string; // ⚠️ PII
  displayName: string; // ⚠️ PII
  phoneNumber?: string; // ⚠️ PII
  roles: UserRole[];
  organizationId: string;
}

// Logging: Never log PII
console.log('User action:', {
  uid: user.uid, // ✅ OK
  action: 'task.created',
  // ❌ NEVER: email: user.email
});

// Audit: Log UIDs only
auditService.log({
  actor: user.uid, // ✅ UID only
  action: 'user.updated'
});
```

**Secret Management**:
```typescript
// ❌ NEVER hardcode secrets
const apiKey = 'sk-1234567890abcdef'; // WRONG!

// ✅ Use environment variables
const apiKey = environment.vertexAiApiKey;

// ✅ Or use Firebase config
import { getRemoteConfig, getValue } from '@angular/fire/remote-config';

const remoteConfig = getRemoteConfig(app);
const apiKey = getValue(remoteConfig, 'vertex_ai_api_key').asString();
```

---

## Audit & Compliance

### Immutable Audit Logs

**What is Logged**:
- All user actions (create, update, delete)
- All L0, L1, L2 events
- Authentication events (login, logout, failed attempts)
- Authorization failures
- Configuration changes
- Security incidents

**Audit Log Schema**:
```typescript
interface AuditLog {
  id: string;
  timestamp: Date;
  
  // Who
  actor: string; // User UID
  actorEmail?: string;
  actorRole?: string;
  
  // What
  action: string; // e.g., 'task.created', 'contract.activated'
  resource: string; // e.g., 'task/TASK-123'
  resourceType: string; // e.g., 'task', 'contract'
  
  // Context
  correlationId?: string;
  ipAddress?: string;
  userAgent?: string;
  
  // Details
  before?: any; // State before action
  after?: any; // State after action
  metadata?: Record<string, any>;
  
  // Result
  success: boolean;
  errorMessage?: string;
}
```

**Firestore Security Rules (Audit Logs)**:
```javascript
match /auditLogs/{logId} {
  // Only admins and auditors can read
  allow read: if hasRole('admin') || hasRole('auditor');
  
  // System can create (via Cloud Functions)
  allow create: if true;
  
  // IMMUTABLE: Cannot update or delete
  allow update, delete: if false;
}
```

### Compliance Reporting

**GDPR Compliance**:
- ✅ Right to access: User can export their data
- ✅ Right to erasure: User data can be deleted (except audit logs)
- ✅ Right to portability: Data exportable in JSON format
- ✅ Consent management: User consent tracked
- ✅ Data minimization: Only collect necessary data

**Implementation**:
```typescript
@Injectable({ providedIn: 'root' })
export class GDPRComplianceService {
  async exportUserData(userId: string): Promise<Blob> {
    const userData = await this.collectUserData(userId);
    const json = JSON.stringify(userData, null, 2);
    return new Blob([json], { type: 'application/json' });
  }
  
  async deleteUserData(userId: string): Promise<void> {
    // Delete user profile
    await deleteDoc(doc(firestore, 'users', userId));
    
    // Anonymize audit logs (keep for compliance, but remove PII)
    const auditLogs = await this.getAuditLogs(userId);
    for (const log of auditLogs) {
      await updateDoc(doc(firestore, 'auditLogs', log.id), {
        actorEmail: '[DELETED]',
        ipAddress: '[REDACTED]'
      });
    }
  }
}
```

---

## Security Best Practices

### 1. Input Validation

```typescript
// ✅ GOOD: Validate all inputs
const CreateTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000),
  contractId: z.string().uuid()
});

// ❌ BAD: No validation
function createTask(data: any) {
  return taskService.create(data); // Unsafe!
}
```

### 2. Output Encoding

```typescript
// ✅ GOOD: Use Angular's built-in sanitization
<div>{{ task.description }}</div> <!-- Automatically escaped -->

// ❌ BAD: innerHTML without sanitization
<div [innerHTML]="task.description"></div> <!-- XSS risk! -->

// ✅ GOOD: Sanitize if innerHTML needed
<div [innerHTML]="sanitizedDescription"></div>
```

### 3. Authentication Checks

```typescript
// ✅ GOOD: Always check authentication
if (!this.auth.currentUser) {
  throw new Error('Unauthorized');
}

// ❌ BAD: Assume user is authenticated
const user = this.auth.currentUser!; // Unsafe!
```

### 4. Error Handling

```typescript
// ✅ GOOD: Generic error messages to users
catch (error) {
  console.error('Error details:', error); // Log full error
  this.notificationService.error('Operation failed'); // Generic message to user
}

// ❌ BAD: Expose error details to users
catch (error) {
  this.notificationService.error(error.message); // May leak sensitive info!
}
```

### 5. Rate Limiting

```typescript
// Cloud Function with rate limiting
export const createContract = onCall({
  maxInstances: 10,
  timeoutSeconds: 60,
  memory: '256MB',
  cors: true
}, async (request) => {
  // Check rate limit
  const rateLimitKey = `contract_create_${request.auth?.uid}`;
  const attempts = await rateLimiter.get(rateLimitKey);
  
  if (attempts > 10) {
    throw new HttpsError('resource-exhausted', 'Rate limit exceeded');
  }
  
  await rateLimiter.increment(rateLimitKey, { ttl: 3600 }); // 1 hour
  
  // Process request
  return await processContractCreation(request.data);
});
```

---

## Security Testing

### Security Checklist

- [ ] All inputs validated
- [ ] XSS protection implemented
- [ ] CSRF protection enabled
- [ ] Firestore Security Rules tested
- [ ] Authentication tested
- [ ] Authorization tested
- [ ] Audit logging verified
- [ ] Sensitive data not logged
- [ ] HTTPS enforced
- [ ] Rate limiting implemented
- [ ] Error messages sanitized
- [ ] Dependency vulnerabilities checked

### Testing Tools

- **OWASP ZAP**: Penetration testing
- **Snyk**: Dependency scanning
- **Firebase Emulator**: Security rules testing
- **axe DevTools**: Accessibility testing

---

## References

- [System Architecture](./02-system-architecture.md)
- [SETC Requirements](../setc/SETC-02-requirements.md)
- [Firebase Security Rules Documentation](https://firebase.google.com/docs/firestore/security/rules)

---

**Document Status**: ✅ Complete  
**Last Review**: 2025-12-27  
**Maintainer**: GigHub Security Team
