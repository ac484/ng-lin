# 三層事件模型：施工版 Git 的骨架

## 文件目的

本文件定義施工管理系統的核心架構：三層事件模型（Three-Layer Event Model）。這不是單純的分類系統，而是描述「因果方向」與「真相層級」的嚴格劃分。

**核心原則：箭頭只能往下，不能回頭。**

```
L0 (治理) → L1 (事實) → L2 (推導)
   ↓           ↓           ↓
 規則定義    世界真相    計算觀點
```

---

## 總覽：三層架構

### 層級定義

| 層級 | 名稱 | 本質 | Git 類比 |
|------|------|------|----------|
| **L0** | Governance Events | 定義「誰可以寫、寫到哪」 | `git init`, branch rules, permissions |
| **L1** | Fact / Construction Events | 記錄「世界實際發生了什麼」 | `git commit` |
| **L2** | Derived State | 從事實「計算出我們想看的東西」 | `git log`, `git diff`, `git blame` |

### 關鍵區別

```typescript
// ❌ 錯誤理解：這是「類型分類」
// ✅ 正確理解：這是「因果鏈與真相層級」

L0: "這個系統允許做什麼" (合法性邊界)
L1: "實際做了什麼" (不可否認的事實)
L2: "我們如何理解它" (可重算的觀點)
```

---

## L0：治理事件 (Governance Events)

### 精確定義

> **不描述物理世界的變化，只描述「記錄與決策的合法性邊界」的事件。**

治理事件改變的是：
- ✅ 權限 (Permissions)
- ✅ 規則 (Rules)
- ✅ 參考線 (References)
- ✅ 合法範圍 (Scope)

**❌ 它們不代表工程實際做了什麼**

### L0 的本質類比

| Git 概念 | 施工對應 | 說明 |
|----------|----------|------|
| `git init` | 建立工程儲存庫 | 創建真相容器 |
| 建立 branch | 建立方案 / 狀態線 | 平行宇宙的可能性 |
| PR 規則 | 驗收 / 核准流程 | 誰能 merge 到 main |
| 權限設定 | 角色責任矩陣 | 誰能寫入哪些區域 |
| `.gitignore` | 範圍排除規則 | 什麼不需要記錄 |

**重要觀念：Git repository 不是程式碼，是「真相容器」**

### 常見 L0 事件範例

#### 系統層級
```typescript
interface GovernanceEvent {
  event_type: 'governance';
  governance_type: 
    | 'repository_created'      // 工程儲存庫建立
    | 'reference_created'       // 建立參考線 (如 current_state)
    | 'scope_defined'           // 定義施工範圍
    | 'scope_changed'           // 變更令 (Change Order)
    | 'workflow_defined'        // 定義驗收流程
    | 'permission_granted'      // 授予權限
    | 'permission_revoked';     // 撤銷權限
  
  timestamp: Date;
  actor: string;
  metadata: Record<string, any>;
}
```

#### 具體範例

1. **工程儲存庫建立**
   ```typescript
   {
     governance_type: 'repository_created',
     project_id: 'PROJ-2024-001',
     timestamp: '2024-01-15T09:00:00Z',
     actor: 'system',
     metadata: {
       project_name: '台北市信義區住宅新建工程',
       contract_number: 'CT-2024-001'
     }
   }
   ```

2. **建立 current_state reference**
   ```typescript
   {
     governance_type: 'reference_created',
     reference_name: 'current_state',
     timestamp: '2024-01-15T09:05:00Z',
     actor: 'system',
     metadata: {
       description: '指向當前現場實際狀態的參考線'
     }
   }
   ```

3. **施工範圍變更**
   ```typescript
   {
     governance_type: 'scope_changed',
     change_order_id: 'CO-2024-003',
     timestamp: '2024-03-20T14:30:00Z',
     actor: 'owner_representative',
     metadata: {
       reason: '增加地下室防水層施工',
       affected_areas: ['B1F', 'B2F'],
       budget_impact: 2500000
     }
   }
   ```

### L0 的鐵律（必須遵守）

#### 四大禁止

| 禁止項 | 原因 | 常見錯誤 |
|--------|------|----------|
| ❌ 當成進度 | 簽約 ≠ 開工 | 「合約簽了就是 5% 完成」 |
| ❌ 當成請款依據 | 沒有實際產出 | 「建立專案就請款管理費」 |
| ❌ 計算完成率 | 沒有物理證據 | 「定義範圍 = 30% 完工」 |
| ❌ 產生施工記錄 | 不是實際行為 | 「變更令 = 施工完成」 |

#### 正確理解

```typescript
// ❌ 錯誤：把 L0 當作進度
const progress = governance_events.length / total_milestones; // 大錯特錯!

// ✅ 正確：L0 只提供「誰有資格說話」
const canSubmit = checkPermission(actor, 'submit_construction_event');
const isInScope = checkScope(location, current_contract);
```

### L0 設計錯誤的後果

如果 L0 設計錯誤，會發生：

1. **合約當成進度**
   - 系統顯示：簽約當天完成 20%
   - 實際狀況：工地還沒開工

2. **里程碑當成完成**
   - 系統顯示：已達成第三里程碑
   - 實際狀況：根本還在第一階段

3. **虛假的完工率**
   - 系統顯示：專案第一天就 30% 完工
   - 原因：把治理事件算成施工進度

### L0 的實作建議

