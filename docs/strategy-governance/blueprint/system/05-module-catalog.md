# Module Catalog - GigHub Blueprint

> **Document Type**: Technical Specification  
> **Version**: 1.0  
> **Last Updated**: 2025-12-27  
> **Status**: Production Reference  
> **Audience**: All Developers

---

## Overview

This document catalogs all Blueprint modules in the GigHub system, providing specifications, interfaces, and implementation status for each module.

---

## Module Status Legend

- ✅ **Complete**: Fully implemented and tested
- ⚠️ **Partial**: Core functionality implemented, enhancements needed
- ❌ **Missing**: Not yet implemented
- 🔒 **Core**: Critical system module
- 📦 **Standard**: Standard blueprint module

---

## Core System Modules

### 1. Event Bus Module 🔒

**Status**: ✅ Complete  
**Location**: `src/app/core/event-bus/`  
**Priority**: CRITICAL

**Purpose**: Central event routing and dispatching for all system events.

**Public API**:
```typescript
class EnhancedEventBus {
  emit(eventType: string, data: any, options?: { correlationId?: string }): void
  on(eventType: string): Observable<DomainEvent>
  onPattern(pattern: RegExp): Observable<DomainEvent>
  emitAsync<T>(eventType: string, data: any, options?: { timeout?: number }): Promise<T>
}
```

**Key Features**:
- Event publication and subscription
- Correlation ID tracking
- Pattern-based subscriptions
- Async event handling
- Audit logging integration

**Dependencies**: RxJS, Audit Service

---

### 2. Audit Module 🔒

**Status**: ✅ Complete  
**Location**: `src/app/core/audit/`  
**Priority**: CRITICAL

**Purpose**: Immutable audit logging for all system actions.

**Public API**:
```typescript
class AuditService {
  log(action: AuditAction): Promise<void>
  query(filter: AuditFilter): Promise<AuditLog[]>
  export(filter: AuditFilter, format: 'csv' | 'json'): Promise<Blob>
}

interface AuditLog {
  id: string;
  timestamp: Date;
  actor: string;
  action: string;
  resource: string;
  correlationId?: string;
  metadata?: Record<string, any>;
}
```

**Key Features**:
- Append-only audit logs
- Firestore immutability enforcement
- Query and export capabilities
- Correlation ID tracking
- Compliance reporting support

**Dependencies**: Firestore, Event Bus

---

### 3. Workflow Orchestrator Module 🔒

**Status**: ✅ Complete  
**Location**: `src/app/core/workflow/`  
**Priority**: CRITICAL

**Purpose**: Coordinate multi-step workflows across modules.

**Public API**:
```typescript
class SETCWorkflowOrchestrator {
  initialize(): void
  registerHandler(eventType: string, handler: WorkflowHandler): void
  executeWorkflow(workflowId: string, context: WorkflowContext): Promise<void>
}

interface WorkflowHandler {
  handle(event: DomainEvent): Promise<void>
}
```

**Key Features**:
- Event-driven workflow coordination
- Saga pattern for compensation
- Error handling and retries
- Workflow state tracking
- Handler registration

**Dependencies**: Event Bus, All blueprint modules

---

## Blueprint Domain Modules

### 4. Contract Module 📦

**Status**: ❌ Missing  
**Location**: `src/app/core/modules/contract/` (planned)  
**Priority**: HIGH

**Purpose**: Manage construction contract lifecycle.

**Planned API**:
```typescript
class ContractFacade {
  createContract(data: CreateContractDTO): Promise<Contract>
  uploadContract(file: File): Promise<string>
  parseContract(contractId: string): Promise<ParsedContract>
  activateContract(contractId: string): Promise<Contract>
  getContract(contractId: string): Promise<Contract>
  listContracts(filter: ContractFilter): Promise<Contract[]>
}

interface Contract {
  id: string;
  status: ContractStatus;
  owner: string;
  contractor: string;
  amount: number;
  scope: ContractScope;
  parsedData?: ParsedContractData;
  createdAt: Date;
  activatedAt?: Date;
}

enum ContractStatus {
  Draft = 'draft',
  Uploaded = 'uploaded',
  Parsing = 'parsing',
  Parsed = 'parsed',
  PendingActivation = 'pending_activation',
  Active = 'active',
  Suspended = 'suspended',
  Completed = 'completed',
  Terminated = 'terminated'
}
```

**Planned Features**:
- Contract upload (PDF/image)
- AI-powered parsing (OCR)
- Lifecycle management
- Change order tracking
- Scope definition

**Dependencies**: Event Bus, Audit, Storage, Vertex AI

---

### 5. Task Module 📦

**Status**: ⚠️ Partial  
**Location**: `src/app/core/modules/task/` (partial)  
**Priority**: HIGH

**Purpose**: Manage construction tasks and phases.

