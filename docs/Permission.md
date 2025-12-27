# GitHub 的 RBAC/ABAC 設計原理

GitHub 採用混合式的權限控制架構，結合了 **RBAC (Role-Based Access Control)** 和 **ABAC (Attribute-Based Access Control)** 的優勢，以提供靈活且安全的存取控制機制。

## 一、RBAC 設計核心

### 1. 角色層級結構

GitHub 的 RBAC 設計主要體現在組織和儲存庫層級：

**組織層級角色**
- **Owner**: 完整管理權限，包括組織設定、帳單、成員管理
- **Member**: 基本成員權限
- **Billing Manager**: 僅管理帳單資訊

**儲存庫層級角色**
- **Admin**: 完整儲存庫控制權
- **Maintain**: 管理儲存庫但無法進行敏感操作
- **Write**: 可以推送程式碼
- **Triage**: 管理 issues 和 pull requests
- **Read**: 僅能查看和 clone

### 2. 團隊機制

GitHub 使用**團隊 (Teams)** 作為角色分配的中間層：

```
Organization
  └── Teams (可以巢狀)
       └── Members
            └── Repositories (with specific roles)
```

這種設計允許：
- 批量管理多個成員的權限
- 建立團隊層級結構 (parent/child teams)
- 繼承式的權限傳遞

## 二、ABAC 設計要素

GitHub 的 ABAC 體現在更細粒度的存取控制上：

### 1. Branch Protection Rules (分支保護規則)

基於屬性的規則設定：

```javascript
// 範例規則屬性
{
  branch: "main",
  required_reviews: 2,
  required_status_checks: ["CI", "security-scan"],
  restrictions: {
    users: ["senior-dev-1", "senior-dev-2"],
    teams: ["core-team"]
  },
  dismiss_stale_reviews: true,
  require_code_owner_reviews: true
}
```

### 2. CODEOWNERS 檔案

基於檔案路徑的屬性控制：

```
# 不同路徑需要不同審查者
/docs/**          @docs-team
/src/core/**      @core-team
*.tf              @infra-team
package.json      @leads
```

### 3. Repository Rulesets (儲存庫規則集)

GitHub 近年推出的進階功能，更靈活的 ABAC 實現：

```typescript
interface RepositoryRuleset {
  name: string;
  target: 'branch' | 'tag';
  enforcement: 'active' | 'evaluate' | 'disabled';
  
  // 基於屬性的條件
  conditions: {
    ref_name: {
      include: string[];
      exclude: string[];
    }
  };
  
  // 規則定義
  rules: Array<{
    type: 'pull_request' | 'required_signatures' | 'commit_message_pattern';
    parameters: Record<string, any>;
  }>;
  
  // 繞過設定
  bypass_actors: Array<{
    actor_type: 'RepositoryRole' | 'Team' | 'User';
    actor_id: number;
    bypass_mode: 'always' | 'pull_request';
  }>;
}
```

### 4. 動態屬性評估

GitHub 在 PR 審查流程中會評估多種屬性：

- **時間屬性**: 程式碼變更的時間、PR 建立時間
- **內容屬性**: 修改的檔案路徑、程式碼量
- **使用者屬性**: 提交者的角色、所屬團隊
- **狀態屬性**: CI 狀態、審查狀態

## 三、混合模型的實際應用

### 範例場景：企業級專案權限設計

```typescript
// 角色定義 (RBAC)
const roles = {
  'engineering-lead': {
    permissions: ['admin'],
    repositories: ['*']
  },
  'senior-developer': {
    permissions: ['write'],
    repositories: ['*']
  },
  'junior-developer': {
    permissions: ['write'],
    repositories: ['non-critical-*']
  }
};

// 屬性規則 (ABAC)
const rules = {
  'production-deployment': {
    conditions: {
      branch: 'main',
      files: ['**/*.prod.*', 'Dockerfile'],
      required_approvals: 2,
      required_approvers: {
        teams: ['devops-team'],
        minimum_role: 'senior-developer'
      }
    }
  },
  'security-sensitive': {
    conditions: {
      files: ['**/auth/**', '**/security/**'],
      required_checks: ['security-scan', 'dependency-audit'],
      required_reviewers: ['security-team']
    }
  }
};
```

## 四、設計優勢

### RBAC 優勢
1. **易於管理**: 透過角色快速分配權限
2. **清晰的職責劃分**: 角色與組織結構對應
3. **可擴展性**: 新成員可快速獲得適當權限

### ABAC 優勢
1. **細粒度控制**: 基於檔案、分支、時間等多維度
2. **動態評估**: 根據當前狀態做出決策
3. **合規性**: 符合特定法規要求（如金融、醫療領域）

### 混合模型優勢
1. **靈活性與簡潔性平衡**: 大部分場景用 RBAC，特殊需求用 ABAC
2. **降低管理複雜度**: 避免純 ABAC 的策略爆炸問題
3. **漸進式增強**: 可從簡單的 RBAC 逐步添加 ABAC 規則

## 五、實作建議

在 Angular + Supabase 專案中實現類似機制：

```typescript
// 定義權限服務
@Injectable({ providedIn: 'root' })
export class PermissionService {
  private currentUser$ = inject(AuthService).user$;
  
  // RBAC 檢查
  hasRole(role: string): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => user?.roles?.includes(role) ?? false)
    );
  }
  
  // ABAC 檢查
  canAccess(resource: string, action: string, context: Record<string, any>): Observable<boolean> {
    return this.currentUser$.pipe(
      switchMap(user => {
        return this.supabase
          .rpc('evaluate_access', {
            user_id: user.id,
            resource,
            action,
            context
          });
      })
    );
  }
  
  // 混合檢查
  canModifyFile(filePath: string): Observable<boolean> {
    return combineLatest([
      this.hasRole('developer'),
      this.canAccess('files', 'write', { path: filePath })
    ]).pipe(
      map(([hasRole, hasAccess]) => hasRole && hasAccess)
    );
  }
}
```

