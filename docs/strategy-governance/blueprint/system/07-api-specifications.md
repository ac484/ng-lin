# 07. API Specifications

## Document Information
- **Version**: 1.0  
- **Status**: Complete  
- **Last Updated**: 2025-12-27

---

## Table of Contents
1. [API Architecture](#api-architecture)
2. [Module Facade APIs](#module-facade-apis)
3. [Firebase Cloud Functions](#firebase-cloud-functions)
4. [Event Bus API](#event-bus-api)
5. [Error Handling](#error-handling)

---

## 1. API Architecture

### API Layers
```
External Clients → Firebase Cloud Functions → Module Facades → Services → Repositories
```

**Key Principles**:
- Facade pattern for public APIs
- Result pattern for error handling  
- Event-driven for async operations
- Firebase Auth for authentication

---

## 2. Module Facade APIs

### Contract Facade
```typescript
@Injectable({ providedIn: 'root' })
export class ContractFacade {
  private contractService = inject(ContractService);
  private policyService = inject(PolicyService);
  private eventBus = inject(EnhancedEventBus);

  async createContract(data: CreateContractDTO): Promise<Result<Contract>> {
    // 1. Policy validation (L0)
    const policyCheck = await this.policyService.checkContractCreationPolicy(data);
    if (!policyCheck.allowed) {
      return Result.fail(`Policy violation: ${policyCheck.reason}`);
    }

    // 2. Create contract
    const result = await this.contractService.create(data);
    
    // 3. Emit event (L1)
    if (result.isSuccess) {
      this.eventBus.emit('contract.created', {
        contractId: result.value!.id,
        createdBy: data.createdBy
      });
    }

    return result;
  }

  getContracts(filters?: ContractFilters): Observable<Result<Contract[]>> {
    return this.contractService.getContracts(filters);
  }
}
```

### Task Facade
```typescript
@Injectable({ providedIn: 'root' })
export class TaskFacade {
  async createTask(data: CreateTaskDTO): Promise<Result<Task>> {
    // Policy checks
    // Resource validation
    // Task creation
    // Event emission
  }

  async completeTask(taskId: string, evidence: Evidence[]): Promise<Result<Task>> {
    // Validation
    // Dependency checks
    // Task completion
    // Workflow trigger
  }
}
```

---

## 3. Firebase Cloud Functions

### HTTP Functions
```typescript
import { onRequest } from 'firebase-functions/v2/https';

export const getContract = onRequest(async (req, res) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const contractId = req.params.contractId;
  const doc = await db.collection('contracts').doc(contractId).get();
  res.json({ data: doc.data() });
});
```

### Callable Functions
```typescript
import { onCall, HttpsError } from 'firebase-functions/v2/https';

export const submitAcceptance = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Validate data
  // Check prerequisites
  // Create acceptance record
  // Emit events
  
  return { success: true, acceptanceId };
});
```

### Firestore Triggers
```typescript
import { onDocumentCreated } from 'firebase-functions/v2/firestore';

export const onTaskCompleted = onDocumentCreated(
  'contracts/{contractId}/tasks/{taskId}',
  async (event) => {
    // Update L2 derived state
    // Trigger workflows
    // Send notifications
  }
);
```

---

## 4. Event Bus API

```typescript
@Injectable({ providedIn: 'root' })
export class EnhancedEventBus {
  emit(eventType: string, data: any, options?: EventOptions): void {
    const event: DomainEvent = {
      id: uuidv4(),
      type: eventType,
      payload: data,
      timestamp: new Date(),
      correlationId: options?.correlationId || uuidv4()
    };

    this.eventStore.append(event);
    this.eventSubject.next(event);
  }

  on(eventType: string): Observable<DomainEvent> {
    return this.eventSubject.pipe(
      filter(event => event.type === eventType)
    );
  }
}
```

### Event Subscription
```typescript
this.eventBus.on('task.completed')
  .pipe(takeUntilDestroyed(this.destroyRef))
  .subscribe(async (event) => {
    await this.workflowService.executeTaskCompletionWorkflow(event.payload.taskId);
  });
```

---

## 5. Error Handling

### Result Pattern
```typescript
export class Result<T> {
  static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, undefined, value);
  }

  static fail<U>(error: string): Result<U> {
    return new Result<U>(false, error);
  }

  get value(): T | undefined {
    if (!this.isSuccess) {
      throw new Error('Cannot get value from failed result');
    }
    return this._value;
  }
}
```

### API Response Format
```typescript
interface ApiSuccessResponse<T> {
  data: T;
  metadata?: {
    page?: number;
    total?: number;
  };
}

interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    timestamp: Date;
  };
}
```

---

## Summary

This document provides:
- ✅ Module facade APIs for all modules
- ✅ Firebase Cloud Functions (HTTP, Callable, Triggers)
- ✅ Event Bus API for async communication
- ✅ Error handling with Result pattern
- ✅ Authentication patterns

**Related**: [05-module-catalog.md](./05-module-catalog.md), [04-event-driven-architecture.md](./04-event-driven-architecture.md)
