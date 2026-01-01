# 業務實體建立準備度分析報告

## 執行摘要

**分析日期**: 2025-12-31  
**分析範圍**: ng-lin 專案架構與業務實體建立準備度  
**結論**: ✅ **基礎已完備，可以開始建立業務實體**

---

## 一、架構準備度評估

### 1.1 Core Layer (核心層) - ✅ 100% 完成

**已實作組件**:
- ✅ Foundation (基礎設施)
  - Identity (身份識別)
  - Context (上下文管理)
  - Time (時間處理)
  - Validation (驗證)
  - Serialization (序列化)
  
- ✅ Governance (治理)
  - Policy (策略引擎)
  - Authorization (授權)
  - Contract (契約)
  
- ✅ Observability (可觀測性)
  - Events (事件系統)
  - Audit (審計追蹤)
  - Causality (因果關係追蹤)
  
- ✅ Error & Result (錯誤處理)
  - Result<T, E> 模式完整實作
  - ErrorFactory 統一錯誤創建
  - 型別安全的錯誤處理

**評估**: Core Layer 已經完整實作，提供了堅實的基礎設施。

### 1.2 Infrastructure Layer (基礎設施層) - ✅ 100% 完成

**已實作組件**:
- ✅ Abstractions (抽象介面)
  - IAuth (身份驗證介面)
  - IRepository (儲存庫介面)
  - IStorage (儲存介面)
  - IEventStore (事件存儲介面)
  - IFunctions (函數介面)
  
- ✅ Firebase Implementation (Firebase 實作)
  - Auth (身份驗證)
  - Repository (儲存庫)
  - Storage (儲存)
  - Event Store (事件存儲)
  - Functions (雲函數)
  - Realtime (即時資料)
  
- ✅ Supabase Implementation (Supabase 實作)
  - Auth (身份驗證)
  - Repository (儲存庫)
  - Storage (儲存)
  - Event Store (事件存儲)
  - Realtime (即時資料)
  
- ✅ Providers (依賴注入配置)

**評估**: Infrastructure Layer 完整實作，提供了雙資料庫支援 (Firebase + Supabase)。

### 1.3 Platform Layer (平台層) - ⚠️ 部分完成 (30%)

**已實作組件**:
- ✅ Platform Context (平台上下文)
- ✅ Platform Contracts (平台契約)
- ✅ Platform Events (部分事件定義)
  - User Events (用戶事件)
  - Organization Events (組織事件)
  - Workspace Events (工作區事件)
  
- ✅ Platform Entities (實體骨架)
  - User (用戶)
  - Organization (組織)
  - Team (團隊)
  - Collaborator (協作者)
  - Bot (機器人)
  - Workspace (工作區)

**待實作組件** (根據 0-目錄-v2-Task-SaaS.md):
- ❌ 每個 Entity 的完整實作
  - Events (事件定義) - 需要完善
  - Decisions (決策邏輯) - 需要建立
  - Projections (視圖投影) - 需要建立
  - Commands (命令定義) - 需要建立
  - Models (讀模型) - 需要建立
  
- ❌ Platform Processes (平台流程)
  - Collaboration Process (協作流程)
  - Onboarding Process (入職流程)
  - Team Formation Process (團隊組建流程)
  
- ❌ Platform UI Components (平台 UI 組件)

**評估**: Platform Layer 有基礎骨架，但業務邏輯層 (Decisions, Projections, Commands) 尚未實作。

### 1.4 Features Layer (功能層) - ⚠️ 舊架構殘留

**現有結構問題**:
```
features/domains/
├── activity/     ❌ 違反 Task.md 原則 (Task 應為唯一業務實體)
├── attachment/   ❌ 應為 Task 的附件事件，非獨立實體
├── comment/      ❌ 應為 Task 的評論事件，非獨立實體
├── discussion/   ❌ 應為 Task 的討論事件，非獨立實體
├── issue/        ❌ 應重構為 Task 領域
├── task/         ⚠️ 存在但未完整實作
└── user/         ❌ 應移至 Platform Layer
```

