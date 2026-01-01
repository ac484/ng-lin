# Phase 6B: Hierarchical Task Management Implementation Plan

**前置需求**: Phase 6A 完成  
**參考文件**: `docs/dev/task-new.md`, `docs/analysis/task-hierarchy-capability-gap-analysis.md`

---

## 執行摘要

**目標**: 實現樹狀任務階層 + 父子狀態聯動 + 協作者管理

**時間範圍**: 4週 (20工作日)

**複雜度**: 8/10 (高複雜度)

**約束條件**:
- 單一檔案 ≤ 4000 字元
- 樹深度限制 ≤ 5 層
- 金額守恆原則強制驗證
- 父子聯動需完整因果追蹤

---

## 核心功能範圍

### 1. 階層化事件系統
```typescript
// 新增事件類型
TaskSplit          // 拆分父任務為多個子任務
TaskMerge          // 合併子任務回父任務
TaskBudgetAdjusted // 預算調整觸發向下分配
TaskCancelled      // 遞迴取消所有子孫任務
```

### 2. 父子狀態聚合
```
子任務狀態 → 自動計算父任務進度
父任務取消 → 遞迴取消所有子孫
父任務預算調整 → 策略性向下分配
```

### 3. 協作者管理
```typescript
assignees: {
  contractors: string[];      // 承包商
  subcontractors: string[];   // 下包
  individuals: string[];      // 個人
}
```

---

## 實施任務清單 (12 Tasks)

### Week 1: Enhanced Event Store

**Task 1: Tree Query APIs** [8/10]
```typescript
// src/app/core/observability/events/store/tree-query.service.ts
interface TreeQueryService {
  getAllChildEvents(parentId: string): Promise<DomainEvent[]>;
  getEventChain(eventId: string): Promise<DomainEvent[]>;
  getAncestors(taskId: string): Promise<string[]>;
  getDescendants(taskId: string): Promise<string[]>;
}
```

**Task 2: Causality Chain Traversal** [7/10]
```typescript
// 實作因果鏈雙向遍歷
getCausalPredecessors(eventId: string): Promise<DomainEvent[]>;
getCausalSuccessors(eventId: string): Promise<DomainEvent[]>;
```

**Task 3: Batch Query Optimization** [6/10]
```typescript
// 減少 N+1 查詢問題
getBatchByAggregateIds(ids: string[]): Promise<Map<string, DomainEvent[]>>;
```

### Week 2: Hierarchy Decision Functions

**Task 4: decideTaskSplit** [8/10]
```typescript
// src/app/domains/task/decisions/split.decision.ts
export function decideTaskSplit(
  events: readonly DomainEvent[],
  command: TaskSplitCommand
): Result<TaskCreatedEvent[], Error> {
  // 驗證: 只能拆分 Pending 狀態
  // 驗證: 金額守恆 (Σ子 = 父)
  // 驗證: 深度不超過 5 層
  // 產生: 多個 TaskCreated Events with parentTaskId
}
```

**Task 5: decideTaskMerge** [7/10]
```typescript
// 反向操作: 合併子任務回父任務
// 驗證: 所有子任務都是 Pending
// 產生: TaskMerged Event
```

**Task 6: calculateParentState** [8/10]
```typescript
// 狀態聚合邏輯
export function calculateParentState(
  childEvents: readonly DomainEvent[]
): TaskState {
  // 計算父任務進度 = Σ(子進度) / 子數量
  // 計算父任務狀態 = 最差子狀態
  // 計算父任務金額 = Σ子金額
}
```

### Week 3: Hierarchy Projection Service

**Task 7: Hierarchy Projection** [8/10]
```typescript
// src/app/domains/task/projections/hierarchy.projection.ts
export class HierarchyProjectionService {
  private hierarchyGraph = signal<Map<string, TaskNode>>({});
  
  projectHierarchy(events: DomainEvent[]): void {
    // 建立父子關係圖
    // 維護 parentId → childIds[] 映射
    // 即時更新父任務狀態
  }
  
  getTaskTree(rootId: string): Signal<TaskTree> {
    return computed(() => buildTree(this.hierarchyGraph(), rootId));
  }
}
```

