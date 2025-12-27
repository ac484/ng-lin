# Core 對齊缺口與建議（src/app/core）

## 背景
- 參考母體規範：`docs/⭐️/整體架構設計.md` 與 `src/app/core/AGENTS.md` 均要求 Core 承載認證、守衛、攔截器、租戶/權限、通知與跨域模型，並保持「UI → Service/Facade → Repository」三層分離。
- 目前 Core 已有 Event Bus、部分網路攔截器與基礎服務，但尚未完整覆蓋母體預期的核心能力。
- 母體對齊：以 **GitHub 控制平面**（組織/團隊/儲存庫/Ruleset）為權威語意來源，Core 僅作為執行層，透過 Angular 20 + @angular/fire（Firestore/Functions/Rules）實現，同步保留 GitHub 對應欄位（org/team/repo/role）於 Context/Guard/Interceptor。

## 現況快照（2025-12，已更新）
- `data-access/auth`：有 `auth.facade.ts` / `auth.port.ts` / `auth.state.ts`，Firebase 實作位於 `src/app/firebase/infra`；已暴露 `currentUserSignal` 與 `getCurrentUserId`，供 UI/Feature 直接注入。
- `net/`：已拆為 `interceptors/`（base-url、auth-token、refresh-token、error-handler），並在 `app.config.ts` 註冊；`helper.ts`/`refresh-token.ts` 作為共用工具保留。
- `services/`：已移除違規的 `firebase.service.ts`，新增 `permission.service.ts`、`tenant-context.service.ts`（Signals）。
- `guards/`：已補齊 `auth/permission/tenant` 守衛並套用至 routes 主幹。
- `notification/`：已提供 Event Bus 驅動的跨域通知服務，統一 toast/message 顯示。
- `models/`：已集中定義 `user/organization/repository/permission` 等核心模型並匯出。

## 缺口與優先級
### P0（立即補齊）— 已完成 ✅
1) **移除 Firebase 包裝服務** ✅  
   - `core/services/firebase.service.ts` 已刪除，改由 AuthFacade / FirebaseAuthService 暴露 `currentUserSignal` 與 ID 方法。
2) **攔截器目錄化與職責分拆** ✅  
   - 已新增 `core/interceptors/`：`base-url`、`auth-token`、`error-handler`、`refresh-token`；`app.config.ts` 已註冊。
3) **權限 + 租戶上下文服務** ✅  
   - 已新增 `permission.service.ts`、`tenant-context.service.ts`（Signals），供守衛與 Feature 後續共用。

### P1（短期完成）— 已完成 ✅
4) **核心模型集中** ✅  
   - 已建立 `core/models/`：`user.model.ts`、`organization.model.ts`、`repository.model.ts`、`permission.model.ts`，並由 `core/index.ts` 匯出，避免 Feature 重複定義。
5) **路由守衛家族** ✅  
   - 已補齊 `auth.guard.ts`、`permission.guard.ts`、`tenant.guard.ts`，且 routes/ 主幹已套用 `authGuard`。
6) **跨域通知服務** ✅  
   - 已實作 `core/services/notification/notification.service.ts`：監聽 Event Bus（audit policy、handler failure、notification namespace），橋接至 UI Toast/Message。

### P2（中期強化）
7) **Event Bus 對齊介面**  
   - 釐清 `core/event-bus` 對外 Facade（IEventBus、BlueprintDomainEvent、EventTypes 常數）、核心 Provider 列表，於 Core 層建立最小重匯出並補充使用說明。  
   - 驗收：Features 只需 `@core/event-bus` 匯入即可 publish/observe；範例覆蓋 audit / notification / system.failure。
8) **匯出入口**  
   - 確保 P2 新增檔案（event-bus 重匯出、observability 三件組）均在 `core/index.ts` 暴露，提供一致注入點。  
   - 驗收：`core/index.ts` 無遺漏，能在 Feature 端正常注入/型別推斷。
9) **Observability 三件組**  
   - 補齊 `logger.service.ts`（結構化日誌 + context enrich）、`error-tracking.service.ts`（捕捉 handler/guard/interceptor 失敗並上報）、`performance-monitoring.service.ts`（計時 + 簡易 trace 標籤），並視需要在 `app.config.ts`/providers 註冊。  
   - 驗收：三個服務有最小 API（info/warn/error、capture/record、timer/trace），可在 core/index 匯入且 yarn build 通過。
