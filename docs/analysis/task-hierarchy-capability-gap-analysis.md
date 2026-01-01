# Task 階層化系統能力缺口分析

**分析日期**: 2025-12-31  
**分析範圍**: 評估當前專案支撐 `docs/dev/task-new.md` 需求的能力  
**分析方法**: Sequential-Thinking 相依性分析 + Context7 技術文件查詢

---

## 執行摘要

### 核心結論
✅ **當前專案有能力支撐 task-new.md 的需求**  
⚠️ **需分階段實施，不可一次到位**  
📊 **生產把握率**: 85% (需補充 Angular Signals 文件查閱)

### 關鍵發現
1. 現有基礎設施完備度: **70%**
2. 需新增模組: **階層管理** + **財務系統** + **驗收流程**
3. 預估實施週期: **9-12 週** (3 個 Phase)

---

## 需求複雜度分析

### task-new.md 核心需求拆解

#### 1. 階層化任務管理 (Complexity: 8/10)
```
Contract Item (合約項次)
  ↓
Parent Task (父任務)
  ↓
Child Tasks (子任務 - 第一層)
  ↓
Grandchild Tasks (孫任務 - 第二層)
```

**關鍵挑戰**:
- 任意深度樹狀結構
- 父子狀態雙向聯動 (向上聚合 + 向下傳遞)
- 金額守恆原則 (父 = Σ子)
- 拆分/合併的因果追蹤

#### 2. 財務綁定系統 (Complexity: 9/10)
```
Task 生命週期:
  建立 → 指派 → 執行 → 完成 → 驗收 → 請款 → 收款
```

**關鍵挑戰**:
- 金額分配策略 (平均/比例/手動)
- 請款百分比追蹤
- 預算調整的向下傳播
- 驗收與金流的聯動

#### 3. 協作者管理 (Complexity: 6/10)
- 承包商 (Contractor)
- 下包 (Subcontractor)
- 個人 (Individual)
- 權限繼承與隔離

#### 4. 驗收流程 (Complexity: 7/10)
```
自檢 (Self-Check) → 質檢 (QC) → 業主驗收 (Acceptance)
```

---

## 當前專案能力盤點

### ✅ 已具備基礎設施

#### 1. Event Store Service
**位置**: `src/app/core/observability/events/store/event-store.service.ts`

**現有能力**:
```typescript
- append(event: DomainEvent): Promise<void>
- appendBatch(events: DomainEvent[]): Promise<void>
- getEvents(aggregateId: string): Promise<DomainEvent[]>
- getEventsByType(eventType: string): Promise<DomainEvent[]>
```

**缺口**:
- ❌ 無樹狀查詢 (getAllChildEvents)
- ❌ 無因果鏈遍歷 (getEventChain)
- ❌ 無聚合計算 (aggregateChildStates)

#### 2. Command 基礎架構
**位置**: `src/app/core/foundation/base/command.base.ts`

**現有能力**:
- ✅ Command 抽象類別
- ✅ 驗證介面
- ✅ 時間戳記與使用者追蹤

**缺口**:
- ❌ 無 Result<T,E> 錯誤處理整合

#### 3. Angular 20 + Signals
**版本**: 20.1.0

**現有能力**:
- ✅ signal(), computed(), effect()
- ✅ RxJS 整合

**缺口**:
- ❌ 無樹狀結構的 Signals 實踐範例
- ❌ 無大型狀態樹的效能優化經驗

---

## 能力缺口矩陣

| 功能模組 | 需求複雜度 | 現有能力 | 缺口 | 實施優先級 |
|---------|-----------|---------|------|-----------|
| 基礎任務 CRUD | 4/10 | 60% | 40% | P0 (Phase 6A) |
| 階層化管理 | 8/10 | 20% | 80% | P1 (Phase 6B) |
| 財務綁定 | 9/10 | 0% | 100% | P2 (Phase 6C) |
| 驗收流程 | 7/10 | 10% | 90% | P2 (Phase 6C) |
| 協作者管理 | 6/10 | 30% | 70% | P1 (Phase 6B) |
| Process 整合 | 8/10 | 0% | 100% | P3 (未來) |

---

## 分階段實施路線圖

### Phase 6A: 基礎任務管理 (已規劃)
**時間**: 3 週  
**範圍**: 單層任務 + 簡單生命週期 + 評論

**產出**:
- ✅ Event Store Service
- ✅ Decision Functions (Create/Start/Complete)
- ✅ Command Handlers
- ✅ Projection Service
- ✅ 基礎 UI 整合

### Phase 6B: 階層化支援
**時間**: 4 週  
**範圍**: 父子任務 + 狀態聚合 + 協作者

**關鍵任務**:
1. **Enhanced Event Store** (7/10)
   - 新增樹狀查詢 API
   - 實作因果鏈遍歷
   - 優化批次查詢效能

2. **Hierarchy Decision Functions** (8/10)
   - decideTaskSplit (拆分決策)
   - decideTaskMerge (合併決策)
   - calculateParentState (狀態聚合)

3. **Hierarchy Projection Service** (7/10)
   - 維護父子關係圖
   - 即時更新父任務狀態
   - 處理遞迴取消

