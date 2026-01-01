# Next Steps: Causality-Driven Event-Sourced SaaS Implementation

> **Comprehensive Roadmap for ng-lin Task Management System**
> 
> Based on current implementation status and architectural vision

## 📋 Document Overview

**Purpose**: Define actionable implementation steps for completing the causality-driven, event-sourced, multi-tenant SaaS system.

**Current Status**: 
- ✅ Basic Task domain with command handlers
- ✅ Authentication guards
- ✅ Error handling service
- ✅ Event store foundation
- ⚠️ Missing causality tracking, process orchestration, multi-view projections, and full SaaS infrastructure

**Target Architecture**: Three-layer causality-driven system with explicit event sourcing, multi-tenant isolation, and simulation capabilities.

---

## 🎯 Implementation Priority Order

### **Priority 1: Event Store & Causality Infrastructure** (Weeks 1-3)
Foundation for all event-driven features

### **Priority 2: Multi-Tenant Data Architecture** (Weeks 2-4)
SaaS tenant isolation and Firestore structure

### **Priority 3: Process Orchestration Layer** (Weeks 4-6)
Sagas, process managers, and workflow coordination

### **Priority 4: Projection & Query Layer** (Weeks 6-8)
Multiple views, denormalization, and query optimization

### **Priority 5: Advanced Features** (Weeks 8-12)
Simulation, time-travel, and decision support

---

## 📂 1. Project Structure and Repository Setup

### Current Structure Assessment

```
ng-lin/
├── src/
│   ├── app/
│   │   ├── core/                    # ✅ Event bus exists
│   │   │   └── event-bus/           # Needs causality extension
│   │   ├── platform/                # ✅ Event store basic
│   │   │   └── event-store/         # Needs causality metadata
│   │   ├── features/
│   │   │   └── domains/
│   │   │       └── task/            # ✅ Basic structure exists
│   │   │           ├── events/      # ✅ Event definitions
│   │   │           ├── commands/    # ✅ Command definitions
│   │   │           ├── services/    # ✅ Command service created
│   │   │           ├── guards/      # ✅ Auth guards created
│   │   │           ├── projections/ # ⚠️ Only 2 views, need more
│   │   │           ├── processes/   # ❌ MISSING - Need sagas
│   │   │           └── ui/          # ✅ Components exist
│   │   └── shared/
│   │       └── services/            # ✅ Error handling created
│   └── firebase/
│       └── functions-*/             # ⚠️ Need v2 functions structure
├── functions/                       # ❌ MISSING - Cloud Functions
└── docs/                            # ✅ Comprehensive docs exist
```

### Proposed Enhanced Structure

```
ng-lin/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── event-bus/           # Enhanced with causality
│   │   │   ├── causality/           # NEW - Causality tracking
│   │   │   │   ├── causality.service.ts
│   │   │   │   ├── correlation-id.service.ts
│   │   │   │   └── causality-metadata.model.ts
│   │   │   └── tenant/              # NEW - Tenant context
│   │   │       ├── tenant-context.service.ts
│   │   │       └── tenant.model.ts
│   │   ├── platform/
│   │   │   ├── event-store/         # Enhanced
│   │   │   │   ├── platform-event-store.service.ts ✅
│   │   │   │   ├── event-with-causality.model.ts   # NEW
│   │   │   │   ├── snapshot.service.ts              # NEW
│   │   │   │   └── replay.service.ts                # NEW
│   │   │   ├── projections/         # NEW - Projection engine
│   │   │   │   ├── projection-builder.service.ts
│   │   │   │   ├── projection-rebuilder.service.ts
│   │   │   │   └── projection-registry.ts
│   │   │   └── process/             # NEW - Process orchestration
│   │   │       ├── saga-coordinator.service.ts
│   │   │       ├── process-manager.base.ts
│   │   │       └── state-machine.base.ts
│   │   ├── features/
│   │   │   └── domains/
│   │   │       └── task/
│   │   │           ├── events/      # Enhanced with causality
│   │   │           ├── commands/    # ✅
│   │   │           ├── services/    # ✅
│   │   │           ├── guards/      # ✅
│   │   │           ├── projections/ # Enhanced - multiple views
│   │   │           │   ├── task-list.projection.ts         ✅
│   │   │           │   ├── task-detail.projection.ts       ✅
│   │   │           │   ├── task-kanban.projection.ts       # NEW
│   │   │           │   ├── task-timeline.projection.ts     # NEW
│   │   │           │   ├── task-analytics.projection.ts    # NEW
│   │   │           │   └── projection-rebuilders/          # NEW
│   │   │           ├── processes/   # NEW - Task workflows
│   │   │           │   ├── task-lifecycle.saga.ts
│   │   │           │   ├── task-assignment.process.ts
│   │   │           │   └── task-completion.state-machine.ts
│   │   │           └── ui/          # ✅
│   │   └── shared/
│   │       ├── services/            # ✅
│   │       └── models/              # NEW - Shared models
│   │           ├── result.model.ts  # Result pattern
│   │           └── page.model.ts    # Pagination
│   └── firebase/
│       └── functions-v2/            # NEW - Cloud Functions v2
│           ├── task/
│           │   ├── commands/
│           │   └── queries/
│           └── shared/
├── functions/                       # NEW - Firebase Functions
│   ├── src/
│   │   ├── task/
│   │   │   ├── createTask.ts
│   │   │   ├── updateTask.ts
│   │   │   └── deleteTask.ts
│   │   ├── events/
│   │   │   └── eventStore.ts
│   │   └── shared/
│   │       ├── auth.ts
│   │       └── validation.ts
│   ├── package.json
│   └── tsconfig.json
└── firestore.rules                  # Enhanced - Multi-tenant rules
```

