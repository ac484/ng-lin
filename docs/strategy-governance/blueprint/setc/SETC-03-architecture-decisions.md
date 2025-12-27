# SETC-03: Architecture Decisions (ADRs)

## Document Information
- **Version**: 1.0
- **Status**: Complete
- **Last Updated**: 2025-12-27

---

## Table of Contents
1. [ADR Process](#adr-process)
2. [Architecture Decision Records](#architecture-decision-records)

---

## 1. ADR Process

### Purpose
Document significant architecture decisions with context, rationale, and consequences.

### When to Create ADR
- Choosing technology stack
- Selecting architectural patterns
- Making design trade-offs
- Establishing system constraints

---

## 2. Architecture Decision Records

### ADR-001: Three-Layer Event Model (L0/L1/L2)

**Status**: Accepted  
**Date**: 2025-01-01

**Context**:
Construction projects require immutable audit trails, policy enforcement, and real-time progress tracking.

**Decision**:
Adopt three-layer event model:
- **L0 (Governance)**: Immutable policies and rules
- **L1 (Facts)**: Immutable events with evidence
- **L2 (Derived)**: Calculated metrics from L1

**Rationale**:
- Provides complete audit trail
- Enables event sourcing
- Supports regulatory compliance
- Allows state reconstruction

**Consequences**:
- ✅ Complete traceability
- ✅ Easy compliance audits
- ✅ Flexible reporting
- ⚠️ Higher storage costs
- ⚠️ Complex query patterns

**Alternatives Considered**:
- Traditional CRUD: Rejected due to lack of audit trail
- Full event sourcing: Rejected as too complex

---

### ADR-002: Firebase & Firestore as Primary Backend

**Status**: Accepted  
**Date**: 2025-01-01

**Context**:
Need scalable, managed backend with real-time capabilities and minimal ops overhead.

**Decision**:
Use Firebase platform:
- Firestore for data storage
- Cloud Functions for backend logic
- Cloud Storage for files
- Firebase Auth for authentication

**Rationale**:
- Managed infrastructure (no servers)
- Built-in real-time sync
- Automatic scaling
- Strong security model
- Generous free tier

**Consequences**:
- ✅ Fast development
- ✅ Automatic scaling
- ✅ Real-time updates
- ⚠️ Vendor lock-in
- ⚠️ Query limitations

**Alternatives Considered**:
- AWS: Rejected due to complexity
- Azure: Rejected due to cost
- Self-hosted: Rejected due to ops burden

---

### ADR-003: Angular 20 with Standalone Components

**Status**: Accepted  
**Date**: 2025-01-01

**Context**:
Need modern, maintainable frontend framework with strong TypeScript support.

**Decision**:
Use Angular 20 with:
- Standalone components (no NgModules)
- Signals for reactive state
- inject() for dependency injection
- New control flow (@if, @for)

**Rationale**:
- Latest Angular features
- Simplified architecture
- Better performance
- Type safety
- Enterprise support

**Consequences**:
- ✅ Modern codebase
- ✅ Better performance
- ✅ Simpler architecture
- ⚠️ Learning curve for team

**Alternatives Considered**:
- React: Rejected due to less structure
- Vue: Rejected due to smaller ecosystem

---

### ADR-004: Event-Driven Architecture

**Status**: Accepted  
**Date**: 2025-01-05

**Context**:
Modules need to communicate without tight coupling. Workflows span multiple modules.

**Decision**:
Implement Event Bus with:
- Publish-subscribe pattern
- Async event processing
- Event persistence (L1)
- Correlation IDs for tracing

**Rationale**:
- Loose coupling
- Scalability
- Workflow orchestration
- Audit trail

**Consequences**:
- ✅ Decoupled modules
- ✅ Scalable architecture
- ✅ Complete event history
- ⚠️ Eventual consistency
- ⚠️ Debugging complexity

**Alternatives Considered**:
- Direct service calls: Rejected due to tight coupling
- Message queue (RabbitMQ): Rejected as over-engineered

---

### ADR-005: Repository Pattern for Data Access

**Status**: Accepted  
**Date**: 2025-01-05

**Context**:
Need consistent data access patterns across modules. Must support testing and future database changes.

**Decision**:
Implement Repository Pattern:
- One repository per aggregate
- Repositories encapsulate Firestore operations
- Services use repositories (never direct Firestore access)

**Rationale**:
- Separation of concerns
- Testability (mock repositories)
- Consistent data access
- Database abstraction

**Consequences**:
- ✅ Clean architecture
- ✅ Easy testing
- ✅ Database flexibility
- ⚠️ More boilerplate code

**Alternatives Considered**:
- Direct Firestore access: Rejected due to coupling
- ORM: Rejected as unnecessary for Firestore

---

### ADR-006: Policy-Based Governance (L0)

**Status**: Accepted  
**Date**: 2025-01-10

**Context**:
Business rules change frequently. Need centralized, auditable policy enforcement.

**Decision**:
Implement L0 Governance Layer:
- Policies as Firestore documents
- Policy evaluation before operations
- Policy changes emit L0 events
- Policies are immutable (versioned)

**Rationale**:
- Centralized business rules
- Auditable policy changes
- Runtime policy updates
- Compliance support

**Consequences**:
- ✅ Flexible business rules
- ✅ Policy audit trail
- ✅ No code deployment for rule changes
- ⚠️ Policy evaluation overhead

**Alternatives Considered**:
- Hardcoded rules: Rejected due to inflexibility
- External policy engine: Rejected as over-engineered

---

### ADR-007: Result Pattern for Error Handling

**Status**: Accepted  
**Date**: 2025-01-10

**Context**:
Need explicit error handling without exceptions. TypeScript doesn't have checked exceptions.

**Decision**:
Use Result<T> pattern:
```typescript
class Result<T> {
  static ok<U>(value?: U): Result<U>
  static fail<U>(error: string): Result<U>
}
```

**Rationale**:
- Explicit error handling
- Type-safe errors
- Forces error consideration
- Functional programming style

**Consequences**:
- ✅ Explicit error paths
- ✅ No silent failures
- ✅ Better error messages
- ⚠️ Verbose code
- ⚠️ Team learning curve

**Alternatives Considered**:
- Exceptions: Rejected due to implicit flow
- Error codes: Rejected due to lack of context

---

### ADR-008: Cloud Storage for Evidence Files

**Status**: Accepted  
**Date**: 2025-01-15

**Context**:
Construction evidence (photos, videos, documents) can be large (>10MB). Firestore has 1MB document limit.

**Decision**:
Use Firebase Cloud Storage:
- Files stored in Cloud Storage
- File metadata in Firestore
- Signed URLs for access
- Evidence linked to L1 events

**Rationale**:
- Handles large files
- Cost-effective storage
- CDN integration
- Secure access control

**Consequences**:
- ✅ Handles large files
- ✅ Cost-effective
- ✅ Fast delivery (CDN)
- ⚠️ Separate access control
- ⚠️ Orphaned file cleanup needed

**Alternatives Considered**:
- Base64 in Firestore: Rejected due to size limit
- Third-party CDN: Rejected due to complexity

---

## Summary

This document records:
- ✅ 8 major architecture decisions
- ✅ Context and rationale for each
- ✅ Consequences and trade-offs
- ✅ Alternatives considered

**Key Decisions**:
1. Three-layer event model (L0/L1/L2)
2. Firebase as backend platform
3. Angular 20 with standalone components
4. Event-driven architecture
5. Repository pattern for data access
6. Policy-based governance
7. Result pattern for errors
8. Cloud Storage for files

These decisions form the foundation of the GigHub architecture.

**Related**: [02-system-architecture.md](../system/02-system-architecture.md), [SETC-01-system-overview.md](./SETC-01-system-overview.md)
