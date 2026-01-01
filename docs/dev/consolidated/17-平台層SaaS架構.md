# 平台層 SaaS 架構

> **目標**：事件源 + 因果 + 多視圖的多租戶平台

## 核心設計原則

1. **每個實體都是事件流** - User、Org、Team、Collaborator、Bot
2. **單一真相，派生多視圖** - Projection Replay 重建
3. **決策集中化** - Decision Layer 統一判斷

## 平台核心實體

### User（用戶）

**事件**：UserCreated, UserUpdated, UserDeactivated
**決策**：CanCreateUser, CanUpdateUser
**投影**：UserListProjection, UserProfileProjection

### Organization（組織）

**事件**：OrgCreated, OrgUpdated, OrgDeleted
**決策**：CanCreateOrg, CanModifyOrg
**投影**：OrgOverviewProjection

### Team（團隊）

**事件**：TeamCreated, TeamUpdated, TeamDeleted
**決策**：CanCreateTeam, CanModifyTeam
**投影**：TeamProjection

### Collaborator（協作者）

**事件**：CollaboratorInvited, Accepted, Removed
**決策**：CanInviteCollaborator, CanAcceptInvitation
**投影**：CollaboratorProjection

### Bot（機器人）

**事件**：BotCreated, BotUpdated, BotActionExecuted
**決策**：CanCreateBot, CanPerformBotAction
**投影**：BotProjection

## Platform ↔ Task 關係

```
Task Domain (業務核心)
  ├─ TaskCreated
  │  ├─ createdBy: "user-123" ← Platform User
  │  ├─ assignedTo: "user-456" ← Platform User
  │  ├─ orgId: "org-789" ← Platform Org
  │  └─ teamId: "team-321" ← Platform Team
  │
  ↓ references
Platform Layer (多租戶能力)
  └─ User, Org, Team, Collaborator, Bot
```

**關鍵決策**：
1. Task 是唯一業務領域
2. Task 可引用 Platform 實體
3. Platform 與 Task 透過事件解耦
4. 完整因果追蹤跨兩層

## 設計哲學

### Platform Layer
> **"Platform provides WHO and WHERE, not WHAT"**

### Task Domain
> **"Task is the ONLY business entity"**

### Event Sourcing
> **"Events are facts. State is derived."**

### Multi-View
> **"Same stream, different perspectives"**

---

**版本**: 1.0  
**來源**: SaaS.md
