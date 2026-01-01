# ADR-0010: Angular & NgRx 技術棧選型

## Status
✅ Accepted (2025-12-31)

## Context (事實)
ng-lin 採用 Angular 20 + Event Sourcing 架構，需要選擇合適的狀態管理、UI 組件、開發工具來支援：
- Event Flow 建模與管理
- Causality 追蹤與視覺化
- 多視圖 Projection（List, Board, Why, Timeline）
- Real-time 事件流處理

需要建立明確的技術棧決策，避免技術選型混亂。

## Decision

### 核心套件（✅ 必備）

| 套件名稱 | 用途 | 理由 |
|---------|------|------|
| **@angular/core** | Angular 核心框架 | 官方核心，Signals 生態支援 |
| **RxJS** | 反應式流處理 | Angular 事件流標準，配合 store 管理資料流 |
| **@ngrx/store** | Redux-style 全域狀態 | Event Sourcing 的狀態管理首選 |
| **@ngrx/effects** | Side effects 管理 | 處理非同步事件與副作用 |
| **NgRx Signal Store** | Signals 版 store | 與 Angular 20 Signals 結合的狀態庫 |
| **@ngrx/entity** | 實體 collections 管理 | 方便管理事件序列與 normalized state |
| **@ngrx/router-store** | 路由狀態同步 | 追蹤路由事件與進度狀態 |

### UI 組件庫（⭐⭐⭐⭐⭐ 必裝）

| 套件 | 用途 | 推薦度 |
|-----|------|--------|
| **ng-zorro-antd** | Ant Design 風格 Angular UI 庫 | ⭐⭐⭐⭐⭐ 必裝 |
| **@delon/theme** | NG-ALAIN 主題與佈局模組 | ⭐⭐⭐⭐ 可選 |
| **@delon/abc** | 高階 UI 組件（卡片、表格套件等） | ⭐⭐⭐⭐ 可選 |
| **@delon/form** | JSON Schema 動態表單 | ⭐⭐⭐⭐ 可選 |
| **@delon/chart** | 圖表模組，結合 G2 | ⭐⭐⭐⭐ 可選 |

**決策理由**：
- ng-zorro-antd 提供完整的企業級 UI 組件
- 與 Event Sourcing 多視圖需求完美配合
- 支援 List、Board、Timeline 等多種展示方式

### State Management（⭐⭐⭐⭐⭐）

| 套件 | 類型 | 推薦度 | 使用時機 |
|-----|------|--------|----------|
| **@ngrx/store** | Redux 風格全域狀態 | ⭐⭐⭐⭐⭐ | 主要狀態管理方案 |
| **@ngrx/effects** | 非同步事件處理 | ⭐⭐⭐⭐⭐ | 處理 Event Flow |
| **@ngrx/entity** | 實體狀態集合管理 | ⭐⭐⭐⭐ | 管理 Events、Tasks |
| **NgRx Signal Store** | Signals 版狀態庫 | ⭐⭐⭐⭐ | 與 Angular 20 Signals 整合 |

**不採用的替代方案**：
- ❌ **ngxs**：雖然更簡潔，但 NgRx 生態更完整
- ❌ **akita**：社群支援度較低
- ⚠️ **xstate**：僅在需要複雜 State Machine 時考慮

### 開發工具（⭐⭐⭐⭐）

| 套件 | 作用 | 推薦度 |
|-----|------|--------|
| **@angular/platform-browser-devtools** | Angular DevTools 支援 | ⭐⭐⭐⭐ |
| **NgRx DevTools** | time-travel / event replay | ⭐⭐⭐⭐ |
| **jasmine-marbles** | RxJS 流測試 | ⭐⭐⭐⭐ |
| **OpenTelemetry JS** | trace/span 觀測 | ⭐⭐⭐⭐ 可選 |

### 可視化與圖表（⭐⭐⭐⭐）

| 套件 | 用途 | 推薦度 |
|-----|------|--------|
| **Chart.js** | 基礎圖表 | ⭐⭐⭐⭐ |
| **D3** | 複雜視覺化（Causal Graph） | ⭐⭐⭐⭐ |
| **@delon/chart** | NG-ALAIN 圖表模組 | ⭐⭐⭐⭐ |

### State Machine（可選）

| 套件 | 適用場景 | 推薦度 |
|-----|----------|--------|
| **xstate** | 複雜流程狀態機 | ⭐⭐⭐⭐ 可選 |
| **@xstate/angular** | XState Angular 整合 | ⭐⭐⭐⭐ 可選 |

**使用時機**：
- Task lifecycle 複雜度增加時
- 需要視覺化狀態轉換時
- 需要狀態機驗證時