```typescript
// L0 事件的儲存結構
interface GovernanceEventStore {
  // 治理事件永遠獨立儲存
  events: GovernanceEvent[];
  
  // 不與 L1 混合查詢
  // 不參與進度計算
  // 不影響完工率
  
  // 只用於：
  // 1. 權限檢查
  // 2. 範圍驗證
  // 3. 流程控制
}

// 正確的使用方式
class ConstructionEventService {
  async submitEvent(event: ConstructionEvent) {
    // 1. 先查 L0：這個人有權限嗎?
    const hasPermission = await this.checkGovernance(event.actor);
    
    // 2. 再查 L0：這個位置在範圍內嗎?
    const inScope = await this.checkScope(event.target);
    
    // 3. 通過才寫入 L1
    if (hasPermission && inScope) {
      await this.writeL1Event(event);
    }
  }
}
```

---

## L1：事實事件 (Fact / Construction Events)

### 精確定義

> **描述「物理世界已經發生且不可否認的事實」的事件。**

### L1 的四大特性

| 特性 | 說明 | 範例 |
|------|------|------|
| **有時間** | 精確的發生時刻 | `2024-03-15 14:30:25` |
| **有人** | 明確的執行者 | `工班長_張三` |
| **有證據** | 客觀的佐證資料 | 照片、簽名、GPS |
| **不可修改** | 只能補充，不能刪除 | append-only log |

**核心概念：這是施工版的 `git commit`**

### L1 的最小模型

```typescript
interface ConstructionEvent {
  // 核心欄位（必填）
  event_type: string;              // 澆置 / 綁筋 / 安裝 / 驗收
  timestamp: Date;                 // 發生時間
  actor: string;                   // 執行者
  
  // 目標位置（可為 provisional）
  target: {
    type: 'provisional' | 'confirmed';
    location?: string;             // 如 "B1F-C3-柱"
    provisional_description?: string; // "地下室某根柱"
  };
  
  // 證據（強制要求）
  evidence: Evidence[];            // 至少一個證據
  
  // 額外屬性
  metadata?: Record<string, any>;
}

interface Evidence {
  type: 'photo' | 'signature' | 'gps' | 'sensor' | 'document';
  url?: string;
  data?: any;
  timestamp: Date;
}
```

### L1 事件的判斷鐵則

**問三個問題，三個都是「是」才能進 L1：**

```typescript
function isValidL1Event(event: any): boolean {
  // 1. 它真的發生過嗎？
  const hasHappened = event.timestamp <= Date.now();
  
  // 2. 有客觀證據嗎？
  const hasEvidence = event.evidence && event.evidence.length > 0;
  
  // 3. 即使後悔，也不能假裝沒發生嗎？
  const isIrreversible = true; // 事實不可改變，只能補充
  
  return hasHappened && hasEvidence && isIrreversible;
}
```

### 常見 L1 事件範例

#### 1. 鋼筋綁紮完成

```typescript
{
  event_type: 'rebar_installation_completed',
  timestamp: '2024-03-15T14:30:00Z',
  actor: 'foreman_wang',
  target: {
    type: 'confirmed',
    location: 'B1F-C3-column'
  },
  evidence: [
    {
      type: 'photo',
      url: 'https://storage/evidence/rebar-001.jpg',
      timestamp: '2024-03-15T14:28:00Z'
    },
    {
      type: 'signature',
      data: { signer: 'inspector_lee', role: 'quality_control' },
      timestamp: '2024-03-15T14:30:00Z'
    }
  ],
  metadata: {
    rebar_type: 'D25',
    quantity: 120,
    spacing: '150mm'
  }
}
```

#### 2. 混凝土澆置完成

```typescript
{
  event_type: 'concrete_pour_completed',
  timestamp: '2024-03-16T11:45:00Z',
  actor: 'concrete_crew_chief',
  target: {
    type: 'confirmed',
    location: 'B1F-slab'
  },
  evidence: [
    {
      type: 'photo',
      url: 'https://storage/evidence/concrete-001.jpg',
      timestamp: '2024-03-16T11:40:00Z'
    },
    {
      type: 'document',
      url: 'https://storage/evidence/concrete-delivery-note.pdf',
      timestamp: '2024-03-16T08:30:00Z'
    },
    {
      type: 'sensor',
      data: { temperature: 28, slump: 180 },
      timestamp: '2024-03-16T11:45:00Z'
    }
  ],
  metadata: {
    concrete_grade: '280kgf/cm²',
    volume: 45.5,
    supplier: 'XX混凝土公司',
    truck_number: 'ABC-1234'
  }
}
```

#### 3. 驗收事件

```typescript
{
  event_type: 'inspection_completed',
  timestamp: '2024-03-17T15:20:00Z',
  actor: 'inspector_lee',
  target: {
    type: 'confirmed',
    location: 'B1F-C3-column'
  },
  evidence: [
    {
      type: 'signature',
      data: { 
        result: 'passed',
        inspector: 'inspector_lee',
        checklist_completed: true
      },
      timestamp: '2024-03-17T15:20:00Z'
    },
    {
      type: 'photo',
      url: 'https://storage/evidence/inspection-001.jpg',
      timestamp: '2024-03-17T15:15:00Z'
    }
  ],
  metadata: {
    inspection_type: 'rebar_inspection',
    result: 'passed',
    notes: '鋼筋綁紮符合規範，准予澆置'
  }
}
```

### L1 的絕對禁止項目

