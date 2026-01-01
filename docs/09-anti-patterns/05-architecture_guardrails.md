# Anti-Patterns（架構反模式清單）

> 本章是**禁止事項**。任何一條出現，系統將不可避免地退化。

---

## AP-01：State Leakage
Event 含狀態/快照 → 破壞 replay 確定性 → Event 僅描述事實

## AP-02：Command-as-Event
事件名為 CreateX/UpdateY → 混淆 Fact 與 Intent → 嚴格分離 Command/Event

## AP-03：God Saga
單一 Saga 知道所有流程 → 流程無法演進 → 拆分 Process Manager、規則下推 Policy

## AP-04：Projection as Truth
直接修改 Projection → Event 與顯示不一致 → 修正透過新 Event

## AP-05：Non-Deterministic Core
依賴 time/random/API → Replay 結果不同 → 不確定性轉為 Event metadata

## AP-06：Temporal Confusion
混用 event/processing/wall time → 回放順序不一致 → 明確時間語義

## AP-07：Event Overloading
單一 Event 多語意 → 因果圖不可解釋 → 拆成多個明確事件

## AP-08：Replay Side Effects
Replay 觸發外部系統 → 測試污染實際 → Side effect 嚴格隔離

## AP-09：Narrative as Logic
Narrative 驅動流程 → 行為依賴描述 → Narrative 永遠只讀

## AP-10：Versionless Events
無 Event 版本 → 舊事件不可重放 → 嚴格 Event Versioning

---

## 核心原則

> **設計若破壞 replay、因果或可解釋性，必為反模式。**

---

# 讓錯誤站不住腳的文件系列

> **讓錯誤設計在提出當下就無法自圓其說。**

## 一、最高優先

**00-index.md** - 閱讀路徑 + 決策入口
**02-paradigm/core-principles.md** - 鐵律：Event=Fact、Causality>Time、State is Derived
**03-architecture/layering-model.md** - 權責邊界：L0/L1/L2 能做什麼

## 二、強制約束

**09-anti-patterns/** - 錯誤樣板庫：State leakage、God Saga、Projection as truth
**08-governance/schema-evolution.md** - Event versioning、Migration 規則
**08-governance/decision-records.md** - 設計決策記錄

## 三、結構性反駁

**02-paradigm/why-not-crud.md、why-not-pure-es.md** - 預先反駁常見錯誤
**10-reference/comparisons.md** - 對照表：CQRS、BPM、Workflow Engine

## 四、執法文件

**08-governance/policy-enforcement.md** - Review checklist、CI 檢查點
**05-process-layer/idempotency-exactly-once.md** - 防止隱性錯誤

## 五、最後防線

**06-projection-decision/simulation-engine.md** - Replay 驗證假設
**07-operability/observability.md** - Trace、Span 觀測性

---

> **目的：讓錯誤設計沒有生存空間。**
