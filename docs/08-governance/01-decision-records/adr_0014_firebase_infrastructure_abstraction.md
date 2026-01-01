# ADR-0014: Firebase 基礎設施抽象化策略

## Status
✅ Accepted (2025-12-31)

## Context (事實)
ng-lin 專案使用 Firebase 作為後端基礎設施，包括：
- Firestore (Event Store / Database)
- Firebase Authentication (身份驗證)
- Firebase Storage (檔案儲存)
- Firebase Functions (Serverless 運算)

**現有實施**：
- `@angular/fire` 20.0.1
- `src/app/infrastructure/firebase/` 完整的 Firebase 適配器
- 抽象介面定義在 `src/app/core/infrastructure/`

**問題**：
- 沒有明確的抽象化策略文件
- Firebase 依賴可能滲透到 Domain 層
- 未來切換後端的成本不明確

## Decision

### 核心決策：Firebase 僅作為 Infrastructure 實現，Domain 層完全無感知

#### 1️⃣ 六角架構（Ports & Adapters）

```
Domain Layer (Core)
    ↓ depends on
Interface/Port (抽象)
    ↑ implements
Adapter (Firebase 實現)
```

**原則**：
- Domain 只依賴抽象介面
- Firebase 實現在 Infrastructure 層
- 切換後端只需替換 Adapter

#### 2️⃣ 抽象介面定義

##### Event Store 抽象
```typescript
// src/app/core/infrastructure/event-store/event-store.interface.ts
export interface IEventStore {
  append<T>(event: DomainEvent<T>): Promise<Result<void, InfrastructureError>>;
  getEvents(aggregateId: string): Promise<Result<DomainEvent[], InfrastructureError>>;
  getEventsSince(timestamp: number): Promise<Result<DomainEvent[], InfrastructureError>>;
  subscribe(callback: (event: DomainEvent) => void): Subscription;
}

// src/app/infrastructure/firebase/event-store/firebase-event-store.adapter.ts
export class FirebaseEventStoreAdapter implements IEventStore {
  constructor(private firestore: Firestore) {}

  async append<T>(event: DomainEvent<T>): Promise<Result<void, InfrastructureError>> {
    try {
      await this.firestore.collection('events').add(event);
      return ok(undefined);
    } catch (error) {
      return err(ErrorFactory.infrastructure.databaseQuery('append', error));
    }
  }
}
```

##### Authentication 抽象
```typescript
// src/app/core/infrastructure/auth/auth-provider.interface.ts
export interface IAuthProvider {
  signIn(email: string, password: string): Promise<Result<User, InfrastructureError>>;
  signOut(): Promise<Result<void, InfrastructureError>>;
  getCurrentUser(): Result<User | null, InfrastructureError>;
  onAuthStateChanged(callback: (user: User | null) => void): Subscription;
}

// src/app/infrastructure/firebase/auth/firebase-auth.adapter.ts
export class FirebaseAuthAdapter implements IAuthProvider {
  constructor(private auth: Auth) {}
  // Implementation...
}
```

##### Storage 抽象
```typescript
// src/app/core/infrastructure/storage/storage.interface.ts
export interface IStorage {
  upload(path: string, file: File): Promise<Result<string, InfrastructureError>>;
  download(path: string): Promise<Result<Blob, InfrastructureError>>;
  delete(path: string): Promise<Result<void, InfrastructureError>>;
  getUrl(path: string): Result<string, InfrastructureError>;
}

// src/app/infrastructure/firebase/storage/firebase-storage.adapter.ts
export class FirebaseStorageAdapter implements IStorage {
  constructor(private storage: Storage) {}
  // Implementation...
}
```

#### 3️⃣ Dependency Injection 配置

```typescript
// src/app/infrastructure/firebase/config/firebase.providers.ts
export const FIREBASE_PROVIDERS = [
  // Event Store
  {
    provide: 'IEventStore',
    useClass: FirebaseEventStoreAdapter
  },
  // Auth
  {
    provide: 'IAuthProvider',
    useClass: FirebaseAuthAdapter
  },
  // Storage
  {
    provide: 'IStorage',
    useClass: FirebaseStorageAdapter
  }
];

// Domain/Application 層使用
export class TaskService {
  constructor(
    @Inject('IEventStore') private eventStore: IEventStore  // 抽象！
  ) {}
}
```

#### 4️⃣ Firebase 配置集中管理

