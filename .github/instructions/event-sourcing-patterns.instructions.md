---
description: 'Event Sourcing patterns for Causality-Driven systems'
applyTo: '**/*.ts'
---

# Event-Sourcing Pattern Instructions

## When Creating Events

**ALWAYS include causality metadata:**
```typescript
interface DomainEvent<T> {
  id: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  data: T;
  metadata: {
    causedBy: string;          // Parent event ID
    causedByUser: string;       // User who triggered
    causedByAction: string;     // Action that caused this
    timestamp: Timestamp;
    blueprintId: string;        // Multi-tenant boundary
  };
}
```

**NEVER:**
- Modify past events
- Omit causality metadata
- Break Blueprint boundary

## When Creating Aggregates

**ALWAYS:**
```typescript
export class TaskAggregate {
  private events: DomainEvent[] = [];
  
  static replayFrom(events: DomainEvent[]): TaskAggregate {
    const task = new TaskAggregate();
    events.forEach(e => task.apply(e));
    return task;
  }
  
  private apply(event: DomainEvent): void {
    // Deterministic state update
  }
}
```

## When Querying Firestore

**ALWAYS include Blueprint filter:**
```typescript
// ❌ BAD
const tasks = await getDocs(collection(db, 'tasks'));

// ✅ GOOD  
const tasks = await getDocs(
  query(
    collection(db, 'tasks'),
    where('blueprintId', '==', currentBlueprintId)
  )
);
```
