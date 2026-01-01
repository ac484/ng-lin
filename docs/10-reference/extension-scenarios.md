# 擴展場景 (Extension Scenarios)

本文檔說明系統的可擴展性設計，展示如何在不破壞現有架構的前提下添加新功能或切換技術棧。

## 場景 1: 切換後端 (Firebase → Supabase)

**需求**: 從 Firebase 遷移到 Supabase，但不影響業務邏輯

### 實施步驟

**Step 1: 實作 Supabase Repositories**
```typescript
// infrastructure/supabase/repositories/supabase-repository.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IRepository } from '@infrastructure/abstractions/repository';

export class SupabaseRepository<T> implements IRepository<T> {
  private client: SupabaseClient;
  
  constructor(private tableName: string) {
    this.client = createClient(
      environment.supabase.url,
      environment.supabase.key
    );
  }
  
  async findById(id: EntityId): Promise<Result<T, NotFoundError>> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('id', id.toString())
      .single();
    
    if (error) {
      return Result.err(new NotFoundError(id));
    }
    
    return Result.ok(data as T);
  }
  
  async save(entity: T): Promise<Result<void, SaveError>> {
    const { error } = await this.client
      .from(this.tableName)
      .upsert(entity);
    
    if (error) {
      return Result.err(new SaveError(error.message));
    }
    
    return Result.ok(undefined);
  }
}
```

**Step 2: 實作 Auth Adapter**
```typescript
// infrastructure/supabase/auth.adapter.ts
import { IAuth } from '@infrastructure/abstractions/auth';

export class SupabaseAuthAdapter implements IAuth {
  private client = createClient(...);
  
  async signIn(email: string, password: string): Promise<Result<User>> {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      return Result.err(new AuthError(error.message));
    }
    
    return Result.ok(this.toUser(data.user));
  }
  
  // 實作其他 IAuth 方法...
}
```

**Step 3: 修改 DI 綁定**
```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    // ✅ 唯一需要修改的地方
    { provide: REPOSITORY_TOKEN, useClass: SupabaseRepository },
    { provide: EVENT_STORE_TOKEN, useClass: SupabaseEventStore },
    { provide: AUTH_TOKEN, useClass: SupabaseAuthAdapter },
    
    // ✅ 業務層和核心層完全不需要修改
    ...FOUNDATION_PROVIDERS,
    ...GOVERNANCE_PROVIDERS,
    ...OBSERVABILITY_PROVIDERS
  ]
};
```

**結果**:
- ✅ Core 層: 0 行修改
- ✅ Features 層: 0 行修改
- ✅ Infrastructure 層: 新增適配器
- ✅ app.config.ts: 修改 3 行

---

## 場景 2: 新增 Domain (例如: Milestone)

**需求**: 在 Issue Domain 基礎上新增 Milestone Domain

### 完整結構

```
features/domains/milestone/
├── domain/                      # 領域層
│   ├── entities/
│   │   └── milestone.entity.ts
│   ├── value-objects/
│   │   ├── milestone-status.vo.ts
│   │   └── milestone-date-range.vo.ts
│   ├── aggregates/
│   │   └── milestone.aggregate.ts
│   └── policies/
│       └── milestone-closure.policy.ts
├── application/                 # 應用層
│   ├── commands/
│   │   ├── create-milestone.command.ts
│   │   ├── update-milestone.command.ts
│   │   └── close-milestone.command.ts
│   ├── queries/
│   │   ├── get-milestone.query.ts
│   │   └── list-milestones.query.ts
│   └── handlers/
│       ├── milestone-command.handler.ts
│       └── milestone-query.handler.ts
├── events/                      # 事件層
│   ├── milestone-created.event.ts
│   ├── milestone-updated.event.ts
│   └── milestone-closed.event.ts
├── projection/                  # 讀模型
│   ├── milestone-list.projection.ts
│   └── milestone-summary.projection.ts
├── infrastructure/              # 基礎設施
│   └── repositories/
│       └── milestone.repository.ts
├── acl/                         # 防腐層 (如需整合外部 PM 工具)
│   ├── jira.mapper.ts
│   └── jira.adapter.ts
├── ui/                          # UI 組件
│   ├── milestone-list.component.ts
│   ├── milestone-detail.component.ts
│   └── milestone-form.component.ts
└── providers.ts                 # DI 配置
```

