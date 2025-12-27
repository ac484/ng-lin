# GitHub 母體對齊缺口分析

**日期**: 2025-12-27  
**版本**: 1.0  
**狀態**: 缺口識別與優先級排序

## 概述

本文件分析 ng-lin (GigHub) 儲存庫與 GitHub 母體平台架構之間的對齊缺口，除儲存庫層面外，還包括組織、團隊、工作流、治理、協作等全面對齊要求。

## 母體對齊原則

> **GitHub 為治理母體**：所有系統能力須映射 GitHub 的組織結構、權限模型、工作流語意、分支策略、安全政策等，再透過 Angular 20 + @angular/fire (Firestore/Functions/Rules) 執行層落地。

## 已完成對齊項目 ✅

### 1. 儲存庫結構（Repository Structure）
- ✅ 三層架構對齊 GitHub 服務分層 (UI → Service → Repository)
- ✅ 獨立元件模式 (Standalone Components) 對齊 GitHub Actions reusable workflows
- ✅ Signals 狀態管理對齊 GitHub 即時通知機制

### 2. 身份與授權（Identity & Authorization）
- ✅ RBAC 角色階層對齊 GitHub (Organization → Team → Repository → Project)
- ✅ RoleType 對齊 GitHub 儲存庫角色 (Admin, Maintain, Write, Triage, Read)
- ✅ ABAC 政策引擎對齊 GitHub Rulesets
- ✅ PDP/PEP 架構對齊 GitHub 權限檢查流程

### 3. 事件系統（Event System）
- ✅ EventBus 對齊 GitHub Webhooks 事件模型
- ✅ 自動附加身份上下文 (userId, tenantId, correlationId)
- ✅ 事件持久化對齊 GitHub 事件日誌

### 4. 審計系統基礎（Audit Foundation）
- ✅ AuditEvent 模型對齊 GitHub 審計日誌格式
- ✅ 事件分類 (11 categories) 對齊 GitHub 審計事件類型
- ✅ 多層儲存策略 (HOT/WARM/COLD) 對齊 GitHub 日誌保留政策

## 🔴 重大缺口 (P0 - 阻斷性)

### 1. GitHub Actions & CI/CD 對齊 ❌

**缺口描述**：
- 無 GitHub Actions workflows 對齊 Blueprint 生命週期
- 無 CI/CD 管線對齊 Blueprint 狀態變更
- 無自動化測試觸發機制對齊 GitHub PR checks
- 無部署工作流對齊 GitHub Environments

**GitHub 母體映射**：
```yaml
# GitHub 概念 → GigHub 實作
GitHub Actions      → Blueprint Workflow Automation
Workflow runs       → Blueprint State Transitions
PR checks          → Blueprint Validation Gates
Environments       → Blueprint Deployment Stages
Secrets            → Blueprint Secret Management
OIDC               → Firebase Auth Integration
```

**需要實作**：
- `.github/workflows/blueprint-lifecycle.yml` - Blueprint 狀態變更自動化
- `.github/workflows/security-scan.yml` - 安全掃描對齊 GitHub Code Scanning
- `.github/workflows/deploy.yml` - 部署流程對齊 GitHub Deployments API
- CI/CD 狀態同步至 Firestore `blueprints/{id}/workflows` 子集合

**優先級**: P0 🔴  
**影響範圍**: 自動化、持續整合、部署管理

---

### 2. 分支保護與合規規則 ❌

**缺口描述**：
- 無分支保護規則對應 Blueprint 狀態守衛
- 無 CODEOWNERS 對齊 Blueprint 權限管理
- 無必要審查者對齊 Blueprint 批准流程
- 無狀態檢查對齊 Blueprint 驗證流程

**GitHub 母體映射**：
```typescript
// GitHub 概念 → GigHub 實作
Branch Protection Rules  → Blueprint State Guard Policies
Required Reviewers       → Blueprint Approval Workflow
Status Checks           → Blueprint Validation Rules
CODEOWNERS             → Blueprint Permission Mapping
Bypass Actors          → Blueprint Override Permissions
```

**需要實作**：
- `.github/CODEOWNERS` - 對應 Blueprint 權限矩陣
- `BranchProtectionService` - 實作狀態守衛政策
- `BlueprintApprovalWorkflow` - 審查與批准流程
- Firestore Security Rules 對齊分支保護語意

**優先級**: P0 🔴  
**影響範圍**: 治理、合規、質量門控

---

### 3. Issues & Project 管理 ❌

