# 06. Data Models and Schemas

## Document Information
- **Version**: 1.0
- **Status**: Complete
- **Last Updated**: 2025-12-27
- **Related Documents**: 
  - [03-three-layer-model.md](./03-three-layer-model.md)
  - [05-module-catalog.md](./05-module-catalog.md)
  - [SETC-02-requirements.md](../setc/SETC-02-requirements.md)

---

## Table of Contents
1. [Data Model Overview](#data-model-overview)
2. [Core Domain Models](#core-domain-models)
3. [Firestore Collection Schemas](#firestore-collection-schemas)
4. [Data Relationships](#data-relationships)
5. [Schema Validation](#schema-validation)
6. [Data Migration Strategy](#data-migration-strategy)
7. [Best Practices](#best-practices)

---

## 1. Data Model Overview

### 1.1 Data Architecture Principles

```
┌─────────────────────────────────────────────────────────────┐
│                    Data Architecture Layers                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  L0: Governance Data (Policies, Rules, Contracts)   │   │
│  │  - Immutable governance records                      │   │
│  │  - Policy definitions                                │   │
│  │  - Contract metadata                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ▼                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  L1: Fact Data (Events, Audit Trail)                │   │
│  │  - Immutable event records                           │   │
│  │  - Evidence attachments                              │   │
│  │  - Audit logs                                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ▼                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  L2: Derived Data (Aggregates, Metrics, Views)      │   │
│  │  - Calculated progress                               │   │
│  │  - Statistical summaries                             │   │
│  │  - Dashboard data                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Key Principles**:
- **Immutability**: L0 and L1 data are write-once, never modified
- **Traceability**: All changes tracked through event sourcing
- **Derivability**: L2 data can be rebuilt from L1 events
- **Validation**: All data validated before persistence
- **Versioning**: Schema versions tracked for migration

### 1.2 Data Storage Strategy

| Layer | Storage Type | Retention | Access Pattern |
|-------|--------------|-----------|----------------|
| L0 Governance | Firestore Documents | Indefinite | Read-heavy |
| L1 Events | Firestore Collections | 7+ years | Append-only |
| L2 Derived | Firestore + Cache | Regenerable | Read/Write |
| Evidence Files | Cloud Storage | 7+ years | Blob storage |
| User Sessions | Firestore/Redis | 30 days | Cache-first |

---

## 2. Core Domain Models

### 2.1 Contract Module

#### Contract Entity
```typescript
interface Contract {
  id: string;                    // Unique contract identifier
  contractNumber: string;        // Human-readable number (e.g., "CTR-2024-001")
  
  // Basic Information
  name: string;                  // Contract name/title
  description: string;           // Detailed description
  type: 'construction' | 'maintenance' | 'renovation' | 'design';
  status: 'draft' | 'active' | 'completed' | 'terminated' | 'suspended';
  
  // Parties
  owner: {
    organizationId: string;
    organizationName: string;
    representative: string;
    contactInfo: ContactInfo;
  };
  contractor: {
    organizationId: string;
    organizationName: string;
    representative: string;
    contactInfo: ContactInfo;
    license: string;
  };
  
  // Financial
  budget: {
    totalAmount: number;
    currency: 'TWD' | 'USD';
    breakdown: BudgetItem[];
  };
  
  // Timeline
  timeline: {
    startDate: Date;
    plannedEndDate: Date;
    actualEndDate?: Date;
    milestones: Milestone[];
  };
  
  // Location
  location: {
    address: string;
    coordinates?: { lat: number; lng: number };
    region: string;
    city: string;
  };
  
  // Governance (L0)
  governance: {
    policyIds: string[];         // Applied policies
    approvalRequired: boolean;
    qualityStandards: string[];
    safetyRequirements: string[];
  };
  
  // Metadata
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  version: number;
}

interface ContactInfo {
  email: string;
  phone: string;
  address?: string;
}

interface BudgetItem {
  category: string;
  amount: number;
  description: string;
}

interface Milestone {
  id: string;
  name: string;
  targetDate: Date;
  actualDate?: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'delayed';
}
```

### 2.2 Task Module

#### Task Entity
```typescript
interface Task {
  id: string;
  taskNumber: string;            // Human-readable (e.g., "TSK-2024-001")
  
  // Basic Information
  title: string;
  description: string;
  type: 'construction' | 'inspection' | 'rework' | 'maintenance';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'assigned' | 'in-progress' | 'review' | 'completed' | 'blocked';
  
  // Relationships
  contractId: string;
  parentTaskId?: string;         // For subtasks
  dependsOn: string[];           // Task dependencies
  
  // Assignment
  assignedTo: {
    userId: string;
    userName: string;
    role: string;
    assignedAt: Date;
  };
  
  // Execution
  execution: {
    plannedStartDate: Date;
    plannedEndDate: Date;
    actualStartDate?: Date;
    actualEndDate?: Date;
    estimatedHours: number;
    actualHours?: number;
  };
  
  // Location & Resources
  location?: {
    zone: string;
    floor?: string;
    coordinates?: { lat: number; lng: number };
  };
  resources: {
    materials: MaterialItem[];
    equipment: EquipmentItem[];
    labor: LaborItem[];
  };
  
  // Quality & Safety
  qcRequired: boolean;
  safetyChecklist?: string[];
  qualityStandards: string[];
  
  // Progress
  progress: {
    percentage: number;           // 0-100
    lastUpdated: Date;
    milestones: TaskMilestone[];
  };
  
  // Metadata
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

interface MaterialItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  specification?: string;
}

interface EquipmentItem {
  id: string;
  name: string;
  quantity: number;
  requiredDuration: number;      // Hours
}

interface LaborItem {
  role: string;
  quantity: number;
  skill: string;
}

interface TaskMilestone {
  name: string;
  targetDate: Date;
  completed: boolean;
  completedAt?: Date;
}
```

### 2.3 Quality Control (QC) Module

#### QC Inspection
```typescript
interface QCInspection {
  id: string;
  inspectionNumber: string;
  
  // Context
  contractId: string;
  taskId: string;
  inspectionType: 'pre-work' | 'in-progress' | 'final' | 'random';
  
  // Inspector
  inspector: {
    userId: string;
    userName: string;
    certification: string;
    organization: string;
  };
  
  // Inspection Details
  checklist: QCCheckItem[];
  overallResult: 'pass' | 'conditional-pass' | 'fail';
  score?: number;                // 0-100
  
  // Defects
  defects: Defect[];
  
  // Evidence
  evidence: {
    photos: EvidenceFile[];
    videos: EvidenceFile[];
    documents: EvidenceFile[];
  };
  
  // Actions
  correctiveActions: CorrectiveAction[];
  
  // Approval
  requiresReInspection: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  
  // Metadata
  inspectedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface QCCheckItem {
  id: string;
  category: string;
  description: string;
  standard: string;
  result: 'pass' | 'fail' | 'n/a';
  measurement?: {
    expected: string;
    actual: string;
    unit: string;
  };
  notes?: string;
}

interface Defect {
  id: string;
  severity: 'critical' | 'major' | 'minor';
  category: string;
  description: string;
  location: string;
  photoIds: string[];
  status: 'open' | 'in-progress' | 'resolved' | 'verified';
}

interface CorrectiveAction {
  id: string;
  defectId: string;
  description: string;
  assignedTo: string;
  dueDate: Date;
  completedAt?: Date;
  status: 'pending' | 'in-progress' | 'completed';
}
```

### 2.4 Acceptance Module

#### Acceptance Record
```typescript
interface AcceptanceRecord {
  id: string;
  acceptanceNumber: string;
  
  // Context
  contractId: string;
  taskIds: string[];             // Tasks being accepted
  type: 'partial' | 'final' | 'milestone';
  
  // Parties
  submittedBy: {
    userId: string;
    organization: string;
    submittedAt: Date;
  };
  reviewedBy: {
    userId: string;
    organization: string;
    reviewedAt?: Date;
  };
  approvedBy?: {
    userId: string;
    organization: string;
    approvedAt?: Date;
  };
  
  // Evaluation
  criteria: AcceptanceCriteria[];
  overallResult: 'pending' | 'approved' | 'conditional' | 'rejected';
  
  // Deliverables
  deliverables: Deliverable[];
  
  // Quality Assessment
  qcInspectionIds: string[];
  qualityScore?: number;         // 0-100
  
  // Issues
  issues: AcceptanceIssue[];
  
  // Evidence
  evidence: {
    photos: EvidenceFile[];
    videos: EvidenceFile[];
    documents: EvidenceFile[];
    asBuiltDrawings: EvidenceFile[];
  };
  
  // Financial
  payment: {
    milestonePercentage: number;
    amount: number;
    status: 'pending' | 'approved' | 'paid';
    paidAt?: Date;
  };
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  finalizedAt?: Date;
}

interface AcceptanceCriteria {
  id: string;
  category: string;
  description: string;
  standard: string;
  met: boolean;
  evidence?: string;
  notes?: string;
}

interface Deliverable {
  id: string;
  name: string;
  type: 'physical' | 'document' | 'certification';
  status: 'pending' | 'submitted' | 'verified';
  fileIds?: string[];
}

interface AcceptanceIssue {
  id: string;
  severity: 'blocking' | 'major' | 'minor';
  description: string;
  resolution?: string;
  resolvedAt?: Date;
  status: 'open' | 'resolved';
}
```

### 2.5 Event (L1 Layer)

#### Domain Event
```typescript
interface DomainEvent {
  // Event Identity
  id: string;                    // Unique event ID
  type: string;                  // Event type (e.g., 'construction.concrete_pour')
  version: number;               // Event schema version
  
  // Context
  aggregateType: 'contract' | 'task' | 'qc' | 'acceptance' | 'finance';
  aggregateId: string;           // Related entity ID
  
  // Actor
  actor: {
    userId: string;
    userName: string;
    role: string;
    organization: string;
  };
  
  // Target
  target: {
    type: 'planned' | 'confirmed' | 'rejected';
    entityId: string;
    entityType: string;
    location?: string;
  };
  
  // Payload
  payload: Record<string, any>; // Event-specific data
  
  // Evidence
  evidence: Evidence[];
  
  // Causality
  causedBy?: {
    eventId: string;             // Parent event
    eventType: string;
  };
  correlationId?: string;        // Workflow correlation
  
  // Metadata
  timestamp: Date;
  metadata: {
    source: string;              // System/module that generated event
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
  };
  
  // Immutability
  readonly createdAt: Date;
  readonly hash: string;         // SHA-256 hash for integrity
}

interface Evidence {
  id: string;
  type: 'photo' | 'video' | 'document' | 'signature' | 'measurement';
  url: string;                   // Cloud Storage URL
  filename: string;
  mimeType: string;
  size: number;                  // Bytes
  hash: string;                  // SHA-256 for integrity
  uploadedAt: Date;
  metadata?: {
    latitude?: number;
    longitude?: number;
    deviceId?: string;
    timestamp?: Date;
  };
}
```

### 2.6 User & Permission

#### User Entity
```typescript
interface User {
  id: string;                    // Firebase Auth UID
  
  // Basic Information
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  
  // Organization
  organization: {
    id: string;
    name: string;
    type: 'owner' | 'contractor' | 'subcontractor' | 'consultant';
  };
  
  // Roles & Permissions
  roles: UserRole[];
  permissions: string[];         // Computed from roles
  
  // Status
  status: 'active' | 'inactive' | 'suspended';
  emailVerified: boolean;
  
  // Preferences
  preferences: {
    language: 'zh-TW' | 'en';
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
  
  // Metadata
  createdAt: Date;
  lastLoginAt?: Date;
  updatedAt: Date;
}

interface UserRole {
  roleId: string;
  roleName: string;
  scope: {
    type: 'global' | 'organization' | 'contract' | 'project';
    scopeId?: string;
  };
  assignedAt: Date;
  assignedBy: string;
}
```

---

## 3. Firestore Collection Schemas

### 3.1 Collection Structure

```
/contracts/{contractId}
  - fields: Contract (as defined above)
  
  /tasks/{taskId}
    - fields: Task
    
    /events/{eventId}
      - fields: DomainEvent (L1)
  
  /qc-inspections/{inspectionId}
    - fields: QCInspection
  
  /acceptances/{acceptanceId}
    - fields: AcceptanceRecord
  
  /governance/{policyId}
    - fields: GovernancePolicy (L0)

/events/{eventId}
  - fields: DomainEvent (Global L1 events)

/derived-state/{aggregateId}
  - fields: DerivedState (L2 computed data)

/users/{userId}
  - fields: User

/audit-logs/{logId}
  - fields: AuditLog
```

### 3.2 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper Functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function hasRole(role) {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roles.hasAny([role]);
    }
    
    function belongsToOrganization(orgId) {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.organization.id == orgId;
    }
    
    // Contracts Collection
    match /contracts/{contractId} {
      allow read: if isAuthenticated() && 
                     (hasRole('admin') || 
                      belongsToOrganization(resource.data.owner.organizationId) ||
                      belongsToOrganization(resource.data.contractor.organizationId));
      
      allow create: if isAuthenticated() && hasRole('contract_manager');
      
      allow update: if isAuthenticated() && 
                       hasRole('contract_manager') &&
                       request.resource.data.version == resource.data.version + 1;
      
      allow delete: if false; // Contracts cannot be deleted
      
      // Tasks Subcollection
      match /tasks/{taskId} {
        allow read: if isAuthenticated();
        allow create: if isAuthenticated() && hasRole('task_manager');
        allow update: if isAuthenticated() && 
                         (hasRole('task_manager') || 
                          request.auth.uid == resource.data.assignedTo.userId);
        
        // Events Subcollection (L1 - Immutable)
        match /events/{eventId} {
          allow read: if isAuthenticated();
          allow create: if isAuthenticated() && 
                           !exists(/databases/$(database)/documents/contracts/$(contractId)/tasks/$(taskId)/events/$(eventId));
          allow update: if false; // Events are immutable
          allow delete: if false; // Events are never deleted
        }
      }
      
      // QC Inspections
      match /qc-inspections/{inspectionId} {
        allow read: if isAuthenticated();
        allow create: if isAuthenticated() && hasRole('qc_inspector');
        allow update: if isAuthenticated() && 
                         hasRole('qc_inspector') &&
                         resource.data.inspectedAt == null; // Only before finalization
      }
      
      // Acceptances
      match /acceptances/{acceptanceId} {
        allow read: if isAuthenticated();
        allow create: if isAuthenticated() && hasRole('acceptance_manager');
        allow update: if isAuthenticated() && 
                         hasRole('acceptance_manager') &&
                         resource.data.finalizedAt == null;
      }
    }
    
    // Global Events (L1 - Immutable)
    match /events/{eventId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if false; // Events are immutable
      allow delete: if false;
    }
    
    // Derived State (L2 - Regenerable)
    match /derived-state/{aggregateId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated(); // Can be regenerated
    }
    
    // Users
    match /users/{userId} {
      allow read: if isAuthenticated() && 
                     (request.auth.uid == userId || hasRole('admin'));
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isAuthenticated() && 
                       (request.auth.uid == userId || hasRole('admin'));
    }
    
    // Audit Logs (Append-only)
    match /audit-logs/{logId} {
      allow read: if hasRole('admin') || hasRole('auditor');
      allow create: if isAuthenticated();
      allow update: if false;
      allow delete: if false;
    }
  }
}
```

### 3.3 Indexes

```javascript
// composite-indexes.json
{
  "indexes": [
    {
      "collectionGroup": "contracts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "owner.organizationId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "tasks",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "contractId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "priority", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "events",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "aggregateId", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "events",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "type", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "qc-inspections",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "contractId", "order": "ASCENDING" },
        { "fieldPath": "overallResult", "order": "ASCENDING" },
        { "fieldPath": "inspectedAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## 4. Data Relationships

### 4.1 Entity Relationship Diagram

```
┌──────────────┐
│   Contract   │◄─────────┐
└──────┬───────┘          │
       │ 1                │
       │                  │ N
       │ N        ┌───────┴────────┐
       ├──────────┤      Task      │
       │          └───────┬────────┘
       │                  │ 1
       │                  │
       │                  │ N
       │          ┌───────┴────────────┐
       │          │   DomainEvent (L1) │
       │          └────────────────────┘
       │ 1
       │
       │ N        ┌──────────────────┐
       ├──────────┤  QCInspection    │
       │          └──────────────────┘
       │ 1
       │
       │ N        ┌──────────────────┐
       ├──────────┤ AcceptanceRecord │
       │          └──────────────────┘
       │ 1
       │
       │ N        ┌──────────────────┐
       └──────────┤ GovernancePolicy │
                  └──────────────────┘
```

### 4.2 Relationship Rules

1. **Contract → Task**: One-to-Many
   - A contract has multiple tasks
   - Tasks cannot exist without a contract
   - Cascade read permissions

2. **Task → Event**: One-to-Many (L1)
   - Tasks generate multiple events
   - Events are immutable
   - Events maintain full audit trail

3. **Contract → QC Inspection**: One-to-Many
   - Inspections are contract-scoped
   - Multiple inspections per contract

4. **Contract → Acceptance**: One-to-Many
   - Multiple acceptance milestones
   - References multiple tasks

5. **Event → Evidence**: One-to-Many
   - Events can have multiple evidence files
   - Evidence stored in Cloud Storage

---

## 5. Schema Validation

### 5.1 TypeScript Validation with Zod

```typescript
import { z } from 'zod';

// Contract Schema
export const ContractSchema = z.object({
  id: z.string().uuid(),
  contractNumber: z.string().regex(/^CTR-\d{4}-\d{3}$/),
  name: z.string().min(1).max(200),
  description: z.string().max(2000),
  type: z.enum(['construction', 'maintenance', 'renovation', 'design']),
  status: z.enum(['draft', 'active', 'completed', 'terminated', 'suspended']),
  
  owner: z.object({
    organizationId: z.string(),
    organizationName: z.string(),
    representative: z.string(),
    contactInfo: z.object({
      email: z.string().email(),
      phone: z.string(),
      address: z.string().optional(),
    }),
  }),
  
  budget: z.object({
    totalAmount: z.number().positive(),
    currency: z.enum(['TWD', 'USD']),
    breakdown: z.array(z.object({
      category: z.string(),
      amount: z.number().positive(),
      description: z.string(),
    })),
  }),
  
  timeline: z.object({
    startDate: z.date(),
    plannedEndDate: z.date(),
    actualEndDate: z.date().optional(),
  }),
  
  createdAt: z.date(),
  updatedAt: z.date(),
  version: z.number().int().positive(),
});

// Task Schema
export const TaskSchema = z.object({
  id: z.string().uuid(),
  taskNumber: z.string().regex(/^TSK-\d{4}-\d{3}$/),
  title: z.string().min(1).max(200),
  description: z.string().max(2000),
  type: z.enum(['construction', 'inspection', 'rework', 'maintenance']),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  status: z.enum(['pending', 'assigned', 'in-progress', 'review', 'completed', 'blocked']),
  
  contractId: z.string().uuid(),
  assignedTo: z.object({
    userId: z.string(),
    userName: z.string(),
    role: z.string(),
    assignedAt: z.date(),
  }),
  
  progress: z.object({
    percentage: z.number().min(0).max(100),
    lastUpdated: z.date(),
  }),
  
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Domain Event Schema (L1)
export const DomainEventSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  version: z.number().int().positive(),
  
  aggregateType: z.enum(['contract', 'task', 'qc', 'acceptance', 'finance']),
  aggregateId: z.string().uuid(),
  
  actor: z.object({
    userId: z.string(),
    userName: z.string(),
    role: z.string(),
    organization: z.string(),
  }),
  
  target: z.object({
    type: z.enum(['planned', 'confirmed', 'rejected']),
    entityId: z.string(),
    entityType: z.string(),
  }),
  
  payload: z.record(z.any()),
  evidence: z.array(z.object({
    type: z.enum(['photo', 'video', 'document', 'signature', 'measurement']),
    url: z.string().url(),
    hash: z.string(),
  })),
  
  timestamp: z.date(),
  createdAt: z.date(),
  hash: z.string(),
});
```

### 5.2 Validation in Services

```typescript
@Injectable({ providedIn: 'root' })
export class ContractService {
  
  async createContract(data: unknown): Promise<Result<Contract>> {
    try {
      // Validate schema
      const validated = ContractSchema.parse(data);
      
      // Business rule validation
      if (validated.timeline.startDate > validated.timeline.plannedEndDate) {
        return Result.fail('Start date must be before end date');
      }
      
      // Check policy compliance
      const policyCheck = await this.policyService.checkContractPolicy(validated);
      if (!policyCheck.allowed) {
        return Result.fail(`Policy violation: ${policyCheck.reason}`);
      }
      
      // Persist
      const contract = await this.repository.create(validated);
      
      return Result.ok(contract);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return Result.fail(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
      }
      return Result.fail('Unknown error');
    }
  }
}
```

---

## 6. Data Migration Strategy

### 6.1 Schema Versioning

```typescript
interface SchemaVersion {
  collection: string;
  version: number;
  appliedAt: Date;
  description: string;
  script: string;
}

// Example: Contract schema v1 → v2
const migrationV2: SchemaVersion = {
  collection: 'contracts',
  version: 2,
  appliedAt: new Date('2025-01-15'),
  description: 'Add governance.safetyRequirements field',
  script: 'migrations/contracts/v1-to-v2.ts'
};
```

### 6.2 Migration Script Example

```typescript
// migrations/contracts/v1-to-v2.ts
import { getFirestore } from 'firebase-admin/firestore';

export async function migrateContractsV1toV2() {
  const db = getFirestore();
  const contractsRef = db.collection('contracts');
  
  const snapshot = await contractsRef
    .where('version', '==', 1)
    .get();
  
  const batch = db.batch();
  let count = 0;
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    
    // Add new field with default value
    const updated = {
      ...data,
      governance: {
        ...data.governance,
        safetyRequirements: data.governance?.safetyRequirements || [],
      },
      version: 2,
      updatedAt: new Date(),
    };
    
    batch.update(doc.ref, updated);
    count++;
    
    // Firestore batch limit is 500
    if (count % 500 === 0) {
      await batch.commit();
    }
  }
  
  if (count % 500 !== 0) {
    await batch.commit();
  }
  
  console.log(`Migrated ${count} contracts from v1 to v2`);
}
```

### 6.3 Migration Best Practices

1. **Always Test First**: Run on test/staging environment
2. **Backup Data**: Create Firestore export before migration
3. **Batch Operations**: Use Firestore batch writes (max 500)
4. **Idempotent**: Migrations should be rerunnable
5. **Version Tracking**: Track schema versions in documents
6. **Rollback Plan**: Have a rollback script ready

---

## 7. Best Practices

### 7.1 Data Modeling Guidelines

✅ **DO**:
- Use denormalization for read-heavy data
- Include version field for optimistic locking
- Use timestamps (createdAt, updatedAt) consistently
- Validate data at service layer before persistence
- Use subcollections for 1-to-many relationships
- Index frequently queried fields
- Use Cloud Storage for large files (>1MB)

❌ **DON'T**:
- Store files directly in Firestore documents
- Create deeply nested structures (>3 levels)
- Use arrays for large collections (>100 items)
- Store computed values that can be derived
- Skip validation in critical paths
- Ignore Firestore limitations (1MB doc size, 500 writes/batch)

### 7.2 Performance Optimization

```typescript
// ✅ Good: Denormalized for fast reads
interface Task {
  contractId: string;
  contractName: string;      // Denormalized
  assignedToName: string;    // Denormalized
}

// ❌ Bad: Requires multiple reads
interface Task {
  contractId: string;
  assignedToId: string;
  // Need to fetch contract and user separately
}
```

### 7.3 Security Best Practices

1. **Never Trust Client Data**: Validate on server
2. **Use Security Rules**: Enforce at Firestore level
3. **Principle of Least Privilege**: Minimal permissions
4. **Audit All Changes**: Log in L1 events
5. **Encrypt Sensitive Data**: At rest and in transit

### 7.4 Monitoring & Observability

```typescript
// Add metadata for debugging
interface DataModel {
  // ... fields
  
  metadata: {
    createdBy: string;
    createdAt: Date;
    updatedBy: string;
    updatedAt: Date;
    source: 'web' | 'mobile' | 'api' | 'batch';
    version: number;
  };
}
```

---

## Summary

This document provides:
- ✅ Complete TypeScript interfaces for all domain models
- ✅ Firestore collection structure and security rules
- ✅ Schema validation with Zod
- ✅ Data relationship diagrams
- ✅ Migration strategy with examples
- ✅ Best practices for data modeling

**Next Steps**:
1. Review and validate schemas with stakeholders
2. Implement Zod validation in services
3. Set up Firestore indexes
4. Create migration scripts for existing data
5. Establish data governance policies

---

**Related Documents**:
- [03-three-layer-model.md](./03-three-layer-model.md) - L0/L1/L2 data architecture
- [05-module-catalog.md](./05-module-catalog.md) - Module specifications
- [08-security-model.md](./08-security-model.md) - Security rules and RBAC
