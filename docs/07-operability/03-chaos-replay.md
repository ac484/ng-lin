# Chaos Replay

## 混沌工程與重播

利用事件重播能力進行混沌測試。

## 基本概念

```typescript
class ChaosReplay {
  async injectFailure(
    events: CausalEvent[],
    failurePoint: number,
    failureType: 'timeout' | 'error' | 'corruption'
  ): Promise<ReplayResult> {
    const aggregate = new IssueAggregate();
    
    for (let i = 0; i < events.length; i++) {
      if (i === failurePoint) {
        switch (failureType) {
          case 'timeout':
            await sleep(10000); // 模擬超時
            break;
          case 'error':
            throw new Error('Injected error');
          case 'corruption':
            events[i].data = null; // 損壞資料
            break;
        }
      }
      
      aggregate.apply(events[i]);
    }
    
    return { finalState: aggregate };
  }
}
```

## 測試場景

### 1. 網路分區
```typescript
async testNetworkPartition() {
  const events = await eventStore.getEvents('issue:123');
  
  // 模擬網路分區：一半事件延遲
  const delayed = events.map((e, i) =>
    i % 2 === 0 ? { ...e, timestamp: e.timestamp + 5000 } : e
  );
  
  const result = await chaos.replay(delayed);
  assert(result.isConsistent());
}
```

### 2. 事件遺失
```typescript
async testEventLoss() {
  const events = await eventStore.getEvents('issue:123');
  
  // 隨機移除 10% 事件
  const lostEvents = events.filter(() => Math.random() > 0.1);
  
  const result = await chaos.replay(lostEvents);
  // 驗證系統能否偵測不一致
  assert(result.detectsInconsistency());
}
```

### 3. 順序錯亂
```typescript
async testOutOfOrder() {
  const events = await eventStore.getEvents('issue:123');
  
  // 打亂事件順序
  const shuffled = [...events].sort(() => Math.random() - 0.5);
  
  const result = await chaos.replay(shuffled);
  // 驗證版本控制能否拒絕錯序事件
  assert(result.rejectsOutOfOrder());
}
```

## 持續混沌測試

```typescript
class ContinuousChaosTest {
  async run() {
    while (true) {
      const aggregateId = this.pickRandom();
      const events = await eventStore.getEvents(aggregateId);
      
      const scenarios = [
        () => this.testTimeout(events),
        () => this.testCorruption(events),
        () => this.testReordering(events)
      ];
      
      const scenario = this.pickRandom(scenarios);
      const result = await scenario();
      
      this.recordResult(result);
      await sleep(60000); // 每分鐘執行一次
    }
  }
}
```

## 失敗注入策略

```typescript
const strategies = [
  { name: 'Random Delay', probability: 0.1, delay: '100-1000ms' },
  { name: 'Random Error', probability: 0.05, type: 'NetworkError' },
  { name: 'Data Corruption', probability: 0.01, field: 'random' },
  { name: 'Complete Failure', probability: 0.001, action: 'crash' }
];
```

---

**參考**: [失敗處理](./failure-handling.md) | [可觀測性](./observability.md)
