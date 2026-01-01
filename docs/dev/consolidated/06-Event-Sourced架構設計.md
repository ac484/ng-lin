# Event-Sourced 架構設計

## Event Sourcing 核心概念

### 什麼是 Event Sourcing

**傳統方式: 儲存當前狀態**
```
資料庫記錄:
| OrderId | Status    | Amount  |
|---------|-----------|---------|
| 001     | Completed | 10,000  |

問題:
- 不知道如何變成 Completed
- 不知道金額是否調整過
- 無法回溯歷史
```

**Event Sourcing: 儲存所有事件**
```
Event Store:
1. OrderCreated { orderId: 001, amount: 8,000 }
2. OrderAmountAdjusted { orderId: 001, newAmount: 10,000 }
3. OrderCompleted { orderId: 001 }

優點:
- 完整歷史記錄
- 可以重播任何時間點的狀態
- 天然的審計軌跡
```

### Event Store 資料結構

```typescript
interface StoredEvent {
  // 事件識別
  eventId: string;           // UUID
  eventType: string;         // "TaskCreated", "TaskCompleted"
  eventVersion: number;      // 事件schema版本
  
  // 聚合資訊
  aggregateId: string;       // 聚合根ID
  aggregateType: string;     // "Task", "Milestone"
  aggregateVersion: number;  // 聚合版本號
  
  // 因果關係
  causedBy: string[];        // 前驅事件IDs
  correlationId: string;     // 業務流程ID
  
  // 時間資訊
  timestamp: Date;           // 事件發生時間
  recordedAt: Date;          // 事件記錄時間
  
  // 事件內容
  data: any;                 // 事件資料 (JSON)
  
  // 元資料
  userId: string;            // 觸發者
  metadata: any;             // 額外資訊
}
```

### Event Store 操作

**1. 追加事件 (Append)**
```typescript
async appendEvent(event: StoredEvent): Promise<void> {
  // 驗證因果關係
  await this.validateCausality(event.causedBy);
  
  // 檢查並發衝突
  await this.checkConcurrency(
    event.aggregateId, 
    event.aggregateVersion
  );
  
  // 追加到 Event Store
  await this.eventStore.insert(event);
  
  // 發布到 Event Bus
  await this.eventBus.publish(event);
}
```

**2. 讀取事件流 (Read Stream)**
```typescript
async getEventStream(
  aggregateId: string, 
  fromVersion?: number
): Promise<StoredEvent[]> {
  return await this.eventStore.find({
    aggregateId: aggregateId,
    aggregateVersion: { $gte: fromVersion || 0 }
  }).sort({ aggregateVersion: 1 });
}
```

**3. 查詢因果鏈 (Query Causality)**
```typescript
async getCausalChain(eventId: string): Promise<StoredEvent[]> {
  const event = await this.getEvent(eventId);
  const predecessors = [];
  
  for (const causedById of event.causedBy) {
    const predecessor = await this.getEvent(causedById);
    predecessors.push(predecessor);
    
    // 遞迴查詢
    const chain = await this.getCausalChain(causedById);
    predecessors.push(...chain);
  }
  
  return predecessors;
}
```

## 狀態重建 (Projection)

### 從 Events 重建狀態

```typescript
interface TaskProjection {
  taskId: string;
  title: string;
  status: TaskStatus;
  assignedTo?: string;
  progress: number;
  // ... 其他欄位
}

class TaskProjectionBuilder {
  project(events: StoredEvent[]): TaskProjection {
    let state: TaskProjection = this.getInitialState();
    
    for (const event of events) {
      state = this.apply(state, event);
    }
    
    return state;
  }
  
  private apply(
    state: TaskProjection, 
    event: StoredEvent
  ): TaskProjection {
    switch (event.eventType) {
      case 'TaskCreated':
        return {
          ...state,
          taskId: event.data.taskId,
          title: event.data.title,
          status: 'Pending',
          progress: 0
        };
      
      case 'TaskAssigned':
        return {
          ...state,
          assignedTo: event.data.assignedTo,
          status: 'Assigned'
        };
      
      case 'TaskCompleted':
        return {
          ...state,
          status: 'Completed',
          progress: 100
        };
      
      default:
        return state;
    }
  }
}
```

### 快照優化 (Snapshot)

**問題: 事件太多,重建太慢**
```
Task-001 有 10,000 個 Events
每次查詢都要重播 10,000 次
→ 效能問題
```

**解決: 定期建立快照**
```typescript
interface Snapshot {
  aggregateId: string;
  aggregateVersion: number;  // 快照時的版本
  state: any;                 // 當時的狀態
  createdAt: Date;
}

async getTaskState(taskId: string): Promise<TaskProjection> {
  // 1. 取得最新快照
  const snapshot = await this.getLatestSnapshot(taskId);
  
  // 2. 取得快照之後的事件
  const events = await this.getEventStream(
    taskId, 
    snapshot.aggregateVersion + 1
  );
  
  // 3. 從快照開始,重播後續事件
  let state = snapshot.state;
  for (const event of events) {
    state = this.apply(state, event);
  }
  
  return state;
}
```

**快照策略:**
```
選項 A: 固定間隔
  - 每 100 個事件建立一次快照
  
選項 B: 時間間隔
  - 每天凌晨建立快照
  
選項 C: 查詢觸發
  - 查詢時如果距離上次快照超過 N 個事件,建立新快照
```

## Causality-Driven 設計

### causedBy 欄位的使用

