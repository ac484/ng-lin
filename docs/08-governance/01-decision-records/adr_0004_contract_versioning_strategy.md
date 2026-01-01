# ADR-0004: Contract Versioning Strategy

## Status
✅ Accepted & Implemented (2025-12-30)

## Context
Feature 模組透過 Contract 通信。Contract 需演進但舊版 Feature 可能未升級，需要：
- 新舊 Contract 共存
- 破壞性變更明確標示
- 向後兼容性保證

## Decision
採用語義化版本 (Semantic Versioning) + 相容性檢查器：

### 版本模型
```typescript
interface ContractVersion {
  major: number;  // 破壞性變更
  minor: number;  // 向後兼容新功能
  patch: number;  // 向後兼容修正
}

interface VersionedContract {
  readonly _version: ContractVersion;
  readonly _contractName: string;
}
```

### 相容性規則
1. **Major 版本必須完全相同** - `v1.x.x` 與 `v2.x.x` 不相容
2. **Minor/Patch 向後兼容** - 提供版本 >= 要求版本
   - `v1.2.0` 滿足 `v1.0.0`
   - `v1.0.0` 不滿足 `v1.2.0`

### 實現
```typescript
class ContractCompatibilityChecker {
  static check<T extends VersionedContract>(
    contract: T,
    requiredVersion: ContractVersion
  ): Result<CompatibilityCheckResult, ApplicationError>
}
```

- 檔案: `version.ts` (2369 bytes), `compatibility.check.ts` (2518 bytes)
- 錯誤碼: `GOVERNANCE_CONTRACT_INCOMPATIBLE_VERSION`

## Rationale
### 為何語義化版本？
- ✅ 業界標準
- ✅ 明確表達變更影響
- ✅ 工具鏈支援
- ✅ 易於自動化

### 為何需要檢查器？
防止運行時因版本不匹配崩潰。檢查器提供編譯時和運行時雙重保護。

### 為何 Result 模式？
- ✅ 顯性錯誤處理
- ✅ 強制處理不相容
- ✅ 符合架構規則（不使用 throw）

## Consequences
### 正面
- 安全 Contract 演進
- 明確變更影響
- 提前發現問題
- 文檔即代碼

### 負面
- 版本管理開銷
- Major 升級需遷移所有消費者
- 測試多版本共存

## Follow-up
- [ ] 實現 ContractMigration 介面協助升級
- [ ] ESLint 規則檢查 Contract 實現 VersionedContract
- [ ] Contract Registry 集中管理版本歷史
- [ ] 自動化版本檢查整合 CI
