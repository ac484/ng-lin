# ADR-0003: RBAC Authorization System

## Status
✅ Accepted & Implemented (2025-12-30)

## Context
ng-lin 需要控制「誰可以對什麼資源進行什麼操作」(Who-What-Which)。需支援角色管理、資源級權限、細粒度操作授權。

## Decision
採用基於 Angular Signals 的 RBAC (Role-Based Access Control)：

### 核心模型
```typescript
// Subject: 權限主體
interface Subject {
  id: string;
  type: 'user' | 'role';
  roles?: string[];
}

// Resource: 受保護資源
interface Resource {
  type: string;  // 'issue', 'discussion', 'comment'
  id?: string;   // 實例級權限
}

// Permission: 權限定義
interface Permission {
  subject: Subject;
  action: Action; // CREATE/READ/UPDATE/DELETE/APPROVE
  resource: Resource;
}
```

### 支援角色
1. **admin**: 所有權限 (`*:*`)
2. **editor**: 創建/讀取/更新
3. **contributor**: 創建/讀取
4. **viewer**: 僅讀取

### 實現
- `AuthorizationService`: 權限檢查服務（回傳 Signal<Result>）
- `PermissionPolicyService`: 角色到權限映射（145 lines）
- Route Guards: `authGuard`, `roleGuard`, `permissionGuard`

## Rationale
### 為何 RBAC 而非 ABAC？
- ✅ 簡單直觀，易於理解
- ✅ 符合大多數企業應用需求
- ✅ 效能優異
- ⚠️ 不支援基於上下文動態授權（未來可擴展至 ABAC）

### 為何 Signals？
- ✅ 簡潔語法
- ✅ 自動依賴追蹤
- ✅ 細粒度更新
- ✅ Angular 19+ 生態整合

### 為何不用 @delon/auth？
- 當前實現足夠簡單（奧卡姆剃刀）
- 避免額外依賴
- 與 @angular/fire/auth 整合更緊密

## Consequences
### 正面
- 清晰權限模型：Subject-Action-Resource 三元組
- 響應式 UI：Signal 驅動自動更新
- 類型安全：TypeScript 編譯時檢查

### 負面
- 角色管理開銷
- 無動態策略
- 測試複雜度

## Follow-up
- [ ] 策略持久化至 Firestore
- [ ] 動態角色分配
- [ ] 審計日誌記錄授權決策
- [ ] 若需基於上下文授權，擴展至 ABAC
