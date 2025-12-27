# Three-Layer Event Model - GigHub Implementation

> **Document Type**: Technical Architecture Specification  
> **Version**: 1.0  
> **Last Updated**: 2025-12-27  
> **Status**: Production Reference  
> **Audience**: Architects, Senior Developers

---

## Table of Contents

1. [Model Overview](#model-overview)
2. [Layer Definitions](#layer-definitions)
3. [Implementation Patterns](#implementation-patterns)
4. [Data Flow Rules](#data-flow-rules)
5. [Code Examples](#code-examples)
6. [Testing Strategies](#testing-strategies)
7. [Migration Guide](#migration-guide)

---

## Model Overview

### The Three-Layer Truth Model

The Three-Layer Event Model is the foundational architecture pattern of GigHub, ensuring data integrity, traceability, and accountability throughout the construction lifecycle.

```
┌─────────────────────────────────────────────────────────┐
│  L0: Governance Layer - "Who can do what?"              │
│  Purpose: Define rules, permissions, and scope          │
│  Examples: Contract terms, approval rules, policies     │
│  Mutability: Can be changed (but creates audit trail)   │
└────────────────────┬────────────────────────────────────┘
                     │ (defines rules for)
                     ↓
┌─────────────────────────────────────────────────────────┐
│  L1: Fact Layer - "What actually happened?"             │
│  Purpose: Record immutable construction events          │
│  Examples: Concrete pour, inspection, material delivery │
│  Mutability: IMMUTABLE - append-only                    │
└────────────────────┬────────────────────────────────────┘
                     │ (source for calculations)
                     ↓
┌─────────────────────────────────────────────────────────┐
│  L2: Derived Layer - "How we understand it?"            │
│  Purpose: Calculate insights from L1 facts              │
│  Examples: Progress %, cost variance, quality metrics   │
│  Mutability: Can be recomputed, discarded, regenerated  │
└─────────────────────────────────────────────────────────┘
```

### Core Principles

#### 1. One-Way Data Flow
**Rule**: Data flows ONLY downward: L0 → L1 → L2

```typescript
// ✅ CORRECT: L0 defines rules for L1
if (contract.status === 'active') {  // L0 check
  await createConstructionEvent({    // L1 creation
    type: 'concrete_pour',
    timestamp: new Date()
  });
}

// ❌ WRONG: L1 changing L0
constructionEvent.contractStatus = 'completed';  // L1 cannot modify L0!
```

#### 2. Immutability at L1
**Rule**: L1 events can NEVER be modified or deleted

```typescript
// ❌ WRONG: Modifying L1 event
event.location = 'B1F-C4';
await update(event);

// ✅ CORRECT: Add correction event
await append({
  type: 'location_correction',
  corrects: originalEventId,
  newLocation: 'B1F-C4',
  reason: 'Survey error in original record',
  correctedBy: 'engineer@example.com',
  timestamp: new Date()
});
```

#### 3. L2 is Always Derived
**Rule**: L2 must be calculable from L1 and can be regenerated

```typescript
// ❌ WRONG: Manually setting L2
project.completionRate = 75;

// ✅ CORRECT: Calculate from L1
const completedTasks = await getL1Events({
  type: 'task.completed',
  projectId: project.id
});
const totalTasks = project.scope.tasks.length;
project.completionRate = (completedTasks.length / totalTasks) * 100;
```

---

## Layer Definitions

### L0: Governance Layer

**Purpose**: Establish the "rules of the game" for construction projects.

**Characteristics**:
- Defines WHO can do WHAT
- Can be modified (with approval and audit trail)
- No physical world changes
- Cannot be used to calculate progress or costs

**What Belongs in L0**:
- ✅ Contract terms and scope
- ✅ Approval workflows and matrices
- ✅ Access control policies
- ✅ Budget allocation rules
- ✅ Quality standards definitions
- ✅ Warranty period configurations

**What Does NOT Belong in L0**:
- ❌ Actual construction work
- ❌ Inspection results
- ❌ Material quantities delivered
- ❌ Worker attendance
- ❌ Cost calculations

**TypeScript Interface**:
```typescript
interface GovernanceEvent {
  type: GovernanceEventType;
  timestamp: Date;
  actor: string;  // Who made this governance decision
  correlationId?: string;
  
  // Governance-specific fields
  scope?: {
    contracts?: string[];
    locations?: string[];
    teams?: string[];
  };
  
  rules?: {
    approvalRequired?: boolean;
    approvers?: string[];
    conditions?: Record<string, any>;
  };
  
  metadata?: {
    reason?: string;
    approvedBy?: string;
    effectiveDate?: Date;
  };
}

// Example: Contract Activation
const contractActivation: GovernanceEvent = {
  type: 'governance.contract_activated',
  timestamp: new Date(),
  actor: 'owner@example.com',
  scope: {
    contracts: ['CONTRACT-001'],
    locations: ['Building-A', 'Building-B']
  },
  rules: {
    approvalRequired: true,
    approvers: ['owner@example.com', 'pm@contractor.com']
  },
  metadata: {
    reason: 'All preliminary conditions met',
    approvedBy: 'owner@example.com',
    effectiveDate: new Date('2025-01-01')
  }
};
```

**Firestore Collection Structure**:
```typescript
// Collection: governanceEvents
{
  id: 'GOV-20251227-001',
  type: 'governance.contract_activated',
  timestamp: Timestamp,
  actor: 'owner@example.com',
  contractId: 'CONTRACT-001',
  scope: {
    locations: ['Building-A', 'Building-B'],
    budget: 5000000
  },
  rules: {
    canCreateTasks: true,
    requiresApproval: true,
    approvers: ['owner@example.com']
  },
  auditTrail: {
    createdAt: Timestamp,
    createdBy: 'owner@example.com',
    approvedBy: 'owner@example.com',
    approvedAt: Timestamp
  }
}
```

### L1: Fact Layer

**Purpose**: Create an immutable, evidence-based record of everything that actually happened.

**Characteristics**:
- Records physical world events
- IMMUTABLE (append-only)
- Must have evidence (photo, signature, GPS, sensor)
- Has timestamp, actor, and location
- Cannot be modified or deleted

**What Belongs in L1**:
- ✅ Construction work completed (concrete pour, rebar install)
- ✅ Quality inspections performed
- ✅ Materials delivered to site
- ✅ Worker check-in/check-out
- ✅ Equipment usage
- ✅ Safety incidents
- ✅ Weather conditions
- ✅ Approvals/Rejections (the act of approval, not the rule)

**What Does NOT Belong in L1**:
- ❌ Progress percentages (that's L2)
- ❌ Cost calculations (that's L2)
- ❌ Predictions or estimates
- ❌ User preferences or settings
- ❌ Temporary/draft data

**TypeScript Interface**:
```typescript
interface ConstructionEvent {
  // Core fields (REQUIRED)
  id: string;
  type: ConstructionEventType;
  timestamp: Date;
  actor: string;  // Who did this
  
  // Location (REQUIRED)
  target: {
    type: 'confirmed' | 'provisional';
    location?: string;  // e.g., "B1F-C3-column"
    coordinates?: { lat: number; lng: number };
    provisional_description?: string;  // If type is 'provisional'
  };
  
  // Evidence (REQUIRED - at least one)
  evidence: Evidence[];
  
  // Context
  contractId?: string;
  taskId?: string;
  correlationId?: string;
  
  // Metadata
  metadata?: Record<string, any>;
}

interface Evidence {
  type: 'photo' | 'signature' | 'gps' | 'sensor' | 'document';
  timestamp: Date;
  url?: string;  // For photo/document
  data?: any;    // For signature/sensor data
  hash?: string; // For integrity verification
}

// Example: Concrete Pour Event
const concretePourEvent: ConstructionEvent = {
  id: 'EVENT-20251227-12345',
  type: 'construction.concrete_pour_completed',
  timestamp: new Date('2025-12-27T10:30:00Z'),
  actor: 'worker@contractor.com',
  
  target: {
    type: 'confirmed',
    location: 'B1F-C3-column',
    coordinates: { lat: 25.0330, lng: 121.5654 }
  },
  
  evidence: [
    {
      type: 'photo',
      timestamp: new Date('2025-12-27T10:30:00Z'),
      url: 'https://storage.googleapis.com/gighub/photos/event-12345.jpg',
      hash: 'sha256:abc123...'
    },
    {
      type: 'signature',
      timestamp: new Date('2025-12-27T10:35:00Z'),
      data: {
        signer: 'inspector@qa.com',
        signedAt: new Date('2025-12-27T10:35:00Z')
      }
    },
    {
      type: 'gps',
      timestamp: new Date('2025-12-27T10:30:00Z'),
      data: {
        latitude: 25.0330,
        longitude: 121.5654,
        accuracy: 5.0  // meters
      }
    }
  ],
  
  contractId: 'CONTRACT-001',
  taskId: 'TASK-456',
  correlationId: 'user-action-789',
  
  metadata: {
    volume: 45.5,  // cubic meters
    grade: '280kgf/cm²',
    supplier: 'ABC Concrete Co.',
    batchNumber: 'BATCH-2025-1227-001',
    temperature: 25.5,  // Celsius
    slump: 18  // cm
  }
};
```

**Firestore Collection Structure**:
```typescript
// Collection: constructionEvents
{
  id: 'EVENT-20251227-12345',
  type: 'construction.concrete_pour_completed',
  timestamp: Timestamp,
  actor: 'worker@contractor.com',
  
  target: {
    type: 'confirmed',
    location: 'B1F-C3-column',
    coordinates: new GeoPoint(25.0330, 121.5654)
  },
  
  evidence: [
    {
      type: 'photo',
      timestamp: Timestamp,
      url: 'gs://gighub/photos/event-12345.jpg',
      hash: 'sha256:abc123...'
    }
  ],
  
  contractId: 'CONTRACT-001',
  taskId: 'TASK-456',
  
  metadata: {
    volume: 45.5,
    grade: '280kgf/cm²'
  },
  
  // Firestore metadata
  createdAt: Timestamp,
  createdBy: 'worker@contractor.com'
}

// Firestore Security Rules (IMMUTABLE!)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /constructionEvents/{eventId} {
      // Can read if authenticated
      allow read: if request.auth != null;
      
      // Can ONLY create, NOT update or delete
      allow create: if request.auth != null &&
                       request.resource.data.actor == request.auth.uid;
      
      // IMMUTABLE: No updates or deletes allowed!
      allow update, delete: if false;
    }
  }
}
```

### L2: Derived Layer

**Purpose**: Calculate insights, metrics, and understanding from L1 facts.

**Characteristics**:
- Computed from L1 events
- Can be discarded and regenerated
- Multiple versions for different roles (owner view, contractor view)
- Optimized for query performance
- Can include aggregations, summaries, analytics

**What Belongs in L2**:
- ✅ Progress percentages
- ✅ Cost calculations
- ✅ Schedule variance
- ✅ Quality metrics (pass/fail rates)
- ✅ Team productivity
- ✅ Billable/Payable amounts
- ✅ Forecast/predictions
- ✅ Dashboard KPIs

**What Does NOT Belong in L2**:
- ❌ Original construction events (that's L1)
- ❌ Contract terms (that's L0)
- ❌ Manually entered data
- ❌ Evidence files

**TypeScript Interface**:
```typescript
interface DerivedState {
  // Metadata
  entityId: string;  // e.g., projectId, contractId
  entityType: 'project' | 'contract' | 'task';
  calculatedAt: Date;
  calculatedBy: string;  // Service/process that calculated this
  
  // Calculation metadata
  sourceEvents: string[];  // L1 event IDs used for calculation
  calculationMethod: string;  // Algorithm description
  version: number;  // For tracking calculation changes
  
  // Derived data
  metrics: Record<string, number>;
  
  // Traceability
  correlationId?: string;
}

// Example: Project Progress State
const projectProgress: DerivedState = {
  entityId: 'PROJECT-001',
  entityType: 'project',
  calculatedAt: new Date('2025-12-27T15:00:00Z'),
  calculatedBy: 'progress-calculator-service',
  
  sourceEvents: [
    'EVENT-001',  // Task 1 completed
    'EVENT-002',  // Task 2 completed
    'EVENT-003'   // Task 3 completed
  ],
  
  calculationMethod: 'weighted_completion_rate',
  version: 2,
  
  metrics: {
    totalTasks: 100,
    completedTasks: 75,
    completionRate: 75.0,  // (75/100) * 100
    weightedCompletionRate: 72.5,  // Considering task weights
    
    // Schedule metrics
    plannedDuration: 180,  // days
    elapsedDays: 150,
    scheduleVariance: -10,  // days (negative = ahead of schedule)
    
    // Quality metrics
    totalInspections: 75,
    passedInspections: 68,
    qualityPassRate: 90.67,  // (68/75) * 100
    
    // Cost metrics (calculated from L1 + L0)
    budgetAllocated: 5000000,
    actualCost: 3750000,
    costVariance: -250000,  // negative = under budget
    costPerformanceIndex: 1.07  // budgeted / actual
  },
  
  correlationId: 'dashboard-refresh-123'
};
```

**Firestore Collection Structure**:
```typescript
// Collection: derivedStates
{
  id: 'DERIVED-PROJECT-001-20251227',
  entityId: 'PROJECT-001',
  entityType: 'project',
  calculatedAt: Timestamp,
  calculatedBy: 'progress-calculator-service',
  
  sourceEvents: ['EVENT-001', 'EVENT-002', 'EVENT-003'],
  calculationMethod: 'weighted_completion_rate',
  version: 2,
  
  metrics: {
    completionRate: 75.0,
    scheduleVariance: -10,
    qualityPassRate: 90.67,
    costPerformanceIndex: 1.07
  },
  
  // Can be deleted and regenerated
  ttl: Timestamp  // Optional: Auto-delete after N days
}
```

---

## Implementation Patterns

### Pattern 1: L0 Policy Check Before L1 Creation

```typescript
// Example: Creating a Task (requires active contract - L0 check)
async function createTask(
  contractId: string,
  taskData: CreateTaskDTO
): Promise<Task> {
  // 1. Get L0 governance state
  const contract = await contractRepository.findById(contractId);
  if (!contract) {
    throw new Error('Contract not found');
  }
  
  // 2. Check L0 policy
  if (contract.status !== 'active') {
    throw new PolicyViolationError(
      'Cannot create task for inactive contract',
      'L0_CONTRACT_MUST_BE_ACTIVE',
      { contractId, currentStatus: contract.status }
    );
  }
  
  // 3. Create L1 event
  const task = await taskRepository.create({
    ...taskData,
    contractId,
    createdAt: new Date(),
    createdBy: getCurrentUser()
  });
  
  // 4. Emit event for other systems
  eventBus.emit('task.created', {
    taskId: task.id,
    contractId,
    timestamp: new Date()
  });
  
  return task;
}
```

### Pattern 2: L1 Event with Evidence Validation

```typescript
async function recordConcretePour(
  data: ConcretePourDTO
): Promise<ConstructionEvent> {
  // 1. Validate evidence requirements
  if (!data.evidence || data.evidence.length === 0) {
    throw new ValidationError('At least one evidence item required for L1 events');
  }
  
  const hasPhoto = data.evidence.some(e => e.type === 'photo');
  const hasSignature = data.evidence.some(e => e.type === 'signature');
  
  if (!hasPhoto) {
    throw new ValidationError('Photo evidence required for concrete pour');
  }
  
  if (!hasSignature) {
    throw new ValidationError('Inspector signature required for concrete pour');
  }
  
  // 2. Create immutable L1 event
  const event: ConstructionEvent = {
    id: generateEventId(),
    type: 'construction.concrete_pour_completed',
    timestamp: new Date(),
    actor: getCurrentUser(),
    target: data.target,
    evidence: data.evidence,
    contractId: data.contractId,
    taskId: data.taskId,
    metadata: data.metadata
  };
  
  // 3. Store in append-only collection
  await constructionEventRepository.append(event);
  
  // 4. Emit event
  eventBus.emit('construction.concrete_pour_completed', {
    eventId: event.id,
    taskId: event.taskId,
    timestamp: event.timestamp
  });
  
  return event;
}
```

### Pattern 3: L2 Calculation from L1 Events

```typescript
async function calculateProjectProgress(
  projectId: string
): Promise<DerivedState> {
  // 1. Query L1 events
  const completedTasks = await constructionEventRepository.query({
    type: 'task.completed',
    'metadata.projectId': projectId
  });
  
  const failedQC = await constructionEventRepository.query({
    type: 'qc.failed',
    'metadata.projectId': projectId
  });
  
  // 2. Get L0 project scope
  const project = await projectRepository.findById(projectId);
  const totalTasks = project.scope.tasks.length;
  
  // 3. Calculate L2 metrics
  const completedCount = completedTasks.length;
  const failedCount = failedQC.length;
  const completionRate = (completedCount / totalTasks) * 100;
  const qualityPassRate = ((completedCount - failedCount) / completedCount) * 100;
  
  // 4. Create L2 derived state
  const derived: DerivedState = {
    entityId: projectId,
    entityType: 'project',
    calculatedAt: new Date(),
    calculatedBy: 'progress-calculator-service',
    sourceEvents: completedTasks.map(e => e.id),
    calculationMethod: 'simple_completion_rate',
    version: 1,
    metrics: {
      totalTasks,
      completedTasks: completedCount,
      completionRate,
      qualityPassRate
    }
  };
  
  // 5. Store (can be overwritten/regenerated)
  await derivedStateRepository.upsert(derived);
  
  return derived;
}
```

### Pattern 4: Correction Events (L1 Immutability)

```typescript
async function correctEventLocation(
  originalEventId: string,
  newLocation: string,
  reason: string
): Promise<ConstructionEvent> {
  // 1. Get original event (cannot modify!)
  const originalEvent = await constructionEventRepository.findById(originalEventId);
  if (!originalEvent) {
    throw new Error('Original event not found');
  }
  
  // 2. Create correction event (new L1 event)
  const correctionEvent: ConstructionEvent = {
    id: generateEventId(),
    type: 'construction.location_correction',
    timestamp: new Date(),
    actor: getCurrentUser(),
    target: {
      type: 'confirmed',
      location: newLocation
    },
    evidence: [
      {
        type: 'document',
        timestamp: new Date(),
        data: {
          corrects: originalEventId,
          originalLocation: originalEvent.target.location,
          newLocation,
          reason
        }
      }
    ],
    metadata: {
      corrects: originalEventId,
      originalLocation: originalEvent.target.location,
      reason
    }
  };
  
  // 3. Append correction event
  await constructionEventRepository.append(correctionEvent);
  
  // 4. Emit event
  eventBus.emit('construction.location_corrected', {
    originalEventId,
    correctionEventId: correctionEvent.id,
    newLocation
  });
  
  return correctionEvent;
}
```

---

## Data Flow Rules

### Rule 1: Never Skip Layers

```typescript
// ❌ WRONG: UI directly reading L1 and calculating
const events = await firestore.collection('constructionEvents').get();
const progress = (events.docs.length / totalTasks) * 100;

// ✅ CORRECT: UI reads from L2 (or service that calculates L2)
const progress = await progressService.getProjectProgress(projectId);
```

### Rule 2: L0 Can Only Reference L0

```typescript
// ❌ WRONG: L0 referencing L1 or L2
const policy = {
  canActivate: project.completionRate > 80  // L2 in L0!
};

// ✅ CORRECT: L0 only has governance rules
const policy = {
  canActivate: contract.approved && contract.funded
};
```

### Rule 3: L1 Must Be Self-Contained

```typescript
// ❌ WRONG: L1 referencing external state
const event = {
  type: 'task.completed',
  progress: calculateProgress()  // External calculation!
};

// ✅ CORRECT: L1 only facts
const event = {
  type: 'task.completed',
  timestamp: new Date(),
  actor: 'worker@example.com',
  evidence: [...]
};
```

### Rule 4: L2 Must Document Sources

```typescript
// ❌ WRONG: L2 without traceability
const derived = {
  completionRate: 75  // Where did this come from?
};

// ✅ CORRECT: L2 with full traceability
const derived = {
  completionRate: 75,
  sourceEvents: ['EVENT-001', 'EVENT-002', 'EVENT-003'],
  calculationMethod: 'completed_tasks / total_tasks * 100',
  calculatedAt: new Date()
};
```

---

## Code Examples

### Complete Workflow Example

```typescript
// Scenario: Worker completes concrete pour task

// Step 1: Check L0 governance
const contract = await contractRepository.findById(contractId);
if (contract.status !== 'active') {
  throw new Error('Contract not active');
}

// Step 2: Create L1 event with evidence
const concretePourEvent = await constructionEventRepository.append({
  type: 'construction.concrete_pour_completed',
  timestamp: new Date(),
  actor: 'worker@contractor.com',
  target: {
    type: 'confirmed',
    location: 'B1F-C3-column'
  },
  evidence: [
    {
      type: 'photo',
      timestamp: new Date(),
      url: photoUrl
    },
    {
      type: 'signature',
      timestamp: new Date(),
      data: { signer: 'inspector@qa.com' }
    }
  ],
  taskId: 'TASK-456',
  metadata: {
    volume: 45.5,
    grade: '280kgf/cm²'
  }
});

// Step 3: Event bus notifies interested parties
eventBus.emit('construction.concrete_pour_completed', {
  eventId: concretePourEvent.id,
  taskId: 'TASK-456'
});

// Step 4: Workflow orchestrator triggers QC
// (Listening to event bus)
eventBus.on('construction.concrete_pour_completed', async (event) => {
  await qaService.createQCTask({
    sourceEventId: event.eventId,
    taskId: event.taskId,
    dueDate: addDays(new Date(), 1)
  });
});

// Step 5: Progress calculator updates L2 (asynchronously)
// (Listening to event bus)
eventBus.on('construction.concrete_pour_completed', async (event) => {
  const project = await projectRepository.findByTaskId(event.taskId);
  await progressCalculator.updateProjectProgress(project.id);
});

// Progress calculator function
async function updateProjectProgress(projectId: string) {
  const completedEvents = await constructionEventRepository.query({
    type: 'task.completed',
    'metadata.projectId': projectId
  });
  
  const project = await projectRepository.findById(projectId);
  const totalTasks = project.scope.tasks.length;
  
  const derived: DerivedState = {
    entityId: projectId,
    entityType: 'project',
    calculatedAt: new Date(),
    calculatedBy: 'progress-calculator',
    sourceEvents: completedEvents.map(e => e.id),
    metrics: {
      completionRate: (completedEvents.length / totalTasks) * 100
    }
  };
  
  await derivedStateRepository.upsert(derived);
}
```

---

## Testing Strategies

### Testing L0 Policies

```typescript
describe('ContractPolicyService', () => {
  it('should allow task creation for active contracts', () => {
    const contract = { status: 'active' };
    const policy = new ContractPolicyService();
    
    expect(policy.canCreateTask(contract)).toBe(true);
  });
  
  it('should deny task creation for inactive contracts', () => {
    const contract = { status: 'pending' };
    const policy = new ContractPolicyService();
    
    expect(policy.canCreateTask(contract)).toBe(false);
  });
});
```

### Testing L1 Immutability

```typescript
describe('ConstructionEventRepository', () => {
  it('should create L1 event', async () => {
    const event = {
      type: 'concrete_pour',
      timestamp: new Date(),
      actor: 'worker@example.com',
      evidence: [{ type: 'photo', url: 'https://...' }]
    };
    
    const created = await repository.append(event);
    expect(created.id).toBeDefined();
  });
  
  it('should reject update to L1 event', async () => {
    const event = await repository.append({...});
    
    await expect(
      repository.update(event.id, { location: 'new' })
    ).rejects.toThrow('Cannot update immutable L1 event');
  });
  
  it('should reject delete of L1 event', async () => {
    const event = await repository.append({...});
    
    await expect(
      repository.delete(event.id)
    ).rejects.toThrow('Cannot delete immutable L1 event');
  });
});
```

### Testing L2 Calculations

```typescript
describe('ProgressCalculator', () => {
  it('should calculate correct completion rate', async () => {
    // Setup: Create L1 events
    await createL1Event({ type: 'task.completed', taskId: '1' });
    await createL1Event({ type: 'task.completed', taskId: '2' });
    await createL1Event({ type: 'task.completed', taskId: '3' });
    
    // Setup: Project has 4 total tasks
    const project = { id: 'PROJECT-1', totalTasks: 4 };
    
    // Act: Calculate L2
    const derived = await progressCalculator.calculate(project.id);
    
    // Assert
    expect(derived.metrics.completionRate).toBe(75);  // 3/4 * 100
    expect(derived.sourceEvents.length).toBe(3);
  });
  
  it('should be recomputable from L1', async () => {
    // Calculate once
    const derived1 = await progressCalculator.calculate('PROJECT-1');
    
    // Delete L2
    await derivedStateRepository.delete(derived1.id);
    
    // Recalculate
    const derived2 = await progressCalculator.calculate('PROJECT-1');
    
    // Should get same result
    expect(derived2.metrics.completionRate).toBe(derived1.metrics.completionRate);
  });
});
```

---

## Migration Guide

### Migrating Existing Data to Three-Layer Model

#### Step 1: Identify Current Data Layer

```typescript
// Analyze existing data structure
const existingData = {
  projectId: 'PROJECT-1',
  status: 'in-progress',  // L0 or L2?
  completedTasks: 75,     // L2 (calculated)
  totalTasks: 100,        // L0 (governance)
  lastUpdated: new Date() // L1 (fact) or L2 (derived)?
};

// Classify into layers:
// L0: totalTasks, budgetAllocated, approvalMatrix
// L1: Missing! Need to create event log
// L2: completedTasks, status, lastUpdated
```

#### Step 2: Create L1 Event Log

```typescript
// Migrate historical data to L1 events
async function migrateToL1(existingProject: any) {
  // For each completed task in old system
  for (const task of existingProject.completedTasks) {
    // Create L1 event (backfilled)
    await constructionEventRepository.append({
      id: generateEventId(),
      type: 'task.completed',
      timestamp: task.completedAt || new Date(),  // Use historical date
      actor: task.completedBy || 'system-migration',
      target: {
        type: 'provisional',
        provisional_description: task.location
      },
      evidence: [
        {
          type: 'document',
          timestamp: new Date(),
          data: {
            migrationNote: 'Backfilled from legacy system',
            originalTaskId: task.id
          }
        }
      ],
      taskId: task.id,
      metadata: {
        backfilled: true,
        originalData: task
      }
    });
  }
}
```

#### Step 3: Recalculate L2 from L1

```typescript
async function rebuildL2FromL1(projectId: string) {
  // Delete old L2 data
  await derivedStateRepository.deleteByProject(projectId);
  
  // Recalculate from L1
  await progressCalculator.updateProjectProgress(projectId);
}
```

---

## References

- [Quick Reference Card](../../G_three-layer-quick-reference.md)
- [Three-Layer Event Model Full Document](../../G_three-layer-event-model.md)
- [System Architecture](./02-system-architecture.md)
- [Event-Driven Architecture](./04-event-driven-architecture.md)

---

**Document Status**: ✅ Complete  
**Last Review**: 2025-12-27  
**Maintainer**: GigHub Architecture Team
