# Event Sourcing 推薦依賴包

本文檔列出 Event Sourcing、Event Flow 與 Causality 相關的推薦 Angular/NgRx 套件。

---

## 核心套件

| 套件名稱                   | 類別              | 作用 / 適用            | 為何推薦                                                             |
| ---------------------- | --------------- | ------------------ | ---------------------------------------------------------------- |
| **@angular/core**      | 核心框架            | Signals / DI / 組件等 | Angular 官方核心，比 RxJS 更推進 Signals 生態 ([iThome][1])                 |
| **RxJS**               | 核心反應式流          | Observable、事件流建模   | Angular 事件流標準，配合 store / side effects 管理資料流 ([v9.angular.cn][2]) |
| **@ngrx/store**        | 狀態管理            | Redux‑style 全域狀態   | 官方常見大型狀態管理方案，適合 Event Sourcing 模式 ([sumble.com][3])              |
| **@ngrx/effects**      | Side effects    | 處理非同步事件副作用         | 與 store 搭配管理事件流程與觸發 side effect ([sumble.com][3])                |
| **NgRx Signal Store**  | Signals 版 store | Signals to state   | NgRx 最新推薦與 Angular Signals 結合的狀態庫 ([DEV Community][4])           |
| **@ngrx/entity**       | Store 增強        | 實體 collections 管理  | 方便管理事件序列與 normalized state                                       |
| **@ngrx/router‑store** | Store + Router  | 同步路由狀態進 store      | 追蹤路由事件與進度狀態                                                      |

[1]: https://www.ithome.com.tw/news/169355?utm_source=chatgpt.com "Angular v20正式棄用結構指令，反應式狀態管理進入穩定階段 | iThome"
[2]: https://v9.angular.cn/guide/glossary?utm_source=chatgpt.com "Angular - Angular 词汇表"
[3]: https://sumble.com/tech/ngrx?utm_source=chatgpt.com "What is NgRx? Competitors, Complementary Techs & Usage | Sumble"
[4]: https://dev.to/devin-rosario/best-practices-for-angular-state-management-2pm1?utm_source=chatgpt.com "Best Practices for Angular State Management - DEV Community"

---

## 替代方案

| 套件名稱                                    | 類別             | 適用場景                                       | 說明                              |
| --------------------------------------- | -------------- | ------------------------------------------ | --------------------------------- |
| **ngxs**                                | 替代 store       | 較輕量狀態管理方案，語法更簡潔 ([YouTube][1])             |                                   |
| **akita**                               | 狀態管理           | 比 NgRx 更簡化的 reactive store ([Medium][2])   |                                   |
| **@state‑management/ngx‑state‑machine** | State machine  | Angular 專用狀態機，可做流程 + 決策狀態 ([npmjs.com][3]) |                                   |
| **xstate**                              | State machine  | 高階狀態機 / Statecharts                        | 跨 framework，強狀態邏輯設計 ([Medium][4]) |
| **@xstate/angular**                     | XState binding | 結合 Angular & XState                        | 將機器狀態與组件整合顯示                      |

[1]: https://www.youtube.com/watch?v=K-fFywW1z5A&utm_source=chatgpt.com "Modern State Management in Angular - YouTube"
[2]: https://medium.com/%40roshannavale7/top-10-most-used-angular-libraries-every-developer-should-know-671451dc6e58?utm_source=chatgpt.com "Top 10 Most Used Angular Libraries Every Developer Should Know"
[3]: https://www.npmjs.com/package/%40state-management/ngx-state-machine?utm_source=chatgpt.com "state-management/ngx-state-machine - NPM"
[4]: https://medium.com/angular-athens/working-with-state-machines-in-angular-2817441e26bf?utm_source=chatgpt.com "Working with State Machines in Angular | by Stefanos Lignos - Medium"

---

## 開發工具

