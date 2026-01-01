# Event Anti-Patterns

> Based on [Disable.md](../Causality-Driven%20Event-Sourced%20Process%20System/Disable.md)

## ❌ High-Frequency Events

**Examples**: `PriceUpdated` (every ms), `OrderBookChanged`, `MouseMoved`, `SensorDataReceived`

**Why Bad**: Event store bloat, slow replay, no business meaning, storage costs

**Alternative**: Sample/aggregate → `PriceSummaryCalculated` (hourly), `OrderBookSnapshot` (every 1000 changes)

---

## ❌ UI Interaction Events

**Examples**: `ButtonClicked`, `ModalOpened`, `TabSwitched`, `PageScrolled`

**Why Bad**: Not business facts, no replay value, UI coupling

**Alternative**: Record **outcome**: `TaskStarted` ✅ (not `StartButtonClicked` ❌)

---

## ❌ Technical Error Events

**Examples**: `DatabaseErrorOccurred`, `HttpRequestFailed`, `RetryStarted`, `ConnectionLost`

**Why Bad**: Not business facts, pollutes domain, infrastructure concern

**Alternative**: Use logging (ELK, Splunk), monitoring (Prometheus), emit business fact: `PaymentFailed` ✅

---

## ❌ I/O Operation Events

**Examples**: `HttpRequestSent`, `EmailSent`, `ApiCallMade`, `FileWritten`

**Why Bad**: Event = decision boundary, not observation; no replay value

**Alternative**: Record **decision**: `NotificationScheduled` ✅ (not `EmailSent` ❌)

---

## ❌ Multiple Business Entities

**Examples in ng-lin**: ~~`Project`~~, ~~`Sprint`~~, ~~`Repository`~~ ❌

**Why Bad**: Violates single entity principle, complex state, sync issues

**ng-lin Rule**: **Task is ONLY business entity** ✅; Platform (User/Org/Team) = infrastructure, not domain

---

## ❌ Meaningless Events

**Examples**: `EntityUpdated`, `StatusChanged`, `DataSynced`, `RecordModified`

**Why Bad**: No business meaning, can't replay intelligently, lost context

**Alternative**: Be specific → `TaskAssigned` ✅ (not `TaskUpdated` ❌)

---

## ❌ Event as Data Sync

**Examples**: `UserEntityUpdated`, `CacheInvalidated`, `ReplicaUpdated`

**Why Bad**: Events for business, not technical sync; pollutes domain

**Alternative**: Use CDC for DB sync, projection rebuild for CQRS read models

---

## ❌ Events Without Causality

**Example**:
```typescript
// ❌ Bad
{ id: '123', type: 'TaskStarted', causedBy: [] }

// ✅ Good
{ id: '123', type: 'TaskStarted', causedBy: ['122'] }
```

**Why Bad**: Breaks causal chain, no root cause analysis, undefined replay order

---

## ❌ Mutable Events

**Problem**: Updating/deleting events after persistence

**Why Bad**: Violates immutability, destroys audit trail, replay corruption

**Fix**: Events are **append-only**; emit compensating event: `TaskDescriptionCorrected` ✅

---

## Summary

| Anti-Pattern | Don't | Do |
|--------------|-------|------|
| High-frequency | `PriceUpdated` (ms) | `PriceSummaryCalculated` (hourly) |
| UI events | `ButtonClicked` | `TaskStarted` (outcome) |
| Technical errors | `DatabaseErrorOccurred` | Log infrastructure |
| I/O ops | `HttpRequestSent` | `NotificationScheduled` |
| Multiple entities | `Project`, `Sprint` | Task only ✅ |
| Meaningless | `EntityUpdated` | `TaskAssigned` |
| Data sync | `CacheInvalidated` | Use CDC |
| No causality | `causedBy: []` | Reference predecessors |
| Mutable | Edit/delete | Append compensating |

---

**Reference**: [Disable.md](../Causality-Driven%20Event-Sourced%20Process%20System/Disable.md)  
**Last Updated**: 2025-12-31