**缺口描述**：
- 無 Issues 系統對齊 Blueprint 任務追蹤
- 無 Project Boards 對齊 Blueprint 工作管理
- 無 Milestones 對齊 Blueprint 版本規劃
- 無 Labels 對齊 Blueprint 分類標籤

**GitHub 母體映射**：
```typescript
// GitHub 概念 → GigHub 實作
Issues              → Blueprint Tasks/Items
Project Boards      → Blueprint Work Management
Milestones          → Blueprint Versions
Labels              → Blueprint Tags/Categories
Assignees           → BlueprintMember Assignments
Comments            → Blueprint Discussions
```

**需要實作**：
- `BlueprintIssue` 模型與 Repository
- `BlueprintProject` 看板系統
- `BlueprintMilestone` 版本管理
- `BlueprintLabel` 標籤系統
- Issues 與 Project 的關聯關係

**優先級**: P0 🔴  
**影響範圍**: 協作、工作管理、進度追蹤

---

## 🟡 高優先級缺口 (P1)

### 4. 組織與團隊治理 ⚠️

**缺口描述**：
- Organization 實體未完整實作
- Team 階層管理缺失
- 跨組織協作機制未建立
- Organization Settings 未對齊

**GitHub 母體映射**：
```typescript
// GitHub 概念 → GigHub 實作
Organization        → Organization Entity (partial)
Teams              → Team Entity (missing)
Team Members       → TeamMember (missing)
Org Settings       → OrganizationSettings (missing)
Billing            → OrganizationBilling (missing)
```

**需要實作**：
- 完整 `Organization` CRUD 與生命週期管理
- `Team` 實體與階層結構
- `TeamMember` 角色與權限
- Organization Settings 管理介面
- 跨組織資源共享機制

**優先級**: P1 🟡  
**影響範圍**: 多租戶、組織治理、成員管理

---

### 5. Discussions & 通知系統 ⚠️

**缺口描述**：
- 無 Discussions 對齊 Blueprint 討論區
- 無即時通知對齊 GitHub Notifications
- 無 @mention 系統對齊成員提及
- 無訂閱機制對齊 GitHub Watch

**GitHub 母體映射**：
```typescript
// GitHub 概念 → GigHub 實作
Discussions         → Blueprint Discussions
Notifications       → Real-time Notification System
@mentions          → Member Mention System
Watch/Subscribe    → Blueprint Subscription
Unread Indicators  → Notification Read Status
```

**需要實作**：
- `DiscussionService` 與 `DiscussionRepository`
- Real-time Notification Service (Firebase Cloud Messaging)
- Mention 解析與通知觸發
- Subscription 管理機制
- 通知偏好設定

**優先級**: P1 🟡  
**影響範圍**: 協作、溝通、使用者體驗

---

### 6. Security Rules Context 對齊 ⚠️

**缺口描述**：
- Firestore Rules 未驗證完整 Identity Context
- Rules 未檢查 Role hierarchy
- Rules 未實作 ABAC 屬性驗證
- Rules 未對齊 Clearance levels

**GitHub 母體映射**：
```javascript
// GitHub 概念 → Firestore Rules 實作
Repository Roles    → request.auth.token.roles validation
Branch Protection   → State transition guards in rules
Required Reviewers  → Approval workflow validation
CODEOWNERS         → Permission hierarchy checks
```

**需要實作**：
```javascript
// Firestore Rules 強化
function hasRole(role) {
  return request.auth.token.roles.hasAny([role]);
}

function hasClearance(level) {
  return request.auth.token.clearance >= level;
}

function canTransition(fromState, toState) {
  // 對齊 GitHub branch protection
  return hasRole('admin') || 
         (fromState == 'draft' && toState == 'review' && hasRole('write'));
}
```

**優先級**: P1 🟡  
**影響範圍**: 安全、資料保護、合規

---

## 🟢 中優先級缺口 (P2)

### 7. Pull Request 等效流程 📋

**缺口描述**：
- 無 PR 等效的變更審查流程
- 無 Code Review 機制對齊
- 無 Diff/Changes 視圖
- 無 Merge Strategies 對應

**GitHub 母體映射**：
```typescript
// GitHub 概念 → GigHub 實作
Pull Requests      → Blueprint Change Requests
Code Review        → Blueprint Review Process
Diff View          → Change Comparison Service
Merge Strategies   → Blueprint Merge Policies
```

**需要實作**：
- `BlueprintChangeRequest` 模型
- Review workflow with approval states
- Change tracking and diff calculation
- Merge conflict detection

**優先級**: P2 🟢  
**影響範圍**: 變更管理、質量控制

