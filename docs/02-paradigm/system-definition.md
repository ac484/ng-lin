# 系統定義 (System Definition)

## 唯一真實定義

> **Causality-Driven Event-Sourced Process System**
>
> 我們將現實建模為不可變事件，透過因果關係推理變化，並透過重播與模擬來做決策。

## 核心理念

這不是：
- ❌ 傳統 CRUD 系統（狀態可被直接修改）
- ❌ 純粹 Event Sourcing（僅記錄事件）
- ❌ 工作流引擎（僅編排流程）

這是：
- ✅ **事件是唯一真實來源** - 所有狀態都從事件衍生
- ✅ **因果關係是核心** - 每個事件都明確記錄其成因
- ✅ **重播是驗證手段** - 透過重播事件流驗證系統行為
- ✅ **模擬是決策工具** - 透過模擬未來事件流評估影響

## 系統特徵

### 1. 不可變性 (Immutability)
事件一旦發生，永遠不可更改。狀態永遠是衍生出來的，不是被修改的。

### 2. 因果性 (Causality)
每個事件都明確記錄：
- `causedBy`: 哪個事件引發了此事件
- `correlationId`: 事件群組識別
- `causationId`: 因果鏈識別
- `traceId`: 分散式追蹤識別

### 3. 決定論 (Determinism)
相同的事件序列，必然產生相同的狀態。這是可重播性的基礎。

### 4. 時間性 (Temporality)
系統支援：
- 點查詢 (point-in-time query)：某時刻的狀態
- 區間查詢 (temporal range query)：某時段的變化
- 回溯 (backtrack)：回到歷史狀態
- 模擬 (simulation)：預測未來狀態

## 與其他範式的區別

### vs. CRUD
CRUD 直接修改狀態；我們記錄事件，狀態自動衍生。

### vs. Event Sourcing
Event Sourcing 關注事件儲存；我們關注因果關係與重播。

### vs. Workflow Engine
Workflow Engine 編排流程；我們透過事件自然呈現流程。

## 設計約束

1. **Event = Fact**：事件描述已發生的事實，不是命令或意圖
2. **State = Derived**：狀態永遠從事件重播得出
3. **Causality = Explicit**：因果關係必須明確記錄
4. **Replay = Deterministic**：重播必須可預測且一致

## 適用場景

✅ 適合：
- 需要完整審計追蹤
- 需要時間旅行（回溯歷史）
- 需要模擬決策影響
- 需要分散式系統協調
- 需要高度可追溯性

❌ 不適合：
- 簡單 CRUD 應用
- 即時高頻交易（需特殊優化）
- 狀態無需追溯的場景

## 實作指南

系統實作必須：
1. 所有業務邏輯都基於事件
2. 事件包含完整因果元數據
3. 支援事件重播與狀態重建
4. 提供時間點查詢能力
5. 實現確定性處理邏輯

---

**參考文件**：
- [為何不是 CRUD](./why-not-crud.md)
- [為何不是純粹 Event Sourcing](./why-not-pure-es.md)
- [核心原則](./core-principles.md)