**Task 8: Recursive Cancellation** [7/10]
```typescript
// 處理父任務取消時的遞迴取消
function handleTaskCancelled(
  event: TaskCancelledEvent
): TaskCancelledEvent[] {
  const children = getChildren(event.aggregateId);
  return children.flatMap(child => 
    handleTaskCancelled({ ...event, aggregateId: child.id })
  );
}
```

**Task 9: Budget Allocation Strategy** [9/10]
```typescript
// src/app/domains/task/services/budget-allocation.service.ts
enum AllocationStrategy {
  Average,      // 平均分配
  Proportional, // 按原比例
  Manual        // 手動指定
}

function allocateBudget(
  parentAdjustment: number,
  children: Task[],
  strategy: AllocationStrategy
): Map<string, number>;
```

### Week 4: UI Integration & Testing

**Task 10: Tree UI Component** [7/10]
```typescript
// src/app/routes/tasks/components/task-tree/task-tree.component.ts
@Component({
  selector: 'app-task-tree',
  template: `
    <nz-tree
      [nzData]="taskTreeData()"
      [nzExpandAll]="false"
      (nzClick)="handleNodeClick($event)"
      (nzDrop)="handleNodeDrop($event)">
    </nz-tree>
  `
})
export class TaskTreeComponent {
  taskTreeData = computed(() => 
    this.hierarchyService.getTaskTree(this.rootTaskId())
  );
}
```

**Task 11: Integration Tests** [6/10]
```typescript
// tests/hierarchy/split-merge.integration.spec.ts
describe('Task Hierarchy Integration', () => {
  it('should maintain budget conservation on split', async () => {
    const parent = await createTask({ amount: 1000 });
    const children = await splitTask(parent.id, [
      { amount: 400 },
      { amount: 600 }
    ]);
    expect(sum(children.map(c => c.amount))).toBe(1000);
  });
});
```

**Task 12: Hierarchy E2E Tests** [5/10]
```typescript
// e2e/task-hierarchy.spec.ts
test('should update parent progress when child completes', async ({ page }) => {
  await createTaskHierarchy(page);
  await completeChildTask(page, 'child-1');
  await expect(page.locator('[data-testid="parent-progress"]'))
    .toContainText('50%');
});
```

---

## 技術決策記錄

### Decision 1: 樹結構儲存策略
**選擇**: Adjacency List (parentTaskId 欄位)  
**理由**: 簡單、符合 Event Sourcing、查詢彈性高  
**替代方案**: Nested Set (複雜、難維護)

### Decision 2: 狀態聚合計算時機
**選擇**: Real-time Projection with Signals  
**理由**: 即時反應、UI 自動更新  
**替代方案**: Batch Calculation (延遲高)

### Decision 3: 金額分配策略
**選擇**: 支援 3 種策略 (平均/比例/手動)  
**理由**: 彈性、符合實務需求  
**預設**: Proportional (按原比例)

---

## 風險管理

### 風險 1: 深度遞迴導致堆疊溢位
**緩解**: 限制樹深度 ≤ 5 層，超過則拒絕拆分

### 風險 2: 父子聯動的無限迴圈
**緩解**: 使用 causedBy 追蹤，避免循環依賴

### 風險 3: 大型樹的效能問題
**緩解**: 虛擬滾動 + 延遲載入 + Snapshot

---

## 驗收標準

- [ ] 可拆分任務至 5 層深度
- [ ] 父任務狀態自動聚合子任務
- [ ] 父任務取消時遞迴取消所有子孫
- [ ] 金額守恆驗證通過所有測試
- [ ] 預算調整正確分配至子任務
- [ ] UI 樹狀顯示流暢 (1000+ 節點)
- [ ] 整合測試覆蓋率 ≥ 85%
- [ ] E2E 測試涵蓋核心使用者流程

---

**產出者**: GitHub Copilot  
**基於**: Sequential-Thinking 相依性分析  
**前置 Phase**: Phase 6A (基礎任務管理)  
**後續 Phase**: Phase 6C (財務與驗收流程)
