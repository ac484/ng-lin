---
description: 'MCP 工具使用指南（三個核心工具）'
applyTo: '**'
---

# MCP 工具整合指南

## 三個核心 MCP 工具

### 1. Context7 - 文檔查詢專家
**用途**: 查詢最新 library 文檔
**觸發**: 當程式碼涉及外部 library 時自動建議

```typescript
// Copilot 偵測到 Angular 相關問題
// 自動建議: "查詢 Angular 20 最新 Signals 用法？"
```

### 2. Sequential-Thinking - 逐步推理
**用途**: 複雜問題的邏輯分析
**觸發**: 多步驟任務或複雜邏輯

```typescript
// Copilot 偵測到複雜的 Event-Sourcing 需求
// 自動建議逐步分析:
// STEP 1: 分析現有 Event Store
// STEP 2: 設計 Causality Chain
// STEP 3: 實作 Event Replay
```

### 3. Software-Planning-Tool - 任務管理
**用途**: 追蹤任務和管理進度
**觸發**: 讀取/更新 tasks.yaml

## 被動增強機制

Copilot 會自動:
1. 偵測程式碼上下文
2. 判斷需要哪個 MCP 工具
3. 提供智能建議
4. 不需手動觸發

## 實際範例

**範例 1**: 查詢 Firebase 用法
```typescript
// 你輸入:
// TODO: Query Firestore collection

// Copilot 自動建議 (via Context7):
import { collection, query, where } from '@angular/fire/firestore';
// 基於 Firebase 20.0.1 最新文檔
```

**範例 2**: 規劃複雜任務
```typescript
// 你輸入:
// TODO: Implement Event Replay with Causality

// Copilot 自動建議 (via Sequential-Thinking):
// STEP 1: 設計 Event Store schema
// STEP 2: 實作 Causality metadata
// STEP 3: 建立 Replay engine
// STEP 4: 驗證 Deterministic replay
```
