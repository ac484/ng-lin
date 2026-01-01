# 決策記錄 (ADR - Architecture Decision Records)

## ADR 模板

```markdown
# ADR-XXX: [決策標題]

## Status
[Proposed | Accepted | Deprecated | Superseded by ADR-YYY]

## Context
[描述需要決策的背景與問題]

## Decision
[描述做出的決策]

## Consequences
[描述決策的後果，包括正面與負面影響]

## Alternatives Considered
[描述考慮過但未採用的替代方案]
```

## 已記錄的 ADR

### 架構與規範

#### ADR-0001: Event Versioning Strategy
- **決策**: 事件版本化策略
- **理由**: 支援 Event Schema 演化
- **連結**: [01-decision-records/adr_0001_event_versioning_strategy.md](01-decision-records/adr_0001_event_versioning_strategy.md)

#### ADR-0002: ESLint Architecture Enforcement
- **決策**: 使用 ESLint 規則強制執行架構約束
- **理由**: 編譯時檢查，快速回饋
- **連結**: [01-decision-records/adr_0002_eslint_architecture_enforcement.md](01-decision-records/adr_0002_eslint_architecture_enforcement.md)

#### ADR-0003: RBAC Authorization System
- **決策**: 採用角色為基礎的授權系統
- **理由**: 靈活的權限管理
- **連結**: [01-decision-records/adr_0003_rbac_authorization_system.md](01-decision-records/adr_0003_rbac_authorization_system.md)

#### ADR-0004: Contract Versioning Strategy
- **決策**: 語義化版本 + 相容性檢查
- **理由**: 支援 Contract 演化
- **連結**: [01-decision-records/adr_0004_contract_versioning_strategy.md](01-decision-records/adr_0004_contract_versioning_strategy.md)

#### ADR-0005: Task as Single Business Entity
- **決策**: Task 作為唯一業務實體
- **理由**: 簡化領域模型，專注核心業務
- **連結**: [01-decision-records/adr_0005_task_as_single_business_entity.md](01-decision-records/adr_0005_task_as_single_business_entity.md)

#### ADR-0006: Projection Engine Architecture
- **決策**: 多視圖 Projection 引擎架構
- **理由**: 支援 List, Board, Why, Timeline 等多種視圖
- **連結**: [01-decision-records/adr_0006_projection_engine_architecture.md](01-decision-records/adr_0006_projection_engine_architecture.md)

### Event Sourcing 場景與模式

#### ADR-0007: Event Sourcing 不適用場景 (Anti-Patterns)
- **決策**: 定義不應使用 Event Sourcing 的場景
- **理由**: 避免技術債務累積，保持 Event Store 乾淨
- **連結**: [01-decision-records/adr_0007_event_sourcing_anti_patterns.md](01-decision-records/adr_0007_event_sourcing_anti_patterns.md)

#### ADR-0008: Event Sourcing 適用場景 (白名單)
- **決策**: 定義必須使用 Event Sourcing 的場景
- **理由**: 確保系統一致性與可維護性
- **連結**: [01-decision-records/adr_0008_event_sourcing_applicable_scenarios.md](01-decision-records/adr_0008_event_sourcing_applicable_scenarios.md)

#### ADR-0009: Event Sourcing 可選功能 (Optional Features)
- **決策**: 定義可選的 Event Sourcing 功能與使用時機
- **理由**: 根據實際需求靈活擴展功能
- **連結**: [01-decision-records/adr_0009_event_sourcing_optional_features.md](01-decision-records/adr_0009_event_sourcing_optional_features.md)

### 技術棧與組合策略

#### ADR-0010: Angular & NgRx 技術棧選型
- **決策**: 採用 Angular 20 + NgRx + ng-zorro-antd
- **理由**: 支援 Event Flow、Signals、多視圖與企業級 UI
- **連結**: [01-decision-records/adr_0010_angular_ngrx_tech_stack.md](01-decision-records/adr_0010_angular_ngrx_tech_stack.md)

#### ADR-0011: Event-Flow & Causality 技術組合策略
- **決策**: 定義推薦的技術組合模式與實施階段
- **理由**: 發揮 Event-Flow 與 Causality 的最大價值
- **連結**: [01-decision-records/adr_0011_event_flow_causality_combination_strategy.md](01-decision-records/adr_0011_event_flow_causality_combination_strategy.md)

#### ADR-0012: Event Sourcing 系統技術選型總表
- **決策**: 完整的技術選型總表與優先級
- **理由**: 明確技術路線圖，支援系統逐步演進
- **連結**: [01-decision-records/adr_0012_event_sourcing_system_tech_selection.md](01-decision-records/adr_0012_event_sourcing_system_tech_selection.md)

### 錯誤處理與基礎設施

#### ADR-0013: Result Pattern 錯誤處理策略
- **決策**: 採用 Result<T, E> 模式，禁止 throw/catch
- **理由**: 顯性錯誤處理，型別安全，可組合
- **連結**: [01-decision-records/adr_0013_result_pattern_error_handling.md](01-decision-records/adr_0013_result_pattern_error_handling.md)

#### ADR-0014: Firebase 基礎設施抽象化策略
- **決策**: Firebase 僅作為 Infrastructure 實現，Domain 層完全無感知
- **理由**: 可替換性、可測試性、關注點分離
- **連結**: [01-decision-records/adr_0014_firebase_infrastructure_abstraction.md](01-decision-records/adr_0014_firebase_infrastructure_abstraction.md)

### 測試與品質

#### ADR-0015: 測試策略與品質閘門
- **決策**: 測試金字塔 (70% Unit, 20% Integration, 10% E2E) + 80% 覆蓋率
- **理由**: 快速回饋、品質保證、迴歸保護
- **連結**: [01-decision-records/adr_0015_testing_strategy_quality_gates.md](01-decision-records/adr_0015_testing_strategy_quality_gates.md)

#### ADR-0016: Signals vs RxJS 狀態管理策略
- **決策**: Signals 優先用於 UI State，RxJS 用於 Async Operations
- **理由**: 清晰分工、最佳效能、向前相容
- **連結**: [01-decision-records/adr_0016_signals_vs_rxjs_state_management.md](01-decision-records/adr_0016_signals_vs_rxjs_state_management.md)

### 參考文獻與最佳實踐

#### ADR-0017: Event Sourcing 參考文獻與最佳實踐
- **決策**: 建立 L1-L4 分層參考架構（理論基礎、實作指南、技術文件、專案實踐）
- **理由**: 確保技術選型有理論依據，提供學習路徑，保持與業界對齊
- **連結**: [01-decision-records/adr_0017_event_sourcing_references_best_practices.md](01-decision-records/adr_0017_event_sourcing_references_best_practices.md)

## ADR 流程

1. **提出** - 識別需要決策的問題
2. **討論** - 收集替代方案和意見
3. **決策** - 記錄選擇的方案和理由
4. **實施** - 根據 ADR 實施
5. **回顧** - 定期review ADR 的有效性

## ADR 存放

所有 ADR 存放在 `docs/adr/` 目錄，使用遞增編號。

---

**參考**: [ADR Directory](../adr/)
