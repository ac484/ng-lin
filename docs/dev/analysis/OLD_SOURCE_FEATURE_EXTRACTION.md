# 舊專案功能提取分析報告
# Old Source Feature Extraction Analysis

**Generated Date**: 2025-12-30  
**Analysis Target**: `/old/src-old` directory  
**Current Project**: `ng-lin` Angular 20 application

---

## 執行摘要 / Executive Summary

本文檔分析 `old/src-old` 中有價值的功能，評估它們與當前專案架構的相容性，並提供整合建議。

This document analyzes valuable features in `old/src-old`, evaluates their compatibility with the current project architecture, and provides integration recommendations.

### 關鍵發現 / Key Findings

1. **Event Bus System**: 複雜的生命週期式事件架構，當前專案僅有基礎實作
2. **Multi-Tenant System**: 完整的租戶管理系統，當前專案尚未實作
3. **Three-Layer Model**: Facade 模式的三層架構，與當前 DDD 架構部分重疊
4. **Audit System**: 完整的審計日誌系統，當前專案缺少
5. **Shared Utilities**: 實用的輔助工具，特別是 `async-state` 與 Angular 20 Signals 完美契合

---

## 詳細功能分析 / Detailed Feature Analysis

### 1. Event Bus System (事件匯流排系統)

#### 舊專案實作概述

```
old/src-old/app/core/event-bus/
├── lifecycle/                     # 事件生命週期
│   ├── creation/                  # 階段1: 事件創建
│   │   ├── base-event.ts
│   │   ├── event-envelope.ts
│   │   ├── event-metadata.ts
│   │   ├── event-identifier.service.ts
│   │   └── event-serializer.service.ts
│   ├── validation/                # 階段2: 驗證
│   │   ├── event-validator.service.ts
│   │   ├── tenant-validation-middleware.service.ts
│   │   └── identity-context-middleware.service.ts
│   ├── dispatch/                  # 階段3: 分發
│   │   ├── event-bus.interface.ts
│   │   ├── implementations/
│   │   │   ├── in-memory/
│   │   │   ├── firebase/
│   │   │   └── hybrid/
│   ├── handling/                  # 階段4: 處理
│   │   ├── event-handler.decorator.ts
│   │   ├── subscribe.decorator.ts
│   │   ├── consumers/
│   │   │   ├── notification.consumer.ts
│   │   │   ├── audit-log.consumer.ts
│   │   │   ├── analytics.consumer.ts
│   │   │   └── auth-event.consumer.ts
│   ├── resilience/                # 階段5: 彈性處理
│   │   ├── retry-manager.service.ts
│   │   ├── dead-letter-queue.service.ts
│   │   └── retry.decorator.ts
│   ├── persistence/               # 階段6: 持久化
│   │   ├── event-store.interface.ts
│   │   ├── event-replay.service.ts
│   │   ├── implementations/
│   │   │   └── storage/
│   │   │       ├── firestore-storage.strategy.ts
│   │   │       └── inmemory-storage.strategy.ts
│   │   └── versioning/            # 事件版本管理
│   │       ├── event-upcaster.base.ts
│   │       ├── upcaster-chain.ts
│   │       └── version-migration.service.ts
│   └── testing/                   # 測試工具
│       ├── mock-event-bus.ts
│       └── event-bus-test.utils.ts
├── domain/                        # 領域事件
├── audit/                         # 審計系統
├── analysis/                      # 事件分析
└── facade.ts                      # Facade API
```

#### 當前專案狀態

```
src/app/core/event-system/
├── models/
│   ├── base-event.model.ts       # 基礎事件模型
│   └── event-types.ts
└── services/
    └── event-bus.service.ts      # 簡單的事件匯流排
```

#### 價值評估

| 功能 | 價值 | 優先級 | 整合難度 |
|-----|------|--------|----------|
| 生命週期架構 | ⭐⭐⭐⭐⭐ | High | Medium |
| Event Versioning | ⭐⭐⭐⭐ | Medium | High |
| Resilience (Retry/DLQ) | ⭐⭐⭐⭐⭐ | High | Medium |
| Multiple Implementations | ⭐⭐⭐ | Low | Low |
| Testing Utilities | ⭐⭐⭐⭐ | Medium | Low |
| Audit Integration | ⭐⭐⭐⭐⭐ | High | Medium |

