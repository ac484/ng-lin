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

```
ng-gighub/
├── src/                          # 前端應用程式碼
│   ├── app/
│   │   ├── core/                # 核心模組（服務、守衛、攔截器）
│   │   ├── features/            # 可重用業務功能模組（跨路由能力）
│   │   ├── routes/              # 頁面路由元件
│   │   ├── shared/              # 共用元件、指令、管道
│   │   └── layout/              # 版面配置元件
│   ├── assets/                  # 靜態資源
│   └── environments/            # 環境設定
├── functions-*/                 # Firebase Cloud Functions
│   ├── functions-ai/            # AI 影像分析功能
│   ├── functions-calculation/   # 計算與統計功能
│   ├── functions-event/         # 事件處理功能
│   ├── functions-integration/   # 第三方整合功能
│   └── functions-scheduler/     # 定時任務功能
├── docs/                        # 平台文檔（詳見 docs/README.md 與 docs/INDEX.md）
│   ├── strategy-governance/     # 架構視圖、原則、總覽
│   ├── automation-delivery/     # CI/CD、Event Bus、部署手冊
│   ├── identity-tenancy/        # 身份驗證與多租戶作業套件
│   ├── change-control/          # API 合約與資料模型
│   ├── enablement-experience/   # 設計系統、UI 主題、入門指南
│   ├── security-compliance/     # 安全基線與審計文件
│   ├── observability-operations/# 監控摘要與 Runbook
│   ├── ai-governance/           # AI 治理指引
│   ├── reference/               # 跨域參考文件
│   └── legacy-archive/          # 歷史/待整合文件
├── .github/                     # GitHub 設定
│   ├── copilot-instructions.md  # GitHub Copilot 指引
│   ├── instructions/            # 詳細開發指引
│   └── agents/                  # 自訂 AI 代理
├── firestore.rules              # Firestore 安全規則
├── firestore.indexes.json       # Firestore 索引設定
├── storage.rules                # Storage 安全規則
└── firebase.json                # Firebase 專案設定
```

---

## 🏗️ 系統架構

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

1. **三層架構**: UI → Service → Repository → Firestore
2. **Repository 模式**: 所有資料存取透過 Repository 層
3. **事件驅動**: 模組間透過 BlueprintEventBus 通訊
4. **Standalone Components**: 使用 Angular 最新元件架構
5. **Signals**: 現代化響應式狀態管理

詳細架構文檔請參閱：[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## 📚 文檔導覽

### 開發者必讀

- **[docs/README.md](docs/README.md)** - 文檔總覽與治理規則
- **[docs/INDEX.md](docs/INDEX.md)** - 完整文件索引與路線圖
- **[AGENTS.md](AGENTS.md)** - AI Agent 使用指南

### 架構與設計

- **[strategy-governance/architecture/01-architecture-overview.md](docs/strategy-governance/architecture/01-architecture-overview.md)** - 系統架構總覽
- **[strategy-governance/principles/01-principles-core-principles.md](docs/strategy-governance/principles/01-principles-core-principles.md)** - 核心原則
- **[enablement-experience/design/06-blueprint-ownership-membership.md](docs/enablement-experience/design/06-blueprint-ownership-membership.md)** - Blueprint 權限模型

### 實作指引

- **[strategy-governance/overview/07-implementation-progress.md](docs/strategy-governance/overview/07-implementation-progress.md)** - 實作進度追蹤
- **[automation-delivery/event-bus/](docs/automation-delivery/event-bus/)** - Event Bus 作業文件
- **[security-compliance/audit/](docs/security-compliance/audit/)** - Audit Suite 生產文件

### 分析報告

- **[strategy-governance/overview/02-project-analysis-summary.md](docs/strategy-governance/overview/02-project-analysis-summary.md)** - 專案分析摘要
- **[strategy-governance/overview/08-analysis-index.md](docs/strategy-governance/overview/08-analysis-index.md)** - 分析索引

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
- **context7**: 查詢最新函式庫文檔
- **sequential-thinking**: 多步驟問題解決
- **software-planning-tool**: 功能規劃與追蹤

### 使用範例

在 GitHub Copilot Chat 中嘗試：

```
@workspace 如何建立一個新的 Angular 元件？
```

```
@workspace 產生一個從 Firestore 讀取任務的列表元件
```

```
@workspace 使用 context7 展示 Angular Signals 用法
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
