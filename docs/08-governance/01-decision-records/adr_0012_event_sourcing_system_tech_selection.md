# ADR-0012: Event Sourcing 系統技術選型總表

## Status
✅ Accepted (2025-12-31)

## Context (事實)
ng-lin 專案採用 Event Sourcing + Event Flow + Causality 架構，需要整合多種技術與模式來支援：
- 事件溯源（Event Sourcing）
- 事件流（Event Flow）
- 因果關係（Causality）
- 專案進度管理
- 風險評估與分析

需要一份完整的技術選型總表，明確指出哪些技術/模式是必備、建議或可選的。

## Decision

### 技術選型總表

| 技術/模式 | 建議 | 理由 | 核心對應 | ng-lin 狀態 |
|---------|------|------|----------|------------|
| **Event Sourcing** | ✅ 必備 | 核心事件存儲模式，所有狀態重建、回放和分析的基礎 | Event Sourcing | ✅ 已實施 |
| **Event Flow** | ✅ 必備 | 事件在系統中的流動與處理路徑，專案進度管理核心 | Event Flow | ✅ 已實施 |
| **Causality** | ✅ 必備 | 確保事件間因果關係，支撐風險評估和策略模擬 | Causality | ✅ 已實施 |
| **CQRS** | ✅ 必備 | 讀寫分離，支援多視圖 Projection | Event Sourcing | ✅ 已實施 |
| **Saga / Process Manager** | ✅ 建議 | 管理跨服務或模塊的長事務和補償邏輯 | Event Flow / Causality | ✅ 已實施 |
| **Idempotency / Exactly-Once** | ✅ 建議 | 保證事件重放不會造成重複操作 | Event Sourcing / Event Flow | ⚠️ 部分實施 |
| **Snapshot / Checkpoint** | ✅ 建議 | Event 累積後狀態重建成本增加，定期快照提升效率 | Event Sourcing | ❌ 未實施 |
| **Time-Travel / Replay Engine** | ✅ 建議 | 分析歷史事件、模擬不同策略、風險評估 | Event Sourcing / Causality | ✅ 已實施 |
| **Event Versioning Strategy** | ✅ 建議 | 保證事件演化過程不破壞舊流程 | Event Sourcing | ✅ 已實施 |
| **Temporal Queries** | ✅ 建議 | 基於事件的狀態查詢是進度管理與風險分析核心 | Event Sourcing / Causality | ✅ 已實施 |
| **Deterministic Core / Pure Domain** | ✅ 建議 | 保證事件和狀態可重現性 | Event Sourcing / Causality | ✅ 已實施 |
| **State Machine** | ✅ 建議 | 管理專案進度狀態、事件驅動流程 | Event Flow | ⚠️ 部分實施 |
| **Observability (Trace / Span)** | ✅ 建議 | 追蹤事件流程、性能與異常 | Event Flow / Causality | ⚠️ 部分實施 |
| **Causal Graph / Lineage View** | ✅ 建議 | 可視化事件因果關係 | Causality | ❌ 未實施 |
| **Self-Healing / Compensating** | ✅ 建議 | 自動補償失敗事件，保證進度一致性 | Event Flow / Causality | ⚠️ 部分實施 |
| **Human-Readable Event Narratives** | ✅ 建議 | 將事件轉為可讀敘述 | Event Sourcing / Causality | ❌ 未實施 |
| **Simulation / What-If Engine** | ✅ 建議 | 基於事件歷史模擬不同策略 | Event Sourcing / Causality | ❌ 未規劃 |
| **Outbox Pattern** | ✅ 可選 | 確保事件可靠輸出到其他系統 | Event Flow | ❌ 未實施 |
| **Decision Record / ADR** | ✅ 可選 | 記錄重要決策、分析風險背景 | Causality | ✅ 本 ADR |
| **Rule Engine / Policy Engine** | ✅ 可選 | 對複雜規則和風險控制有幫助 | Event Flow / Causality | ❌ 未實施 |
| **Anti-Corruption Layer (ACL)** | ✅ 可選 | 與外部系統交互時保護事件和狀態 | Event Flow | ❌ 未實施 |
| **Security / Tamper Evidence** | ✅ 可選 | 適合有合規需求的專案 | Event Sourcing / Causality | ❌ 未實施 |
| **Rate-Limited Event Emission** | ✅ 可選 | 對高頻事件系統防止過載 | Event Flow | ❌ 未實施 |
| **Chaos / Failure Injection** | ✅ 可選 | 測試系統對異常情況的韌性 | Event Flow / Causality | ❌ 未實施 |

## Rationale (為什麼)

### 優先級分類

#### 1. 必備核心（✅ 必須實施）
- **Event Sourcing**：系統基礎
- **Event Flow**：流程管理核心
- **Causality**：因果追蹤核心
- **CQRS**：多視圖支援

**理由**：這些是 ng-lin 的架構支柱，缺一不可。

