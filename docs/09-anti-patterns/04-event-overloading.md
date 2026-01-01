# Anti-Pattern: Event Overloading

## 問題

單一事件承載過多責任或資訊。

## 症狀

```typescript
// ❌ BAD: Overloaded Event
class IssueUpdatedEvent {
  aggregateId: string;
  titleChanged?: string;
  statusChanged?: string;
  assigneeChanged?: string;
  priorityChanged?: string;
  tagsAdded?: string[];
  tagsRemoved?: string[];
  // ... 20+ optional fields
}
```

**問題**:
- 難以理解事件語義
- 難以處理特定變更
- 難以追蹤因果關係
- 違反單一責任原則

## 正確做法

```typescript
// ✅ GOOD: Specific Events
class IssueTitleChangedEvent {
  aggregateId: string;
  oldTitle: string;
  newTitle: string;
}

class IssueStatusChangedEvent {
  aggregateId: string;
  oldStatus: string;
  newStatus: string;
}

class IssueAssignedEvent {
  aggregateId: string;
  assignee: string;
}
```

## 重構指南

### 1. 識別不同的意圖
```typescript
// Before
if (event.titleChanged) { ... }
if (event.statusChanged) { ... }

// After
eventBus.on('IssueTitleChanged', handler);
eventBus.on('IssueStatusChanged', handler);
```

### 2. 分離因果鏈
```typescript
// Before: 無法追蹤哪個變更導致通知
class IssueUpdatedEvent { ... }
on(IssueUpdatedEvent) → NotifyEvent

// After: 明確的因果關係
on(IssueStatusChangedEvent) → NotifyTeamEvent
on(IssueAssignedEvent) → NotifyAssigneeEvent
```

### 3. 簡化處理邏輯
```typescript
// Before: 複雜的條件判斷
on(IssueUpdatedEvent) {
  if (event.statusChanged === 'closed') { ... }
  if (event.assigneeChanged) { ... }
}

// After: 專注的處理器
on(IssueClosedEvent) { ... }
on(IssueAssignedEvent) { ... }
```

## 判斷準則

**過載的訊號**:
- 事件有 >5 個可選欄位
- 事件處理需要大量 if/else
- 難以為事件命名
- 事件包含多個獨立的變更

**解決方案**:
- 拆分為多個專注的事件
- 每個事件代表單一業務意圖
- 使用明確的事件名稱

---

**參考**: [核心原則](../02-paradigm/core-principles.md)
