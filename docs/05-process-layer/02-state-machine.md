# 狀態機 (State Machine)

## 角色與限制

狀態機在事件溯源系統中的定位：
- ✅ 建模明確的狀態轉換
- ✅ 驗證狀態轉換的合法性
- ❌ **不儲存狀態**（狀態從事件重建）
- ❌ **不是流程引擎**（使用 Saga 編排流程）

## 實作模式

### 基於事件的狀態機
```typescript
enum IssueStatus {
  Open = 'open',
  InProgress = 'in_progress',
  Closed = 'closed'
}

class IssueStateMachine {
  canTransition(from: IssueStatus, to: IssueStatus): boolean {
    const transitions = {
      [IssueStatus.Open]: [IssueStatus.InProgress, IssueStatus.Closed],
      [IssueStatus.InProgress]: [IssueStatus.Open, IssueStatus.Closed],
      [IssueStatus.Closed]: []
    };
    return transitions[from]?.includes(to) ?? false;
  }
}

class IssueAggregate {
  assign(assignee: EntityId): Result<IssueAssignedEvent> {
    if (!this.stateMachine.canTransition(this.status, IssueStatus.InProgress)) {
      return Result.Err('Invalid state transition');
    }
    return Result.Ok(new IssueAssignedEvent({ aggregateId: this.id, assignee }));
  }
}
```

## 狀態從事件衍生

```typescript
class IssueAggregate {
  private status: IssueStatus = IssueStatus.Open;
  
  // 從事件重建狀態
  apply(event: DomainEvent) {
    if (event instanceof IssueCreatedEvent) {
      this.status = IssueStatus.Open;
    } else if (event instanceof IssueAssignedEvent) {
      this.status = IssueStatus.InProgress;
    } else if (event instanceof IssueClosedEvent) {
      this.status = IssueStatus.Closed;
    }
  }
}
```

## 複雜狀態轉換

```typescript
type IssueTransition = {
  from: IssueStatus;
  to: IssueStatus;
  guard?: (aggregate: IssueAggregate) => boolean;
};

const transitions: IssueTransition[] = [
  { from: IssueStatus.Open, to: IssueStatus.InProgress },
  {
    from: IssueStatus.InProgress,
    to: IssueStatus.Closed,
    guard: (agg) => agg.hasAllTasksCompleted()
  }
];
```

## 關鍵原則

1. **狀態 = f(events)**: 狀態永遠從事件重建
2. **轉換驗證**: 狀態機僅驗證轉換合法性
3. **無副作用**: 狀態機不產生事件或呼叫服務
4. **可重播**: 重播事件產生相同狀態

---

**參考**: [Saga](./saga-process-manager.md) | [補償](./compensation.md)
