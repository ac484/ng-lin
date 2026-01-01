# 性能考量 (Performance Considerations)

## 關鍵指標

### 1. Event Throughput
- 目標: >1000 events/sec
- 瓶頸: Event Store 寫入速度

### 2. Query Latency
- 目標: P95 < 50ms
- 優化: Projection + 索引

### 3. Replay Speed
- 目標: >10000 events/sec
- 優化: 批次處理 + 快照

## 優化策略

### 快照 (Snapshot)
```typescript
class SnapshotManager {
  async saveSnapshot(aggregate: IssueAggregate) {
    await storage.save(`snapshot:${aggregate.id}`, {
      version: aggregate.version,
      state: aggregate.toJSON(),
      timestamp: Date.now()
    });
  }
  
  async loadWithSnapshot(aggregateId: string) {
    const snapshot = await storage.get(`snapshot:${aggregateId}`);
    if (!snapshot) {
      return await this.loadFromEvents(aggregateId);
    }
    
    const events = await eventStore.getEventsSince(
      aggregateId,
      snapshot.version
    );
    
    const aggregate = IssueAggregate.fromJSON(snapshot.state);
    events.forEach(e => aggregate.apply(e));
    return aggregate;
  }
}
```

### 批次處理
```typescript
class BatchProcessor {
  private batch: CausalEvent[] = [];
  
  add(event: CausalEvent) {
    this.batch.push(event);
    
    if (this.batch.length >= 100) {
      this.flush();
    }
  }
  
  async flush() {
    await eventStore.appendBatch(this.batch);
    this.batch = [];
  }
}
```

### 索引優化
```typescript
// Firestore 索引
await db.collection('events').createIndex({
  aggregateId: 1,
  version: 1
});

await db.collection('events').createIndex({
  timestamp: 1,
  type: 1
});
```

### Projection 快取
```typescript
class CachedProjection {
  private cache = new Map();
  
  async query(filter: IssueFilter): Promise<Issue[]> {
    const key = JSON.stringify(filter);
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    
    const result = await this.doQuery(filter);
    this.cache.set(key, result);
    
    // 5 分鐘後失效
    setTimeout(() => this.cache.delete(key), 300000);
    
    return result;
  }
}
```

## 性能監控

```typescript
class PerformanceMonitor {
  async measureEventProcessing(event: CausalEvent) {
    const start = performance.now();
    
    await handler.handle(event);
    
    const duration = performance.now() - start;
    metrics.record('event.processing.duration', duration, {
      type: event.type
    });
  }
}
```

## 負載測試

```typescript
async function loadTest() {
  const events = generateEvents(10000);
  const start = Date.now();
  
  await Promise.all(
    events.map(e => eventBus.publish(e))
  );
  
  const duration = Date.now() - start;
  const throughput = events.length / (duration / 1000);
  
  console.log(`Throughput: ${throughput} events/sec`);
}
```

---

**參考**: [可觀測性](./observability.md) | [失敗處理](./failure-handling.md)
