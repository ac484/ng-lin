# 因果圖 (Causal Graph)

## 定義

因果圖是事件之間因果關係的視覺化表示。

## 圖結構

```
IssueCreatedEvent (root)
    ↓ causedBy
NotifyTeamEvent
    ↓ causedBy
EmailSentEvent
    ↓ causedBy
EmailDeliveredEvent
```

## 構建因果圖

```typescript
class CausalGraph {
  private nodes = new Map<string, CausalEvent>();
  private edges = new Map<string, string[]>();
  
  addEvent(event: CausalEvent) {
    this.nodes.set(event.id, event);
    
    if (event.causedBy) {
      if (!this.edges.has(event.causedBy)) {
        this.edges.set(event.causedBy, []);
      }
      this.edges.get(event.causedBy)!.push(event.id);
    }
  }
  
  getChildren(eventId: string): CausalEvent[] {
    const childIds = this.edges.get(eventId) || [];
    return childIds.map(id => this.nodes.get(id)!);
  }
  
  getAncestors(eventId: string): CausalEvent[] {
    const ancestors: CausalEvent[] = [];
    let current = this.nodes.get(eventId);
    
    while (current?.causedBy) {
      const parent = this.nodes.get(current.causedBy);
      if (parent) {
        ancestors.push(parent);
        current = parent;
      } else {
        break;
      }
    }
    
    return ancestors.reverse();
  }
}
```

## 查詢操作

### 根因分析
```typescript
async findRootCause(errorEventId: string): Promise<CausalEvent> {
  const ancestors = causalGraph.getAncestors(errorEventId);
  return ancestors[0]; // 最早的事件
}
```

### 影響範圍分析
```typescript
async findImpact(eventId: string): Promise<CausalEvent[]> {
  const descendants = [];
  const queue = [eventId];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    const children = causalGraph.getChildren(current);
    descendants.push(...children);
    queue.push(...children.map(c => c.id));
  }
  
  return descendants;
}
```

## 視覺化

```typescript
function renderGraph(graph: CausalGraph) {
  return {
    nodes: Array.from(graph.nodes.values()).map(e => ({
      id: e.id,
      label: e.type,
      timestamp: e.timestamp
    })),
    edges: Array.from(graph.edges.entries()).flatMap(([parent, children]) =>
      children.map(child => ({ from: parent, to: child }))
    )
  };
}
```

## 時間線視圖

```typescript
function getTimeline(graph: CausalGraph, aggregateId: string) {
  const events = graph.getEventsFor(aggregateId);
  return events.sort((a, b) => a.timestamp - b.timestamp);
}
```

---

**參考**: [因果模型](../04-core-model/causality-model.md) | [時間查詢](./temporal-queries.md)