#### 整合建議

**推薦提取的功能：**

1. **Resilience Layer** (彈性層)
   - `retry-manager.service.ts` - 重試管理
   - `dead-letter-queue.service.ts` - 死信隊列
   - `retry.decorator.ts` - 重試裝飾器

2. **Event Persistence** (事件持久化)
   - `event-store.interface.ts` - 事件存儲接口
   - `event-replay.service.ts` - 事件重放服務
   - Firestore storage strategy

3. **Testing Utilities** (測試工具)
   - `mock-event-bus.ts` - 模擬事件匯流排
   - `event-bus-test.utils.ts` - 測試工具

**整合策略：**

```typescript
// 新架構整合點
src/app/core/event-system/
├── models/                        # 保持現有
├── services/
│   ├── event-bus.service.ts       # 保持現有
│   ├── event-store.service.ts     # 新增：從 old 提取
│   ├── event-replay.service.ts    # 新增：從 old 提取
│   └── retry-manager.service.ts   # 新增：從 old 提取
├── resilience/                    # 新增：從 old 提取
│   ├── retry.decorator.ts
│   └── dead-letter-queue.service.ts
└── testing/                       # 新增：從 old 提取
    ├── mock-event-bus.ts
    └── test-utils.ts
```

---

### 2. Multi-Tenant System (多租戶系統)

#### 舊專案實作概述

```
old/src-old/app/core/
├── models/
│   ├── multi-tenant-types.model.ts
│   └── organization.model.ts
├── services/
│   └── tenant/
│       └── tenant-context.service.ts
├── guards/
│   └── tenant.guard.ts
└── interceptors/
    └── context.interceptor.ts
```

#### 當前專案狀態

當前專案**沒有**多租戶系統實作。

#### 價值評估

| 功能 | 價值 | 優先級 | 整合難度 |
|-----|------|--------|----------|
| Tenant Context Service | ⭐⭐⭐⭐⭐ | High | Low |
| Tenant Guard | ⭐⭐⭐⭐ | High | Low |
| Multi-Tenant Models | ⭐⭐⭐⭐ | Medium | Low |
| Context Interceptor | ⭐⭐⭐ | Medium | Medium |

#### 整合建議

**推薦提取的功能：**

1. **Core Multi-Tenancy**
   - `tenant-context.service.ts` - 租戶上下文管理
   - `multi-tenant-types.model.ts` - 租戶類型定義
   - `organization.model.ts` - 組織模型

2. **Guards & Interceptors**
   - `tenant.guard.ts` - 租戶路由守衛
   - `context.interceptor.ts` - 上下文攔截器

**整合策略：**

```typescript
// 新架構整合點
src/app/core/
├── identity/                      # 現有
│   └── multi-tenancy/            # 新增
│       ├── models/
│       │   ├── tenant-context.model.ts
│       │   └── organization.model.ts
│       ├── services/
│       │   └── tenant-context.service.ts
│       └── guards/
│           └── tenant.guard.ts
└── infrastructure/                # 現有
    └── http/                      # 新增
        └── interceptors/
            └── tenant-context.interceptor.ts
```

**注意事項：**
- 需要與當前 Identity 系統整合
- 需要確保 Firebase 安全規則支援多租戶
- 考慮是否所有功能都需要多租戶支援

---

### 3. Three-Layer Model (三層模型)

#### 舊專案實作概述

```
old/src-old/app/core/three-layer-model/
├── facade/
│   └── three-layer.facade.ts
├── models/
│   ├── layer-types.ts
│   └── result.type.ts
├── repositories/
│   ├── base.repository.ts
│   ├── construction-events.repository.ts
│   ├── derived-state.repository.ts
│   └── governance.repository.ts
├── services/
│   ├── policy-validation.service.ts
│   └── workflow-orchestrator.service.ts
└── ui/
    └── event-creation-form.component.ts
```

#### 當前專案狀態

當前專案已經有類似的分層架構：

```
src/app/core/
├── foundation/
│   └── base/
│       └── base.repository.ts
├── governance/
│   ├── authorization/
│   └── contract/
└── infrastructure/
    └── abstractions/
```

#### 價值評估

