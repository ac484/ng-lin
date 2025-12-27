# Glossary - GigHub Terms & Definitions

> **Document Type**: Terminology Reference  
> **Version**: 1.0  
> **Last Updated**: 2025-12-27  
> **Purpose**: Standardize terminology across GigHub documentation and codebase

---

## How to Use This Glossary

- **Bold terms** are primary entries
- *Italics* indicate related terms (see also)
- 🏗️ = Construction industry term
- 💻 = Software development term
- 🔄 = GitHub-inspired concept

---

## A

### **Acceptance**
🏗️ The formal process of approving completed construction work. In GigHub, this is modeled as a Pull Request-style workflow where owners review and approve (or reject) work submitted by contractors.

*See also*: Acceptance Workflow, Conditional Acceptance, Final Acceptance

### **Acceptance Workflow**
The multi-stage process in GigHub for reviewing and approving completed work:
1. QC Passed → Create Acceptance
2. Owner Review → Approve/Reject
3. Approve → Archive to Main State
4. Reject → Create Issues → Resolution

*See also*: Workflow Orchestrator, Pull Request (GitHub analogy)

### **Actor**
The user or system component that performs an action. Every L1 event must have an actor field identifying who executed the action.

```typescript
{
  actor: 'worker@example.com',
  timestamp: new Date(),
  action: 'concrete_pour_completed'
}
```

### **Append-Only**
💻 A storage pattern where data can only be added, never modified or deleted. L1 (Fact Layer) events are append-only to ensure immutability and complete audit trails.

*See also*: Immutability, L1 (Fact Layer)

### **Audit Log**
A permanent record of all system actions, including who did what, when, and why. GigHub's audit system captures L0, L1, and L2 operations for compliance and traceability.

*See also*: Traceability, Correlation ID, Audit Module

---

## B

### **Blueprint Layer**
The core architectural layer of GigHub containing:
- Event Bus
- Workflow Orchestrator
- Audit System
- Policies
- Domain Modules (Contract, Task, Finance, etc.)

*See also*: Three-Layer Architecture, Core Layer

---

## C

### **Change Order**
🏗️ A formal modification to a construction contract, changing scope, budget, or terms. In GigHub, represented as an L0 (Governance) event that updates contract rules.

*See also*: Contract, L0 (Governance), Scope Change

### **Commit (GitHub Analogy)**
🔄 In GigHub, a **Construction Event** (L1 Fact) is analogous to a Git commit. Both:
- Are immutable records of what happened
- Have timestamp and author
- Include evidence/proof of change
- Build upon previous state

*See also*: Construction Event, L1 (Fact Layer)

### **Conditional Acceptance**
Acceptance of work with outstanding minor issues that must be resolved. Work is considered complete, but issues remain tracked until closure.

### **Construction Event**
An L1 (Fact Layer) event recording a physical construction activity. Must include:
- Timestamp (when)
- Actor (who)
- Target (where)
- Evidence (proof)

Examples: concrete pour, rebar installation, inspection

*See also*: L1 (Fact Layer), Evidence, Immutability

### **Contract**
🏗️ The legal agreement defining scope, terms, budget, and deliverables for a construction project. In GigHub, a contract is a "repository" that contains all project data.

*See also*: Repository (GitHub analogy), L0 (Governance)

### **Correlation ID**
💻 A unique identifier that links related events across the system, enabling complete traceability of a user action through multiple system components.

```typescript
{
  correlationId: 'user-action-abc123',
  event: 'task.completed'
}
```

*See also*: Traceability, Audit Log

---

## D

### **Defect**
🏗️ A quality issue identified during inspection. In GigHub, defects trigger remediation workflows and are tracked until resolution.

*See also*: QC (Quality Control), Remediation, Issue

### **Derived State**
Data calculated from L1 (Fact Layer) events. All L2 (Derived Layer) data is derived and recomputable.

Examples: progress percentage, payment amounts, schedule variance

*See also*: L2 (Derived Layer), Recomputable

---

## E

### **Event Bus**
💻 The central event routing system that enables loose coupling between modules. All modules communicate by publishing and subscribing to events via the event bus.

*See also*: Event-Driven Architecture, Publish-Subscribe

### **Event-Driven Architecture**
💻 An architectural pattern where system components communicate through events rather than direct method calls. GigHub uses events to trigger workflows and cross-module operations.

*See also*: Event Bus, Workflow Orchestrator

### **Evidence**
Proof that a construction event actually occurred. Required for all L1 events. Types include:
- **Photo**: Visual documentation
- **Signature**: Digital or physical signature
- **GPS**: Location coordinates
- **Sensor**: IoT device measurements
- **Document**: Supporting files

```typescript
evidence: [
  { type: 'photo', url: '...', timestamp: new Date() },
  { type: 'signature', data: { signer: 'inspector@...' } }
]
```

*See also*: Construction Event, L1 (Fact Layer)

---