## Rationale (為什麼)

### 為何選擇 NgRx 而非其他方案

#### NgRx 優勢
1. **Event Sourcing 天然契合**：Action = Event，Reducer = Projection
2. **完整生態**：Store + Effects + Entity + DevTools
3. **社群成熟**：大量最佳實踐與案例
4. **Angular 官方推薦**：Angular 團隊核心支援
5. **Time-Travel 支援**：內建 time-travel debugging

#### 對比其他方案
| 方案 | 優點 | 缺點 | 決策 |
|-----|------|------|------|
| **NGXS** | 語法簡潔 | 生態較小、Event Sourcing 支援較弱 | ❌ 不採用 |
| **Akita** | 輕量 | 社群支援度低 | ❌ 不採用 |
| **MobX** | 簡單易用 | 不支援 Event Sourcing 模式 | ❌ 不採用 |
| **Plain Services** | 無依賴 | 無法支援複雜 Event Flow | ❌ 不適合 |

### 為何選擇 ng-zorro-antd

1. **企業級組件**：完整的 UI 組件庫
2. **多視圖支援**：Table、List、Timeline、Kanban Board
3. **中文友善**：完整的繁體中文支援
4. **活躍維護**：持續更新與 Angular 版本同步
5. **豐富案例**：大量企業級應用實例

### 為何不用 Angular Material

| Angular Material | ng-zorro-antd | 決策 |
|-----------------|---------------|------|
| Google 官方 | Ant Design 生態 | ng-zorro 更符合企業需求 |
| 組件較少 | 組件豐富（100+） | ng-zorro 勝出 |
| 客製化複雜 | 主題系統完善 | ng-zorro 勝出 |
| 英文為主 | 中文友善 | ng-zorro 更適合本地化 |

### 實戰搭配建議

#### UI 層
```
ng-zorro-antd（基礎組件）
  ↓
@delon/*（大型 Dashboard、Form、Chart）
  ↓
Custom Components（業務特定組件）
```

#### 事件/狀態架構層
```
NgRx Store（狀態管理）
  ↓
NgRx Effects（事件流處理）
  ↓
NgRx Entity（事件序列管理）
  ↓
NgRx Signal Store（Signals 整合）
  ↓
XState（可選，複雜狀態機）
```

#### 觀測層
```
NgRx DevTools（time-travel debugging）
  ↓
Angular DevTools（性能分析）
  ↓
OpenTelemetry（可選，分散式追蹤）
```

## Consequences (後果)

### 正面影響
- 統一的技術棧，減少學習成本
- 完整的 Event Sourcing 支援
- 豐富的 UI 組件與視覺化能力
- 強大的開發者工具與除錯能力
- 良好的社群支援與文件

### 負面影響
- NgRx 學習曲線較陡
- ng-zorro-antd bundle size 較大
- 需要維護多個依賴套件

### 對 L0/L1/L2 的影響
- **L0 (Core)**：定義 Event、Decision、Projection 抽象，不依賴特定實現
- **L1 (Infrastructure)**：使用 NgRx Store 實現狀態管理
- **L2 (Features)**：使用 ng-zorro-antd 構建 UI，透過 NgRx 管理狀態

### Bundle Size 管理
- 使用 Tree Shaking 移除未使用的組件
- Lazy Loading 按需載入功能模組
- 生產環境啟用 AOT 編譯

## Follow-up / Tracking (追蹤)

### 版本管理
- [ ] 定期更新 Angular 至最新穩定版
- [ ] 定期更新 NgRx 至最新版本
- [ ] 定期更新 ng-zorro-antd 至最新版本
- [ ] 監控 breaking changes 並及時適配

### 效能監控
- [ ] 監控 bundle size（目標 < 500KB gzipped）
- [ ] 監控首次載入時間（目標 < 3 秒）
- [ ] 使用 Lighthouse 定期評估效能

### 實施檢查點
- [ ] 所有新功能使用 NgRx 管理狀態
- [ ] 所有 UI 組件優先使用 ng-zorro-antd
- [ ] 複雜狀態流程考慮使用 XState
- [ ] 所有事件流使用 NgRx Effects

### 重新檢視時機
- Angular 主版本升級時（如 Angular 21）
- NgRx 主版本升級時
- ng-zorro-antd 出現重大變更時
- 發現效能瓶頸時

### 相關 ADR
- ADR-0002: ESLint Architecture Enforcement
- ADR-0006: Projection Engine Architecture
- ADR-0008: Event Sourcing 適用場景

---

**參考文件**：docs/dev/Causality-Driven Event-Sourced Process System/Package.md