| 功能 | 價值 | 優先級 | 整合難度 |
|-----|------|--------|----------|
| Three-Layer Facade | ⭐⭐⭐ | Low | High |
| Layer Types Model | ⭐⭐ | Low | Medium |
| Policy Validation Service | ⭐⭐⭐⭐ | Medium | Medium |
| Workflow Orchestrator | ⭐⭐⭐⭐ | Medium | High |
| Base Repository | ⭐⭐ | Low | Low (已存在) |

#### 整合建議

**推薦提取的功能：**

1. **Policy Validation**
   - `policy-validation.service.ts` - 政策驗證服務
   - 可整合到當前 `governance/` 系統

2. **Workflow Orchestration**
   - `workflow-orchestrator.service.ts` - 工作流程編排
   - 可作為獨立的業務邏輯層服務

**不推薦提取：**
- `three-layer.facade.ts` - 與當前架構理念不同
- `layer-types.ts` - 特定於舊專案的領域模型
- `result.type.ts` - 當前專案已有更完善的 Result 模式

**整合策略：**

```typescript
// 整合到現有 governance 系統
src/app/core/governance/
├── authorization/                 # 現有
├── contract/                      # 現有
├── validation/                    # 新增
│   └── policy-validation.service.ts
└── workflow/                      # 新增
    └── workflow-orchestrator.service.ts
```

---

### 4. Audit System (審計系統)

#### 舊專案實作概述

```
old/src-old/app/core/
├── audit/
│   ├── audit-event.model.ts
│   ├── audit-log.service.ts
│   ├── audit-collector.service.ts
│   ├── audit-auto-subscription.service.ts
│   └── auditable.decorator.ts
└── event-bus/audit/               # 與事件系統整合
    ├── audit-event.model.ts
    ├── audit-log.consumer.ts
    └── audit-collector.service.ts
```

#### 當前專案狀態

當前專案**沒有**專門的審計系統。

#### 價值評估

| 功能 | 價值 | 優先級 | 整合難度 |
|-----|------|--------|----------|
| Audit Event Model | ⭐⭐⭐⭐⭐ | High | Low |
| Audit Log Service | ⭐⭐⭐⭐⭐ | High | Low |
| Audit Collector | ⭐⭐⭐⭐ | Medium | Medium |
| Auditable Decorator | ⭐⭐⭐⭐⭐ | High | Low |
| Auto-Subscription | ⭐⭐⭐ | Low | Medium |

#### 整合建議

**推薦提取的功能：**

1. **Core Audit System**
   - `audit-event.model.ts` - 審計事件模型
   - `audit-log.service.ts` - 審計日誌服務
   - `auditable.decorator.ts` - 可審計裝飾器

2. **Event Bus Integration**
   - `audit-log.consumer.ts` - 審計日誌消費者
   - `audit-collector.service.ts` - 審計收集器

**整合策略：**

```typescript
// 新架構整合點
src/app/core/observability/
├── logging/                       # 現有
└── audit/                         # 新增
    ├── models/
    │   └── audit-event.model.ts
    ├── services/
    │   ├── audit-log.service.ts
    │   └── audit-collector.service.ts
    ├── decorators/
    │   └── auditable.decorator.ts
    └── consumers/
        └── audit-log.consumer.ts
```

**使用範例：**

```typescript
import { Auditable } from '@core/observability/audit';

@Injectable()
export class UserService {
  @Auditable({
    action: 'user.created',
    resourceType: 'User',
    includeResult: true
  })
  async createUser(data: CreateUserDto): Promise<Result<User, Error>> {
    // 實作...
  }
}
```

---

### 5. Shared Components (共享元件)

#### 舊專案實作概述

```
old/src-old/app/shared/components/
├── breadcrumb/
│   └── breadcrumb.component.ts
├── create-organization/
│   └── create-organization.component.ts
├── create-team-modal/
│   └── create-team-modal.component.ts
├── edit-team-modal/
│   └── edit-team-modal.component.ts
└── team-detail-drawer/
    └── team-detail-drawer.component.ts
```

#### 當前專案狀態

```
src/app/shared-ui/components/
├── (minimal components)
```

#### 價值評估

| 元件 | 價值 | 優先級 | 整合難度 |
|-----|------|--------|----------|
| Breadcrumb | ⭐⭐⭐ | Low | Low |
| Organization Management | ⭐⭐⭐⭐ | Medium | Medium |
| Team Management | ⭐⭐⭐⭐ | Medium | Medium |

