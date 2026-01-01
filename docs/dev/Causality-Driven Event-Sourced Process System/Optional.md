# Trading Event 可選功能

本文檔說明在 Event Sourcing 中**可選**的功能與模式，以及何時應該使用它們。

---

# 🟡 Trading Event「可選區」（灰名單）

> **原則**
>
> * 不影響最終帳務正確性
> * 移除後，系統仍可運作
> * 主要價值在「解釋 / 分析 / 回測」

---

## 一、Checkpoint / Snapshot 類（效能型）🟡

### 可選 Event

```
AccountSnapshotRecorded
PositionSnapshotRecorded
RiskExposureSnapshotRecorded
```

### 什麼時候要

* Event 數量巨大
* Replay > 幾分鐘
* 啟動新 instance 很慢

### 什麼時候不要

* 小系統
* event 數量 < 百萬

👉 **這是效能優化，不是業務事實**

---

## 二、策略「中間態」決策 🟡

### 可選 Event

```
StrategySignalIgnored
StrategySignalDeferred
```

### 什麼時候要

* 你常問：

  > 為什麼這個 signal 沒有變成訂單？
* 策略邏輯複雜、常調參

### 什麼時候不要

* 單一策略
* 規則非常簡單

👉 **用來解釋「沒發生的事」**

---

## 三、風控細節（可解釋性）🟡

### 可選 Event

```
RiskRuleEvaluated
RiskThresholdAdjusted
```

### 什麼時候要

* 需要 audit 風控邏輯
* 法規 / 內控要求

### 什麼時候不要

* 個人 bot
* 沒有合規需求

⚠ 注意

* 不要記「每條 rule」
* 只記「最終影響決策的」

---

## 四、Order 技術性中繼態 🟡

### 可選 Event

```
OrderSubmissionRetried
OrderAmended
```

### 什麼時候要

* 交易所支援 amend
* 你需要分析失敗原因

### 什麼時候不要

* 不支援 amend
* retry 純 infra

👉 **一旦記了，就要保證 replay 合理**

---

## 五、策略參數變更 🟡

### 可選 Event

```
StrategyParameterUpdated
RiskParameterUpdated
```

### 什麼時候要

* 參數會影響歷史行為解釋
* 需要回放「當時用的是什麼參數」

### 什麼時候不要

* 參數只影響未來
* 不關心歷史準確重現

👉 **這類 event 很容易被低估**

---

## 六、人工介入 / Override 🟡（非常重要但不一定要）

### 可選 Event

```
ManualOrderPlaced
ManualInterventionApplied
```

### 什麼時候要

* 有人工操作
* 半自動交易

### 什麼時候不要

* 全自動、無人工干預

👉 **否則你永遠分不清 bot vs 人**

---

## 七、非關鍵但昂貴的結果 🟡

### 可選 Event

```
SlippageCalculated
LatencyMeasured
```

### 什麼時候要

* 事後分析
* 策略優化

### 什麼時候不要

* 會爆 event 數量
* 即時計算即可

---

# 🔴 灰名單的「踩雷警告」

如果你準備加入某個「可選 event」，先檢查：

1. ❓ 拿掉它，帳會不會錯？

   * 會 → ❌ 不是可選，是必須
2. ❓ Replay 時它能不能被略過？

   * 不能 → ❌ 太關鍵
3. ❓ 它是不是高頻？

   * 是 → ❌ 通常不該是 event
4. ❓ 它是不是描述「沒做成的技術嘗試」？

   * 是 → ❌ infra log

---

# 決策原則

> **「可選 event 是為了理解，不是為了正確性。」**

---

## 建議實戰用法

* **第一版**：只上「必須白名單」
* **跑一個月**
* 回答不了的問題 → 才補可選 event
