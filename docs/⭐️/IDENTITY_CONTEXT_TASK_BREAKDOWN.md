# Identity & Context System - Implementation Task Breakdown

> 母體對齊：GitHub 為控制平面，Identity/Context 的資料模型與治理流程需可回溯至 GitHub 的租戶/組織/團隊與權限模型。實作層以 Angular 20 + @angular/fire（含 DA_SERVICE_TOKEN）作為 runtime，透過 Firestore/Functions/Rules 落地，所有 Session/Context 傳遞均需保留 GitHub 對應欄位（organization/team/repo/role），並遵守「UI → Service/Facade → Repository」的分層。

> 目標：對齊母體（Identity & Context）完整落地，涵蓋多租戶、認證、授權（RBAC/ABAC）、Session/Context 傳遞與驗證。

## Phase 0: 基礎模型與上下文
- [x] IDCTX-P0-001: 定義 IdentityContext / SessionContext 資料結構（tenantId, userId, roles, permissions, scopes, correlationId）
- [x] IDCTX-P0-002: 建立 ContextProvider（注入式，支援 request-scoped/async storage）與 ContextGuard 接口

## Phase 1: 認證（Auth）— 基於 @angular/fire/auth → @delon/auth (DA_SERVICE_TOKEN)
- [x] IDCTX-P1-001: Email/Password 登入（@angular/fire/auth）+ 會話續期（token refresh）
- [x] IDCTX-P1-002: OAuth（Google）與匿名登入策略（透過 DA_SERVICE_TOKEN）
- [x] IDCTX-P1-003: Session 固化與再生（refresh token + anti-fixation）；暫不實作多設備/二階段驗證
- [x] IDCTX-P1-004: 租戶/裝置上下文附帶（user, tenantId, correlationId）於 session payload

## Phase 2: 授權（RBAC / ABAC）— 支援 SaaS 角色：用戶/組織/團隊/夥伴/協作者
- [x] IDCTX-P2-001: RBAC 角色模型（org / blueprint / project 階層）
- [x] IDCTX-P2-002: ABAC 規則引擎（屬性：tenant, role, clearance, resource tags）
- [x] IDCTX-P2-003: PermissionGuard / TenantGuard 對齊新模型（替換舊別名）
- [x] IDCTX-P2-004: Policy Decision Point + Policy Enforcement Point（PDP/PEP）鏈路

## Phase 3: Session / Context Propagation
- [x] IDCTX-P3-001: HttpClient 拦截器注入 Context（tenantId, userId, correlationId）
- [ ] IDCTX-P3-002: EventBus Payload 自動附帶 Context（publisher/consumer）
- [ ] IDCTX-P3-003: Firestore Security Rules context 對齊（tenant/role/permission 驗證）

## Phase 4: 多租戶治理與審計
- [ ] IDCTX-P4-001: Tenant Lifecycle（create/update/archive）與預設角色綁定
- [ ] IDCTX-P4-002: 跨租戶隔離測試（讀/寫/事件/檔案）
- [ ] IDCTX-P4-003: Identity 事件 → Audit System 映射（identity.*, auth.*, permission.*）

## Phase 5: 驗證與覆蓋率
- [ ] IDCTX-P5-001: 單元測試覆蓋率 ≥80%（guards, context provider, policy engine）
- [ ] IDCTX-P5-002: 集成測試（多租戶/多角色場景）含 emulator
- [ ] IDCTX-P5-003: 負向/滲透場景（session fixation, privilege escalation, cross-tenant access）

## Phase 6: 文件與運維
- [ ] IDCTX-P6-001: 更新 docs/INDEX.md 進度與介面對照
- [ ] IDCTX-P6-002: Runbook（憑證輪換、MFA 例外、帳號封鎖/解封）
- [ ] IDCTX-P6-003: 監控與警報（登入異常、跨租戶嘗試、授權失敗峰值）

## 依賴 / 參考
- Firestore Rules：`security-compliance/security/README.md`
- Guards：`src/app/core/guards/auth.guard.ts`, `permission.guard.ts`, `tenant.guard.ts`
- Auth Facade：`src/app/core` 下現有 AuthFacade / PermissionService / TenantContextService
- Audit 對接：`src/app/core/audit` 事件模型

## 實作狀態（2025-12-27 更新）

### Phase 1 完成項目
- **Email/Password 登入**: `FirebaseAuthService.signIn()` 實作，強制 token refresh 防止 session fixation
- **OAuth Google 登入**: `FirebaseAuthService.signInWithGoogle()` 使用 GoogleAuthProvider + signInWithPopup
- **匿名登入**: `FirebaseAuthService.signInAnonymous()` 實作
- **自動 Token 續期**: 45 分鐘自動刷新機制，防止 session 過期
- **裝置上下文**: `SessionContext` 擴充 `deviceId`, `deviceInfo` (userAgent, platform, language)
- **GitHub 對齊欄位**: `IdentityContext` 新增 `organization`, `team`, `repository`, `role` 欄位

### Phase 2 完成項目
- **RBAC 模型**: `src/app/core/models/rbac.model.ts`
  - `RoleLevel` 枚舉（organization/team/blueprint/project）
  - `RoleType` 枚舉對齊 GitHub（admin/maintain/write/triage/read）
  - `GitHubOrganizationRole` 組織層級角色
  - `Role` 介面支援權限繼承
- **ABAC 模型**: `src/app/core/models/abac.model.ts`
  - `AttributeType`, `AttributeOperator` 定義屬性條件
  - `PolicyRule` 支援 AND/OR/NOT 邏輯組合
  - `PolicyContext` 多維度上下文（user/resource/environment/tenant/action）
  - 評估函數 `evaluateCondition`, `evaluatePolicyRule`
- **Policy Engine**: `src/app/core/services/policy-engine.service.ts`
  - PDP 實作（Policy Decision Point）
  - RBAC + ABAC 混合評估
  - 拒絕優先策略（deny-overrides-allow）
  - 預設策略（限制資源存取、租戶隔離）
- **Guard 增強**: `src/app/core/guards/permission.guard.ts`
  - PEP 實作（Policy Enforcement Point）
  - 向後相容 RBAC 檢查
  - 可選 ABAC 評估（route data `useAbac: true`）

### 後續任務
- Phase 3: EventBus 自動附帶 Context
- Phase 4: 租戶生命週期管理
- Phase 5-6: 測試與文件
