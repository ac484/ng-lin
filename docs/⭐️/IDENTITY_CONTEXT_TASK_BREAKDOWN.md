# Identity & Context System - Implementation Task Breakdown

> 目標：對齊母體（Identity & Context）完整落地，涵蓋多租戶、認證、授權（RBAC/ABAC）、Session/Context 傳遞與驗證。

## Phase 0: 基礎模型與上下文
- [ ] IDCTX-P0-001: 定義 IdentityContext / SessionContext 資料結構（tenantId, userId, roles, permissions, scopes, correlationId）
- [ ] IDCTX-P0-002: 建立 ContextProvider（注入式，支援 request-scoped/async storage）與 ContextGuard 接口

## Phase 1: 認證（Auth）— 基於 @angular/fire/auth → @delon/auth (DA_SERVICE_TOKEN)
- [ ] IDCTX-P1-001: Email/Password 登入（@angular/fire/auth）+ 會話續期（token refresh）
- [ ] IDCTX-P1-002: OAuth（Google）與匿名登入策略（透過 DA_SERVICE_TOKEN）
- [ ] IDCTX-P1-003: Session 固化與再生（refresh token + anti-fixation）；暫不實作多設備/二階段驗證
- [ ] IDCTX-P1-004: 租戶/裝置上下文附帶（user, tenantId, correlationId）於 session payload

## Phase 2: 授權（RBAC / ABAC）— 支援 SaaS 角色：用戶/組織/團隊/夥伴/協作者
- [ ] IDCTX-P2-001: RBAC 角色模型（org / blueprint / project 階層）
- [ ] IDCTX-P2-002: ABAC 規則引擎（屬性：tenant, role, clearance, resource tags）
- [ ] IDCTX-P2-003: PermissionGuard / TenantGuard 對齊新模型（替換舊別名）
- [ ] IDCTX-P2-004: Policy Decision Point + Policy Enforcement Point（PDP/PEP）鏈路

## Phase 3: Session / Context Propagation
- [ ] IDCTX-P3-001: HttpClient 拦截器注入 Context（tenantId, userId, correlationId）
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