### Implementation Steps

#### Step 1.1: Create Causality Infrastructure (Week 1)

**Files to Create**:

1. **`src/app/core/causality/causality.service.ts`**
```typescript
import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { v4 as uuidv4 } from 'uuid';

export interface CausalityMetadata {
  correlationId: string;        // Groups related events
  causationId?: string;         // Direct parent event ID
  actorId: string;              // User/system who triggered
  actorType: 'user' | 'system'; // Actor classification
  timestamp: Date;              // When event was created
  tenantId: string;             // Multi-tenant isolation
  context?: Record<string, any>; // Additional context
}

@Injectable({ providedIn: 'root' })
export class CausalityService {
  private auth = inject(Auth);
  private currentCorrelationId?: string;

  /**
   * Start a new correlation (e.g., user action)
   */
  startCorrelation(): string {
    this.currentCorrelationId = uuidv4();
    return this.currentCorrelationId;
  }

  /**
   * Get current correlation ID or create new one
   */
  getCorrelationId(): string {
    if (!this.currentCorrelationId) {
      this.startCorrelation();
    }
    return this.currentCorrelationId!;
  }

  /**
   * Create causality metadata for an event
   */
  createMetadata(causationId?: string, context?: Record<string, any>): CausalityMetadata {
    const user = this.auth.currentUser;
    
    return {
      correlationId: this.getCorrelationId(),
      causationId,
      actorId: user?.uid || 'system',
      actorType: user ? 'user' : 'system',
      timestamp: new Date(),
      tenantId: this.getTenantId(),
      context
    };
  }

  /**
   * Extract tenant ID from user claims or context
   */
  private getTenantId(): string {
    // TODO: Get from user claims or context
    // For now, return a placeholder
    return 'default-tenant';
  }

  /**
   * Clear correlation (e.g., after request completes)
   */
  clearCorrelation(): void {
    this.currentCorrelationId = undefined;
  }
}
```

2. **`src/app/core/causality/index.ts`**
```typescript
export * from './causality.service';
```

#### Step 1.2: Enhance Event Store with Causality (Week 1-2)

**Modify**: `src/app/platform/event-store/platform-event-store.service.ts`

Add causality to events:

```typescript
export interface EventWithCausality<T = any> {
  id: string;
  namespace: string;
  aggregateId: string;
  eventType: string;
  data: T;
  version: number;
  timestamp: Date;
  
  // Causality metadata
  causality: CausalityMetadata;
}

// Update publishEvent method
async publishEvent(
  namespace: string,
  eventType: string,
  aggregateId: string,
  data: any,
  causality: CausalityMetadata
): Promise<void> {
  const event: EventWithCausality = {
    id: uuidv4(),
    namespace,
    aggregateId,
    eventType,
    data,
    version: await this.getNextVersion(namespace, aggregateId),
    timestamp: new Date(),
    causality
  };

  // Store in Firestore
  await this.firestore
    .collection(`events/${namespace}/${aggregateId}`)
    .doc(event.id)
    .set(event);

  // Publish to subscribers
  this.eventSubject.next(event);
}
```

#### Step 1.3: Update Task Command Service (Week 2)

**Modify**: `src/app/features/domains/task/services/task-command.service.ts`

Integrate causality:

```typescript
import { CausalityService } from '@app/core/causality';

export class TaskCommandService {
  private causality = inject(CausalityService);
  
  async createTask(command: CreateTaskCommand): Promise<Result<string>> {
    // Start correlation for this user action
    this.causality.startCorrelation();
    
    try {
      // Execute command via Firebase function
      const result = await this.functions.httpsCallable('tasks-createTask')(command);
      
      // Publish event with causality
      const metadata = this.causality.createMetadata(undefined, {
        command: 'CreateTask',
        aggregateId: result.taskId
      });
      
      await this.eventStore.publishEvent(
        'task',
        'TaskCreated',
        result.taskId,
        result.data,
        metadata  // Add causality
      );
      
      return { success: true, data: result.taskId };
    } finally {
      this.causality.clearCorrelation();
    }
  }
}
```