**根據 Task.md 原則，正確結構應為**:
```
features/domains/
└── task/                      ✅ 唯一業務實體
    ├── events/                ❌ 待實作
    │   ├── task.events.ts
    │   ├── task-lifecycle.events.ts
    │   ├── task-comment.events.ts
    │   ├── task-discussion.events.ts
    │   └── task-attachment.events.ts
    ├── decisions/             ❌ 待實作
    │   ├── task.decisions.ts
    │   ├── comment.decisions.ts
    │   ├── discussion.decisions.ts
    │   └── attachment.decisions.ts
    ├── projections/           ❌ 待實作
    │   ├── task-list.projection.ts
    │   ├── task-board.projection.ts
    │   ├── task-detail.projection.ts
    │   ├── task-why.projection.ts
    │   ├── task-discussion.projection.ts
    │   ├── task-comment.projection.ts
    │   ├── task-attachment.projection.ts
    │   └── task-timeline.projection.ts
    ├── processes/             ❌ 待實作
    │   ├── task-lifecycle.process.ts
    │   └── task-collaboration.process.ts
    ├── commands/              ❌ 待實作
    ├── models/                ❌ 待實作
    └── ui/                    ❌ 待實作
```

**評估**: Features Layer 需要重大重構，以符合 Task.md 的架構原則。

---

## 二、Event Sourcing 準備度評估

### 2.1 Event Store 實作 - ✅ 完成

**已實作功能**:
- ✅ Event Store 抽象介面 (`IEventStore`)
- ✅ Firebase Event Store 實作
- ✅ Supabase Event Store 實作
- ✅ Event 基礎結構 (`StoredEvent`)
  ```typescript
  interface StoredEvent {
    eventId: string;
    eventType: string;
    eventVersion: number;
    aggregateId: string;
    aggregateType: string;
    aggregateVersion: number;
    causedBy: string[];      // ✅ 因果關係
    correlationId: string;
    timestamp: Date;
    recordedAt: Date;
    data: any;
    userId: string;
    metadata: any;
  }
  ```

**評估**: Event Store 完全符合 Event Sourcing 需求，支援因果關係追蹤。

### 2.2 Causality Tracking - ✅ 完成

**已實作功能**:
- ✅ `causedBy` 欄位支援
- ✅ `correlationId` 支援業務流程追蹤
- ✅ Event 版本控制 (`eventVersion`, `aggregateVersion`)
- ✅ 時間戳記 (`timestamp`, `recordedAt`)

**符合 Causality-Driven 原則**:
- ✅ 單一前驅: `causedBy: ["evt-001"]`
- ✅ 多個前驅: `causedBy: ["evt-007", "evt-008", "evt-009"]`
- ✅ 無前驅 (根事件): `causedBy: []`

**評估**: 完全符合 Causality-Driven Event-Sourced Process System 需求。

### 2.3 Event Bus & Projection - ⚠️ 部分實作

**已實作**:
- ✅ Event System 基礎架構 (`core/event-system`)
- ✅ Event 發布/訂閱機制

**待實作**:
- ❌ Projection Engine (從 Events 重建狀態)
- ❌ Snapshot 優化機制
- ❌ Event Replay 功能
- ❌ Read Model Updater

**評估**: Event Bus 基礎已建立，但 Projection 系統需要建置。

---

## 三、架構合規性檢查

### 3.1 Task.md 合規性

**✅ 符合項目**:
1. ✅ Event Sourcing 架構已建立
2. ✅ Causality 追蹤機制完整
3. ✅ Result<T, E> 錯誤處理模式
4. ✅ Core/Infrastructure 分層正確

**❌ 待改進項目**:
1. ❌ **Task 作為唯一業務實體** - 現有多個 domain 違反原則
2. ❌ **Events 是唯一事實來源** - 現有 CRUD 模式殘留
3. ❌ **多視圖 = 多 Projection** - Projection 系統未建立
4. ❌ **Decisions 集中化** - Decision 層未實作
5. ❌ **State = replay(events)** - Replay 機制未建立

### 3.2 SaaS.md 合規性

