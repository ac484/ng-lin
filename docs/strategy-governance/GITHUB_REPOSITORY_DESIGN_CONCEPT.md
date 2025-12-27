# GitHub Repository Design Concept - 完整設計概念

> **Documentation Pillar**: Strategy & Governance  
> **Status**: Production Reference  
> **Version**: 1.0  
> **Last Updated**: 2025-12-27  
> **Purpose**: GitHub 平台架構設計的完整概念與知識點參考

---

## 📋 目錄

1. [核心理念](#核心理念)
2. [GitHub 平台架構模型](#github-平台架構模型)
3. [Repository 設計模式](#repository-設計模式)
4. [組織結構與治理](#組織結構與治理)
5. [分支策略與工作流程](#分支策略與工作流程)
6. [事件邏輯與自動化](#事件邏輯與自動化)
7. [權限與安全模型](#權限與安全模型)
8. [協作功能設計](#協作功能設計)
9. [CI/CD 整合模式](#cicd-整合模式)
10. [可觀測性與運營](#可觀測性與運營)
11. [最佳實踐與反模式](#最佳實踐與反模式)
12. [GigHub 實際應用](#gighub-實際應用)

---

## 核心理念

### GitHub 作為平台的本質

GitHub 不僅是程式碼託管服務，更是一個完整的**軟體開發治理平台**：

```
GitHub Platform = Code Repository + Governance + Collaboration + Automation + Security
```

#### 平台四大支柱

1. **Code & Version Control** - 原始碼管理與版本控制
2. **Collaboration & Communication** - 協作與溝通機制  
3. **Automation & CI/CD** - 自動化與持續交付
4. **Security & Compliance** - 安全與合規保障

### 設計哲學

#### 1. Everything as Code (一切皆程式碼)

- Infrastructure as Code - 基礎設施程式碼化
- Configuration as Code - 配置程式碼化
- Policy as Code - 政策程式碼化
- Documentation as Code - 文檔程式碼化
- Workflow as Code - 工作流程式碼化

#### 2. Git-First Mindset (Git 優先思維)

所有變更都通過 Git 工作流程：
- 分支策略確保隔離
- Pull Request 確保審查
- Commit 確保可追溯
- Tag 確保版本化

#### 3. Open Collaboration (開放協作)

- **Transparency** - 所有變更可見
- **Review** - 所有變更經審查
- **Discussion** - 所有決策有紀錄
- **Contribution** - 所有人可貢獻

---

## GitHub 平台架構模型

### 三層架構模型

```
┌─────────────────────────────────────────────────────────┐
│                    Enterprise Level                      │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Organizations & Teams                     │   │
│  │  - Policy Enforcement                            │   │
│  │  - Security & Compliance                         │   │
│  │  - Resource Management                           │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  Repository Level                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Repositories                             │   │
│  │  - Code Storage                                  │   │
│  │  - Branch Protection                             │   │
│  │  - Access Control                                │   │
│  │  - Workflow Automation                           │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   Artifact Level                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Commits, Issues, PRs, Actions            │   │
│  │  - Change Units                                  │   │
│  │  - Collaboration Items                           │   │
│  │  - Automation Triggers                           │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 核心實體關係

```typescript
// GitHub 平台核心實體模型
interface GitHubPlatform {
  enterprises: Enterprise[];
  organizations: Organization[];
  users: User[];
  repositories: Repository[];
}

interface Enterprise {
  id: string;
  name: string;
  organizations: Organization[];
  policies: EnterprisePolicy[];
  auditLog: AuditLog;
}

interface Organization {
  id: string;
  name: string;
  enterprise?: Enterprise;
  repositories: Repository[];
  teams: Team[];
  members: OrgMember[];
  settings: OrgSettings;
}

interface Repository {
  id: string;
  name: string;
  owner: Organization | User;
  visibility: 'public' | 'private' | 'internal';
  
  // 程式碼管理
  branches: Branch[];
  commits: Commit[];
  tags: Tag[];
  
  // 協作功能
  issues: Issue[];
  pullRequests: PullRequest[];
  discussions: Discussion[];
  
  // 自動化
  workflows: Workflow[];
  actions: Action[];
  
  // 安全
  securityPolicy: SecurityPolicy;
  secrets: Secret[];
  
  // 配置
  branchProtection: BranchProtectionRule[];
  webhooks: Webhook[];
}

interface Team {
  id: string;
  name: string;
  organization: Organization;
  members: User[];
  repositories: RepositoryPermission[];
  permissions: TeamPermission;
}
```

---

## Repository 設計模式

### 1. Monorepo Pattern (單一儲存庫模式)

**定義**：所有相關專案存放在一個儲存庫中

**優點**：
- ✅ 統一版本管理
- ✅ 原子性變更跨專案
- ✅ 共享程式碼容易
- ✅ 一致的工具鏈

**缺點**：
- ❌ 儲存庫體積龐大
- ❌ CI/CD 複雜度高
- ❌ 權限控制粒度粗

**適用場景**：
- Microservices with shared libraries
- Frontend + Backend tightly coupled
- Multi-package projects (npm workspaces)

**結構範例**：
```
monorepo/
├── packages/
│   ├── frontend/          # Angular 前端
│   ├── backend/           # Node.js 後端
│   ├── shared/            # 共享程式碼
│   └── functions/         # Cloud Functions
├── tools/                 # 共用工具
├── docs/                  # 文檔
├── .github/
│   └── workflows/         # 統一 CI/CD
├── package.json           # Root package
└── lerna.json             # Lerna 配置
```

### 2. Polyrepo Pattern (多儲存庫模式)

**定義**：每個專案或服務獨立儲存庫

**優點**：
- ✅ 清晰的所有權邊界
- ✅ 獨立部署與發布
- ✅ 細粒度權限控制
- ✅ CI/CD 簡單直接

**缺點**：
- ❌ 跨專案變更困難
- ❌ 版本同步複雜
- ❌ 重複程式碼風險

**適用場景**：
- Independent microservices
- Different teams/ownership
- Different release cycles

**結構範例**：
```
org/repos:
  ├── frontend-web/        # 獨立前端專案
  ├── backend-api/         # 獨立 API 服務
  ├── mobile-app/          # 獨立行動應用
  ├── shared-components/   # 共享元件庫
  └── infrastructure/      # 基礎設施程式碼
```

### 3. Hybrid Pattern (混合模式)

**定義**：核心在 Monorepo，周邊服務獨立

**結構範例**：
```
organization:
  core-platform/ (Monorepo)
    ├── services/
    │   ├── auth/
    │   ├── api/
    │   └── shared/
    └── packages/
  
  external-integrations/   # 獨立 repo
  admin-tools/             # 獨立 repo
  documentation/           # 獨立 repo
```

---

## 組織結構與治理

### GitHub Organization 設計

#### 1. 組織層級結構

```
Enterprise
  └── Organizations
        ├── Core Platform Org          # 核心平台組織
        │   ├── Repos
        │   └── Teams
        ├── Product Teams Org          # 產品團隊組織
        │   ├── Repos
        │   └── Teams
        └── External Partners Org      # 外部夥伴組織
            ├── Repos
            └── Teams
```

#### 2. Team 結構設計

```typescript
interface TeamStructure {
  // 功能型團隊
  functionalTeams: {
    'platform-core': Team;             // 平台核心團隊
    'frontend': Team;                  // 前端團隊
    'backend': Team;                   // 後端團隊
    'devops': Team;                    // DevOps 團隊
  };
  
  // 產品型團隊
  productTeams: {
    'blueprint-team': Team;            // Blueprint 功能團隊
    'audit-team': Team;                // 審計功能團隊
  };
  
  // 治理型團隊
  governanceTeams: {
    'security-team': Team;             // 安全團隊
    'architecture-team': Team;         // 架構團隊
    'code-reviewers': Team;            // 程式碼審查團隊
  };
}
```

#### 3. CODEOWNERS 機制

```ruby
# .github/CODEOWNERS

# Global owners
* @org/core-team

# Frontend
/src/app/**/*.ts @org/frontend-team
/src/app/**/*.html @org/frontend-team
/src/app/**/*.scss @org/frontend-team

# Backend Functions
/functions-*/**/* @org/backend-team

# Security & Auth
/src/app/core/auth/**/* @org/security-team
/firestore.rules @org/security-team
/storage.rules @org/security-team

# Infrastructure
/.github/workflows/**/* @org/devops-team
/firebase.json @org/devops-team

# Documentation
/docs/**/*.md @org/docs-team

# Architecture decisions
/docs/⭐️/**/* @org/architecture-team

# Critical paths (require multiple approvals)
/src/app/core/**/* @org/core-team @org/security-team
```

#### 4. Branch Protection Rules

```typescript
interface BranchProtectionConfig {
  branch: 'main' | 'develop' | 'release/*';
  
  protection: {
    // 基本保護
    requirePullRequest: true;
    requireApprovals: number;              // 需要的審查數量
    dismissStaleReviews: boolean;          // 新 commit 時清除舊審查
    requireCodeOwnerReviews: boolean;      // 需要 CODEOWNERS 審查
    
    // 狀態檢查
    requireStatusChecks: {
      strict: boolean;                     // 必須基於最新 base 分支
      contexts: string[];                  // 必須通過的檢查
    };
    
    // 限制
    restrictPushes: {
      users: string[];
      teams: string[];
    };
    
    // 強制執行
    enforceAdmins: boolean;                // 管理員也受限制
    allowForcePushes: boolean;             // 是否允許強制推送
    allowDeletions: boolean;               // 是否允許刪除分支
  };
}

// 範例配置
const mainBranchProtection: BranchProtectionConfig = {
  branch: 'main',
  protection: {
    requirePullRequest: true,
    requireApprovals: 2,
    dismissStaleReviews: true,
    requireCodeOwnerReviews: true,
    
    requireStatusChecks: {
      strict: true,
      contexts: [
        'build',
        'test',
        'lint',
        'security-scan',
        'coverage-check'
      ]
    },
    
    restrictPushes: {
      users: [],
      teams: ['release-managers']
    },
    
    enforceAdmins: true,
    allowForcePushes: false,
    allowDeletions: false
  }
};
```

---

## 分支策略與工作流程

### 1. Git Flow

**適用場景**：傳統軟體發布，有明確版本週期

```
main (production)
  ↑
release/v1.0 ← develop ← feature/user-auth
  ↑                  ← feature/dashboard
  ↑                  ← bugfix/login-error
hotfix/critical-bug
  ↓
main
```

**分支類型**：
```yaml
main:
  purpose: 生產環境程式碼
  protection: 最高級別
  merge_from: release, hotfix
  
develop:
  purpose: 開發整合分支
  protection: 高級別
  merge_from: feature, bugfix
  
feature/*:
  purpose: 新功能開發
  lifecycle: 短期
  merge_to: develop
  
release/*:
  purpose: 發布準備
  lifecycle: 短期
  merge_to: main, develop
  
hotfix/*:
  purpose: 緊急修復
  lifecycle: 極短期
  merge_to: main, develop
```

### 2. GitHub Flow

**適用場景**：持續部署，快速迭代

```
main (always deployable)
  ↑
  ├─ feature/add-payment ──→ PR → Merge
  ├─ fix/security-issue ───→ PR → Merge
  └─ docs/update-readme ───→ PR → Merge
```

**工作流程**：
1. Create branch from main
2. Make changes and commit
3. Open Pull Request
4. Review and discuss
5. Deploy to staging (optional)
6. Merge to main
7. Deploy to production

### 3. Trunk-Based Development

**適用場景**：高頻率發布，CI/CD 成熟

```
main (trunk)
  ↑
  ├─ short-lived-feature-1 (< 2 days)
  ├─ short-lived-feature-2 (< 2 days)
  └─ short-lived-feature-3 (< 2 days)
```

**關鍵實踐**：
- 極短分支生命週期
- Feature Flags 控制功能發布
- 高頻率整合到主幹
- 強大的自動化測試

---

## 事件邏輯與自動化

### GitHub Events 完整分類

#### 1. Repository Events (儲存庫事件)

```typescript
interface RepositoryEvents {
  // 程式碼事件
  codeEvents: {
    push: PushEvent;                    // 程式碼推送
    pull_request: PullRequestEvent;     // Pull Request
    create: CreateEvent;                // 建立分支/標籤
    delete: DeleteEvent;                // 刪除分支/標籤
    fork: ForkEvent;                    // Fork 儲存庫
  };
  
  // 發布事件
  releaseEvents: {
    release: ReleaseEvent;              // 發布版本
    tag: TagEvent;                      // 標籤建立
  };
  
  // 協作事件
  collaborationEvents: {
    issues: IssueEvent;                 // Issue 操作
    issue_comment: IssueCommentEvent;   // Issue 評論
    pull_request_review: PRReviewEvent; // PR 審查
    pull_request_review_comment: PRReviewCommentEvent;
    discussion: DiscussionEvent;        // 討論
    discussion_comment: DiscussionCommentEvent;
  };
  
  // Workflow 事件
  workflowEvents: {
    workflow_run: WorkflowRunEvent;     // Workflow 執行
    workflow_dispatch: WorkflowDispatchEvent; // 手動觸發
    schedule: ScheduleEvent;            // 定時觸發
  };
}
```

#### 2. Pull Request 事件生命週期

```yaml
Pull Request Lifecycle Events:

opened:
  trigger: PR 建立時
  actions:
    - Auto-assign reviewers
    - Run CI checks
    - Add labels
    - Post template comment

synchronize:
  trigger: 新 commit 推送時
  actions:
    - Re-run CI checks
    - Dismiss stale reviews (if configured)
    - Update status checks

review_submitted:
  trigger: 提交審查時
  actions:
    - Check approval count
    - Update PR status
    - Trigger auto-merge (if conditions met)

merged:
  trigger: PR 合併時
  actions:
    - Close related issues
    - Trigger deployment
    - Update changelog
    - Create release notes
```

### GitHub Actions Workflow 模式

#### 1. CI/CD Pipeline 結構

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]
  workflow_dispatch:    # 手動觸發

jobs:
  # ====== Stage 1: Code Quality ======
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint
  
  # ====== Stage 2: Build ======
  build:
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build-artifacts
          path: dist/
  
  # ====== Stage 3: Test ======
  test:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v4
  
  # ====== Stage 4: Security Scan ======
  security:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
      - uses: github/codeql-action/analyze@v3
  
  # ====== Stage 5: Deploy Production ======
  deploy-production:
    needs: [test, security]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://gighub.app
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
      - uses: firebase-tools-action@v1
        with:
          args: deploy --only hosting:production
```

#### 2. Reusable Workflows (可重用工作流程)

```yaml
# .github/workflows/reusable-build.yml
name: Reusable Build Workflow

on:
  workflow_call:
    inputs:
      node-version:
        required: true
        type: string
      build-command:
        required: false
        type: string
        default: 'npm run build'
    outputs:
      artifact-name:
        description: 'Build artifact name'
        value: ${{ jobs.build.outputs.artifact }}
    secrets:
      firebase-token:
        required: true

jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      artifact: ${{ steps.upload.outputs.artifact-id }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
      - run: npm ci
      - run: ${{ inputs.build-command }}
      - id: upload
        uses: actions/upload-artifact@v4
        with:
          name: build-${{ github.sha }}
          path: dist/
```

### Webhook 整合模式

```typescript
// Firebase Functions 處理 GitHub Webhook
import { onRequest } from 'firebase-functions/v2/https';
import { createHmac } from 'crypto';

export const githubWebhook = onRequest(async (req, res) => {
  // 1. 驗證 Webhook 簽名
  const signature = req.headers['x-hub-signature-256'] as string;
  const payload = JSON.stringify(req.body);
  const hmac = createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET!);
  const expectedSignature = `sha256=${hmac.update(payload).digest('hex')}`;
  
  if (signature !== expectedSignature) {
    res.status(401).send('Unauthorized');
    return;
  }
  
  // 2. 解析事件類型
  const eventType = req.headers['x-github-event'] as string;
  const event = req.body;
  
  // 3. 路由到對應處理器
  switch (eventType) {
    case 'push':
      await handlePushEvent(event);
      break;
    case 'pull_request':
      await handlePullRequestEvent(event);
      break;
    case 'issues':
      await handleIssueEvent(event);
      break;
    case 'release':
      await handleReleaseEvent(event);
      break;
  }
  
  res.status(200).send('OK');
});

async function handlePushEvent(event: any) {
  // 記錄到 Audit Log
  await auditLog.log({
    action: 'repository.push',
    actor: event.sender.login,
    resource: event.repository.full_name,
    metadata: {
      ref: event.ref,
      commits: event.commits.length
    }
  });
  
  // 觸發 CI/CD
  if (event.ref === 'refs/heads/main') {
    await triggerDeployment(event.repository.name);
  }
}
```

---

## 權限與安全模型

### 1. Repository 權限層級

```typescript
enum RepositoryPermission {
  NONE = 'none',           // 無權限
  READ = 'read',           // 讀取
  TRIAGE = 'triage',       // 分類 (管理 Issues/PRs)
  WRITE = 'write',         // 寫入 (可推送)
  MAINTAIN = 'maintain',   // 維護 (管理設定)
  ADMIN = 'admin'          // 管理員 (完全控制)
}
```

### 2. Secret 管理策略

```typescript
interface SecretManagement {
  // Repository Secrets
  repositorySecrets: {
    usage: '單一儲存庫專用';
    scope: 'Repository-level';
    examples: ['FIREBASE_TOKEN', 'DEPLOY_KEY'];
  };
  
  // Organization Secrets
  organizationSecrets: {
    usage: '組織內多儲存庫共用';
    scope: 'Organization-level';
    visibility: 'All repos' | 'Private repos' | 'Selected repos';
    examples: ['GOOGLE_CLOUD_PROJECT_ID', 'NPM_TOKEN'];
  };
  
  // Environment Secrets
  environmentSecrets: {
    usage: '特定環境專用';
    scope: 'Environment-specific';
    environments: ['production', 'staging', 'development'];
    examples: ['PRODUCTION_API_KEY', 'STAGING_DATABASE_URL'];
  };
}
```

### 3. Security Best Practices

```typescript
interface SecurityBestPractices {
  // 程式碼掃描
  codeScanning: {
    codeQL: {
      enabled: true;
      languages: ['javascript', 'typescript'];
      schedule: 'weekly';
    };
    dependabot: {
      enabled: true;
      packageEcosystem: 'npm';
      schedule: 'daily';
      openPullRequests: 10;
    };
  };
  
  // 秘密掃描
  secretScanning: {
    enabled: true;
    pushProtection: true;      // 防止推送包含秘密的程式碼
    alertOnCommit: true;
  };
  
  // 依賴審查
  dependencyReview: {
    enabled: true;
    failOnSeverity: 'high';
    allowedLicenses: ['MIT', 'Apache-2.0', 'BSD-3-Clause'];
  };
  
  // 簽名驗證
  signedCommits: {
    required: true;
    gpgKey: true;
  };
}
```

---

## 協作功能設計

### 1. Issues 管理系統

#### Issue 模板設計

```markdown
<!-- .github/ISSUE_TEMPLATE/bug_report.md -->
---
name: Bug Report
about: Report a bug in GigHub
title: '[BUG] '
labels: ['bug', 'needs-triage']
assignees: ''
---

## Bug Description
Clear description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. See error

## Expected vs Actual Behavior
Expected: ...
Actual: ...

## Environment
- OS: [e.g. macOS 14.1]
- Browser: [e.g. Chrome 120]
- Version: [e.g. 1.2.3]
```

#### Issue 標籤系統

```typescript
interface LabelSystem {
  // 類型標籤
  type: {
    bug: '🐛 Bug';
    feature: '✨ Feature';
    docs: '📚 Documentation';
    security: '🔒 Security';
  };
  
  // 狀態標籤
  status: {
    'needs-triage': '需要分類';
    'in-progress': '進行中';
    'blocked': '被阻擋';
  };
  
  // 優先級標籤
  priority: {
    'P0-critical': '🔴 Critical';
    'P1-high': '🟠 High';
    'P2-medium': '🟡 Medium';
    'P3-low': '🟢 Low';
  };
}
```

### 2. Pull Request 工作流程

#### PR 模板

```markdown
<!-- .github/pull_request_template.md -->
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #(issue number)

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guide
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests pass locally
```

---

## CI/CD 整合模式

### Multi-Stage Pipeline

```yaml
# .github/workflows/complete-pipeline.yml
name: Complete CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20.x'

jobs:
  # ========== Stage 1: Preparation ==========
  setup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
      - run: npm ci
  
  # ========== Stage 2: Code Quality ==========
  lint:
    needs: setup
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run lint
  
  format-check:
    needs: setup
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run format:check
  
  # ========== Stage 3: Build ==========
  build:
    needs: [lint, format-check]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build-artifacts
          path: dist/
  
  # ========== Stage 4: Test ==========
  test:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v4
  
  # ========== Stage 5: Security ==========
  security:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
      - uses: github/codeql-action/analyze@v3
  
  # ========== Stage 6: Deploy ==========
  deploy:
    needs: [test, security]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          projectId: gighub-production
```

---

## 可觀測性與運營

### 1. Metrics & Monitoring

```typescript
interface RepositoryMetrics {
  // 程式碼指標
  codeMetrics: {
    linesOfCode: number;
    codeChurn: number;          // 程式碼變動率
    technicalDebt: number;      // 技術債小時數
  };
  
  // 協作指標
  collaborationMetrics: {
    activeContributors: number;
    prMergeTime: number;        // PR 平均合併時間 (小時)
    reviewCoverage: number;     // 審查覆蓋率 %
  };
  
  // 質量指標
  qualityMetrics: {
    testCoverage: number;       // 測試覆蓋率 %
    bugDensity: number;         // Bug 密度
    securityVulnerabilities: number;
  };
  
  // 部署指標 (DORA Metrics)
  deploymentMetrics: {
    deploymentFrequency: number;      // 每日部署次數
    leadTimeForChanges: number;       // 變更前置時間 (小時)
    changeFailureRate: number;        // 變更失敗率 %
    meanTimeToRestore: number;        // 平均恢復時間 (小時)
  };
}
```

### 2. Audit & Compliance

```typescript
interface AuditLog {
  // 存取審計
  access: {
    type: 'repository_access' | 'settings_change' | 'permission_change';
    timestamp: Date;
    actor: User;
    target: Repository | Team | User;
    action: string;
    result: 'success' | 'failure';
  };
  
  // 程式碼審計
  codeAudit: {
    type: 'commit' | 'pull_request' | 'release';
    timestamp: Date;
    author: User;
    reviewer?: User;
    signedCommit: boolean;
    checksStatus: 'passed' | 'failed';
  };
  
  // 合規審計
  compliance: {
    type: 'security_scan' | 'license_check' | 'dependency_review';
    timestamp: Date;
    status: 'compliant' | 'non_compliant';
    violations: Violation[];
  };
}
```

---

## 最佳實踐與反模式

### ✅ 最佳實踐

#### 1. Commit 訊息規範 (Conventional Commits)

```bash
# Format:
type(scope): subject

body

footer

# Types:
feat:     新功能
fix:      修復
docs:     文檔
style:    格式
refactor: 重構
test:     測試
chore:    雜務

# Examples:
feat(auth): add Google OAuth integration

Implement Google OAuth 2.0 authentication flow
- Add OAuth configuration
- Create callback handler

Closes #123

fix(api): resolve timeout issue in user API

Optimized query with proper indexing.

Fixes #456
BREAKING CHANGE: API response format changed
```

#### 2. Git 工作流程最佳實踐

```bash
# 1. 頻繁小 Commits
git commit -m "feat: add user validation" 
git commit -m "test: add validation tests"

# 2. 保持分支最新
git checkout main
git pull
git checkout feature/user-auth
git rebase main

# 3. 使用 Tags 標記版本
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

### ❌ 反模式

#### 需要避免的行為

```bash
# ❌ Force push to main
git push -f origin main

# ❌ 巨大的 commits
git add .
git commit -m "updates"

# ❌ 敏感資訊提交
git add .env
git commit -m "add config"

# ❌ 無意義的 commit 訊息
git commit -m "fix"
git commit -m "update"
git commit -m "wip"

# ❌ 長期存在的分支
feature/started-6-months-ago
```

---

## GigHub 實際應用

### Repository 架構

```
7Spade/ng-lin (Monorepo)
├── .github/
│   ├── workflows/              # GitHub Actions
│   │   ├── ci-cd.yml
│   │   ├── security-scan.yml
│   │   └── release.yml
│   ├── ISSUE_TEMPLATE/
│   ├── PULL_REQUEST_TEMPLATE/
│   ├── CODEOWNERS
│   └── copilot-instructions.md
│
├── src/                       # Angular 前端
│   ├── app/
│   │   ├── core/
│   │   ├── features/
│   │   ├── routes/
│   │   └── shared/
│   └── environments/
│
├── functions-*/               # Firebase Functions
│   ├── functions-ai/
│   ├── functions-audit/
│   └── functions-event/
│
├── docs/                      # 文檔
│   ├── ⭐️/
│   ├── strategy-governance/
│   └── ...
│
├── firestore.rules
├── firebase.json
└── package.json
```

### 分支策略實施

```typescript
const gighubBranchStrategy = {
  // 主要分支
  main: {
    protection: {
      requirePullRequest: true,
      requiredApprovals: 2,
      requireCodeOwnerReviews: true,
      requireStatusChecks: true,
      contexts: [
        'build', 'test', 'lint',
        'security-scan', 'firebase-deploy-check'
      ],
      enforceAdmins: true
    },
    autoDeploy: 'production'
  },
  
  // 功能分支
  'feature/*': {
    namingConvention: 'feature/ISSUE-{number}-{description}',
    basedOn: 'main',
    mergeTo: 'main',
    protection: {
      requirePullRequest: true,
      requiredApprovals: 1
    }
  }
};
```

### Webhook 整合範例

```typescript
// 實際 Webhook Handler
export const githubWebhookHandler = onRequest(async (req, res) => {
  const event = req.headers['x-github-event'] as string;
  const payload = req.body;
  
  switch (event) {
    case 'push':
      // 記錄程式碼推送
      await auditLog.create({
        action: 'repository.push',
        actor: payload.pusher.name,
        resource: `${payload.repository.full_name}#${payload.ref}`,
        metadata: {
          commits: payload.commits.length,
          branch: payload.ref.replace('refs/heads/', '')
        }
      });
      break;
      
    case 'pull_request':
      if (payload.action === 'opened') {
        // 自動指派審查者
        await assignReviewers(payload.pull_request);
        // 自動添加標籤
        await addLabels(payload.pull_request);
      }
      break;
      
    case 'release':
      if (payload.action === 'published') {
        // 觸發部署通知
        await notifyTeam('release', {
          version: payload.release.tag_name,
          notes: payload.release.body
        });
      }
      break;
  }
  
  res.status(200).send('OK');
});
```

---

## 總結與建議

### 核心要點

1. **GitHub 是平台，不只是程式碼託管**
   - 治理、協作、自動化、安全四位一體
   - 所有流程應該 Git-First

2. **Repository 設計應根據組織結構**
   - Monorepo vs Polyrepo 取決於團隊與專案特性
   - 清晰的所有權與邊界

3. **分支策略反映發布節奏**
   - 持續部署 → GitHub Flow
   - 版本發布 → Git Flow
   - 高頻整合 → Trunk-Based

4. **自動化是關鍵**
   - CI/CD Pipeline 確保質量
   - GitHub Actions 提供無限可能
   - Webhooks 整合外部系統

5. **安全與合規不可妥協**
   - Branch Protection 保護主幹
   - Code Scanning 發現漏洞
   - Secret Management 保護憑證
   - Audit Log 確保可追溯

### 實施建議

#### 短期 (1-3 個月)
- ✅ 建立 README 與文檔
- ✅ 設定 Branch Protection
- ✅ 實施 PR 流程與模板
- ✅ 啟用基本 CI/CD
- ✅ 配置 CODEOWNERS

#### 中期 (3-6 個月)
- ✅ 完善 CI/CD Pipeline
- ✅ 整合 Security Scanning
- ✅ 建立 Deployment Environments
- ✅ 實施 Issue/PR 自動化
- ✅ 配置 Webhooks 整合

#### 長期 (6-12 個月)
- ✅ 優化 Repository 架構
- ✅ 建立 Metrics Dashboard
- ✅ 實施 Advanced Security Features
- ✅ 完善 Incident Response
- ✅ 建立 Contribution Community

---

## 參考資源

### 官方文檔
- [GitHub Docs](https://docs.github.com/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [GitHub Security](https://docs.github.com/en/code-security)
- [GitHub API](https://docs.github.com/en/rest)

### 最佳實踐
- [GitHub Flow](https://githubflow.github.io/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)

### 工具與整合
- [Firebase Tools](https://firebase.google.com/docs/cli)
- [GitHub CLI](https://cli.github.com/)

---

**版本**: 1.0  
**最後更新**: 2025-12-27  
**維護者**: GigHub Architecture Team  
**下次審查**: 2026-06-27
