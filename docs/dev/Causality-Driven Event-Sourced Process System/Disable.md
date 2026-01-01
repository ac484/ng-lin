# Event Sourcing 不適合使用的場景

本文檔說明在哪些場景下**不應該**使用 Event Sourcing，以及正確的替代方案。

---

# 一、純 I/O、技術性流程（Infrastructure 層） ❌

### ❌ 不要用在：

* HTTP Request / Response
* API 呼叫 MEXC、Binance
* DB 連線、Cache、Redis
* Retry、Timeout、Circuit Breaker

### 為什麼不行

* 這些是 **how**，不是 **what**
* 失敗是技術問題，不是業務事實
* 你不會想重播：

  ```
  HttpRequestSent
  TcpRetryHappened
  ```

### 正確作法

* 用 **Log / Metric / Trace**
* 用 **Result / Either / Try**
* 用 **Idempotency + Retry Policy**

👉 **Infrastructure 只回傳結果，不產生 Domain Event**

---

# 二、可立即被覆蓋的狀態（Derived / Cache / Projection） ❌

### ❌ 不要用在：

* Read Model
* Projection Table
* 快取資料
* Aggregated View

### 為什麼

* 這些**不是事實**
* 隨時可以重算
* 記事件只會爆炸成：

  ```
  ProjectionUpdated
  CacheInvalidated
  ```

### 正確作法

* Projection = Event 的 **結果**
* Cache = Event 的 **副產物**

👉 **事件是 source，不是 sink**

---

# 三、UI / 使用者操作細節 ❌

### ❌ 不要記：

* ButtonClicked
* ModalOpened
* TabSwitched
* CheckboxChecked

### 為什麼

* 操作 ≠ 意圖
* UI 行為不等於業務行為
* 一個業務意圖可能對應 10 個 UI 操作

### 正確作法

UI → Command → Domain Event

```
Click Buy
  → PlaceOrderCommand
    → OrderPlaced (event)
```

👉 **事件描述「已成立的事實」，不是互動細節**

---

# 四、可回滾、可取消、尚未成立的事情 ❌

### ❌ 不要用在：

* Draft
* Temporary
* Preview
* Validation Passed / Failed

### 為什麼

* Event 是不可變事實
* 你會被迫處理：

  ```
  DraftCreated
  DraftDeleted
  DraftRecreated
  ```

### 正確作法

* 用 in-memory state
* 或傳統 CRUD
* 或短期表（TTL）

👉 **「還沒確定的事」不配當事件**

---

# 五、過於技術性的錯誤事件 ❌

### ❌ 不要記：

* DatabaseErrorOccurred
* ApiTimeoutHappened
* JsonParseFailed

### 為什麼

* 技術錯誤 ≠ 業務事實
* 這些錯誤沒有 replay 價值

### 正確作法

* 技術錯誤 → Result.Err
* 業務結果 → Domain Event

例：

```
❌ ApiTimeoutOccurred
✅ OrderPlacementFailed(reason = ExchangeUnavailable)
```

👉 **事件要能被業務人員理解**

---

# 六、查詢（Query）與同步 Read Flow ❌

### ❌ 不要為這些產生事件：

* GetBalance
* ListOpenOrders
* FetchPositions

### 為什麼

* Query 不改變世界
* Event 應該代表「世界改變了」

### 正確作法

* Query = side-effect free
* Event = state transition

---

# 七、頻率極高、價值極低的變化 ❌（Trading 特別重要）

### ❌ 不要直接記：

* 每個 tick 價格
* 每次 order book 變動
* 每秒 heartbeat

### 為什麼

* Event Store 會爆炸
* Replay 成本不可控
* 因果價值低

### 正確作法

* Market data → Stream / Time-series DB
* 只在 **決策點** 產生事件

例：

```
❌ PriceUpdated
✅ StrategySignalGenerated
```

---

# 八、跨 Aggregate 的「便利事件」 ❌

### ❌ 不要：

* 一個事件順便改 5 個 Aggregate
* 用事件當 RPC

### 為什麼

* 因果會糾結
* Replay 順序難保證

### 正確作法

* 一事件 → 一 Aggregate
* 用 Saga / Process Manager 串流程

---

# Trading Bot 的一句血淚總結 🩸

**在交易系統裡：**

> ❌ 市場在發生什麼
> ✅ 你「做了什麼決策」

---

## 快速判斷表