**✅ 符合項目**:
1. ✅ Platform Layer 已建立基礎骨架
2. ✅ Multi-tenant 實體已定義 (User, Org, Team, Collaborator, Bot)
3. ✅ Platform Context 已實作

**❌ 待改進項目**:
1. ❌ Platform 實體的 Event-driven 實作不完整
2. ❌ Collaboration Process 未實作
3. ❌ Platform UI Components 未建立

### 3.3 Causality-Driven 合規性

**✅ 符合項目** (根據 Enable.md 和 SYS.md):
1. ✅ Event Sourcing - Core/Infrastructure 已實作
2. ✅ Event Flow - Event Bus 基礎已建立
3. ✅ Causality - `causedBy` 欄位支援完整
4. ✅ Idempotency - Event Store 支援
5. ✅ Observability - Core/Observability 完整實作

**⚠️ 建議加強項目**:
1. ⚠️ Saga/Process Manager - 需要實作 Platform 和 Task Processes
2. ⚠️ Snapshot/Checkpoint - 建議建立以優化效能
3. ⚠️ Time-Travel/Replay Engine - 建議實作以支援分析
4. ⚠️ Event Versioning Strategy - 需要明確策略
5. ⚠️ Deterministic Core - Decision 層需建立

---

## 四、建議實作優先順序

### Phase 1: 重構現有架構 (1-2 週)

**目標**: 符合 Task.md 架構原則

**步驟**:
1. ✅ 保留 Core Layer (已完成，無需修改)
2. ✅ 保留 Infrastructure Layer (已完成，無需修改)
3. ⚠️ **重構 Features/Domains**
   - 移除 `activity/`, `attachment/`, `comment/`, `discussion/`
   - 保留但重構 `task/` 為唯一業務實體
   - 將 `user/` 移至 Platform Layer
   - 將 `issue/` 重構合併至 `task/`
4. ⚠️ **建立 Projection Engine**
   - 實作 `ProjectionBuilder` 基礎設施
   - 實作 Snapshot 機制
   - 實作 Event Replay 功能

**預估檔案變動**: ~50 files (主要是刪除和重構)

### Phase 2: 建立 Task Domain (2-3 週)

**目標**: 實作完整的 Task 領域

**步驟**:
1. ❌ **Task Events** (~10 files)
   - `task.events.ts` - 核心事件
   - `task-lifecycle.events.ts` - 生命週期事件
   - `task-comment.events.ts` - 評論事件
   - `task-discussion.events.ts` - 討論事件
   - `task-attachment.events.ts` - 附件事件

2. ❌ **Task Decisions** (~10 files)
   - `task.decisions.ts` - 核心決策 (純函數)
   - `comment.decisions.ts` - 評論決策
   - `discussion.decisions.ts` - 討論決策
   - `attachment.decisions.ts` - 附件決策

3. ❌ **Task Projections** (~10 files)
   - `task-list.projection.ts` - 列表視圖
   - `task-board.projection.ts` - 看板視圖
   - `task-detail.projection.ts` - 詳情視圖
   - `task-why.projection.ts` - Why 視圖 (事件歷史解釋)
   - `task-discussion.projection.ts` - 討論視圖
   - `task-comment.projection.ts` - 評論視圖
   - `task-attachment.projection.ts` - 附件視圖
   - `task-timeline.projection.ts` - 時間線視圖

4. ❌ **Task Processes** (~5 files)
   - `task-lifecycle.process.ts` - 生命週期流程
   - `task-collaboration.process.ts` - 協作流程

5. ❌ **Task Commands** (~10 files)
   - `task.commands.ts` - 核心命令
   - `comment.commands.ts` - 評論命令
   - `discussion.commands.ts` - 討論命令
   - `attachment.commands.ts` - 附件命令

6. ❌ **Task Models** (~5 files)
   - `task.model.ts` - Task 讀模型
   - `task-comment.model.ts` - 評論讀模型
   - `task-discussion.model.ts` - 討論讀模型

**預估檔案變動**: ~100 files (新增)

### Phase 3: 完善 Platform Layer (2-3 週)

**目標**: 實作完整的多租戶平台能力

