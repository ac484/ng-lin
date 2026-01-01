# Task 與 Causality

## Causality (因果關係)

### 什麼是 Causality-Driven

每個 Event 都記錄其因果關係:

```typescript
{
  eventId: "evt-002",
  eventType: "TaskStarted",
  causedBy: ["evt-001"]  // 由 TaskCreated 引發
}
```

### 因果鏈追溯

```
TaskSplit Event
  ↓ (caused)
TaskCreated Events (子任務)
  ↓ (caused)
TaskAssigned Events
  ↓ (caused)
TaskCompleted Events
  ↓ (caused)
TaskProgressUpdated Event (父任務)
```

### 為什麼需要因果關係?

1. **完整追溯**: 知道每件事為何發生
2. **責任歸屬**: 找出問題根源
3. **流程優化**: 分析瓶頸點
4. **審計合規**: 滿足稽核要求

### 實際範例

```
問題: SS-A01 配線延遲 2 天

追溯因果鏈:
1. TaskCompleted (SS-A01 配線)
   ← causedBy: TaskResumed
   
2. TaskResumed (SS-A01 配線)
   ← causedBy: TaskBlocked
   
3. TaskBlocked (SS-A01 配線)
   原因: "Relay 規格不符"
   ← causedBy: TaskStarted
   
4. TaskStarted (SS-A01 配線)
   ← causedBy: TaskCreated
   
5. 根本原因: Relay 規格錯誤
   責任: 採購部門
   改善: 建立 Relay 規格確認流程
```

## Event vs Task 的關鍵差異

### Event: 已發生的事實

```
事件記錄:
- OrderCreated (訂單已建立)
- PaymentCompleted (付款已完成)
- TaskCompleted (任務已完成)

特性:
- 過去式
- 不可改變
- 永久保存
- 記錄「發生了什麼」
```

### Task: 需要執行的工作

```
任務項目:
- ProcessPayment (處理付款)
- SendEmail (發送郵件)
- InstallCabinet (安裝機櫃)

特性:
- 未來式
- 可以取消
- 完成即消失
- 表達「需要做什麼」
```

### 關係說明

```
Task 執行過程中會產生 Events:
  TaskCreated → Task exists
  TaskStarted → Task 開始執行
  TaskCompleted → Task 執行完成
  
Task 完成後消失,但 Events 永遠保留
```

## 完整工作流程範例

```
Day 1:
  Event: ContractSigned
    → Process: 啟動流程
  Event: WorkPackageCreated
    → 建議: 建立現場勘查 Task
  Event: TaskCreated (現場勘查)

Day 2:
  Event: TaskAssigned → 王經理
  Event: TaskStarted
  Event: TaskCompleted
    → Process: 建議材料檢驗 Task
  Event: TaskCreated (材料檢驗)

Day 3:
  Event: TaskStarted (材料檢驗)
  Event: TaskBlocked (規格不符)
    → Process: 建議確認規格 Task
  Event: TaskCreated (確認規格)
  Event: TaskCompleted (確認規格)
  Event: TaskResumed (材料檢驗)
```

### Causality 串連

```
所有 Events 都有 causedBy 欄位:

TaskBlocked
  causedBy: TaskStarted
TaskCreated (確認規格)
  causedBy: TaskBlocked
TaskResumed
  causedBy: TaskCompleted (確認規格)
```

## 系統價值總結

### 透過 Causality 實現

1. **完整歷史**: 每個決策都有記錄
2. **責任明確**: 誰做了什麼一清二楚
3. **問題追溯**: 快速找到根本原因
4. **流程改善**: 分析瓶頸優化流程
5. **合規審計**: 滿足法規稽核需求

### Event-Sourced 的優勢

```
傳統系統:
  只記錄最終狀態
  歷史無法追溯
  難以分析問題

Event-Sourced:
  記錄所有變更
  完整歷史軌跡
  因果關係清晰
  支援時光倒流 (Replay)
```

### Process-Driven 的優勢

```
無流程系統:
  靠人工判斷下一步
  標準不一致
  難以優化

Process-Driven:
  自動建議下一步
  標準化流程
  持續優化改進
```

## 下一步

建議閱讀:
- 02A-Task生命週期.md (詳細了解 Task)
- 05A-Event-Sourcing基礎.md (深入 Event 設計)
- 08A-Process核心概念.md (Process 系統)
