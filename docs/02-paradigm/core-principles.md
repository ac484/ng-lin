# 核心原則 (Core Principles)

## 不可妥協的鐵律

### 1. Event = Fact（事件即事實）

```typescript
// ✅ 正確：事件描述已發生的事實
const event = { type: 'IssueCreated', data: { title: 'Bug', createdBy: 'alice' } };

// ❌ 錯誤：事件描述命令或意圖
const event = { type: 'CreateIssue' };  // 這是命令，不是事實
```

**原則**：過去式命名、描述已發生事實、不可變

### 2. State = Derived（狀態即衍生）

```typescript
// ✅ 正確：從事件重播得出狀態
const state = events.reduce((s, e) => apply(e, s), initialState);

// ❌ 錯誤：直接修改狀態
state.status = 'closed';  // 狀態不是真實來源！
```

**原則**：永遠從事件衍生、可丟棄重建、非真實來源

### 3. Causality = Explicit（因果必明確）

```typescript
// ✅ 正確：明確記錄因果關係
const event: CausalEvent = {
  type: 'IssueClosed',
  causedBy: { eventId: 'e-123', userId: 'alice', reason: 'resolved' },
  correlationId: 'flow-abc',
  causationId: 'chain-xyz'
};
```

**原則**：必須包含因果元數據、因果鏈可追溯、相關事件可群組

### 4. Replay = Deterministic（重播即確定）

```typescript
// ✅ 正確：確定性處理
const apply = (e: Event, s: State): State => {
  switch (e.type) {
    case 'IssueCreated': return { ...s, status: 'open', createdAt: e.timestamp };
    case 'IssueClosed': return { ...s, status: 'closed', closedAt: e.timestamp };
  }
};

// ❌ 錯誤：非確定性
const apply = (e: Event, s: State) => ({ ...s, timestamp: new Date() });
```

**原則**：重播可預測、邏輯無副作用、時間來自事件本身

## 設計約束

| 層級 | 職責 | 禁止 | 允許 |
|------|------|------|------|
| L0 - Fact | 定義事件與因果 | 流程、狀態、副作用 | 純函數、不可變結構 |
| L1 - Process | 連接事件、編排 | 修改狀態、業務規則 | Saga、PM、狀態機 |
| L2 - Projection | 衍生讀模型 | 成為真實來源、回寫 | 查詢優化、快取、聚合 |

## 違反檢測

```typescript
// 檢測事件是否為事實
const validateEvent = (e) => {
  if (e.type.startsWith('Create')) throw new Error('不應使用命令式命名');
  if (!e.causedBy) throw new Error('必須包含因果元數據');
};

// 檢測重播確定性
const validateDeterminism = (events) => {
  assert(deepEqual(replay(events), replay(events)), '重播結果必須一致');
};
```

## 實踐指南

1. **事件設計**：過去式、完整資料、記錄因果
2. **狀態管理**：從事件衍生、可丟棄、非真實來源
3. **流程編排**：基於事件、無狀態、可重播
4. **投影查詢**：唯讀、可重建、不回寫

---

**參考**：[系統定義](./system-definition.md) | [分層模型](../03-architecture/layering-model.md) | [狀態洩漏](../09-anti-patterns/state-leakage.md)
