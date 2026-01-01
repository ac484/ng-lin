# ADR-0009: Event Sourcing 可選功能 (Optional Features)

## Status
✅ Accepted (2025-12-31)

## Context (事實)
在 Event Sourcing 架構中，除了核心功能外，還有許多可選功能可以提升系統的效能、可解釋性和維護性。

這些功能不影響最終的業務正確性，移除後系統仍可運作，但在特定情境下能帶來顯著價值。需要明確定義何時應該使用這些可選功能。

## Decision
以下功能為**可選**，應根據實際需求決定是否實施：

### 一、Checkpoint / Snapshot 類（效能型）🟡

#### 可選 Event
```
TaskSnapshotRecorded
ProjectionSnapshotRecorded
```

#### 什麼時候要
- Event 數量巨大（> 100,000 events per aggregate）
- Replay 時間超過可接受範圍（> 1 分鐘）
- 啟動新 instance 很慢
- 需要快速恢復系統狀態

#### 什麼時候不要
- 小系統（< 10,000 total events）
- Event 數量可控
- Replay 效能已滿足需求

**實施建議**：
- 每 1000 個事件建立一次 snapshot
- 保留最近 3 個 snapshot
- Snapshot 包含完整的 aggregate 狀態

### 二、決策中間態（可解釋性）🟡

#### 可選 Event
```
DecisionEvaluated
RuleApplied
ConstraintChecked
```

#### 什麼時候要
- 常問：「為什麼這個 command 沒有變成事件？」
- 業務邏輯複雜、規則常調整
- 需要解釋「沒發生的事」
- 合規或審計需求

#### 什麼時候不要
- 業務規則簡單
- 沒有審計需求
- 團隊規模小

### 三、Audit 細節（可追溯性）🟡

#### 可選 Event
```
PolicyEvaluated
AuthorizationChecked
ValidationPerformed
```

#### 什麼時候要
- 需要 audit 完整決策過程
- 法規/內控要求
- 多租戶系統需要完整追蹤
- 安全性要求高

#### 什麼時候不要
- 個人專案或內部工具
- 沒有合規需求
- 團隊完全信任

**注意**：不要記錄每條 rule，只記錄最終影響決策的

### 四、狀態變更歷史 🟡

#### 可選 Event
```
TaskParameterUpdated
ConfigurationChanged
SettingsModified
```

#### 什麼時候要
- 參數會影響歷史行為解釋
- 需要回放「當時用的是什麼參數」
- 系統行為會因配置而大幅改變

#### 什麼時候不要
- 參數只影響未來
- 不關心歷史準確重現
- 配置變更不頻繁

### 五、人工介入記錄 🟡

#### 可選 Event
```
ManualOverrideApplied
AdminInterventionRecorded
SystemAdjustmentMade
```

#### 什麼時候要
- 有人工操作可能性
- 半自動系統
- 需要區分系統與人工操作
- 審計需求

#### 什麼時候不要
- 全自動系統
- 無人工干預
- 操作完全由系統控制

**重要性**：否則無法分清 system vs human

### 六、效能與分析資料 🟡

#### 可選 Event
```
PerformanceMetricRecorded
LatencyMeasured
ResourceUsageLogged
```

#### 什麼時候要
- 事後分析與優化
- 效能調優需求
- SLA 監控

#### 什麼時候不要
- 會爆 event 數量
- 即時計算即可
- 沒有效能問題

### 七、Projection 優化提示 🟡

#### 可選 Event
```
ProjectionInvalidated
CacheExpired
ViewRefreshNeeded
```

#### 什麼時候要
- Projection 成本高
- 需要智能快取策略
- 多層級的 projection

#### 什麼時候不要
- Projection 即時重算成本低
- 快取策略簡單

## Rationale (為什麼)

### 灰名單的踩雷警告
加入可選 event 前，先檢查：

1. ❓ 拿掉它，系統會不會錯？
   - 會 → ❌ 不是可選，是必須（參考 ADR-0008）
2. ❓ Replay 時它能不能被略過？
   - 不能 → ❌ 太關鍵
3. ❓ 它是不是高頻？
   - 是 → ❌ 通常不該是 event（參考 ADR-0007）
4. ❓ 它是不是描述「沒做成的技術嘗試」？
   - 是 → ❌ 應該用 infrastructure log

### 決策原則
> **「可選 event 是為了理解，不是為了正確性。」**

### 建議實戰用法
1. **第一版**：只上必須白名單（ADR-0008）
2. **跑一個月**
3. 回答不了的問題 → 才補可選 event
4. 定期 review 可選 event 的價值

### ng-lin 專案的可選功能優先級

#### 高優先級（建議實施）
- **Snapshot**：Task 可能有大量 events
- **Manual Override**：工地現場可能有人工調整
- **Decision Evaluation**：解釋為何某些操作被拒絕

#### 中優先級（視需求）
- **Audit Details**：如果有合規需求
- **Parameter History**：如果系統行為參數化

#### 低優先級（暫不需要）
- **Performance Metrics**：系統初期不需要
- **Projection Optimization**：等 projection 成為瓶頸再說

## Consequences (後果)

### 正面影響
- 提供額外的可解釋性
- 支援效能優化
- 增強審計能力
- 靈活應對不同需求

### 負面影響
- 增加 Event Store 大小
- 可能增加 replay 複雜度
- 需要額外的維護成本
- 團隊需要理解何時使用

### 對 L0/L1/L2 的影響
- **L0 (Core)**：提供可選 event 的基礎設施
- **L1 (Infrastructure)**：需支援 snapshot 與快取機制
- **L2 (Task Domain)**：根據需求選擇性實施

### Replay / Simulation 影響
- Snapshot 可大幅提升 replay 效能
- 可選 event 在 replay 時可以被過濾
- 不影響核心業務邏輯的正確性

## Follow-up / Tracking (追蹤)

### 實施策略
1. **初期（V1.0）**
   - 不實施任何可選功能
   - 專注於核心 event 的穩定性

2. **成長期（V1.x）**
   - 根據實際痛點選擇性加入
   - 優先考慮 Snapshot（如果 replay 變慢）
   - 考慮 Manual Override（如果有人工介入）

3. **成熟期（V2.0+）**
   - 完整的 audit trail
   - 效能監控事件
   - 進階分析功能

### 監控指標
- [ ] Replay 時間是否超過 1 分鐘
- [ ] Event Store 成長速度
- [ ] 「為什麼」問題的頻率
- [ ] 人工介入的頻率

### 重新檢視時機
- 每個 sprint 結束時 review 是否需要新的可選功能
- 當 replay 效能下降時考慮 snapshot
- 當審計需求增加時考慮 audit events

### 相關 ADR
- ADR-0007: Event Sourcing 不適用場景（反模式）
- ADR-0008: Event Sourcing 適用場景（白名單）
- ADR-0001: Event Versioning Strategy
- ADR-0006: Projection Engine Architecture

---

**參考文件**：docs/dev/Causality-Driven Event-Sourced Process System/Optional.md
