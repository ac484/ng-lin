# Quick Reference Guide - GigHub Blueprint

> **Document Type**: Developer Quick Reference  
> **Version**: 1.0  
> **Last Updated**: 2025-12-27  
> **Audience**: All Developers

---

## 🎯 Purpose

This quick reference provides developers with instant access to common patterns, code snippets, and guidelines for working with the GigHub blueprint architecture.

---

## 📚 Table of Contents

1. [Three-Layer Model Quick Check](#three-layer-model-quick-check)
2. [Module Development Patterns](#module-development-patterns)
3. [Event Bus Usage](#event-bus-usage)
4. [Repository Pattern](#repository-pattern)
5. [Policy Enforcement](#policy-enforcement)
6. [Workflow Integration](#workflow-integration)
7. [Common Code Snippets](#common-code-snippets)
8. [Troubleshooting](#troubleshooting)

---

## Three-Layer Model Quick Check

### Is this L0, L1, or L2?

**Quick Decision Tree**:
```
Does it define WHO can do WHAT?
    YES → L0 (Governance)
    NO  ↓
    
Did it ACTUALLY happen with EVIDENCE?
    YES → L1 (Fact)
    NO  ↓
    
Is it CALCULATED from L1?
    YES → L2 (Derived)
    NO  → Rethink your design
```

### L0: Governance Examples

```typescript
// ✅ GOOD: Governance event
{
  type: 'governance.contract_activated',
  contractId: 'CONTRACT-001',
  activatedBy: 'owner@example.com',
  activatedAt: new Date(),
  metadata: {
    scope: ['Building A', 'Building B'],
    budget: 5000000
  }
}

// ✅ GOOD: Policy definition
{
  policyId: 'CAN_CREATE_TASK',
  rule: 'contract.status === "active"',
  enforced: true
}
```

### L1: Fact Examples

```typescript
// ✅ GOOD: Construction event with evidence
{
  type: 'construction.concrete_pour_completed',
  timestamp: new Date(),
  actor: 'worker@example.com',
  target: {
    type: 'confirmed',
    location: 'B1F-C3-column'
  },
  evidence: [
    { type: 'photo', url: 'https://...', timestamp: new Date() },
    { type: 'signature', data: { signer: 'inspector@...' } }
  ],
  metadata: {
    volume: 45.5,
    grade: '280kgf/cm²'
  }
}

// ❌ BAD: No evidence
{
  type: 'construction.work_completed',
  progress: 75%  // ❌ This is L2, not L1!
}
```

### L2: Derived Examples

```typescript
// ✅ GOOD: Calculated from L1
{
  projectId: 'PROJ-001',
  calculatedAt: new Date(),
  completionRate: 75.5,  // Calculated from completed tasks
  metadata: {
    calculationMethod: 'completed_tasks / total_tasks',
    sourceEvents: ['event-1', 'event-2', ...]
  }
}

// ❌ BAD: Manually set
const state = { completionRate: 75 };  // Manual value!
```

---

## Module Development Patterns

### Standard Module Structure

```
module-name/
├── models/              # Domain models
│   ├── module-name.model.ts
│   ├── module-name.states.ts
│   └── index.ts
├── services/            # Business logic
│   ├── module-name.service.ts
│   └── index.ts
├── repositories/        # Data access
│   ├── module-name.repository.ts
│   ├── module-name.repository.impl.ts
│   └── index.ts
├── events/              # Event definitions
│   └── module-name.events.ts
├── policies/            # Business rules
│   └── module-name.policies.ts
├── facade/              # Public API
│   └── module-name.facade.ts
├── config/              # Configuration
│   └── module-name.config.ts
└── README.md            # Documentation
```

### Module Service Template

```typescript
import { Injectable, inject } from '@angular/core';
import { EnhancedEventBus } from '@core/event-bus';
import { ContractRepository } from './repositories';
import { ContractPolicyService } from './policies';

@Injectable({ providedIn: 'root' })
export class ContractService {
  private readonly eventBus = inject(EnhancedEventBus);
  private readonly repository = inject(ContractRepository);
  private readonly policyService = inject(ContractPolicyService);
  
  async createContract(data: CreateContractDTO): Promise<Contract> {
    // 1. Validate policy
    if (!this.policyService.canCreateContract(data)) {
      throw new Error('Contract creation not allowed by policy');
    }
    
    // 2. Create entity
    const contract = await this.repository.create(data);
    
    // 3. Emit event
    this.eventBus.emit('contract.created', {
      contractId: contract.id,
      timestamp: new Date(),
      data: contract
    });
    
    return contract;
  }
  
  async activateContract(contractId: string): Promise<Contract> {
    // 1. Get contract
    const contract = await this.repository.findById(contractId);
    if (!contract) {
      throw new Error('Contract not found');
    }
    
    // 2. Validate policy
    if (!this.policyService.canActivateContract(contract)) {
      throw new Error('Contract cannot be activated');
    }
    
    // 3. Update status
    const updated = await this.repository.update(contractId, {
      status: ContractStatus.Active,
      activatedAt: new Date()
    });
    
    // 4. Emit event
    this.eventBus.emit('contract.activated', {
      contractId: updated.id,
      timestamp: new Date(),
      data: updated
    });
    
    return updated;
  }
}
```

### Repository Template

```typescript
import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, addDoc, getDoc, updateDoc, query, where, getDocs } from '@angular/fire/firestore';
import { Contract, CreateContractDTO, UpdateContractDTO } from '../models';

export abstract class ContractRepository {
  abstract create(data: CreateContractDTO): Promise<Contract>;
  abstract findById(id: string): Promise<Contract | null>;
  abstract update(id: string, data: UpdateContractDTO): Promise<Contract>;
  abstract findByStatus(status: string): Promise<Contract[]>;
}

@Injectable({ providedIn: 'root' })
export class ContractRepositoryImpl implements ContractRepository {
  private readonly firestore = inject(Firestore);
  private readonly collectionRef = collection(this.firestore, 'contracts');
  
  async create(data: CreateContractDTO): Promise<Contract> {
    const docRef = await addDoc(this.collectionRef, {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const created = await this.findById(docRef.id);
    if (!created) {
      throw new Error('Failed to create contract');
    }
    return created;
  }
  
  async findById(id: string): Promise<Contract | null> {
    const docRef = doc(this.collectionRef, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Contract;
  }
  
  async update(id: string, data: UpdateContractDTO): Promise<Contract> {
    const docRef = doc(this.collectionRef, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date()
    });
    
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('Contract not found after update');
    }
    return updated;
  }
  
  async findByStatus(status: string): Promise<Contract[]> {
    const q = query(this.collectionRef, where('status', '==', status));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Contract));
  }
}
```

### Policy Service Template

```typescript
import { Injectable } from '@angular/core';
import { Contract, ContractStatus } from '../models';

@Injectable({ providedIn: 'root' })
export class ContractPolicyService {
  canCreateContract(data: CreateContractDTO): boolean {
    return !!(data.owner && data.contractor && data.amount > 0);
  }
  
  canActivateContract(contract: Contract): boolean {
    return (
      contract.status === ContractStatus.PendingActivation &&
      contract.parsedData !== null &&
      contract.confirmed === true
    );
  }
  
  canCreateTask(contract: Contract): boolean {
    return contract.status === ContractStatus.Active;
  }
  
  canTerminateContract(contract: Contract, actor: string): boolean {
    return (
      contract.status === ContractStatus.Active &&
      (actor === contract.owner || actor === contract.contractor)
    );
  }
}
```

---

## Event Bus Usage

### Subscribe to Events

```typescript
import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { EnhancedEventBus } from '@core/event-bus';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-contract-dashboard',
  standalone: true,
  template: `...`
})
export class ContractDashboardComponent implements OnInit {
  private eventBus = inject(EnhancedEventBus);
  private destroyRef = inject(DestroyRef);
  
  ngOnInit() {
    // Subscribe to contract events
    this.eventBus.on('contract.created')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        console.log('Contract created:', event.data);
        this.refreshContracts();
      });
    
    this.eventBus.on('contract.activated')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        console.log('Contract activated:', event.data);
        this.refreshContracts();
      });
  }
  
  private refreshContracts() {
    // Reload contract list
  }
}
```

### Emit Events

```typescript
// Emit with correlation ID
this.eventBus.emit('contract.created', {
  contractId: contract.id,
  timestamp: new Date(),
  data: contract
}, {
  correlationId: 'user-action-123'
});

// Emit and wait for result
const result = await this.eventBus.emitAsync('contract.parse', {
  contractId: contract.id,
  pdfUrl: pdfUrl
});
```

### Event Naming Convention

```
{module}.{action}
```

Examples:
- `contract.created`
- `contract.activated`
- `task.completed`
- `qc.passed`
- `acceptance.finalized`

---

## Repository Pattern

### Query Patterns

```typescript
// 1. Find by ID
const contract = await repository.findById('CONTRACT-001');

// 2. Find by condition
const activeContracts = await repository.findByStatus('active');

// 3. Complex query
const q = query(
  collection(firestore, 'contracts'),
  where('status', '==', 'active'),
  where('owner', '==', userId),
  orderBy('createdAt', 'desc'),
  limit(50)
);
const snapshot = await getDocs(q);

// 4. Real-time subscription
const unsubscribe = onSnapshot(
  doc(firestore, 'contracts', contractId),
  (docSnap) => {
    const contract = { id: docSnap.id, ...docSnap.data() };
    // Update UI
  }
);

// Don't forget to unsubscribe!
// In Angular: use takeUntilDestroyed()
```

### Batch Operations

```typescript
import { writeBatch } from '@angular/fire/firestore';

const batch = writeBatch(firestore);

// Add multiple operations
batch.set(doc(firestore, 'contracts', 'CONTRACT-001'), data1);
batch.update(doc(firestore, 'contracts', 'CONTRACT-002'), data2);
batch.delete(doc(firestore, 'contracts', 'CONTRACT-003'));

// Commit all at once
await batch.commit();
```

---

## Policy Enforcement

### Policy Check Pattern

```typescript
// Before any operation, check policy
async createTask(contractId: string, taskData: CreateTaskDTO) {
  // 1. Get contract
  const contract = await this.contractRepository.findById(contractId);
  
  // 2. Check policy
  if (!this.contractPolicyService.canCreateTask(contract)) {
    throw new PolicyViolationError('Cannot create task for inactive contract');
  }
  
  // 3. Proceed with operation
  const task = await this.taskRepository.create(taskData);
  return task;
}
```

### Custom Policy Error

```typescript
export class PolicyViolationError extends Error {
  constructor(
    public readonly message: string,
    public readonly policy: string,
    public readonly context?: any
  ) {
    super(message);
    this.name = 'PolicyViolationError';
  }
}

// Usage
throw new PolicyViolationError(
  'Contract must be active to create tasks',
  'CAN_CREATE_TASK',
  { contractId, status: contract.status }
);
```

---

## Workflow Integration

### Register Workflow Handler

```typescript
import { Injectable, inject } from '@angular/core';
import { EnhancedEventBus } from '@core/event-bus';
import { WorkflowOrchestrator } from '@core/workflow';

@Injectable({ providedIn: 'root' })
export class TaskCompletedHandler {
  private eventBus = inject(EnhancedEventBus);
  private qaService = inject(QAService);
  
  register(orchestrator: WorkflowOrchestrator) {
    this.eventBus.on('task.completed').subscribe(async (event) => {
      // Create QC task automatically
      await this.qaService.createQCTask({
        taskId: event.data.taskId,
        assignee: null,  // Auto-assign later
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });
      
      // Emit next event
      this.eventBus.emit('qc.created', {
        taskId: event.data.taskId,
        timestamp: new Date()
      });
    });
  }
}
```

---

## Common Code Snippets

### Angular Signal State Management

```typescript
import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-contract-list',
  standalone: true,
  template: `
    <div>
      <h2>Contracts ({{ filteredContracts().length }})</h2>
      @for (contract of filteredContracts(); track contract.id) {
        <app-contract-card [contract]="contract" />
      }
    </div>
  `
})
export class ContractListComponent {
  // Signals
  contracts = signal<Contract[]>([]);
  filter = signal<string>('all');
  
  // Computed signal
  filteredContracts = computed(() => {
    const all = this.contracts();
    const filterValue = this.filter();
    
    if (filterValue === 'all') return all;
    return all.filter(c => c.status === filterValue);
  });
  
  // Update methods
  setFilter(filter: string) {
    this.filter.set(filter);
  }
  
  addContract(contract: Contract) {
    this.contracts.update(list => [...list, contract]);
  }
}
```

### Error Handling

```typescript
import { catchError, throwError } from 'rxjs';

async loadContracts() {
  try {
    this.loading.set(true);
    const contracts = await this.contractFacade.getContracts();
    this.contracts.set(contracts);
  } catch (error) {
    console.error('Failed to load contracts:', error);
    this.notificationService.error('Failed to load contracts');
  } finally {
    this.loading.set(false);
  }
}
```

### Firestore Real-time Updates

```typescript
import { onSnapshot, doc } from '@angular/fire/firestore';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

ngOnInit() {
  const contractDoc = doc(this.firestore, 'contracts', this.contractId);
  
  onSnapshot(contractDoc, (snapshot) => {
    if (snapshot.exists()) {
      const contract = { id: snapshot.id, ...snapshot.data() } as Contract;
      this.contract.set(contract);
    }
  });
}
```

---

## Troubleshooting

### Common Issues

#### 1. Event not received by subscriber

**Problem**: Subscriber doesn't receive event.

**Checklist**:
- ✅ Event name matches exactly?
- ✅ Subscription registered before event emitted?
- ✅ Component still alive (not destroyed)?
- ✅ Using `takeUntilDestroyed()` correctly?

**Solution**:
```typescript
// ✅ Correct
this.eventBus.on('contract.created')
  .pipe(takeUntilDestroyed(this.destroyRef))
  .subscribe(...);

// ❌ Wrong
this.eventBus.on('contract.created').subscribe(...); // No cleanup!
```

#### 2. Firestore permission denied

**Problem**: "Missing or insufficient permissions" error.

**Checklist**:
- ✅ User authenticated?
- ✅ Security rules allow this operation?
- ✅ Document path correct?
- ✅ Required fields present?

**Solution**: Check `firestore.rules` and test with Firestore emulator.

#### 3. Policy violation not throwing error

**Problem**: Operation proceeds despite policy violation.

**Checklist**:
- ✅ Policy check called before operation?
- ✅ Policy service injected correctly?
- ✅ Throwing error instead of returning false?

**Solution**:
```typescript
// ✅ Correct
if (!this.policyService.canCreateTask(contract)) {
  throw new PolicyViolationError('Cannot create task');
}

// ❌ Wrong
const canCreate = this.policyService.canCreateTask(contract);
// Forgot to check!
```

#### 4. Real-time updates not working

**Problem**: UI not updating on data changes.

**Checklist**:
- ✅ Using `onSnapshot` or similar?
- ✅ Updating Angular Signals/state?
- ✅ Change detection triggered?
- ✅ Subscription not unsubscribed too early?

**Solution**:
```typescript
onSnapshot(docRef, (snapshot) => {
  // ✅ Update signal to trigger change detection
  this.contract.set({ id: snapshot.id, ...snapshot.data() });
});
```

---

## Key Reminders

### DO ✅
- Use signals for reactive state
- Enforce policies before operations
- Emit events after successful operations
- Use `takeUntilDestroyed()` for subscriptions
- Add evidence to L1 events
- Calculate L2 from L1, never manually set
- Follow repository pattern for Firestore access

### DON'T ❌
- Modify L1 events after creation
- Skip policy checks
- Forget to emit events
- Create circular dependencies
- Access Firestore directly from components
- Mix L2 data into L1 events
- Forget to unsubscribe from observables

---

## Next Steps

- **Architecture**: See [System Architecture](../system/02-system-architecture.md)
- **Full Patterns**: See [Module Catalog](../system/05-module-catalog.md)
- **Testing**: See [Testing Strategy](../setc/SETC-05-testing-strategy.md)

---

**Document Version**: 1.0  
**Last Updated**: 2025-12-27  
**Maintained By**: GigHub Development Team