| 禁止項 | 原因 | 常見錯誤範例 |
|--------|------|--------------|
| ❌ 進度百分比 | 主觀判斷，非事實 | `{ progress: 75% }` |
| ❌ 預估完成 | 未來，尚未發生 | `{ estimated_completion: '2024-04-01' }` |
| ❌ 預排施工 | 計畫，非事實 | `{ scheduled_pour: '2024-03-20' }` |
| ❌ KPI | 推導結果，屬於 L2 | `{ efficiency: 0.85 }` |
| ❌ 主觀評價 | 個人意見，非客觀 | `{ quality: 'good' }` (應改為量測數據) |

### 正確 vs 錯誤範例

```typescript
// ❌ 錯誤：L1 事件包含推導資訊
{
  event_type: 'work_completed',
  progress: 75%,                    // ❌ 這是 L2
  estimated_days_remaining: 5,      // ❌ 這是預測
  efficiency_score: 0.85            // ❌ 這是 KPI
}

// ✅ 正確：L1 只記錄事實
{
  event_type: 'concrete_pour_completed',
  timestamp: '2024-03-16T11:45:00Z',
  actor: 'concrete_crew_chief',
  target: { type: 'confirmed', location: 'B1F-slab' },
  evidence: [/* 照片、簽名等 */],
  metadata: {
    volume: 45.5,                   // ✅ 量測值
    start_time: '09:00',            // ✅ 記錄
    end_time: '11:45'               // ✅ 記錄
  }
}
// 進度、效率等 → 由 L2 計算
```

### L1 的實作建議

#### 1. Event Store 設計

```typescript
class L1EventStore {
  // Append-only，絕不修改
  private events: ConstructionEvent[] = [];
  
  // 只允許新增
  async append(event: ConstructionEvent): Promise<void> {
    // 驗證必要欄位
    this.validateEvent(event);
    
    // 驗證證據
    this.validateEvidence(event.evidence);
    
    // 寫入（不可修改）
    await this.database.insert('construction_events', event);
    
    // 永不提供 update() 或 delete() 方法
  }
  
  // 如需修正，只能補充新事件
  async appendCorrection(
    originalEventId: string,
    correction: ConstructionEvent
  ): Promise<void> {
    correction.metadata = {
      ...correction.metadata,
      corrects: originalEventId,
      correction_reason: '原記錄位置錯誤'
    };
    await this.append(correction);
  }
}
```

#### 2. 證據驗證

```typescript
class EvidenceValidator {
  validateEvidence(evidence: Evidence[]): void {
    // 至少要有一個證據
    if (evidence.length === 0) {
      throw new Error('L1 事件必須至少有一個證據');
    }
    
    // 驗證時間戳記合理性
    evidence.forEach(e => {
      if (e.timestamp > Date.now()) {
        throw new Error('證據時間戳記不能在未來');
      }
    });
    
    // 驗證證據類型
    const validTypes = ['photo', 'signature', 'gps', 'sensor', 'document'];
    evidence.forEach(e => {
      if (!validTypes.includes(e.type)) {
        throw new Error(`無效的證據類型: ${e.type}`);
      }
    });
  }
}
```

#### 3. Provisional Location 處理

```typescript
// 允許先記錄「不確定位置」的事實
{
  event_type: 'rebar_installation_completed',
  timestamp: '2024-03-15T14:30:00Z',
  actor: 'foreman_wang',
  target: {
    type: 'provisional',
    provisional_description: '地下室東北角某根柱子'
  },
  evidence: [/* ... */]
}

// 後續補充確切位置（新增事件，不修改原事件）
{
  event_type: 'location_confirmed',
  timestamp: '2024-03-15T16:00:00Z',
  actor: 'surveyor_chen',
  target: {
    type: 'confirmed',
    location: 'B1F-C3-column'
  },
  metadata: {
    confirms_event: 'event-id-12345'
  },
  evidence: [/* 測量證據 */]
}
```

---

## L2：推導狀態 (Derived State)

### 精確定義

> **不是事件，是「從 L1 事實計算出來的觀點」。**

### L2 的三大特性

| 特性 | 說明 | 範例 |
|------|------|------|
| **可以重算** | 算法改變時可重新計算 | 完工率計算公式調整 |
| **可以被丟棄** | 刪除後可從 L1 重建 | 清除快取後重新計算 |
| **可以有多個版本** | 不同角色看到不同觀點 | 業主版 vs 承包商版 |

**核心概念：就像 Git 的 `git log`, `git diff`, `git blame`**

### L2 的來源公式（鐵律）

```typescript
// ✅ 正確：L2 完全由 L1 計算而來
L2 = f(L1_events)

// ❌ 禁止：人工填寫 L2
L2 ← manual_input  // 大錯特錯!

// ❌ 禁止：L2 回寫 L1
L2 → L1  // 完全錯誤!
```

### 常見 L2 狀態範例

#### 1. 完工率計算

```typescript
class CompletionRateCalculator {
  // L2: 完全由 L1 計算
  calculateCompletionRate(projectId: string): number {
    // 從 L1 取得所有施工事件
    const events = this.l1Store.getEvents(projectId);
    
    // 計算已完成的項目
    const completedItems = this.countCompletedItems(events);
    
    // 從 L0 取得總項目數
    const totalItems = this.l0Store.getTotalItemsInScope(projectId);
    
    // 計算完工率
    return (completedItems / totalItems) * 100;
  }
  
  private countCompletedItems(events: ConstructionEvent[]): number {
    // 根據事件類型判斷完成項目
    const completionEvents = events.filter(e => 
      e.event_type.includes('completed') ||
      e.event_type.includes('inspection_passed')
    );
    
    // 去重（同一位置可能有多個事件）
    const uniqueLocations = new Set(
      completionEvents.map(e => e.target.location)
    );
    
    return uniqueLocations.size;
  }
}
```