#### 2. 強烈建議（⭐⭐⭐⭐⭐）
- **Saga/Process Manager**：複雜流程管理
- **Idempotency**：可靠性保證
- **Time-Travel**：除錯與分析
- **Deterministic Core**：可重現性
- **Event Versioning**：長期維護
- **Temporal Queries**：歷史查詢
- **State Machine**：狀態管理
- **Observability**：系統監控

**理由**：保證可靠性、可回放、可觀測、補償邏輯。

#### 3. 可選增強（⭐⭐⭐⭐）
- **Snapshot**：效能優化
- **Outbox Pattern**：分散式保證
- **ADR**：決策記錄
- **Causal Graph**：視覺化
- **Simulation**：What-If 分析

**理由**：根據專案規模、合規需求或高頻事件特性選擇。

### ng-lin 實施優先級

#### Phase 1: V1.0（核心功能）✅
- [x] Event Sourcing（Firebase Event Store）
- [x] Event Flow（NgRx Effects）
- [x] Causality（causation_id, correlation_id）
- [x] CQRS（Projection Engine）
- [x] Saga（Process Manager）
- [x] Deterministic Core（Pure Projection Functions）
- [x] Time-Travel（NgRx DevTools）
- [x] Event Versioning（ADR-0001）

#### Phase 2: V1.x（穩定性）⚠️
- [ ] 完整 Idempotency 支援
- [ ] Snapshot/Checkpoint（監控 replay 時間）
- [ ] State Machine（XState 整合）
- [ ] 完整 Observability（NgRx DevTools + 自定義監控）
- [ ] Compensating Logic（錯誤補償）

#### Phase 3: V2.0+（進階功能）❌
- [ ] Causal Graph 視覺化
- [ ] Human-Readable Narratives
- [ ] Simulation/What-If Engine
- [ ] Outbox Pattern（如需分散式）
- [ ] Rule Engine（如規則複雜化）
- [ ] Security/Tamper Evidence（如有合規需求）

### 為何此排序

1. **必備核心**（Event Sourcing / Event Flow / Causality）→ 核心架構，最優先
2. **建議強烈**（Saga, Idempotency, Time-Travel）→ 保證可靠性、可回放、可觀測
3. **可選**（Snapshot, Outbox, Simulation）→ 根據專案規模、合規需求選擇

### 對比其他架構模式

| 模式 | 優點 | ng-lin 為何不選 |
|-----|------|----------------|
| **傳統 CRUD** | 簡單易懂 | ❌ 無法追溯歷史、無法多視圖 |
| **Active Record** | 開發快速 | ❌ 無法支援 Event Sourcing |
| **Repository Pattern (無 ES)** | 抽象層清晰 | ❌ 缺少時間維度與因果 |
| **純 State Machine** | 狀態轉換清晰 | ❌ 無法回放、無法審計 |

## Consequences (後果)

### 正面影響
- 清晰的技術路線圖
- 分階段實施，避免過度設計
- 每個技術都有明確價值主張
- 支援系統逐步演進

### 負面影響
- 初期學習成本較高
- 需要維護多種技術組合
- 團隊需要深入理解 Event Sourcing

### 對 L0/L1/L2 的影響
- **L0 (Core)**：提供所有模式的抽象基礎
- **L1 (Infrastructure)**：實現具體技術（Firebase, NgRx）
- **L2 (Task Domain)**：使用技術組合構建業務功能

### 長期維護考量
- 定期更新依賴套件
- 監控效能與 Event Store 大小
- 根據實際需求調整技術組合

## Follow-up / Tracking (追蹤)

### V1.0 完成度檢查
- [x] Event Sourcing: 100%
- [x] Event Flow: 100%
- [x] Causality: 100%
- [x] CQRS: 100%
- [x] Saga: 100%
- [x] Deterministic Core: 100%
- [x] Time-Travel: 100%
- [x] Event Versioning: 100%

### V1.x 目標
- [ ] Idempotency: 0 → 100%
- [ ] Snapshot: 0 → 100%
- [ ] State Machine: 50% → 100%
- [ ] Observability: 50% → 100%
- [ ] Compensating Logic: 30% → 100%

### 監控指標
- [ ] Event Store 大小與成長速度
- [ ] Replay 時間（目標 < 1 分鐘）
- [ ] Projection 更新延遲（目標 < 100ms）
- [ ] 系統可用性（目標 > 99.9%）

### 重新檢視時機
- 每個主版本發布後
- 當發現效能瓶頸時
- 當業務需求變化時
- 每季度技術債務 review

### 相關 ADR
- ADR-0007: Event Sourcing 不適用場景
- ADR-0008: Event Sourcing 適用場景
- ADR-0009: Event Sourcing 可選功能
- ADR-0010: Angular & NgRx 技術棧選型
- ADR-0011: Event-Flow & Causality 技術組合策略
- ADR-0001: Event Versioning Strategy
- ADR-0006: Projection Engine Architecture

---

**參考文件**：docs/dev/Causality-Driven Event-Sourced Process System/SYS.md