---

## 🏢 2. Multi-Tenant SaaS Architecture

### Current State
- ✅ Authentication guards exist but don't enforce tenant isolation
- ❌ No Firestore multi-tenant structure
- ❌ No tenant context service
- ❌ Security rules not implemented

### Target Architecture

```
Firestore Structure:
/tenants/{tenantId}
  /organizations/{orgId}
    /metadata: { name, settings, ... }
    /teams/{teamId}
      /metadata: { name, members, ... }
      /partners/{partnerId}
        /metadata: { name, role, ... }
        /tasks/{taskId}
          /metadata: { title, status, ... }

/events/{namespace}/{tenantId}/{aggregateId}/{eventId}
  - Tenant-isolated event store

/projections/{viewType}/{tenantId}/{docId}
  - Tenant-isolated read models
```

### Implementation Steps

#### Step 2.1: Create Tenant Context Service (Week 2)

**Create**: `src/app/core/tenant/tenant-context.service.ts`

```typescript
import { Injectable, inject, signal } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

export interface TenantContext {
  tenantId: string;
  organizationId: string;
  teamId?: string;
  partnerId?: string;
  permissions: string[];
}

@Injectable({ providedIn: 'root' })
export class TenantContextService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  
  // Signal-based reactive tenant context
  readonly tenantContext = signal<TenantContext | null>(null);
  
  /**
   * Initialize tenant context from user claims
   */
  async initializeTenantContext(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) return;
    
    // Get custom claims from Firebase Auth
    const idTokenResult = await user.getIdTokenResult();
    const claims = idTokenResult.claims;
    
    // Extract tenant information
    const context: TenantContext = {
      tenantId: claims['tenantId'] as string,
      organizationId: claims['organizationId'] as string,
      teamId: claims['teamId'] as string | undefined,
      partnerId: claims['partnerId'] as string | undefined,
      permissions: (claims['permissions'] as string[]) || []
    };
    
    this.tenantContext.set(context);
  }
  
  /**
   * Get Firestore path for tenant-scoped collection
   */
  getTenantPath(basePath: string): string {
    const context = this.tenantContext();
    if (!context) throw new Error('Tenant context not initialized');
    
    return `tenants/${context.tenantId}/${basePath}`;
  }
  
  /**
   * Check if user has permission
   */
  hasPermission(permission: string): boolean {
    const context = this.tenantContext();
    return context?.permissions.includes(permission) || false;
  }
}
```

#### Step 2.2: Implement Firestore Security Rules (Week 2-3)

**Create/Update**: `firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getTenantId() {
      return request.auth.token.tenantId;
    }
    
    function getOrgId() {
      return request.auth.token.organizationId;
    }
    
    function hasPermission(permission) {
      return permission in request.auth.token.permissions;
    }
    
    // Multi-tenant isolation
    match /tenants/{tenantId} {
      // Only allow access to user's own tenant
      allow read, write: if isAuthenticated() && tenantId == getTenantId();
      
      match /organizations/{orgId} {
        allow read: if isAuthenticated() && orgId == getOrgId();
        allow write: if hasPermission('org:write');
        
        match /teams/{teamId} {
          allow read: if isAuthenticated();
          allow write: if hasPermission('team:write');
          
          match /tasks/{taskId} {
            allow read: if isAuthenticated();
            allow create: if hasPermission('task:create');
            allow update: if hasPermission('task:update') || 
                            resource.data.creatorId == request.auth.uid;
            allow delete: if hasPermission('task:delete') || 
                            resource.data.creatorId == request.auth.uid;
          }
        }
      }
    }
    
    // Event store - tenant isolated
    match /events/{namespace}/{tenantId}/{aggregateId}/{eventId} {
      allow read: if isAuthenticated() && tenantId == getTenantId();
      allow write: if isAuthenticated() && tenantId == getTenantId() && 
                      hasPermission('events:write');
    }
    
    // Projections - tenant isolated
    match /projections/{viewType}/{tenantId}/{docId} {
      allow read: if isAuthenticated() && tenantId == getTenantId();
      allow write: if false; // Only Cloud Functions can write projections
    }
  }
}
```

#### Step 2.3: Update Task Guards with Tenant Context (Week 3)

**Modify**: `src/app/features/domains/task/guards/task-auth.guard.ts`

```typescript
import { TenantContextService } from '@app/core/tenant';

export const taskOrgAccessGuard: CanActivateFn = async (route, state) => {
  const auth = inject(Auth);
  const tenant = inject(TenantContextService);
  const router = inject(Router);
  
  // Initialize tenant context
  await tenant.initializeTenantContext();
  
  const context = tenant.tenantContext();
  if (!context) {
    return router.parseUrl('/auth/login');
  }
  
  // Check organization access
  const orgId = route.params['orgId'];
  if (orgId && orgId !== context.organizationId) {
    return router.parseUrl('/unauthorized');
  }
  
  return true;
};
```