#### 2. 當前狀態推導

```typescript
class CurrentStateCalculator {
  // L2: 從 L1 事件推導「現在做到哪裡」
  getCurrentFloor(projectId: string): string {
    // 取得所有澆置事件，按時間排序
    const pourEvents = this.l1Store
      .getEvents(projectId)
      .filter(e => e.event_type === 'concrete_pour_completed')
      .sort((a, b) => b.timestamp - a.timestamp);
    
    // 最新的澆置位置
    if (pourEvents.length > 0) {
      const latestLocation = pourEvents[0].target.location;
      const floor = this.extractFloor(latestLocation); // 如 "B1F"
      return floor;
    }
    
    return 'NOT_STARTED';
  }
  
  private extractFloor(location: string): string {
    // 從位置字串提取樓層
    const match = location.match(/^([BF0-9]+)/);
    return match ? match[1] : 'UNKNOWN';
  }
}
```

#### 3. 延誤分析

```typescript
class DelayAnalyzer {
  // L2: 從 L1 + L0 計算延誤
  calculateDelay(projectId: string): DelayReport {
    // 從 L0 取得計畫時程
    const schedule = this.l0Store.getSchedule(projectId);
    
    // 從 L1 取得實際完成時間
    const actualEvents = this.l1Store.getEvents(projectId);
    
    const delays = schedule.milestones.map(milestone => {
      const plannedDate = milestone.planned_date;
      const actualEvent = actualEvents.find(e => 
        e.metadata?.milestone_id === milestone.id &&
        e.event_type.includes('completed')
      );
      
      if (!actualEvent) {
        return {
          milestone: milestone.name,
          status: 'NOT_COMPLETED',
          delay: null
        };
      }
      
      const actualDate = actualEvent.timestamp;
      const delayDays = this.daysBetween(plannedDate, actualDate);
      
      return {
        milestone: milestone.name,
        status: delayDays > 0 ? 'DELAYED' : 'ON_TIME',
        delay: delayDays
      };
    });
    
    return { delays };
  }
}
```

#### 4. 請款金額計算

```typescript
class PaymentCalculator {
  // L2: 從 L1 + L0 計算應付金額
  calculatePaymentAmount(projectId: string, period: string): Payment {
    // 從 L0 取得合約單價
    const contract = this.l0Store.getContract(projectId);
    const unitPrices = contract.unit_prices;
    
    // 從 L1 取得本期完成的工項
    const events = this.l1Store
      .getEvents(projectId)
      .filter(e => 
        e.event_type.includes('completed') &&
        this.isInPeriod(e.timestamp, period)
      );
    
    // 計算各工項數量
    const quantities = this.calculateQuantities(events);
    
    // 計算金額
    let totalAmount = 0;
    for (const [itemType, quantity] of Object.entries(quantities)) {
      const unitPrice = unitPrices[itemType] || 0;
      totalAmount += quantity * unitPrice;
    }
    
    return {
      period,
      totalAmount,
      breakdown: quantities,
      calculatedFrom: events.map(e => e.id)
    };
  }
}
```

### L2 為什麼必須獨立？

```typescript
// ❌ 錯誤：把 L2 混入 L1
interface ConstructionEvent {
  event_type: string;
  timestamp: Date;
  actor: string;
  // ...
  progress: number;  // ❌ 這是 L2，不該在 L1
  delay_days: number; // ❌ 這是 L2，不該在 L1
}

// ✅ 正確：L2 完全分離
interface ConstructionEvent {
  // 只有事實
  event_type: string;
  timestamp: Date;
  actor: string;
  target: Target;
  evidence: Evidence[];
}

interface DerivedState {
  // L2 獨立計算
  projectId: string;
  calculatedAt: Date;
  completionRate: number;
  currentFloor: string;
  delayDays: number;
  nextPaymentAmount: number;
  
  // 記錄計算來源
  calculationMethod: string;
  sourceEvents: string[];  // L1 事件 IDs
}
```

**原因：**

1. **算法會改變**
   - 今天用「按數量」算完工率
   - 明天改用「按權重」算
   - L1 事實不應該跟著改

2. **合約規則會變更**
   - 變更令調整單價
   - L1 事實不變，但 L2 請款金額重算

3. **不同角色看法不同**
   - 業主看「驗收通過」才算完成
   - 承包商看「施工完成」就算完成
   - L1 記錄兩種事實，L2 各自解釋

### L2 的實作建議

#### 1. 計算快取

```typescript
class L2Cache {
  private cache = new Map<string, DerivedState>();
  
  // 計算並快取
  async getOrCalculate(
    projectId: string,
    calculator: () => DerivedState
  ): Promise<DerivedState> {
    const cached = this.cache.get(projectId);
    
    // 檢查快取是否過期
    if (cached && !this.isStale(cached)) {
      return cached;
    }
    
    // 重新計算
    const fresh = calculator();
    this.cache.set(projectId, fresh);
    return fresh;
  }
  
  // 當 L1 有新事件時，清除快取
  invalidate(projectId: string): void {
    this.cache.delete(projectId);
  }
}
```

#### 2. 多版本 L2