10) **通知 / 事件使用說明**  
    - 在本文件與任務序列文件補足使用說明：發佈/訂閱事件、NotificationService 呼叫、最小防呆（無藍圖 ID、無使用者 ID 等），確保示例可直接貼上使用。  
    - 驗收：文檔示例可直接複製運行；build/lint 無新增警告。

## 使用說明（事件發布 / 訂閱 & 通知）
- 發佈事件（Feature）：
  ```typescript
  import { inject } from '@angular/core';
  import { IEventBus } from '@core/event-bus';

  const eventBus = inject(IEventBus);
  eventBus.publish({
    type: 'audit.policy.flagged',
    blueprintId,
    reason,
    severity: 'warning'
  });
  ```
- 訂閱事件（Service）：
  ```typescript
  import { inject } from '@angular/core';
  import { IEventBus, EVENT_PATTERNS, matchesPattern } from '@core/event-bus';
  import { filter } from 'rxjs/operators';

  const eventBus = inject(IEventBus);
  eventBus
    .observeAll()
    .pipe(filter(event => matchesPattern(event.eventType, EVENT_PATTERNS.NAMESPACE_ALL('notification'))))
    .subscribe(event => {
      // bridge to NotificationService or domain-specific handler
    });
  ```
- 使用 NotificationService：
  ```typescript
  import { inject } from '@angular/core';
  import { NotificationService } from '@core/services/notification/notification.service';

  const notifications = inject(NotificationService);
  notifications.success('已完成');
  notifications.warn('權限不足，請聯繫管理員');
  notifications.error('系統錯誤，請稍後再試');
  ```
- Observability 三件組：
  ```typescript
  import { inject } from '@angular/core';
  import { LoggerService, ErrorTrackingService, PerformanceMonitoringService } from '@core';

  const logger = inject(LoggerService);
  const errors = inject(ErrorTrackingService);
  const perf = inject(PerformanceMonitoringService);

  logger.info('task loaded', { blueprintId, tags: ['feature:task'] });
  perf.start('load-tasks');
  // ...do work...
  perf.end('load-tasks', { count: tasks.length });
  try {
    // risky operation
  } catch (err) {
    errors.captureError(err, { scope: 'service', blueprintId });
  }
  ```

## 對齊後目錄建議（目標狀態）
```
src/app/core/
├── auth/                      # Auth Facade/Port/State（authGuard 依賴）
├── guards/
│   ├── auth.guard.ts
│   ├── permission.guard.ts
│   └── tenant.guard.ts
├── interceptors/
│   ├── base-url.interceptor.ts
│   ├── auth-token.interceptor.ts
│   ├── refresh-token.interceptor.ts
│   └── error-handler.interceptor.ts
├── services/
│   ├── permission/permission.service.ts
│   ├── tenant/tenant-context.service.ts
│   ├── notification/notification.service.ts
│   ├── logger/logger.service.ts
│   ├── error-tracking.service.ts
│   └── performance-monitoring.service.ts
├── models/
│   ├── user.model.ts
│   ├── organization.model.ts
│   ├── repository.model.ts
│   └── permission.model.ts
├── event-bus/                 # 既有：保持現有目錄與重匯出
├── startup/                   # 既有：初始化流程
└── index.ts                   # 統一匯出
```

## 行動路線圖
1) **Phase 1 – 基線清理（P0）** ✅ 已完成：移除 `firebase.service.ts`、建立 `interceptors/` 並註冊、落地權限/租戶服務。
2) **Phase 2 – 基礎模型（P1）** ✅ 已完成：核心模型、守衛與匯出。
3) **Phase 3 – 通知與事件整合（P2）**：完成 Event Bus 匯出校準、Observability 三件組、通知/事件使用手冊更新。

## 驗收檢查表
- [x] Core 中無 Firebase 包裝層，全部直接注入 @angular/fire。
- [x] Interceptors 職責分拆並集中註冊，覆蓋 Base URL / Token / Error / Refresh。
- [x] 權限與租戶服務以 Signals 封裝，提供給守衛與 Feature。
- [x] 核心模型與守衛可被所有 Feature 直接匯入，無重複型別。
- [x] 通知服務可由 Event Bus 觸發，UI 介面一致（成功/錯誤/警告）。
- [x] Event Bus 對外 Facade 已重匯出並文件化（P2）。
- [x] Observability 三件組可用並文件化（P2）。
- [x] 通知 / 事件使用手冊已納入 docs/⭐️（P2）。