---

## 🔄 3. Process Orchestration Layer (L1)

### Current State
- ❌ No saga or process manager implementation
- ❌ No workflow coordination
- ❌ No compensating transactions

### Target Architecture

**Process Managers / Sagas** coordinate multi-step workflows:
- React to events
- Maintain workflow state
- Coordinate commands across aggregates
- Handle compensations on failures

### Implementation Steps

#### Step 3.1: Create Base Process Manager (Week 4)

**Create**: `src/app/platform/process/process-manager.base.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { PlatformEventStoreService, EventWithCausality } from '@app/platform/event-store';

export interface ProcessState {
  processId: string;
  status: 'started' | 'in-progress' | 'completed' | 'failed' | 'compensating';
  currentStep: string;
  data: Record<string, any>;
  history: Array<{
    step: string;
    timestamp: Date;
    eventId: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export abstract class ProcessManagerBase {
  protected firestore = inject(Firestore);
  protected eventStore = inject(PlatformEventStoreService);
  
  abstract get processName(): string;
  
  /**
   * Start a new process instance
   */
  protected async startProcess(processId: string, initialData: any): Promise<void> {
    const state: ProcessState = {
      processId,
      status: 'started',
      currentStep: 'init',
      data: initialData,
      history: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await setDoc(
      doc(this.firestore, `processes/${this.processName}/${processId}`),
      state
    );
  }
  
  /**
   * Load process state
   */
  protected async loadState(processId: string): Promise<ProcessState | null> {
    const docRef = doc(this.firestore, `processes/${this.processName}/${processId}`);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? snapshot.data() as ProcessState : null;
  }
  
  /**
   * Update process state
   */
  protected async updateState(state: ProcessState): Promise<void> {
    state.updatedAt = new Date();
    await setDoc(
      doc(this.firestore, `processes/${this.processName}/${state.processId}`),
      state
    );
  }
  
  /**
   * Handle incoming event
   */
  abstract handleEvent(event: EventWithCausality): Promise<void>;
  
  /**
   * Compensate on failure
   */
  abstract compensate(processId: string, reason: string): Promise<void>;
}
```

#### Step 3.2: Implement Task Lifecycle Saga (Week 4-5)

**Create**: `src/app/features/domains/task/processes/task-lifecycle.saga.ts`

```typescript
import { Injectable } from '@angular/core';
import { ProcessManagerBase } from '@app/platform/process';
import { TaskCommandService } from '../services';

@Injectable({ providedIn: 'root' })
export class TaskLifecycleSaga extends ProcessManagerBase {
  
  get processName(): string {
    return 'task-lifecycle';
  }
  
  /**
   * Handle TaskCreated event - start lifecycle
   */
  async handleTaskCreated(event: EventWithCausality): Promise<void> {
    const taskId = event.aggregateId;
    
    // Start process
    await this.startProcess(taskId, {
      taskId,
      status: 'created',
      createdBy: event.causality.actorId
    });
    
    // Trigger next step: assign to team member (could be manual or automatic)
    // This is just an example - actual logic depends on business rules
    const state = await this.loadState(taskId);
    if (state) {
      state.currentStep = 'awaiting-assignment';
      await this.updateState(state);
    }
  }
  
  /**
   * Handle TaskAssigned event
   */
  async handleTaskAssigned(event: EventWithCausality): Promise<void> {
    const taskId = event.aggregateId;
    const state = await this.loadState(taskId);
    
    if (state) {
      state.currentStep = 'assigned';
      state.data.assigneeId = event.data.assigneeId;
      state.history.push({
        step: 'assigned',
        timestamp: new Date(),
        eventId: event.id
      });
      await this.updateState(state);
    }
  }
  
  /**
   * Handle TaskStarted event
   */
  async handleTaskStarted(event: EventWithCausality): Promise<void> {
    const taskId = event.aggregateId;
    const state = await this.loadState(taskId);
    
    if (state) {
      state.currentStep = 'in-progress';
      state.history.push({
        step: 'started',
        timestamp: new Date(),
        eventId: event.id
      });
      await this.updateState(state);
    }
  }
  
  /**
   * Handle TaskCompleted event - end lifecycle
   */
  async handleTaskCompleted(event: EventWithCausality): Promise<void> {
    const taskId = event.aggregateId;
    const state = await this.loadState(taskId);
    
    if (state) {
      state.status = 'completed';
      state.currentStep = 'completed';
      state.history.push({
        step: 'completed',
        timestamp: new Date(),
        eventId: event.id
      });
      await this.updateState(state);
    }
  }
  
  /**
   * Main event handler - routes to specific handlers
   */
  async handleEvent(event: EventWithCausality): Promise<void> {
    switch (event.eventType) {
      case 'TaskCreated':
        await this.handleTaskCreated(event);
        break;
      case 'TaskAssigned':
        await this.handleTaskAssigned(event);
        break;
      case 'TaskStarted':
        await this.handleTaskStarted(event);
        break;
      case 'TaskCompleted':
        await this.handleTaskCompleted(event);
        break;
    }
  }
  
  /**
   * Compensate on failure - e.g., cancel task if assignment fails
   */
  async compensate(processId: string, reason: string): Promise<void> {
    const state = await this.loadState(processId);
    if (!state) return;
    
    state.status = 'compensating';
    state.data.compensationReason = reason;
    await this.updateState(state);
    
    // Issue compensation commands (e.g., cancel task, notify users)
    // Implementation depends on business rules
  }
}
```

