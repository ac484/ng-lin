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
   - [ ] 梳理 `core/event-bus` 對外 Facade（IEventBus、BlueprintDomainEvent 等）並最小重匯出  
   - [ ] 補齊 Provider 列表與使用說明（docs/⭐️/ 說明段落）
2. Observability 三件組  
   - [ ] logger.service.ts（結構化日誌 + context enrich）  
   - [ ] error-tracking.service.ts（捕捉 handler 失敗、上報）  
   - [ ] performance-monitoring.service.ts（簡易計時 + 追蹤）  
   - [ ] 於 core/index.ts 匯出，必要時在 app.config.ts 注入 provider
3. 通知/事件使用手冊  
   - [ ] 在 docs/⭐️/Core 對齊缺口與建議.md 增補「使用說明」段落，示範：  
     - 如何在 Feature 發佈事件（audit.* / notification.*）  
     - 如何訂閱並使用 NotificationService

## 建議執行順序
1) Event Bus 匯出校準 → 2) Observability 三件組 → 3) 說明文件補齊  
每一步完成後執行 `yarn build` 驗證。
