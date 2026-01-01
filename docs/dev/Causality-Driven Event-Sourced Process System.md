# Causality-Driven Event-Sourced Process System

**Reference Architecture**

> **We model reality as immutable events, reason about change through causality, and make decisions via replay and simulation.**

---

## 一、系統定位（一眼就懂）

這不是傳統 ES / CQRS，也不是流程引擎。

這是一個：

> **以事件為事實、以因果為結構、以重放為驗證、以模擬為決策**
> 的 **因果驅動事件溯源流程系統**

---

## 二、命名使用層級（依場景切換）

### 🥇 技術白皮書 / 架構文件

**Causality-Driven Event-Sourced Process System**
（因果驅動的事件溯源流程系統）

### 🥈 對外簡報 / 管理層

**Event-Based Decision & Risk Management Platform**

### 🥉 Repo / 專案代號

**CausalFlow** / **EventLineage**

---

## 三、不可動搖的三條鐵律（違反就變質）

1. **Event = Fact，不是 Command**
2. **Causality > Time**
3. **State 永遠是推導物，不是來源**

👉 破一條，整套就退化成「ES 口味 CRUD」。

---

## 四、核心分層（Causality-First 三層）

```
L0 — Fact & Causality Layer
L1 — Process & Policy Layer
L2 — Projection & Decision Layer
```

這不是 MVC，也不是 Clean Architecture。

---

## 🧱 L0 — Fact & Causality Layer（不可污染）

### 職責

> 記錄「不可爭辯的事實」與其因果來源

### 允許

* Domain Events（immutable）
* Event Metadata
  `event_id / causation_id / correlation_id / actor`
* Event Versioning
* Deterministic Rules（純函數）

### 禁止

* 決策邏輯
* Workflow / Saga
* 狀態機
* 補償
* IO / 副作用
* 任何「應不應該」

📌 **一句話**

> L0 是「事實法院」，不是「執行機器」

---

## 🔁 L1 — Process & Policy Layer（因果運算）

### 職責

> 根據事件因果，推理「下一步應該發生什麼」

### 核心構件

* Saga / Process Manager
* State Machine
* Policy Engine（選用）
* Idempotency / Exactly-once
* Compensation / Self-healing

### 限制

* ❌ 不可修改 L0
* ❌ 不可直接改 Projection
* ❌ 不存真實狀態

📌 **一句話**

> L1 是「流程推理引擎」，不是資料庫

---

## 📊 L2 — Projection & Decision Layer（解釋與模擬）

### 職責

> 把事件與因果，轉成可理解、可決策的形式

### 包含

* Read Models / Projections
* Temporal Queries
* Narrative / Lineage View
* Risk Indicators
* Simulation / What-if
* Observability / Trace

### 限制

* ❌ 不反向影響 L0
* ❌ 不藏決策邏輯
* ❌ 不是真實來源

📌 **一句話**

> L2 是「解釋與模擬層」，不是權威

---

## 五、為什麼特別適合「風險 / 專案 / 治理」

| 需求   | 原因                  |
| ---- | ------------------- |
| 追責   | 完整因果鏈               |
| 回放   | Deterministic Core  |
| 模擬   | Event Replay        |
| 解釋   | Narrative + Lineage |
| 決策審計 | ADR + Causality     |

你追求的不是「快」，而是 **站得住腳**。

---

## 六、三個最容易爆炸的地雷（提前插旗）

1. **把狀態塞回 L0**
   → Replay / Simulation 直接死

2. **Saga 變成上帝物件**
   → 協調可以，定義真理不行

3. **Projection 被當 Source of Truth**
   → 你只是在用 ES 當 log

---

## 七、對外一句話版本（可直接用）

> **We model reality as immutable events, reason about change through causality, and make decisions via replay and simulation.**

硬，但準。😌

---

## 八、可立即落地的下一步（選一個就好）

1. 📁 Repo / src 結構（含治理與 enforcement）
2. 🧩 Event / Policy / Projection 命名規則
3. 🧠 哪些東西「永遠不該做成 Event」
4. 🧪 Replay / Simulation Engine 的 MVP
5. 📐 「這不是 CQRS / ES」對照圖
