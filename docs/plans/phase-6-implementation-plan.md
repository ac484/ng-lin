# Phase 6A: Basic Task Management Implementation Plan

根據 #36 PR 和 Phase 5 分析結果制定的基礎實施計畫

> **重要**: 本計畫為 Phase 6A，僅涵蓋**單層任務管理**。  
> 階層化功能 (父子任務) 將在 **Phase 6B** 實施。  
> 參見: `docs/analysis/task-hierarchy-capability-gap-analysis.md`

## 執行摘要

**目標**: 實現 Task Domain 的基礎功能 (單層任務 + 簡單生命週期)

**時間範圍**: 3週 (15工作日)

**約束條件**:
- 單一檔案 ≤ 4000 字元
- 遵循 Occam's Razor (極簡原則)
- 不做 speculative refactor
- 使用現有基礎設施抽象
- 維持 Result<T,E> 錯誤處理模式

## 架構流程

```
UI Components (Angular 20 + Signals)
    ↓ Commands
Command Handlers (Orchestration)
    ↓ Load Events  
Event Store Service (Firebase/Supabase)
    ↓ Events Stream
Decision Functions (Pure Business Logic)
    ↓ New Events
Event Store Service (Append)
    ↓ Publish
Projection Service (State Derivation)
    ↓ Signals Update
UI Components (Reactive Display)
```

## Phase 5 依賴分析結果

### 關鍵路徑
1. Event Store Service (Foundation) - 無依賴
2. Decision Functions (Business Logic) - 依賴事件定義
3. Command Definitions (API) - 無依賴
4. Command Handlers (Orchestration) - 依賴 1,2,3
5. Projection Services (State) - 依賴 1
6. UI Integration (Presentation) - 依賴 4,5

### 並行工作機會
- Decision Functions + Command Definitions 可同時進行
- Unit Tests 可與實作同步開發

## 實施任務清單 (10 Tasks)

詳細任務請參見下方章節。每個任務包含:
- 複雜度評分 (0-10)
- 目標檔案路徑
- 職責說明
- 程式碼範例
- 驗收標準

### Week 1: Foundation
1. Event Store Service [7/10]
2. Decision Functions [4/10]
3. Command Interfaces [2/10]

### Week 2: Integration
4. Command Handlers [6/10]
5. Projection Service [7/10]
6. UI Component Integration [5/10]

### Week 3: Features & Testing
7. Decision Layer Tests [3/10]
8. Integration Tests [4/10]
9. Task Lifecycle Decisions [5/10]
10. Comment Decisions [4/10]

## 成功標準

### 功能性
- [ ] 任務創建流程端到端工作
- [ ] 任務列表視圖顯示來自投影的任務
- [ ] 任務詳情視圖顯示完整狀態
- [ ] 任務生命週期 (開始、完成、取消) 功能正常
- [ ] 評論功能正常運作

### 技術性
- [ ] 所有測試通過
- [ ] 無 TypeScript 編譯錯誤
- [ ] 所有檔案符合大小限制 (≤4000 字元)
- [ ] 遵循 Result<T,E> 模式
- [ ] Angular Signals 正確使用

## 風險與緩解

### 風險 1: Angular Signals 使用不熟悉
**緩解**: 使用 Context7 查詢 @angular/core signals 文檔
**觸發條件**: 信心度 < 95%

### 風險 2: Firebase 實時監聽設置
**緩解**: 使用 Context7 查詢 @angular/fire 文檔
**觸發條件**: 實作事件存儲時遇到困難

### 風險 3: RxJS + Signals 整合
**緩解**: 查閱官方整合模式文檔
**觸發條件**: 投影服務響應性問題

## 下一步行動

1. ✅ Phase 5 依賴分析完成
2. ✅ Phase 6 實施計畫制定完成
3. ⏭️ 開始實施各項任務
4. ⏭️ 持續迭代直到所有任務完成

---

**注意**: 完整的任務細節（含程式碼範例）請參見 Software Planning Tool 的 todos 列表
