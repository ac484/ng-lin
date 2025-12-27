# Event-Driven Architecture - GigHub

> **Document Type**: Technical Architecture Specification  
> **Version**: 1.0  
> **Last Updated**: 2025-12-27  
> **Status**: Production Reference  
> **Audience**: Backend Developers, Architects

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Event Bus Implementation](#event-bus-implementation)
3. [Event Types & Schemas](#event-types--schemas)
4. [Workflow Orchestration](#workflow-orchestration)
5. [Event Handlers](#event-handlers)
6. [Best Practices](#best-practices)

---

## Architecture Overview

### Event-Driven Core

GigHub uses event-driven architecture to achieve loose coupling between modules while maintaining system-wide workflow coordination.

```
┌──────────────────────────────────────────────────────┐
│                   Event Bus                          │
│  Centralized event routing and dispatch              │
└────────┬─────────────────────────────────┬───────────┘
         │                                 │
    ┌────▼─────┐                      ┌───▼────┐
    │ Contract │                      │  Task  │
    │  Module  │                      │ Module │
    └────┬─────┘                      └───┬────┘
         │                                │
         │ emit('contract.activated')     │
         └────────────────────────────────┘
                       ↓
         ┌─────────────────────────────┐
         │  Workflow Orchestrator      │
         │  - Listens to events        │
         │  - Coordinates workflows    │
         │  - Triggers next steps      │
         └─────────────────────────────┘
```

### Key Benefits

- **Loose Coupling**: Modules don't directly depend on each other
- **Scalability**: Easy to add new event consumers
- **Traceability**: All events logged with correlation IDs
- **Async Processing**: Events can be processed asynchronously
- **Workflow Automation**: Complex multi-step processes coordinated via events

---

## Event Bus Implementation

### Core Event Bus Service

```typescript
// src/app/core/event-bus/services/enhanced-event-bus.service.ts

import { Injectable } from '@angular/core';
import { Subject, Observable, filter } from 'rxjs';

export interface DomainEvent {
  type: string;
  timestamp: Date;
  correlationId?: string;
  actor?: string;
  data: any;
}

@Injectable({ providedIn: 'root' })
export class EnhancedEventBus {
  private eventStream = new Subject<DomainEvent>();
  
  /**
   * Emit an event to the event bus
   */
  emit(eventType: string, data: any, options?: { correlationId?: string }): void {
    const event: DomainEvent = {
      type: eventType,
      timestamp: new Date(),
      correlationId: options?.correlationId || this.generateCorrelationId(),
      data
    };
    
    // Log for audit
    this.logEvent(event);
    
    // Dispatch to subscribers
    this.eventStream.next(event);
  }
  
  /**
   * Subscribe to events of a specific type
   */
  on(eventType: string): Observable<DomainEvent> {
    return this.eventStream.pipe(
      filter(event => event.type === eventType)
    );
  }
  
  /**
   * Subscribe to events matching a pattern
   */
  onPattern(pattern: RegExp): Observable<DomainEvent> {
    return this.eventStream.pipe(
      filter(event => pattern.test(event.type))
    );
  }
  
  /**
   * Emit and wait for result (for synchronous workflows)
   */
  async emitAsync<T>(
    eventType: string,
    data: any,
    options?: { timeout?: number; correlationId?: string }
  ): Promise<T> {
    const correlationId = options?.correlationId || this.generateCorrelationId();
    const timeout = options?.timeout || 30000; // 30 seconds default
    
    return new Promise((resolve, reject) => {
      const resultEventType = `${eventType}.result`;
      
      // Listen for result
      const subscription = this.on(resultEventType)
        .pipe(
          filter(e => e.correlationId === correlationId),
          timeout(timeout)
        )
        .subscribe({
          next: (resultEvent) => {
            resolve(resultEvent.data as T);
            subscription.unsubscribe();
          },
          error: (error) => {
            reject(error);
            subscription.unsubscribe();
          }
        });
      
      // Emit original event
      this.emit(eventType, data, { correlationId });
    });
  }
  
  private generateCorrelationId(): string {
    return `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private logEvent(event: DomainEvent): void {
    // Log to audit service or console in development
    if (environment.production) {
      auditService.log({
        action: 'event.emitted',
        eventType: event.type,
        correlationId: event.correlationId,
        timestamp: event.timestamp
      });
    } else {
      console.log('[EventBus]', event.type, event);
    }
  }
}
```

### Event Subscription Pattern

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
        this.updateContractStatus(event.data.contractId, 'active');
      });
    
    // Subscribe to multiple event types using pattern
    this.eventBus.onPattern(/^contract\./)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        console.log('Contract event:', event.type);
        this.trackContractActivity(event);
      });
  }
  
  private refreshContracts() {
    // Reload contract list
  }
  
  private updateContractStatus(contractId: string, status: string) {
    // Update UI state
  }
  
  private trackContractActivity(event: DomainEvent) {
    // Track for analytics
  }
}
```

---

## Event Types & Schemas

### Event Naming Convention

```
{module}.{action}[.{result}]
```

Examples:
- `contract.created`
- `contract.activated`
- `task.completed`
- `qc.passed`
- `qc.failed`
- `acceptance.finalized`
- `payment.approved`

### Core Event Schemas

#### Contract Events

```typescript
// contract.created
interface ContractCreatedEvent {
  type: 'contract.created';
  timestamp: Date;
  correlationId: string;
  actor: string;
  data: {
    contractId: string;
    ownerId: string;
    contractorId: string;
    amount: number;
    scope: string[];
  };
}

// contract.activated
interface ContractActivatedEvent {
  type: 'contract.activated';
  timestamp: Date;
  correlationId: string;
  actor: string;
  data: {
    contractId: string;
    activatedAt: Date;
    scope: string[];
  };
}

// contract.parsed (AI/OCR result)
interface ContractParsedEvent {
  type: 'contract.parsed';
  timestamp: Date;
  correlationId: string;
  data: {
    contractId: string;
    parsedData: {
      amount?: number;
      terms?: string[];
      deliverables?: any[];
      confidence: number;
    };
  };
}
```

#### Task Events

```typescript
// task.created
interface TaskCreatedEvent {
  type: 'task.created';
  timestamp: Date;
  correlationId: string;
  actor: string;
  data: {
    taskId: string;
    contractId: string;
    assignee: string;
    dueDate: Date;
  };
}

// task.completed
interface TaskCompletedEvent {
  type: 'task.completed';
  timestamp: Date;
  correlationId: string;
  actor: string;
  data: {
    taskId: string;
    contractId: string;
    completedAt: Date;
    completedBy: string;
    evidence: Evidence[];
  };
}
```

#### QC Events

```typescript
// qc.created (auto-created after task.completed)
interface QCCreatedEvent {
  type: 'qc.created';
  timestamp: Date;
  correlationId: string;
  data: {
    qcId: string;
    taskId: string;
    assignee: string;
    dueDate: Date;
  };
}

// qc.passed
interface QCPassedEvent {
  type: 'qc.passed';
  timestamp: Date;
  correlationId: string;
  actor: string;
  data: {
    qcId: string;
    taskId: string;
    inspector: string;
    passedAt: Date;
    evidence: Evidence[];
  };
}

// qc.failed
interface QCFailedEvent {
  type: 'qc.failed';
  timestamp: Date;
  correlationId: string;
  actor: string;
  data: {
    qcId: string;
    taskId: string;
    inspector: string;
    failedAt: Date;
    defects: Defect[];
    evidence: Evidence[];
  };
}
```

#### Acceptance Events

```typescript
// acceptance.created (after qc.passed)
interface AcceptanceCreatedEvent {
  type: 'acceptance.created';
  timestamp: Date;
  correlationId: string;
  data: {
    acceptanceId: string;
    taskId: string;
    qcId: string;
  };
}

// acceptance.finalized
interface AcceptanceFinalizedEvent {
  type: 'acceptance.finalized';
  timestamp: Date;
  correlationId: string;
  actor: string;
  data: {
    acceptanceId: string;
    taskId: string;
    status: 'approved' | 'rejected' | 'conditional';
    approvedBy: string;
    approvedAt: Date;
    issues?: string[];
  };
}
```

---

## Workflow Orchestration

### Workflow Orchestrator Service

```typescript
// src/app/core/workflow/setc-workflow-orchestrator.service.ts

import { Injectable, inject } from '@angular/core';
import { EnhancedEventBus } from '@core/event-bus';
import { QAService } from '@core/modules/qa';
import { AcceptanceService } from '@core/modules/acceptance';
import { FinanceService } from '@core/modules/finance';
import { WarrantyService } from '@core/modules/warranty';

@Injectable({ providedIn: 'root' })
export class SETCWorkflowOrchestrator {
  private eventBus = inject(EnhancedEventBus);
  private qaService = inject(QAService);
  private acceptanceService = inject(AcceptanceService);
  private financeService = inject(FinanceService);
  private warrantyService = inject(WarrantyService);
  
  /**
   * Initialize all workflow handlers
   */
  initialize(): void {
    this.registerTaskCompletedWorkflow();
    this.registerQCWorkflow();
    this.registerAcceptanceWorkflow();
    this.registerFinanceWorkflow();
  }
  
  /**
   * Workflow: Task Completed → Create QC
   */
  private registerTaskCompletedWorkflow(): void {
    this.eventBus.on('task.completed').subscribe(async (event) => {
      try {
        // Create QC task automatically
        const qc = await this.qaService.createQCTask({
          taskId: event.data.taskId,
          contractId: event.data.contractId,
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        });
        
        // Emit QC created event
        this.eventBus.emit('qc.created', {
          qcId: qc.id,
          taskId: event.data.taskId
        }, {
          correlationId: event.correlationId
        });
      } catch (error) {
        console.error('Failed to create QC task:', error);
        this.eventBus.emit('workflow.error', {
          workflow: 'task-to-qc',
          error: error.message,
          originalEvent: event
        });
      }
    });
  }
  
  /**
   * Workflow: QC Passed → Create Acceptance
   */
  private registerQCWorkflow(): void {
    // QC Passed → Create Acceptance
    this.eventBus.on('qc.passed').subscribe(async (event) => {
      try {
        const acceptance = await this.acceptanceService.createAcceptance({
          taskId: event.data.taskId,
          qcId: event.data.qcId,
          status: 'pending_review'
        });
        
        this.eventBus.emit('acceptance.created', {
          acceptanceId: acceptance.id,
          taskId: event.data.taskId
        }, {
          correlationId: event.correlationId
        });
      } catch (error) {
        console.error('Failed to create acceptance:', error);
      }
    });
    
    // QC Failed → Create Defect Report
    this.eventBus.on('qc.failed').subscribe(async (event) => {
      try {
        for (const defect of event.data.defects) {
          await this.qaService.createDefectReport({
            qcId: event.data.qcId,
            taskId: event.data.taskId,
            defect
          });
        }
        
        this.eventBus.emit('defect.reported', {
          qcId: event.data.qcId,
          defectCount: event.data.defects.length
        }, {
          correlationId: event.correlationId
        });
      } catch (error) {
        console.error('Failed to create defect reports:', error);
      }
    });
  }
  
  /**
   * Workflow: Acceptance Finalized → Trigger Billing & Warranty
   */
  private registerAcceptanceWorkflow(): void {
    this.eventBus.on('acceptance.finalized').subscribe(async (event) => {
      if (event.data.status !== 'approved') {
        return; // Only process approved acceptances
      }
      
      try {
        // Trigger billing calculation
        const billing = await this.financeService.calculateBilling({
          taskId: event.data.taskId,
          acceptanceId: event.data.acceptanceId
        });
        
        this.eventBus.emit('billing.calculated', {
          billingId: billing.id,
          amount: billing.amount
        }, {
          correlationId: event.correlationId
        });
        
        // Enter warranty period
        const warranty = await this.warrantyService.enterWarrantyPeriod({
          taskId: event.data.taskId,
          acceptanceId: event.data.acceptanceId,
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
        });
        
        this.eventBus.emit('warranty.started', {
          warrantyId: warranty.id,
          taskId: event.data.taskId
        }, {
          correlationId: event.correlationId
        });
      } catch (error) {
        console.error('Failed to process acceptance finalization:', error);
      }
    });
  }
  
  /**
   * Workflow: Billing & Payment
   */
  private registerFinanceWorkflow(): void {
    this.eventBus.on('billing.approved').subscribe(async (event) => {
      // Create payment record
      await this.financeService.createPayment({
        billingId: event.data.billingId,
        amount: event.data.amount,
        status: 'pending'
      });
    });
  }
}
```

### Saga Pattern for Compensating Actions

```typescript
interface SagaStep {
  execute: () => Promise<any>;
  compensate: () => Promise<void>;
}

class ContractActivationSaga {
  private steps: SagaStep[] = [];
  private completedSteps: SagaStep[] = [];
  
  async execute(): Promise<void> {
    try {
      // Step 1: Validate contract
      this.steps.push({
        execute: async () => {
          const validation = await this.validateContract();
          return validation;
        },
        compensate: async () => {
          // No compensation needed for validation
        }
      });
      
      // Step 2: Activate contract
      this.steps.push({
        execute: async () => {
          const contract = await this.contractService.activate(this.contractId);
          return contract;
        },
        compensate: async () => {
          await this.contractService.deactivate(this.contractId);
        }
      });
      
      // Step 3: Send notifications
      this.steps.push({
        execute: async () => {
          await this.notificationService.sendContractActivated(this.contractId);
        },
        compensate: async () => {
          await this.notificationService.sendContractDeactivated(this.contractId);
        }
      });
      
      // Execute all steps
      for (const step of this.steps) {
        await step.execute();
        this.completedSteps.push(step);
      }
    } catch (error) {
      // Compensate in reverse order
      for (const step of this.completedSteps.reverse()) {
        try {
          await step.compensate();
        } catch (compensationError) {
          console.error('Compensation failed:', compensationError);
        }
      }
      throw error;
    }
  }
}
```

---

## Event Handlers

### Typed Event Handler

```typescript
import { Injectable, inject } from '@angular/core';
import { EnhancedEventBus, DomainEvent } from '@core/event-bus';

@Injectable({ providedIn: 'root' })
export class TaskCompletedHandler {
  private eventBus = inject(EnhancedEventBus);
  private qaService = inject(QAService);
  private auditService = inject(AuditService);
  
  register(): void {
    this.eventBus.on('task.completed').subscribe(event => {
      this.handle(event);
    });
  }
  
  private async handle(event: DomainEvent): Promise<void> {
    const { taskId, contractId, completedBy } = event.data;
    
    try {
      // 1. Log to audit
      await this.auditService.log({
        action: 'task.completed',
        actor: completedBy,
        resource: taskId,
        correlationId: event.correlationId
      });
      
      // 2. Create QC task
      const qc = await this.qaService.createQCTask({
        taskId,
        contractId,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
      
      // 3. Emit next event
      this.eventBus.emit('qc.created', {
        qcId: qc.id,
        taskId
      }, {
        correlationId: event.correlationId
      });
    } catch (error) {
      console.error('TaskCompletedHandler error:', error);
      
      // Emit error event for monitoring
      this.eventBus.emit('handler.error', {
        handler: 'TaskCompletedHandler',
        originalEvent: event,
        error: error.message
      });
    }
  }
}
```

---

## Best Practices

### 1. Event Design

```typescript
// ✅ GOOD: Clear, typed event
interface ContractActivatedEvent {
  type: 'contract.activated';
  timestamp: Date;
  correlationId: string;
  data: {
    contractId: string;
    activatedBy: string;
  };
}

// ❌ BAD: Vague, untyped event
const event = {
  type: 'update',
  stuff: { ... }
};
```

### 2. Correlation IDs

```typescript
// ✅ GOOD: Preserve correlation ID across events
this.eventBus.emit('task.completed', data, {
  correlationId: originalEvent.correlationId
});

// ❌ BAD: Lost traceability
this.eventBus.emit('task.completed', data);
```

### 3. Error Handling

```typescript
// ✅ GOOD: Handle errors gracefully
this.eventBus.on('task.completed').subscribe(async (event) => {
  try {
    await processTask(event.data);
  } catch (error) {
    console.error('Processing failed:', error);
    this.eventBus.emit('workflow.error', {
      originalEvent: event,
      error: error.message
    });
  }
});

// ❌ BAD: Unhandled errors crash workflow
this.eventBus.on('task.completed').subscribe(async (event) => {
  await processTask(event.data); // Throws and crashes!
});
```

### 4. Unsubscribe

```typescript
// ✅ GOOD: Auto-cleanup with takeUntilDestroyed
this.eventBus.on('contract.created')
  .pipe(takeUntilDestroyed(this.destroyRef))
  .subscribe(...);

// ❌ BAD: Memory leak
this.eventBus.on('contract.created').subscribe(...);
```

---

## References

- [System Architecture](./02-system-architecture.md)
- [Three-Layer Model](./03-three-layer-model.md)
- [Module Catalog](./05-module-catalog.md)

---

**Document Status**: ✅ Complete  
**Last Review**: 2025-12-27  
**Maintainer**: GigHub Architecture Team
