# 為何不是純粹 Event Sourcing (Why Not Pure ES)

## 純粹 Event Sourcing 的限制

傳統 Event Sourcing 關注**事件儲存**，但我們的系統關注**因果關係與決策**。

### 1. 缺少明確的因果關係

```typescript
// 傳統 Event Sourcing
const events = [
  { type: 'IssueCreated', ... },
  { type: 'IssueAssigned', ... },
  { type: 'IssueClosed', ... }
];

// 問題：無法得知事件之間的因果關係
// - IssueAssigned 是誰觸發的？
// - IssueClosed 是因為 IssueAssigned 嗎？
// - 這些事件是否屬於同一個流程？
```

### 2. 缺少明確的決策模型

傳統 Event Sourcing：
- ❌ 僅記錄**發生了什麼**
- ❌ 不記錄**為何發生**
- ❌ 不提供**模擬能力**

## Causality-Driven 的擴展

### 1. 明確的因果元數據

```typescript
// Causality-Driven Event
const event: CausalEvent = {
  type: 'IssueAssigned',
  aggregateId: 'issue-123',
  version: 2,
  timestamp: '2025-12-30T10:00:00Z',
  data: { assignee: 'bob' },
  
  // 因果元數據
  causedBy: {
    eventId: 'event-001',        // 哪個事件引發
    userId: 'alice',              // 誰觸發
    reason: 'auto-assignment'     // 為何觸發
  },
  correlationId: 'flow-abc',      // 流程識別
  causationId: 'chain-xyz',       // 因果鏈識別
  traceId: 'trace-123'            // 分散式追蹤
};
```

**優勢**：
- ✅ 完整的因果鏈
- ✅ 可追溯決策來源
- ✅ 支援分散式追蹤

### 2. 重播作為驗證手段

```typescript
// 不只是重建狀態，更是驗證邏輯
const replay = (events: CausalEvent[]) => {
  let state = initialState;
  
  for (const event of events) {
    // 驗證：此事件是否應該發生
    if (!canApply(event, state)) {
      throw new Error(`Invalid event: ${event.type}`);
    }
    
    // 應用：更新狀態
    state = apply(event, state);
  }
  
  return state;
};
```

### 3. 模擬作為決策工具

```typescript
// What-If 分析
const simulateIfAssigned = (currentState, assignee) => {
  const hypotheticalEvent = {
    type: 'IssueAssigned',
    data: { assignee }
  };
  
  // 模擬：如果執行此事件會怎樣？
  const futureState = apply(hypotheticalEvent, currentState);
  
  // 評估：是否違反任何規則？
  const violations = validateState(futureState);
  
  return { futureState, violations };
};

// 使用模擬來做決策
const sim1 = simulateIfAssigned(state, 'alice');
const sim2 = simulateIfAssigned(state, 'bob');

if (sim1.violations.length === 0) {
  commitEvent({ type: 'IssueAssigned', data: { assignee: 'alice' } });
}
```

## 核心差異

| 特性 | Event Sourcing | Causality-Driven |
|------|---------------|-----------------|
| 事件儲存 | ✅ | ✅ |
| 狀態重建 | ✅ | ✅ |
| 因果追蹤 | ❌ | ✅ |
| 決策模擬 | ❌ | ✅ |
| 流程可視化 | ❌ | ✅ |
| 時間旅行 | ✅ | ✅ |

## 何時使用純粹 Event Sourcing

純粹 Event Sourcing 適用於：
- ✅ 簡單的事件記錄需求
- ✅ 不需要複雜因果分析
- ✅ 不需要決策模擬

**但複雜業務系統需要 Causality-Driven 擴展**。

## 結論

我們不是**取代** Event Sourcing，而是**擴展**它：

- Event Sourcing 解決**狀態重建**問題
- Causality-Driven 解決**因果推理**與**決策模擬**問題

兩者結合，才能建構可理解、可預測、可驗證的系統。

---

**參考文件**：
- [系統定義](./system-definition.md)
- [核心原則](./core-principles.md)
- [因果模型](../04-core-model/causality-model.md)