#### Step 3.3: Wire Up Event Subscriptions (Week 5)

**Create**: `src/app/platform/process/saga-coordinator.service.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { PlatformEventStoreService } from '@app/platform/event-store';
import { TaskLifecycleSaga } from '@app/features/domains/task/processes';

@Injectable({ providedIn: 'root' })
export class SagaCoordinatorService {
  private eventStore = inject(PlatformEventStoreService);
  private taskLifecycle = inject(TaskLifecycleSaga);
  
  /**
   * Initialize all saga subscriptions
   */
  initialize(): void {
    // Subscribe to task events
    this.eventStore.subscribe('task', async (event) => {
      try {
        await this.taskLifecycle.handleEvent(event);
      } catch (error) {
        console.error('Saga handling error:', error);
        // Trigger compensation if needed
        await this.taskLifecycle.compensate(event.aggregateId, error.message);
      }
    });
    
    // Add more saga subscriptions as needed
  }
}
```

**Initialize in app**:

Update `src/app/app.config.ts`:

```typescript
import { SagaCoordinatorService } from '@app/platform/process';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... existing providers
    {
      provide: APP_INITIALIZER,
      useFactory: (saga: SagaCoordinatorService) => () => saga.initialize(),
      deps: [SagaCoordinatorService],
      multi: true
    }
  ]
};
```

---

## 📊 4. Projection & Query Layer (L2)

### Current State
- ✅ Basic task list and detail projections
- ❌ No projection rebuilding
- ❌ No multiple views (kanban, timeline, analytics)
- ❌ No denormalization strategy

### Target Architecture

**Multiple Views from Same Events**:
- **Task List**: Flat list with filters
- **Task Kanban**: Grouped by status with drag-drop
- **Task Timeline**: Gantt-style time visualization
- **Task Analytics**: Aggregated metrics and trends

### Implementation Steps

#### Step 4.1: Create Projection Builder Service (Week 6)

**Create**: `src/app/platform/projections/projection-builder.service.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, setDoc, deleteDoc } from '@angular/fire/firestore';
import { PlatformEventStoreService, EventWithCausality } from '@app/platform/event-store';
import { TenantContextService } from '@app/core/tenant';

export interface ProjectionHandler {
  viewType: string;
  eventTypes: string[];
  handle(event: EventWithCausality): Promise<void>;
}

@Injectable({ providedIn: 'root' })
export class ProjectionBuilderService {
  private firestore = inject(Firestore);
  private eventStore = inject(PlatformEventStoreService);
  private tenant = inject(TenantContextService);
  
  private handlers = new Map<string, ProjectionHandler[]>();
  
  /**
   * Register projection handler
   */
  registerHandler(handler: ProjectionHandler): void {
    for (const eventType of handler.eventTypes) {
      if (!this.handlers.has(eventType)) {
        this.handlers.set(eventType, []);
      }
      this.handlers.get(eventType)!.push(handler);
    }
  }
  
  /**
   * Initialize projection subscriptions
   */
  initialize(): void {
    this.eventStore.subscribe('*', async (event) => {
      const handlers = this.handlers.get(event.eventType) || [];
      
      for (const handler of handlers) {
        try {
          await handler.handle(event);
        } catch (error) {
          console.error(`Projection error [${handler.viewType}]:`, error);
        }
      }
    });
  }
  
  /**
   * Write projection document
   */
  async writeProjection(
    viewType: string,
    docId: string,
    data: any
  ): Promise<void> {
    const context = this.tenant.tenantContext();
    if (!context) throw new Error('Tenant context required');
    
    const path = `projections/${viewType}/${context.tenantId}/${docId}`;
    await setDoc(doc(this.firestore, path), {
      ...data,
      _updatedAt: new Date()
    });
  }
  
  /**
   * Delete projection document
   */
  async deleteProjection(viewType: string, docId: string): Promise<void> {
    const context = this.tenant.tenantContext();
    if (!context) throw new Error('Tenant context required');
    
    const path = `projections/${viewType}/${context.tenantId}/${docId}`;
    await deleteDoc(doc(this.firestore, path));
  }
}
```

