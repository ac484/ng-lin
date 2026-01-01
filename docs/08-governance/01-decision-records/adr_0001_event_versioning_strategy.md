# ADR-0001: Event Versioning Strategy

## Status
Proposed / Accepted / Rejected / Superseded

## Context (事實)
- 系統中 Event schema 隨時間演化
- 需要保證 Replay、Simulation、Projection 的一致性
- 避免破壞現有流程與舊 Event

## Decision
- 所有 Event 必須遵守版本控制策略
- 每次 schema 修改必須生成新 version
- 舊版 Event 永遠可 replay
- 必須在 ADR 記錄理由與變更影響

## Rationale (為什麼)
- 防止因 schema 變更導致 L1/L2 流程錯亂
- 支援 deterministic replay 和 simulation
- 對應 Anti-Patterns：AP-02 Command-as-Event, AP-04 Projection as Truth

## Consequences (後果)
- 所有開發者必須遵守版本規則
- Replay / Simulation 測試成為強制步驟
- 新 Event schema 修改需提交 ADR

## Follow-up / Tracking (追蹤)
- 定期回顧版本策略
- 每次重大變更更新 ADR