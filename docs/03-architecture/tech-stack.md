# 技術棧 (Tech Stack)

## 前端框架

### Angular 20.3.0
- **Standalone Components** - 預設架構模式
- **Signals** - 原生響應式狀態管理
- **TypeScript 5.x** - 強型別開發
- **Zone.js-less** (可選) - 更高性能

**核心特性**:
```typescript
// 使用 Standalone Components
@Component({
  selector: 'app-issue-list',
  standalone: true,
  imports: [CommonModule, NzTableModule],
  template: `...`
})

// 使用 Signals
export class IssueListComponent {
  issues = signal<Issue[]>([]);
  filteredIssues = computed(() => 
    this.issues().filter(i => i.status === 'open')
  );
  
  // 使用 inject() 取代 constructor injection
  private repository = inject(IssueRepository);
}
```

## UI 框架

### ng-zorro-antd 20.3.1
**Ant Design** 的 Angular 實作

**核心組件**:
- 表格 (NzTable)
- 表單 (NzForm)
- 模態框 (NzModal)
- 通知 (NzNotification)
- 佈局 (NzLayout)

### ng-alain 20.1.0
基於 ng-zorro-antd 的企業級腳手架

**提供功能**:
- **@delon/abc**: 業務組件
- **@delon/auth**: 認證授權模組
- **@delon/acl**: 訪問控制
- **@delon/form**: 動態表單
- **@delon/chart**: 圖表組件

**使用範例**:
```typescript
// shared-ui/index.ts 中統一匯出
export * from './shared-zorro';  // ng-zorro 組件
export * from './shared-delon';  // @delon 組件
```

## 後端服務 (Firebase)

### Firestore
**NoSQL 文檔資料庫**

```typescript
// 用途
- Event Store (事件存儲)
- Aggregate 持久化
- Projection 資料
- 即時同步

// 範例
const eventsRef = collection(firestore, 'events');
const eventDoc = await addDoc(eventsRef, eventData);
```

### Firebase Auth
**認證服務**

```typescript
// 支援方式
- Email/Password
- Google OAuth
- GitHub OAuth
- 匿名認證

// 整合
// infrastructure/firebase/auth.adapter.ts
export class FirebaseAuthAdapter implements IAuth {
  async signIn(email: string, password: string): Promise<Result<User>> {
    const credential = await signInWithEmailAndPassword(
      this.auth, email, password
    );
    return Result.ok(this.toUser(credential.user));
  }
}
```

### Firebase Storage
**檔案存儲**

```typescript
// 用途
- 使用者頭像
- Issue 附件
- 文件上傳

// 範例
const storageRef = ref(storage, `attachments/${fileId}`);
await uploadBytes(storageRef, file);
```

## 狀態管理

### Angular Signals (主要)
**原生響應式狀態**

```typescript
// Signal 基本用法
const count = signal(0);
const doubled = computed(() => count() * 2);

effect(() => {
  console.log('Count changed:', count());
});

count.set(5);  // 觸發 effect
count.update(v => v + 1);  // 6
```

### @ngrx/signals
**進階狀態管理**

```typescript
import { signalStore, withState, withMethods } from '@ngrx/signals';

export const IssueStore = signalStore(
  withState({ issues: [], loading: false }),
  withMethods((store) => ({
    loadIssues: async () => {
      store.loading.set(true);
      const issues = await fetchIssues();
      store.issues.set(issues);
      store.loading.set(false);
    }
  }))
);
```

### RxJS
**事件流和非同步處理**

```typescript
// EventBus 使用 Subject
export class EventBusService {
  private readonly eventSubject = new Subject<CausalEvent>();
  readonly events$ = this.eventSubject.asObservable();
  
  publish(event: CausalEvent): void {
    this.eventSubject.next(event);
  }
}
```

## 事件系統

### Custom Causal Event Bus
**因果事件匯流排**

```typescript
// core/observability/events/
- CausalEvent model (causationId, correlationId, traceId)
- EventBusService (發布/訂閱)
- CausalTracker (追蹤因果鏈)

// 使用
@Subscribe(IssueCreatedEvent)
async onIssueCreated(event: IssueCreatedEvent) {
  // 處理事件
}
```

### Firestore Event Store
**事件持久化**

```typescript
// infrastructure/observability/event-store/
- FirestoreEventStore (9 個模組)
- Event versioning (版本控制)
- Snapshot support (快照支援)
- Real-time subscriptions (即時訂閱)
```

## 身份系統

### Namespace-based EntityId
**唯一識別符系統**

```typescript
// core/identity/
export enum Namespace {
  ISSUE = 'issue',
  USER = 'user',
  DISCUSSION = 'discussion',
  COMMENT = 'comment',
  ATTACHMENT = 'attachment',
  REACTION = 'reaction',
  LABEL = 'label'
}

export class EntityId {
  constructor(
    public readonly namespace: Namespace,
    public readonly id: string  // UUID v4
  ) {}
  
  toString(): string {
    return `${this.namespace}:${this.id}`;
  }
}

// 使用
const issueId = IdGeneratorService.generate(Namespace.ISSUE);
// "issue:550e8400-e29b-41d4-a716-446655440000"
```

## 架構模式

### DDD (Domain-Driven Design)
- Aggregate (聚合根)
- Entity (實體)
- Value Object (值物件)
- Domain Event (領域事件)
- Repository (資料存取抽象)

### CQRS
- Command (寫操作)
- Query (讀操作)
- Projection (讀模型)

### Event Sourcing
- Event Store (事件存儲)
- Event Replay (事件重播)
- Snapshot (快照優化)

### Hexagonal Architecture
- Core (核心領域)
- Infrastructure (基礎設施適配器)
- Abstractions (依賴反轉)

## 開發工具

### 架構驗證
- **ESLint** - 代碼檢查
- **Custom Rules** - 架構規則強制 (Rule #9, #10)
- **dependency-cruiser** - 依賴分析

### 測試
- **Jasmine + Karma** - 單元測試
- **Playwright** - E2E 測試
- **@angular/fire/compat/firestore** - Firebase 測試工具

### 開發體驗
- **Angular CLI** - 腳手架工具
- **Health Dashboard** - 開發健康檢查 (`/__dev__/health`)
- **Hot Module Replacement** - 熱更新

## 部署環境

### Development
```typescript
// environments/environment.ts
export const environment = {
  production: false,
  firebase: {
    projectId: 'ng-lin-dev',
    // ...
  }
};
```

### Production
```typescript
// environments/environment.prod.ts
export const environment = {
  production: true,
  firebase: {
    projectId: 'ng-lin-prod',
    // ...
  }
};
```

---

**參考文檔**:
- 架構概覽: `docs/03-architecture/overview.md`
- DI 策略: `docs/10-reference/dependency-injection.md`
- Features 層: `docs/03-architecture/features-layer.md`