#### Step 4.2: Implement Task Kanban Projection (Week 6-7)

**Create**: `src/app/features/domains/task/projections/task-kanban.projection.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { ProjectionBuilderService, ProjectionHandler } from '@app/platform/projections';
import { EventWithCausality } from '@app/platform/event-store';

export interface TaskKanbanCard {
  taskId: string;
  title: string;
  description: string;
  assigneeId?: string;
  assigneeName?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  tags: string[];
  position: number; // For ordering within column
}

export interface TaskKanbanColumn {
  status: string;
  title: string;
  tasks: TaskKanbanCard[];
  taskCount: number;
}

export interface TaskKanbanView {
  organizationId: string;
  teamId?: string;
  columns: TaskKanbanColumn[];
  lastUpdated: Date;
}

@Injectable({ providedIn: 'root' })
export class TaskKanbanProjectionHandler implements ProjectionHandler {
  private builder = inject(ProjectionBuilderService);
  
  readonly viewType = 'task-kanban';
  readonly eventTypes = [
    'TaskCreated',
    'TaskUpdated',
    'TaskStarted',
    'TaskCompleted',
    'TaskDeleted'
  ];
  
  async handle(event: EventWithCausality): Promise<void> {
    const boardId = this.getBoardId(event);
    
    switch (event.eventType) {
      case 'TaskCreated':
        await this.handleTaskCreated(event, boardId);
        break;
      case 'TaskUpdated':
        await this.handleTaskUpdated(event, boardId);
        break;
      case 'TaskStarted':
        await this.handleTaskStatusChanged(event, boardId, 'in-progress');
        break;
      case 'TaskCompleted':
        await this.handleTaskStatusChanged(event, boardId, 'completed');
        break;
      case 'TaskDeleted':
        await this.handleTaskDeleted(event, boardId);
        break;
    }
  }
  
  private getBoardId(event: EventWithCausality): string {
    // Board could be per team, per organization, or custom
    return event.causality.tenantId; // Simplest: one board per tenant
  }
  
  private async handleTaskCreated(event: EventWithCausality, boardId: string): Promise<void> {
    // Load existing kanban view
    // Add task card to appropriate column
    // Save updated view
    
    const card: TaskKanbanCard = {
      taskId: event.aggregateId,
      title: event.data.title,
      description: event.data.description || '',
      priority: event.data.priority || 'medium',
      dueDate: event.data.dueDate,
      tags: event.data.tags || [],
      position: 0 // Add to top
    };
    
    // This is simplified - real implementation would load, update, and save
    await this.builder.writeProjection(this.viewType, boardId, {
      // ... kanban view data with new card
    });
  }
  
  private async handleTaskStatusChanged(
    event: EventWithCausality,
    boardId: string,
    newStatus: string
  ): Promise<void> {
    // Move task card between columns
    // Update column task counts
    // Save updated view
  }
  
  private async handleTaskDeleted(event: EventWithCausality, boardId: string): Promise<void> {
    // Remove task card from column
    // Update column task count
    // Save updated view
  }
  
  private async handleTaskUpdated(event: EventWithCausality, boardId: string): Promise<void> {
    // Update task card properties
    // Save updated view
  }
}
```

#### Step 4.3: Implement Projection Rebuilding (Week 7)

**Create**: `src/app/platform/projections/projection-rebuilder.service.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { PlatformEventStoreService } from '@app/platform/event-store';
import { ProjectionBuilderService } from './projection-builder.service';

@Injectable({ providedIn: 'root' })
export class ProjectionRebuilderService {
  private eventStore = inject(PlatformEventStoreService);
  private builder = inject(ProjectionBuilderService);
  
  /**
   * Rebuild projection from event history
   */
  async rebuildProjection(
    viewType: string,
    namespace: string,
    fromDate?: Date
  ): Promise<void> {
    console.log(`Rebuilding ${viewType} projection...`);
    
    // Get all events from specified date
    const events = await this.eventStore.getEventsForNamespaceAsync(
      namespace,
      fromDate
    );
    
    // Clear existing projection data (optional - depends on strategy)
    // await this.clearProjection(viewType);
    
    // Replay events through handlers
    for (const event of events) {
      const handlers = this.builder['handlers'].get(event.eventType) || [];
      
      for (const handler of handlers) {
        if (handler.viewType === viewType) {
          await handler.handle(event);
        }
      }
    }
    
    console.log(`${viewType} projection rebuilt successfully`);
  }
  
  /**
   * Rebuild all projections
   */
  async rebuildAllProjections(namespace: string): Promise<void> {
    const viewTypes = ['task-list', 'task-kanban', 'task-timeline', 'task-analytics'];
    
    for (const viewType of viewTypes) {
      await this.rebuildProjection(viewType, namespace);
    }
  }
}
```

