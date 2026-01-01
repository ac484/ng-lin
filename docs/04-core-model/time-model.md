# 時間模型 (Time Model)

## 時間的三種視角

### 1. 事件時間 (Event Time)
事件實際發生的時間（業務時間）。
```typescript
const event = {
  timestamp: '2025-12-30T10:00:00.000Z',
  data: { action: 'issue_created' }
};
```

### 2. 處理時間 (Processing Time)
系統處理事件的時間（可能晚於事件發生時間）。

### 3. 攝取時間 (Ingestion Time)
事件進入系統的時間。

## 時間不變性

**重播時，時間永遠來自事件本身。**

```typescript
// ✅ 確定性
apply(e: Event, s: State): State {
  return { ...s, createdAt: e.timestamp };
}

// ❌ 非確定性
apply(e: Event, s: State): State {
  return { ...s, createdAt: new Date() };
}
```

## 時間查詢

### 點查詢 (Point-in-Time)
```typescript
function getStateAt(timestamp: string, events: Event[]): State {
  const eventsUntil = events.filter(e => e.timestamp <= timestamp);
  return replay(eventsUntil);
}

// 查詢 2025-12-30 10:00 時的狀態
const state = getStateAt('2025-12-30T10:00:00Z', events);
```

### 區間查詢 (Temporal Range)
```typescript
function getChangesInRange(start: string, end: string, events: Event[]) {
  return events.filter(e => e.timestamp >= start && e.timestamp <= end);
}
```

## 時間旅行

```typescript
// 回到過去
function rewindTo(eventIndex: number, events: Event[]): State {
  return replay(events.slice(0, eventIndex));
}

// 模擬未來
function simulateEvent(state: State, hypotheticalEvent: Event): State {
  return apply(hypotheticalEvent, state);
}
```

## 事件排序

### 全序關係
```typescript
events.sort((a, b) => {
  if (a.aggregateId !== b.aggregateId) {
    return a.timestamp.localeCompare(b.timestamp);
  }
  return a.version - b.version;
});
```

### Lamport Clock（邏輯時鐘）
```typescript
interface LamportClock {
  timestamp: number;
  nodeId: string;
}

function compareEvents(a: Event, b: Event): number {
  if (a.lamportClock.timestamp !== b.lamportClock.timestamp) {
    return a.lamportClock.timestamp - b.lamportClock.timestamp;
  }
  return a.lamportClock.nodeId.localeCompare(b.lamportClock.nodeId);
}
```

## 時間窗口

### 滑動窗口
```typescript
function getRecentEvents(events: Event[], windowMs: number): Event[] {
  const cutoff = new Date(Date.now() - windowMs).toISOString();
  return events.filter(e => e.timestamp >= cutoff);
}
```

### 固定窗口
```typescript
function groupByDay(events: Event[]): Map<string, Event[]> {
  const groups = new Map<string, Event[]>();
  for (const e of events) {
    const day = e.timestamp.split('T')[0];
    const group = groups.get(day) ?? [];
    group.push(e);
    groups.set(day, group);
  }
  return groups;
}
```

## 時間一致性

### 時區處理
所有時間戳使用 UTC (ISO 8601)。
```typescript
// ✅ 正確：UTC
const timestamp = '2025-12-30T10:00:00.000Z';

// ❌ 錯誤：本地時區
const timestamp = '2025-12-30 18:00:00';
```

### 時鐘偏移
```typescript
// 使用 server timestamp 避免客戶端時鐘偏移
const serverTime = firestore.FieldValue.serverTimestamp();
```

## 實踐指南

1. **ISO 8601**：統一時間格式
2. **UTC 優先**：避免時區問題
3. **事件時間至上**：重播用事件時間
4. **記錄處理時間**：用於除錯和監控
5. **支援時間查詢**：點查詢、區間查詢

---

**參考**：[事件模型](./event-model.md) | [確定性](./determinism.md)
