# 分層模型 (Layering Model)

## L0 / L1 / L2 定義

### L0: Fact Layer（事實層）

**職責**: 定義不可變事實

```typescript
// Event = Fact（已發生的事情）
class IssueCreatedEvent extends CausalEvent {
  readonly aggregateId: EntityId;
  readonly title: string;
  readonly createdBy: EntityId;
}
```

**特徵**:
- ✅ 不可變、純資料、無副作用
- ❌ 無 if/else、無流程邏輯

**範例**: `CausalEvent`, `Entity`, `Aggregate`, `ValueObject`

### L1: Process Layer（流程層）

**職責**: 連接事件、編排流程

```typescript
// Saga/Process Manager
class IssueWorkflowSaga {
  on(event: IssueCreatedEvent) {
    if (event.priority === 'critical') {
      this.eventBus.publish(new NotifyTeamEvent({ causedBy: event }));
    }
  }
}
```

**特徵**:
- ✅ 條件邏輯、連接事件、編排流程
- ❌ 不直接修改狀態、不查詢投影

**範例**: `Saga`, `ProcessManager`, `PolicyHandler`, `CommandHandler`

### L2: Projection Layer（投影層）

**職責**: 衍生讀模型、查詢優化

```typescript
// Read Model / Projection
class IssueListProjection {
  on(event: IssueCreatedEvent) {
    this.issues.push({ id: event.aggregateId, title: event.title, status: 'open' });
  }
  
  query(filter: IssueFilter): Issue[] {
    return this.issues.filter(filter);
  }
}
```

**特徵**:
- ✅ 衍生狀態、查詢優化、視圖特化
- ❌ **不是真實來源**、不發布事件、不執行業務邏輯

**範例**: `Projection`, `Query`, `ViewModel`

## 層級關係

```
L2: Projection (Read Models)
     ↑ subscribe to events
L1: Process (Saga/Policy)
     ↑ publish/consume events
L0: Fact (Events/Aggregates)
```

## 職責劃分

| 層級 | 能做什麼 | 不能做什麼 |
|------|----------|------------|
| L0 | 定義事實、驗證不變式 | if/else、流程、查詢 |
| L1 | 條件邏輯、編排流程 | 修改狀態、查詢投影 |
| L2 | 衍生狀態、查詢優化 | 發布事件、業務邏輯 |

## 實例：Issue 生命週期

### L0: 定義事實
```typescript
class IssueCreatedEvent { ... }
class IssueAssignedEvent { ... }
class IssueClosedEvent { ... }
```

### L1: 編排流程
```typescript
on(IssueCreatedEvent) → publish(NotifyTeamEvent)
on(IssueAssignedEvent) → publish(UpdateWorkloadEvent)
on(IssueClosedEvent) → publish(CalculateMetricsEvent)
```

### L2: 衍生視圖
```typescript
IssueListProjection → queryOpen(), queryByAssignee()
IssueStatsProjection → getCompletionRate(), getAvgTime()
```

---

**參考**：[系統概覽](./overview.md) | [職責邊界](./responsibility-boundaries.md)
