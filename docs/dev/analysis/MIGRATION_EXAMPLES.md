# 實戰遷移範例 / Practical Migration Examples

**日期 / Date**: 2025-12-30  
**目的 / Purpose**: 提供具體的逐步遷移範例，展示完整的遷移過程

---

## 📖 範例目錄 / Example Index

1. [async-state.ts 遷移](#example-1-async-staets-遷移) (5 分鐘)
2. [Audit System 遷移](#example-2-audit-system-遷移) (1-2 天)
3. [Permission Guard 遷移](#example-3-permission-guard-遷移) (1 天)
4. [Refresh Token Interceptor 遷移](#example-4-refresh-token-interceptor-遷移) (1-2 天)
5. [Event Resilience 遷移](#example-5-event-resilience-遷移) (2-3 天)

---

## Example 1: async-state.ts 遷移

### 步驟總覽
**時間**: 5 分鐘  
**難度**: ⭐ (非常簡單)  
**風險**: ✅ 無風險

### 步驟 1: 複製檔案

```bash
cd /path/to/ng-lin

# 確保目標目錄存在
mkdir -p src/app/shared-ui/utils

# 複製檔案
cp old/src-old/app/shared/utils/async-state.ts \
   src/app/shared-ui/utils/async-state.ts
```

### 步驟 2: 更新索引檔案

```bash
# 添加到 index.ts
echo "export * from './async-state';" >> src/app/shared-ui/utils/index.ts
```

### 步驟 3: 驗證導入

```typescript
// 在任何 component 中測試
import { createAsyncState } from '@shared-ui/utils';

const state = createAsyncState<string>('');
console.log(state); // 應該正常工作
```

### 步驟 4: 實際使用範例

```typescript
// user-list.component.ts
import { Component, inject } from '@angular/core';
import { createAsyncState } from '@shared-ui/utils';
import { UserService } from '@core/identity/services';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-user-list',
  standalone: true,
  template: `
    <div class="user-list">
      @if (usersState.loading()) {
        <nz-spin nzSimple />
        <p>載入中...</p>
      } @else if (usersState.error()) {
        <nz-alert
          nzType="error"
          [nzMessage]="usersState.error()?.message ?? '載入失敗'"
        />
      } @else {
        <nz-table [nzData]="usersState.data() ?? []">
          <thead>
            <tr>
              <th>姓名</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            @for (user of usersState.data() ?? []; track user.id) {
              <tr>
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
              </tr>
            }
          </tbody>
        </nz-table>
      }
    </div>
  `
})
export class UserListComponent {
  private userService = inject(UserService);
  usersState = createAsyncState<User[]>([]);
  
  async ngOnInit() {
    // 方法 1: 從 Observable 載入
    await this.usersState.load(
      firstValueFrom(this.userService.getUsers())
    );
    
    // 方法 2: 從 Promise 載入
    await this.usersState.load(
      this.userService.getUsersPromise()
    );
    
    // 方法 3: 手動設置
    this.usersState.setData([...]);
    this.usersState.setLoading(false);
  }
}
```

### ✅ 驗證清單

- [ ] 檔案已複製到 `src/app/shared-ui/utils/async-state.ts`
- [ ] index.ts 已更新
- [ ] 可以正常導入: `import { createAsyncState } from '@shared-ui/utils';`
- [ ] 在 component 中可以正常使用
- [ ] loading/error/data signals 正常運作

---

## Example 2: Audit System 遷移

### 步驟總覽
**時間**: 1-2 天  
**難度**: ⭐⭐⭐ (中等)  
**風險**: ⚠️ 低 (需要整合 Result 模式)

### 步驟 1: 創建目錄結構

```bash
cd /path/to/ng-lin

mkdir -p src/app/core/observability/audit/models
mkdir -p src/app/core/observability/audit/services
mkdir -p src/app/core/observability/audit/decorators
mkdir -p src/app/core/observability/audit/consumers
```

### 步驟 2: 複製模型 (無需修改)

```bash
cp old/src-old/app/core/audit/audit-event.model.ts \
   src/app/core/observability/audit/models/audit-event.model.ts
```

### 步驟 3: 複製並修改服務

```bash
# 複製原始檔案
cp old/src-old/app/core/audit/audit-log.service.ts \
   src/app/core/observability/audit/services/audit-log.service.ts
```

**修改內容** (手動編輯):

```typescript
// src/app/core/observability/audit/services/audit-log.service.ts
import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, query, where, getDocs } from '@angular/fire/firestore';
import { Result, ok, err } from '@core/result';
import { ErrorFactory } from '@core/error';
import { AuditEvent } from '../models/audit-event.model';

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private firestore = inject(Firestore);
  private collectionName = 'audit_logs';
  
  /**
   * 記錄審計事件
   */
  async logEvent(event: AuditEvent): Promise<Result<void, Error>> {
    try {
      const col = collection(this.firestore, this.collectionName);
      await addDoc(col, {
        ...event,
        timestamp: event.timestamp ?? new Date()
      });
      return ok(undefined);
    } catch (error) {
      return err(ErrorFactory.infrastructure.databaseWrite(
        `Failed to log audit event: ${event.action}`,
        error as Error
      ));
    }
  }
  
  /**
   * 查詢審計事件
   */
  async queryEvents(filter: {
    userId?: string;
    action?: string;
    resourceType?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Result<AuditEvent[], Error>> {
    try {
      const col = collection(this.firestore, this.collectionName);
      let q = query(col);
      
      if (filter.userId) {
        q = query(q, where('userId', '==', filter.userId));
      }
      if (filter.action) {
        q = query(q, where('action', '==', filter.action));
      }
      if (filter.resourceType) {
        q = query(q, where('resourceType', '==', filter.resourceType));
      }
      
      const snapshot = await getDocs(q);
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AuditEvent));
      
      return ok(events);
    } catch (error) {
      return err(ErrorFactory.infrastructure.databaseQuery(
        'Failed to query audit events',
        error as Error
      ));
    }
  }
}
```

### 步驟 4: 複製裝飾器 (微調導入)

```bash
cp old/src-old/app/core/audit/auditable.decorator.ts \
   src/app/core/observability/audit/decorators/auditable.decorator.ts
```

**修改內容**:

```typescript
// src/app/core/observability/audit/decorators/auditable.decorator.ts
import { inject } from '@angular/core';
import { AuditLogService } from '../services/audit-log.service';
import { AuditEvent } from '../models/audit-event.model';
import { IdentityContextService } from '@core/identity/services';

export interface AuditableOptions {
  action: string;
  resourceType: string;
  includeResult?: boolean;
  includeParams?: boolean;
}

export function Auditable(options: AuditableOptions) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const auditService = inject(AuditLogService);
      const identityService = inject(IdentityContextService);
      
      const startTime = Date.now();
      let result: any;
      let error: any;
      
      try {
        result = await originalMethod.apply(this, args);
        return result;
      } catch (err) {
        error = err;
        throw err;
      } finally {
        const event: AuditEvent = {
          userId: identityService.getCurrentUserId(),
          action: options.action,
          resourceType: options.resourceType,
          timestamp: new Date(),
          duration: Date.now() - startTime,
          success: !error,
          ...(options.includeParams && { params: args }),
          ...(options.includeResult && result && { result }),
          ...(error && { error: error.message })
        };
        
        await auditService.logEvent(event);
      }
    };
    
    return descriptor;
  };
}
```

### 步驟 5: 創建索引檔案

```typescript
// src/app/core/observability/audit/index.ts
export * from './models/audit-event.model';
export * from './services/audit-log.service';
export * from './decorators/auditable.decorator';
```

### 步驟 6: 使用範例

```typescript
// user.service.ts
import { Injectable, inject } from '@angular/core';
import { Auditable } from '@core/observability/audit';
import { Result } from '@core/result';

@Injectable({ providedIn: 'root' })
export class UserService {
  private repository = inject(UserRepository);
  
  @Auditable({
    action: 'user.created',
    resourceType: 'User',
    includeResult: true,
    includeParams: false
  })
  async createUser(data: CreateUserDto): Promise<Result<User, Error>> {
    // 自動記錄審計日誌:
    // - 執行前後自動記錄
    // - 包含用戶ID、時間戳、執行時間
    // - 記錄成功/失敗狀態
    return this.repository.create(data);
  }
  
  @Auditable({
    action: 'user.updated',
    resourceType: 'User'
  })
  async updateUser(id: string, data: UpdateUserDto): Promise<Result<User, Error>> {
    return this.repository.update(id, data);
  }
  
  @Auditable({
    action: 'user.deleted',
    resourceType: 'User'
  })
  async deleteUser(id: string): Promise<Result<void, Error>> {
    return this.repository.delete(id);
  }
}
```

### ✅ 驗證清單

- [ ] 目錄結構已創建
- [ ] 模型檔案已複製
- [ ] 服務已複製並整合 Result 模式
- [ ] 裝飾器已複製並更新導入
- [ ] index.ts 已創建
- [ ] 可以正常導入和使用 @Auditable
- [ ] 審計日誌正確記錄到 Firestore
- [ ] 查詢功能正常運作

---

## Example 3: Permission Guard 遷移

### 步驟總覽
**時間**: 1 天  
**難度**: ⭐⭐⭐ (中等)  
**風險**: ⚠️ 中等 (需要轉換為 functional API)

### 步驟 1: 查看舊版 Guard

```typescript
// old/src-old/app/core/guards/permission.guard.ts (舊版)
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { PermissionService } from '../services/permission/permission.service';

@Injectable({ providedIn: 'root' })
export class PermissionGuard implements CanActivate {
  constructor(
    private permissionService: PermissionService,
    private router: Router
  ) {}
  
  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredPermission = route.data['permission'];
    
    if (!requiredPermission) {
      return true;
    }
    
    if (this.permissionService.hasPermission(requiredPermission)) {
      return true;
    }
    
    this.router.navigate(['/unauthorized']);
    return false;
  }
}
```

### 步驟 2: 創建新版 Functional Guard

```typescript
// src/app/core/guards/permission.guard.ts (新版)
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionService } from '@core/governance/authorization/services/permission.service';

export const permissionGuard: CanActivateFn = (route, state) => {
  const permissionService = inject(PermissionService);
  const router = inject(Router);
  
  const requiredPermission = route.data['permission'] as string | undefined;
  
  // 如果沒有指定權限，允許訪問
  if (!requiredPermission) {
    return true;
  }
  
  // 檢查權限
  if (permissionService.hasPermission(requiredPermission)) {
    return true;
  }
  
  // 權限不足，導航到未授權頁面
  router.navigate(['/unauthorized'], {
    queryParams: {
      returnUrl: state.url,
      required: requiredPermission
    }
  });
  
  return false;
};

// 也可以創建帶參數的 guard factory
export function createPermissionGuard(permission: string): CanActivateFn {
  return (route, state) => {
    const permissionService = inject(PermissionService);
    const router = inject(Router);
    
    if (permissionService.hasPermission(permission)) {
      return true;
    }
    
    router.navigate(['/unauthorized']);
    return false;
  };
}
```

### 步驟 3: 更新索引

```typescript
// src/app/core/guards/index.ts
export * from './auth.guard';
export * from './permission.guard';  // 新增
```

### 步驟 4: 在路由中使用

```typescript
// app.routes.ts
import { Routes } from '@angular/router';
import { permissionGuard, createPermissionGuard } from '@core/guards';

export const routes: Routes = [
  {
    path: 'admin',
    canActivate: [permissionGuard],
    data: { permission: 'admin.access' },
    children: [
      {
        path: 'users',
        canActivate: [createPermissionGuard('admin.users.read')],
        loadComponent: () => import('./admin/users/users.component')
      },
      {
        path: 'settings',
        canActivate: [permissionGuard],
        data: { permission: 'admin.settings.read' },
        loadComponent: () => import('./admin/settings/settings.component')
      }
    ]
  }
];
```

### ✅ 驗證清單

- [ ] 新版 functional guard 已創建
- [ ] index.ts 已更新
- [ ] 路由配置已更新使用新 guard
- [ ] Guard 正確阻擋無權限用戶
- [ ] 有權限的用戶可以正常訪問
- [ ] 無權限時正確導航到 /unauthorized
- [ ] queryParams 正確傳遞

---

## ✨ 總結 / Summary

每個遷移範例都包含:
- ✅ 詳細的步驟說明
- ✅ 實際的程式碼範例
- ✅ 驗證清單
- ✅ 常見問題解決方案

按照這些範例進行遷移，可以確保:
- 正確的架構整合
- Result 模式一致性
- Angular 20 最佳實踐
- 可測試性和可維護性

---

<small>Generated with GitHub Copilot as directed by the development team</small>