### 實作範例

**Aggregate**:
```typescript
// domain/aggregates/milestone.aggregate.ts
export class MilestoneAggregate extends Aggregate {
  private constructor(
    id: EntityId,
    private title: string,
    private status: MilestoneStatus,
    private dateRange: MilestoneDateRange,
    private issueIds: EntityId[]
  ) {
    super(id);
  }
  
  static create(data: CreateMilestoneData): Result<MilestoneAggregate> {
    // 業務規則驗證
    if (data.title.length < 3) {
      return Result.err(new ValidationError('Title too short'));
    }
    
    const milestone = new MilestoneAggregate(
      IdGeneratorService.generate(Namespace.MILESTONE),
      data.title,
      MilestoneStatus.Open,
      data.dateRange,
      []
    );
    
    // 發布領域事件
    milestone.addEvent(new MilestoneCreatedEvent({
      milestoneId: milestone.id,
      title: data.title,
      startDate: data.dateRange.start,
      endDate: data.dateRange.end
    }));
    
    return Result.ok(milestone);
  }
  
  addIssue(issueId: EntityId): Result<void> {
    if (this.status === MilestoneStatus.Closed) {
      return Result.err(new BusinessRuleViolation('Cannot add to closed milestone'));
    }
    
    this.issueIds.push(issueId);
    this.addEvent(new IssueAddedToMilestoneEvent({
      milestoneId: this.id,
      issueId
    }));
    
    return Result.ok(undefined);
  }
}
```

**Repository**:
```typescript
// infrastructure/repositories/milestone.repository.ts
export class MilestoneRepository implements IRepository<MilestoneAggregate> {
  private repository = inject(REPOSITORY_TOKEN);
  
  async findById(id: EntityId): Promise<Result<MilestoneAggregate>> {
    const result = await this.repository.findById(id);
    
    if (result.isErr()) {
      return Result.err(result.error);
    }
    
    // 從持久化數據重建聚合
    return MilestoneMapper.toDomain(result.value);
  }
}
```

---

## 場景 3: 新增 Capability (例如: Email Notification)

**需求**: 添加郵件通知能力，支援多種通道

### 結構設計

```
features/capabilities/email-notification/
├── domain/                      # 通知規則領域
│   ├── value-objects/
│   │   ├── email-address.vo.ts
│   │   └── email-template.vo.ts
│   └── policies/
│       └── notification-policy.ts
├── application/                 # 發送邏輯
│   ├── commands/
│   │   └── send-email.command.ts
│   └── handlers/
│       └── email-command.handler.ts
├── channels/                    # 通道實作 (多個)
│   ├── smtp/
│   │   └── smtp-channel.ts
│   ├── sendgrid/
│   │   └── sendgrid-channel.ts
│   └── mailgun/
│       └── mailgun-channel.ts
├── projection/                  # 通知記錄
│   └── email-history.projection.ts
├── acl/                         # 外部服務防腐層
│   ├── sendgrid.mapper.ts
│   └── sendgrid.adapter.ts
└── providers.ts
```

### 實作範例

**Channel 抽象**:
```typescript
// domain/i-email-channel.ts
export interface IEmailChannel {
  send(email: Email): Promise<Result<void, SendError>>;
}

export const EMAIL_CHANNEL_TOKEN = new InjectionToken<IEmailChannel>(
  'IEmailChannel'
);
```

