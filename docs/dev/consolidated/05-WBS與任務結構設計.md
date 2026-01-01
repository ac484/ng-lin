# WBS 與任務結構設計

## Work Breakdown Structure（工作分解結構）

### WBS 定義與目的

**WBS（Work Breakdown Structure）**：將專案或工作範圍分解為可管理、可執行的工作單元的階層式結構。

**核心目的**：
1. 明確工作範圍
2. 分配責任歸屬
3. 估算成本與時程
4. 追蹤執行進度

### 三層架構

```
Layer 1: Contract Level（合約層）
   ↓ 分解為
Layer 2: Work Package Level（工作包層）
   ↓ 產生
Layer 3: Task Level（任務層）
```

## Layer 1: Contract Level（合約層）

### 定義

合約層定義**要交付什麼**，是與客戶的承諾。

### 結構

```
Contract（合約）
├── Item 001: Frontend 設備安裝
│   ├── 數量：16 SET
│   ├── 金額：2,639,062 TWD
│   └── 交期：2024-06-30
├── Item 002: Backend 配線施工
│   ├── 數量：1 LOT
│   ├── 金額：1,500,000 TWD
│   └── 交期：2024-07-15
└── Item 003: 系統整合測試
    ├── 數量：1 LOT
    ├── 金額：800,000 TWD
    └── 交期：2024-08-31
```

### 特性

- **不可變性**：合約簽訂後幾乎不變動
- **財務綁定**：對應付款條件
- **法律效力**：具備合約約束力
- **粗粒度**：通常以「項次」為單位

### Event Sourcing 設計

```typescript
// Contract 層事件
ContractSigned
ContractItemAdded
ContractAmountAdjusted  // 需要變更單
ContractMilestoneReached
```

**原則**：Contract 層事件極少，通常只在合約變更時產生。

## Layer 2: Work Package Level（工作包層）

### 定義

工作包層定義**怎麼做**，是執行計畫。

### 結構

```
Contract Item 001: Frontend 設備安裝
   ↓ 分解為
├── WP-001: SS-A 區機櫃安裝
│   ├── 範圍：SS-A01 ~ SS-A08（8 SET）
│   ├── 工期：2024-04-01 ~ 2024-04-30
│   └── 責任：張三組
├── WP-002: SS-B 區機櫃安裝
│   ├── 範圍：SS-B01 ~ SS-B08（8 SET）
│   ├── 工期：2024-05-01 ~ 2024-05-31
│   └── 責任：李四組
└── WP-003: 整體驗收
    ├── 範圍：全部 16 SET
    ├── 工期：2024-06-01 ~ 2024-06-30
    └── 責任：工地主管
```

### Work Package 屬性

```typescript
interface WorkPackage {
  id: string;                  // WP-001
  contractItemId: string;      // 對應合約項次
  title: string;               // SS-A 區機櫃安裝
  scope: string;               // SS-A01 ~ SS-A08
  assignedTo: string;          // 張三組
  startDate: Date;
  endDate: Date;
  estimatedEffort: number;     // 人天
  dependencies: string[];      // 依賴的其他 WP
  status: WPStatus;            // Planning, InProgress, Completed
}
```

### Process 定義

每個 Work Package 可以有標準 Process：

```
WP-001: SS-A 區機櫃安裝
   ↓ 標準流程
1. 現場勘查與測量
2. 材料進場檢驗
3. 機櫃搬運與定位
4. 內部設備組裝
5. FrontEnd 配線
6. 功能測試
7. 內部驗收
8. 客戶驗收
```

### 特性

- **可調整性**：開工前或執行中可調整
- **細粒度**：通常以「區域」或「批次」為單位
- **責任明確**：每個 WP 有明確負責人
- **進度追蹤**：可獨立追蹤完成度

### Event Sourcing 設計

```typescript
// Work Package 層事件
WorkPackageCreated
WorkPackageAssigned
WorkPackageStarted
WorkPackageCompleted
WorkPackageScopeAdjusted
WorkPackageDependencyChanged
```

**原則**：Work Package 層事件適中，主要在規劃和重大變更時產生。

## Layer 3: Task Level（任務層）

### 定義

任務層定義**今天做什麼**，是每日執行單元。

### 結構

```
WP-001: SS-A 區機櫃安裝
   ↓ 動態產生
2024-04-01:
├── Task-001: [張三] SS-A01 機櫃定位
├── Task-002: [李四] SS-A02 機櫃定位
└── Task-003: [王五] 材料搬運至 SS-A

2024-04-02:
├── Task-004: [張三] SS-A01 內部設備組裝
├── Task-005: [李四] SS-A02 內部設備組裝
└── Task-006: [王五] SS-A01 配線準備

...
```

### Task 屬性

```typescript
interface Task {
  id: string;                  // Task-001
  workPackageId: string;       // WP-001
  title: string;               // SS-A01 機櫃定位
  assignedTo: string;          // 張三
  status: TaskStatus;          // Pending, InProgress, Completed
  priority: Priority;          // High, Medium, Low
  estimatedTime: number;       // 小時
  actualTime?: number;
  blockers?: string[];         // 阻礙因素
  dependencies?: string[];     // 依賴的其他 Task
}
```

### 動態產生

