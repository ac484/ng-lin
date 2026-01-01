# ADR-0002: ESLint Architecture Enforcement

## Status
✅ Accepted & Implemented (2025-12-30)

## Context
ng-lin 採用嚴格分層架構（Core/Infrastructure/Features）需要自動化強制執行邊界規則。人工審查容易遺漏，技術債務會累積。

專案未使用 Nx，需要輕量級解決方案來防止架構違規。

## Decision
實現自定義 ESLint 規則 `ng-lin/no-architecture-violations` 強制執行 11 項架構邊界：

### 核心規則
1. Domain 層隔離 - 不可 import Process/UI/Firebase
2. Process 層隔離 - 不可 import UI
3. Capability 層隔離 - 不可 import Domain 私有模型
4. UI 層隔離 - 須透過 Contract 訪問 Domain
5. Infrastructure ⇄ Feature 隔離
6. Core/Feature 不可直接 import Firebase（須透過 Repository）
7. 跨 Feature 須透過 Contract
8. 禁止 `new Error()`（須使用 ErrorFactory）
9. 禁止 `throw`（須回傳 Result.Err()）

### 實現
- 檔案: `eslint-rules/no-architecture-violations.js` (195 lines)
- 配置: `eslint.config.mjs` 啟用規則
- CI: `npm run lint:ts` 自動執行

## Rationale
### 為何 ESLint 而非 Nx？
- ✅ 輕量，無需引入 Nx 依賴
- ✅ 精確控制規則邏輯
- ✅ 整合現有 ESLint 配置
- ✅ 自定義錯誤訊息

### 為何強制 Result 模式？
傳統 `throw` 使錯誤隱性化，違反「顯性錯誤處理」原則。Result 模式強制呼叫方處理錯誤。

```typescript
// BAD: 隱性錯誤
throw new Error('Invalid');

// GOOD: 顯性錯誤
return err(ErrorFactory.validation('Invalid'));
```

## Consequences
### 正面
- 架構穩定性：錯誤無法通過 CI
- 開發者引導：清晰錯誤訊息
- 技術債務預防

### 負面
- 學習曲線：需理解 Result 模式
- 維護成本：規則需隨架構演進

## Follow-up
- [ ] 擴展規則支援 Event Bus 使用檢查
- [ ] 整合 IDE 實時提示
- [ ] 考慮效能優化
