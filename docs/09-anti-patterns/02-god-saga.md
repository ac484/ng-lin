# 反模式：上帝 Saga (God Saga)

## AP-02: God Saga

### 定義
單一 Saga 承擔過多職責，變成「無所不知、無所不能」的全能流程管理器。

### 為何錯誤
Saga 應**編排特定流程**，不是**控制整個系統**。導致：
- 流程邏輯糾纏難解
- 測試困難
- 單點故障
- 難以擴展

### 錯誤範例

```typescript
// ❌ 上帝 Saga 管理所有事情
class GodSaga {
  async handle(event: DomainEvent) {
    switch (event.type) {
      case 'IssueCreated':
        await this.validateIssue(event);
        await this.assignIssue(event);
        await this.notifyUsers(event);
        await this.updateMetrics(event);
        await this.checkCompliance(event);
        await this.syncToExternal(event);
        break;
      case 'IssueAssigned':
        await this.notifyAssignee(event);
        await this.updateWorkload(event);
        await this.checkSLA(event);
        break;
    }
  }
  
  // 包含業務規則（應在 Policy）
  private canAssign(issue, user): boolean { ... }
  
  // 包含決策邏輯（應在 Service）
  private shouldNotify(issue): boolean { ... }
}
```

**問題**：職責過多（違反 SRP）、包含業務規則、難以測試與維護

### 正確實踐

```typescript
// ✅ 每個 Saga 專注於單一流程
class IssueAssignmentSaga {
  async handle(event: IssueCreated) {
    const assignee = await this.selectAssignee(event.data);
    if (assignee) {
      await this.commandBus.send(
        new AssignIssueCommand({ issueId: event.aggregateId, assignee })
      );
    }
  }
}

class IssueNotificationSaga {
  async handle(event: IssueAssigned) {
    await this.notificationService.notify({
      recipient: event.data.assignee,
      type: 'issue_assigned',
      data: event.data
    });
  }
}

class IssueComplianceSaga {
  async handle(event: IssueCreated) {
    const violations = await this.complianceChecker.check(event.data);
    if (violations.length > 0) {
      await this.commandBus.send(
        new FlagIssueCommand({ issueId: event.aggregateId, violations })
      );
    }
  }
}
```

## 拆分原則

### 1. 按流程職責
- IssueAssignmentSaga - 自動分配
- IssueNotificationSaga - 通知相關人員
- IssueComplianceSaga - 合規檢查
- IssueSLASaga - SLA 監控

### 2. 按生命週期階段
- IssueCreationSaga - 創建階段
- IssueProgressSaga - 進行中階段
- IssueClosureSaga - 關閉階段

### 3. 按集成點
- ExternalSystemSyncSaga - 外部系統同步
- SearchIndexingSaga - 搜尋索引更新

## 檢測方式

```typescript
class SagaComplexityAnalyzer {
  isGodSaga(metrics: SagaMetrics): boolean {
    return (
      metrics.eventTypes > 5 ||      // 處理超過 5 種事件
      metrics.methods > 10 ||         // 超過 10 個方法
      metrics.loc > 500 ||            // 超過 500 行
      metrics.dependencies > 8        // 超過 8 個依賴
    );
  }
}
```

### Code Review 檢查清單
- [ ] Saga 處理的事件類型數量 ≤ 5？
- [ ] Saga 的方法數量 ≤ 10？
- [ ] Saga 的程式碼行數 ≤ 500？
- [ ] Saga 的依賴服務數量 ≤ 8？
- [ ] Saga 是否包含業務規則？（應移至 Domain）
- [ ] Saga 是否包含決策邏輯？（應移至 Policy）

## 修復步驟

1. **識別職責**：列出所有事件與職責，依職責分組
2. **提取流程**：從上帝 Saga 提取獨立流程
3. **創建專注 Saga**：每個 Saga 僅處理單一流程邏輯
4. **移除業務規則**：業務規則移至 Domain Policy

## 結論

Saga 應該：
- ✅ 專注於單一流程
- ✅ 編排事件，不包含業務規則
- ✅ 可獨立測試、獨立部署

Saga 不應該：
- ❌ 處理所有事件
- ❌ 包含業務規則或決策邏輯
- ❌ 成為系統中樞

**記住**：流程管理器編排流程，不決定業務。

---

**參考**：[Saga/Process Manager](../05-process-layer/saga-process-manager.md) | [核心原則](../02-paradigm/core-principles.md)