**單一前驅:**
```typescript
Event: TaskStarted
  eventId: "evt-002"
  causedBy: ["evt-001"]  // 由 TaskCreated 引發
```

**多個前驅:**
```typescript
Event: TaskCompleted
  eventId: "evt-010"
  causedBy: [
    "evt-007",  // InternalAcceptanceApproved
    "evt-008",  // ClientAcceptanceApproved  
    "evt-009"   // AllChecksPassed
  ]
```

**無前驅 (根事件):**
```typescript
Event: ContractSigned
  eventId: "evt-001"
  causedBy: []  // 起始事件,沒有前驅
```

### 因果鏈驗證

```typescript
async validateCausality(causedBy: string[]): Promise<void> {
  for (const eventId of causedBy) {
    const event = await this.getEvent(eventId);
    
    if (!event) {
      throw new Error(
        `Causal event ${eventId} not found`
      );
    }
    
    // 檢查時間順序
    if (event.timestamp > Date.now()) {
      throw new Error(
        `Causal event ${eventId} is in the future`
      );
    }
  }
}
```

### 因果關係的應用

**1. 責任追溯**
```
問題: Task-110-A-02 驗收失敗

查詢因果鏈:
  TaskInternalAcceptanceFailed
    ↑ (caused by)
  TaskCompleted (但品質有問題)
    ↑ (caused by)
  TaskStarted
    ↑ (caused by)
  TaskAssigned (指派給張三組)
    ↑ (caused by)
  TaskCreated (由工地主管建立)

結論: 
  - 張三組執行的任務
  - 工地主管當初的規劃
  - 完整的責任鏈
```

**2. 流程分析**
```
統計所有 TaskCompleted Events 的因果鏈
→ 找出常見的前驅 Event 組合
→ 發現典型的成功路徑
→ 優化 Process 定義
```

**3. 異常檢測**
```
Event: TaskCompleted
  causedBy: []  // 異常!沒有前驅

系統預警:
  "Task 完成但沒有前驅 Event,
   可能是手動操作或資料錯誤"
```

## Event Bus 與訂閱模式

### Event Bus 架構

```typescript
interface EventBus {
  // 發布事件
  publish(event: StoredEvent): Promise<void>;
  
  // 訂閱事件類型
  subscribe(
    eventType: string, 
    handler: EventHandler
  ): void;
  
  // 訂閱聚合
  subscribeToAggregate(
    aggregateId: string, 
    handler: EventHandler
  ): void;
}

interface EventHandler {
  handle(event: StoredEvent): Promise<void>;
}
```

### 訂閱者範例

**Saga/Process Manager:**
```typescript
class TaskSaga implements EventHandler {
  async handle(event: StoredEvent): Promise<void> {
    switch (event.eventType) {
      case 'TaskCompleted':
        // 檢查是否需要建立下一個 Task
        await this.handleTaskCompleted(event);
        break;
      
      case 'TaskBlocked':
        // 發送通知
        await this.handleTaskBlocked(event);
        break;
    }
  }
  
  private async handleTaskCompleted(
    event: StoredEvent
  ): Promise<void> {
    // 查詢 Process 定義
    const process = await this.getProcess(
      event.data.processId
    );
    
    // 判斷下一步
    const nextSteps = process.getNextSteps(event);
    
    // 建議建立新 Task
    for (const step of nextSteps) {
      await this.suggestTask(step);
    }
  }
}
```

**Read Model Updater:**
```typescript
class TaskReadModelUpdater implements EventHandler {
  async handle(event: StoredEvent): Promise<void> {
    // 更新查詢用的 Read Model
    switch (event.eventType) {
      case 'TaskCreated':
        await this.taskRepository.create(event.data);
        break;
      
      case 'TaskCompleted':
        await this.taskRepository.update(
          event.data.taskId,
          { status: 'Completed' }
        );
        break;
    }
  }
}
```

## CQRS (Command Query Responsibility Segregation)

### 命令端 (Command Side)

```typescript
// Command: 表達意圖
interface CreateTaskCommand {
  taskId: string;
  title: string;
  workPackageId: string;
  assignedTo: string;
}

// Command Handler: 執行並產生 Event
class CreateTaskHandler {
  async handle(cmd: CreateTaskCommand): Promise<void> {
    // 驗證
    await this.validate(cmd);
    
    // 產生 Event
    const event: StoredEvent = {
      eventId: uuid(),
      eventType: 'TaskCreated',
      aggregateId: cmd.taskId,
      data: cmd,
      causedBy: [],
      timestamp: new Date()
    };
    
    // 追加到 Event Store
    await this.eventStore.append(event);
  }
}
```

### 查詢端 (Query Side)

```typescript
// Query: 查詢需求
interface GetTasksByStatusQuery {
  status: TaskStatus;
  limit: number;
}

// Query Handler: 從 Read Model 查詢
class GetTasksByStatusHandler {
  async handle(
    query: GetTasksByStatusQuery
  ): Promise<TaskProjection[]> {
    // 直接從 Read Model 查詢,不重建
    return await this.taskRepository.findByStatus(
      query.status,
      query.limit
    );
  }
}
```

**優點:**
- 寫入優化: 只追加 Events
- 讀取優化: 預先建立的 Read Model
- 獨立擴展: 寫入和讀取可分開擴展

## 總結

Event-Sourced 架構的核心:
1. **Event Store** - 唯一的真相來源
2. **Projection** - 從 Events 重建狀態
3. **Causality** - 完整的因果追溯
4. **Event Bus** - 事件驅動的協調
5. **CQRS** - 讀寫分離的優化