| 問題                   | 是 → 用 Event | 否 → 不要 |
| -------------------- | ----------- | ------ |
| 這是不可否認的事實嗎？          | ✅           | ❌      |
| 需要 replay / audit 嗎？ | ✅           | ❌      |
| 沒它會無法解釋狀態？           | ✅           | ❌      |
| 10 年後還有意義？           | ✅           | ❌      |

---

# 九、事件只是為了「同步資料」❌

### 場景

* 用 Event 當成資料同步機制
* 「A 改了 → 發事件 → B 跟著改」

### 為什麼錯

* Event ≠ replication
* 你其實需要的是 **資料一致性策略**

### 症狀

* 事件內容越來越像 DTO
* 一改 schema 全系統爆
* replay 幾乎不可能

### 正確替代

* Read model / API
* CDC / Outbox（但不是 Domain Event）

---

## 十、事件本身「沒有業務語意」❌

### 場景

```
EntityUpdated
StatusChanged
DataModified
```

### 為什麼錯

* 事件無法回答「發生了什麼」
* replay 只能靠 if/else 猜

### 症狀

* Event handler 超過 300 行
* handler 裡全是 switch case

### 正確替代

```
OrderCancelledByRiskControl
OrderExpired
```

---

## 十一、事件只是為了「方便 rollback」❌

### 場景

* 想用 event 做 undo / redo
* 或拿 event 當 transaction log

### 為什麼錯

* Event 是 **事實**，不是操作紀錄
* 你會陷入「反事件地獄」

### 症狀

```
OrderCreated
OrderCancelled
OrderRecreated
OrderCancelledAgain
```

### 正確替代

* 補償事件（Compensation）
* 明確的業務語意

---

## 十二、強一致、低延遲同步流程 ❌

### 場景

* 必須在 5ms 內完成
* 每一步都要同步成功
* 不能接受最終一致

### 為什麼錯

* Event 天生 async
* 因果鏈會拉長 latency

### 症狀

* handler 越來越多
* 一個 command 卡住整條鏈

### 正確替代

* 同步 domain method
* DB transaction

---

## 十三、事件「只給機器看」❌

### 場景

* Event 名稱像系統 log
* PM / 業務看不懂

### 為什麼錯

* Event 是 domain language
* 不可讀 = 不可維護

### 症狀

```
E1023, E2049
STATE_7_ENTERED
```

### 正確替代

* Ubiquitous Language
* 可念成一句話的事件

---

## 十四、事件量失控但無聚合策略 ❌

### 場景

* 每秒上萬事件
* 沒 snapshot
* replay 超慢

### 為什麼錯

* Event Store 不是 time-series DB
* replay 成本是線性的

### 症狀

* 新 instance 啟動要 30 分鐘
* Snapshot 邏輯超複雜

### 正確替代

* 限制事件粒度
* 用 stream / TSDB

---

## 十五、跨 bounded context 共用事件 ❌

### 場景

* 不同子系統共用同一 Event 定義
* 想「一次定義，全系統通用」

### 為什麼錯

* Event 會被最弱需求污染
* 語意被拉平

### 症狀

* event 欄位一堆 optional
* 沒人知道哪些真的會用

### 正確替代

* Context-specific event
* 轉換層（Anti-Corruption Layer）

---

## 十六、用 Event 解決「設計不清」❌

### 場景

* Aggregate 邊界不明
* 規則寫不出來
* 就先丟事件

### 為什麼錯

* Event 會永久保存錯誤設計
* 之後無法修正歷史

### 症狀

* 一直 version event
* replay 需要 migration

### 正確替代

* 先釐清 aggregate
* event 最後才加

---

## 十七、短生命週期的系統 ❌

### 場景

* Demo
* MVP
* 一次性活動

### 為什麼錯

* 成本 > 價值
* 技術債回收不到

### 症狀

* 80% 時間在寫 infra
* 20% 在寫業務

### 正確替代

* CRUD
* Append-only table

---

## 十八、團隊「沒共識」❌（這點最致命）

### 場景

* 有人當 log
* 有人當 message
* 有人當 state

### 為什麼錯

* Event Sourcing 是**信仰級架構**
* 沒共識 = 系統撕裂

### 症狀

* handler 行為不一致
* 事件語意飄移

### 正確替代

* Event 契約文件
* Naming 規範
* Code review 嚴格把關

---

# 終極反向檢查（再多送你一層）

**如果你有以下念頭，請立刻停下來：**

* 「先記 event，之後再想意義」
* 「反正可以 version event」
* 「多記一點比較安全」
* 「Event = Kafka message」

👉 這些想法幾乎保證失敗。

---

## 核心原則

> **市場資料是噪音，決策才是歷史。**