```typescript
// 不同角色有不同的 L2 計算邏輯
class L2ViewFactory {
  getView(role: 'owner' | 'contractor' | 'auditor'): L2Calculator {
    switch (role) {
      case 'owner':
        // 業主版：只看驗收通過的
        return new OwnerL2Calculator();
      
      case 'contractor':
        // 承包商版：看施工完成的
        return new ContractorL2Calculator();
      
      case 'auditor':
        // 稽核版：看所有有證據的
        return new AuditorL2Calculator();
    }
  }
}

class OwnerL2Calculator implements L2Calculator {
  calculateCompletion(events: ConstructionEvent[]): number {
    // 只計算有「驗收通過」的項目
    const inspectedEvents = events.filter(e =>
      e.event_type === 'inspection_completed' &&
      e.metadata?.result === 'passed'
    );
    // ...
  }
}
```

#### 3. L2 計算的可追溯性

```typescript
interface DerivedState {
  // 計算結果
  completionRate: number;
  
  // 可追溯性資訊（重要！）
  metadata: {
    calculatedAt: Date;
    calculationMethod: string;
    sourceEvents: string[];        // 使用的 L1 事件
    governanceRules: string[];     // 使用的 L0 規則
    version: string;               // 計算邏輯版本
  };
}

// 當完工率有爭議時，可以追溯
async function traceCalculation(stateId: string) {
  const state = await getL2State(stateId);
  
  console.log(`計算時間: ${state.metadata.calculatedAt}`);
  console.log(`計算方法: ${state.metadata.calculationMethod}`);
  console.log(`來源事件:`);
  
  for (const eventId of state.metadata.sourceEvents) {
    const event = await getL1Event(eventId);
    console.log(`  - ${event.event_type} at ${event.timestamp}`);
  }
}
```

---

## 三層的不可逆關係

### 因果鏈（非常重要）

```
L0 → L1 → L2
只能往下，絕不回頭
```

### 允許的依賴關係

```typescript
// ✅ 允許：L1 查詢 L0（檢查權限與範圍）
class L1EventService {
  async submitEvent(event: ConstructionEvent) {
    // 查 L0：這個人有權限嗎？
    const hasPermission = await this.l0.checkPermission(event.actor);
    
    // 查 L0：這個位置在範圍內嗎？
    const inScope = await this.l0.checkScope(event.target);
    
    if (hasPermission && inScope) {
      await this.writeEvent(event);
    }
  }
}

// ✅ 允許：L2 讀取 L1 + L0（計算推導狀態）
class L2Calculator {
  calculateCompletion(projectId: string): number {
    // 從 L1 取得事實
    const events = this.l1.getEvents(projectId);
    
    // 從 L0 取得範圍
    const scope = this.l0.getScope(projectId);
    
    // 計算
    return this.calculate(events, scope);
  }
}
```

### 禁止的反向依賴（極度危險）

| 反向依賴 | 為什麼錯 | 後果 |
|----------|----------|------|
| **L2 → L1** | 為了報表好看而造假 | 事實被竄改 |
| **L0 → L1 (造假)** | 治理壓制事實 | 真相消失 |
| **L2 → L0** | KPI 反過來訂規則 | 本末倒置 |
| **L1 → L2** | 事件包含推導結果 | 循環依賴 |

### 具體反面案例

#### 案例 1：L2 → L1 (為了報表造假)

```typescript
// ❌ 極度危險的錯誤範例
class DashboardService {
  async updateProgress(projectId: string, newProgress: number) {
    // 從 L2 dashboard 直接修改 L1 事件
    const events = await this.l1.getEvents(projectId);
    
    // 為了讓進度達到 newProgress，竄改事件
    const fakeEvent = {
      event_type: 'fake_completion',
      timestamp: new Date(),
      actor: 'system',  // ❌ 沒有真實執行者
      target: { type: 'confirmed', location: 'fake' },
      evidence: []  // ❌ 沒有證據
    };
    
    await this.l1.append(fakeEvent);  // ❌ 為了報表而造假
  }
}

// ✅ 正確做法：永遠不允許為了 L2 而修改 L1
// L2 不滿意？改計算方法，不改事實！
```

#### 案例 2：L0 → L1 (治理壓制事實)

```typescript
// ❌ 危險的錯誤範例
class GovernanceService {
  async changeScopeAndDeleteEvents(projectId: string, newScope: string) {
    // 變更範圍 (L0)
    await this.l0.updateScope(projectId, newScope);
    
    // ❌ 刪除不在新範圍內的 L1 事件
    const events = await this.l1.getEvents(projectId);
    const outOfScopeEvents = events.filter(e => 
      !this.isInScope(e.target, newScope)
    );
    
    for (const event of outOfScopeEvents) {
      await this.l1.delete(event.id);  // ❌ 刪除事實！
    }
  }
}

// ✅ 正確做法：L0 改變不影響已發生的 L1
// 範圍外的事實仍然是事實，只是在 L2 計算時不納入
```

#### 案例 3：L2 → L0 (KPI 反過來訂規則)

```typescript
// ❌ 本末倒置的錯誤範例
class KPIService {
  async adjustRulesToMeetKPI(projectId: string) {
    // 計算當前 KPI (L2)
    const currentKPI = await this.l2.calculateKPI(projectId);
    
    // KPI 不達標
    if (currentKPI < 0.8) {
      // ❌ 為了達標而調整 L0 規則
      await this.l0.relaxInspectionRules(projectId);  // 放寬驗收標準
      await this.l0.reduceRequiredEvidence(projectId); // 減少證據要求
    }
  }
}

// ✅ 正確做法：規則就是規則，不因 KPI 而改變
// KPI 不達標？加強執行，不是降低標準
```

### 依賴方向的正確心智模型

