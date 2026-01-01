# Features 層架構 (Features Layer Architecture)

## 核心設計理念

Features 層代表**業務世界**，遵循嚴格的依賴規則：

```typescript
{
  philosophy: "業務世界只能依賴 core 和 abstractions",
  forbidden: [
    "直接依賴 Firebase/Supabase",
    "跨 Feature 直接 import domain model",
    "在 Domain 層包含 UI 邏輯"
  ],
  enforced: [
    "透過 abstractions 介面使用基礎設施",
    "透過 contracts 跨 Feature 通訊",
    "事件驅動的 Feature 協作"
  ]
}
```

## 四大組成部分

### 1. Domains/ - 限界上下文 (Bounded Contexts)

**職責**: 單一業務領域的完整生命週期管理

**標準結構**:
```
features/domains/issue/
├── domain/              # 純領域邏輯
│   ├── entities/        # 實體身份 + 生命週期
│   ├── value-objects/   # 不可變值
│   ├── aggregates/      # 一致性邊界 + 命令入口
│   └── policies/        # 業務策略決策
├── application/         # Use Cases (純編排)
│   ├── commands/        # 寫操作意圖
│   ├── queries/         # 讀操作意圖
│   └── handlers/        # 命令處理邏輯
├── events/              # 領域事件
├── projection/          # CQRS 讀端優化
├── infrastructure/      # 僅依賴 abstractions
│   └── repositories/    # 實作 IRepository<T>
├── acl/                 # Anti-Corruption Layer
└── ui/                  # 領域 UI 組件
```

**範例**: Issue Domain
- 有完整業務生命週期 (創建 → 更新 → 關閉)
- 包含核心業務規則 (狀態轉換、優先級計算)
- 擁有獨立的持久化邏輯

### 2. Processes/ - 流程編排 (Saga/Workflow)

**職責**: 協調跨 Domain 的長事務

```
features/processes/
├── issue-lifecycle/       # Issue 完整生命週期
│   ├── process.manager.ts # Saga 協調器
│   ├── state.machine.ts   # 狀態機定義
│   └── policy.guard.ts    # 策略守衛
├── moderation/            # 內容審核流程
└── notification-dispatch/ # 通知分發編排
```

**Process Manager 模式**:
```typescript
export class IssueLifecycleProcess {
  @Subscribe(IssueCreatedEvent)
  async onIssueCreated(event: IssueCreatedEvent) {
    // 1. 檢查策略
    const policyCheck = await this.policyEngine.evaluate(
      'issue-creation',
      event.context
    );
    
    if (policyCheck.violated) {
      // 2. 觸發審核流程
      await this.dispatch(new StartModerationCommand(event.issueId));
    }
    
    // 3. 發送通知
    await this.dispatch(new SendNotificationCommand({
      type: 'issue-created',
      recipients: event.watchers
    }));
  }
}
```

### 3. Capabilities/ - 平台能力 (橫切關注點)

**職責**: 跨 Domain 的共享能力服務

```
features/capabilities/
├── notification/          # 通知能力
│   ├── domain/
│   ├── channels/          # email/push/in-app
│   └── acl/               # SendGrid adapter
├── search/                # 搜尋能力
│   ├── indexer/
│   └── acl/               # Algolia/Meilisearch
├── analytics/             # 分析能力
│   ├── projection/
│   └── metrics/
├── settings/              # 設定能力
└── admin/                 # 管理能力
```

**Capability vs Domain 區別**:
- **Domain**: 有完整業務生命週期 (如 Issue)
- **Capability**: 提供服務能力，無獨立業務流程 (如 Notification)

### 4. Shared-Domain/ - 共享領域 (純值物件)

**職責**: 無流程的共享概念

```
features/shared-domain/
├── label/
│   └── label.vo.ts        # 標籤值物件
└── reaction/
    └── reaction.vo.ts     # 反應值物件
```

**限制**:
- ❌ 不能有聚合根
- ❌ 不能有命令/查詢
- ✅ 只能是值物件
- ✅ 可被多個 Domain 引用

## Feature 間通訊機制

### Contracts/ - Feature 邊界合約

**目的**: 定義 Feature 之間的穩定公開介面

```typescript
// contracts/issue.contract.ts

// ✅ 公開的 DTO
export interface IssueDTO {
  id: string;
  title: string;
  status: IssueStatus;
  createdAt: Date;
}

// ✅ 公開的事件
export interface IssueCreatedEvent {
  issueId: string;
  title: string;
  authorId: string;
  timestamp: Date;
}

// ✅ 公開的介面
export interface IIssueQueryService {
  getIssue(id: string): Promise<Result<IssueDTO, Error>>;
  listIssues(filter: IssueFilter): Promise<Result<IssueDTO[], Error>>;
}

// ❌ 不公開內部實作
// ❌ 不公開聚合根
// ❌ 不公開值物件
```

**通訊方式**:
1. **事件驅動**: Feature A 發布事件 → Feature B 訂閱
2. **Contract 介面**: Feature A 實作公開介面 → Feature B 透過 DI 調用
3. **DTO 傳遞**: 跨 Feature 數據傳輸使用 DTO，不傳遞領域模型

## UI Composition - 頁面級編排

**職責**: 組合多個 Domain UI 成完整頁面

```
features/ui-composition/
└── issue-page/
    └── issue-page.component.ts
```

**範例**:
```typescript
@Component({
  template: `
    <app-layout>
      <!-- Issue Domain UI -->
      <app-issue-detail [issueId]="issueId" />
      
      <!-- Discussion Domain UI -->
      <app-discussion-thread [issueId]="issueId" />
      
      <!-- Comment Domain UI -->
      <app-comment-list [discussionId]="discussionId" />
      
      <!-- Capability UI -->
      <app-notification-center />
    </app-layout>
  `
})
export class IssuePageComponent {
  // 只負責編排，不包含業務邏輯
}
```

## 依賴規則

```
✅ Features → core/abstractions
✅ Features → infrastructure/abstractions
✅ Feature A → Feature B 的 contracts
❌ Features → infrastructure/firebase (直接)
❌ Feature A → Feature B 的 domain models (直接)
❌ Domain 層 → UI 框架
```

## 實施策略

**推薦順序**:

1. **Phase 1: 完善第一個 Domain** (Issue)
   - 建立完整 DDD 層次結構
   - 驗證架構可行性

2. **Phase 2: 建立 Contracts**
   - 定義 Feature 間公開介面
   - 實作事件通訊機制

3. **Phase 3: 實作第二個 Domain** (User)
   - 驗證架構可複製性
   - 測試 Contract 通訊

4. **Phase 4: 引入 Processes**
   - 協調跨 Domain 流程
   - 實作 Saga 模式

5. **Phase 5: 擴展 Capabilities**
   - 添加橫切能力
   - 實作 ACL 防腐層

## 關鍵設計決策

**優勢**:
- ✅ 清晰的職責分離
- ✅ 高度解耦，易於測試
- ✅ 可獨立演化的 Feature
- ✅ 遵循 DDD/CQRS 原則

**挑戰**:
- ⚠️ Processes 複雜度管理
- ⚠️ 事件順序性保證
- ⚠️ Contract 版本管理
- ⚠️ Projection 同步延遲

---

**參考文檔**:
- ACL 模式: `docs/03-architecture/anti-corruption-layer.md`
- 合約版本: `docs/08-governance/schema-evolution.md`
- Process 模式: `docs/05-process-layer/saga-process-manager.md`
