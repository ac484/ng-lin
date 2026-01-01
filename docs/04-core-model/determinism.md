# 確定性 (Determinism)

## 核心定義

**相同事件序列 → 相同狀態**。這是系統可重播性、可驗證性的基礎。

## 確定性原則

### 1. 無副作用
```typescript
// ✅ 純函數
function apply(event: Event, state: State): State {
  return { ...state, title: event.data.title, status: 'open' };
}

// ❌ 有副作用
function apply(event: Event, state: State): State {
  console.log('Applying'); fetch('/api/notify'); return state;
}
```

### 2. 時間來自事件
```typescript
// ✅ 使用事件時間戳
apply(e: Event, s: State): State {
  return { ...s, createdAt: e.timestamp };
}

// ❌ 使用系統時鐘
apply(e: Event, s: State): State {
  return { ...s, createdAt: new Date() };  // 每次不同！
}
```

### 3. 無外部依賴
```typescript
// ✅ 資料來自事件
apply(e: IssueAssigned, s: State): State {
  return { ...s, assignee: e.data.assignee };
}

// ❌ 查詢外部資料
async apply(e: IssueAssigned, s: State): State {
  const user = await userRepo.findById(e.data.assigneeId);
  return { ...s, assignee: user.name };  // 外部依賴！
}
```

### 4. 無隨機性
```typescript
// ✅ ID 來自事件
apply(e: Event, s: State): State {
  return { ...s, id: e.aggregateId };
}

// ❌ 隨機產生
apply(e: Event, s: State): State {
  return { ...s, id: Math.random().toString() };  // 每次不同！
}
```

## 驗證確定性

```typescript
test('重播必須確定', () => {
  const events = [
    { type: 'IssueCreated', data: { title: 'Bug' } },
    { type: 'IssueAssigned', data: { assignee: 'alice' } }
  ];
  
  const state1 = replay(events);
  const state2 = replay(events);
  expect(state1).toEqual(state2);
});
```

## 常見陷阱

| 陷阱 | 錯誤做法 | 正確做法 |
|------|---------|---------|
| 時間 | `Date.now()` | `event.timestamp` |
| 資料 | `await db.find()` | `event.data.user` |
| 配置 | `process.env.X` | `event.data.config` |
| ID | `uuid()` | `event.aggregateId` |

## 確定性的好處

1. **可重播**：任何時候都可從事件重建狀態
2. **可測試**：測試簡單可靠
3. **可除錯**：可重現問題追蹤根因
4. **可審計**：事件序列完整記錄

## 實踐指南

1. **純函數**：apply 必須是純函數
2. **事件完整**：所有必要資料都在事件中
3. **避免副作用**：不執行 I/O、不修改外部狀態
4. **使用事件時間**：永遠用 `event.timestamp`
5. **測試重播**：每個 aggregate 都應有重播測試

---

**參考**：[事件模型](./event-model.md) | [時間模型](./time-model.md)