```typescript
// src/app/infrastructure/firebase/config/firebase.config.ts
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// 從環境變數載入
export const FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: environment.firebase.apiKey,
  authDomain: environment.firebase.authDomain,
  projectId: environment.firebase.projectId,
  storageBucket: environment.firebase.storageBucket,
  messagingSenderId: environment.firebase.messagingSenderId,
  appId: environment.firebase.appId
};
```

#### 5️⃣ 切換後端的策略

**Phase 1: 新增替代實現**
```typescript
// src/app/infrastructure/supabase/event-store/supabase-event-store.adapter.ts
export class SupabaseEventStoreAdapter implements IEventStore {
  // 實現相同介面
}
```

**Phase 2: 切換 DI 配置**
```typescript
// firebase.providers.ts → supabase.providers.ts
export const SUPABASE_PROVIDERS = [
  {
    provide: 'IEventStore',
    useClass: SupabaseEventStoreAdapter  // 替換實現
  }
];
```

**Phase 3: 部署與驗證**
- A/B Testing
- 逐步遷移
- 監控效能與錯誤

## Rationale (為什麼)

### 為何選擇 Firebase？

| 優勢 | 說明 |
|-----|------|
| **快速啟動** | 無需自建後端，專注業務邏輯 |
| **Event Sourcing 支援** | Firestore 支援 real-time subscription，適合事件流 |
| **Serverless** | 自動擴展，無需管理伺服器 |
| **整合度高** | Angular Fire 提供完整整合 |
| **成本可控** | Pay-as-you-go，初期成本低 |

### 為何需要抽象化？

#### 不抽象的風險
```typescript
// ❌ BAD: Domain 層直接依賴 Firebase
export class TaskAggregate {
  async save() {
    const firestore = getFirestore();  // 直接依賴！
    await firestore.collection('tasks').add(this);
  }
}

// 問題：
// 1. Domain 層被污染
// 2. 無法單元測試（需要真實 Firebase）
// 3. 切換後端需要改 Domain 層
```

#### 抽象的優勢
```typescript
// ✅ GOOD: Domain 層依賴抽象
export class TaskService {
  constructor(
    @Inject('IEventStore') private eventStore: IEventStore
  ) {}

  async saveTask(task: Task): Promise<Result<void, ApplicationError>> {
    const event = new TaskCreatedEvent(task);
    return await this.eventStore.append(event);
  }
}

// 優勢：
// 1. Domain 層乾淨
// 2. 可用 Mock 測試
// 3. 切換後端不影響 Domain
```

### Firebase 的限制與應對

| 限制 | 應對策略 |
|-----|---------|
| **鎖定風險** | 抽象介面 + Adapter 模式 |
| **查詢限制** | 複雜查詢用 Projection + CQRS |
| **成本增長** | 監控使用量，設定 Budget Alert |
| **Offline 限制** | 使用 Firestore Offline Persistence |
| **Schema 演化** | Event Versioning (ADR-0001) |

### 對比其他方案

| 方案 | 優點 | 缺點 | 決策 |
|-----|------|------|------|
| **Firebase** | 快速、Serverless、Real-time | 鎖定風險、查詢限制 | ✅ 採用（with 抽象） |
| **Supabase** | 開源、PostgreSQL、更彈性 | 需自建或託管 | ⚠️ 備選 |
| **AWS DynamoDB** | 極高擴展性 | 學習曲線、成本高 | ❌ 不適合初期 |
| **自建 PostgreSQL** | 完全控制 | 運維成本高 | ❌ 不適合 MVP |
| **MongoDB Atlas** | 文件型、彈性 | 不支援 ACID、鎖定 | ❌ 不適合 Event Sourcing |

## Consequences (後果)

### 正面影響
- **快速開發**：無需自建後端，專注業務
- **可替換性**：抽象介面保證未來可切換
- **可測試性**：Mock 實現易於單元測試
- **關注點分離**：Domain 層不被基礎設施污染
- **Real-time 支援**：Firestore subscription 支援事件流

### 負面影響
- **抽象層開銷**：需維護介面與實現
- **學習曲線**：團隊需理解 Ports & Adapters
- **初期複雜**：相比直接用 Firebase SDK 更繁瑣
- **效能損耗**：抽象層有輕微效能成本（可忽略）

