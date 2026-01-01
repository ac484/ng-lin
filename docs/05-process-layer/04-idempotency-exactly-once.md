# 冪等性與恰好一次 (Idempotency & Exactly-Once)

## 冪等性保證

### 事件處理冪等
```typescript
class IssueListProjection {
  private processedEvents = new Set<string>();
  
  on(event: IssueCreatedEvent) {
    if (this.processedEvents.has(event.id)) {
      return; // 已處理，跳過
    }
    this.issues.push({ id: event.aggregateId, ... });
    this.processedEvents.add(event.id);
  }
}
```

### Aggregate 冪等
```typescript
class IssueAggregate {
  close(): Result<IssueClosedEvent> {
    if (this.status === 'closed') {
      return Result.Err('Already closed'); // 冪等
    }
    return Result.Ok(new IssueClosedEvent({ aggregateId: this.id }));
  }
}
```

## Exactly-Once 語義

### 樂觀鎖定
```typescript
interface EventStoreEntry {
  aggregateId: string;
  version: number;  // 版本號
  event: DomainEvent;
}

class EventStore {
  async append(event: DomainEvent): Promise<Result<void>> {
    const current = await this.getVersion(event.aggregateId);
    if (event.version !== current + 1) {
      return Result.Err('Concurrency conflict');
    }
    await this.save(event);
    return Result.Ok(undefined);
  }
}
```

### 去重處理
```typescript
class EventBus {
  private seen = new Map<string, number>();
  
  publish(event: CausalEvent) {
    const key = `${event.aggregateId}:${event.version}`;
    if (this.seen.has(key)) {
      return; // 重複事件，跳過
    }
    this.seen.set(key, Date.now());
    this.doPublish(event);
  }
}
```

## At-Least-Once + Idempotency

```
At-Least-Once Delivery (可能重複)
         +
Idempotent Processing (冪等處理)
         =
Exactly-Once Semantics (恰好一次語義)
```

### 實作策略
```typescript
// 1. 事件攜帶唯一 ID
class DomainEvent {
  id: string = generateUUID();
}

// 2. Handler 檢查重複
class Handler {
  private processed = new Set<string>();
  
  handle(event: DomainEvent) {
    if (this.processed.has(event.id)) return;
    this.doHandle(event);
    this.processed.add(event.id);
  }
}
```

## 分散式冪等

### 使用外部儲存
```typescript
class DistributedIdempotencyChecker {
  async isProcessed(eventId: string): Promise<boolean> {
    return await redis.exists(`processed:${eventId}`);
  }
  
  async markProcessed(eventId: string): Promise<void> {
    await redis.set(`processed:${eventId}`, '1', 'EX', 86400);
  }
}
```

### TTL 管理
```typescript
// 保留 24 小時的去重記錄
const TTL = 24 * 60 * 60;

// 定期清理過期記錄
setInterval(() => {
  const expired = findExpired(Date.now() - TTL);
  processedEvents.delete(...expired);
}, 3600000);
```

---

**參考**: [Saga](./saga-process-manager.md) | [補償](./compensation.md)
