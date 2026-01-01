# 架構結構對比與遷移指南
# Structural Comparison & Migration Guide

**日期 / Date**: 2025-12-30  
**目的 / Purpose**: 詳細對比 old/src-old 與當前專案的結構差異，提供精確的遷移指導

---

## 執行摘要 / Executive Summary

本文檔提供 **old/src-old** 與 **src/** 之間的詳細結構對比，包括：
- 檔案數量統計 (175 vs 44 核心檔案)
- 目錄結構差異
- 命名慣例變更
- 架構模式演進
- 精確的檔案映射

---

## 📊 統計對比 / Statistics Comparison

### 核心檔案數量 / Core File Count

| 專案 / Project | TypeScript 檔案 | 說明 |
|---------------|----------------|------|
| **old/src-old/app/core/** | 175 files | 複雜的多層架構，包含完整事件系統 |
| **src/app/core/** | 44 files | 精簡的 DDD 架構，專注核心功能 |

**關鍵觀察**:
- 舊專案有 **4 倍**的核心檔案數量
- 當前專案更加精簡和聚焦
- **不能直接全部複製**，必須選擇性提取

---

## 🗂️ 目錄結構對比 / Directory Structure Comparison

### old/src-old/app/core/ 結構詳解

```
old/src-old/app/core/
├── audit/                       (8 files) ⭐ 建議提取
├── event-bus/                   (111 files) ⭐⭐⭐ 部分提取
│   ├── lifecycle/
│   │   ├── creation/           (7 files)
│   │   ├── validation/         (5 files)
│   │   ├── dispatch/           (15 files)
│   │   ├── handling/           (18 files)
│   │   ├── resilience/         (5 files) ⭐⭐⭐ 優先提取
│   │   ├── persistence/        (25 files) ⭐⭐ 可選提取
│   │   └── testing/            (4 files) ⭐⭐ 建議提取
│   ├── domain/                 (10 files)
│   ├── analysis/               (4 files)
│   ├── config/                 (3 files)
│   ├── errors/                 (4 files)
│   └── providers/              (2 files)
├── guards/                      (4 files) ⭐ 部分提取
├── interceptors/                (6 files) ⭐⭐ 建議提取
├── models/                      (8 files) ⭐ 部分已存在
├── services/                    (15 files) ⭐ 選擇性提取
├── three-layer-model/           (20 files) ⚠️ 架構不匹配
└── others...
```

### src/app/core/ 當前結構

```
src/app/core/
├── error/                       (4 files) ✅ 已實作
├── event-system/                (4 files) ⚠️ 基礎實作
│   # 缺少: resilience/, persistence/, testing/
├── foundation/                  (3 files) ✅ 已實作
├── governance/                  (8 files) ✅ 已實作
│   # 可添加: validation/, workflow/
├── guards/                      (2 files) ⚠️ 缺少 permission.guard
├── identity/                    (6 files) ✅ 已實作
│   # 可添加: multi-tenancy/
├── observability/               (2 files) ⚠️ 缺少 audit/
├── result/                      (4 files) ✅ 現代化實作
└── others...
```

---

## 📋 詳細檔案映射表 / Detailed File Mapping

### 🔴 高優先級檔案映射

#### 1. Audit System Files

| 來源檔案 | 目標位置 | 狀態 | 修改需求 |
|---------|---------|------|---------|
| `old/src-old/app/core/audit/audit-event.model.ts` | `src/app/core/observability/audit/models/audit-event.model.ts` | 新增 | ✅ 直接複製 |
| `old/src-old/app/core/audit/audit-log.service.ts` | `src/app/core/observability/audit/services/audit-log.service.ts` | 新增 | ⚠️ Result 模式 |
| `old/src-old/app/core/audit/auditable.decorator.ts` | `src/app/core/observability/audit/decorators/auditable.decorator.ts` | 新增 | ✅ 直接複製 |

**創建命令**:
```bash
mkdir -p src/app/core/observability/audit/{models,services,decorators,consumers}
```

#### 2. Event Resilience Files

| 來源檔案 | 目標位置 | 狀態 | 修改需求 |
|---------|---------|------|---------|
| `old/.../resilience/retry-policy.interface.ts` | `src/app/core/event-system/resilience/retry-policy.interface.ts` | 新增 | ✅ 直接複製 |
| `old/.../resilience/retry-manager.service.ts` | `src/app/core/event-system/resilience/retry-manager.service.ts` | 新增 | ⚠️ Result 模式 |
| `old/.../resilience/retry.decorator.ts` | `src/app/core/event-system/resilience/retry.decorator.ts` | 新增 | ⚠️ 整合事件系統 |
| `old/.../resilience/dead-letter-queue.service.ts` | `src/app/core/event-system/resilience/dead-letter-queue.service.ts` | 新增 | ⚠️ 整合架構 |

**創建命令**:
```bash
mkdir -p src/app/core/event-system/resilience
```

#### 3. Guards & Interceptors

| 來源檔案 | 目標位置 | 狀態 | 修改需求 |
|---------|---------|------|---------|
| `old/.../guards/permission.guard.ts` | `src/app/core/guards/permission.guard.ts` | 新增 | ⚠️ Functional API |
| `old/.../interceptors/refresh-token.interceptor.ts` | `src/app/infrastructure/http/interceptors/refresh-token.interceptor.ts` | 新增 | ⚠️ Functional API |
| `old/.../interceptors/error-handler.interceptor.ts` | `src/app/infrastructure/http/interceptors/error-handler.interceptor.ts` | 新增 | ⚠️ Functional API |

**創建命令**:
```bash
mkdir -p src/app/infrastructure/http/interceptors
```

---

## 🔧 關鍵修改需求說明 / Key Modification Requirements

### 1. Result 模式整合 / Result Pattern Integration

**Before (old project)**:
```typescript
async createUser(data: any): Promise<User> {
  if (!data.email) {
    throw new Error('Email required');
  }
  return await this.repository.save(data);
}
```

**After (current project)**:
```typescript
import { Result, ok, err } from '@core/result';
import { ErrorFactory } from '@core/error';

async createUser(data: any): Promise<Result<User, Error>> {
  if (!data.email) {
    return err(ErrorFactory.validation.required('email'));
  }
  return await this.repository.save(data);
}
```

### 2. Functional Guards (Angular 20)

**Before (old project)**:
```typescript
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private permissionService: PermissionService) {}
  
  canActivate(route: ActivatedRouteSnapshot): boolean {
    const permission = route.data['permission'];
    return this.permissionService.hasPermission(permission);
  }
}
```

**After (current project)**:
```typescript
import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';

export const permissionGuard: CanActivateFn = (route, state) => {
  const permissionService = inject(PermissionService);
  const permission = route.data['permission'];
  return permissionService.hasPermission(permission);
};
```

### 3. Functional Interceptors (Angular 20)

**Before (old project)**:
```typescript
@Injectable()
export class RefreshTokenInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}
  
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req).pipe(
      catchError(err => {
        if (err.status === 401) {
          return this.authService.refreshToken().pipe(
            switchMap(() => next.handle(req))
          );
        }
        return throwError(() => err);
      })
    );
  }
}
```

**After (current project)**:
```typescript
import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';

export const refreshTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  return next(req).pipe(
    catchError(err => {
      if (err.status === 401) {
        return authService.refreshToken().pipe(
          switchMap(() => next(req))
        );
      }
      return throwError(() => err);
    })
  );
};
```

---

## 🎯 實作步驟範例 / Implementation Examples

### Example 1: 提取 async-state.ts (5 分鐘)

```bash
# 步驟 1: 複製檔案
cp old/src-old/app/shared/utils/async-state.ts \
   src/app/shared-ui/utils/async-state.ts

# 步驟 2: 更新索引
echo "export * from './async-state';" >> src/app/shared-ui/utils/index.ts

# 步驟 3: 使用
```

```typescript
// user-list.component.ts
import { createAsyncState } from '@shared-ui/utils';

@Component({
  template: `
    @if (usersState.loading()) {
      <nz-spin />
    } @else {
      <nz-table [nzData]="usersState.data() ?? []" />
    }
  `
})
export class UserListComponent {
  usersState = createAsyncState<User[]>([]);
  
  async ngOnInit() {
    await this.usersState.load(
      firstValueFrom(this.userService.getUsers())
    );
  }
}
```

### Example 2: 提取 Audit System (1-2 天)

```bash
# 步驟 1: 創建結構
mkdir -p src/app/core/observability/audit/{models,services,decorators}

# 步驟 2: 複製檔案
cp old/src-old/app/core/audit/audit-event.model.ts \
   src/app/core/observability/audit/models/

# 步驟 3: 修改服務 (整合 Result)
# 手動編輯 audit-log.service.ts

# 步驟 4: 複製裝飾器
cp old/src-old/app/core/audit/auditable.decorator.ts \
   src/app/core/observability/audit/decorators/
```

```typescript
// 使用範例
import { Auditable } from '@core/observability/audit';

@Injectable({ providedIn: 'root' })
export class UserService {
  @Auditable({
    action: 'user.created',
    resourceType: 'User'
  })
  async createUser(data: CreateUserDto): Promise<Result<User, Error>> {
    // 自動記錄審計日誌
    return this.repository.create(data);
  }
}
```

---

## ⚠️ 常見陷阱與解決方案 / Common Pitfalls & Solutions

### 陷阱 1: 導入路徑錯誤

**問題**:
```
Cannot find module '@core/event-bus/lifecycle/dispatch'
```

**解決**:
```typescript
// ❌ 舊路徑
import { EventBus } from '@core/event-bus/lifecycle/dispatch';

// ✅ 新路徑
import { EventBusService } from '@core/event-system/services';
// 或
import { EventBusService } from '@core/event-system';
```

### 陷阱 2: 忘記轉換為 Result 模式

**問題**:
```typescript
// ❌ 舊模式 (拋出錯誤)
async doSomething(): Promise<Data> {
  throw new Error('Failed');
}
```

**解決**:
```typescript
// ✅ 新模式 (返回 Result)
async doSomething(): Promise<Result<Data, Error>> {
  return err(ErrorFactory.application.commandFailed('...'));
}
```

### 陷阱 3: 使用 Class-based Guards/Interceptors

**問題**:
```typescript
// ❌ 舊式 class-based guard
@Injectable()
export class MyGuard implements CanActivate { ... }
```

**解決**:
```typescript
// ✅ 新式 functional guard
export const myGuard: CanActivateFn = (route, state) => {
  const service = inject(MyService);
  return service.check();
};
```

---

## 📚 參考文檔 / Reference Documents

### 專案內部文檔
- [完整功能分析](./OLD_SOURCE_FEATURE_EXTRACTION.md)
- [快速摘要](./提取建議摘要.md)
- [架構文檔](../ARCHITECTURE.md)
- [Result 模式說明](../../src/app/core/README.md)

### Angular 官方文檔
- [Angular 20 Signals](https://angular.dev/guide/signals)
- [Functional Guards](https://angular.dev/guide/routing/guards)
- [Functional Interceptors](https://angular.dev/guide/http/interceptors)
- [Control Flow Syntax](https://angular.dev/guide/templates/control-flow)

---

## ✅ 遷移檢查清單 / Migration Checklist

提取每個功能時，請確認:

- [ ] 檔案複製到正確目錄
- [ ] 更新所有導入路徑
- [ ] 整合 Result 模式 (如適用)
- [ ] 轉換為 Functional API (Guards/Interceptors)
- [ ] 使用 inject() 而非 constructor injection
- [ ] 創建/更新 index.ts 檔案
- [ ] 編寫或更新測試
- [ ] 更新相關文檔

---

<small>Generated with GitHub Copilot as directed by the development team</small>
