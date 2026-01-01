 **長期演進 + 架構治理 + 反駁錯誤設計**
 
---

# 📁 Architecture / Technical Whitepaper

## 🧠 GitHub Copilot Memory 使用指南

**NEW!** 學習如何使用 GitHub Copilot 的記憶功能來儲存和查詢專案重要資訊：

📖 **[Copilot Memory 使用指南](./COPILOT_MEMORY_GUIDE.md)** - 完整的 `store_memory` 和相關指令教學

已儲存的專案核心資訊包括：
- ✅ 專案定義與核心目標
- ✅ 架構原則與分層模型
- ✅ 任務階層結構規則
- ✅ 技術棧版本資訊
- ✅ 品質與性能目標

---

## 建議資料夾結構（穩定版）

```text
docs/
├── 00-index/
│   ├── 00-index.md
│   └── 01-reading-path.md            # 文件閱讀路徑與決策入口
│
├── 01-vision/
│   ├── 01-problem-statement.md
│   ├── 02-system-goals.md
│   └── 03-non-goals.md
│
├── 02-paradigm/
│   ├── 01-system-definition.md
│   ├── 02-why-not-crud.md
│   ├── 03-why-not-pure-es.md
│   └── 04-core-principles.md
│
├── 03-architecture/
│   ├── 01-overview.md
│   ├── 02-layering-model.md
│   ├── 03-responsibility-boundaries.md
│   └── 04-data-flow.md
│
├── 04-core-model/
│   ├── 01-event-model.md
│   ├── 02-causality-model.md
│   ├── 03-determinism.md
│   └── 04-time-model.md
│
├── 05-process-layer/
│   ├── 01-saga-process-manager.md
│   ├── 02-state-machine.md
│   ├── 03-compensation.md
│   └── 04-idempotency-exactly-once.md
│
├── 06-projection-decision/
│   ├── 01-projection-principles.md
│   ├── 02-temporal-queries.md
│   ├── 03-narrative-layer.md
│   ├── 04-causal-graph.md
│   └── 05-simulation-engine.md
│
├── 07-operability/
│   ├── 01-observability.md
│   ├── 02-failure-handling.md
│   ├── 03-chaos-replay.md
│   └── 04-performance-considerations.md
│
├── 08-governance/
│   ├── 01-decision-records/
│   │   ├── adr-template.md
│   │   └── ADR-0001-event-versioning-strategy.md
│   ├── 02-schema-evolution.md
│   ├── 03-policy-enforcement.md
│   └── 04-security-tamper-evidence.md
│
├── 09-anti-patterns/
│   ├── 01-state-leakage.md
│   ├── 02-god-saga.md
│   ├── 03-projection-as-truth.md
│   └── 04-event-overloading.md
│
├── 10-reference/
│   ├── 01-glossary.md
│   ├── 02-comparisons.md
│   └── 03-reading-map.md
│
└── 99-appendix/
    ├── 01-diagrams/
    │   ├── architecture.png
    │   └── causal-graph.png
    ├── 02-examples/
    │   ├── minimal-event.md
    │   └── replay-scenario.md
    └── 03-historical-notes.md
```

---

## 為什麼這個結構「站得住腳」

### ✔ 它不是照技術分類，而是照 **思考層次**

* 為什麼存在（01）
* 用什麼世界觀（02）
* 怎麼分層（03）
* 事實怎麼定義（04）
* 流程怎麼跑（05）
* 人怎麼理解（06）
* 怎麼活下來（07）
* 怎麼不走歪（08）
* 哪些是地雷（09）

👉 **錯誤設計會「無處藏身」**

---

## 使用建議（很重要）

* **先寫 02 → 03 → 04**
* 05 / 06 可以晚一點
* 09（Anti-patterns）越早寫，團隊越穩
* 08 是未來 scale 的保命符

---
