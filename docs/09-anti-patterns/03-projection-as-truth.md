# Anti-Pattern: Projection as Truth

## 問題

將 Projection 視為真實來源 (Source of Truth)。

## 症狀

```typescript
// ❌ BAD: Using Projection as Truth
class IssueService {
  async closeIssue(id: string) {
    // 從 Projection 讀取
    const issue = await projection.getIssue(id);
    
    // 直接使用 Projection 資料建立事件
    await eventStore.append(new IssueClosedEvent({
      aggregateId: id,
      title: issue.title,  // 來自 Projection!
      status: issue.status  // 來自 Projection!
    }));
  }
}
```

**問題**:
- Projection 可能不一致
- Projection 可能過期
- Projection 可能損壞
- 無法保證資料正確性

## 正確做法

```typescript
// ✅ GOOD: Event Store as Truth
class IssueService {
  async closeIssue(id: string) {
    // 從 Event Store 重建 Aggregate
    const aggregate = await eventStore.load('issue', id);
    
    // Aggregate 包含正確的狀態
    const result = aggregate.close();
    
    if (result.isOk()) {
      await eventStore.append(result.value);
    }
  }
}
```

## 資料流向

```
正確:
Event Store → (replay) → Aggregate → (command) → New Event → Event Store

錯誤:
Event Store → (async) → Projection → (read) → New Event → Event Store
             可能不一致 ↑
```

## 常見錯誤

### 1. Projection 作為查詢來源用於寫入
```typescript
// ❌ BAD
const currentStatus = await projection.getStatus(id);
if (currentStatus === 'open') {
  await eventStore.append(new IssueClosedEvent({...}));
}

// ✅ GOOD
const aggregate = await eventStore.load('issue', id);
const result = aggregate.close();
if (result.isOk()) {
  await eventStore.append(result.value);
}
```

### 2. 依賴 Projection 的計算結果
```typescript
// ❌ BAD
const count = await projection.getOpenIssueCount();
if (count > 10) {
  await eventStore.append(new WorkloadHighEvent({...}));
}

// ✅ GOOD
// 從事件計算，或使用 Saga 訂閱事件
saga.on(IssueCreatedEvent) {
  const events = await eventStore.getEvents('workload');
  const count = this.computeCount(events);
  if (count > 10) {
    eventBus.publish(new WorkloadHighEvent({...}));
  }
}
```

## 修復指南

1. **審查所有寫入路徑**
   - 檢查是否使用 Projection 資料
   - 改為從 Event Store 重建 Aggregate

2. **分離讀寫**
   - 讀取：使用 Projection (Query)
   - 寫入：使用 Aggregate (Command)

3. **驗證一致性**
   - 定期比對 Event Store 與 Projection
   - 偵測不一致並重建 Projection

---

**參考**: [投影原則](../06-projection-decision/projection-principles.md)
