# 依賴注入策略 (Dependency Injection Strategy)

## 核心理念

**依賴反轉原則 (Dependency Inversion Principle)**:
- 高層模組不應依賴低層模組，兩者都應依賴抽象
- 抽象不應依賴細節，細節應依賴抽象

在本系統中:
```
Core Layer → Infrastructure/Abstractions (介面)
Infrastructure/Firebase → Infrastructure/Abstractions (實作)
```

## app.config.ts 配置

### 應用配置入口

```typescript
// src/app/app.config.ts
import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';

import { environment } from '../environments/environment';
import { routes } from './app.routes';

// Provider 模組
import { FOUNDATION_PROVIDERS } from './core/foundation/providers';
import { GOVERNANCE_PROVIDERS } from './core/governance/providers';
import { OBSERVABILITY_PROVIDERS } from './core/observability/providers';

// 基礎設施綁定
import { REPOSITORY_TOKEN } from './infrastructure/abstractions/repository';
import { FirestoreRepositoryFactory } from './infrastructure/firebase/repositories/firestore-repository-factory';
import { EVENT_STORE_TOKEN } from './infrastructure/abstractions/event-store';
import { FirestoreEventStore } from './infrastructure/observability/event-store';
import { AUTH_TOKEN } from './infrastructure/abstractions/auth';
import { FirebaseAuthAdapter } from './infrastructure/firebase/auth.adapter';

export const appConfig: ApplicationConfig = {
  providers: [
    // 路由
    provideRouter(routes),
    
    // Firebase 初始化
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    
    // 核心系統 Providers
    ...FOUNDATION_PROVIDERS,      // Identity, Base DDD
    ...GOVERNANCE_PROVIDERS,       // Authorization, Contract
    ...OBSERVABILITY_PROVIDERS,    // Event Bus, Causal Tracker
    
    // 基礎設施綁定 (Dependency Inversion)
    {
      provide: REPOSITORY_TOKEN,
      useClass: FirestoreRepositoryFactory
    },
    {
      provide: EVENT_STORE_TOKEN,
      useClass: FirestoreEventStore
    },
    {
      provide: AUTH_TOKEN,
      useClass: FirebaseAuthAdapter
    }
  ]
};
```

## 模式詳解

### 1. Abstraction First (抽象優先)

**定義介面 Token**:
```typescript
// infrastructure/abstractions/repository.ts
import { InjectionToken } from '@angular/core';

export interface IRepository<T> {
  findById(id: EntityId): Promise<Result<T, NotFoundError>>;
  save(entity: T): Promise<Result<void, SaveError>>;
  delete(id: EntityId): Promise<Result<void, DeleteError>>;
}

export const REPOSITORY_TOKEN = new InjectionToken<IRepository<any>>(
  'IRepository'
);
```

**Core 層使用抽象**:
```typescript
// core/some-service.ts
import { inject } from '@angular/core';
import { REPOSITORY_TOKEN } from '@infrastructure/abstractions/repository';

export class SomeService {
  private repository = inject(REPOSITORY_TOKEN);
  
  async doSomething(id: EntityId) {
    const result = await this.repository.findById(id);
    // ...
  }
}
```

### 2. Provider Binding (提供者綁定)

**具體實作**:
```typescript
// infrastructure/firebase/repositories/firestore-repository.ts
export class FirestoreRepository<T> implements IRepository<T> {
  constructor(
    private firestore: Firestore,
    private collectionName: string
  ) {}
  
  async findById(id: EntityId): Promise<Result<T, NotFoundError>> {
    const docRef = doc(this.firestore, this.collectionName, id.toString());
    const snapshot = await getDoc(docRef);
    
    if (!snapshot.exists()) {
      return Result.err(new NotFoundError(id));
    }
    
    return Result.ok(snapshot.data() as T);
  }
  
  // ...
}
```

**綁定配置**:
```typescript
// app.config.ts
{
  provide: REPOSITORY_TOKEN,
  useClass: FirestoreRepository
}
```

### 3. inject() Function (Angular 20 優先)

**傳統方式** (Constructor Injection):
```typescript
// ❌ 舊式寫法 (仍可用，但不推薦)
export class OldStyleService {
  constructor(
    @Inject(REPOSITORY_TOKEN) private repository: IRepository<any>
  ) {}
}
```

**現代方式** (inject() function):
```typescript
// ✅ 推薦寫法 (Angular 14+)
import { inject } from '@angular/core';

export class ModernService {
  private repository = inject(REPOSITORY_TOKEN);
  private eventBus = inject(EventBusService);
  
  // 更簡潔、更靈活
}
```

## 多層次 Provider 組織

### Foundation Providers

