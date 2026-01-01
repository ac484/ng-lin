# Task 生命週期

## Task 的本質

Task 是「需要人類決策或操作的檢查點」

**不是所有 Process 節點都需要 Task:**
- 自動計算、自動傳遞 → 不需要 Task
- 需要人工確認、人工輸入 → 需要 Task
- 需要實體操作(檢查設備、搬運物料) → 需要 Task

## Task 的 8 種狀態

### 1. 建立 (Created)

**觸發方式:**
```
A. Process 自動建議
B. 主管手動建立
C. 異常狀況建立
```

**Event 記錄:**
```typescript
Event: TaskCreated
  taskId: "task-001"
  title: "SS-A01 機櫃定位"
  createdBy: "王經理"
```

### 2. 指派 (Assigned)

```
Event: TaskAssigned
  assignedTo: "張三組"
  expectedPersonCount: 3
  estimatedDuration: "8 hours"
```

### 3. 開始 (Started)

```
Event: TaskStarted
  actualStartTime: "2024-03-15 08:00:00"
  startedBy: "張三"
  location: "SS-A 區域"
```

### 4. 進度更新 (Progressed)

**選擇性的進度回報:**
```
Event: TaskProgressed
  progress: 50  // 百分比
  notes: "機櫃已定位,正在固定"
  photos: ["photo-001.jpg"]
```

### 5. 阻擋 (Blocked)

**遇到問題暫停:**
```
Event: TaskBlocked
  blockedReason: "地板不平,需要墊片"
  blockType: "Material"
  photos: ["issue-001.jpg"]
```

**處理流程:**
```
1. 記錄阻擋原因
2. 拍照存證
3. 通知相關人員
4. 調配其他資源
5. 等待問題解決
```

### 6. 恢復 (Resumed)

```
Event: TaskResumed
  resolvedHow: "已補充墊片"
  resumedBy: "張三"
```

### 7. 完成 (Completed)

```
Event: TaskCompleted
  completedAt: "2024-03-15 16:00:00"
  actualDuration: "6 hours"
  actualManHours: 18  // 3人 × 6小時
  qualityCheck: "Passed"
```

### 8. 取消 (Cancelled)

```
Event: TaskCancelled
  cancelReason: "業主變更設計"
  cancelType: "DesignChange"
  approvedBy: "客戶代表"
```

## 狀態轉換圖

```
Created → Assigned → Started → Completed
   ↓         ↓          ↓
   ↓         ↓      → Blocked → Resumed → Completed
   ↓         ↓          ↓
   ↓         ↓      → Cancelled
   ↓         ↓
   ↓      → Cancelled
   ↓
→ Cancelled
```

## Task 與其他概念的整合

### Task → Milestone

```
Milestone: SS-A 區完工驗收
  ↓ 包含的 Tasks:
  - Task-001: SS-A01 機櫃安裝 ✓
  - Task-002: SS-A02 機櫃安裝 ✓
  - Task-003: SS-A 配線施工 ✓
  - Task-004: SS-A 測試驗收 ✓
  ↓ 全部完成
MilestoneAchieved Event
```

### Task → 日誌

**自動彙整今日 Tasks:**
```
2024-03-15 工程日誌:
- 完成: 2項
- 進行中: 1項 (60%)
- 阻擋: 1項 (材料未到)
- 總人工: 72 人時
```

### Task → 請款

```
本月完成 Tasks:
- 項次 110 相關: 15 Tasks
  → 完成進度: 75%
  → 可請款金額: 1,979,296 TWD

計算依據:
累計完成的 Task
→ 計算可請款比例
```

## Task 粒度建議

### 粒度原則

**一個 Task = 一組人 × 半天~2天**

**太細 (不建議):**
```
✗ Task: 鎖第一顆螺絲
✗ Task: 檢查溫度計讀數
```

**太粗 (不建議):**
```
✗ Task: 完成整個 SS-A 區
✗ Task: 完成所有機櫃安裝
```

**適當的粒度:**
```
✓ Task: SS-A01 機櫃搬運定位 (半天)
✓ Task: SS-A01 內部設備組裝 (1天)
✓ Task: SS-A01 配線施工 (1.5天)
✓ Task: SS-A01 測試調試 (半天)
```

## Task 資料結構

```typescript
interface Task {
  taskId: string;
  title: string;
  parentTaskId: string | null;
  workPackageId: string;
  status: 'Pending' | 'Assigned' | 'InProgress' | 
          'Blocked' | 'Completed' | 'Cancelled';
  assignedTo: string;
  progress: number;  // 0-100
  createdAt: Date;
  photos: string[];
}
```

## 總結

Task 管理的關鍵:
1. **8 種狀態** 覆蓋完整生命週期
2. **Event 記錄** 保留完整歷史
3. **靈活轉換** 適應現場變化
4. **自動整合** 與其他系統連動
