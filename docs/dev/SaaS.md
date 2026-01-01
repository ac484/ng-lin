# **事件源 + 因果 + 多視圖 SaaS 平台設計指南**

目標：將事件源(Event Sourcing) + 因果(Causality) + 多視圖(Multi-View) 系統應用於 **多租戶協作平台**（類似 GitHub）。

---

## **1️⃣ 核心設計原則**

1. **每個實體都是事件流**

   * 核心實體：User、Organization、Team、Collaborator、Bot
   * 任意狀態變更 → 生成事件 (append-only)

2. **單一真相,派生多視圖**

   * 不存快照（除非必要）
   * UI、Analytics 全部靠 **Projection Replay** 重建

3. **決策集中化**

   * 所有行為先經 Decision Layer 驗證
   * 例：加入團隊、邀請協作者、建立 Repo、Bot 操作

4. **多租戶隔離**

   * 每個租戶事件獨立
   * Projection 可跨組織合併或分開

5. **可追溯「為什麼」**

   * 每個事件都能追蹤來源、觸發者與策略

---

## **2️⃣ 平台層實體（非業務領域）**

Platform Layer 提供多租戶基礎能力，Task Domain 可引用這些實體。

| 實體           | 主要事件                                                           | 核心決策 (Decision)       | 檔案數 |
| ------------ | -------------------------------------------------------------- | --------------------- | --- |
| User         | UserCreated, UserUpdated, UserDeactivated                      | CanCreateUser, CanUpdateUser | 25 |
| Organization | OrgCreated, OrgUpdated, OrgDeleted                             | CanCreateOrg, CanModifyOrg | 25 |
| Team         | TeamCreated, TeamUpdated, TeamDeleted                          | CanCreateTeam, CanModifyTeam | 25 |
| Collaborator | CollaboratorInvited, CollaboratorAccepted, CollaboratorRemoved | CanInviteCollaborator, CanModifyCollaborator | 25 |
| Bot/Account  | BotCreated, BotUpdated, BotDisabled, BotActionExecuted         | CanPerformBotAction   | 25 |

**Total Platform Layer**: ~125 files + 5 event store files + 10 process files + 30 UI files = ~170 files

> 每個實體都是 **append-only**，不直接修改狀態
> 每個實體都有獨立的 events.ts, decisions.ts, projections.ts, commands.ts, models.ts

---

## **3️⃣ 平台層事件流與決策示意**

```
Command: InviteCollaborator(userId, orgId, teamId)
       │
       ↓
Decision Layer: CanInviteCollaborator(events) → accept/reject
       │
       ↓
Event Layer: CollaboratorInvited (with causation_id, correlation_id)
       │
       ↓
Event Store (Firebase/IndexedDB)
       │
       ↓
Projection Layer: CollaboratorListView / CollaboratorProjection
       │
       ↓
UI Layer: Display invitation status (via Signals)
```

**關鍵點**:
- 所有命令必須經過決策層驗證
- 事件包含完整因果鏈追蹤
- 投影從事件流重放生成
- UI 透過 Angular Signals 響應式更新

---

## **4️⃣ 平台層多視圖 Mapping**

每個平台實體都有自己的投影，從事件流派生不同視圖：

| Projection             | View / Signal             | 功能             | 依賴事件 |
| ---------------------- | ------------------------- | -------------- | ---- |
| UserListProjection     | Admin User Table          | 顯示所有用戶狀態       | UserCreated, UserUpdated, UserDeactivated |
| UserProfileProjection  | User Profile Page         | 顯示用戶詳情與歷史      | UserCreated, UserUpdated |
| OrgOverviewProjection  | Organization Dashboard    | 顯示組織與團隊        | OrgCreated, OrgUpdated, TeamCreated |
| TeamProjection         | Team Detail / Member List | 顯示團隊成員、角色      | TeamCreated, TeamUpdated, CollaboratorAccepted |
| CollaboratorProjection | Repo / Project Access     | 顯示權限、邀請狀態      | CollaboratorInvited, CollaboratorAccepted |
| BotProjection          | Bot Status Dashboard      | 顯示 Bot 狀態與歷史活動 | BotCreated, BotActionExecuted |

> 設計哲學：**所有 view 都由事件 replay 映射生成，不存多版本真相**
> 每個投影都是純函數：`projection = replay(events)`

---

## **5️⃣ 平台層事件驅動決策表**

每個實體的行為都必須經過決策層驗證：

