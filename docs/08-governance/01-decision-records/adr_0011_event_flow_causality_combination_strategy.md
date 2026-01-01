# ADR-0011: Event-Flow & Causality 技術組合策略

## Status
✅ Accepted (2025-12-31)

## Context (事實)
Event-Flow 與 Causality 是 ng-lin 的核心架構支柱，但單純的事件流不足以發揮最大價值。需要與其他技術模式組合，才能實現：
- 可擴展的讀模型
- 長流程可控
- Replay 可行
- 不重複執行
- 未來推演

需要明確定義推薦的技術組合策略，並說明每種組合的適用場景與成熟度要求。

## Decision

### 核心組合（⭐⭐⭐⭐⭐ 必須）

#### 1️⃣ Event-Flow + CQRS（經典王炸）
**為什麼是 1+1>2**：
- Event = 寫入真相
- Query = 多種投影
- 因果鏈讓你知道「哪個 write 造成哪個 read 結果」

**質變**：
- 同一組事件 → N 種 view
- 無需 schema migration
- Debug = replay

**ng-lin 實現**：
```
TaskCreated (Event)
  ↓
List View (Projection)
Board View (Projection)
Timeline View (Projection)
Why View (Projection)
```

**決策**：✅ 必須實施

#### 2️⃣ Event-Flow + Saga / Process Manager
**為什麼**：
- 事件描述「已發生」
- Saga 描述「還在走的路」

**質變**：
- 長流程不再塞進 Aggregate
- 因果鏈清楚

**ng-lin 實現**：
```
TaskCreated
→ Saga: NotifyCollaborators
→ CollaboratorNotified
→ Saga: WaitForAcceptance
→ InvitationAccepted
```

**決策**：✅ 必須實施

#### 3️⃣ Event-Flow + Idempotency / Exactly-Once
**為什麼**：
- Event 重播不可避免
- 因果鏈可能重送

**質變**：
- 重播 ≠ 重複操作
- 系統「可重試」

**ng-lin 實現**：
- 每個 event 有唯一的 `causation_id`
- Event handler 檢查 `causation_id` 是否已處理

**決策**：✅ 建議實施（優先級高）

### 進階組合（⭐⭐⭐⭐ 建議）

#### 4️⃣ Event-Flow + Snapshot / Checkpoint
**為什麼**：
- Replay 成本下降
- 啟動時間可控

**質變**：O(N) → O(1) + Δ

**ng-lin 實現**：
- Task aggregate snapshot
- Projection snapshot
- 每 1000 events 或每天一次

**決策**：⚠️ 視效能需求決定（建議 V1.x 後實施）

#### 5️⃣ Event-Flow + Outbox Pattern
**為什麼**：
- DB commit ≠ message publish
- Outbox 保證一致性

**質變**：不會出現「狀態變了但事件沒發」

**ng-lin 實現**：
- Firebase transaction + Firestore outbox collection
- Guaranteed event delivery

**決策**：⚠️ 視分散式需求決定（可選）

#### 6️⃣ Event-Flow + Time-Travel / Replay Engine
**為什麼**：
- Event 本來就為 replay 而生
- Causality 讓 replay 有順序

**質變**：
- Debug = 播放歷史
- 策略回測 = 真實歷史

**ng-lin 實現**：
- 任何時間點的 Task 狀態重建
- "What-If" 分析工具

**決策**：✅ 必須實施（核心功能）

### 高階組合（⭐⭐⭐⭐⭐ 進階）

#### 7️⃣ Event-Flow + Deterministic Core / Pure Domain
**為什麼**：
- replay = 完全一致
- bug 可被重現
- simulation 可信

**ng-lin 實現**：
```typescript
// Pure function: event + state → new state
function applyTaskCreated(
  state: TaskState,
  event: TaskCreatedEvent
): TaskState {
  // No I/O, no random, no time
  return {
    ...state,
    id: event.data.taskId,
    title: event.data.title,
    status: 'created',
    createdAt: event.occurred_at
  };
}
```

**決策**：✅ 必須實施（架構基礎）

#### 8️⃣ Event-Flow + State Machine
**為什麼**：
- Event 驅動狀態轉移
- 非任意跳轉

**質變**：
- 不可能狀態被消滅
- Replay 自動驗證合法性

**ng-lin 實現**：
- Task lifecycle state machine
- 狀態轉換規則明確定義

**決策**：⚠️ 可選（使用 XState 時）

#### 9️⃣ Event-Flow + Observability (Trace / Span)
**為什麼**：
- Trace 看「怎麼跑」
- Event 看「發生什麼」

**質變**：技術 + 業務雙視角

**ng-lin 實現**：
- OpenTelemetry 整合（可選）
- NgRx DevTools（必須）

