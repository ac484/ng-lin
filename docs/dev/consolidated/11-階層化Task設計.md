# 階層化 Task 設計

## Task 階層的必要性

### 為什麼需要階層化

**問題: 粗粒度 Task 難以追蹤**
```
Task: 完成 SS-A 區機櫃安裝
  工期: 2週
  人數: 12人

問題:
- 2週內看不到進度
- 不知道卡在哪個環節
- 無法精確控制
```

**問題: 細粒度 Task 管理成本高**
```
Task: 鎖第一顆螺絲
Task: 鎖第二顆螺絲
...

問題:
- 建立 Task 太累
- 管理負擔太重
- 失去大局觀
```

**解決: 階層化設計**
```
父 Task: SS-A 區機櫃安裝 (2週)
  ├─ 子 Task 1: SS-A01 機櫃安裝 (3天)
  │   ├─ 孫 Task 1.1: 搬運定位 (半天)
  │   ├─ 孫 Task 1.2: 內部組裝 (1天)
  │   ├─ 孫 Task 1.3: 配線施工 (1天)
  │   └─ 孫 Task 1.4: 測試驗收 (半天)
  ├─ 子 Task 2: SS-A02 機櫃安裝 (3天)
  ├─ 子 Task 3: SS-A03 機櫃安裝 (3天)
  └─ 子 Task 4: SS-A04 機櫃安裝 (3天)
```

## Task 分割 (Split) 機制

### 分割的時機

**時機 A: 計畫階段**
```
專案經理規劃:
  父 Task: SS-A 區完工
    ↓ (計畫性分割)
  4個子 Task (對應 4 SET 機櫃)
```

**時機 B: 執行階段**
```
工地主管發現:
  "SS-A01 機櫃安裝工作太複雜,
   需要拆成更細的子任務"
    ↓ (動態分割)
  產生 4個孫 Task (對應不同工序)
```

**時機 C: 異常處理**
```
Task 執行遇到問題:
  "SS-A01 配線發現規格不符,
   需要額外處理"
    ↓ (緊急分割)
  產生新 Task: 確認並更換配線
```

### 分割的 Event 模型

```typescript
Event: TaskSplit
  parentTaskId: "task-001"
  parentTitle: "SS-A 區機櫃安裝"
  splitReason: "詳細規劃執行細節"
  splitBy: "工地主管"
  childTasks: [
    {
      taskId: "task-001-1",
      title: "SS-A01 機櫃安裝",
      assignedTo: "張三組",
      estimatedDuration: 3天
    },
    {
      taskId: "task-001-2",
      title: "SS-A02 機櫃安裝",
      assignedTo: "李四組",
      estimatedDuration: 3天
    },
    // ... 更多子任務
  ]
  timestamp: "2024-03-15 09:00:00"
  causedBy: ["evt-task-001-created"]
```

### 子任務的因果關係

```
TaskCreated (父任務)
  ↓ (caused)
TaskSplit Event
  ↓ (caused)
TaskCreated Events (子任務們)
  │
  ├─ TaskCreated (task-001-1)
  ├─ TaskCreated (task-001-2)
  ├─ TaskCreated (task-001-3)
  └─ TaskCreated (task-001-4)
```

## 父子 Task 的狀態同步

### 子任務完成時

**子任務完成:**
```
Event: TaskCompleted
  taskId: "task-001-1"  // SS-A01 機櫃安裝
  completedBy: "張三"
  timestamp: "2024-03-18 16:00:00"
  causedBy: ["evt-task-001-1-started"]
```

**觸發父任務進度更新:**
```
Event: ParentTaskProgressUpdated
  parentTaskId: "task-001"
  completedSubTasks: 1
  totalSubTasks: 4
  progress: 25  // 1/4 = 25%
  timestamp: "2024-03-18 16:00:01"
  causedBy: ["evt-task-001-1-completed"]
```

### 所有子任務完成時

```
最後一個子任務完成:
  Event: TaskCompleted
    taskId: "task-001-4"
    ↓ (triggered)
  檢查所有子任務
    ↓ (all completed)
  Event: TaskCompleted
    taskId: "task-001"  // 父任務自動完成
    autoCompleted: true
    completionTrigger: "AllSubTasksCompleted"
    causedBy: [
      "evt-task-001-1-completed",
      "evt-task-001-2-completed",
      "evt-task-001-3-completed",
      "evt-task-001-4-completed"
    ]
```

### 子任務阻擋時

```
Event: TaskBlocked
  taskId: "task-001-2"  // SS-A02 機櫃安裝
  blockReason: "材料未到"
  ↓ (triggered)
Event: ParentTaskRiskDetected
  parentTaskId: "task-001"
  riskType: "SubTaskBlocked"
  affectedSubTask: "task-001-2"
  impact: "可能延誤整體進度"
  recommendation: "優先處理材料問題或調整順序"
  causedBy: ["evt-task-001-2-blocked"]
```

## 進度匯總與計算

### 簡單匯總

**平均法:**
```
父 Task 進度 = Σ(子 Task 進度) / 子 Task 數量

範例:
  子 Task 1: 100% (已完成)
  子 Task 2: 75%
  子 Task 3: 50%
  子 Task 4: 0% (未開始)
  
父 Task 進度 = (100 + 75 + 50 + 0) / 4 = 56.25%
```

### 加權匯總