#### 整合建議

**條件提取：**

這些元件是否提取取決於當前專案是否需要：
1. 組織管理功能
2. 團隊管理功能
3. 麵包屑導航

如果需要，建議：
1. 更新為 Angular 20 standalone components
2. 使用 Signals 替代 RxJS where appropriate
3. 整合當前的設計系統 (ng-zorro-antd, @delon)

---

### 6. Shared Utilities (共享工具)

#### 舊專案實作概述

```
old/src-old/app/shared/utils/
├── async-state.ts                 # 異步狀態管理
└── index.ts
```

#### `async-state.ts` 功能

```typescript
/**
 * AsyncState Utility for Angular 20 Signals
 * 提供統一的異步操作管理模式
 */
export interface AsyncStateManager<T> {
  readonly state: Signal<AsyncState<T>>;
  readonly data: Signal<T | null>;
  readonly loading: Signal<boolean>;
  readonly error: Signal<Error | null>;
  readonly success: Signal<boolean>;
  load(promise: Promise<T>): Promise<void>;
  reset(): void;
  setData(data: T): void;
}

export function createAsyncState<T>(initialData: T | null = null): AsyncStateManager<T>
```

#### 價值評估

| 工具 | 價值 | 優先級 | 整合難度 |
|-----|------|--------|----------|
| async-state | ⭐⭐⭐⭐⭐ | High | Very Low |

#### 整合建議

**強烈推薦提取！**

這個工具與 Angular 20 Signals 完美契合，可以立即使用：

```typescript
// 整合位置
src/app/shared-ui/utils/
└── async-state.ts                 # 直接複製
```

**使用範例：**

```typescript
@Component({
  selector: 'app-user-list',
  standalone: true,
  template: `
    @if (usersState.loading()) {
      <nz-spin />
    } @else if (usersState.error()) {
      <nz-alert [nzMessage]="usersState.error()?.message" />
    } @else {
      <nz-table [nzData]="usersState.data() ?? []">
        <!-- table content -->
      </nz-table>
    }
  `
})
export class UserListComponent {
  private userService = inject(UserService);
  
  usersState = createAsyncState<User[]>([]);
  
  ngOnInit() {
    this.loadUsers();
  }
  
  async loadUsers() {
    await this.usersState.load(
      firstValueFrom(this.userService.getUsers())
    );
  }
}
```

---

### 7. Guards & Interceptors (守衛與攔截器)

#### 舊專案實作概述

```
old/src-old/app/core/
├── guards/
│   ├── auth.guard.ts
│   ├── permission.guard.ts
│   └── tenant.guard.ts
└── interceptors/
    ├── auth-token.interceptor.ts
    ├── base-url.interceptor.ts
    ├── context.interceptor.ts
    ├── error-handler.interceptor.ts
    └── refresh-token.interceptor.ts
```

#### 當前專案狀態

```
src/app/core/guards/
├── auth.guard.ts
└── (other guards)
```

#### 價值評估

| 功能 | 價值 | 優先級 | 整合難度 |
|-----|------|--------|----------|
| Permission Guard | ⭐⭐⭐⭐⭐ | High | Low |
| Tenant Guard | ⭐⭐⭐⭐ | Medium | Low |
| Context Interceptor | ⭐⭐⭐⭐ | Medium | Low |
| Refresh Token Interceptor | ⭐⭐⭐⭐⭐ | High | Medium |
| Error Handler Interceptor | ⭐⭐⭐⭐ | Medium | Low |

#### 整合建議

**推薦提取的功能：**

1. **Guards**
   - `permission.guard.ts` - 權限守衛
   - `tenant.guard.ts` - 租戶守衛

2. **Interceptors**
   - `refresh-token.interceptor.ts` - Token 刷新攔截器
   - `context.interceptor.ts` - 上下文攔截器
   - `error-handler.interceptor.ts` - 錯誤處理攔截器

**整合策略：**

```typescript
// Guards
src/app/core/guards/
├── auth.guard.ts                  # 現有
├── permission.guard.ts            # 新增
└── tenant.guard.ts                # 新增

// Interceptors
src/app/infrastructure/
└── http/                          # 新增
    └── interceptors/
        ├── refresh-token.interceptor.ts
        ├── tenant-context.interceptor.ts
        └── error-handler.interceptor.ts
```