---

### 8. Secrets & Environment Variables ⚠️

**缺口描述**：
- 無 Secrets 管理對齊 GitHub Secrets
- 無 Environment Variables 對齊
- 無加密儲存機制
- 無 Secret Scanning 對齊

**GitHub 母體映射**：
```typescript
// GitHub 概念 → GigHub 實作
Repository Secrets  → Blueprint Secrets
Org Secrets        → Organization Secrets
Environments       → Blueprint Environments
Secret Scanning    → Secret Detection Service
```

**需要實作**：
- `SecretService` with encryption (Firebase Secret Manager or KMS)
- Environment-specific configurations
- Secret access audit logging
- Secret rotation policies

**優先級**: P2 🟢  
**影響範圍**: 安全、配置管理

---

### 9. Webhooks & Integrations 📋

**缺口描述**：
- 無 Webhooks 對齊第三方整合
- 無 Integration Marketplace 概念
- 無 OAuth Apps 管理
- 無 API rate limiting

**GitHub 母體映射**：
```typescript
// GitHub 概念 → GigHub 實作
Webhooks           → Blueprint Event Webhooks
Apps               → Third-party Integrations
OAuth Apps         → OAuth Client Management
API Rate Limits    → Request Throttling
```

**需要實作**：
- Webhook 配置與管理介面
- Event delivery & retry mechanism
- OAuth integration framework
- Rate limiting middleware

**優先級**: P2 🟢  
**影響範圍**: 可擴展性、第三方整合

---

### 10. 依賴性圖與安全掃描 📋

**缺口描述**：
- 無 Dependency Graph 對齊
- 無 Dependabot 等效功能
- 無 Security Advisories 管理
- 無 Code Scanning 對齊

**GitHub 母體映射**：
```typescript
// GitHub 概念 → GigHub 實作
Dependency Graph   → Blueprint Dependencies
Dependabot        → Dependency Update Automation
Security Advisory → Security Alert System
Code Scanning     → Static Analysis Integration
```

**需要實作**：
- Dependency tracking service
- Automated update notifications
- Security vulnerability database
- Integration with security scanners

**優先級**: P2 🟢  
**影響範圍**: 安全、依賴管理

---

## 📊 文件與操作手冊缺口

### 11. 操作文件完整性 📝

**當前狀態**：
- ✅ Audit System: 100% complete (6/6 docs)
- ⚠️ Identity & Auth: 20% complete (1/6 docs)
- ⚠️ Event Bus: 10% complete (0/6 docs)
- ❌ Multi-Tenancy: 0% complete (0/6 docs)
- ❌ SaaS Account: 0% complete (0/6 docs)
- ❌ Collaboration: 0% complete (0/6 docs)

**需要補齊** (每個系統需 6 份文件)：
1. API Reference (~500 lines)
2. Deployment Guide (~650 lines)
3. Production Runbook (~600 lines)
4. Production Readiness Checklist (~520 lines)
5. Monitoring & Cost Optimization (~730 lines)
6. Validation Report (~500 lines)

**總計缺口**: ~18,000 lines 文件 (5 系統 × 6 文件 × ~600 lines)

---

### 12. GitHub Platform 治理文件 📝

**缺口描述**：
- 無分支策略文件對齊 GitHub Flow
- 無 PR 模板對齊審查流程
- 無 Issue 模板對齊工作追蹤
- 無貢獻指南對齊協作規範

**需要建立**：
- `docs/strategy-governance/branching-strategy.md` - 分支策略
- `docs/collaboration/pr-process.md` - PR 流程
- `docs/collaboration/issue-templates.md` - Issue 模板指南
- `.github/CONTRIBUTING.md` - 貢獻指南
- `.github/SECURITY.md` - 安全政策

---

## 🎯 實作優先級矩陣

| 缺口項目 | 優先級 | 工作量 | 影響範圍 | 建議時程 |
|---------|--------|--------|----------|----------|
| GitHub Actions & CI/CD | P0 🔴 | High | 自動化、部署 | Week 1-2 |
| 分支保護與合規規則 | P0 🔴 | Medium | 治理、質量 | Week 2-3 |
| Issues & Project 管理 | P0 🔴 | High | 協作、工作管理 | Week 3-5 |
| 組織與團隊治理 | P1 🟡 | High | 多租戶、治理 | Week 5-7 |
| Discussions & 通知 | P1 🟡 | Medium | 協作、體驗 | Week 7-8 |
| Security Rules Context | P1 🟡 | Medium | 安全、合規 | Week 8-9 |
| Pull Request 流程 | P2 🟢 | Medium | 變更管理 | Week 10-11 |
| Secrets & Env Vars | P2 🟢 | Low | 安全、配置 | Week 11 |
| Webhooks & Integrations | P2 🟢 | Low | 可擴展性 | Week 12 |
| 依賴性圖與掃描 | P2 🟢 | Medium | 安全 | Week 13 |

