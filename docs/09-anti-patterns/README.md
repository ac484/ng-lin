# Anti-Patterns: What NOT to Do

> **Preventing mistakes is more valuable than describing best practices.**

These anti-patterns will break your Event Sourcing system. Learn them to avoid disaster.

---

## 1. Pure I/O / Technical Events ❌

### Anti-Pattern
```typescript
// ❌ DON'T: Technical infrastructure events
HttpRequestSent
TcpRetryHappened
DatabaseConnectionOpened
CacheInvalidated
ApiTimeoutOccurred
```

### Why It's Wrong
- These are **HOW**, not **WHAT**
- No business value
- Replay is meaningless
- Event store will explode

### Correct Alternative ✅
```typescript
// ✅ DO: Business-meaningful outcomes
OrderPlacementFailed(reason: 'ExchangeUnavailable')
TaskSyncCompleted(syncedCount: 10)

// Technical errors → Result/Either types
type Result<T, E> = { ok: true, value: T } | { ok: false, error: E };
```

**Rule**: Events describe business facts, not technical operations.

---

## 2. UI Operation Events ❌

### Anti-Pattern
```typescript
// ❌ DON'T: Record UI interactions
ButtonClicked
ModalOpened
TabSwitched
CheckboxChecked
FormFieldChanged
```

### Why It's Wrong
- UI actions ≠ business intentions
- One intention may have 10 UI actions
- Replay meaningless

### Correct Alternative ✅
```typescript
// ✅ DO: Commands that express intent
UI Action        → Command         → Event
Click "Start"    → StartTaskCommand → TaskStarted
Click "Complete" → CompleteTaskCommand → TaskCompleted
```

**Rule**: Events represent business outcomes, not user interactions.

---

## 3. High-Frequency Low-Value Events ❌

### Anti-Pattern
```typescript
// ❌ DON'T: Record every tiny change
PriceUpdated (every market tick)
OrderBookChanged (every update)
HeartbeatReceived (every second)
MouseMoved
PixelRendered
```

### Why It's Wrong
- Event store explosion
- Replay cost uncontrollable
- Causal value low

### Correct Alternative ✅
```typescript
// ✅ DO: Record decision points only
PriceUpdated        → NO
StrategySignalGenerated → YES

// Market data → Time-series database
// Events → Decision boundaries
```

**Rule**: Events are facts worth remembering, not continuous observations.

---

## 4. Derived/Cache/Projection State Events ❌

### Anti-Pattern
```typescript
// ❌ DON'T: Create events for derived state
ProjectionUpdated
CacheRefreshed
ViewModelChanged
AggregatedSummaryRecalculated
```

### Why It's Wrong
- These are **results**, not facts
- Can be recomputed anytime
- Circular dependency risk

### Correct Alternative ✅
```typescript
// ✅ DO: Projections are derived, not stored as events
Events: TaskCreated, TaskStarted, TaskCompleted
Projection: replay(events) → current state

// Cache invalidation ≠ domain event
```

**Rule**: Events are source, projections are sinks.

---

## 5. Technical Error Events ❌

### Anti-Pattern
```typescript
// ❌ DON'T: Technical failures as events
DatabaseErrorOccurred
JsonParseFailed
NetworkTimeoutHappened
NullPointerException
```

### Why It's Wrong
- Technical errors ≠ business facts
- No replay value
- Pollutes event stream

### Correct Alternative ✅
```typescript
// ❌ Technical: ApiTimeoutOccurred
// ✅ Business: OrderPlacementFailed(reason: 'ExchangeUnavailable')

// Handle technical errors with Result types
type Result<T> = Success<T> | Failure<Error>;
```

**Rule**: Events must be understandable by business people.

---

## 6. Query Events ❌

### Anti-Pattern
```typescript
// ❌ DON'T: Record queries as events
BalanceFetched
TaskListRequested
UserProfileViewed
ReportGenerated
```

### Why It's Wrong
- Queries don't change the world
- Events represent state changes

### Correct Alternative ✅
```typescript
// Query = side-effect free read
function getBalance(): number {
  return replay(events).balance;
}

// Only state changes are events
```

**Rule**: If it doesn't change state, it's not an event.

