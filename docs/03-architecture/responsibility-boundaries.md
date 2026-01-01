# 職責邊界 (Responsibility Boundaries)

## 各層「能/不能」做什麼

### L0 (Fact Layer) 職責

**✅ 能做**:
- 定義事件結構與型別
- 驗證業務不變式 (invariants)
- 定義 Aggregate 邊界
- 定義 Value Object
- 執行單一 Aggregate 的業務規則

**❌ 不能做**:
- 包含 if/else 流程邏輯
- 呼叫外部服務
- 查詢其他 Aggregate
- 產生隨機數或時間戳
- 包含任何副作用

**範例**:
```typescript
// ✅ GOOD: Pure domain logic
class IssueAggregate {
  close(closedBy: EntityId): Result<IssueClosedEvent> {
    if (this.status === 'closed') {
      return Result.Err('Already closed');
    }
    return Result.Ok(new IssueClosedEvent({
      aggregateId: this.id,
      closedBy
    }));
  }
}

// ❌ BAD: Contains external dependencies
class IssueAggregate {
  close() {
    this.notificationService.notify(); // NO!
  }
}
```

### L1 (Process Layer) 職責

**✅ 能做**:
- 連接多個事件
- 執行條件邏輯 (if/else)
- 編排跨 Aggregate 流程
- 發布新事件
- 呼叫外部服務
- 處理補償邏輯

**❌ 不能做**:
- 直接修改 Aggregate 狀態
- 查詢 Projection
- 成為「上帝 Saga」(God Saga)
- 包含所有業務規則

**範例**:
```typescript
// ✅ GOOD: Orchestration
class IssueWorkflowSaga {
  on(event: IssueCreatedEvent) {
    if (event.priority === 'critical') {
      this.eventBus.publish(new NotifyTeamEvent({
        causedBy: event
      }));
    }
  }
}

// ❌ BAD: Query projection
class IssueWorkflowSaga {
  on(event: IssueCreatedEvent) {
    const openIssues = this.projection.queryOpen(); // NO!
  }
}
```

### L2 (Projection Layer) 職責

**✅ 能做**:
- 從事件衍生狀態
- 優化查詢結構
- 提供特化視圖
- 快取計算結果
- 實現 CQRS 的 Query 端

**❌ 不能做**:
- 發布事件
- 執行業務邏輯
- 成為真實來源 (Source of Truth)
- 直接修改事件流

**範例**:
```typescript
// ✅ GOOD: Derive state
class IssueListProjection {
  on(event: IssueCreatedEvent) {
    this.list.push({ id: event.aggregateId, ... });
  }
  
  queryOpen(): Issue[] {
    return this.list.filter(i => i.status === 'open');
  }
}

// ❌ BAD: Publish events
class IssueListProjection {
  on(event: IssueCreatedEvent) {
    this.eventBus.publish(new ListUpdatedEvent()); // NO!
  }
}
```

## 跨層互動規則

### Command → Event Flow
```
UI → Command → Aggregate (L0)
              ↓
         Domain Event
              ↓
         Event Store
              ↓
      ┌──────┴──────┐
      ▼             ▼
   Saga (L1)   Projection (L2)
```

### Query Flow
```
UI → Query → Projection (L2) → Read Model
```

## 邊界檢查清單

### Aggregate (L0)
- [ ] 無外部依賴注入
- [ ] 方法返回 Result<Event>
- [ ] 無隨機數/時間戳生成
- [ ] 無 console.log 或 alert

### Saga (L1)
- [ ] 僅訂閱/發布事件
- [ ] 無直接狀態修改
- [ ] 無查詢 Projection
- [ ] 有清晰的流程語義

### Projection (L2)
- [ ] 僅訂閱事件
- [ ] 無發布事件
- [ ] 無業務規則
- [ ] 可隨時重建

---

**參考**：[分層模型](./layering-model.md) | [資料流](./data-flow.md)