| 套件名稱                                   | 作用            | 為什麼有用                                                      |
| -------------------------------------- | ------------- | ---------------------------------------------------------- |
| **@angular/platform‑browser‑devtools** | DevTools 支援   | Angular Signals/變更追踪整合 Chrome DevTools ([angular.dev][1])  |
| **ng‑rxjs‑devtools**                   | RxJS devtools | 觀察 RxJS 流、events                                           |
| **jasmine‑marbles / rxjs‑marbles**     | Testing       | 虛擬事件時間軸測試，提高 replay / causality 測試精確度 ([v9.angular.cn][2]) |
| **angular‑linter / ng‑reactive‑lint**  | 靜態分析          | 強化 Signals/RxJS 規則與性能負面模式檢測 ([arXiv][3])                   |

[1]: https://angular.dev/roadmap?utm_source=chatgpt.com "Angular Roadmap"
[2]: https://v9.angular.cn/guide/testing?utm_source=chatgpt.com "Angular - 测试"
[3]: https://arxiv.org/abs/2512.00250?utm_source=chatgpt.com "ng-reactive-lint: Smarter Linting for Angular Apps"

---

## 監控與可視化

| 套件名稱                               | 作用                               |
| ---------------------------------- | -------------------------------- |
| **OpenTelemetry JS**               | 全棧 observability (trace/span)    |
| **@angular/fire**                  | 連接 Firebase 事件追蹤/real‑time       |
| **Akita Devtools / NgRx DevTools** | State time‑travel / event replay |
| **Chart.js / D3 / Vega‑Lite**      | 可視化事件流程與因果圖                      |

---

## UI 組件庫

| 套件                | 作用                         | 推薦度      |
| ----------------- | -------------------------- | -------- |
| **ng‑zorro‑antd** | Ant Design 風格 Angular UI 庫 | ⭐⭐⭐⭐⭐ 必裝 |
| **@delon/theme**  | NG‑ALAIN 主題與佈局模組           | ⭐⭐⭐⭐ 可選  |
| **@delon/abc**    | 高階 UI 組件（卡片、表格套件等）         | ⭐⭐⭐⭐ 可選  |
| **@delon/form**   | JSON Schema 表單動態表單         | ⭐⭐⭐⭐ 可選  |
| **@delon/chart**  | 圖表模組，結合 ng2 G2             | ⭐⭐⭐⭐ 可選  |

---

## 狀態管理推薦度

| 套件                             | 類型            | 推薦度   |
| ------------------------------ | ------------- | ----- |
| **@ngrx/store**                | Redux 風格全域狀態  | ⭐⭐⭐⭐⭐ |
| **@ngrx/effects**              | 處理非同步事件       | ⭐⭐⭐⭐⭐ |
| **@ngrx/entity**               | 實體狀態集合管理      | ⭐⭐⭐⭐  |
| **@ngrx/router‑store**         | 將路由狀態放入 store | ⭐⭐⭐⭐  |
| **NgRx Signal Store**          | Signals 版本狀態庫 | ⭐⭐⭐⭐  |
| **ngxs**                       | 更簡潔狀態管理       | ⭐⭐⭐⭐  |
| **akita**                      | 另類輕量狀態庫       | ⭐⭐⭐⭐  |
| **xstate**/**@xstate/angular** | 強狀態機          | ⭐⭐⭐⭐  |

---

## 開發工具推薦度

| 套件                                     | 作用                         | 推薦度  |
| -------------------------------------- | -------------------------- | ---- |
| **NgRx DevTools**                      | time‑travel / event replay | ⭐⭐⭐⭐ |
| **@angular/platform‑browser‑devtools** | Angular DevTools support   | ⭐⭐⭐⭐ |
| **OpenTelemetry JS**                   | trace/span 觀測              | ⭐⭐⭐⭐ |
| **jasmine‑marbles**                    | RxJS 流測試                   | ⭐⭐⭐⭐ |
| **ng‑rxjs‑devtools**                   | RxJS events inspector      | ⭐⭐⭐⭐ |
| **D3 / Chart.js / Vega‑Lite**          | 可視化圖表（causal graph）        | ⭐⭐⭐⭐ |

---

## 實戰搭配建議

### UI 層

* ng‑zorro‑antd 做結構與組件
* @delon/* 增強大型 Dashboard、Form 等

### 事件／狀態架構層

* 用 NgRx 或 Signals + NgRx Signal Store 做 Event Flow / State
* 用 xstate 作 State Machine / causal 推演
* DevTools + OTEL 觀測實時系統行為與因果