**Public API**:
```typescript
class TaskFacade {
  createTask(data: CreateTaskDTO): Promise<Task>
  assignTask(taskId: string, assignee: string): Promise<Task>
  updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task>
  submitCompletion(taskId: string, evidence: Evidence[]): Promise<Task>
  confirmCompletion(taskId: string): Promise<Task>
  getTasks(filter: TaskFilter): Promise<Task[]>
}

interface Task {
  id: string;
  contractId: string;
  title: string;
  description: string;
  assignee?: string;
  status: TaskStatus;
  location?: string;
  dueDate?: Date;
  completedAt?: Date;
  evidence: Evidence[];
}

enum TaskStatus {
  Created = 'created',
  Assigned = 'assigned',
  InProgress = 'in_progress',
  Submitted = 'submitted',
  Confirmed = 'confirmed',
  Completed = 'completed'
}
```

**Current Features**:
- Basic task creation
- Assignment workflow
- Status tracking

**Missing Features**:
- Evidence capture integration
- Manager confirmation workflow
- Task-contract policy enforcement

**Dependencies**: Contract Module, Event Bus, Audit

---

### 6. QA (Quality Assurance) Module 📦

**Status**: ✅ Complete  
**Location**: `src/app/core/modules/qa/`  
**Priority**: HIGH

**Purpose**: Quality control and inspection workflows.

**Public API**:
```typescript
class QAFacade {
  createQCTask(data: CreateQCTaskDTO): Promise<QCTask>
  conductInspection(qcId: string, result: InspectionResult): Promise<QCTask>
  createDefectReport(data: DefectReportDTO): Promise<DefectReport>
  getQCTasks(filter: QCFilter): Promise<QCTask[]>
}

interface QCTask {
  id: string;
  taskId: string;
  inspector?: string;
  status: 'pending' | 'in_progress' | 'completed';
  result?: 'pass' | 'fail';
  dueDate: Date;
  evidence: Evidence[];
  defects: Defect[];
}
```

**Key Features**:
- Auto-creation on task completion
- Mobile inspection interface
- Pass/Fail workflow
- Defect tracking
- Re-inspection support

**Dependencies**: Task Module, Event Bus, Audit

---

### 7. Acceptance Module 📦

**Status**: ✅ Complete  
**Location**: `src/app/core/modules/acceptance/`  
**Priority**: HIGH

**Purpose**: Approval workflow for completed work.

**Public API**:
```typescript
class AcceptanceFacade {
  createAcceptance(data: CreateAcceptanceDTO): Promise<Acceptance>
  review(acceptanceId: string, decision: AcceptanceDecision): Promise<Acceptance>
  finalizeAcceptance(acceptanceId: string): Promise<Acceptance>
  getAcceptances(filter: AcceptanceFilter): Promise<Acceptance[]>
}

interface Acceptance {
  id: string;
  taskId: string;
  qcId: string;
  status: AcceptanceStatus;
  decision?: 'approved' | 'rejected' | 'conditional';
  reviewers: Reviewer[];
  approvedBy?: string;
  approvedAt?: Date;
  issues: string[];
}

enum AcceptanceStatus {
  PendingReview = 'pending_review',
  UnderReview = 'under_review',
  Approved = 'approved',
  Rejected = 'rejected',
  Conditional = 'conditional',
  Finalized = 'finalized'
}
```

**Key Features**:
- Multi-stakeholder review
- Approve/Reject/Conditional decisions
- Issue tracking for conditional acceptance
- Evidence requirements
- Final archival

**Dependencies**: QA Module, Event Bus, Audit

---

### 8. Finance Module 📦

**Status**: ✅ Complete  
**Location**: `src/app/core/modules/finance/`  
**Priority**: HIGH

**Purpose**: Financial operations and billing.

**Public API**:
```typescript
class FinanceFacade {
  calculateBilling(data: BillingCalculationDTO): Promise<Billing>
  createPayment(data: CreatePaymentDTO): Promise<Payment>
  approveBilling(billingId: string): Promise<Billing>
  getBillings(filter: BillingFilter): Promise<Billing[]>
  getCostAnalysis(projectId: string): Promise<CostAnalysis>
}

interface Billing {
  id: string;
  taskId: string;
  acceptanceId: string;
  amount: number;
  currency: string;
  status: BillingStatus;
  calculatedAt: Date;
  approvedAt?: Date;
}

enum BillingStatus {
  Draft = 'draft',
  Calculated = 'calculated',
  Submitted = 'submitted',
  UnderReview = 'under_review',
  Approved = 'approved',
  Paid = 'paid'
}
```

**Key Features**:
- Auto-calculate from accepted work
- Progress-based billing
- Multi-currency support
- Owner/Contractor separate views
- Cost tracking and analysis

**Dependencies**: Acceptance Module, Event Bus, Audit

---

### 9. Warranty Module 📦

**Status**: ✅ Complete  
**Location**: `src/app/core/modules/warranty/`  
**Priority**: MEDIUM

**Purpose**: Warranty period tracking and defect management.

**Public API**:
```typescript
class WarrantyFacade {
  enterWarrantyPeriod(data: EnterWarrantyDTO): Promise<Warranty>
  reportDefect(data: DefectReportDTO): Promise<WarrantyDefect>
  closeWarranty(warrantyId: string): Promise<Warranty>
  getWarranties(filter: WarrantyFilter): Promise<Warranty[]>
}

interface Warranty {
  id: string;
  taskId: string;
  acceptanceId: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'closed';
  defects: WarrantyDefect[];
}
```

