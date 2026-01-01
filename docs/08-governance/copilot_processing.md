# Copilot Processing

> 專案中 Copilot 的輸出規範與處理流程

## Purpose
- 確保 AI 輔助生成程式碼時不破壞架構與治理規則
- 所有 Copilot 建議必須符合 Event Sourcing / Causality / Anti-pattern Guardrails

## Processing Rules
1. **Pre-Generation Check**
   - 確認需求明確
   - 確認層級 (L0 / L1 / L2)
   - 確認不會落入 AP-01..AP-04

2. **Generation Limit**
   - 單檔 ≤ 4000 characters
   - 超過 → 拆檔或詢問

3. **Post-Generation Verification**
   - Event schema deterministic
   - Derived state 不被改寫
   - Replay 可重現

4. **Output Documentation**
   - PR 中必須標註 L0/L1/L2 層級
   - 關聯 Event / Causality ID 必填

5. **Violation Handling**
   - 若建議違反規則 → 停止使用
   - 記錄在 ADR 或 Governance Logs

## Notes
- Copilot 不得自行引入新架構、新流程或隱性規則
- 所有 AI 生成碼均需人類審查