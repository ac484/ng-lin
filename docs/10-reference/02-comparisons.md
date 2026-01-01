# 對比 (Comparisons)

## vs. Traditional CRUD

| 特徵 | CRUD | Event Sourcing |
|------|------|----------------|
| 狀態 | 當前狀態 | 事件序列 |
| 歷史 | 無 | 完整 |
| 審計 | 手動 | 自動 |
| 查詢 | 直接 | 透過 Projection |
| 一致性 | 強一致 | 最終一致 |
| 複雜度 | 低 | 高 |

## vs. Event Sourcing

| 特徵 | Pure ES | Causality-Driven ES |
|------|---------|---------------------|
| 事件 | 有 | 有 + 因果元數據 |
| 流程 | 隱式 | 明確 (Saga) |
| 決策 | 無 | 有 (Simulation) |
| 追蹤 | 基本 | 完整因果圖 |

## vs. CQRS

| 特徵 | CQRS | Causality-Driven |
|------|------|------------------|
| 讀寫分離 | 有 | 有 |
| 事件 | 可選 | 必須 |
| 因果 | 無 | 明確 |
| 重播 | 無 | 有 |

## vs. Workflow Engine

| 特徵 | Workflow Engine | Causality-Driven |
|------|-----------------|------------------|
| 流程 | 預定義 | 事件驅動 |
| 靈活性 | 低 | 高 |
| 審計 | 部分 | 完整 |
| 重播 | 無 | 有 |

---

**參考**: [核心原則](../02-paradigm/core-principles.md)