**Key Features**:
- Auto-entry on acceptance
- Period tracking
- Defect reporting
- Expiration notifications
- Final closure workflow

**Dependencies**: Acceptance Module, Event Bus, Audit

---

### 10. Issue Module 📦

**Status**: ✅ Complete  
**Location**: `src/app/core/modules/issue/`  
**Priority**: MEDIUM

**Purpose**: GitHub-style issue tracking.

**Public API**:
```typescript
class IssueFacade {
  createIssue(data: CreateIssueDTO): Promise<Issue>
  updateIssue(issueId: string, data: UpdateIssueDTO): Promise<Issue>
  assignIssue(issueId: string, assignee: string): Promise<Issue>
  closeIssue(issueId: string): Promise<Issue>
  getIssues(filter: IssueFilter): Promise<Issue[]>
}

interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
  labels: string[];
  linkedTo?: { type: string; id: string };
}
```

**Key Features**:
- Issue creation and management
- Link to tasks/contracts/locations
- Priority and labels
- Assignee tracking
- Resolution workflow

**Dependencies**: Event Bus, Audit

---

### 11. Asset Module 📦

**Status**: ❌ Missing  
**Location**: `src/app/core/modules/asset/` (planned)  
**Priority**: MEDIUM

**Purpose**: Document and file management.

**Planned API**:
```typescript
class AssetFacade {
  uploadFile(file: File, metadata: FileMetadata): Promise<Asset>
  getFile(assetId: string): Promise<Asset>
  listFiles(filter: AssetFilter): Promise<Asset[]>
  updateMetadata(assetId: string, metadata: Partial<FileMetadata>): Promise<Asset>
  deleteFile(assetId: string): Promise<void>
}

interface Asset {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  url: string;
  category: AssetCategory;
  tags: string[];
  linkedTo?: { type: string; id: string };
  uploadedBy: string;
  uploadedAt: Date;
}

enum AssetCategory {
  Contract = 'contract',
  Drawing = 'drawing',
  Photo = 'photo',
  Document = 'document',
  Report = 'report'
}
```

**Planned Features**:
- File upload/download
- Version control
- Automatic categorization
- Tagging and search
- Cloud Storage integration

**Dependencies**: Cloud Storage, Event Bus, Audit

---

## Module Dependencies Graph

```
┌─────────────┐
│  Event Bus  │ ◄─── All modules depend on Event Bus
└──────┬──────┘
       │
       ↓
┌─────────────┐
│    Audit    │ ◄─── All modules log to Audit
└─────────────┘

Module Dependency Chain:
Contract → Task → QA → Acceptance → Finance + Warranty
                                  → Issue
```

---

## Implementation Priority Matrix

| Priority | Modules | Reason |
|----------|---------|--------|
| **P0** | Event Bus, Audit, Workflow | Core infrastructure |
| **P1** | Contract, Task, QA, Acceptance | Critical workflow |
| **P2** | Finance, Warranty, Issue | Essential features |
| **P3** | Asset | Enhancement |

---

## Module Integration Patterns

### Pattern 1: Event-Driven Communication

```typescript
// Task Module emits event
eventBus.emit('task.completed', { taskId, contractId });

// QA Module listens and responds
eventBus.on('task.completed').subscribe(async (event) => {
  await qaFacade.createQCTask({ taskId: event.data.taskId });
});
```

### Pattern 2: Policy Enforcement

```typescript
// Before creating task, check contract policy
const contract = await contractRepository.findById(contractId);
if (!contractPolicyService.canCreateTask(contract)) {
  throw new PolicyViolationError('Contract must be active');
}
```

### Pattern 3: Facade Orchestration

```typescript
// Facade coordinates multiple services
class AcceptanceFacade {
  async finalizeAcceptance(acceptanceId: string): Promise<Acceptance> {
    // 1. Update acceptance
    const acceptance = await acceptanceService.finalize(acceptanceId);
    
    // 2. Emit event
    eventBus.emit('acceptance.finalized', acceptance);
    
    // 3. Trigger billing (via event bus)
    // 4. Enter warranty (via event bus)
    
    return acceptance;
  }
}
```

---

## Testing Requirements

Each module MUST have:
- ✅ Unit tests (>80% coverage)
- ✅ Integration tests (Firestore operations)
- ✅ Policy tests (business rules)
- ✅ Event tests (emit/subscribe)
- ✅ E2E tests (critical workflows)

---

## References

- [System Architecture](./02-system-architecture.md)
- [Three-Layer Model](./03-three-layer-model.md)
- [Event-Driven Architecture](./04-event-driven-architecture.md)
- [Quick Reference Guide](../guides/quick-reference-guide.md)

---

**Document Status**: ✅ Complete  
**Last Review**: 2025-12-27  
**Maintainer**: GigHub Architecture Team
