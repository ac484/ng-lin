# Context7 被動優化 Copilot Agent 任務計畫

本計畫將 **被動/自主** 地提升 GitHub Copilot Agent 在本 Angular（Event-Sourced、因果驅動的 Task Process）專案中的工作品質，確保在信心不足（<100%）時自動透過 Context7 查詢最新指引。

## Context7 查詢結果（NgRx）

- **選定套件**: `/ngrx/platform`（來源：Context7 resolve-library-id）
- **適用原因**: 提供 Angular 事件驅動/投影/副作用管線的官方實踐，貼合本專案的 Event-Sourced/Signals 架構。
- **建議自動拉取主題**（get-library-docs）：
  - `signals-store` / `store`（Signals Store 與 selectors）
  - `effects`（事件→副作用管線）
  - `entity`（Entity Adapter 用於投影/列表）
  - `router-store`（路由與狀態同步）

## 被動配置清單（給 Copilot Agent）

1. **信心門檻**：若對 Angular 任務的解法信心 <99.99%（即非 100%），立即執行：
   - `resolve-library-id` → `/ngrx/platform`
   - `get-library-docs` → 主題依上方清單（優先：signals-store, effects）
2. **事件驅動對齊**：
   - 建立/維護「Command → Event → Projection」流程時，預設引用 NgRx Effects + Entity Adapter 模式。
   - 投影層以 Signals Store 為主，避免手寫 RxJS 管線。
3. **文件與回應格式**：
   - 產出的範例需標註版本（Angular 20 / NgRx 最新）並遵循本 repo 的 event-bus/notification 既有介面。
4. **交付前自檢**：
   - 檢查是否引用 Context7 取得的 API/範例（非記憶）。
   - 若發現新版 API，可在回應中提示升級選項與相容路徑。

## 作業流程（Sequential-Thinking + Planning）

1. **Sequential-Thinking**：先用多步思考拆解需求（事件流、投影、UI）。
2. **Context7 查詢**：信心不足即取 NgRx docs（signals-store/effects/entity/router-store）。
3. **Software-Planning-Tool**：把需求轉成待辦，維護進度。
4. **實作/回應**：套用 Context7 範例 + 專案既有的 event-bus/notification/guards 規範。

## 行動項目（本次）

- [ ] 對 Copilot Agent（Context7）回應時套用上述被動流程。
- [ ] 在回答 Angular Event-Sourced 任務時預設引用 `/ngrx/platform` 並拉取 signals-store/effects 主題。
- [ ] 以本檔為參考，持續在回應中附帶「Context7 來源 + 版本」標註。
