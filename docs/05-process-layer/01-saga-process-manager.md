# Saga / Process Manager

## 定義

**Saga**: 編排跨多個 Aggregate 的長流程，確保最終一致性。
**Process Manager**: 追蹤流程狀態，決定下一步動作。

## 使用邊界

### ✅ 適用場景
- 跨多個 Aggregate 的業務流程
- 需要補償邏輯的分散式交易
- 複雜的狀態機流程
- 需要等待外部事件

### ❌ 不適用場景
- 單一 Aggregate 內的邏輯（應在 Aggregate 內處理）
- 簡單的事件轉發（使用 Event Handler）
- 純粹的查詢操作（使用 Query）

## 實作模式

### Saga 範例
```typescript
export class IssueWorkflowSaga {
  on(event: IssueCreatedEvent) {
    if (event.priority === 'critical') {
      this.eventBus.publish(new NotifyTeamEvent({ causedBy: event }));
    }
  }
  
  on(event: IssueAssignedEvent) {
    this.eventBus.publish(new UpdateWorkloadEvent({ causedBy: event }));
  }
}
```

### Process Manager 範例
```typescript
export class IssueApprovalProcess {
  private state: 'pending' | 'approved' | 'rejected' = 'pending';
  
  on(event: IssueSubmittedEvent) {
    this.state = 'pending';
    this.eventBus.publish(new RequestApprovalEvent({ causedBy: event }));
  }
  
  on(event: ApprovalGrantedEvent) {
    if (this.state === 'pending') {
      this.state = 'approved';
      this.eventBus.publish(new IssueApprovedEvent({ causedBy: event }));
    }
  }
}
```

## 關鍵原則

### 1. 無狀態 Saga
Saga 不應儲存狀態，所有狀態應從事件重建。

### 2. 冪等性
Saga 處理必須是冪等的，重複接收相同事件不產生副作用。

### 3. 補償邏輯
失敗時發布補償事件，而非回滾。

### 4. 超時處理
設定超時機制，避免流程永久等待。

## Anti-Pattern: God Saga

**❌ 錯誤**:
```typescript
// God Saga - 包含所有業務邏輯
class AllInOneSaga {
  on(event: any) {
    // 處理所有事件
    // 包含所有業務規則
    // 成為系統瓶頸
  }
}
```

**✅ 正確**:
```typescript
// 專注的 Saga
class IssueNotificationSaga { /* 僅處理通知 */ }
class IssueWorkloadSaga { /* 僅處理工作量 */ }
class IssueMetricsSaga { /* 僅處理指標 */ }
```

---

**參考**: [狀態機](./state-machine.md) | [補償](./compensation.md)
