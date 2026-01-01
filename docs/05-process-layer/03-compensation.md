# 補償 (Compensation)

## Self-Healing 機制

在分散式事件系統中，補償不是「回滾」，而是透過新的補償事件來修正狀態。

## 補償原則

### 1. 補償是正向操作
```typescript
// ❌ 錯誤: 刪除原事件
await eventStore.delete(originalEvent);

// ✅ 正確: 發布補償事件
eventBus.publish(new IssueReopenedEvent({
  aggregateId: issue.id,
  reason: 'Incorrectly closed',
  causedBy: originalCloseEvent.id
}));
```

### 2. 補償事件包含因果
```typescript
class CompensationEvent extends CausalEvent {
  compensates: string;  // 被補償的事件 ID
  reason: string;       // 補償原因
}
```

### 3. 冪等補償
```typescript
class IssueAggregate {
  reopen(reason: string): Result<IssueReopenedEvent> {
    if (this.status !== 'closed') {
      return Result.Err('Cannot reopen non-closed issue');
    }
    return Result.Ok(new IssueReopenedEvent({ aggregateId: this.id, reason }));
  }
}
```

## 補償策略

### 即時補償
```typescript
saga.on(PaymentFailedEvent, (event) => {
  // 立即發布補償事件
  eventBus.publish(new RefundIssuedEvent({ causedBy: event }));
});
```

### 延遲補償
```typescript
saga.on(OrderTimeoutEvent, (event) => {
  // 等待一段時間後補償
  setTimeout(() => {
    eventBus.publish(new OrderCancelledEvent({ causedBy: event }));
  }, 60000);
});
```

### 手動補償
```typescript
// 人工介入觸發補償
admin.compensate(orderId, reason);
// → OrderManuallyCompensatedEvent
```

## 補償範例

```typescript
// 1. 原始操作
IssueClosedEvent

// 2. 發現錯誤
IssueIncorrectlyClosedDetectedEvent

// 3. 補償操作
IssueReopenedEvent (compensates: IssueClosedEvent.id)

// 4. 修正操作
IssueReassignedEvent
```

## 自我修復流程

```typescript
class SelfHealingSaga {
  on(event: InconsistencyDetectedEvent) {
    // 1. 分析不一致
    const root = this.analyzer.findRoot(event);
    
    // 2. 生成補償計劃
    const plan = this.planner.createPlan(root);
    
    // 3. 執行補償
    for (const step of plan) {
      eventBus.publish(step.compensationEvent);
    }
  }
}
```

---

**參考**: [Saga](./saga-process-manager.md) | [冪等性](./idempotency-exactly-once.md)
