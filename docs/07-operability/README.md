# Operability: Monitoring, Debugging, Time-Travel

> **How to run, monitor, and debug an Event Sourcing system.**

## Event Replay

### Purpose
Reconstruct state at any point in time.

### Basic Replay
```typescript
function replay(events: DomainEvent[]): State {
  let state = initState();
  
  for (const event of events) {
    state = apply(state, event);
  }
  
  return state;
}
```

### Time-Travel Replay
```typescript
function replayUntil(events: DomainEvent[], timestamp: number): State {
  return replay(events.filter(e => e.timestamp <= timestamp));
}

// Example: State at 2025-01-01 00:00
const stateAtNewYear = replayUntil(events, new Date('2025-01-01').getTime());
```

### Replay Procedures
1. Load events from Event Store
2. Filter by timestamp (optional)
3. Sort by timestamp
4. Apply events sequentially
5. Return derived state

---

## Time-Travel Debugging

### Use Cases
- **"What was the state yesterday?"** → replay(events, until: yesterday)
- **"When did this bug appear?"** → Binary search on timestamp
- **"What events caused this state?"** → Trace causal chain

### Example: Find When Task Became 'Done'
```typescript
async function findWhenTaskCompleted(taskId: string): Promise<number> {
  const events = await loadTaskEvents(taskId);
  const completedEvent = events.find(e => e.type === 'TaskCompleted');
  return completedEvent?.timestamp || 0;
}
```

### Example: Binary Search for Bug
```typescript
async function findBugIntroduction(
  events: DomainEvent[],
  isBugPresent: (state: State) => boolean
): Promise<number> {
  let left = 0;
  let right = events.length - 1;
  
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    const state = replay(events.slice(0, mid + 1));
    
    if (isBugPresent(state)) {
      right = mid; // Bug present, search earlier
    } else {
      left = mid + 1; // Bug not present, search later
    }
  }
  
  return events[left].timestamp;
}
```

---

## Snapshot & Checkpoint Strategies

### When to Use Snapshots
- Event stream &gt; 10,000 events per aggregate
- Replay time &gt; 1 second
- Frequent state reconstruction

### Snapshot Structure
```typescript
interface Snapshot {
  aggregateId: string;
  state: TaskState;
  lastEventId: string;
  timestamp: number;
}
```

### Snapshot Strategy
```typescript
async function replayWithSnapshot(aggregateId: string): Promise<State> {
  // 1. Load latest snapshot
  const snapshot = await loadLatestSnapshot(aggregateId);
  
  // 2. Load events after snapshot
  const events = await loadEventsAfter(aggregateId, snapshot?.lastEventId);
  
  // 3. Replay from snapshot
  let state = snapshot ? snapshot.state : initState();
  for (const event of events) {
    state = apply(state, event);
  }
  
  // 4. Save new snapshot every 1000 events
  if (events.length >= 1000) {
    await saveSnapshot({
      aggregateId,
      state,
      lastEventId: events[events.length - 1].id,
      timestamp: Date.now()
    });
  }
  
  return state;
}
```

### Snapshot Best Practices
- ✅ Snapshot every N events (1000-10000)
- ✅ Keep snapshots as separate concern (not in event stream)
- ✅ Validate snapshot integrity on load
- ✅ Clean up old snapshots periodically

---

## Monitoring & Observability

### Key Metrics

**Event Store Metrics**:
- Events written per second
- Event store latency (p50, p95, p99)
- Storage size growth rate
- Failed writes count

**Projection Metrics**:
- Projection rebuild time
- Projection lag (time behind event stream)
- Projection errors count
- Cache hit ratio

**Decision Metrics**:
- Command approval rate
- Command rejection rate
- Decision latency

### Example: Monitoring Dashboard
```typescript
interface SystemMetrics {
  eventStore: {
    eventsPerSecond: number;
    latencyP95: number;
    storageGB: number;
  };
  projections: {
    rebuildTime: number;
    lagSeconds: number;
    errors: number;
  };
  decisions: {
    approvalRate: number;
    rejectionRate: number;
  };
}
```

### Alerting Rules
```
Alert: Event store latency > 1s
Alert: Projection lag > 60s
Alert: Decision rejection rate > 50%
Alert: Event write failures > 0
```

---

## Performance Considerations

### Event Store Optimization
- **Indexing**: Index on aggregateId, timestamp, type
- **Partitioning**: Partition by aggregateId or date
- **Compression**: Compress event data (JSON → gzip)
- **Caching**: Cache recent events in-memory

### Projection Optimization
- **Incremental Updates**: Only replay new events
- **Parallel Projections**: Run projections concurrently
- **Materialized Views**: Pre-compute and cache results
- **Lazy Loading**: Load projections on-demand

### Scaling Event Store
- **Read Replicas**: Scale reads with replicas
- **Write Sharding**: Shard writes by aggregateId
- **Event Bus**: Use message queue for event distribution
- **CDN**: Serve static projections from CDN

---

## Dev Tools Usage

### Core Tester Widget

**Location**: `src/app/dev-tools/`

**Features**:
- Test Foundation modules (Identity, Time, Validation)
- Test Governance modules (Policy, Authorization)
- Test Observability modules (Event Bus, Causality Tracking)
- Integration test end-to-end

**Usage**:
```bash
npm start
# Open http://localhost:4200
# Click "Dev Tools" in sidebar
# Run tests
```

### Playwright E2E Tests

**Location**: `e2e/`

**Features**:
- Test event flow (Command → Decision → Event → Projection → UI)
- Test UI integration with Signals
- Test causality tracking
- Test time-travel replay

**Usage**:
```bash
npm run e2e
# 7/7 tests passing
```

---

## Debugging Workflows

### Debug Event Flow
```
1. Command submitted
2. Decision function called
   → Log: command, events loaded, validation result
3. Event emitted (or rejected)
   → Log: event data, causedBy, correlationId
4. Event stored
   → Log: storage confirmation, event ID
5. Projection updated
   → Log: projection name, new state
6. UI notified
   → Log: Signal update, component re-render
```

### Debug Tools
- **Event Log Viewer**: View all events chronologically
- **Causal Chain Visualizer**: See event dependencies
- **Projection Comparator**: Compare projection results
- **Time-Travel Inspector**: Step through events

---

## Production Checklist

### Before Deployment
- [ ] Event store indexes created
- [ ] Snapshot strategy implemented
- [ ] Monitoring dashboards configured
- [ ] Alerting rules defined
- [ ] Backup/restore procedures tested
- [ ] Event schema versioning in place
- [ ] Performance tests passed (&lt;1s projection rebuild)
- [ ] Disaster recovery plan documented

### After Deployment
- [ ] Monitor event write latency
- [ ] Monitor projection lag
- [ ] Monitor decision rejection rates
- [ ] Set up log aggregation (Firestore logs)
- [ ] Configure alerting thresholds
- [ ] Schedule snapshot cleanup jobs

---

## Tech Stack Reference

| Component | Technology |
|-----------|-----------|
| Event Store | Firebase/Firestore |
| Auth | Firebase Auth |
| Storage | Firebase Storage |
| Functions | Firebase Cloud Functions |
| UI | Angular 20 + Signals |
| State | RxJS 7.8.x |
| Testing | Playwright E2E |
| Dev Tools | Core Tester Widget |

---

**Version**: v2.0  
**Last Updated**: 2025-12-31