4. **Tree UI Component** (6/10)
   - 使用 ng-zorro Tree
   - 整合 Angular Signals
   - 拖放重新排序

**約束驗證**:
```typescript
// 單檔 ≤4000 字元範例
export function decideTaskSplit(
  events: readonly DomainEvent[],
  command: TaskSplitCommand
): Result<TaskCreatedEvent[], Error> {
  // 驗證父任務狀態
  const parent = projectTaskState(events);
  if (parent.status !== 'Pending') {
    return Err(new Error('只能拆分 Pending 狀態的任務'));
  }
  
  // 驗證金額守恆
  const totalChildAmount = command.childTasks
    .reduce((sum, t) => sum + t.amount, 0);
  if (totalChildAmount !== parent.amount) {
    return Err(new Error('子任務金額總和必須等於父任務'));
  }
  
  // 產生子任務 Created Events
  const childEvents = command.childTasks.map(child => ({
    type: 'TaskCreated',
    aggregateId: uuid(),
    parentTaskId: command.parentTaskId,
    causedBy: [parent.lastEventId],
    data: { ...child, depth: parent.depth + 1 }
  }));
  
  return Ok(childEvents);
}
```

### Phase 6C: 財務與驗收
**時間**: 5 週  
**範圍**: 金額分配 + 驗收流程 + 請款收款

**關鍵任務**:
1. Financial Domain Events (8/10)
2. Acceptance Workflow State Machine (7/10)
3. Budget Allocation Service (9/10)
4. Payment Tracking Service (8/10)

---

## 技術風險與緩解策略

### 風險 1: 樹狀結構效能問題
**機率**: 中 | **影響**: 高

**緩解策略**:
- 實作 Snapshot 機制 (每 100 個事件)
- 使用 Firebase Firestore 的索引優化
- 前端實作虛擬滾動 (ng-zorro cdk-virtual-scroll)

### 風險 2: 狀態聚合計算複雜度
**機率**: 高 | **影響**: 中

**緩解策略**:
- 使用 Angular Signals 的 computed() 自動快取
- 實作增量更新而非全量重算
- 限制樹深度 (最多 5 層)

### 風險 3: 因果鏈驗證效能
**機率**: 中 | **影響**: 中

**緩解策略**:
- 在 Event Store 層建立 causedBy 索引
- 使用圖資料庫（如 Neo4j）作為輔助查詢
- 實作驗證快取

---

## Context7 查詢結果

### 已查詢資源

#### 1. Angular Signals 最佳實踐
- 📚 `/sonusindhu/angular-signals-examples` (345 snippets, 82.1分)
- 📚 `/websites/angular_dev` (10841 snippets, 87.5分)

**關鍵學習點**:
- computed() 用於樹狀結構的狀態聚合
- effect() 處理父子聯動的副作用
- linkedSignal() 維護雙向關係

#### 2. Event Sourcing 參考架構
- 📚 `/pyeventsourcing/eventsourcing` (489 snippets, Python 但概念通用)
- 📚 `/spatie/laravel-event-sourcing` (119 snippets, 架構參考)

**關鍵學習點**:
- Aggregate 邊界設計
- Snapshot 策略
- Event Upcasting (版本升級)

---

## 實施建議

### 立即行動 (本週)
1. ✅ 完成此能力缺口分析
2. ⚠️ 查閱 Angular Signals 文件 (提升把握率至 95%)
3. ⚠️ 更新 Phase 6 計畫為 "Phase 6A"
4. ⚠️ 創建 Phase 6B 高階規劃

### 短期行動 (2 週內)
1. 實作 Enhanced Event Store (樹狀查詢)
2. 驗證 Signals 在複雜狀態樹的效能
3. 建立 Hierarchy Decision Functions 原型
4. 撰寫整合測試驗證因果鏈

### 中期行動 (1-2 月)
1. 完成 Phase 6B 實作
2. 進行壓力測試 (1000+ 任務樹)
3. 優化效能瓶頸
4. 準備 Phase 6C 詳細設計

---

## 結論與建議

### 最終評估
✅ **專案有能力支撐 task-new.md 的需求**

**但需遵守以下原則**:
1. **分階段實施** - 不可貪快一次到位
2. **嚴格遵守約束** - 單檔 ≤4000 字元，Occam's Razor
3. **持續驗證** - 每個 Phase 結束都需完整測試
4. **效能監控** - 樹狀結構需特別關注效能

### 下一步行動清單
- [ ] 查閱 Angular Signals 官方文件 (computed 與 effect 的樹狀應用)
- [ ] 更新 Phase 6 計畫標題為 "Phase 6A: Basic Task Management"
- [ ] 創建 `docs/plans/phase-6b-hierarchy-plan.md`
- [ ] 使用 Software-Planning-Tool 制定 Phase 6B 詳細任務清單
- [ ] 建立 Hierarchy Prototype 驗證技術可行性

---

**產出者**: GitHub Copilot (Causality-Driven Event-Sourcing Architecture Expert)  
**審核者**: 待審核  
**最後更新**: 2025-12-31
