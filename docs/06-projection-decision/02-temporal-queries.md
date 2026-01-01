# 時間查詢 (Temporal Queries)

## 時間點查詢 (Point-in-Time)

查詢特定時間點的系統狀態。

### 實作
```typescript
class TemporalQuery {
  async getStateAt(aggregateId: string, timestamp: Date): Promise<IssueAggregate> {
    const events = await eventStore.getEvents(aggregateId, {
      until: timestamp
    });
    const aggregate = new IssueAggregate();
    events.forEach(e => aggregate.apply(e));
    return aggregate;
  }
}

// 使用
const issueAt2024 = await temporalQuery.getStateAt('issue:123', new Date('2024-01-01'));
```

## 時間區間查詢 (Range Query)

查詢時間區間內的變化。

```typescript
async getChanges(aggregateId: string, from: Date, to: Date) {
  return await eventStore.getEvents(aggregateId, {
    from,
    to
  });
}

// 使用: 查詢 2024 年第一季的所有變更
const changes = await temporalQuery.getChanges(
  'issue:123',
  new Date('2024-01-01'),
  new Date('2024-04-01')
);
```

## 因果查詢 (Causal Query)

追蹤事件的因果鏈。

```typescript
async getCausalChain(eventId: string): Promise<CausalEvent[]> {
  const chain: CausalEvent[] = [];
  let current = await eventStore.getEvent(eventId);
  
  while (current) {
    chain.push(current);
    if (!current.causedBy) break;
    current = await eventStore.getEvent(current.causedBy);
  }
  
  return chain.reverse();
}
```

## 模擬查詢 (What-If Query)

模擬事件對未來的影響。

```typescript
async simulate(aggregate: IssueAggregate, hypotheticalEvents: DomainEvent[]) {
  const clone = aggregate.clone();
  hypotheticalEvents.forEach(e => clone.apply(e));
  return clone;
}

// 使用: 模擬關閉 issue 的影響
const closedIssue = await simulator.simulate(issue, [
  new IssueClosedEvent({ aggregateId: issue.id })
]);
```

## 性能優化

### 快照 (Snapshot)
```typescript
class EventStore {
  async loadWithSnapshot(aggregateId: string) {
    const snapshot = await this.getLatestSnapshot(aggregateId);
    const events = await this.getEventsSince(aggregateId, snapshot.version);
    
    const aggregate = snapshot.state;
    events.forEach(e => aggregate.apply(e));
    return aggregate;
  }
}
```

### 索引
```typescript
// 建立時間索引
await db.createIndex('events', {
  aggregateId: 1,
  timestamp: 1
});

// 建立因果索引
await db.createIndex('events', {
  causedBy: 1
});
```

---

**參考**: [投影原則](./projection-principles.md) | [因果圖](./causal-graph.md)
