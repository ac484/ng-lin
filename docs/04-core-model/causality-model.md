# 因果模型 (Causality Model)

## 核心概念

因果關係是系統**第一級公民**，每個事件明確記錄其成因。

```typescript
interface CausalMetadata {
  readonly eventId?: string;
  readonly userId?: string;
  readonly reason?: string;
  readonly context?: Record<string, unknown>;
}
```

## 三種識別碼

### correlationId（流程識別）
群組相關事件到同一業務流程。

```typescript
// 同一議題的所有事件共享 correlationId
{ correlationId: 'issue-123', type: 'IssueCreated' }
{ correlationId: 'issue-123', type: 'IssueAssigned' }
{ correlationId: 'issue-123', type: 'IssueClosed' }
```

### causationId（因果鏈識別）
追蹤因果鏈路。

```typescript
// A → B → C 因果鏈
eventA: { causationId: 'chain-1', causedBy: {} }
eventB: { causationId: 'chain-1', causedBy: { eventId: 'A' } }
eventC: { causationId: 'chain-1', causedBy: { eventId: 'B' } }
```

### traceId（分散式追蹤）
跨服務追蹤（OpenTelemetry）。

## 因果鏈建構

```typescript
createEvent<T>(type: string, data: T, causedBy: CausalMetadata, prev?: CausalEvent) {
  return {
    eventId: generateId(),
    type, data,
    timestamp: new Date().toISOString(),
    causedBy,
    correlationId: prev?.correlationId ?? generateId(),
    causationId: prev?.causationId ?? generateId(),
    traceId: prev?.traceId
  };
}
```

## 因果查詢

### 查詢因果鏈
```typescript
async function getCausalChain(eventId: string): Promise<CausalEvent[]> {
  const visited = new Set<string>();
  const chain: CausalEvent[] = [];
  
  async function traverse(id: string) {
    if (visited.has(id)) return;
    visited.add(id);
    const events = await eventStore.query({ 'causedBy.eventId': id });
    for (const e of events) {
      chain.push(e);
      await traverse(e.eventId);
    }
  }
  
  await traverse(eventId);
  return chain;
}
```

### 查詢流程事件
```typescript
async function getFlowEvents(correlationId: string) {
  return eventStore.query({ correlationId });
}
```

## 因果圖

```typescript
interface CausalGraph {
  nodes: Map<string, CausalEvent>;
  edges: Map<string, string[]>;
}

buildGraph(events: CausalEvent[]): CausalGraph {
  const graph = { nodes: new Map(), edges: new Map() };
  for (const e of events) {
    graph.nodes.set(e.eventId, e);
    if (e.causedBy?.eventId) {
      const children = graph.edges.get(e.causedBy.eventId) ?? [];
      children.push(e.eventId);
      graph.edges.set(e.causedBy.eventId, children);
    }
  }
  return graph;
}
```

## 反事實推理

```typescript
// 如果沒有事件 X，會發生什麼？
async function whatIfNotOccurred(eventId: string) {
  const chain = await getCausalChain(eventId);
  const all = await eventStore.getAll();
  const without = all.filter(e => e.eventId !== eventId && !chain.includes(e));
  
  return {
    stateWith: replay(all),
    stateWithout: replay(without),
    diff: compare(replay(all), replay(without))
  };
}
```

## 因果驗證

```typescript
function validateCausality(events: CausalEvent[]): Result<void> {
  for (const e of events) {
    // 檢查：causedBy 事件是否存在
    if (e.causedBy?.eventId) {
      const causeExists = events.some(x => x.eventId === e.causedBy.eventId);
      if (!causeExists) return Err(`Missing: ${e.causedBy.eventId}`);
    }
    
    // 檢查：時間序必須合理
    if (e.causedBy?.eventId) {
      const cause = events.find(x => x.eventId === e.causedBy.eventId);
      if (cause && cause.timestamp > e.timestamp) {
        return Err('Cause cannot occur after effect');
      }
    }
  }
  return Ok();
}
```

## 實踐指南

1. **明確記錄原因**：`causedBy.reason` 應描述觸發原因
2. **保持鏈路連續**：每個事件指向其直接成因
3. **使用統一識別碼**：同流程事件共享 correlationId
4. **驗證因果完整性**：確保因果鏈不中斷

---

**參考**：[事件模型](./event-model.md) | [因果圖](../06-projection-decision/causal-graph.md)
