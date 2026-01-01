# Task 動態管理

## Task 的動態性

### 現場第一原則

**早上的計畫:**
```
Task-001: SS-A01 配線 [張三組 3人]
Task-002: SS-A02 配線 [李四組 4人]
```

**下午的調整:**
```
Task-001: Blocked (Relay 規格不符)
Task-002: Reassigned → 張三組 (李四組支援)
Task-003: Created (確認 Relay 規格) [緊急]
Task-004: Created (SS-A03 配線) [提前開始]
```

**所有變更都有 Event 記錄**

## 人員調動處理

### 情境 A: 人員減少

```
早上: Task-001 [張三組 3人]
下午: 王五請假
→ TaskUpdated: 人數改為 2人
→ 註記: 王五請假
→ 評估是否需要延後
```

### 情境 B: 人員調派

```
張三組人力不足
→ TaskReassigned: 張三組 → 李四組
→ 註記: 人力不足,調派支援
```

### 情境 C: 臨時支援

```
Task-001 遇到困難
→ TaskUpdated: 增加 2人支援
→ 註記: 王五組 2人臨時支援
→ 完成後計算實際人工
```

## 現場靈活調整案例

### 案例 1: 材料延遲

**原計畫:**
```
Day 1: Task-001 機櫃定位
Day 2: Task-002 配線施工
Day 3: Task-003 測試驗收
```

**實際執行:**
```
Day 1: 
  Task-001 Completed ✓
  發現: 配線材料未到

Day 2:
  Task-002 Cancelled (材料未到)
  Task-004 Created (提前進行其他區域)
  
Day 3:
  材料到達
  Task-002 Recreated (配線施工)
  Task-003 Postponed
```

### 案例 2: 設計變更

**原計畫:**
```
SS-A 區: 8 個機櫃
預計 Task: 8 個
```

**業主變更:**
```
SS-A 區改為: 6 個機櫃

處理:
Task-007 Cancelled (機櫃 7)
Task-008 Cancelled (機櫃 8)
Contract Updated Event
財務調整 Event
```

### 案例 3: 天氣影響

```
Task-001: 屋外配線 [計畫 2天]

Day 1:
  08:00 TaskStarted
  10:30 TaskBlocked (下雨)
  註記: "豪雨,無法施工"
  
  調整:
  Task-002 Created (室內工作)
  人力轉移至 Task-002
  
Day 2:
  天氣好轉
  Task-001 Resumed
  Task-001 Completed
```

## 緊急任務插入

### 緊急情境處理

```
正常進行中:
  Task-001: 配線施工 [進度 50%]
  Task-002: 機櫃組裝 [進度 30%]

緊急狀況:
  發現: SS-A01 Relay 規格錯誤
  
處理:
  Task-003 Created [優先級: 緊急]
  標記: "Relay 規格確認"
  指派: 技術主管
  
  Task-001 Paused (等待 Task-003)
  Task-002 Continue (不受影響)
```

## 進度監控與預警

### 自動進度追蹤

```
Work Package: WP-SS-A01
  總計: 10 Tasks
  完成: 6 Tasks (60%)
  進行中: 2 Tasks
  等待: 2 Tasks
  
預期完工: 2024-03-20
目前進度: 60%
預測: 可能延遲 1 天 (Task-001 阻擋)
```

### 預警機制

**延遲預警:**
```
Task-001: 預計 1 天,已執行 1.5 天
→ 預警: 可能延遲
→ 原因: 阻擋 4 小時
→ 建議: 增加人力或調整計畫
```

**資源預警:**
```
本週剩餘工作量: 80 人時
可用人力: 10 人 × 3 天 = 30 人時
→ 預警: 人力不足
→ 建議: 請求支援或調整計畫
```

## 多 Task 協調

### 順序依賴

```
Task-001: 機櫃定位 (前置)
  ↓ 完成後才能開始
Task-002: 配線施工 (依賴 Task-001)
  ↓ 完成後才能開始
Task-003: 測試驗收 (依賴 Task-002)
```

**實作:**
```typescript
interface TaskDependency {
  taskId: string;
  dependsOn: string[];  // 前置 Task IDs
  canStartWhen: 'all' | 'any';
}

// Task-002 等待 Task-001
{
  taskId: "task-002",
  dependsOn: ["task-001"],
  canStartWhen: "all"
}
```

### 並行執行

```
Task-001: SS-A01 配線
Task-002: SS-A02 配線
Task-003: SS-A03 配線

可同時進行,需要 3 組人力
```

## Task 分割與合併

### 分割 (Split)

```
原 Task: SS-A 區配線 [太大]

分割為:
  Task-001A: SS-A01~A04 配線
  Task-001B: SS-A05~A08 配線
```

### 合併 (Merge)

```
原 Tasks:
  Task-001: SS-A01 清潔
  Task-002: SS-A02 清潔

合併為:
  Task-004: SS-A 區整體清潔
```

## 總結

Task 動態管理的核心:
1. **現場優先** - 尊重現場判斷
2. **靈活調整** - 快速回應變化
3. **完整記錄** - 所有變更都有 Event
4. **預警機制** - 提前發現問題
5. **協調管理** - 處理依賴與並行
