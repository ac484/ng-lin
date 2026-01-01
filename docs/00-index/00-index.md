# ng-lin 系統文件總覽

> **Causality-Driven Event-Sourced Process System**
>
> 我們將現實建模為不可變事件，透過因果關係推理變化，並透過重播與模擬來做決策。

## 📖 文件導航

### 🎯 01-vision/ - 願景與目標
- [問題陳述](./01-vision/problem-statement.md) - 我們要解決什麼問題
- [系統目標](./01-vision/system-goals.md) - 我們想達成什麼
- [非目標](./01-vision/non-goals.md) - 我們明確不做什麼

### 🧠 02-paradigm/ - 系統範式（最重要）
- [系統定義](./02-paradigm/system-definition.md) - **從這裡開始**
- [為何不是 CRUD](./02-paradigm/why-not-crud.md)
- [為何不是純粹 Event Sourcing](./02-paradigm/why-not-pure-es.md)
- [核心原則](./02-paradigm/core-principles.md) - 不可妥協的鐵律

### 🏗️ 03-architecture/ - 架構設計
- [系統概覽](./03-architecture/overview.md)
- [分層模型](./03-architecture/layering-model.md)
- [職責邊界](./03-architecture/responsibility-boundaries.md)
- [資料流](./03-architecture/data-flow.md)

### 🔬 04-core-model/ - 核心模型
- [事件模型](./04-core-model/event-model.md)
- [因果模型](./04-core-model/causality-model.md)
- [確定性](./04-core-model/determinism.md)
- [時間模型](./04-core-model/time-model.md)

### 🔄 05-process-layer/ - 流程層
- [Saga/Process Manager](./05-process-layer/saga-process-manager.md)
- [狀態機](./05-process-layer/state-machine.md)
- [補償](./05-process-layer/compensation.md)
- [冪等性與恰好一次](./05-process-layer/idempotency-exactly-once.md)

### 🔮 06-projection-decision/ - 投影與決策
- [投影原則](./06-projection-decision/projection-principles.md)
- [時間查詢](./06-projection-decision/temporal-queries.md)
- [模擬引擎](./06-projection-decision/simulation-engine.md)
- [因果圖](./06-projection-decision/causal-graph.md)
- [敘事層](./06-projection-decision/narrative-layer.md)

### 📊 07-operability/ - 可運維性
- [可觀測性](./07-operability/observability.md)
- [失敗處理](./07-operability/failure-handling.md)
- [混沌重播](./07-operability/chaos-replay.md)
- [性能考量](./07-operability/performance-considerations.md)

### 📋 08-governance/ - 治理
- [決策記錄 (ADR)](./08-governance/decision-records.md)
- [Schema 演化](./08-governance/schema-evolution.md)
- [政策執行](./08-governance/policy-enforcement.md)
- [安全與防篡改](./08-governance/security-tamper-evidence.md)

### ⚠️ 09-anti-patterns/ - 反模式（必讀）
- [AP-01: 狀態洩漏](./09-anti-patterns/state-leakage.md)
- [AP-02: 上帝 Saga](./09-anti-patterns/god-saga.md)
- [AP-03: 投影作為真實來源](./09-anti-patterns/projection-as-truth.md)
- [AP-04: 事件過載](./09-anti-patterns/event-overloading.md)

### 📚 10-reference/ - 參考資料
- [術語表](./10-reference/glossary.md)
- [對比分析](./10-reference/comparisons.md)
- [閱讀地圖](./10-reference/reading-map.md)

### 📎 99-appendix/ - 附錄
- [歷史記錄](./99-appendix/historical-notes.md)

## 🎓 推薦閱讀順序

### 初學者路徑
1. [系統定義](./02-paradigm/system-definition.md) - 理解核心概念
2. [為何不是 CRUD](./02-paradigm/why-not-crud.md) - 理解為何需要事件驅動
3. [核心原則](./02-paradigm/core-principles.md) - 掌握不可妥協的規則
4. [狀態洩漏](./09-anti-patterns/state-leakage.md) - 避免最常見的錯誤
5. [系統概覽](./03-architecture/overview.md) - 理解整體架構

### 開發者路徑
1. [核心原則](./02-paradigm/core-principles.md) - 開發規範
2. [事件模型](./04-core-model/event-model.md) - 事件設計
3. [分層模型](./03-architecture/layering-model.md) - 職責劃分
4. [Saga/Process Manager](./05-process-layer/saga-process-manager.md) - 流程編排
5. [所有反模式](./09-anti-patterns/) - 避坑指南

### 架構師路徑
1. [系統定義](./02-paradigm/system-definition.md)
2. [核心原則](./02-paradigm/core-principles.md)
3. [架構概覽](./03-architecture/overview.md)
4. [因果模型](./04-core-model/causality-model.md)
5. [決策記錄](./08-governance/decision-records.md)

## 🔑 關鍵概念

### Event = Fact（事件即事實）
事件描述**已經發生**的事情，不是命令或意圖。

### State = Derived（狀態即衍生）
所有狀態都從事件重播得出，狀態不是真實來源。

### Causality = Explicit（因果必明確）
每個事件都明確記錄其成因、觸發者、所屬流程。

### Replay = Deterministic（重播即確定）
相同的事件序列，必然產生相同的狀態。

## 📐 架構約束

### 分層規則
```
UI → Features → Core → Infrastructure
            Infrastructure ──implements──▶ Core Interface
```

### 職責劃分
- **L0 (Fact)**: 僅定義不可變事實
- **L1 (Process)**: 連接事件、編排流程
- **L2 (Projection)**: 衍生讀模型、查詢優化

## 🛡️ 架構防護

系統透過以下機制防止架構違規：
1. ESLint 規則檢查依賴方向
2. 檔案大小限制（≤ 4000 字元）
3. Result pattern 強制錯誤處理
4. 自動化 Anti-pattern 檢測

## 📊 實作狀態

詳細實作狀態請參閱：
- [0-目錄.md](./0-目錄.md) - 完整目錄結構與實作狀態
- [ARCHITECTURE.md](./ARCHITECTURE.md) - 架構文件整合

## 🤝 貢獻指南

1. **閱讀核心文件**：理解系統範式與原則
2. **遵循反模式檢查**：避免常見錯誤
3. **更新相關文件**：程式碼變更必須同步更新文件
4. **執行架構檢查**：確保不違反架構約束

---

**版本**: v0.2.0  
**最後更新**: 2025-12-30  
**維護者**: ng-lin Team