---

### 8. Firebase Functions (雲端函數)

#### 舊專案實作概述

```
old/src-old/firebase/
├── functions-ai/                  # AI 功能
├── functions-ai-document/         # 文件 OCR
├── functions-auth/                # 認證功能
├── functions-analytics/           # 分析功能
├── functions-calculation/         # 計算功能
├── functions-event/               # 事件處理
├── functions-firestore/           # Firestore 觸發器
├── functions-integration/         # 第三方整合
├── functions-shared/              # 共享代碼
└── functions-storage/             # 存儲功能
```

#### 當前專案狀態

當前專案沒有 Firebase Functions。

#### 價值評估

| 功能 | 價值 | 優先級 | 整合難度 |
|-----|------|--------|----------|
| functions-shared | ⭐⭐⭐⭐ | Medium | Low |
| functions-ai | ⭐⭐⭐ | Low | High |
| functions-ai-document | ⭐⭐⭐⭐ | Medium | Medium |
| functions-auth | ⭐⭐⭐ | Low | Medium |
| functions-firestore | ⭐⭐⭐ | Low | Medium |

#### 整合建議

**條件提取：**

只有在需要後端處理時才考慮提取：

1. **Shared Utilities** (`functions-shared`)
   - 通用的 Firebase Functions 工具
   - 錯誤處理模式
   - 驗證工具

2. **Document Processing** (`functions-ai-document`)
   - OCR 文件處理
   - 如果需要文件自動化處理

**不推薦立即提取：**
- 其他 functions 包含特定業務邏輯
- 需要根據實際需求決定

---

### 9. i18n System (國際化系統)

#### 舊專案實作概述

```
old/src-old/app/core/i18n/
└── i18n.service.ts

old/src-old/assets/tmp/i18n/
├── en-US.json
├── zh-TW.json
└── zh-CN.json
```

#### 當前專案狀態

當前專案使用 `@delon` 的 i18n 支援。

#### 價值評估

| 功能 | 價值 | 優先級 | 整合難度 |
|-----|------|--------|----------|
| i18n Service | ⭐⭐ | Low | Low |
| Translation Files | ⭐⭐⭐ | Low | Very Low |

#### 整合建議

**可選提取：**

1. 翻譯文件可以作為參考
2. i18n service 如果提供比 @delon 更多功能則考慮

當前 @delon 已提供完善的 i18n 支援，建議優先使用現有方案。

---

## 優先級建議 / Priority Recommendations

### 🔴 高優先級 (立即提取)

1. **async-state.ts** - 完美契合 Angular 20 Signals
2. **Audit System** - 提供完整的審計功能
3. **Resilience Layer** (Event Bus) - 重試和錯誤處理機制
4. **Permission Guard** - 權限控制
5. **Refresh Token Interceptor** - Token 管理

### 🟡 中優先級 (考慮提取)

1. **Multi-Tenant System** - 如果需要多租戶支援
2. **Event Persistence** - 事件存儲和重放
3. **Testing Utilities** - 測試輔助工具
4. **Context Interceptor** - 上下文管理
5. **Policy Validation Service** - 政策驗證

### 🟢 低優先級 (可選提取)

1. **Shared Components** - 根據實際需求
2. **Firebase Functions** - 根據後端需求
3. **Three-Layer Facade** - 架構差異較大
4. **i18n Service** - 已有替代方案


## 視覺化架構圖 / Visual Architecture Diagrams

### Feature Extraction Mapping

下圖展示從舊專案到新專案的功能映射關係：

```mermaid src="../diagrams/feature-extraction-map.mmd" alt="Feature Extraction Mapping"```

**圖例說明**:
- 🔴 紅色 = 高優先級功能 (建議立即提取)
- 🟡 黃色 = 中優先級功能 (評估後提取)
- 🟢 綠色 = 新專案目標位置
- 🔵 藍色 = 新專案目標位置 (中優先級)

### Implementation Roadmap

下圖展示三階段實作時程規劃：

```mermaid src="../diagrams/extraction-roadmap.mmd" alt="3-Phase Implementation Roadmap"```

**階段說明**:
- **Phase 1 (Week 1)**: 快速勝利 - 提取零風險高價值工具
- **Phase 2 (Week 2-3)**: 核心增強 - 提取核心系統功能
- **Phase 3 (Week 4+)**: 進階功能 - 根據實際需求提取