---

## 🔧 5. TypeScript Modules and Services

### Service Layer Architecture

```
Services Layer:
├── Command Services (Write Side)
│   └── TaskCommandService ✅
├── Query Services (Read Side)
│   ├── TaskQueryService (NEW)
│   ├── TaskKanbanService (NEW)
│   └── TaskAnalyticsService (NEW)
├── Process Services (Orchestration)
│   └── TaskLifecycleSaga ✅ (to be created)
└── Infrastructure Services
    ├── CausalityService ✅ (to be created)
    ├── TenantContextService ✅ (to be created)
    └── ProjectionBuilderService ✅ (to be created)
```

### Implementation Steps

#### Step 5.1: Create Task Query Service (Week 7)

**Create**: `src/app/features/domains/task/services/task-query.service.ts`

```typescript
import { Injectable, inject, signal } from '@angular/core';
import { Firestore, collection, query, where, getDocs, doc, getDoc } from '@angular/fire/firestore';
import { TenantContextService } from '@app/core/tenant';
import { TaskListProjection, TaskDetailProjection } from '../projections';

@Injectable({ providedIn: 'root' })
export class TaskQueryService {
  private firestore = inject(Firestore);
  private tenant = inject(TenantContextService);
  
  // Signal-based cache
  private taskListCache = signal<TaskListProjection[]>([]);
  
  /**
   * Get all tasks for current tenant
   */
  async getTaskList(filters?: {
    status?: string;
    assigneeId?: string;
    priority?: string;
  }): Promise<TaskListProjection[]> {
    const context = this.tenant.tenantContext();
    if (!context) throw new Error('Tenant context required');
    
    // Query projection collection
    const path = `projections/task-list/${context.tenantId}`;
    let q = query(collection(this.firestore, path));
    
    // Apply filters
    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }
    if (filters?.assigneeId) {
      q = query(q, where('assigneeId', '==', filters.assigneeId));
    }
    if (filters?.priority) {
      q = query(q, where('priority', '==', filters.priority));
    }
    
    const snapshot = await getDocs(q);
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TaskListProjection));
    
    // Update cache
    this.taskListCache.set(tasks);
    
    return tasks;
  }
  
  /**
   * Get task detail
   */
  async getTaskDetail(taskId: string): Promise<TaskDetailProjection | null> {
    const context = this.tenant.tenantContext();
    if (!context) throw new Error('Tenant context required');
    
    const path = `projections/task-detail/${context.tenantId}/${taskId}`;
    const snapshot = await getDoc(doc(this.firestore, path));
    
    return snapshot.exists() ? snapshot.data() as TaskDetailProjection : null;
  }
  
  /**
   * Get cached task list (reactive)
   */
  getCachedTaskList() {
    return this.taskListCache.asReadonly();
  }
}
```

---

## 🎯 6. SaaS Integration Considerations

### Leveraging @angular/fire

#### 6.1 Authentication Integration

**Use AngularFireAuth directly**:

```typescript
// app.config.ts
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideFunctions, getFunctions } from '@angular/fire/functions';

export const appConfig: ApplicationConfig = {
  providers: [
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideFunctions(() => getFunctions())
  ]
};
```

#### 6.2 Firestore Integration

**Use typed collections**:

```typescript
import { Firestore, collection, CollectionReference } from '@angular/fire/firestore';

// Type-safe collection
const tasksRef = collection(
  firestore,
  'projections/task-list/tenant-123'
) as CollectionReference<TaskListProjection>;
```

#### 6.3 Cloud Functions Integration

**Already done in TaskCommandService**:

```typescript
import { Functions, httpsCallable } from '@angular/fire/functions';

const createTask = httpsCallable(functions, 'tasks-createTask');
await createTask({ title, description });
```

---

## 📦 7. Prerequisites and Configuration

### Dependencies to Add

```bash
# Causality and correlation
yarn add uuid
yarn add -D @types/uuid

# State management (if needed beyond signals)
# (Angular 20 signals should be sufficient)

# Firebase Functions v2 (in functions/ directory)
cd functions
npm init -y
npm install firebase-functions@^5.0.0 firebase-admin@^12.0.0
```

### Configuration Files

#### 7.1 Firebase Functions Configuration

**Create**: `functions/package.json`

```json
{
  "name": "ng-lin-functions",
  "version": "1.0.0",
  "engines": {
    "node": "20"
  },
  "main": "lib/index.js",
  "scripts": {
    "build": "tsc",
    "serve": "npm run build && firebase emulators:start --only functions",
    "shell": "npm run build && firebase functions:shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^5.0.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.0.0"
  }
}
```

