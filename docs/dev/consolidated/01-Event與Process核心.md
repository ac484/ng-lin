# Event 與 Process 核心

## Event-Sourced Process System 的核心組件

### 1. Event (事件)
記錄「發生了什麼」的已完成事實

**特性:**
- 不可變 (Immutable)
- 完整可追溯 (Traceable)
- 永久保存 (Permanent)

**範例:**
```typescript
interface DomainEvent {
  readonly eventId: string;
  readonly eventType: string;
  readonly aggregateId: string;
  readonly timestamp: Date;
  readonly causedBy: string[];  // 因果關係
  readonly data: unknown;
}
```

**Event 類型範例:**
```
- OrderCreated (訂單已建立)
- PaymentCompleted (付款已完成)
- TaskCompleted (任務已完成)
- MilestoneAchieved (里程碑達成)
```

### 2. Process (流程)
定義「事情如何流動」的流程編排

**特性:**
- 標準化流程定義
- 可重複使用
- 支援流程變體

**範例:**
```
標準 SCADA 安裝流程:
1. 現場勘查
2. 材料進場檢驗
3. 機櫃搬運定位
4. 內部設備組裝
5. 配線施工
6. 測試驗收
```

**Process 的價值:**
```
- 標準化: 確保品質一致
- 可重複: 相同工作用相同流程
- 可變體: 允許特殊情況調整
- 可優化: 持續改進標準流程
```

### 3. Task (任務)
表達「需要做什麼」的待辦項目

**特性:**
- 需要人類決策或操作的檢查點
- 動態產生,靈活調整
- 短期的、可變的、可拋棄的

**Task 狀態:**
```
- Pending (等待執行)
- Assigned (已指派)
- In Progress (執行中)
- Blocked (被阻擋)
- Completed (完成)
- Cancelled (取消)
- Skipped (跳過)
```

## 三者的關係

### Event → Process → Task 的流動

```
Event 發生
  ↓
Process 判斷下一步
  ↓
建議產生 Task
  ↓
Task 執行完成
  ↓
產生新的 Event
  ↓
循環繼續
```

### 實際場景範例

```
Event: SS-A01機櫃定位完成
  ↓
Process 判斷: 接下來要配線
  ↓
系統提示: "是否建立 SS-A01 配線 Task?"
  ↓
主管確認: 是
  ↓
產生 TaskCreated Event
  ↓
Task: SS-A01 配線 [張三組]
  ↓
Task 完成後產生 Event: TaskCompleted
```

## 合約層次架構

### Layer 1: Contract Level (合約層)
對應合約的工項和項次
- 承諾要交付什麼
- 金額、交期都在此定義
- 幾乎不會變動

**範例:**
```
項次 110: Frontend 機櫃 16 SET
金額: 2,639,062 TWD
交期: 2024-06-30
```

### Layer 2: Work Package Level (工作包層)
對應實際要執行的工作包
- 規劃怎麼做
- 開工前或邊做邊調整

**範例:**
```
WP-SS-A01: SS-A區機櫃安裝
- 現場勘查與測量
- 材料備料與檢驗
- 機櫃搬運與定位
- FrontEnd 配線
- 測試與驗收
```

### Layer 3: Task Level (任務層)
對應現場實際的待辦事項
- 今天誰做什麼
- 完全動態產生

**範例:**
```
2024-03-15:
- Task-001: [張三] SS-A01 機櫃定位
- Task-002: [李四] SS-A01 配線準備
- Task-003: [王五] 材料搬運至 SS-A
```

## 設計原則

### 1. Event 純粹記錄狀態
不應包含執行邏輯

```typescript
// ✓ 好的設計
interface TaskCompletedEvent {
  type: 'TaskCompleted';
  taskId: string;
  completedAt: Date;
  completedBy: string;
}

// ✗ 不好的設計
interface TaskEvent {
  execute: () => Promise<void>;  // 違反不可變性
}
```

### 2. Process 協調而非控制
Process 建議下一步,但不強制

```
Process: "建議建立配線 Task"
主管: 可以接受、修改或拒絕
結果: 尊重現場判斷
```

### 3. Task 輕量靈活
不是嚴格的工作流程,是靈活的工作記錄

```
特性:
- 快速建立/修改/取消
- 清楚記錄「誰做了什麼」
- 方便匯總「進度到哪裡」
```

## 總結

**Event-Sourced Process System** 的核心是:
1. **Event** 記錄歷史真相
2. **Process** 定義標準流程
3. **Task** 適應現場實際

透過這三個核心概念,系統能夠:
- ✓ 完整追溯歷史
- ✓ 靈活應對變化
- ✓ 清晰責任歸屬
