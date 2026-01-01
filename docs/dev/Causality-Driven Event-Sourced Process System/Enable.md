# Event Sourcing 適合使用的場景

本文檔說明在哪些場景下**應該**使用 Event Sourcing 與因果鏈（Causality）＋事件流（Event Flow）。

---

# 一、最核心的適合場景（必要級）✅

## 1️⃣ 不可否認、不可刪除的業務事實

**關鍵字**：事實、承諾、責任

### 適合

* OrderPlaced
* TradeExecuted
* PositionOpened / Closed
* FundsLocked / Released

### 為什麼

* 發生過就不能假裝沒發生
* 法規 / 財務 / 對帳一定會用到
* State 只是 event 的「投影」

👉 **Event = 歷史真相**

---

## 2️⃣ 狀態是「被推導」出來的

**判斷法**

> 沒有歷史，我無法知道現在為什麼是這樣

### 適合

* 帳戶餘額
* 持倉數量
* 風險曝險

### Event Flow

```
DepositReceived
→ OrderPlaced
→ TradeExecuted
→ FeeCharged
```

👉 **狀態不是 source，是結果**

---

## 3️⃣ 需要 Replay / Time Travel

**關鍵字**：回放、模擬、驗證

### 適合

* 回測（Backtest）
* 重建 bug 現場
* 新策略驗證

### Trading 例

* 用 2024/10 的事件 replay
* 看策略在「已知未來前」會不會爆倉

👉 **Replay 是 Event Sourcing 的殺手級能力**

---

# 二、進階但非常強的適合場景 ✅

## 4️⃣ 複雜因果鏈（不是單一步驟）

**特徵**

* 多步
* 可中斷
* 有條件分支

### 適合

```
SignalGenerated
→ OrderPlaced
→ OrderPartiallyFilled
→ OrderExpired
→ PositionAdjusted
```

### 為什麼

* CRUD 無法表達「過程」
* Event Flow 天生描述時間與因果

---

## 5️⃣ 非同步、最終一致流程

**關鍵字**：Eventually Consistent

### 適合

* 撮合回報延遲
* 第三方 API 不穩定
* 風控事後介入

### 技術結構

* Event → Saga / Process Manager
* CausationId 串整條鏈

---

## 6️⃣ 需要「解釋為什麼」的系統

**不是 only what，而是 why**

### 適合

* 風控封單
* 策略停機
* 強制平倉

### Event 設計

```
RiskLimitBreached
→ ForcedLiquidationTriggered
```

👉 **可解釋性來自事件，不是 log**

---

# 三、Trading / Bot 專屬適合場景 ✅（重點）

## 7️⃣ 決策點（Decision Boundary）

**超級重要**

### 適合

* StrategySignalGenerated
* RiskCheckPassed / Failed
* OrderPlacementApproved

### 為什麼

* 市場資料太多
* 但你「選擇行動」的那一刻很稀有

👉 **Event 記「選擇」，不是「觀察」**

---

## 8️⃣ 資金與風險演進

**任何錢的變化都值得 event**

### 適合

* MarginReserved
* MarginReleased
* FeeAccrued

### 為什麼

* 對帳
* 合規
* Debug

---

## 9️⃣ 策略生命週期

**不是 tick，是策略行為**

### 適合

```
StrategyActivated
StrategyPaused
StrategyResumed
StrategyStopped(reason)
```

---

# 四、架構層級適合點（對齊你三層架構）✅

## Domain 層（最適合）

* Aggregate 內狀態轉換
* Business invariant 被觸發
* Command → Event

👉 **95% 的 event 應該在這**

---

## Application / Process 層

* Saga
* Long-running flow
* Cross-aggregate coordination

👉 **事件串流程，但不存狀態**

---

## Infra 層（幾乎不用）

* 只負責 deliver / persist
* 不創造業務事件

---

# 五、最終判斷公式（你可以直接用）

一個變化 **適合** 用 Event，如果同時滿足：