| 實體 | 行為       | 事件 (Event)          | 決策 (Decision)         | 前置條件檢查 |
| -- | -------- | ------------------- | --------------------- | ------ |
| User | 新增用戶     | UserCreated         | CanCreateUser         | 驗證 email 唯一性 |
| User | 更新用戶     | UserUpdated         | CanUpdateUser         | 驗證用戶存在且有權限 |
| User | 停用用戶     | UserDeactivated     | CanDeactivateUser     | 驗證用戶存在且未停用 |
| Org | 建立組織     | OrgCreated          | CanCreateOrg          | 驗證組織名稱唯一性 |
| Org | 更新組織     | OrgUpdated          | CanModifyOrg          | 驗證用戶為組織管理員 |
| Team | 建立團隊     | TeamCreated         | CanCreateTeam         | 驗證組織存在且有權限 |
| Team | 更新團隊     | TeamUpdated         | CanModifyTeam         | 驗證用戶為團隊管理員 |
| Collaborator | 邀請協作者    | CollaboratorInvited | CanInviteCollaborator | 驗證邀請者有權限 |
| Collaborator | 接受邀請     | CollaboratorAccepted | CanAcceptInvitation  | 驗證邀請存在且未過期 |
| Collaborator | 移除協作者    | CollaboratorRemoved | CanRemoveCollaborator | 驗證移除者有權限 |
| Bot | 建立 Bot   | BotCreated          | CanCreateBot          | 驗證組織有權限建立 Bot |
| Bot | Bot 執行操作 | BotActionExecuted   | CanPerformBotAction   | 驗證 Bot 有對應權限 |

**決策層職責**:
- 載入實體事件流
- 重放事件至當前狀態
- 驗證業務不變式
- 發出零個或多個新事件

---

## **6️⃣ 完整平台層目錄結構（Angular v20 + Signals）**

```
src/app/platform/
│
├── entities/                        # 平台實體（非業務領域）
│   │
│   ├── user/                        # User Entity (25 files)
│   │   ├── events.ts                # UserCreated, UserUpdated, UserDeactivated
│   │   ├── decisions.ts             # CanCreateUser, CanUpdateUser
│   │   ├── projections.ts           # UserListProjection, UserProfileProjection
│   │   ├── commands.ts              # CreateUser, UpdateUser, DeactivateUser
│   │   ├── models.ts                # User read models/DTOs
│   │   └── index.ts
│   │
│   ├── organization/                # Organization Entity (25 files)
│   │   ├── events.ts                # OrgCreated, OrgUpdated, OrgDeleted
│   │   ├── decisions.ts             # CanCreateOrg, CanModifyOrg
│   │   ├── projections.ts           # OrgOverviewProjection
│   │   ├── commands.ts              # CreateOrg, UpdateOrg, DeleteOrg
│   │   ├── models.ts                # Org read models/DTOs
│   │   └── index.ts
│   │
│   ├── team/                        # Team Entity (25 files)
│   │   ├── events.ts                # TeamCreated, TeamUpdated, TeamDeleted
│   │   ├── decisions.ts             # CanCreateTeam, CanModifyTeam
│   │   ├── projections.ts           # TeamProjection
│   │   ├── commands.ts              # CreateTeam, UpdateTeam, DeleteTeam
│   │   ├── models.ts                # Team read models/DTOs
│   │   └── index.ts
│   │
│   ├── collaborator/                # Collaborator Entity (25 files)
│   │   ├── events.ts                # CollaboratorInvited, Accepted, Removed
│   │   ├── decisions.ts             # CanInviteCollaborator, CanModifyCollaborator
│   │   ├── projections.ts           # CollaboratorProjection
│   │   ├── commands.ts              # InviteCollaborator, AcceptInvitation
│   │   ├── models.ts                # Collaborator read models/DTOs
│   │   └── index.ts
│   │
│   ├── bot/                         # Bot Entity (25 files)
│   │   ├── events.ts                # BotCreated, BotUpdated, BotActionExecuted
│   │   ├── decisions.ts             # CanPerformBotAction
│   │   ├── projections.ts           # BotProjection
│   │   ├── commands.ts              # CreateBot, UpdateBot, DisableBot
│   │   ├── models.ts                # Bot read models/DTOs
│   │   └── index.ts
│   │
│   └── index.ts
│
├── event-store/                     # Platform Event Store (5 files)
│   ├── platform-event-store.service.ts
│   ├── platform-event-publisher.ts
│   ├── platform-event-subscriber.ts
│   └── index.ts
│
├── processes/                       # Cross-entity processes (10 files)
│   ├── collaboration.process.ts     # Invitation → Acceptance → Access
│   ├── onboarding.process.ts        # User onboarding workflow
│   ├── team-formation.process.ts    # Team creation workflow
│   └── index.ts
│
├── ui/                              # Platform UI Components (30 files)
│   └── components/
│       ├── user-list/               # User list component
│       ├── org-dashboard/           # Org dashboard component
│       ├── team-view/               # Team view component
│       ├── collaborator-view/       # Collaborator view component
│       └── index.ts
│
├── README.md                        # Platform layer architecture
└── index.ts                         # Unified platform exports

Total Platform Layer: ~170 files
```