**步驟**:
1. ❌ **完善 Platform Entities** (~125 files)
   - User Entity (25 files: events, decisions, projections, commands, models)
   - Organization Entity (25 files)
   - Team Entity (25 files)
   - Collaborator Entity (25 files)
   - Bot Entity (25 files)

2. ❌ **Platform Processes** (~10 files)
   - `collaboration.process.ts`
   - `onboarding.process.ts`
   - `team-formation.process.ts`

3. ❌ **Platform UI Components** (~30 files)
   - User List, Org Dashboard, Team View, Collaborator View 等

**預估檔案變動**: ~170 files (新增)

### Phase 4: 整合與測試 (1-2 週)

**目標**: 確保 Platform ↔ Task 整合正常

**步驟**:
1. ❌ 實作 Platform ↔ Task 整合測試
2. ❌ E2E 測試擴展
3. ❌ Dev Tools 更新 (Core Tester 擴展)
4. ❌ Documentation 完善

**預估檔案變動**: ~50 files (測試和文件)

---

## 五、關鍵風險與緩解措施

### 風險 1: 現有舊架構殘留代碼

**描述**: `features/domains/` 下有多個違反 Task.md 原則的 domain。

**影響**: 
- 架構不一致
- 違反 "Task 是唯一業務實體" 原則
- 增加維護複雜度

**緩解措施**:
1. **立即行動**: 創建 ADR (Architecture Decision Record) 記錄重構決策
2. **漸進式重構**: 
   - Step 1: 凍結舊 domain 的新功能開發
   - Step 2: 將 `issue/` 重構合併至 `task/`
   - Step 3: 將 `attachment/`, `comment/`, `discussion/` 轉為 Task 的事件類型
   - Step 4: 將 `user/` 移至 `platform/entities/user/`
   - Step 5: 刪除 `activity/` (改用 Task Events 追蹤)
3. **測試覆蓋**: 在重構前確保有足夠的測試覆蓋

### 風險 2: Projection 系統尚未實作

**描述**: Event Store 已就緒，但 Projection Engine 未建立。

**影響**:
- 無法從 Events 重建狀態
- 無法實現多視圖架構
- 查詢效能可能受影響

**緩解措施**:
1. **建立 Projection Engine 基礎設施** (優先級：高)
   ```typescript
   // src/app/core/projection/projection-engine.ts
   interface ProjectionEngine {
     project<T>(events: StoredEvent[]): T;
     getSnapshot<T>(aggregateId: string): Promise<T | null>;
     createSnapshot<T>(aggregateId: string, state: T): Promise<void>;
   }
   ```
2. **實作 Snapshot 機制** 以優化效能
3. **建立 Read Model Updater** 訂閱 Event Bus

### 風險 3: Platform 與 Task 整合未明確定義

**描述**: Platform Layer 和 Task Domain 的整合邊界不清楚。

**影響**:
- 可能違反依賴方向原則
- Task 可能過度耦合 Platform

**緩解措施**:
1. **明確定義整合契約**:
   ```typescript
   // Task 可以引用 Platform 實體 ID，但不依賴 Platform 實作
   interface TaskCreatedEvent {
     taskId: string;
     createdBy: UserId;        // Platform User ID
     organizationId: OrgId;    // Platform Org ID
     teamId?: TeamId;          // Platform Team ID (optional)
   }
   ```
2. **使用 Platform Contracts** 而非直接依賴
3. **Platform 透過訂閱 Task Events 來觸發協作流程**

---

## 六、結論與建議

### 6.1 準備度評分

| 層級 | 完成度 | 評分 | 說明 |
|------|--------|------|------|
| **Core Layer** | 100% | ✅ A | 完整實作，架構堅實 |
| **Infrastructure Layer** | 100% | ✅ A | 雙資料庫支援，功能完整 |
| **Platform Layer** | 30% | ⚠️ C | 骨架已建立，業務邏輯待補完 |
| **Features/Task Domain** | 20% | ⚠️ D | 舊架構殘留，需重大重構 |
| **Event Sourcing 基礎** | 85% | ✅ B+ | Event Store 完整，Projection 待建立 |
| **Causality Tracking** | 90% | ✅ A- | 機制完整，需加強 Process 實作 |
| **整體準備度** | **65%** | ⚠️ **C+** | **可以開始，但需先重構** |

