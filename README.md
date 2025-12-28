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

GigHub 是一個企業級工地施工進度追蹤管理系統，採用現代化前端架構與 Firebase 雲端服務。

### 核心特點

- 🏗️ **多租戶架構** - 支援組織、團隊、夥伴的複雜權限管理
- 🔐 **安全優先** - Firestore Security Rules 保護資料安全
- 📊 **即時同步** - Firebase Realtime 即時資料更新
- 🎨 **企業級 UI** - 基於 ng-alain 與 ng-zorro-antd 的專業介面
- 🧩 **模組化設計** - Blueprint 插件式架構
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

# 2. 設定環境變數
cp .env.example .env

# 3. 啟動開發伺服器
yarn start
```

### Firebase Functions 設定

```bash
# 安裝 Functions 依賴
yarn functions:install

# 建置 Functions
yarn functions:build

# 部署 Functions
firebase deploy --only functions
```

---

## 📁 專案結構

```
ng-gighub/
├── src/                          # 前端應用程式碼
│   ├── app/
│   │   ├── core/                # 核心模組
│   │   ├── features/            # 業務功能模組
│   │   ├── routes/              # 頁面路由
│   │   ├── shared/              # 共用元件
│   │   └── layout/              # 版面配置
│   └── environments/            # 環境設定
├── functions-*/                 # Firebase Cloud Functions
├── docs/                        # 專案文檔
├── .github/                     # GitHub 設定
└── firebase.json                # Firebase 設定
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

### 核心設計原則

1. **三層架構**: UI → Service → Repository → Firestore
2. **Repository 模式**: 所有資料存取透過 Repository 層
3. **事件驅動**: 模組間透過 BlueprintEventBus 通訊
4. **Standalone Components**: Angular 最新元件架構
5. **Signals**: 現代化響應式狀態管理

---

## 📚 文檔導覽

### 開發者必讀

- **[docs/INDEX.md](docs/INDEX.md)** - 文檔總覽
- **[AGENTS.md](AGENTS.md)** - AI Agent 使用指南

### 架構與設計

- **[docs/strategy-governance/](docs/strategy-governance/)** - 系統架構
- **[docs/identity-tenancy/](docs/identity-tenancy/)** - 身份與權限

### 實作指引

- **[docs/automation-delivery/](docs/automation-delivery/)** - CI/CD 與部署
- **[docs/enablement-experience/](docs/enablement-experience/)** - 開發入門

---

## 🤖 GitHub Copilot 整合

本專案完整整合 GitHub Copilot，提供智能程式碼生成與開發協助。

### Copilot 功能

✅ **Angular 20 最佳實踐**
- Standalone Components
- Signals 狀態管理
- 新控制流語法 (@if, @for, @switch)

✅ **框架整合**
- ng-alain 商業元件
- ng-zorro-antd UI 元件
- Firebase/Firestore 資料存取

✅ **MCP 工具**
- **context7**: 查詢最新函式庫文檔
- **sequential-thinking**: 多步驟問題解決

### 設定文檔

- **[.github/copilot-instructions.md](.github/copilot-instructions.md)** - 主要指引
- **[.github/instructions/](.github/instructions/)** - 框架指引
- **[.github/agents/](.github/agents/)** - 自訂 AI 代理

---

## 🛠️ 開發指令

### 前端開發

```bash
yarn start          # 啟動開發伺服器
yarn build          # 建置生產版本
yarn test           # 執行測試
yarn lint           # Lint 檢查
yarn format         # 格式化程式碼
```

### Firebase Functions

```bash
yarn functions:install      # 安裝依賴
yarn functions:build        # 建置 Functions
yarn functions:deploy:all   # 部署所有 Functions
firebase emulators:start    # 啟動 Emulator
```

---

## 📦 部署

### 前端部署

```bash
yarn build
firebase deploy --only hosting
```

### Functions 部署

```bash
firebase deploy --only functions
```

---

## 🤝 貢獻指南

1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交變更 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

---

## 📄 授權

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

---

<div align="center">
Made with ❤️ by GigHub Team
</div>