---

## 🔄 對齊實作路徑

### Phase 1: 自動化與 CI/CD (Week 1-2)
```yaml
實作項目:
  - GitHub Actions workflows for Blueprint lifecycle
  - Automated security scanning
  - Deployment automation
  - CI/CD status integration with Firestore

文件需求:
  - automation-delivery/ suite completion
  - Workflow configuration guides
  - CI/CD runbooks
```

### Phase 2: 治理與合規 (Week 2-3)
```yaml
實作項目:
  - CODEOWNERS file mapping Blueprint permissions
  - Branch protection service
  - Approval workflow system
  - Firestore Rules enhancement

文件需求:
  - strategy-governance/ branching policy
  - Compliance checklists
  - Governance runbooks
```

### Phase 3: 協作基礎 (Week 3-5)
```yaml
實作項目:
  - Blueprint Issues system
  - Blueprint Projects (Kanban boards)
  - Labels and Milestones
  - Assignment and tracking

文件需求:
  - collaboration/ suite completion
  - Issue templates
  - Project management guides
```

### Phase 4: 組織與通知 (Week 5-8)
```yaml
實作項目:
  - Organization full CRUD
  - Team hierarchy management
  - Real-time notification system
  - Discussions and mentions

文件需求:
  - identity-tenancy/ org/team docs
  - Notification system guides
  - Multi-tenant operations runbooks
```

### Phase 5: 安全強化 (Week 8-9)
```yaml
實作項目:
  - Security Rules context validation
  - RBAC/ABAC rules integration
  - Secret management system
  - Security scanning integration

文件需求:
  - security-compliance/ updates
  - Security audit procedures
  - Secret management runbooks
```

### Phase 6: 進階功能 (Week 10-13)
```yaml
實作項目:
  - Pull Request equivalent workflow
  - Webhooks and integrations
  - Dependency tracking
  - Advanced automation

文件需求:
  - change-control/ suite completion
  - Integration guides
  - Advanced feature runbooks
```

---

## 📋 驗收標準

### 對齊完整性檢查表

**儲存庫層面**:
- [ ] GitHub Actions workflows 完整對齊
- [ ] CODEOWNERS 對應權限矩陣
- [ ] Branch protection 對齊狀態守衛
- [ ] Security scanning 整合

**組織層面**:
- [ ] Organization 完整生命週期
- [ ] Team 階層管理
- [ ] Member role 對齊
- [ ] Settings 管理介面

**協作層面**:
- [ ] Issues 系統完整
- [ ] Project boards 實作
- [ ] Discussions 功能
- [ ] Notifications 系統

**安全層面**:
- [ ] Firestore Rules context 驗證
- [ ] RBAC/ABAC 規則對齊
- [ ] Secrets 管理系統
- [ ] Security audit 完整

**文件層面**:
- [ ] 所有系統 6 份文件齊全
- [ ] 治理文件完整
- [ ] Runbooks 可執行
- [ ] 質量分數 ≥90/100

---

## 🎓 結論

當前實作已完成 **儲存庫層面的核心對齊** (Identity/Auth, RBAC/ABAC, EventBus)，但在 **GitHub 平台完整治理** 方面仍有顯著缺口：

### 關鍵發現：
1. **自動化與 CI/CD** 是最大缺口，直接影響 DevOps 效能
2. **Issues & Projects** 缺失阻礙協作與工作管理
3. **組織與團隊治理** 未完整，限制多租戶擴展
4. **文件完整性** 僅 20%，影響運維與交接

### 建議行動：
1. **立即啟動** P0 項目 (Week 1-5)
2. **規劃資源** 完成 P1 項目 (Week 5-9)
3. **文件先行** 每個實作必須同步文件
4. **持續對齊** 定期審查 GitHub 新功能並映射

### 成功指標：
- 3 個月內完成 P0/P1 對齊 (90% 覆蓋)
- 6 個月內文件完整性達 80%
- 所有新功能必須先定義 GitHub 映射關係
- 每季審查對齊狀態並更新缺口清單

---

**維護者**: GigHub Platform Team  
**下次審查**: 2026-01-27  
**文件版本**: 1.0