### 對 L0/L1/L2 的影響
- **L0 (Core)**：定義抽象介面（IEventStore, IAuthProvider, IStorage）
- **L1 (Infrastructure)**：實現 Firebase Adapter
- **L2 (Features)**：透過 DI 使用抽象介面，對 Firebase 無感知

### Firebase 使用指南

#### ✅ 適合用 Firebase 的場景
- Event Store（事件持久化）
- Real-time Subscription（事件流訂閱）
- Authentication（使用者認證）
- File Storage（檔案上傳/下載）
- Serverless Functions（輕量計算）

#### ❌ 不適合用 Firebase 的場景
- 複雜 SQL Join 查詢（用 Projection）
- Transaction 跨多個 Collection（用 Saga）
- 大量計算（用專門的運算服務）
- 批次處理（用 Cloud Functions + Pub/Sub）

### 切換成本評估

#### 從 Firebase 切換到 Supabase
| 項目 | 工作量 | 說明 |
|-----|--------|------|
| Event Store Adapter | 2-3 天 | 實現 SupabaseEventStoreAdapter |
| Auth Adapter | 1-2 天 | 實現 SupabaseAuthAdapter |
| Storage Adapter | 1 天 | 實現 SupabaseStorageAdapter |
| 測試與驗證 | 2-3 天 | 整合測試、效能測試 |
| **總計** | **1-2 週** | 假設介面穩定 |

#### 從 Firebase 切換到自建 PostgreSQL
| 項目 | 工作量 | 說明 |
|-----|--------|------|
| Event Store Adapter | 3-5 天 | SQL schema + Adapter |
| Auth Adapter | 2-3 天 | JWT + Session 管理 |
| Storage Adapter | 2 天 | S3 或 MinIO |
| 基礎設施 | 5-7 天 | Docker, K8s, Monitoring |
| **總計** | **3-4 週** | 需運維經驗 |

## Follow-up / Tracking (追蹤)

### 實施檢查點
- [x] Firebase 配置完成
- [x] 抽象介面定義完成
- [x] Firebase Adapter 實現完成
- [x] DI 配置完成
- [ ] 團隊培訓（抽象化原則）
- [ ] 效能基準測試
- [ ] 成本監控 Dashboard
- [ ] 備選方案 PoC（Supabase）

### 抽象介面清單

| 介面 | 用途 | Firebase 實現 | 狀態 |
|-----|------|--------------|------|
| `IEventStore` | 事件持久化 | FirebaseEventStoreAdapter | ✅ |
| `IAuthProvider` | 身份驗證 | FirebaseAuthAdapter | ✅ |
| `IStorage` | 檔案儲存 | FirebaseStorageAdapter | ✅ |
| `IFunctions` | Serverless 運算 | FirebaseFunctionsAdapter | ✅ |
| `IPubSub` | 訊息佇列 | - | ⚠️ 待實施 |

### Firebase 配置最佳實踐

```typescript
// ✅ GOOD: 環境變數
const firebaseConfig = {
  apiKey: process.env['FIREBASE_API_KEY'],
  projectId: process.env['FIREBASE_PROJECT_ID'],
  // ...
};

// ❌ BAD: 硬編碼
const firebaseConfig = {
  apiKey: 'AIzaSyD...',  // 洩漏風險！
  projectId: 'my-project',
  // ...
};
```

### 監控與警報

```typescript
// Firebase 使用量監控
export interface FirebaseUsageMetrics {
  reads: number;
  writes: number;
  deletes: number;
  storageUsed: number;  // bytes
  bandwidthUsed: number;  // bytes
  functionInvocations: number;
}

// 成本警報閾值
export const USAGE_THRESHOLDS = {
  dailyReads: 50000,
  dailyWrites: 20000,
  storageGB: 1,
  bandwidthGB: 10
};
```

### 重新檢視時機
- 每季度 review Firebase 成本與效能
- 當月度成本超過預算 20% 時
- 當查詢效能無法滿足需求時
- 當需要更複雜的查詢或交易時
- 當團隊規模與技術能力提升時

### 相關 ADR
- ADR-0001: Event Versioning Strategy
- ADR-0007: Event Sourcing 不適用場景
- ADR-0013: Result Pattern Error Handling
- ADR-0015: Testing Strategy & Quality Gates (待建立)

---

**實施程度**: 100% (已實施)
**參考文件**: 
- `src/app/infrastructure/firebase/`
- `src/app/core/infrastructure/`
- `firebase.json`