```typescript
// 想像成水流：只能往下流
class EventSystem {
  // L0: 水源（規則）
  governance: GovernanceLayer;
  
  // L1: 河道（事實）
  facts: FactLayer;
  
  // L2: 水車（利用水流發電）
  derived: DerivedLayer;
  
  // ✅ 水流方向
  flow() {
    // 1. L0 定義河道邊界
    const boundaries = this.governance.getRules();
    
    // 2. L1 在邊界內記錄水流
    const flow = this.facts.record(boundaries);
    
    // 3. L2 利用水流計算產出
    const output = this.derived.calculate(flow);
    
    // ❌ 水不會倒流
    // this.facts.modify(output);  // 絕對禁止
  }
}
```

---

## 一句話總結（永遠不會搞錯）

> **L0 決定「誰能說話」**  
> **L1 記錄「世界說了什麼」**  
> **L2 解釋「我們怎麼理解它」**

---

## 實作優先順序（最重要的建議）

### 如果你現在只能做一層

```typescript
// ✅ 優先做 L1，其他都可以慢
class MinimalViableSystem {
  // 第一階段：只做 L1
  l1Store: ConstructionEventStore;
  
  // L0 可以先用最簡單的實作
  // (例如：所有人都有權限，範圍全開)
  
  // L2 可以先用 SQL 手寫查詢
  // (例如：SELECT COUNT(*) FROM events WHERE type = 'completed')
  
  constructor() {
    // 投入所有精力確保 L1 正確
    this.l1Store = new ConstructionEventStore({
      enforceEvidence: true,        // 強制要證據
      enforceImmutability: true,    // 強制不可修改
      enforceTimestamp: true,       // 強制時間戳
      enforceActor: true            // 強制執行者
    });
  }
}
```

**原因：**

1. **L1 是系統的靈魂**
   - L1 錯了，一切都錯
   - L1 對了，L2 隨時可以重算
   - L0 可以後補

2. **L1 最難改**
   - L0 改規則：影響範圍小
   - L2 改算法：只是重新計算
   - L1 改結構：整個系統重建

3. **L1 是唯一的真相**
   - L0 可以有多個版本（不同合約）
   - L2 可以有多個版本（不同角色）
   - L1 只有一個版本（世界的真相）

### 漸進式實作路徑

```typescript
// 階段 1：建立 L1 骨架（第 1-2 週）
class Phase1 {
  // 只做最核心的事件記錄
  l1Store: ConstructionEventStore;
  
  // 手動驗證權限（不需要完整的 L0）
  // 手動寫 SQL 查詢（不需要完整的 L2）
}

// 階段 2：補充基本 L0（第 3-4 週）
class Phase2 extends Phase1 {
  // 加入基本的權限檢查
  l0Store: GovernanceStore;
  
  // 在寫入 L1 前檢查權限
  validatePermission(actor: string): boolean;
}

// 階段 3：建立常用 L2（第 5-8 週）
class Phase3 extends Phase2 {
  // 自動計算常用的 L2
  l2Calculators: {
    completion: CompletionCalculator;
    payment: PaymentCalculator;
    delay: DelayCalculator;
  };
}

// 階段 4：完善與優化（第 9+ 週）
class Phase4 extends Phase3 {
  // 加入快取、多版本 L2、效能優化等
}
```

---

## 常見問題 (FAQ)

### Q1: 驗收事件算 L1 還是 L0？

**答：L1。**

驗收是「實際發生的檢查行為」，不是「定義規則」。

```typescript
// ✅ L1: 驗收事件
{
  event_type: 'inspection_completed',
  timestamp: '2024-03-17T15:20:00Z',
  actor: 'inspector_lee',
  target: { type: 'confirmed', location: 'B1F-C3' },
  evidence: [
    { type: 'signature', data: { result: 'passed' } }
  ]
}

// L0: 驗收規則（定義什麼叫做「通過」）
{
  governance_type: 'inspection_rule_defined',
  rule: {
    inspection_type: 'rebar',
    required_checks: ['spacing', 'diameter', 'overlap'],
    pass_criteria: 'all_checks_pass'
  }
}
```

### Q2: 設計變更算哪一層？

**答：看情況。**

- **設計變更令** → L0（改變範圍）
- **實際施作變更後的設計** → L1（記錄事實）

```typescript
// L0: 設計變更令
{
  governance_type: 'scope_changed',
  change_order_id: 'CO-2024-005',
  changes: {
    original: '柱深 80cm',
    revised: '柱深 100cm'
  }
}

// L1: 實際施作
{
  event_type: 'concrete_pour_completed',
  target: { type: 'confirmed', location: 'B1F-C3' },
  metadata: {
    depth: 100,  // 實際做了 100cm
    change_order: 'CO-2024-005'
  }
}
```

### Q3: 可以手動調整 L2 的計算結果嗎？

**答：絕對不行。**

如果 L2 計算結果不符預期：

1. ✅ 檢查 L1 事實是否完整
2. ✅ 檢查 L0 規則是否正確
3. ✅ 修改 L2 的計算邏輯
4. ❌ 絕不直接改 L2 的數字

```typescript
// ❌ 錯誤
async function fixCompletionRate(projectId: string) {
  const state = await getL2State(projectId);
  state.completionRate = 75;  // 手動改成 75%
  await saveL2State(state);
}

// ✅ 正確
async function recalculateCompletionRate(projectId: string) {
  // 從 L1 重新計算
  const events = await getL1Events(projectId);
  const scope = await getL0Scope(projectId);
  
  const newRate = calculateRate(events, scope);
  
  // 如果結果還是不對，檢查計算邏輯，不是改數字
  if (newRate !== expectedRate) {
    console.log('計算邏輯可能需要調整');
    console.log('事件數:', events.length);
    console.log('範圍:', scope);
  }
}
```