**決策**：✅ NgRx DevTools 必須，OpenTelemetry 可選

#### 🔟 Event-Flow + Simulation / What-If Engine
**為什麼**：
- 事件是 deterministic input
- 模擬是 pure function

**質變**：
- 策略 A/B test
- 參數壓測

**ng-lin 實現**：
- "What-If" view
- 模擬不同的 decision rules

**決策**：⚠️ V2.0+ 考慮實施

## Rationale (為什麼)

### 成熟度對照（什麼時候該加）

| 成熟度 | 推薦組合 | ng-lin 階段 |
|-------|---------|------------|
| 初期 | CQRS + Saga | ✅ V1.0 |
| 成長 | Snapshot + Replay | ⚠️ V1.x |
| 成熟 | Deterministic Core + Idempotency | ✅ V1.0 |
| 進階 | Observability + Simulation | ⚠️ V2.0+ |

### 為何這些組合而非其他

#### 不會有 1+1>2 的組合
- ❌ Event + CRUD UI：會混亂事實與操作
- ❌ Event + Chatty API：會造成事件爆炸
- ❌ Event + 每秒 tick data：應使用 Time-series DB
- ❌ Event + 同步 RPC 思維：違反 Event 天生 async 特性

### ng-lin 的組合策略

#### V1.0（初期）- 必須
```
Event-Flow
  + CQRS（多視圖）
  + Saga（協作流程）
  + Deterministic Core（純函數 projection）
  + Time-Travel（debug 工具）
  + NgRx DevTools（開發者工具）
```

#### V1.x（成長）- 視需求
```
+ Snapshot（如果 replay 變慢）
+ Idempotency（如果有重複執行問題）
+ State Machine（如果狀態轉換複雜）
```

#### V2.0+（成熟）- 進階
```
+ Outbox Pattern（如果需要分散式保證）
+ OpenTelemetry（如果需要分散式追蹤）
+ Simulation Engine（如果需要 What-If 分析）
```

### 組合總覽表（架構選型參考）

| 組合 | 質變 | ng-lin 狀態 |
|-----|------|------------|
| Event + CQRS | 可擴展讀模型 | ✅ 已實施 |
| Event + Saga | 長流程可控 | ✅ 已實施 |
| Event + Snapshot | Replay 可行 | ⚠️ 待實施 |
| Event + Idempotency | 不重複執行 | ⚠️ 部分實施 |
| Event + Outbox | 不說謊 | ❌ 未實施 |
| Event + Replay | Debug/回測 | ✅ 已實施 |
| Event + Simulation | 未來推演 | ❌ 未規劃 |

## Consequences (後果)

### 正面影響
- 清晰的技術組合策略
- 分階段實施，避免過度設計
- 每個組合都有明確的價值主張
- 支援系統逐步演進

### 負面影響
- 需要團隊理解多種模式
- 初期實施成本較高
- 需要持續維護與優化

### 對 L0/L1/L2 的影響
- **L0 (Core)**：提供所有組合的抽象基礎
- **L1 (Infrastructure)**：實現具體的組合模式（CQRS、Saga、Snapshot）
- **L2 (Features)**：使用組合模式構建業務功能

### Replay / Simulation 影響
- CQRS 使 Replay 可以產生多種視圖
- Deterministic Core 保證 Replay 結果一致
- Snapshot 大幅提升 Replay 效能
- Simulation 需要 Pure Domain + Time-Travel 支援

## Follow-up / Tracking (追蹤)

### V1.0 實施檢查點
- [x] CQRS（多視圖 Projection）
- [x] Saga/Process Manager
- [x] Deterministic Core（Pure Projection Functions）
- [x] Time-Travel（NgRx DevTools）
- [ ] Idempotency（部分實施，需完善）

### V1.x 考慮實施
- [ ] Snapshot/Checkpoint（監控 replay 時間）
- [ ] State Machine（使用 XState）
- [ ] 完整 Idempotency 支援

### V2.0+ 進階功能
- [ ] Outbox Pattern（分散式場景）
- [ ] OpenTelemetry（分散式追蹤）
- [ ] Simulation Engine（What-If 分析）

### 重新檢視時機
- 每個版本發布後 review 組合效果
- 當發現新的效能瓶頸時
- 當業務需求需要新的組合時

### 相關 ADR
- ADR-0007: Event Sourcing 不適用場景
- ADR-0008: Event Sourcing 適用場景
- ADR-0009: Event Sourcing 可選功能
- ADR-0010: Angular & NgRx 技術棧選型
- ADR-0006: Projection Engine Architecture
- ADR-0005: Task as Single Business Entity

---

**參考文件**：docs/dev/Causality-Driven Event-Sourced Process System/Suggested.md