Task 由以下方式產生：
1. **Process 建議**：根據 WP 的標準流程
2. **主管手動**：現場判斷需要額外工作
3. **自動觸發**：前一個 Task 完成後自動建議
4. **例外處理**：發現問題時臨時建立

### 特性

- **高動態性**：每天都在建立、調整、取消
- **極細粒度**：通常以「小時」或「半天」為單位
- **現場導向**：反映實際執行情況
- **輕量級**：可以快速建立和拋棄

### Event Sourcing 設計

```typescript
// Task 層事件（高頻）
TaskCreated
TaskAssigned
TaskStarted
TaskCompleted
TaskBlocked
TaskUnblocked
TaskReassigned
TaskCancelled
TaskPriorityChanged
```

**原則**：Task 層事件頻繁，是系統的核心事件來源。

## WBS 層次對應表

| 層次          | 粒度   | 變動頻率 | 事件頻率 | 規劃時機  | 主要用途    |
| ----------- | ---- | ---- | ---- | ----- | ------- |
| Contract    | 粗    | 極低   | 極低   | 簽約前   | 財務、法律   |
| Work Package | 中    | 低    | 中    | 開工前/執行中 | 進度、資源分配 |
| Task        | 細    | 高    | 高    | 每日    | 執行、追蹤   |

## WBS 與 Event Sourcing 整合

### 事件流向

```
Contract Event
   ↓ triggers
Work Package Event
   ↓ triggers
Task Event
```

### 追溯鏈

```
Task-001: SS-A01 機櫃定位
   ↑ belongs to
WP-001: SS-A 區機櫃安裝
   ↑ belongs to
Contract Item 001: Frontend 設備安裝
```

### Causality 設計

```typescript
// Task 事件包含完整追溯鏈
interface TaskCreatedEvent {
  taskId: string;
  workPackageId: string;      // 所屬 WP
  contractItemId: string;     // 所屬合約項次
  causedBy: string[];         // 前驅事件
  // ...
}
```

## WBS 分解原則

### 100% 規則

所有 Work Package 的總和 = Contract Item 的完整範圍

```
Contract Item 001: 16 SET Frontend 設備
= WP-001 (8 SET) + WP-002 (8 SET)
```

### 互斥規則

Work Package 之間不重複、不遺漏

```
❌ 錯誤：
WP-001: SS-A01 ~ SS-A08
WP-002: SS-A05 ~ SS-B08  // 重複 A05-A08

✅ 正確：
WP-001: SS-A01 ~ SS-A08
WP-002: SS-B01 ~ SS-B08
```

### 可測量規則

每個 Work Package 都有明確的完成標準

```
WP-001 完成 = 8 SET 機櫃全部通過驗收
```

### 可指派規則

每個 Work Package 都有明確的負責人

```
WP-001: 張三組
WP-002: 李四組
```

## WBS 與財務整合

### 請款綁定

```
Contract Item 001: 2,639,062 TWD
├── 完成 30% → 請款 30% → 791,718 TWD
│   └── WP-001 完成（8 SET）
├── 完成 60% → 請款 30% → 791,718 TWD
│   └── WP-002 完成（8 SET）
└── 完成 100% → 請款 40% → 1,055,624 TWD
    └── WP-003 驗收完成
```

### 成本追蹤

```typescript
interface WorkPackageCost {
  workPackageId: string;
  budgetedCost: number;      // 預算成本
  actualCost: number;        // 實際成本
  variance: number;          // 差異
  tasksCompleted: number;    // 完成任務數
  tasksTotal: number;        // 總任務數
  progress: number;          // 完成度 %
}
```

## WBS 工具與視覺化

### Gantt Chart

```
WP-001 |████████░░░░░░░░| 50%
WP-002 |░░░░░░░░████████| 50%
WP-003 |░░░░░░░░░░░░░░░░| 0%
```

### Tree View

```
📋 Contract Item 001
 ├─ 📦 WP-001 (進行中 50%)
 │   ├─ ✅ Task-001
 │   ├─ ✅ Task-002
 │   ├─ 🔄 Task-003
 │   └─ ⏸️ Task-004
 ├─ 📦 WP-002 (規劃中)
 └─ 📦 WP-003 (等待中)
```

### Board View（Task 層）

```
待辦 (Pending) | 進行中 (InProgress) | 已完成 (Completed)
--------------+--------------------+------------------
Task-004      | Task-003           | Task-001
Task-005      |                    | Task-002
Task-006      |                    |
```

## 最佳實踐

### 1. 分解粒度適中

- Work Package：1-4 週
- Task：2-8 小時

### 2. 保持靈活性

- Contract 層：嚴格
- Work Package 層：可調整
- Task 層：完全靈活

### 3. 追蹤完成度

```typescript
function calculateProgress(wp: WorkPackage): number {
  const tasks = getTasksForWorkPackage(wp.id);
  const completed = tasks.filter(t => t.status === 'Completed').length;
  return (completed / tasks.length) * 100;
}
```

### 4. 管理依賴關係

```typescript
// WP 依賴
WP-002 depends on WP-001 完成 50%

// Task 依賴
Task-004 depends on Task-003 完成
```

---

**版本**: 1.0  
**更新日期**: 2024-12-31  
**維護者**: Architecture Team