### Q4: 如果 L1 事件記錯了怎麼辦？

**答：補充新事件，不要修改原事件。**

```typescript
// ❌ 錯誤：修改原事件
async function fixWrongEvent(eventId: string) {
  const event = await getL1Event(eventId);
  event.target.location = 'B1F-C4';  // 改位置
  await updateL1Event(event);  // ❌ L1 不能修改
}

// ✅ 正確：補充修正事件
async function correctEvent(originalEventId: string) {
  await appendL1Event({
    event_type: 'location_correction',
    timestamp: new Date(),
    actor: 'surveyor_chen',
    target: {
      type: 'confirmed',
      location: 'B1F-C4'
    },
    evidence: [
      { type: 'gps', data: { correctedLocation: true } }
    ],
    metadata: {
      corrects: originalEventId,
      reason: '原記錄位置錯誤，應為 C4 非 C3'
    }
  });
}
```

### Q5: 不同承包商可以有不同的 L1 嗎？

**答：不行，L1 是唯一真相。**

但可以有：

- 不同的 L0（不同合約、不同範圍）
- 不同的 L2（不同角色看到不同完工率）

```typescript
// ❌ 錯誤：每個承包商有自己的 L1
contractorA.l1Store.append({ ... });
contractorB.l1Store.append({ ... });

// ✅ 正確：共用 L1，但可以有不同的 L0 範圍
sharedL1Store.append({ 
  actor: 'contractor_a',
  ... 
});

// L0 定義 contractor_a 的範圍
l0Store.append({
  governance_type: 'scope_defined',
  actor: 'contractor_a',
  scope: ['B1F', 'B2F']
});

// L2 根據範圍計算各自的完工率
const rateA = l2Calculator.calculate('contractor_a');
const rateB = l2Calculator.calculate('contractor_b');
```

---

## TypeScript 實作範例

### 完整的型別定義

```typescript
// ==================== L0 ====================
interface GovernanceEvent {
  id: string;
  event_type: 'governance';
  governance_type: 
    | 'repository_created'
    | 'reference_created'
    | 'scope_defined'
    | 'scope_changed'
    | 'workflow_defined'
    | 'permission_granted'
    | 'permission_revoked';
  timestamp: Date;
  actor: string;
  metadata: Record<string, any>;
}

// ==================== L1 ====================
interface ConstructionEvent {
  id: string;
  event_type: string;
  timestamp: Date;
  actor: string;
  target: {
    type: 'provisional' | 'confirmed';
    location?: string;
    provisional_description?: string;
  };
  evidence: Evidence[];
  metadata?: Record<string, any>;
}

interface Evidence {
  type: 'photo' | 'signature' | 'gps' | 'sensor' | 'document';
  url?: string;
  data?: any;
  timestamp: Date;
}

// ==================== L2 ====================
interface DerivedState {
  projectId: string;
  calculatedAt: Date;
  
  // 計算結果
  completionRate: number;
  currentFloor: string;
  delayDays: number;
  nextPaymentAmount: number;
  
  // 可追溯性
  metadata: {
    calculationMethod: string;
    sourceEvents: string[];
    governanceRules: string[];
    version: string;
  };
}

// ==================== 系統介面 ====================
interface EventSystem {
  // L0: 治理層
  governance: {
    createRepository(projectId: string): Promise<void>;
    defineScope(projectId: string, scope: any): Promise<void>;
    checkPermission(actor: string, action: string): Promise<boolean>;
    checkScope(location: string, projectId: string): Promise<boolean>;
  };
  
  // L1: 事實層
  facts: {
    append(event: ConstructionEvent): Promise<void>;
    getEvents(projectId: string, filter?: any): Promise<ConstructionEvent[]>;
    // 注意：沒有 update() 或 delete()
  };
  
  // L2: 推導層
  derived: {
    calculateCompletion(projectId: string): Promise<number>;
    getCurrentState(projectId: string): Promise<DerivedState>;
    calculatePayment(projectId: string, period: string): Promise<number>;
    invalidateCache(projectId: string): Promise<void>;
  };
}
```

### Angular 20 服務實作範例

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

// L1 事件服務
@Injectable({ providedIn: 'root' })
export class ConstructionEventService {
  private http = inject(HttpClient);
  private governanceService = inject(GovernanceService);
  
  /**
   * 提交施工事件（帶權限與範圍檢查）
   */
  async submitEvent(event: ConstructionEvent): Promise<void> {
    // 1. 檢查 L0：權限
    const hasPermission = await this.governanceService
      .checkPermission(event.actor, 'submit_construction_event');
    
    if (!hasPermission) {
      throw new Error('沒有提交權限');
    }
    
    // 2. 檢查 L0：範圍
    if (event.target.type === 'confirmed') {
      const inScope = await this.governanceService
        .checkScope(event.target.location!, event.projectId);
      
      if (!inScope) {
        throw new Error('位置不在施工範圍內');
      }
    }
    
    // 3. 驗證證據
    this.validateEvidence(event.evidence);
    
    // 4. 寫入 L1（append-only）
    await this.http.post('/api/events', event).toPromise();
    
    // 5. 清除 L2 快取
    await this.derived.invalidateCache(event.projectId);
  }
  
  /**
   * 查詢事件（只讀）
   */
  getEvents(projectId: string, filter?: any): Observable<ConstructionEvent[]> {
    return this.http.get<ConstructionEvent[]>(
      `/api/projects/${projectId}/events`,
      { params: filter }
    );
  }
  