**層級說明**:
- **entities/**: 5個平台實體,每個~25 files
- **event-store/**: 平台級事件存儲服務
- **processes/**: 跨實體協作流程（如邀請→接受→授權）
- **ui/**: 平台管理 UI 組件

---

## **7️⃣ Platform Layer 與 Task Domain 關係**

```
┌────────────────────────────────────────────────────┐
│              Task Domain (業務核心)                  │
│                                                    │
│  Task Events: TaskCreated, TaskAssigned...        │
│  Can reference: userId, orgId, teamId             │
│                                                    │
│  Example:                                         │
│  {                                                │
│    type: "TaskCreated",                           │
│    taskId: "task-001",                            │
│    createdBy: "user-123",    ← Platform User      │
│    assignedTo: "user-456",   ← Platform User      │
│    orgId: "org-789",         ← Platform Org       │
│    teamId: "team-321"        ← Platform Team      │
│  }                                                │
│                                                    │
└──────────────────┬─────────────────────────────────┘
                   │ references
┌──────────────────▼─────────────────────────────────┐
│            Platform Layer (多租戶能力)                │
│                                                    │
│  User, Organization, Team, Collaborator, Bot      │
│  Provide multi-tenant infrastructure              │
│                                                    │
└────────────────────────────────────────────────────┘
```

**關鍵設計決策**:
1. **Task 是唯一業務領域** - Platform 只提供基礎能力
2. **Task 可引用 Platform 實體** - 但不依賴其實作
3. **Platform 與 Task 獨立演進** - 透過事件解耦
4. **完整因果追蹤** - 跨 Platform 和 Task 的事件鏈

## **8️⃣ 實作優先順序規劃**

### Phase 1: Platform Layer 基礎（~170 files）
**目標**: 建立完整多租戶基礎設施

1. **User Entity** (25 files)
   - Events, Decisions, Projections, Commands, Models, UI
   
2. **Organization Entity** (25 files)
   - Events, Decisions, Projections, Commands, Models, UI
   
3. **Team Entity** (25 files)
   - Events, Decisions, Projections, Commands, Models, UI
   
4. **Collaborator Entity** (25 files)
   - Events, Decisions, Projections, Commands, Models, UI
   
5. **Bot Entity** (25 files)
   - Events, Decisions, Projections, Commands, Models, UI
   
6. **Platform Event Store** (5 files)
   - Service, Publisher, Subscriber
   
7. **Collaboration Processes** (10 files)
   - Onboarding, Team formation, Access control
   
8. **Platform UI Components** (30 files)
   - User list, Org dashboard, Team view, Collaborator view

### Phase 2: Task Domain 業務核心（~100 files）
**目標**: 實作唯一業務實體與多視圖

1. **Task Events** (10 files) - 所有事件定義
2. **Task Decisions** (10 files) - 所有業務決策
3. **Task Projections** (10 files) - 7+ 視圖投影
4. **Task Processes** (5 files) - 生命週期與協作流程
5. **Task Commands** (10 files) - 所有命令定義
6. **Task Models** (5 files) - 讀模型/DTOs
7. **Task UI Components** (50 files) - 完整 UI

### Phase 3: Integration & Testing
**目標**: 整合與驗證

1. Platform ↔ Task 整合測試
2. E2E 測試擴展（基於現有 7 個測試）
3. Dev Tools 更新（支援 Platform + Task）
4. Documentation 完善

**Total Implementation**: ~340 files across 3 phases

---

## **9️⃣ 架構保證**

- ✅ **Event Sourcing**: 所有狀態變更透過事件
- ✅ **Causality Tracking**: 完整因果鏈追蹤
- ✅ **Multi-View Projections**: 每個實體支援多視圖
- ✅ **Centralized Decisions**: 所有決策集中驗證
- ✅ **Multi-Tenant Isolation**: 租戶事件完全隔離
- ✅ **Replay Capability**: 支援時間旅行與事件重放
- ✅ **Type Safety**: TypeScript strict mode
- ✅ **Reactive Updates**: Angular Signals 響應式更新
- ✅ **File Size**: 所有檔案 < 4000 字元
- ✅ **Testability**: 完整 E2E 測試覆蓋

---

## **🔟 設計哲學總結**

### Platform Layer（SaaS 能力）
> **"Platform provides the WHO (users, orgs, teams) and WHERE (multi-tenant context), not the WHAT (business domain)."**

### Task Domain（業務核心）
> **"Task is the ONLY business entity. Everything else is either infrastructure or platform capability."**

### Event Sourcing（事件源）
> **"Events are immutable facts. State is always derived. The past never changes, only our interpretation of it."**

### Multi-View Mapping（多視圖）
> **"Same event stream, different perspectives. Consistency is guaranteed by replay, not by synchronization."**

---

**版本**: v2.0 (aligned with 0-目錄-v2-Task-SaaS.md)
**更新日期**: 2025-12-31
**狀態**: Ready for implementation
