# 為何不是 CRUD (Why Not CRUD)

## CRUD 的根本問題

### 1. 狀態可被直接修改
```typescript
// CRUD 思維：直接修改狀態
issue.status = 'closed';
issue.closedBy = userId;
issue.closedAt = new Date();
await repository.update(issue);
```

**問題**：
- ❌ 無法得知**為什麼**被關閉
- ❌ 無法得知**誰觸發**關閉動作
- ❌ 無法得知**關閉前**發生了什麼
- ❌ 無法**回溯**到關閉前的狀態

### 2. 歷史被覆蓋

CRUD 每次 UPDATE 都覆蓋舊值：
- 失去歷史軌跡
- 失去審計能力
- 失去因果關係
- 失去回溯能力

### 3. 並發衝突難以處理

```typescript
// CRUD 並發問題
// User A 讀取 issue (version 1)
const issueA = await repo.findById('123');

// User B 讀取同一個 issue (version 1)
const issueB = await repo.findById('123');

// User A 修改並儲存 (version 2)
issueA.priority = 'high';
await repo.update(issueA);

// User B 修改並儲存 (覆蓋 A 的變更!)
issueB.assignee = 'bob';
await repo.update(issueB); // A 的 priority 變更遺失！
```

**問題**：
- ❌ Last-Write-Wins 導致資料遺失
- ❌ 需要複雜的鎖機制
- ❌ 無法清楚表達衝突

## 事件驅動的解決方案

### 1. 事件描述事實

```typescript
// 事件思維：記錄發生的事實
const event1: IssuePriorityChanged = {
  type: 'IssuePriorityChanged',
  aggregateId: '123',
  version: 2,
  timestamp: '2025-12-30T10:00:00Z',
  data: { newPriority: 'high', oldPriority: 'medium' },
  causedBy: { userId: 'alice' }
};

const event2: IssueAssigned = {
  type: 'IssueAssigned',
  aggregateId: '123',
  version: 3,
  timestamp: '2025-12-30T10:01:00Z',
  data: { assignee: 'bob' },
  causedBy: { userId: 'carol' }
};

// 狀態透過重播事件得出
const currentState = applyEvents([event1, event2], initialState);
```

**優勢**：
- ✅ 完整歷史軌跡
- ✅ 明確因果關係
- ✅ 可回溯任意時間點
- ✅ 並發衝突自動解決

### 2. 樂觀並發控制

```typescript
// 事件驅動的並發處理
// 兩個變更都成功記錄為事件
events = [
  { version: 1, type: 'IssueCreated', ... },
  { version: 2, type: 'IssuePriorityChanged', ... }, // Alice
  { version: 3, type: 'IssueAssigned', ... }         // Bob
];

// 透過重播事件，兩個變更都保留
currentState = {
  priority: 'high',   // from event 2
  assignee: 'bob'     // from event 3
};
```

### 3. 時間旅行查詢

```typescript
// 查詢任意時間點的狀態
const stateAt = (timestamp) => {
  const eventsUntil = events.filter(e => e.timestamp <= timestamp);
  return applyEvents(eventsUntil, initialState);
};

// 查詢 10:00 時的狀態
const stateAt10 = stateAt('2025-12-30T10:00:30Z');
// { priority: 'high', assignee: null }

// 查詢 10:01 時的狀態
const stateAt1001 = stateAt('2025-12-30T10:01:30Z');
// { priority: 'high', assignee: 'bob' }
```

## 何時仍可使用 CRUD

CRUD 適用於：
- ✅ 簡單的參考資料表（如國家列表）
- ✅ 無需審計追蹤的靜態配置
- ✅ 讀寫模型完全一致的場景

**但核心業務邏輯永遠應該是事件驅動**。

## 結論

CRUD 的核心問題是**狀態至上**，事件驅動的核心是**事實至上**。

在 Causality-Driven 系統中：
- 事件是真實來源
- 狀態是衍生品
- 歷史永不消失
- 因果關係明確

---

**參考文件**：
- [系統定義](./system-definition.md)
- [為何不是純粹 Event Sourcing](./why-not-pure-es.md)
