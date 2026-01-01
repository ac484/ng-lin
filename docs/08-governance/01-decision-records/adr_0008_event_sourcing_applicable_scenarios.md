# ADR-0008: Event Sourcing 適用場景 (白名單)

## Status
✅ Accepted (2025-12-31)

## Context (事實)
Event Sourcing 是 ng-lin 的核心架構模式，但需要明確定義哪些場景**必須**使用 Event Sourcing，以確保系統的一致性與可維護性。

根據 "We model reality as immutable events" 的核心原則，需要建立明確的白名單來指導開發。

## Decision
以下場景**必須**或**強烈建議**使用 Event Sourcing：

### 一、最核心的適合場景（必要級）✅

#### 1️⃣ 不可否認、不可刪除的業務事實
**必須記錄**：
- TaskCreated
- TaskStarted
- TaskCompleted
- CommentAdded
- CollaboratorAssigned

**理由**：發生過就不能假裝沒發生，State 只是 event 的投影。

#### 2️⃣ 狀態是「被推導」出來的
**判斷法**：沒有歷史，我無法知道現在為什麼是這樣

**必須記錄**：
- Task 狀態演進
- 團隊成員變化
- 權限授予/撤銷

**Event Flow 範例**：
```
TaskCreated
→ CollaboratorAssigned
→ TaskStarted
→ CommentAdded
→ TaskCompleted
```

#### 3️⃣ 需要 Replay / Time Travel
**必須支援**：
- 回放歷史狀態
- 模擬不同決策路徑
- 重建 bug 現場
- 審計追蹤

### 二、進階但非常強的適合場景 ✅

#### 4️⃣ 複雜因果鏈（不是單一步驟）
**特徵**：多步驟、可中斷、有條件分支

**適合**：
```
TaskCreated
→ CollaboratorInvited
→ InvitationAccepted
→ TaskStarted
→ ProgressUpdated
→ TaskCompleted
```

#### 5️⃣ 非同步、最終一致流程
**適合**：
- 跨團隊協作
- 外部系統整合
- 延遲確認的操作

#### 6️⃣ 需要「解釋為什麼」的系統
**適合**：
- 權限變更記錄
- 狀態轉換原因
- 決策過程追蹤

### 三、Task Domain 專屬適合場景 ✅

#### 7️⃣ 決策點（Decision Boundary）
**必須記錄**：
- TaskStartApproved / TaskStartRejected
- CommentModerated
- AccessGranted / AccessDenied

**理由**：決策點是業務邏輯的核心，必須完整記錄。

#### 8️⃣ 協作與權限演進
**必須記錄**：
- 任何權限變化
- 團隊結構變化
- 角色指派

#### 9️⃣ Task 生命週期
**必須記錄**：
```
TaskCreated
TaskStarted
TaskPaused
TaskResumed
TaskCompleted
TaskArchived
```

### 四、架構層級適合點 ✅

#### Domain 層（最適合）
**95% 的 event 應該在這**：
- Aggregate 內狀態轉換
- Business invariant 被觸發
- Command → Event

#### Application / Process 層
**事件串流程**：
- Saga
- Long-running flow
- Cross-aggregate coordination

#### Infrastructure 層（幾乎不用）
**只負責 deliver / persist**，不創造業務事件

## Rationale (為什麼)

### 最終判斷公式
一個變化**適合**用 Event，如果同時滿足：

1. ✅ 發生後不能撤銷
2. ✅ 沒它無法解釋現在
3. ✅ Replay 有價值
4. ✅ 名字可以念成一句話
5. ✅ 業務能看懂

只要有**一條不成立** → 慎用  
有**兩條不成立** → 不要用

### Task Domain Event 白名單（必須有）

#### Task Lifecycle（任務生命週期）✅
```
TaskCreated
TaskStarted
TaskPaused
TaskResumed
TaskCompleted
TaskArchived
TaskDeleted (soft delete)
```

#### Collaboration（協作）✅
```
CollaboratorAdded
CollaboratorRemoved
RoleAssigned
RoleRevoked
PermissionGranted
PermissionRevoked
```

#### Content（內容）✅
```
TaskTitleUpdated
TaskDescriptionUpdated
CommentAdded
CommentEdited
CommentDeleted
AttachmentUploaded
AttachmentRemoved
```

#### Progress（進度）✅
```
ProgressUpdated
DueDateChanged
PriorityChanged
StatusChanged
```

### 核心原則
> **Event Sourcing 記的是「承擔過的後果」，不是「看過的世界」。**
> **Task 的每個狀態變化都是不可否認的事實。**

### 為何不用其他方案
- **不用傳統 CRUD**：無法追溯歷史、無法 replay、無法審計
- **不用單純 Audit Log**：無法重建狀態、無法支援多視圖
- **不用 State Machine without Events**：無法回放、無法分析因果

## Consequences (後果)

### 正面影響
- 完整的歷史追蹤
- 多視圖支援（List, Board, Why, Timeline）
- 可重現的系統行為
- 強大的審計能力
- 支援時間旅行與模擬

### 負面影響
- 學習曲線較陡
- 需要嚴格的事件設計紀律
- Event Store 需要適當的維護策略

### 對 L0/L1/L2 的影響
- **L0 (Core)**：提供 Event、Decision、Projection 抽象
- **L1 (Infrastructure)**：實現 Event Store（Firebase）
- **L2 (Task Domain)**：所有業務邏輯透過事件表達

### Replay / Simulation 影響
- 任何 Task 狀態可以透過 replay 重建
- 支援「What-If」分析
- 支援回測不同的業務規則

## Follow-up / Tracking (追蹤)

### 實施檢查點
- [ ] 所有 Task Domain 事件符合白名單
- [ ] 新增事件必須通過 5 條判斷標準
- [ ] Event 命名遵循 Ubiquitous Language

### Event 必備欄位（最低限）
每一個 Task Event，至少要有：
```typescript
{
  event_id: string;        // UUID
  aggregate_id: string;    // Task ID
  event_type: string;      // Event 類型
  occurred_at: number;     // Unix timestamp
  causation_id: string;    // 上一個事件
  correlation_id: string;  // 同一決策鏈
  data: T;                 // Event payload
}
```

### 白名單使用方式
1. Domain 層只能產生白名單事件
2. PR 檢查：事件名不在白名單 → 不准合併
3. 新事件一定要回答：
   > 「少了它，10 年後我還能解釋帳為什麼是這樣嗎？」

### 重新檢視時機
- 當發現無法用現有事件表達業務需求時
- 當事件數量持續異常增長時
- 每季度 review 事件使用情況

### 相關 ADR
- ADR-0007: Event Sourcing 不適用場景（反模式）
- ADR-0001: Event Versioning Strategy
- ADR-0005: Task as Single Business Entity
- ADR-0006: Projection Engine Architecture

---

**參考文件**：docs/dev/Causality-Driven Event-Sourced Process System/Enable.md
