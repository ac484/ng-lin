# 政策強制執行 (Policy Enforcement)

## 政策層級

### 1. 編譯時政策 (ESLint Rules)
```typescript
// .eslintrc.js
rules: {
  'no-firebase-in-core': 'error',
  'max-file-size': ['error', { max: 4000 }],
  'enforce-result-pattern': 'error'
}
```

### 2. 執行時政策
```typescript
class PolicyEngine {
  enforce(event: CausalEvent): Result<void> {
    for (const policy of this.policies) {
      const result = policy.check(event);
      if (result.isErr()) {
        return result;
      }
    }
    return Result.Ok(undefined);
  }
}

// 範例政策
class MaxIssuesPerUserPolicy {
  check(event: IssueCreatedEvent): Result<void> {
    const count = this.countUserIssues(event.createdBy);
    if (count >= 10) {
      return Result.Err('User has reached max issues limit');
    }
    return Result.Ok(undefined);
  }
}
```

### 3. 審計政策
```typescript
class AuditPolicy {
  async audit(event: CausalEvent) {
    await auditLog.record({
      eventId: event.id,
      type: event.type,
      timestamp: event.timestamp,
      actor: this.extractActor(event),
      action: this.extractAction(event)
    });
  }
}
```

## 政策分類

### 業務政策
- 資源配額限制
- 角色權限檢查
- 工作流程驗證

### 技術政策
- 事件大小限制
- 頻率限制
- 依賴檢查

### 合規政策
- 資料保留期限
- 敏感資料處理
- 審計要求

## 動態政策

```typescript
class DynamicPolicyEngine {
  async loadPolicies() {
    const policies = await policyStore.getActivePolicies();
    this.policies = policies.map(p => this.compile(p));
  }
  
  compile(policyDef: PolicyDefinition): Policy {
    // 將政策定義編譯為可執行函數
    return eval(policyDef.code);
  }
}
```

---

**參考**: [ADR 002](../adr/002-rbac-authorization-system.md)