  private validateEvidence(evidence: Evidence[]): void {
    if (evidence.length === 0) {
      throw new Error('至少需要一個證據');
    }
    
    evidence.forEach(e => {
      if (e.timestamp > new Date()) {
        throw new Error('證據時間不能在未來');
      }
    });
  }
}

// L2 推導服務
@Injectable({ providedIn: 'root' })
export class DerivedStateService {
  private http = inject(HttpClient);
  private eventService = inject(ConstructionEventService);
  private governanceService = inject(GovernanceService);
  
  /**
   * 計算完工率（從 L1 + L0 推導）
   */
  async calculateCompletion(projectId: string): Promise<number> {
    // 從 L1 取得所有完成事件
    const events = await this.eventService
      .getEvents(projectId, { type: 'completed' })
      .toPromise();
    
    // 從 L0 取得總項目數
    const scope = await this.governanceService.getScope(projectId);
    const totalItems = scope.items.length;
    
    // 計算
    const completedItems = new Set(
      events.map(e => e.target.location)
    ).size;
    
    return (completedItems / totalItems) * 100;
  }
  
  /**
   * 快取管理
   */
  async invalidateCache(projectId: string): Promise<void> {
    await this.http.delete(`/api/cache/projects/${projectId}`).toPromise();
  }
}
```

### Angular 20 Component 範例

```typescript
import { Component, inject, signal } from '@angular/core';
import { ConstructionEventService } from './construction-event.service';
import { DerivedStateService } from './derived-state.service';

@Component({
  selector: 'app-construction-dashboard',
  standalone: true,
  template: `
    <div class="dashboard">
      <h2>施工進度儀表板</h2>
      
      <!-- L2: 完工率（計算而來） -->
      <nz-card nzTitle="完工率">
        @if (completionRate(); as rate) {
          <nz-progress 
            [nzPercent]="rate" 
            nzStatus="active">
          </nz-progress>
        }
      </nz-card>
      
      <!-- L1: 最近事件（事實記錄） -->
      <nz-card nzTitle="最近施工事件">
        @for (event of recentEvents(); track event.id) {
          <nz-timeline-item>
            <p>{{ event.event_type }}</p>
            <p>{{ event.timestamp | date:'short' }}</p>
            <p>執行者: {{ event.actor }}</p>
            
            <!-- 證據列表 -->
            @for (evidence of event.evidence; track $index) {
              <nz-tag>{{ evidence.type }}</nz-tag>
            }
          </nz-timeline-item>
        }
      </nz-card>
      
      <!-- 提交新事件 -->
      <button 
        nz-button 
        nzType="primary" 
        (click)="openSubmitDialog()">
        記錄施工事件
      </button>
    </div>
  `
})
export class ConstructionDashboardComponent {
  private eventService = inject(ConstructionEventService);
  private derivedService = inject(DerivedStateService);
  
  // Signals
  completionRate = signal<number | null>(null);
  recentEvents = signal<ConstructionEvent[]>([]);
  
  async ngOnInit() {
    await this.loadData();
  }
  
  private async loadData() {
    const projectId = 'current-project';
    
    // 載入 L2（推導狀態）
    const rate = await this.derivedService.calculateCompletion(projectId);
    this.completionRate.set(rate);
    
    // 載入 L1（事實事件）
    this.eventService
      .getEvents(projectId, { limit: 10 })
      .subscribe(events => {
        this.recentEvents.set(events);
      });
  }
}
```

---

## 檢查清單

在實作系統時，用這個清單檢查是否符合三層架構：

### L0 檢查

- [ ] L0 事件不包含任何物理世界的變化
- [ ] L0 事件只定義規則、權限、範圍
- [ ] L0 事件不能用來計算進度或完工率
- [ ] L0 事件不能產生請款金額

### L1 檢查

- [ ] 每個 L1 事件都有明確的時間戳記
- [ ] 每個 L1 事件都有明確的執行者
- [ ] 每個 L1 事件都有至少一個證據
- [ ] L1 事件不包含任何推導資訊（如進度、KPI）
- [ ] L1 事件不能被修改，只能補充
- [ ] L1 事件不包含預測或計畫

### L2 檢查

- [ ] L2 狀態完全由 L1 事件計算而來
- [ ] L2 狀態不能人工填寫
- [ ] L2 狀態可以被刪除並重新計算
- [ ] L2 狀態不會回寫到 L1
- [ ] L2 計算有明確的可追溯性

### 依賴關係檢查

- [ ] L1 只查詢 L0（檢查權限與範圍）
- [ ] L2 只讀取 L1 + L0（計算推導）
- [ ] 沒有反向依賴（L2 → L1, L1 → L0）
- [ ] 沒有循環依賴

---

## 結語

三層事件模型不是「分類系統」，而是「因果鏈」：

```
L0 → 定義遊戲規則
L1 → 記錄真實發生的事
L2 → 解釋我們如何理解它
```

**最重要的一句話：**

> 如果你現在只做一層，請做 L1。  
> 其他都可以慢，但 L1 是系統的靈魂。

**記住：**
- L0 可以改（規則會變）
- L2 可以改（算法會變）
- **L1 不能改（事實就是事實）**

---

## 參考資料

- Git 原理與 Event Sourcing
- CQRS (Command Query Responsibility Segregation)
- Event-Driven Architecture
- Domain-Driven Design (DDD)

---

**文件版本：** 1.0  
**最後更新：** 2024-12-27  
**作者：** Claude & User  
**授權：** 內部使用
