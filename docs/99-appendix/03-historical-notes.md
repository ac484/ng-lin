# 歷史註記 (Historical Notes)

## 專案演化

### Phase 0: 概念驗證 (2024 Q4)
- 建立 Event Sourcing 基礎
- Firebase 整合
- 基本 DDD 模型

### Phase 1: 架構穩定 (2024-2025 Q1)
- 分層模型確立
- ESLint 規則強制執行
- ADR 制度建立

### Phase 2: 因果系統 (2025 Q1)
- CausalEvent 模型
- Event 追蹤與視覺化
- Simulation Engine

### Phase 3: 治理完善 (2025 Q1-Q2)
- RBAC 授權系統
- Contract Versioning
- Schema Evolution

## 重要決策

### 為何選擇 Firebase
- 快速原型驗證
- Real-time 能力
- 降低基礎設施複雜度

**Trade-off**: 受限於 Firebase 的查詢能力

### 為何不用現成 Event Store
- 學習與客製化空間
- 整合 Firebase 生態
- 符合專案規模

**Trade-off**: 需自行實作功能

### 為何強調因果
- 審計與追蹤需求
- 決策模擬能力
- 超越純粹 Event Sourcing

**Trade-off**: 增加系統複雜度

## 學到的教訓

### 成功
- ✅ 早期建立架構規則
- ✅ ESLint 自動化檢查
- ✅ 文件即程式碼

### 挑戰
- ⚠️ Projection 一致性管理
- ⚠️ 性能優化需持續
- ⚠️ 開發者學習曲線

## 未來方向

### 短期 (2025 Q2)
- Context System 完善
- Policy Engine 強化
- Audit System 完整

### 中期 (2025 Q3-Q4)
- AI 輔助分析
- 進階模擬能力
- 多租戶支援

### 長期 (2026+)
- 分散式部署
- 更多儲存後端
- 社群生態建立

---

**參考**: [ADR 目錄](../adr/) | [系統目標](../01-vision/system-goals.md)