---

## 7. Draft/Temporary/Preview State ❌

### Anti-Pattern
```typescript
// ❌ DON'T: Events for uncommitted state
DraftCreated
DraftModified
DraftDeleted
PreviewGenerated
ValidationPassed
```

### Why It's Wrong
- Events are immutable facts
- Drafts can be discarded
- Creates event pollution

### Correct Alternative ✅
```typescript
// ✅ DO: Use in-memory state for drafts
// Only emit event when committed
TaskDraftEdited     → NO (use component state)
TaskCreated         → YES (when user commits)
```

**Rule**: Events represent confirmed facts, not intentions.

---

## 8. Cross-Aggregate Convenience Events ❌

### Anti-Pattern
```typescript
// ❌ DON'T: One event affecting multiple aggregates
UserAndTeamAndOrgUpdated(userId, teamId, orgId)
SyncAllEntities()
```

### Why It's Wrong
- Causality nightmare
- Replay order fragile
- Tight coupling

### Correct Alternative ✅
```typescript
// ✅ DO: One event → One aggregate
UserUpdated(userId)
  → triggers Saga
    → TeamUpdated(teamId)
      → triggers Saga
        → OrgUpdated(orgId)
```

**Rule**: Events respect aggregate boundaries.

---

## 9. Events Just for Data Sync ❌

### Anti-Pattern
```typescript
// ❌ DON'T: Use events as replication mechanism
DataSynced
EntityReplicated
TableCopied
```

### Why It's Wrong
- Event ≠ replication
- Schema coupling
- Replay impossible

### Correct Alternative ✅
```typescript
// ✅ DO: Use proper sync mechanisms
// Events → Business facts
// Replication → CDC / Outbox / API
```

**Rule**: Events have business meaning, not technical sync purpose.

---

## 10. Events Without Business Semantics ❌

### Anti-Pattern
```typescript
// ❌ DON'T: Generic meaningless events
EntityUpdated
StatusChanged
DataModified
```

### Why It's Wrong
- Doesn't answer "what happened?"
- Replay requires guesswork
- No business insight

### Correct Alternative ✅
```typescript
// ❌ StatusChanged
// ✅ TaskStarted, TaskCompleted, TaskArchived

// Each event tells a story
```

**Rule**: Event names are sentences (TaskStarted = "The task was started").

---

## 11. Multiple Business Entities ❌

### Anti-Pattern
```typescript
// ❌ DON'T: Multiple business domains
Task, Issue, Ticket, WorkItem, Todo

// This violates the core architecture guarantee
```

### Why It's Wrong
- **Architecture violation**: Task is the ONLY business entity
- Cognitive overhead
- Inconsistent modeling

### Correct Alternative ✅
```typescript
// ✅ DO: Single business entity (Task)
// Platform entities (User, Org, Team) are infrastructure

TaskDomain: Task (only business entity)
PlatformLayer: User, Org, Team, Collaborator, Bot (infrastructure)
```

**Rule**: Task is the ONLY business entity in this system.

---

## Quick Rejection Checklist

Before creating an event, ask:

- [ ] Is this an **immutable fact** (not technical operation)?
- [ ] Does it have **business meaning** (not UI action)?
- [ ] Will it still matter **10 years later** (not cache update)?
- [ ] Can **business people** understand it (not DatabaseError)?
- [ ] Does it **change state** (not query)?
- [ ] Is it **confirmed** (not draft)?
- [ ] Does it respect **aggregate boundaries** (single entity)?
- [ ] Does it belong to **Task domain** (not another entity)?

**If ANY answer is NO** → It's probably not an event.

---

## Common Symptoms of Bad Events

🚨 Event store growing too fast
🚨 Replay taking too long
🚨 Events with meaningless names
🚨 Handlers with 300+ lines of switch cases
🚨 Events constantly being versioned/migrated
🚨 Team confusion about when to emit events

---

## Core Principles (Repeat)

> **Events record decisions, not observations.**
> **Events describe what happened, not how it happened.**
> **Events are business facts, not technical logs.**
> **Task is the ONLY business entity.**

---

**Version**: v2.0  
**Last Updated**: 2025-12-31
