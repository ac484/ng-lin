# ADR-0005: Task 作為唯一業務實體

## Status
Accepted

## Context (事實)
- `docs/dev/0-目錄-v2-Task-SaaS.md` 和 `docs/dev/Task.md` 明確規定 Task 是唯一業務實體
- 目前 `src/app/features/domains/` 存在多個獨立 domain：activity/, attachment/, comment/, discussion/, issue/, task/, user/
- 違反 Event Sourcing 單一 Aggregate Root 原則
- 跨實體一致性問題複雜化因果鏈追蹤
- 無法完整實施 State = replay(events) 原則

## Decision
- **Task 是系統中唯一的業務實體 (Aggregate Root)**
- Comment, Discussion, Attachment 轉為 Task 的事件類型
- Activity 刪除，通過 Task Events 自動追蹤
- Issue 合併到 Task (本質上是 Task 的一種類型)
- User 移至 Platform Layer (`platform/entities/user/`)

## Rationale (為什麼)
**為什麼不是多個業務實體**:
- 違反專案核心架構原則 (Task.md 明確規定)
- 跨實體一致性問題導致技術債累積
- 無法實現完整的事件溯源和因果追蹤
- 增加 Projection 和 Replay 的複雜度

**為什麼 Comment/Discussion/Attachment 是事件而非實體**:
- 它們依附於 Task 存在，沒有獨立生命週期
- 所有操作都是 Task 狀態的一部分
- 符合 DDD Aggregate 設計原則

**為什麼 Issue 合併到 Task**:
- Issue 和 Task 本質相同，只是類型不同
- 統一處理簡化領域模型
- 避免重複的業務邏輯

**對應拒絕的 Anti-pattern**:
- AP-01: Aggregate per Entity (每個實體都是 Aggregate)
- AP-03: CRUD-Driven Design (CRUD 驅動設計)

## Consequences (後果)

### 對 L0 (Core/Infrastructure) 的影響
- ✅ 無影響，Core 層已準備好支援單一 Aggregate
- ✅ Event Store 完整支援 causedBy 追蹤

### 對 L1 (Platform) 的影響
- ⚠️ User 從 features/domains 移至 platform/entities
- ✅ Platform 層架構更清晰

### 對 L2 (Features/Task) 的影響
- ❌ 需要重構現有多個 domain
- ❌ Comment, Discussion, Attachment 功能需遷移為 Events
- ❌ Issue 功能需合併到 Task
- ✅ 遷移後架構符合 Task.md 原則

### Replay / Simulation 影響
- ✅ 單一 Event Stream 簡化 Replay
- ✅ 完整的因果鏈追蹤
- ✅ 支援 Time Travel 和 Event Replay

### 遷移策略
**Phase 1 (Week 1)**: 建立 Projection Engine 和 Task Events 骨架
**Phase 2 (Week 2)**: 遷移功能並刪除舊結構
**Phase 3 (Week 2)**: 驗證測試和文件更新

## Follow-up / Tracking (追蹤)
- 2026-01-07: 檢視 Phase 1 完成度
- 2026-01-14: 檢視完整遷移狀態
- 2026-02-01: 回顧架構合規性和效能
- 當 Task Domain 擴展超過 10 種 Event 類型時，重新評估 Aggregate 設計

## Related
- ADR-0001: Event Versioning Strategy
- ADR-0002: ESLint Architecture Enforcement
- `docs/dev/0-目錄-v2-Task-SaaS.md` - 架構定義
- `docs/dev/Task.md` - Task 領域規範
- `docs/dev/REFACTORING-PLAN.md` - 重構計劃