```typescript
// core/foundation/providers.ts
import { Provider } from '@angular/core';
import { IdGeneratorService } from './identity/id-generator.service';

export const FOUNDATION_PROVIDERS: Provider[] = [
  IdGeneratorService
  // 其他 Foundation 服務
];
```

### Governance Providers

```typescript
// core/governance/providers.ts
import { Provider } from '@angular/core';
import { AuthorizationService } from './authorization/authorization.service';
import { ContractVersionService } from './contract/contract-version.service';

export const GOVERNANCE_PROVIDERS: Provider[] = [
  AuthorizationService,
  ContractVersionService
];
```

### Observability Providers

```typescript
// core/observability/providers.ts
import { Provider } from '@angular/core';
import { EventBusService } from './events/event-bus.service';
import { CausalTrackerService } from './events/causal-tracker.service';

export const OBSERVABILITY_PROVIDERS: Provider[] = [
  EventBusService,
  CausalTrackerService
];
```

## 環境特定配置

### Development Environment

```typescript
// environments/environment.ts
export const environment = {
  production: false,
  firebase: {
    apiKey: 'dev-api-key',
    authDomain: 'ng-lin-dev.firebaseapp.com',
    projectId: 'ng-lin-dev',
    storageBucket: 'ng-lin-dev.appspot.com',
    messagingSenderId: '123456789',
    appId: '1:123456789:web:abcdef'
  }
};
```

### Production Environment

```typescript
// environments/environment.prod.ts
export const environment = {
  production: true,
  firebase: {
    apiKey: 'prod-api-key',
    authDomain: 'ng-lin-prod.firebaseapp.com',
    projectId: 'ng-lin-prod',
    storageBucket: 'ng-lin-prod.appspot.com',
    messagingSenderId: '987654321',
    appId: '1:987654321:web:fedcba'
  }
};
```

## Feature-Level DI

### Feature Providers

```typescript
// features/domains/issue/providers.ts
import { Provider } from '@angular/core';
import { IssueRepository } from './infrastructure/repositories/issue.repository';
import { IssueCommandService } from './application/issue-command.service';

export const ISSUE_PROVIDERS: Provider[] = [
  IssueRepository,
  IssueCommandService
];
```

### Feature Module 配置

```typescript
// features/domains/issue/issue.routes.ts
import { Routes } from '@angular/router';
import { ISSUE_PROVIDERS } from './providers';

export const ISSUE_ROUTES: Routes = [
  {
    path: '',
    providers: ISSUE_PROVIDERS,  // Feature-scoped providers
    children: [
      { path: '', component: IssueListComponent },
      { path: ':id', component: IssueDetailComponent }
    ]
  }
];
```

## 測試中的 DI

### Mock Providers

```typescript
// issue.repository.spec.ts
import { TestBed } from '@angular/core/testing';
import { REPOSITORY_TOKEN } from '@infrastructure/abstractions/repository';

describe('IssueRepository', () => {
  let repository: IRepository<Issue>;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: REPOSITORY_TOKEN,
          useValue: {
            findById: jasmine.createSpy('findById'),
            save: jasmine.createSpy('save')
          }
        }
      ]
    });
    
    repository = TestBed.inject(REPOSITORY_TOKEN);
  });
  
  it('should inject mock repository', () => {
    expect(repository).toBeDefined();
  });
});
```

## DI 優勢

### 1. 可測試性
```typescript
// 輕鬆替換為 Mock
TestBed.configureTestingModule({
  providers: [
    { provide: AUTH_TOKEN, useValue: mockAuth }
  ]
});
```

### 2. 可擴展性
```typescript
// 切換實作無需修改業務邏輯
{
  provide: REPOSITORY_TOKEN,
  useClass: SupabaseRepository  // 從 FirestoreRepository 切換
}
```

### 3. 解耦
```typescript
// Core 層完全不知道 Firebase 存在
export class AuthorizationService {
  private auth = inject(AUTH_TOKEN);  // 抽象介面
}
```

## 最佳實踐

✅ **DO**:
- 使用 `inject()` 函數 (Angular 20)
- 定義清晰的抽象介面
- 組織 Providers 為邏輯模組
- 在 Feature 層使用 scoped providers

❌ **DON'T**:
- 在 Core 層直接 inject Firebase 服務
- 使用 `any` 類型的 Token
- 在多處重複定義相同 Provider
- 忘記在測試中提供 Mock

---

**參考文檔**:
- 架構規則: `docs/ARCHITECTURE_RULES.md` (Rule #9)
- 分層模型: `docs/03-architecture/layering-model.md`
- 技術棧: `docs/03-architecture/tech-stack.md`