1. ✅ 發生後不能撤銷
2. ✅ 沒它無法解釋現在
3. ✅ Replay 有價值
4. ✅ 名字可以念成一句話
5. ✅ 業務能看懂

只要有 **一條不成立** → 慎用
有 **兩條不成立** → 不要用

---

## 核心總結

> **Event Sourcing 記的是「承擔過的後果」，不是「看過的世界」。**

---

# 🟢 Trading Event 白名單（必須有）

> **原則**
>
> * 每個 Event 都是「不可否認的事實」
> * 名字能被念成一句完整的話
> * 不描述「怎麼做」，只描述「結果成立」

---

## 一、Account / Funds（資金層）✅

**任何錢的變化，必須是事件**

### 必須有

```
FundsDeposited
FundsWithdrawn
FundsLocked
FundsReleased
FeeCharged
PnLRealized
PnLUnrealizedUpdated   ← 可選（僅在 checkpoint）
```

### 為什麼

* 對帳
* 回溯
* 合規

👉 **沒有這層 = 系統不可信**

---

## 二、Strategy / Decision（決策層）✅（Trading 最核心）

> **這一層最容易被低估，但價值最高**

### 必須有

```
StrategyActivated
StrategyPaused
StrategyStopped

StrategySignalGenerated
StrategyDecisionApproved
StrategyDecisionRejected
```

### 說明

* `SignalGenerated`：**決策邊界**
* `Approved / Rejected`：風控、資金、限額的結果

👉 **市場資料不記，決策一定要記**

---

## 三、Risk / Control（風控層）✅

**所有「不讓你做事」的原因都要留下**

### 必須有

```
RiskCheckPassed
RiskCheckFailed

RiskLimitBreached
ForcedLiquidationTriggered
```

### 為什麼

* 解釋「為什麼沒下單」
* 解釋「為什麼被強平」

---

## 四、Order Lifecycle（訂單生命週期）✅

**最標準、也最容易做錯的一層**

### 必須有

```
OrderPlaced
OrderAcceptedByExchange
OrderRejectedByExchange

OrderPartiallyFilled
OrderFullyFilled
OrderCancelled
OrderExpired
```

### 原則

* 每個 Event = 一個「狀態躍遷完成」
* 不要有 `OrderStatusChanged`

---

## 五、Trade / Execution（成交層）✅

**真正影響倉位的地方**

### 必須有

```
TradeExecuted
TradeSettled
```

### 說明

* 一筆 Trade 可能來自多個 Order fill
* Execution ≠ Order

---

## 六、Position（倉位層）✅

**倉位是「推導出來的，但影響極大」**

### 必須有

```
PositionOpened
PositionIncreased
PositionReduced
PositionClosed
```

### 為什麼

* Replay
* 風險計算
* PnL 計算

---

## 七、System / Safeguard（系統保護）✅

**不是技術錯誤，是「業務級保護」**

### 必須有

```
TradingHalted
TradingResumed
EmergencyStopTriggered
```

---

# 🔴 明確禁止出現在白名單的（快速對照）

```
PriceUpdated
OrderBookChanged
ApiRequestSent
RetryStarted
BalanceFetched
```

👉 **這些會毀掉你的 Event Store**

---

# 🧠 Event 必備欄位（最低限）

每一個 Trading Event，至少要有：

```
event_id
aggregate_id
event_type
occurred_at

causation_id   ← 上一個事件
correlation_id ← 同一決策鏈
```

沒有 causation / correlation → **不叫 Trading Event Sourcing**

---

# 🧩 白名單使用方式（很重要）

1. **Domain 層只能產生白名單事件**
2. PR 檢查：

   * 事件名不在白名單 → 不准合併
3. 新事件一定要回答：

   > 「少了它，10 年後我還能解釋帳為什麼是這樣嗎？」

---

## 核心原則

> **Trading Event 不是記市場，而是記你「對市場負責的行為」。**