---

## 整合路線圖 / Integration Roadmap

### Phase 1: 基礎設施增強 (1-2 weeks)

```typescript
src/app/
├── core/
│   ├── event-system/
│   │   ├── resilience/            # 新增
│   │   ├── persistence/           # 新增
│   │   └── testing/               # 新增
│   └── observability/
│       └── audit/                 # 新增 (完整審計系統)
├── shared-ui/
│   └── utils/
│       └── async-state.ts         # 新增
└── infrastructure/
    └── http/
        └── interceptors/          # 新增
```

**行動項目：**
1. ✅ 提取 `async-state.ts`
2. ✅ 實作審計系統
3. ✅ 新增事件系統彈性層
4. ✅ 新增 HTTP 攔截器

### Phase 2: 進階功能 (2-3 weeks)

```typescript
src/app/core/
├── identity/
│   └── multi-tenancy/             # 新增 (如需要)
├── guards/
│   ├── permission.guard.ts        # 新增
│   └── tenant.guard.ts            # 新增 (如需要)
└── governance/
    ├── validation/                # 新增
    └── workflow/                  # 新增
```

**行動項目：**
1. ⬜ 評估多租戶需求
2. ⬜ 實作權限守衛
3. ⬜ 新增政策驗證
4. ⬜ 新增工作流程編排

### Phase 3: 業務功能 (依需求)

**行動項目：**
1. ⬜ 評估共享元件需求
2. ⬜ 評估 Firebase Functions 需求
3. ⬜ 根據業務需求選擇性提取

---

## 檔案清單 / File Extraction List

### 建議立即提取的檔案

#### 1. Async State Utility
```
Source: old/src-old/app/shared/utils/async-state.ts
Target: src/app/shared-ui/utils/async-state.ts
Changes: None (直接使用)
```

#### 2. Audit System
```
Source Files:
- old/src-old/app/core/audit/audit-event.model.ts
- old/src-old/app/core/audit/audit-log.service.ts
- old/src-old/app/core/audit/auditable.decorator.ts
- old/src-old/app/core/event-bus/audit/audit-log.consumer.ts

Target Location:
- src/app/core/observability/audit/models/audit-event.model.ts
- src/app/core/observability/audit/services/audit-log.service.ts
- src/app/core/observability/audit/decorators/auditable.decorator.ts
- src/app/core/observability/audit/consumers/audit-log.consumer.ts

Changes Required:
- 整合當前 Result 模式
- 整合當前 Event Bus
- 更新導入路徑
```

#### 3. Event Bus Resilience
```
Source Files:
- old/src-old/app/core/event-bus/lifecycle/resilience/retry-manager.service.ts
- old/src-old/app/core/event-bus/lifecycle/resilience/dead-letter-queue.service.ts
- old/src-old/app/core/event-bus/lifecycle/resilience/retry.decorator.ts
- old/src-old/app/core/event-bus/lifecycle/resilience/retry-policy.interface.ts

Target Location:
- src/app/core/event-system/resilience/retry-manager.service.ts
- src/app/core/event-system/resilience/dead-letter-queue.service.ts
- src/app/core/event-system/resilience/retry.decorator.ts
- src/app/core/event-system/resilience/retry-policy.interface.ts

Changes Required:
- 整合當前 Event Bus 架構
- 更新錯誤處理使用 Result 模式
```

#### 4. Permission Guard
```
Source: old/src-old/app/core/guards/permission.guard.ts
Target: src/app/core/guards/permission.guard.ts
Changes Required:
- 整合當前 Identity 系統
- 使用 Angular 20 functional guards
```

#### 5. Refresh Token Interceptor
```
Source: old/src-old/app/core/interceptors/refresh-token.interceptor.ts
Target: src/app/infrastructure/http/interceptors/refresh-token.interceptor.ts
Changes Required:
- 整合當前認證系統
- 使用 Angular 20 functional interceptors
```

---

## 相容性分析 / Compatibility Analysis

### ✅ 高度相容

這些功能可以直接或稍作修改後整合：

1. **async-state.ts** - 直接使用
2. **Testing Utilities** - 直接使用
3. **Audit Models** - 稍作調整
4. **Decorators** - 稍作調整

