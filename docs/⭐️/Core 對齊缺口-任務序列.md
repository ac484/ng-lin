---
description: 'Core 對齊缺口的可執行任務序列（依母體規範）'
applyTo: '**'
---

# Core 對齊缺口 → 可執行任務序列

## 完成狀態（P0/P1）
- [x] 移除 Firebase 包裝層，統一直接注入 @angular/fire
- [x] 拆分並註冊 Base URL / Auth Token / Refresh / Error Interceptors
- [x] Signals 權限服務、租戶上下文服務
- [x] 核心模型匯出：user / organization / repository / permission
- [x] 守衛家族：authGuard / permissionGuard / tenantGuard，routes 已接入
- [x] Event Bus 驅動的跨域通知服務（audit policy / handler failure / notification namespace）

## 待辦（P2 強化）
1. Event Bus 匯出校準  
   - [x] 梳理 `core/event-bus` 對外 Facade（IEventBus、DomainEvent、事件常數、TOKEN、InMemoryEventBus）並最小重匯出  
   - [x] 補齊 Provider 列表與使用說明（docs/⭐️/ 說明段落，含 publish/observe 範例）  
   - 驗證：Feature 端只需 `@core/event-bus` 匯入即可 publish/observe audit/notification/system.failure；`yarn build`
2. Observability 三件組  
   - [x] logger.service.ts（結構化日誌 + context enrich：userId/blueprintId/requestId）  
   - [x] error-tracking.service.ts（捕捉 handler/guard/interceptor 失敗，集中上報）  
   - [x] performance-monitoring.service.ts（計時 + trace labels，最小 overlay）  
   - [x] 於 core/index.ts 匯出，必要時在 app.config.ts 注入 provider  
   - 驗證：提供最小 API（info/warn/error、capture/record、timer/trace），`yarn build`
3. 通知/事件使用手冊  
   - [x] 在 docs/⭐️/Core 對齊缺口與建議.md 保持「使用說明」段落最新（發佈/訂閱事件、NotificationService 範例、防呆要點）  
   - 驗證：文檔示例可直接複製使用；`yarn build` 確認無 markdown/asset 檢查問題

## 建議執行順序
1) Event Bus 匯出校準 → 2) Observability 三件組 → 3) 說明文件補齊  
每一步完成後執行 `yarn build` 驗證。