**SendGrid 實作** (透過 ACL):
```typescript
// acl/sendgrid.adapter.ts
export class SendGridAdapter implements IEmailChannel {
  constructor(
    private client: SendGridClient,
    private mapper: SendGridMapper
  ) {}
  
  async send(email: Email): Promise<Result<void, SendError>> {
    const sgFormat = this.mapper.toSendGridFormat(email);
    
    try {
      await this.client.send(sgFormat);
      return Result.ok(undefined);
    } catch (error) {
      return Result.err(new SendError(error.message));
    }
  }
}
```

**DI 配置**:
```typescript
// providers.ts
export const EMAIL_PROVIDERS: Provider[] = [
  {
    provide: EMAIL_CHANNEL_TOKEN,
    useClass: SendGridAdapter  // 可輕鬆切換為 MailgunAdapter
  },
  EmailCommandHandler
];
```

**Usage in Process**:
```typescript
// features/processes/issue-lifecycle/process.manager.ts
export class IssueLifecycleProcess {
  private emailChannel = inject(EMAIL_CHANNEL_TOKEN);
  
  @Subscribe(IssueCreatedEvent)
  async onIssueCreated(event: IssueCreatedEvent) {
    const email = Email.create({
      to: event.authorEmail,
      subject: 'Issue Created',
      body: `Your issue "${event.title}" has been created.`
    });
    
    await this.emailChannel.send(email);
  }
}
```

---

## 場景 4: 新增 Process (例如: Auto-Assignment)

**需求**: 自動分配 Issue 給可用開發者

```
features/processes/auto-assignment/
├── process.manager.ts           # Saga 協調器
├── state.machine.ts             # 狀態機定義
├── policies/
│   ├── workload-policy.ts       # 工作量評估
│   └── skill-match-policy.ts    # 技能匹配
└── providers.ts
```

**實作**:
```typescript
// process.manager.ts
export class AutoAssignmentProcess {
  private issueRepo = inject(IssueRepository);
  private userRepo = inject(UserRepository);
  private policyEngine = inject(POLICY_ENGINE_TOKEN);
  
  @Subscribe(IssueCreatedEvent)
  async onIssueCreated(event: IssueCreatedEvent) {
    // 1. 獲取可用開發者
    const developers = await this.userRepo.findByRole('developer');
    
    // 2. 評估策略 (工作量 + 技能匹配)
    const assignments = await Promise.all(
      developers.map(dev => this.policyEngine.evaluate('auto-assign', {
        developer: dev,
        issue: event
      }))
    );
    
    // 3. 選擇最佳匹配
    const bestMatch = assignments
      .filter(a => a.passed)
      .sort((a, b) => b.score - a.score)[0];
    
    if (bestMatch) {
      // 4. 執行分配命令
      await this.dispatch(new AssignIssueCommand({
        issueId: event.issueId,
        assigneeId: bestMatch.developerId
      }));
    }
  }
}
```

---

## 擴展原則

### ✅ 支援的擴展

1. **後端切換** - 透過實作 abstractions interfaces
2. **新增 Domain** - 遵循標準 DDD 結構
3. **新增 Capability** - 使用 ACL 隔離外部服務
4. **新增 Process** - 使用 Saga 協調跨 Domain 流程
5. **新增 UI 組件** - 遵循 Feature UI 結構

### ⚠️ 需謹慎的擴展

1. **修改 Core Abstractions** - 影響所有 Features
2. **修改事件結構** - 需考慮版本相容性
3. **修改 Aggregate 邊界** - 可能破壞一致性

### ❌ 不支援的擴展

1. **跨 Feature 直接依賴** Domain models
2. **在 Domain 層直接依賴** Infrastructure
3. **破壞單向依賴規則**

---

**參考文檔**:
- Features 架構: `docs/03-architecture/features-layer.md`
- ACL 模式: `docs/03-architecture/anti-corruption-layer.md`
- DI 策略: `docs/10-reference/dependency-injection.md`
- Process 模式: `docs/05-process-layer/saga-process-manager.md`
