# ng-lin 專案完整待辦清單
## 基於 PR #4 分析與討論

**建立日期**: 2025-12-27  
**參考來源**: [PR #4](https://github.com/7Spade/ng-lin/pull/4)  
**總預估時間**: 6 週 (1.5 個月)

---

## 📋 目錄

1. [執行摘要](#執行摘要)
2. [🔴 Critical Priority - 基礎架構](#-critical-priority---基礎架構)
3. [🟡 Medium Priority - 模組整合](#-medium-priority---模組整合)
4. [🟢 Low Priority - 文檔與工具](#-low-priority---文檔與工具)
5. [實施路線圖](#實施路線圖)
6. [參考資源](#參考資源)

---

## 執行摘要

本待辦清單基於 PR #4 的深度分析，整合了以下關鍵議題：

### 關鍵發現

1. **架構修正**: Contract 模組正確定位為 L-1 (Foundation Layer)，不屬於 L0/L1/L2 三層模型
   - 來源: [Comment #3694202572](https://github.com/7Spade/ng-lin/pull/4#issuecomment-3694202572)
   - 來源: [Comment #3694207456](https://github.com/7Spade/ng-lin/pull/4#issuecomment-3694207456)

2. **GitHub 自動遞增編號系統**: 完全可以落地實現
   - 來源: [Comment #3694183243](https://github.com/7Spade/ng-lin/pull/4#issuecomment-3694183243)
   - 實現方案: Firestore Transaction Counter

3. **7 個關鍵實施缺口**: 已識別並提供解決方案
   - 來源: [Comment #3694192271](https://github.com/7Spade/ng-lin/pull/4#issuecomment-3694192271)
   - 來源: [PR Description](https://github.com/7Spade/ng-lin/pull/4#issue-3765018371)

### 優先級分佈

- 🔴 **Critical (3 項)**: 基礎架構，必須優先完成
- 🟡 **Medium (2 項)**: 模組整合，影響功能完整性
- 🟢 **Low (2 項)**: 文檔與開發體驗改善

---

## 🔴 Critical Priority - 基礎架構

### Gap 1: Contract Module (L-1 Foundation Layer) - 最高優先級 ⭐

**狀態**: 🔴 未實現  
**預估工作量**: 5 天  
**優先級**: CRITICAL - 整個系統的基礎  
**依賴**: 無（獨立於其他模組）

#### 問題描述

Contract 模組完全缺失，但它是 L-1 Foundation Layer，為整個專案提供法律與商業基礎。所有 L0/L1/L2 層級都依賴於 Contract 提供的 context。

#### 架構定位（重要修正）

```
L-1: Contract Layer (Foundation) - 法律與商業基礎
  ↓ 定義專案存在和邊界
L0: Governance Layer - 規則與權限（使用 Contract context）
  ↓ 定義執行規則
L1: Fact Layer - 不可變事件（在 Contract+Governance 框架下）
  ↓ 記錄發生的事情
L2: Derived Layer - 計算洞察（從 L1，在 Contract 邊界內）
```

#### L-1 Contract vs L0 Governance

| 層級 | Contract (L-1) | Governance (L0) |
|------|----------------|-----------------|
| **目的** | 定義專案存在本身 | 定義執行規則 |
| **內容** | 合約條款、範圍、雙方權責 | 審批流程、權限矩陣 |
| **生命週期** | 專案開始前簽訂 | 合約簽訂後配置 |
| **變更性** | 需雙方同意修約 | 可依合約範圍調整 |
| **法律效力** | 具法律約束力 | 執行層面規範 |

#### 實施位置

```
src/app/core/
├── contract/                    # L-1: Foundation Layer (新建)
│   ├── models/
│   │   ├── contract.model.ts
│   │   ├── party.model.ts
│   │   ├── scope.model.ts
│   │   ├── budget.model.ts
│   │   ├── timeline.model.ts
│   │   └── legal-terms.model.ts
│   ├── services/
│   │   ├── contract.service.ts
│   │   └── contract-lifecycle.service.ts
│   ├── repository/
│   │   └── contract.repository.ts
│   └── events/
│       └── contract.events.ts
```

#### 核心功能清單

- [ ] 1.1 Contract 資料模型定義
- [ ] 1.2 Contract 狀態管理
- [ ] 1.3 Contract Service 實現
- [ ] 1.4 Contract Repository
- [ ] 1.5 Contract Events
- [ ] 1.6 與其他層級整合

---

### Gap 2: Policies Layer (L0 擴充) - 治理規則統一管理

**狀態**: 🔴 未實現  
**預估工作量**: 3 天  
**優先級**: CRITICAL  
**依賴**: Gap 1 (Contract Module) 必須先完成

#### 問題描述

Blueprint 架構定義的 Policy 層尚未實現，導致 L0 治理規則散落各處，缺乏統一管理。

#### 核心功能清單

- [ ] 2.1 Policy 資料模型
- [ ] 2.2 PolicyEngine Service
- [ ] 2.3 與 Contract 整合
- [ ] 2.4 與 Three-Layer Model 整合

---

### Gap 3: Asset/File Management Module - 資產與文件管理

**狀態**: 🔴 未實現  
**預估工作量**: 3 天  
**優先級**: CRITICAL  
**依賴**: Gap 1 (Contract Module)

#### 問題描述

文件和資產管理模組完全缺失，無法管理圖紙、照片、文檔等重要資產。

#### 核心功能清單

- [ ] 3.1 Asset 資料模型
- [ ] 3.2 Cloud Storage 整合
- [ ] 3.3 Asset Service
- [ ] 3.4 Asset Repository
- [ ] 3.5 UI 元件
- [ ] 3.6 與 Contract 整合

---

## 🟡 Medium Priority - 模組整合

### Gap 4: Task Module Integration - 任務模組標準化

**狀態**: 🟡 部分實現但未整合  
**預估工作量**: 2 天  
**優先級**: MEDIUM  
**依賴**: Gap 1, Gap 2

#### 核心功能清單

- [ ] 4.1 Blueprint 整合層
- [ ] 4.2 與 Contract 整合
- [ ] 4.3 與 L0 Governance 整合
- [ ] 4.4 與 L1 Events 整合

---

### Gap 5: Auto-Incrementing ID System - GitHub 風格編號系統

**狀態**: 🟡 未實現  
**預估工作量**: 2 天  
**優先級**: MEDIUM  
**依賴**: 無

**參考來源**: [Comment #3694183243](https://github.com/7Spade/ng-lin/pull/4#issuecomment-3694183243)

#### GitHub ID 系統特性

- 共用編號池：Issue 和 PR 共用同一個編號序列
- 全域唯一性：每個 repository 有獨立的編號系統
- 永不重複：編號永遠遞增
- 快速引用：可透過編號快速引用和追蹤

#### 實施方案

**Transaction-Based Counter** ⭐ 推薦用於 MVP
- ✅ 完全原子性，無重複編號
- ✅ 簡單可靠
- ✅ 效能: <200ms ID 生成延遲

#### 核心功能清單

- [ ] 5.1 Counter 資料模型
- [ ] 5.2 IdCounterService
- [ ] 5.3 ReferenceResolverService
- [ ] 5.4 Firestore 整合

---

## 🟢 Low Priority - 文檔與工具

### Gap 6: Implementation Bridge Documentation - 實施對照文件

**狀態**: 🟢 缺失  
**預估工作量**: 3 天  
**優先級**: LOW

#### 文件內容清單

- [ ] 6.1 implementation-alignment.md
- [ ] 6.2 code-structure-mapping.md
- [ ] 6.3 quick-start-guide.md

---

### Gap 7: Tech Stack Guide - 技術棧指南

**狀態**: 🟢 缺失  
**預估工作量**: 2 天  
**優先級**: LOW

#### 文件內容清單

- [ ] 7.1 tech-stack-guide.md
- [ ] 7.2 angular-20-patterns.md
- [ ] 7.3 firebase-integration.md
- [ ] 7.4 signals-best-practices.md

---

## 實施路線圖

### Week 1-2: Critical Foundation

**Week 1**: Gap 1 - Contract Module (L-1)
- Day 1-2: Contract 資料模型與狀態管理
- Day 3-5: ContractService 與 Repository

**Week 2**: 
- Day 1-2: Contract Events 與 L0/L1/L2 整合
- Day 3-5: Gap 2 - Policies Layer

### Week 3-4: Core Infrastructure

**Week 3**:
- Day 1-2: Gap 5 - ID Counter System
- Day 3-5: Gap 3 - Asset Module Part 1

**Week 4**:
- Day 1-2: Gap 3 - Asset Module Part 2
- Day 3-5: Gap 5 - ID Counter System 完成

### Week 5-6: Integration & Documentation

**Week 5**:
- Day 1-2: Gap 4 - Task Module Integration
- Day 3-5: Gap 6 - Implementation Bridge Documentation

**Week 6**:
- Day 1-2: Gap 7 - Tech Stack Guide
- Day 3-5: 整合測試與驗證

---

## 參考資源

### PR #4 相關連結

- [PR #4 主要描述](https://github.com/7Spade/ng-lin/pull/4#issue-3765018371)
- [Comment #3694183243 - GitHub 自動遞增編號系統](https://github.com/7Spade/ng-lin/pull/4#issuecomment-3694183243)
- [Comment #3694192271 - 專案缺口分析](https://github.com/7Spade/ng-lin/pull/4#issuecomment-3694192271)
- [Comment #3694202572 - Contract 作為 L-1](https://github.com/7Spade/ng-lin/pull/4#issuecomment-3694202572)
- [Comment #3694207456 - L-1/L0/L1/L2 架構](https://github.com/7Spade/ng-lin/pull/4#issuecomment-3694207456)

### 內部文檔

- `.copilot-tracking/BLUEPRINT-IMPLEMENTATION-GUIDE.md`
- `.copilot-tracking/EXECUTIVE-SUMMARY-ZH.md`
- `docs/strategy-governance/blueprint/` 下所有文檔

### 技術文檔

- [Angular 20 Documentation](https://angular.dev)
- [@angular/fire Documentation](https://github.com/angular/angularfire)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Transactions](https://firebase.google.com/docs/firestore/manage-data/transactions)

---

## 附錄：架構圖

### L-1/L0/L1/L2 完整架構

```
┌─────────────────────────────────────────────────────────────────┐
│  L-1: Contract Layer (Foundation)                               │
│  Location: src/app/core/contract/                              │
└─────────────────────────┬───────────────────────────────────────┘
                          │ (provides context to)
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│  L0: Governance Layer                                           │
│  Location: src/app/core/blueprint/policies/                    │
└─────────────────────────┬───────────────────────────────────────┘
                          │ (defines rules for)
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│  L1: Fact Layer                                                 │
│  Location: src/app/core/three-layer-model/                     │
└─────────────────────────┬───────────────────────────────────────┘
                          │ (source for calculations)
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│  L2: Derived Layer                                              │
│  Location: src/app/core/three-layer-model/                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 更新日誌

- **2025-12-27**: 初始建立，基於 PR #4 完整分析
  - 整合 7 個關鍵 gaps
  - 添加 Contract L-1 架構修正
  - 添加 GitHub ID 系統實施方案
  - 建立 6 週實施路線圖

---

**總結**: 本待辦清單提供完整的實施指南，涵蓋從關鍵基礎架構到文檔改善的所有項目。所有技術方案都已驗證可行，預估 6 週可完成全部實施。
