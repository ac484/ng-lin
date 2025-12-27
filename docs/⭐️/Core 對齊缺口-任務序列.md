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
   - 驗證：核心能被 Feature 直接注入，不需跨路徑 import；`yarn build`
2. Observability 三件組  
   - [ ] logger.service.ts（結構化日誌 + context enrich）  
   - [ ] error-tracking.service.ts（捕捉 handler 失敗、上報）  
   - [ ] performance-monitoring.service.ts（簡易計時 + 追蹤）  
   - [ ] 於 core/index.ts 匯出，必要時在 app.config.ts 注入 provider  
   - 驗證：提供最小 API（info/warn/error、capture/record、timer/trace），`yarn build`
3. 通知/事件使用手冊  
   - [ ] 在 docs/⭐️/Core 對齊缺口與建議.md 增補「使用說明」段落（發佈/訂閱事件、NotificationService 範例）  
   - 驗證：文檔示例可直接複製使用；`yarn build` 確認無 markdown/asset 檢查問題

## 建議執行順序
1) Event Bus 匯出校準 → 2) Observability 三件組 → 3) 說明文件補齊  
每一步完成後執行 `yarn build` 驗證。