**依工作量加權:**
```typescript
interface WeightedTask {
  taskId: string;
  progress: number;
  estimatedManHours: number;  // 預估人工
}

function calculateWeightedProgress(
  subTasks: WeightedTask[]
): number {
  const totalWeight = subTasks.reduce(
    (sum, t) => sum + t.estimatedManHours, 0
  );
  
  const weightedSum = subTasks.reduce(
    (sum, t) => sum + (t.progress * t.estimatedManHours), 0
  );
  
  return weightedSum / totalWeight;
}

// 範例:
子 Task 1: 100%, 24 人時
子 Task 2: 75%, 32 人時
子 Task 3: 50%, 16 人時
子 Task 4: 0%, 8 人時

總權重 = 24 + 32 + 16 + 8 = 80
加權和 = (100×24 + 75×32 + 50×16 + 0×8) / 80
      = (2400 + 2400 + 800 + 0) / 80
      = 5600 / 80 = 70%
```

### 依賴關係的影響

**情境: 順序依賴**
```
子 Task 1: 搬運 (必須先完成)
  ↓ (依賴)
子 Task 2: 組裝 (等待 Task 1)
  ↓ (依賴)
子 Task 3: 配線 (等待 Task 2)
  ↓ (依賴)
子 Task 4: 測試 (等待 Task 3)

如果 Task 1 阻擋:
  → Task 2, 3, 4 全部無法開始
  → 父 Task 進度 = 0%
```

## Task 階層的深度限制

### 建議深度: 最多 3 層

**層級定義:**
```
Layer 0 (Milestone): 里程碑等級
  ↓
Layer 1 (Work Package): 工作包等級
  ↓
Layer 2 (Task): 任務等級
  ↓
Layer 3 (Subtask): 子任務等級
```

**不建議超過 3 層:**
```
原因:
1. 管理複雜度急劇上升
2. 因果鏈過深,難以追溯
3. 使用者認知負荷過重
4. 報表呈現困難

如果需要更細:
  → 考慮是否該用另一種機制
  → 例如: Checklist 而非 Task
```

### 動態深度調整

```typescript
interface TaskDepthConfig {
  maxDepth: number;           // 最大深度
  warnAtDepth: number;        // 警告深度
  autoFlattenAtDepth?: number; // 自動扁平化深度
}

async function validateTaskDepth(
  taskId: string,
  config: TaskDepthConfig
): Promise<ValidationResult> {
  const depth = await this.getTaskDepth(taskId);
  
  if (depth >= config.maxDepth) {
    return {
      valid: false,
      message: `Task 深度 ${depth} 超過限制 ${config.maxDepth}`
    };
  }
  
  if (depth >= config.warnAtDepth) {
    return {
      valid: true,
      warning: `Task 深度 ${depth} 接近限制,建議重新規劃`
    };
  }
  
  return { valid: true };
}
```

## Task 合併 (Merge) 機制

### 合併的場景

**情境: 發現可以合併**
```
原本規劃:
  Task-001: SS-A01 配線 (第一層)
  Task-002: SS-A01 配線 (第二層)
  Task-003: SS-A01 配線 (第三層)

發現:
  "其實可以一次完成,不用分三次"
  
合併:
  → TaskMerged Event
  → 新 Task: SS-A01 完整配線
  → 取消原本的 3 個 Tasks
```

**Event 模型:**
```typescript
Event: TasksMerged
  mergedTaskIds: ["task-001", "task-002", "task-003"]
  newTaskId: "task-004"
  newTaskTitle: "SS-A01 完整配線"
  mergeReason: "工作內容重疊,一次完成更有效率"
  mergedBy: "工地主管"
  timestamp: "2024-03-16 10:00:00"
  causedBy: [
    "evt-task-001-created",
    "evt-task-002-created",
    "evt-task-003-created"
  ]
```

## 跨階層的查詢與報表

### 查詢範例 A: 找出所有葉節點 Task

```typescript
async function getLeafTasks(
  rootTaskId: string
): Promise<Task[]> {
  const allTasks = await this.getTaskTree(rootTaskId);
  
  return allTasks.filter(task => {
    return task.childTasks.length === 0;
  });
}
```

### 查詢範例 B: 計算整體完成度

```typescript
async function calculateOverallProgress(
  rootTaskId: string
): Promise<number> {
  const leafTasks = await this.getLeafTasks(rootTaskId);
  
  const totalWeight = leafTasks.reduce(
    (sum, t) => sum + t.estimatedManHours, 0
  );
  
  const completedWeight = leafTasks.reduce(
    (sum, t) => sum + (t.progress * t.estimatedManHours), 0
  );
  
  return (completedWeight / totalWeight) * 100;
}
```

### 報表範例: 樹狀進度圖

```
SS-A 區機櫃安裝 (70%)
├─ SS-A01 機櫃安裝 (100%) ✓
│   ├─ 搬運定位 (100%) ✓
│   ├─ 內部組裝 (100%) ✓
│   ├─ 配線施工 (100%) ✓
│   └─ 測試驗收 (100%) ✓
├─ SS-A02 機櫃安裝 (75%)
│   ├─ 搬運定位 (100%) ✓
│   ├─ 內部組裝 (100%) ✓
│   ├─ 配線施工 (100%) ✓
│   └─ 測試驗收 (0%)
├─ SS-A03 機櫃安裝 (50%)
│   ├─ 搬運定位 (100%) ✓
│   ├─ 內部組裝 (100%) ✓
│   ├─ 配線施工 (0%)
│   └─ 測試驗收 (0%)
└─ SS-A04 機櫃安裝 (0%)
    └─ 全部待開始
```

## 總結

階層化 Task 的核心:
1. **靈活分割** - 根據需要動態調整
2. **自動匯總** - 父任務進度自動計算
3. **深度控制** - 限制在 3 層內
4. **完整追溯** - 因果關係清晰記錄
5. **視覺化呈現** - 樹狀結構易於理解