## F

### **Facade**
💻 A simplified public API that hides complex internal operations. Each Blueprint module exposes a facade for external consumers.

```typescript
ContractFacade.activateContract(contractId)
  → ContractService.validate()
  → ContractRepository.update()
  → EventBus.emit('contract.activated')
```

*See also*: Module, Separation of Concerns

### **Fact Layer**
See: L1 (Fact Layer)

### **Final Acceptance**
🏗️ The conclusive approval of all work, marking the end of the warranty period and project closure.

*See also*: Acceptance, Warranty Period

---

## G

### **Governance Layer**
See: L0 (Governance)

---

## I

### **Immutability**
💻 The property that data cannot be changed after creation. L1 events are immutable; corrections require new events, not modifications.

```typescript
// ❌ WRONG: Modify existing event
event.location = 'B1F-C4';

// ✅ CORRECT: Add correction event
await append({
  type: 'location_correction',
  corrects: originalEventId,
  newLocation: 'B1F-C4'
});
```

*See also*: Append-Only, L1 (Fact Layer)

### **Issue**
🔄 Borrowed from GitHub, an issue represents a defect, change request, or discussion item. Issues can be linked to tasks, contracts, or locations.

*See also*: Defect, Change Order

---

## L

### **L0 (Governance Layer)**
The top layer of the Three-Layer Model. Defines "who can do what" through:
- Contract terms and scope
- Approval rules and workflows
- Access control policies
- State transition rules

L0 events change the "rules of the game," not the physical state.

*See also*: Three-Layer Model, Contract, Policy

### **L1 (Fact Layer)**
The middle layer of the Three-Layer Model. Records "what actually happened" through immutable construction events with evidence.

**Key Characteristics**:
- Immutable (append-only)
- Has timestamp, actor, evidence
- Records physical world changes
- Cannot be modified or deleted

*See also*: Three-Layer Model, Construction Event, Immutability

### **L2 (Derived Layer)**
The bottom layer of the Three-Layer Model. Calculates "how we understand it" by deriving insights from L1 facts.

**Key Characteristics**:
- Calculated from L1
- Can be recomputed
- Can be discarded and regenerated
- Multiple versions for different roles

Examples: progress %, payment amounts, quality metrics

*See also*: Three-Layer Model, Derived State, Recomputable

---

## M

### **Merge to Main (GitHub Analogy)**
🔄 In GigHub, **Final Acceptance** is analogous to merging a Pull Request to main in GitHub. Both represent:
- Work reviewed and approved
- Changes incorporated into the canonical state
- Permanent record created

*See also*: Acceptance, Pull Request

### **Module**
A self-contained domain component in the Blueprint layer. Each module implements a specific business capability (e.g., Contract, Task, Finance).

**Standard Structure**:
- models/ (domain models)
- services/ (business logic)
- repositories/ (data access)
- events/ (event definitions)
- policies/ (business rules)
- facade/ (public API)

*See also*: Blueprint Layer, Facade, Repository

---

## O

### **Orchestrator**
See: Workflow Orchestrator

---

## P

### **Policy**
A business rule that enforces constraints across modules. Policies answer questions like "Can this user create a task?" or "Is this contract active?"

```typescript
canCreateTask(contract: Contract): boolean {
  return contract.status === ContractStatus.Active;
}
```

*See also*: L0 (Governance), Policy Service

### **Policy Service**
A service that implements and enforces business rules. Each module has a policy service defining its constraints.

*See also*: Policy, Module

### **Progress Percentage**
An L2 (Derived) metric calculated from completed L1 construction events. Never manually set; always computed.

```typescript
// ✅ CORRECT
progressRate = (completedTasks / totalTasks) * 100;

// ❌ WRONG
progressRate = 75; // Manual value!
```

*See also*: L2 (Derived Layer), Recomputable

### **Provisional Location**
A temporary location description used when exact coordinates are unknown. Later replaced with confirmed location via correction event.

```typescript
target: {
  type: 'provisional',
  provisional_description: '地下室東北角某根柱子'
}
```

*See also*: Construction Event, Evidence

### **Pull Request (GitHub Analogy)**
🔄 In GigHub, the **Acceptance Workflow** is analogous to a GitHub Pull Request. Both involve:
- Review process
- Approval/rejection
- Discussion and comments
- Merge to main when approved

*See also*: Acceptance Workflow, Merge to Main

---

## Q

### **QC (Quality Control)**
🏗️ The inspection and verification process ensuring work meets quality standards. In GigHub, QC tasks are auto-created after task completion.

*See also*: Acceptance, Inspector, Defect

---

## R

### **Recomputable**
The property that L2 (Derived) data can be deleted and recalculated from L1 facts without data loss.

*See also*: L2 (Derived Layer), Derived State

### **Remediation**
🏗️ The process of fixing defects found during QC inspection. Remediation work creates new L1 events and triggers re-inspection.