### 6.2 最終建議

#### ✅ **可以開始建立業務實體，但需遵循以下步驟**:

**階段 1: 先重構，後建立** (必須)
1. **立即**創建 ADR 記錄 Task.md 架構原則
2. **Week 1-2**: 重構 `features/domains/` 符合 Task.md
3. **Week 2-3**: 建立 Projection Engine 基礎設施

**階段 2: 建立 Task Domain** (核心業務)
4. **Week 3-5**: 實作 Task Events, Decisions, Projections, Processes
5. **Week 5-6**: 實作 Task Commands, Models, UI

**階段 3: 完善 Platform Layer** (多租戶基礎)
6. **Week 6-9**: 實作 Platform Entities 完整邏輯
7. **Week 9-10**: 實作 Platform Processes 和 UI

**階段 4: 整合與測試** (品質保證)
8. **Week 10-12**: Platform ↔ Task 整合測試
9. **Week 12**: E2E 測試、文件更新

#### ⚠️ **關鍵成功因素**:

1. **嚴格遵循 Task.md 原則**
   - Task 是唯一業務實體
   - Events 是唯一事實來源
   - 所有決策透過 Decisions (純函數)
   - 狀態透過 Projection 重建

2. **堅持 Event Sourcing 架構**
   - 禁止 CRUD 操作直接修改狀態
   - 所有變更透過 Event 記錄
   - 完整保留 Causality 鏈

3. **保持架構分層清晰**
   - Core → Infrastructure → Platform → Features
   - 嚴格遵循依賴方向
   - 使用 ESLint 規則強制執行

4. **建立完整的測試覆蓋**
   - Unit Tests: Domain Logic (Decisions)
   - Integration Tests: Event Store, Projections
   - E2E Tests: UI ↔ Backend 整合

---

## 七、附錄

### A. 檔案統計

| 層級 | 現有檔案 | 待新增檔案 | 總計 |
|------|----------|-----------|------|
| Core | ~63 | 0 | ~63 |
| Infrastructure | ~40 | 0 | ~40 |
| Platform | ~30 | ~170 | ~200 |
| Task Domain | ~20 | ~100 | ~120 |
| Tests | ~30 | ~50 | ~80 |
| **總計** | **~183** | **~320** | **~503** |

### B. 參考文件清單

1. **架構文件**:
   - `docs/dev/0-目錄-v2-Task-SaaS.md` - 主要架構定義
   - `docs/dev/Task.md` - Task 領域規範
   - `docs/dev/SaaS.md` - 多租戶架構
   - `docs/dev/0-架構線條說明書.md` - 分層架構說明

2. **Causality-Driven 文件**:
   - `docs/dev/Causality-Driven Event-Sourced Process System/Enable.md`
   - `docs/dev/Causality-Driven Event-Sourced Process System/SYS.md`
   - `docs/dev/Causality-Driven Event-Sourced Process System/Package.md`

3. **Consolidated 文件**:
   - `docs/dev/consolidated/00-專案結構索引.md`
   - `docs/dev/consolidated/01-Event與Process核心.md`
   - `docs/dev/consolidated/06-Event-Sourced架構設計.md`
   - `docs/dev/consolidated/18-架構分層與治理.md`

### C. 下一步行動清單

**本週 (Week 1)**:
- [ ] 創建 ADR: "ADR-001: 遵循 Task.md 單一業務實體原則"
- [ ] 創建 ADR: "ADR-002: Event Sourcing + Projection 架構實作策略"
- [ ] 建立 Projection Engine 基礎設施
- [ ] 規劃 `features/domains/` 重構細節

**下週 (Week 2)**:
- [ ] 開始重構 `features/domains/`
- [ ] 實作 Snapshot 機制
- [ ] 建立 Task Events 骨架
- [ ] 更新 Dev Tools (Core Tester) 支援 Projection 測試

---

**報告版本**: 1.0  
**最後更新**: 2025-12-31  
**分析者**: GitHub Copilot Agent
