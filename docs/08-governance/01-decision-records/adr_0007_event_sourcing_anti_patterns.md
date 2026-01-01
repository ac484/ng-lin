# ADR-0007: Event Sourcing 不適用場景 (Anti-Patterns)

## Status
✅ Accepted (2025-12-31)

## Context (事實)
在實施 Event Sourcing 架構時，並非所有場景都適合使用事件溯源模式。錯誤地使用 Event Sourcing 會導致：
- Event Store 爆炸式增長
- Replay 成本不可控
- 系統複雜度過高而價值過低
- 因果鏈混亂難以維護

需要明確定義哪些場景**不應該**使用 Event Sourcing，以避免技術債務累積。

## Decision
以下場景**禁止**使用 Event Sourcing：

### 1️⃣ 純 I/O、技術性流程（Infrastructure 層）❌
**禁止記錄**：
- HTTP Request/Response
- API 呼叫細節（MEXC、Binance）
- DB 連線、Cache、Redis 操作
- Retry、Timeout、Circuit Breaker

**理由**：這些是「how」而非「what」，失敗是技術問題非業務事實。

**正確作法**：使用 Log/Metric/Trace、Result/Either/Try、Idempotency + Retry Policy

### 2️⃣ 可立即被覆蓋的狀態（Derived/Cache/Projection）❌
**禁止記錄**：
- Read Model
- Projection Table
- 快取資料
- Aggregated View

**理由**：這些不是事實，可隨時重算，記事件只會造成爆炸。

### 3️⃣ UI / 使用者操作細節 ❌
**禁止記錄**：
- ButtonClicked
- ModalOpened
- TabSwitched
- CheckboxChecked

**理由**：操作不等於意圖，UI 行為不等於業務行為。

**正確作法**：UI → Command → Domain Event

### 4️⃣ 可回滾、可取消、尚未成立的事情 ❌
**禁止記錄**：
- Draft
- Temporary
- Preview
- Validation Passed/Failed

**理由**：Event 是不可變事實，尚未確定的事不配當事件。

**正確作法**：使用 in-memory state、傳統 CRUD、或短期表（TTL）

### 5️⃣ 過於技術性的錯誤事件 ❌
**禁止記錄**：
- DatabaseErrorOccurred
- ApiTimeoutHappened
- JsonParseFailed

**理由**：技術錯誤不是業務事實，沒有 replay 價值。

**正確作法**：技術錯誤 → Result.Err，業務結果 → Domain Event

### 6️⃣ 查詢（Query）與同步 Read Flow ❌
**禁止記錄**：
- GetBalance
- ListOpenOrders
- FetchPositions

**理由**：Query 不改變世界，Event 應該代表世界改變了。

### 7️⃣ 頻率極高、價值極低的變化 ❌
**禁止記錄**：
- 每個 tick 價格
- 每次 order book 變動
- 每秒 heartbeat

**理由**：Event Store 會爆炸，Replay 成本不可控。

**正確作法**：Market data → Stream/Time-series DB，只在決策點產生事件

### 8️⃣ 跨 Aggregate 的「便利事件」❌
**禁止**：一個事件順便改 5 個 Aggregate、用事件當 RPC

**理由**：因果會糾結，Replay 順序難保證。

**正確作法**：一事件 → 一 Aggregate，用 Saga/Process Manager 串流程

### 9️⃣ 其他反模式
- 事件只為了「同步資料」❌
- 事件本身沒有業務語意（EntityUpdated, StatusChanged）❌
- 事件只為了方便 rollback ❌
- 強一致、低延遲同步流程（<5ms）❌
- 事件只給機器看（E1023, STATE_7_ENTERED）❌
- 事件量失控但無聚合策略 ❌
- 跨 bounded context 共用事件 ❌
- 用 Event 解決設計不清 ❌
- 短生命週期系統（Demo、MVP、一次性活動）❌
- 團隊沒有共識 ❌

## Rationale (為什麼)

### 快速判斷表
| 問題 | 是 → 用 Event | 否 → 不要 |
|------|--------------|----------|
| 這是不可否認的事實嗎？ | ✅ | ❌ |
| 需要 replay/audit 嗎？ | ✅ | ❌ |
| 沒它會無法解釋狀態？ | ✅ | ❌ |
| 10 年後還有意義？ | ✅ | ❌ |

### 核心原則
> **市場資料是噪音，決策才是歷史。**
> **Event Sourcing 記的是「承擔過的後果」，不是「看過的世界」。**

### 為何不用其他方案
- **不用 Event + CRUD UI**：會混亂事實與操作
- **不用 Event + Chatty API**：會造成事件爆炸
- **不用 Event + 每秒 tick data**：應使用 Time-series DB
- **不用 Event + 同步 RPC 思維**：違反 Event 天生 async 特性

## Consequences (後果)

### 正面影響
- Event Store 保持乾淨、可維護
- Replay 成本可控
- 因果鏈清晰
- 業務人員可理解事件
- 技術債務不會累積

### 負面影響
- 需要團隊共識與紀律
- 需要明確區分技術與業務事件
- 可能需要額外的 Log/Metric 系統處理技術細節

### 對 L0/L1/L2 的影響
- **L0 (Core)**：清晰的 Event 定義，不被技術細節污染
- **L1 (Infrastructure)**：技術錯誤用 Result 模式，不產生 Domain Event
- **L2 (Features)**：UI 操作不直接產生事件，須透過 Command

## Follow-up / Tracking (追蹤)

### 實施檢查點
- [ ] Code Review 時檢查新增事件是否符合白名單
- [ ] ESLint 規則強制執行事件命名規範
- [ ] 定期 Audit Event Store 中的事件類型

### 重新檢視時機
- 當 Event Store 成長速度超過預期時
- 當 Replay 時間超過可接受範圍時
- 當團隊對事件定義產生分歧時

### 相關 ADR
- ADR-0008: Event Sourcing 適用場景（白名單）
- ADR-0001: Event Versioning Strategy
- ADR-0006: Projection Engine Architecture

---

**參考文件**：docs/dev/Causality-Driven Event-Sourced Process System/Disable.md
