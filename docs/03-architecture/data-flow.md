# 資料流 (Data Flow)

## Event / Causation 流向

### 寫入流 (Command → Event)

```
UI → Command → Aggregate → Event → Event Store → Event Bus
                                                      ↓
                                        ┌─────────────┼─────────────┐
                                        ▼             ▼             ▼
                                     Saga          Saga       Projection
```

### 讀取流 (Query → Projection)

```
UI → Query → Projection → Read Model
```

## 因果鏈傳播

### 事件元數據
```typescript
class CausalEvent {
  correlationId: string;  // 事件群組
  causationId: string;    // 直接成因
  traceId: string;        // 分散式追蹤
  causedBy?: string;      // 父事件 ID
}
```

### 因果鏈範例
```
IssueCreatedEvent
  ↓ causedBy
NotifyTeamEvent
  ↓ causedBy
EmailSentEvent
```

## 資料流原則

### 1. 單向流動
```
Command → Event → Projection (不可逆向)
```

### 2. 事件為中心
```
所有狀態變化 = 事件序列
狀態 = f(events)
```

### 3. 最終一致性
```
Event Store (強一致) ↓ async → Projection (最終一致)
```

## 完整範例：Issue 建立

```typescript
// 1. UI 發送 Command
const command = new CreateIssueCommand({ title: 'Bug fix', assignee: 'user:123' });

// 2. Aggregate 處理
const result = aggregate.create(command);
// → Result.Ok(IssueCreatedEvent)

// 3. 持久化到 Event Store
await eventStore.append(result.value);

// 4. Event Bus 發布
eventBus.publish(result.value);

// 5. Saga 處理
issueSaga.on(result.value);
// → publish(NotifyAssigneeEvent)

// 6. Projection 更新
issueListProjection.on(result.value);
// → add to read model

// 7. UI 查詢
const issues = await query.getOpenIssues();
// ← from projection
```

## 資料流監控

### 追蹤點
1. Command 接收
2. Event 產生
3. Event 持久化
4. Event 發布
5. Saga 處理
6. Projection 更新

### 監控指標
- Command → Event 延遲
- Event → Store 延遲
- Store → Bus 延遲
- Bus → Saga 延遲
- Saga → Projection 延遲

---

**參考**：[系統概覽](./overview.md) | [職責邊界](./responsibility-boundaries.md)