*See also*: Defect, QC, Workflow

### **Repository (Data Access)**
💻 A component that encapsulates data access logic, providing an abstraction over Firestore operations.

```typescript
interface ContractRepository {
  create(data: CreateContractDTO): Promise<Contract>;
  findById(id: string): Promise<Contract | null>;
  update(id: string, data: UpdateContractDTO): Promise<Contract>;
}
```

*See also*: Module, Facade, Firestore

### **Repository (GitHub Analogy)**
🔄 In GigHub, a **Contract** is analogous to a GitHub repository. Both represent:
- A container for all related work
- Defined scope and boundaries
- Access control and permissions
- Complete history of changes

*See also*: Contract, Project

---

## S

### **Saga Pattern**
💻 A design pattern for managing distributed transactions and compensating actions. GigHub's workflow orchestrator uses sagas for multi-step processes.

*See also*: Workflow Orchestrator, Compensation

### **SETC (System Engineering Technical Concept)**
A comprehensive technical document describing system requirements, architecture, design decisions, implementation plan, and operations.

---

## T

### **Task**
🏗️ A unit of construction work assigned to a team or individual. Tasks are linked to contracts and tracked through completion.

*See also*: Construction Event, Assignment

### **Three-Layer Model**
The foundational architecture of GigHub, consisting of:
- **L0 (Governance)**: Who can do what
- **L1 (Fact)**: What actually happened
- **L2 (Derived)**: How we understand it

**Key Rule**: Events flow ONE WAY → L0 → L1 → L2

*See also*: L0, L1, L2, Event Flow

### **Traceability**
The ability to trace any action back to its origin through audit logs and correlation IDs.

*See also*: Audit Log, Correlation ID

---

## W

### **Warranty Period**
🏗️ The time period after acceptance during which the contractor is responsible for defects. GigHub automatically tracks warranty periods and expirations.

*See also*: Final Acceptance, Defect, Issue

### **Workflow**
A multi-step process coordinating actions across modules. Examples: contract activation, acceptance process, payment approval.

*See also*: Workflow Orchestrator, Event-Driven Architecture

### **Workflow Orchestrator**
The system component that coordinates multi-step workflows by listening to events and triggering appropriate handlers.

Example workflow:
```
Task Completed → Create QC Task → 
Inspector Assigned → QC Passed → 
Create Acceptance → Owner Approves → 
Archive & Enter Warranty
```

*See also*: Event Bus, Saga Pattern

---

## Common Acronyms

| Acronym | Full Term | Meaning |
|---------|-----------|---------|
| **ADR** | Architecture Decision Record | Document explaining a design decision |
| **API** | Application Programming Interface | Public methods/endpoints for external use |
| **BIM** | Building Information Modeling | 3D model-based construction management |
| **CQRS** | Command Query Responsibility Segregation | Pattern separating reads and writes |
| **DTO** | Data Transfer Object | Object for transferring data between layers |
| **GPS** | Global Positioning System | Location tracking technology |
| **JWT** | JSON Web Token | Authentication token format |
| **OCR** | Optical Character Recognition | Text extraction from images |
| **PWA** | Progressive Web App | Web app with native-like features |
| **QA** | Quality Assurance | Process ensuring quality standards |
| **QC** | Quality Control | Inspection and testing process |
| **SETC** | System Engineering Technical Concept | Comprehensive technical documentation |
| **SPA** | Single Page Application | Web app loading in a single page |
| **UI/UX** | User Interface / User Experience | Design and interaction patterns |

---

## GitHub Terms (Analogies)

GigHub borrows terminology from GitHub to leverage familiar concepts:

| GitHub Term | GigHub Equivalent | Meaning |
|-------------|-------------------|---------|
| **Repository** | Contract/Project | Container for all project work |
| **Commit** | Construction Event | Immutable record of change |
| **Branch** | Alternative Plan | Parallel version of work |
| **Pull Request** | Acceptance Workflow | Review and approval process |
| **Merge** | Final Acceptance | Incorporate approved work |
| **Issue** | Issue/Defect | Problem or change request |
| **Actions** | Workflow Orchestrator | Automated workflows |
| **CODEOWNERS** | Responsibility Matrix | Who approves what |

---

## References

- [Three-Layer Event Model](../../G_three-layer-event-model.md)
- [Quick Reference Card](../../G_three-layer-quick-reference.md)
- [GitHub Repository Design Concept](../../GITHUB_REPOSITORY_DESIGN_CONCEPT.md)
- [System Architecture](../system/02-system-architecture.md)

---

**Glossary Version**: 1.0  
**Last Updated**: 2025-12-27  
**Maintained By**: GigHub Documentation Team

---

## Contributing to This Glossary

When adding new terms:
1. Use **bold** for the primary term
2. Include category emoji (🏗️💻🔄)
3. Provide clear definition
4. Add code examples if applicable
5. Cross-reference related terms
6. Keep entries concise and practical
