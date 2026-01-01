# Vision & Goals

> **Why this architecture exists and what problems it solves.**

## The Problem

Traditional CRUD systems fail to answer fundamental questions:

### Questions CRUD Cannot Answer ❌
- **"Why is this task marked as Done?"** → Lost in UPDATE statement
- **"Who changed the status and when?"** → Requires separate audit table
- **"What was the decision process?"** → Not captured
- **"Can we undo this change?"** → Need complex rollback logic
- **"What happened between 2pm and 3pm yesterday?"** → Logs maybe

### Real Industry Pain Points
In construction site task management:
- Tasks change hands frequently
- Status changes need justification
- Audit trail required for compliance
- Conflict resolution needed (offline → online)
- Root cause analysis for delays
- Historical replay for reporting

---

## The Solution: Event Sourcing + Causality + Multi-View

### Core Insight
> **Instead of storing current state, store immutable facts about what happened.**

```
CRUD:           state = UPDATE(state)
Event Sourcing: facts[] = append(fact); state = replay(facts)
```

### Architecture Pillars

**1. Event Sourcing**: Record immutable facts
```typescript
TaskCreated(title, assignee)
TaskStarted(startedBy, timestamp)
TaskCompleted(completedBy, reason)
```

**2. Causality Tracking**: Know what caused each event
```typescript
{
  type: 'TaskCompleted',
  causedBy: ['TaskStarted', 'TaskApproved'], // Dependency chain
  correlationId: 'workflow-123'              // Process tracking
}
```

**3. Multi-View Projections**: Same events → multiple perspectives
```
Events → List View (status summary)
      → Board View (kanban columns)
      → Why View (event history explanation)
      → Timeline View (chronological)
```

---

## Goals

### Primary Goals ✅

**1. Traceability**
- Every state change has a reason
- Complete audit trail
- Who/What/When/Why always available

**2. Explainability**
- "Why" View shows event history with business reasoning
- Causal chains visualize decision flow
- Time-travel replay for investigation

**3. Replay Capability**
- Reconstruct state at any timestamp
- Debug by replaying production events
- Test scenarios with event simulation

**4. Time-Travel**
- View system state as it was yesterday, last week, last year
- Compare states across time
- Trend analysis over historical events

**5. Conflict Resolution**
- Eventual consistency via causality
- Merge events from offline workers
- Detect conflicts automatically

**6. Compliance & Audit**
- Immutable audit trail (events can't be deleted/modified)
- Regulatory reporting via event replay
- Tamper-evident event chain

---

## Non-Goals ❌

**1. Real-Time Trading / High-Frequency**
- Event Sourcing overhead not worth it
- Use specialized time-series DB instead

**2. Simple CRUD Apps**
- If you don't need "why", use PostgreSQL + REST
- Event Sourcing is overkill for address book

**3. Direct State Storage**
- No traditional UPDATE statements
- No mutable models

**4. Multiple Business Entities**
- Task is the ONLY business entity
- Platform entities (User, Org) are infrastructure

---

## Use Case: Construction Site Task Management

### Business Requirements
- Track task status changes (Todo → Doing → Done)
- Record who made changes and why
- Support offline workers (sync later)
- Audit trail for compliance
- Root cause analysis for delays
- Multi-view reporting (List, Board, Timeline)

### Why Event Sourcing Fits

**Requirement**: "Why is Task-123 delayed?"
**CRUD**: Check status = 'Delayed', dig through logs maybe
**Events**: Replay TaskStarted, TaskPaused, TaskResumed, TaskDelayed events with reasons

**Requirement**: "Who changed Task-456 status yesterday?"
**CRUD**: Audit table query
**Events**: Filter events by aggregateId='Task-456' and timestamp

**Requirement**: "Show me all tasks that were started but not completed in Q4"
**CRUD**: Complex SQL with date ranges
**Events**: Replay events, project to temporary view

**Requirement**: "Merge offline worker's changes"
**CRUD**: Conflict hell
**Events**: Append events with causality, resolve automatically

---

## Architecture Principles

### 1. Task as Only Business Entity
- **Task**: The single source of truth for business domain
- **Platform Entities** (User, Org, Team): Infrastructure support

### 2. Events as Only Source of Truth
- State is **always derived**
- Events are **never updated or deleted**
- Current state = replay(events)

### 3. Multiple Views = Multiple Projections
- Same event stream → different questions
- List, Board, Why, Discussion, Comment, Timeline views
- No synchronization needed (consistency by replay)

### 4. Decisions are Centralized
- All business rules in Decision Layer
- Commands validated before emitting events
- Explicit rejection capability

### 5. Causality is First-Class
- Every event has `causedBy` field
- Causal chains enable root cause analysis
- Replay respects causality order

---

## Success Criteria

This architecture succeeds when:

✅ **Any state question answerable by replay**
✅ **"Why" always traceable**
✅ **Time-travel works** (no data loss)
✅ **Offline sync conflict-free**
✅ **Audit trail complete and tamper-proof**
✅ **Developers think in events, not state**

---

## Evolution Path

### Phase 1: Platform Layer (~170 files)
- User, Organization, Team, Collaborator, Bot entities
- Platform event store & processes
- Multi-tenant infrastructure

### Phase 2: Task Domain (~100 files)
- Task events, decisions, projections
- Task processes (lifecycle, collaboration)
- Task UI (7 views)

### Phase 3: Integration & Expansion
- Platform ↔ Task integration
- Advanced projections
- Production deployment

**Total**: ~340 files for complete system

---

## Philosophical Foundation

> **"We model reality as immutable events, reason about change through causality, and make decisions via replay and simulation."**

This is not just a technical pattern—it's a way of thinking about systems that mirrors how humans reason about the world:

- Events happened and cannot be undone (immutability)
- We explain present by referencing past (causality)
- We make decisions by imagining "what if" (simulation)

---

**Version**: v2.0  
**Last Updated**: 2025-12-31
