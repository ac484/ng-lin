# 模擬引擎 (Simulation Engine)

## What-If Analysis

模擬未來事件的影響，評估決策後果。

## 基本模擬

```typescript
class SimulationEngine {
  async simulate(
    aggregateId: string,
    hypotheticalEvents: DomainEvent[]
  ): Promise<SimulationResult> {
    // 1. 載入當前狀態
    const current = await eventStore.load(aggregateId);
    
    // 2. 複製狀態
    const simulated = current.clone();
    
    // 3. 應用假設事件
    for (const event of hypotheticalEvents) {
      const result = simulated.apply(event);
      if (result.isErr()) {
        return { success: false, error: result.error };
      }
    }
    
    return {
      success: true,
      before: current,
      after: simulated,
      changes: this.diff(current, simulated)
    };
  }
}
```

## 使用案例

### 1. 政策變更影響評估
```typescript
// 模擬新政策對現有 issues 的影響
const results = await Promise.all(
  openIssues.map(issue =>
    simulator.simulate(issue.id, [
      new PolicyChangedEvent({ newPolicy: 'auto-close-30-days' })
    ])
  )
);

const affected = results.filter(r => r.changes.status === 'closed');
console.log(`${affected.length} issues will be auto-closed`);
```

### 2. 資源分配模擬
```typescript
// 模擬指派所有 issues 給新成員的影響
const simulation = await simulator.simulate('team:1', [
  ...openIssues.map(i => new IssueAssignedEvent({
    aggregateId: i.id,
    assignee: 'user:new-member'
  }))
]);

console.log(`New member workload: ${simulation.after.workload}`);
```

### 3. 時間線預測
```typescript
// 預測未來 30 天的狀態
const futureEvents = predictEvents(issue, 30);
const future = await simulator.simulate(issue.id, futureEvents);
```

## 多場景比較

```typescript
const scenarios = [
  { name: 'Scenario A', events: [eventA1, eventA2] },
  { name: 'Scenario B', events: [eventB1, eventB2] },
  { name: 'Scenario C', events: [eventC1, eventC2] }
];

const results = await Promise.all(
  scenarios.map(s => simulator.simulate(aggregateId, s.events))
);

// 比較結果
const comparison = compareScenarios(results);
```

## 約束檢查

```typescript
class ConstraintChecker {
  async validateSimulation(result: SimulationResult): Promise<boolean> {
    // 檢查業務約束
    if (result.after.workload > MAX_WORKLOAD) {
      return false;
    }
    
    // 檢查資源限制
    if (result.after.budget > BUDGET_LIMIT) {
      return false;
    }
    
    return true;
  }
}
```

## 回滾模擬

```typescript
// 模擬回滾到過去狀態
async simulateRollback(aggregateId: string, targetDate: Date) {
  const events = await eventStore.getEvents(aggregateId, {
    until: targetDate
  });
  
  const rolled = new IssueAggregate();
  events.forEach(e => rolled.apply(e));
  
  return {
    current: await eventStore.load(aggregateId),
    rolledBack: rolled,
    compensationEvents: this.generateCompensation(rolled)
  };
}
```

---

**參考**: [時間查詢](./temporal-queries.md) | [因果圖](./causal-graph.md)