**Create**: `functions/tsconfig.json`

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2022",
    "lib": ["ES2022"],
    "outDir": "lib",
    "rootDir": "src",
    "sourceMap": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

#### 7.2 Update firebase.json

```json
{
  "functions": [
    {
      "source": "functions",
      "codebase": "default",
      "ignore": [
        "node_modules",
        ".git",
        "firebase-debug.log",
        "firebase-debug.*.log"
      ],
      "predeploy": ["npm --prefix \"$RESOURCE_DIR\" run build"]
    }
  ],
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

---

## 📋 Implementation Checklist

### ✅ Phase 1: Foundation (Weeks 1-3)
- [ ] Create CausalityService with correlation tracking
- [ ] Enhance PlatformEventStoreService with causality metadata
- [ ] Update TaskCommandService to use causality
- [ ] Create TenantContextService with signal-based context
- [ ] Implement Firestore Security Rules for multi-tenancy
- [ ] Update authentication guards with tenant validation

### ⏳ Phase 2: Process Layer (Weeks 4-6)
- [ ] Create ProcessManagerBase abstract class
- [ ] Implement TaskLifecycleSaga
- [ ] Create SagaCoordinatorService
- [ ] Wire up event subscriptions
- [ ] Test saga with task creation workflow

### ⏳ Phase 3: Projection Layer (Weeks 6-8)
- [ ] Create ProjectionBuilderService
- [ ] Implement TaskKanbanProjectionHandler
- [ ] Implement TaskTimelineProjectionHandler (optional)
- [ ] Implement TaskAnalyticsProjectionHandler (optional)
- [ ] Create ProjectionRebuilderService
- [ ] Create TaskQueryService for reading projections

### ⏳ Phase 4: Cloud Functions (Weeks 8-9)
- [ ] Set up Firebase Functions v2 project
- [ ] Implement task command handlers in Cloud Functions
- [ ] Add authentication and authorization middleware
- [ ] Add validation middleware
- [ ] Deploy to Firebase

### ⏳ Phase 5: Testing & Documentation (Weeks 10-12)
- [ ] Unit tests for all services
- [ ] Integration tests with Firebase emulator
- [ ] E2E tests for workflows
- [ ] Update architectural documentation
- [ ] Create developer guides
- [ ] Create deployment runbook

---

## 🚀 Quick Start Commands

### Development
```bash
# Install dependencies
yarn install

# Start Firebase emulator
firebase emulators:start

# Start Angular dev server
yarn start

# Run tests
yarn test
```

### Build & Deploy
```bash
# Build Angular app
yarn build

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Cloud Functions
cd functions && npm run deploy

# Deploy hosting
firebase deploy --only hosting
```

---

## 📚 Additional Resources

### Documentation to Read
1. [Event Sourcing Pattern](https://martinfowler.com/eaaDev/EventSourcing.html)
2. [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)
3. [Saga Pattern](https://microservices.io/patterns/data/saga.html)
4. [Firebase Multi-Tenancy](https://firebase.google.com/docs/firestore/solutions/role-based-access)
5. [Angular Signals](https://angular.dev/guide/signals)

### Existing Project Documentation
- `docs/02-paradigm/core-principles.md` - Core architectural principles
- `docs/03-architecture/layering-model.md` - Three-layer architecture
- `docs/05-process-layer/saga-process-manager.md` - Process orchestration
- `docs/06-projection-decision/projection-principles.md` - Projection patterns

---

## 🎯 Success Criteria

### Technical Goals
- [ ] All events have causality metadata (correlationId, causationId, actorId)
- [ ] Multi-tenant isolation enforced at Firestore level
- [ ] At least 3 projection views (list, kanban, timeline)
- [ ] Process managers handle task lifecycle
- [ ] Projection rebuilding works from event history
- [ ] <100ms write latency (P95)
- [ ] <50ms query latency (P95)

### Business Goals
- [ ] Multiple teams can use system simultaneously
- [ ] Complete audit trail for all task changes
- [ ] Time-travel queries supported
- [ ] Simulation capabilities (basic what-if)
- [ ] 99.9% availability

---

## 📞 Next Steps Summary

1. **Start with Priority 1** (Weeks 1-3): Implement causality infrastructure and multi-tenant foundation
2. **Then Priority 2** (Weeks 4-6): Build process orchestration layer with sagas
3. **Then Priority 3** (Weeks 6-8): Create multiple projection views
4. **Then Priority 4** (Weeks 8-9): Move command handlers to Cloud Functions
5. **Finally Priority 5** (Weeks 10-12): Add advanced features and testing

**Recommended Starting Point**: Implement `CausalityService` and enhance `PlatformEventStoreService` first, as these are foundational for all other features.

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-01  
**Maintained By**: ng-lin Development Team
