# 投影原則 (Projection Principles)

## Projection 不是 Truth

**核心原則**: 投影是衍生的、可重建的、可丟棄的。

### ✅ 投影是什麼
- 從事件流衍生的讀模型
- 為查詢優化的資料結構
- 可隨時重建的快取

### ❌ 投影不是什麼
- **不是真實來源** (Source of Truth)
- **不發布事件**
- **不執行業務邏輯**
- **不修改事件流**

## 實作原則

### 1. 可重建性
```typescript
class IssueListProjection {
  async rebuild() {
    this.issues.clear();
    const events = await eventStore.getAllEvents('issue');
    events.forEach(e => this.on(e));
  }
}
```

### 2. 最終一致性
```typescript
// Event Store (強一致)
await eventStore.append(event);

// Projection (最終一致，非同步更新)
eventBus.on('IssueCreated', (event) => {
  setTimeout(() => projection.on(event), 100);
});
```

### 3. 特化視圖
```typescript
// 不同查詢需求使用不同投影
class IssueListProjection { ... }      // 列表查詢
class IssueStatsProjection { ... }     // 統計查詢
class IssueSearchProjection { ... }    // 全文檢索
```

## Anti-Pattern

### ❌ 投影作為真實來源
```typescript
// 錯誤: 從投影讀取後修改事件
const issue = await projection.getIssue(id);
await eventStore.append(new IssueUpdatedEvent({ ...issue }));
```

### ✅ 正確做法
```typescript
// 從事件流重建狀態
const aggregate = await eventStore.load('issue', id);
const result = aggregate.update(data);
await eventStore.append(result.value);
```

## 投影策略

### 即時投影
```typescript
eventBus.on('IssueCreated', (e) => projection.on(e));
```

### 批次投影
```typescript
setInterval(async () => {
  const events = await eventStore.getNewEvents();
  events.forEach(e => projection.on(e));
}, 5000);
```

### 快照投影
```typescript
async snapshot() {
  await storage.save('projection:snapshot', this.state);
}

async restore() {
  this.state = await storage.load('projection:snapshot');
}
```

---

**參考**: [時間查詢](./temporal-queries.md) | [模擬引擎](./simulation-engine.md)