### ⚠️ 需要適配

這些功能需要根據當前架構調整：

1. **Event Bus** - 整合當前 Event System
2. **Multi-Tenancy** - 整合當前 Identity System
3. **Guards & Interceptors** - 更新為 Angular 20 functional API
4. **Services** - 更新錯誤處理使用 Result 模式

### ❌ 不建議直接提取

這些功能與當前架構差異較大：

1. **Three-Layer Facade** - 架構理念不同
2. **舊的 Result Type** - 已有更完善實作
3. **某些特定業務元件** - 業務邏輯差異

---

## 風險評估 / Risk Assessment

### 技術風險

1. **依賴衝突** - 舊代碼可能依賴不同版本的套件
   - 緩解：逐一檢查並更新依賴
   
2. **架構不匹配** - 某些模式與當前架構不符
   - 緩解：優先提取獨立功能，避免強耦合部分

3. **測試覆蓋** - 提取的代碼需要測試
   - 緩解：同時提取測試工具，編寫單元測試

### 業務風險

1. **功能重複** - 可能與現有功能重疊
   - 緩解：先評估現有功能，避免重複實作

2. **維護負擔** - 增加代碼量和維護成本
   - 緩解：只提取必要功能，保持代碼簡潔

---

## 實作檢查清單 / Implementation Checklist

### Before Extraction
- [ ] 確認功能需求
- [ ] 檢查當前專案是否已有類似功能
- [ ] 評估整合難度和價值
- [ ] 準備測試計劃

### During Extraction
- [ ] 複製源文件到目標位置
- [ ] 更新導入路徑
- [ ] 調整代碼符合當前架構
- [ ] 更新為 Angular 20 最佳實踐
- [ ] 整合 Result 模式
- [ ] 編寫/更新測試

### After Extraction
- [ ] 執行所有測試
- [ ] 更新文檔
- [ ] Code review
- [ ] 確認沒有破壞現有功能
- [ ] 記錄整合決策

---

## 結論與建議 / Conclusion & Recommendations

### 核心建議

1. **立即行動**：提取 `async-state.ts`，它是零風險高回報的工具
2. **優先級排序**：按照 高→中→低 的優先級逐步提取
3. **增量整合**：不要一次性提取所有功能，分階段進行
4. **持續評估**：每個功能提取後評估效果，調整後續計劃

### 長期策略

1. **建立模式庫**：將提取的優秀模式整理成專案標準
2. **文檔化**：為每個提取的功能編寫詳細文檔
3. **測試先行**：確保所有提取的功能都有測試覆蓋
4. **架構一致性**：持續檢查和維護架構一致性

### 預期成果

完成所有高優先級和中優先級功能提取後，專案將獲得：

✅ 完整的審計系統  
✅ 強大的事件處理能力  
✅ 優秀的異步狀態管理  
✅ 完善的權限控制  
✅ (可選) 多租戶支援  
✅ (可選) 工作流程編排  

---

## 附錄 / Appendix

### A. 詳細檔案對照表

| 舊檔案路徑 | 新檔案路徑 | 優先級 | 修改需求 |
|-----------|-----------|--------|---------|
| `old/src-old/app/shared/utils/async-state.ts` | `src/app/shared-ui/utils/async-state.ts` | 🔴 High | None |
| `old/src-old/app/core/audit/audit-event.model.ts` | `src/app/core/observability/audit/models/audit-event.model.ts` | 🔴 High | Minor |
| `old/src-old/app/core/event-bus/lifecycle/resilience/*` | `src/app/core/event-system/resilience/*` | 🔴 High | Medium |
| `old/src-old/app/core/guards/permission.guard.ts` | `src/app/core/guards/permission.guard.ts` | 🔴 High | Medium |
| `old/src-old/app/core/interceptors/refresh-token.interceptor.ts` | `src/app/infrastructure/http/interceptors/refresh-token.interceptor.ts` | 🔴 High | Medium |

### B. 相關文檔

- [當前專案架構](../ARCHITECTURE.md)
- [架構規則](../ARCHITECTURE_RULES.md)
- [Result 模式文檔](../../src/app/core/README.md)

### C. 聯絡資訊

如有疑問或需要協助，請參考專案維護者指南。

---

<small>Generated with GitHub Copilot as directed by the development team</small>
