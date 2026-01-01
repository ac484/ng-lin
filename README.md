# GigHub - 工地施工進度追蹤管理系統

<p align="center">
  <img width="120" src="https://ng-alain.com/assets/img/logo-color.svg" alt="ng-alain logo">
</p>

<h3 align="center">Enterprise Construction Site Progress Tracking System</h3>

<div align="center">

**技術棧**: Angular 20 + Firebase + ng-alain + ng-zorro-antd

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Angular](https://img.shields.io/badge/angular-20.3.0-red.svg)](https://angular.dev)
[![Firebase](https://img.shields.io/badge/firebase-20.0.1-orange.svg)](https://firebase.google.com)
[![TypeScript](https://img.shields.io/badge/typescript-5.9-blue.svg)](https://www.typescriptlang.org)

</div>

---

## 📋 專案簡介

GigHub 是一個企業級工地施工進度追蹤管理系統，採用現代化前端架構與 Firebase 雲端服務，為建築業提供完整的專案管理解決方案。

### 核心特點

- 🏗️ **多租戶架構** - 支援組織、團隊、夥伴的複雜權限管理
- 🔐 **安全優先** - Firestore Security Rules 保護資料安全
- 📊 **即時同步** - Firebase Realtime 即時資料更新
- 🎨 **企業級 UI** - 基於 ng-alain 與 ng-zorro-antd 的專業介面
- 🧩 **模組化設計** - Blueprint 插件式架構，靈活擴展
- 📱 **響應式設計** - 支援桌面、平板、手機多種裝置

---

## 🚀 快速開始

### 環境需求

- **Node.js**: 20.x (LTS)
- **Yarn**: 1.22.x+
- **Angular CLI**: 20.3.0+
- **Firebase CLI**: 13.x+

### 安裝步驟

```bash
# 1. 安裝依賴
yarn install

# 2. 複製環境變數設定
cp .env.example .env

# 3. 設定 Firebase 憑證
# 編輯 .env 填入 Firebase 專案資訊

# 4. 啟動開發伺服器
yarn start

# 應用將在 http://localhost:4200/ 啟動
```

### Firebase Functions 設定

```bash
# 安裝所有 Functions 依賴
yarn functions:install

# 建置所有 Functions
yarn functions:build

# 部署 Functions
firebase deploy --only functions

# 或部署特定 Function
firebase deploy --only functions:ai
firebase deploy --only functions:calculation
```

---

## 📁 專案結構

**本專案採用 Event-Sourced, Causality-Driven 架構，分離核心系統與前端應用：**

```
ng-gighub/
├── core-system/                 # 後端核心系統 (Event-Sourced, Causality-Driven)
│   ├── src/
│   │   ├── aggregates/          # 核心 Aggregate 容器
│   │   │   ├── TaskAggregate.ts
│   │   │   ├── InvoiceAggregate.ts
│   │   │   └── FieldLogAggregate.ts
│   │   ├── events/              # 事件定義（Events are Facts）
│   │   │   ├── BaseEvents.ts
│   │   │   ├── TaskEvents.ts
│   │   │   ├── InvoiceEvents.ts
│   │   │   └── FieldLogEvents.ts
│   │   ├── repositories/        # 事件儲存與回放
│   │   │   └── EventStore.ts
│   │   ├── services/            # 核心業務服務 / Saga / ProcessManager
│   │   ├── projections/         # Read Model / Query (State = Derived)
│   │   └── utils/               # 工具、共用函數
│   │       ├── EventBus.ts
│   │       ├── IDGenerator.ts
│   │       └── TimeUtils.ts
│   └── tests/                   # 單元測試
│
├── angular-app/                 # SaaS 前端 (Angular)
│   └── src/
│       ├── app/
│       │   ├── core/            # 核心模組（服務、守衛、攔截器）
│       │   ├── features/        # 業務功能模組（Tasks, FieldLog, Invoice）
│       │   ├── shared/          # 共用元件 / service
│       │   └── layout/          # 版面配置元件
│       ├── assets/              # 靜態資源
│       └── environments/        # 環境設定
│
├── src/                         # 原始 Angular 程式碼（保留向下相容）
├── functions-*/                 # Firebase Cloud Functions
│   ├── functions-ai/            # AI 影像分析功能
│   ├── functions-calculation/   # 計算與統計功能
│   ├── functions-event/         # 事件處理功能
│   ├── functions-integration/   # 第三方整合功能
│   └── functions-scheduler/     # 定時任務功能
├── docs/                        # 專案文檔
│   ├── 00-index/                # 總覽與導航
│   ├── 02-paradigm/             # 系統範式（核心原則）
│   ├── 03-architecture/         # 架構設計
│   ├── 04-core-model/           # 核心模型（Event, Causality, Time）
│   └── dev/                     # 開發文檔
├── .github/                     # GitHub 設定
│   ├── copilot-instructions.md  # GitHub Copilot 指引
│   ├── instructions/            # 詳細開發指引
│   └── agents/                  # 自訂 AI 代理
├── 架構樹.md                    # 架構樹說明文檔
└── firebase.json                # Firebase 專案設定
```

---

## 🏗️ 系統架構

### 核心架構原則: Event-Sourced, Causality-Driven

本系統採用 **Event Sourcing** 和 **Causality-Driven** 架構，提供完整的事件溯源和因果追蹤能力：

#### 四大核心原則

1. **Event = Fact（事件即事實）**
   - 事件描述**已經發生**的事情，不是命令或意圖
   - 所有業務變更都記錄為不可變事件

2. **State = Derived（狀態即衍生）**
   - 所有狀態都從事件重播得出
   - 狀態不是真實來源，事件才是

3. **Causality = Explicit（因果必明確）**
   - 每個事件都明確記錄其成因、觸發者、所屬流程
   - 完整的因果鏈追蹤能力

4. **Replay = Deterministic（重播即確定）**
   - 相同的事件序列，必然產生相同的狀態
   - 支援時間旅行和狀態重建

### 架構分層

```
┌─────────────────────────────────────┐
│     Angular App (SaaS Frontend)     │  ← 用戶界面層
├─────────────────────────────────────┤
│     Features (業務功能模組)         │  ← 功能層
├─────────────────────────────────────┤
│   Core System (Event-Sourced)       │  ← 核心業務邏輯
│   ├─ Aggregates (聚合根)            │
│   ├─ Events (事件定義)              │
│   ├─ Projections (投影/讀模型)      │
│   └─ Saga/Process Manager           │
├─────────────────────────────────────┤
│   Event Store (事件存儲)            │  ← 持久化層
│   └─ Firebase/Firestore             │
└─────────────────────────────────────┘
```

### 技術棧

| 層級 | 技術 | 版本 |
|------|------|------|
| **前端框架** | Angular | 20.3.0 |
| **UI 框架** | ng-alain + ng-zorro-antd | 20.1.0 + 20.3.1 |
| **狀態管理** | Angular Signals | - |
| **後端服務** | Firebase/Firestore | 20.0.1 |
| **語言** | TypeScript | 5.9 |
| **目標** | ES2022 | - |

### 核心設計原則

1. **Event-Sourced Architecture**: 所有業務變更通過事件記錄
2. **Causality Tracking**: 完整的因果關係追蹤
3. **Repository 模式**: 所有資料存取透過 Repository 層
4. **Aggregate Pattern**: 使用 DDD 聚合根管理業務邏輯
5. **CQRS**: 讀寫分離，投影優化查詢
6. **Standalone Components**: 使用 Angular 最新元件架構
7. **Signals**: 現代化響應式狀態管理

詳細架構文檔請參閱：
- **[core-system/README.md](core-system/README.md)** - 核心系統說明
- **[angular-app/README.md](angular-app/README.md)** - Angular 應用說明
- **[架構樹.md](架構樹.md)** - 完整架構樹
- **[docs/02-paradigm/](docs/02-paradigm/)** - 系統範式文檔

---

## 📚 文檔導覽

### 開發者必讀

- **[docs/README.md](docs/README.md)** - 文檔總覽與導航
- **[docs/COPILOT_MEMORY_GUIDE.md](docs/COPILOT_MEMORY_GUIDE.md)** - 🧠 GitHub Copilot Memory 使用指南
- **[原則.md](原則.md)** - GigHub 系統設計原則
- **[Task.md](Task.md)** - 需求提交模板
- **[AGENTS.md](AGENTS.md)** - AI Agent 使用指南

### 架構與設計

- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - 系統架構總覽
- **[docs/architecture/](docs/architecture/)** - 詳細架構文檔
- **[docs/blueprint-ownership-membership.md](docs/blueprint-ownership-membership.md)** - Blueprint 權限模型

### 實作指引

- **[docs/IMPLEMENTATION_PROGRESS.md](docs/IMPLEMENTATION_PROGRESS.md)** - 實作進度追蹤
- **[docs/PHASE2_IMPLEMENTATION_PLAN.md](docs/PHASE2_IMPLEMENTATION_PLAN.md)** - 第二階段計畫
- **[docs/discussions/](docs/discussions/)** - 詳細任務規劃與討論

### 分析報告

- **[docs/analysis/](docs/analysis/)** - 技術分析與評估報告
- **[docs/CODE_OPTIMIZATION_ANALYSIS.md](docs/CODE_OPTIMIZATION_ANALYSIS.md)** - 程式碼優化分析

---

## 🤖 GitHub Copilot 整合

本專案完整整合 GitHub Copilot，提供智能程式碼生成與開發協助。

### Copilot 功能

✅ **Angular 20 最佳實踐**
- Standalone Components
- Signals 狀態管理
- 新控制流語法 (@if, @for, @switch)
- 依賴注入使用 inject()

✅ **框架整合**
- ng-alain 商業元件
- ng-zorro-antd UI 元件
- Firebase/Firestore 資料存取
- RxJS 響應式程式設計

✅ **MCP 工具**（Model Context Protocol）
- **Context7**: 查詢最新函式庫文檔
- **Sequential-Thinking**: 多步驟問題解決
- **Software-Planning-Tool**: 功能規劃與追蹤

### 使用範例

在 GitHub Copilot Chat 中嘗試：

```
@workspace 如何建立一個新的 Angular 元件？
```

```
@workspace 產生一個從 Firestore 讀取任務的列表元件
```

```
@workspace 使用 Context7 展示 Angular Signals 用法
```

### 設定文檔

- **[.github/copilot-instructions.md](.github/copilot-instructions.md)** - 主要指引
- **[.github/instructions/](.github/instructions/)** - 詳細框架指引
- **[.github/agents/](.github/agents/)** - 自訂 AI 代理

---

## 🛠️ 開發指令

### 前端開發

```bash
# 啟動開發伺服器
yarn start
# 或
ng serve

# 建置生產版本
yarn build
# 或
ng build --configuration production

# 執行測試
yarn test

# 執行 E2E 測試
yarn e2e

# Lint 檢查
yarn lint

# 格式化程式碼
yarn format
```

### Firebase Functions

```bash
# 安裝所有 Functions 依賴
yarn functions:install

# 建置所有 Functions
yarn functions:build

# 啟動 Firebase Emulator
yarn functions:emulate
# 或
firebase emulators:start

# 部署所有 Functions
yarn functions:deploy:all
# 或
firebase deploy --only functions

# 部署特定 Function
yarn functions:deploy:ai
yarn functions:deploy:calc
yarn functions:deploy:event

# 查看 Functions 日誌
yarn functions:logs
# 或
firebase functions:log

# 查看特定 Function 日誌
yarn functions:logs:ai
```

### Firebase 管理

```bash
# 設定 Secret
firebase functions:secrets:set GEMINI_API_KEY

# 查看所有 Secrets
firebase functions:secrets:access

# 部署 Firestore Rules
firebase deploy --only firestore:rules

# 部署 Firestore Indexes
firebase deploy --only firestore:indexes

# 部署 Storage Rules
firebase deploy --only storage
```

---

## 🧪 測試

### 單元測試

```bash
# 執行所有測試
yarn test

# 執行測試並產生覆蓋率報告
yarn test:coverage

# 監聽模式執行測試
yarn test:watch
```

### E2E 測試

```bash
# 執行 E2E 測試
yarn e2e

# 使用特定瀏覽器
yarn e2e --browser chrome
```

---

## 📦 部署

### 前端部署

```bash
# 建置生產版本
yarn build

# 部署到 Firebase Hosting
firebase deploy --only hosting
```

### Functions 部署

```bash
# 部署所有 Functions
firebase deploy --only functions

# 部署特定 codebase
firebase deploy --only functions:ai,functions:calculation
```

### 完整部署

```bash
# 部署所有服務（Hosting + Functions + Rules）
firebase deploy
```

---

## 🤝 貢獻指南

我們歡迎任何形式的貢獻！

### 貢獻流程

1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交變更 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

### 開發規範

- 遵循 [原則.md](原則.md) 中的設計原則
- 使用 GitHub Copilot 協助開發
- 確保所有測試通過
- 更新相關文檔

---

## 📄 授權

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

---

## 🙏 致謝

本專案基於以下優秀開源專案：

- [Angular](https://angular.dev) - 前端框架
- [ng-alain](https://ng-alain.com) - 企業級 UI 解決方案
- [ng-zorro-antd](https://ng.ant.design) - Ant Design Angular 實作
- [Firebase](https://firebase.google.com) - 後端服務平台
- [AngularFire](https://github.com/angular/angularfire) - Angular Firebase 整合

---

## 📞 聯絡資訊

如有任何問題或建議，歡迎透過以下方式聯絡：

- **GitHub Issues**: [提交問題](https://github.com/7Spade/ng-gighub/issues)
- **GitHub Discussions**: [參與討論](https://github.com/7Spade/ng-gighub/discussions)

---

<div align="center">
Made with ❤️ by GigHub Team
</div>
