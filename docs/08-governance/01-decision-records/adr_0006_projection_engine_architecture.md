# ADR-0006: Projection Engine 架構實作

## Status
Accepted

## Context (事實)
- Event Store 已完整實作 (Firebase + Supabase)
- Causality Tracking 機制完整 (causedBy, correlationId)
- Event Bus 基礎架構已建立
- 但缺少 Projection Engine，無法實現 State = replay(events)
- 缺少 Decision Layer，業務規則散落各處
- 缺少 Snapshot 機制，大量事件時效能問題
- 缺少 Process Manager (Saga)，跨流程協調困難

## Decision
實作完整的 Event Sourcing 架構組件:

1. **Projection Engine** (`src/app/core/projection/`)
   - ProjectionEngine interface
   - ProjectionBuilder abstract class
   - 支援從 Events 重建狀態

2. **Snapshot 機制**
   - SnapshotStore interface
   - 快照策略: 每 100 events 或每天
   - Firebase/Supabase 雙實作

3. **Decision Layer** (`features/domains/task/decisions/`)
   - 所有決策都是純函數
   - 從歷史 Events 推導狀態
   - 返回 Result<Event, Error>

4. **Process Manager** (`features/domains/task/processes/`)
   - 訂閱 Event Bus
   - 無狀態協調
   - 觸發下一步 Command

5. **Event Versioning**
   - Schema Evolution with Upcasters
   - 向後兼容保證

## Rationale (為什麼)

**為什麼不直接從資料庫讀取狀態**:
- 違反 Event Sourcing 原則: Events 是唯一事實來源
- 無法支援 Event Replay 和 Time Travel
- 無法保證完整的因果追蹤
- 對應 Anti-Pattern: AP-04 Projection as Truth

**為什麼需要 Snapshot**:
- 大量事件時 (>1000) Replay 效能問題
- 查詢效率優化: Snapshot + 增量 Events
- 不影響 Event Sourcing 原則

**為什麼 Decision 必須是純函數**:
- 保證確定性: 相同輸入總是相同輸出
- 易於測試和驗證
- 支援 Deterministic Replay
- 符合 Causality-Driven 原則

**為什麼需要 Process Manager**:
- 跨 Task 協調 (如依賴關係)
- 複雜業務流程編排
- 解耦 Task Aggregate 和外部流程
- 對應模式: Saga Pattern

**對應拒絕的 Anti-pattern**:
- AP-03: CRUD-Driven Design
- AP-04: Projection as Truth
- AP-06: Stateful Process Logic

## Consequences (後果)

### 對 L0 (Core) 的影響
- ✅ 新增 `core/projection/` 模組
- ✅ 完整 Event Sourcing 基礎設施
- ⚠️ 開發者需學習 Projection 概念

### 對 L1 (Platform) 的影響
- ✅ Platform Entities 可使用 Projection Engine
- ✅ 統一的狀態重建機制

### 對 L2 (Features/Task) 的影響
- ❌ 需實作 Task Decisions (純函數)
- ❌ 需實作 Task Projections (多視圖)
- ❌ 需實作 Task Processes (Saga)
- ✅ 實作後完整符合 Event Sourcing 架構

### Replay / Simulation 影響
- ✅ 支援完整 Event Replay
- ✅ 支援 Time Travel (回到任意版本)
- ✅ 支援 What-If Simulation (假設分析)
- ✅ Snapshot 優化 Replay 效能

### 效能指標
- Event Replay: <100ms for 1000 events
- Snapshot Creation: <50ms
- Projection Update: <10ms per event

### 測試策略
- Decision 層 Unit Tests 覆蓋率 >95%
- Projection 層 Unit Tests 覆蓋率 >95%
- Integration Tests: Event Store + Projection Engine
- E2E Tests: UI → Commands → Events → Projections → UI

## Follow-up / Tracking (追蹤)
- 2026-01-03: 檢視 Projection Engine 基礎實作
- 2026-01-07: 檢視 Snapshot 機制完成度
- 2026-01-10: 檢視 Decision Layer 實作
- 2026-01-14: 檢視 Process Manager 實作
- 2026-02-01: 效能指標驗證
- 每季度回顧 Snapshot 策略是否需要調整

## Related
- ADR-0001: Event Versioning Strategy
- ADR-0005: Task 作為唯一業務實體
- `docs/dev/Causality-Driven Event-Sourced Process System/Enable.md`
- `docs/dev/Causality-Driven Event-Sourced Process System/SYS.md`
- `docs/dev/consolidated/06-Event-Sourced架構設計.md`
- `src/app/core/projection/README.md`
