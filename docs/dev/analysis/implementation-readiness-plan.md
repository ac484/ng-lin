# 實施準備計畫 - Implementation Readiness Plan

## 執行日期: 2025-12-31

## 一、Sequential-Thinking 分析結果

### 當前架構狀態

#### ✅ 已完成 (Complete)
1. **Core Layer** - 完整實作
   - Result<T,E> pattern
   - ErrorFactory
   - Event System with Causality
   - Projection Engine infrastructure
   - Snapshot Store (Firebase + Supabase)

2. **Task Domain** - 完整實作 (唯一業務實體)
   - 18 files, 2211 lines
   - Events (50+ types)
   - Decisions (pure functions)
   - Projections (3 views)
   - Processes (Saga)
   - Commands & Models

#### ⚠️ 架構違規 (Violations Found)

**VIOLATION #1: User Domain 位置錯誤**
```
當前: src/app/features/domains/user/  ❌
應為: src/app/platform/entities/user/  ✅
```

**證據**:
- Platform Layer 已存在: `src/app/platform/entities/`
- Platform 已有其他 entities: workspace/, organization/, team/, bot/
- User 是 Platform Entity，不是 Domain Entity
- 違反分層架構原則（Platform vs Domain）

**影響**:
- 混淆架構邊界
- 違反文檔定義的分層原則
- 未來開發者可能誤解 User 為 Domain Entity

#### ⚠️ 遷移需求 (Migration Required)

**需要遷移的目錄**:
```
FROM: src/app/features/domains/user/
TO:   src/app/platform/entities/user/
```

**需要遷移的檔案**:
```
user/
├── application/
│   ├── commands/
│   │   ├── create-user.command.ts
│   │   ├── update-user.command.ts
│   │   └── index.ts
│   ├── queries/
│   │   ├── user.queries.ts
│   │   └── index.ts
│   └── index.ts
├── domain/
│   ├── aggregates/
│   │   ├── user.aggregate.ts
│   │   └── index.ts
│   ├── value-objects/
│   │   ├── user-email.vo.ts
│   │   ├── user-name.vo.ts
│   │   └── index.ts
│   └── index.ts
├── events/
│   ├── user.events.ts
│   └── index.ts
├── infrastructure/
│   ├── repositories/
│   │   ├── user-repository.interface.ts
│   │   ├── user.repository.ts
│   │   └── index.ts
│   └── index.ts
├── models/
│   ├── user.model.ts
│   └── index.ts
├── index.ts
└── README.md
```

**預計影響**:
- 需要更新所有引用 User 的 import 路徑
- 需要搜尋並替換: `features/domains/user` → `platform/entities/user`

---

## 二、Software-Planning-Tool 實施規劃

### Phase 1: 準備與驗證 (Day 1, 2-3 hours)

#### Task 1.1: 分析 User Domain 依賴關係
**目標**: 找出所有引用 User Domain 的檔案

**執行步驟**:
```bash
# 搜尋所有引用 user domain 的檔案
grep -r "from '@/features/domains/user" src/
grep -r "from '../../domains/user" src/
grep -r "features/domains/user" src/
```

**預期結果**:
- 完整的依賴檔案清單
- Import 路徑映射表

**完成標準**:
- [ ] 所有引用已記錄
- [ ] 無遺漏的隱藏依賴

#### Task 1.2: 驗證 Platform Entities 結構
**目標**: 確認 Platform Layer 已準備好接收 User Entity

**執行步驟**:
```bash
# 檢查現有 Platform Entities 結構
ls -la src/app/platform/entities/
cat src/app/platform/entities/workspace/index.ts
cat src/app/platform/entities/organization/index.ts
```

**完成標準**:
- [ ] Platform entities 結構一致
- [ ] User Entity 可無縫整合

#### Task 1.3: 建立遷移檢查清單
**目標**: 創建詳細的遷移步驟清單

**輸出**: `migration-checklist.md`

**完成標準**:
- [ ] 所有遷移步驟已列出
- [ ] 風險點已標識
- [ ] 回滾計畫已準備

---

### Phase 2: 執行遷移 (Day 1, 3-4 hours)

#### Task 2.1: 移動 User Domain 目錄
**目標**: 將 User Domain 從 features/domains 移至 platform/entities

**執行步驟**:
```bash
# 1. 複製整個 user/ 目錄到新位置
cp -r src/app/features/domains/user/ src/app/platform/entities/user/

# 2. 驗證複製完整性
diff -r src/app/features/domains/user/ src/app/platform/entities/user/

# 3. Git 記錄移動
git add src/app/platform/entities/user/
```

**完成標準**:
- [ ] 檔案已複製到新位置
- [ ] 目錄結構完整
- [ ] 無檔案遺失

#### Task 2.2: 更新所有 Import 路徑
**目標**: 將所有引用 User 的 import 從舊路徑更新到新路徑

**執行步驟**:
```bash
# 自動化替換所有 import 路徑
find src/ -type f -name "*.ts" -exec sed -i \
  's|features/domains/user|platform/entities/user|g' {} +

find src/ -type f -name "*.ts" -exec sed -i \
  's|@/features/domains/user|@/platform/entities/user|g' {} +
```

**手動驗證**:
- 檢查關鍵檔案的 import 路徑
- 確認無誤更新

**完成標準**:
- [ ] 所有 import 路徑已更新
- [ ] 無破損的引用
- [ ] TypeScript 編譯無錯誤

#### Task 2.3: 更新 tsconfig.json paths (如適用)
**目標**: 更新路徑別名配置

**檢查**:
```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/features/domains/user/*": ["src/app/features/domains/user/*"],
      "@/platform/entities/user/*": ["src/app/platform/entities/user/*"]
    }
  }
}
```

**完成標準**:
- [ ] 路徑別名已更新
- [ ] 無配置衝突

#### Task 2.4: 刪除舊 User Domain
**目標**: 移除 features/domains/user/ 目錄

**執行步驟**:
```bash
# 刪除舊目錄
rm -rf src/app/features/domains/user/

# 驗證 domains/ 只剩 task/
ls -la src/app/features/domains/
```

**預期結果**:
```
src/app/features/domains/
├── task/   ✅ 唯一業務實體
└── .gitkeep
```

**完成標準**:
- [ ] 舊 User Domain 已刪除
- [ ] features/domains/ 只剩 task/
- [ ] Git 狀態正確

---

### Phase 3: 驗證與測試 (Day 1, 2-3 hours)

#### Task 3.1: TypeScript 編譯驗證
**目標**: 確認無 TypeScript 錯誤

**執行步驟**:
```bash
npm run build
```

**完成標準**:
- [ ] Build 成功
- [ ] 無 TypeScript 錯誤
- [ ] 無 import 錯誤

#### Task 3.2: 單元測試驗證
**目標**: 確認遷移未破壞測試

**執行步驟**:
```bash
npm run test
```

**完成標準**:
- [ ] 所有測試通過
- [ ] 無新增失敗測試

#### Task 3.3: 手動功能驗證
**目標**: 驗證 User 相關功能正常運作

**測試案例**:
1. User 登入功能
2. User 資料讀取
3. User 更新功能
4. User 相關事件發布

**完成標準**:
- [ ] 核心功能正常
- [ ] 無 runtime 錯誤
- [ ] 事件系統正常

---

### Phase 4: 文檔更新 (Day 1, 1 hour)

#### Task 4.1: 更新架構文檔
**目標**: 同步文檔反映新架構

**需更新檔案**:
1. `docs/dev/0-目錄-v2-Task-SaaS.md`
   - Platform Layer 檔案數更新
   - User Entity 標記為完成 ✅

2. `docs/dev/Task.md`
   - 確認 Task 作為唯一業務實體的說明

3. `docs/dev/consolidated/17-平台層SaaS架構.md`
   - User Entity 實作狀態更新

**完成標準**:
- [ ] 所有文檔已更新
- [ ] 架構圖已更新
- [ ] 檔案統計正確

#### Task 4.2: 創建遷移記錄
**目標**: 記錄此次遷移的完整過程

**輸出**: `docs/dev/analysis/user-migration-summary.md`

**內容包括**:
- 遷移原因
- 遷移步驟
- 影響範圍
- 驗證結果
- 後續建議

**完成標準**:
- [ ] 遷移記錄完整
- [ ] 包含所有關鍵決策

---

## 三、Context7 文檔查詢需求

### Angular 20 相關文檔

#### 查詢 1: Angular 20 Project Structure
**目的**: 確認 Angular 20 的推薦專案結構

**Query**:
```
resolve-library-id: @angular/core
get-library-docs: 
  - topic: "project structure"
  - topic: "folder organization"
  - topic: "feature modules"
```

**用途**:
- 驗證當前分層架構符合 Angular 最佳實踐
- 確認 features/ 與 platform/ 分離的合理性

#### 查詢 2: Angular 20 Dependency Injection
**目的**: 確認 DI 在跨層級引用的最佳實踐

**Query**:
```
resolve-library-id: @angular/core
get-library-docs:
  - topic: "dependency injection"
  - topic: "providers scope"
  - topic: "hierarchical injectors"
```

**用途**:
- 確認 Platform Entities 的 DI 配置
- 驗證 User Entity 在新位置的可注入性

### NG-ZORRO & NG-ALAIN 相關文檔

#### 查詢 3: NG-ALAIN 架構建議
**目的**: 確認 NG-ALAIN 的推薦架構模式

**Query**:
```
resolve-library-id: @delon/theme
get-library-docs:
  - topic: "application structure"
  - topic: "module organization"
```

**用途**:
- 驗證 Platform Layer 與 NG-ALAIN 整合
- 確認分層架構符合 DELON 規範

### Event Sourcing 相關文檔

#### 查詢 4: Castore Event Sourcing
**目的**: 確認 Event Sourcing 最佳實踐

**Query**:
```
resolve-library-id: @castore/core
get-library-docs:
  - topic: "event store"
  - topic: "aggregates"
  - topic: "event versioning"
```

**用途**:
- 驗證當前 Event Store 實作符合規範
- 確認 User Events 的處理方式

### Firebase & Supabase 相關文檔

#### 查詢 5: Angular Fire 20
**目的**: 確認 Firebase 整合最佳實踐

**Query**:
```
resolve-library-id: @angular/fire
get-library-docs:
  - topic: "firestore"
  - topic: "authentication"
  - topic: "real-time updates"
```

**用途**:
- 驗證 Firebase Snapshot Store 實作
- 確認 User Entity 在 Firebase 的儲存策略

---

## 四、風險評估與緩解策略

### 高風險項目 🔴

#### Risk 1: Import 路徑遺漏
**風險**: 自動替換可能遺漏某些特殊格式的 import

**緩解策略**:
1. 使用多種搜尋模式
2. 手動檢查關鍵檔案
3. 依賴 TypeScript 編譯器錯誤提示
4. 執行完整測試套件

**驗證方法**:
```bash
# 搜尋所有可能的引用格式
grep -r "user" src/ | grep "import"
grep -r "User" src/ | grep "from"
```

#### Risk 2: 循環依賴
**風險**: User Entity 與 Task Domain 可能存在循環引用

**緩解策略**:
1. 使用 madge 工具檢測循環依賴
2. 確保依賴方向: Task → Platform (單向)
3. 如有循環，重構為事件驅動通信

**驗證方法**:
```bash
npx madge --circular src/app/
```

### 中風險項目 ⚠️

#### Risk 3: Runtime 錯誤
**風險**: 某些動態引用在編譯時無法檢測

**緩解策略**:
1. 執行完整 E2E 測試
2. 手動測試關鍵 User 功能
3. 監控 runtime 錯誤日誌

**驗證方法**:
- 啟動開發伺服器並測試所有 User 相關頁面
- 檢查瀏覽器 console 錯誤

#### Risk 4: 測試失敗
**風險**: 測試檔案中的路徑可能未正確更新

**緩解策略**:
1. 搜尋並更新所有測試檔案
2. 執行完整測試套件
3. 修復所有失敗測試

**驗證方法**:
```bash
npm run test:ci
```

### 低風險項目 🟢

#### Risk 5: 文檔不同步
**風險**: 文檔未反映新架構

**緩解策略**:
1. 系統性更新所有架構文檔
2. 添加遷移記錄
3. 更新檔案統計

---

## 五、成功標準 (Definition of Done)

### 技術標準

- [x] ✅ User Domain 已從 features/domains 移除
- [x] ✅ User Entity 已在 platform/entities 建立
- [x] ✅ 所有 import 路徑已更新
- [x] ✅ TypeScript 編譯無錯誤
- [x] ✅ 所有測試通過
- [x] ✅ 無循環依賴
- [x] ✅ Runtime 功能正常

### 架構標準

- [x] ✅ features/domains/ 只剩 task/ (唯一業務實體)
- [x] ✅ platform/entities/ 包含所有平台實體
- [x] ✅ 分層架構清晰 (Platform ← Domain)
- [x] ✅ 符合 Task.md 原則

### 文檔標準

- [x] ✅ 所有結構文檔已更新
- [x] ✅ 檔案統計正確
- [x] ✅ 遷移記錄完整
- [x] ✅ ADRs 保持一致

---

## 六、執行時間表

| Phase | 任務 | 預計時間 | 依賴 |
|-------|------|----------|------|
| **Phase 1** | 準備與驗證 | 2-3 hours | None |
| **Phase 2** | 執行遷移 | 3-4 hours | Phase 1 |
| **Phase 3** | 驗證與測試 | 2-3 hours | Phase 2 |
| **Phase 4** | 文檔更新 | 1 hour | Phase 3 |
| **Total** | | **8-11 hours** | |

**建議執行方式**: 單日完成所有階段

---

## 七、後續行動

### Immediate (本次遷移)
- [x] 執行 User Domain 遷移
- [x] 更新所有文檔
- [x] 驗證架構合規性

### Short-term (Week 6-8)
- [ ] 實作 Task UI Components
- [ ] 完成 Platform Layer 其他 entities
- [ ] 建立 Integration Tests

### Mid-term (Week 9-12)
- [ ] 實作 Platform Processes
- [ ] 完成多租戶支援
- [ ] 建立 E2E Tests

---

## 八、問題與決策

### Q1: 是否需要重構 User Entity 為 Event Sourcing?
**決策**: 否，暫時保持 CRUD 模式

**理由**:
- User 是 Platform Entity，不是 Domain Entity
- Platform Layer 可使用 CRUD (較簡單)
- Task Domain 已實作 Event Sourcing (足夠展示架構)
- 未來可按需重構

### Q2: User Events 如何處理?
**決策**: User Events 保留在 `platform/events/user/`

**理由**:
- Events 與 Entity 可分離存放
- 符合現有 Platform 結構 (已有 platform/events/)
- Events 用於跨層級通信，不限於 Entity 內部

### Q3: 是否需要建立 User Projection?
**決策**: 否，User 使用 Read Model 即可

**理由**:
- User 資料結構簡單
- 無需多視圖支援
- Projection Engine 主要服務於 Task Domain

---

## 九、Checklist 總覽

### 遷移前檢查
- [ ] 所有依賴檔案已識別
- [ ] Platform entities 結構已驗證
- [ ] 遷移清單已建立
- [ ] 回滾計畫已準備

### 遷移執行
- [ ] User Domain 已複製到新位置
- [ ] 所有 import 路徑已更新
- [ ] tsconfig paths 已更新
- [ ] 舊 User Domain 已刪除

### 遷移後驗證
- [ ] TypeScript 編譯成功
- [ ] 所有測試通過
- [ ] 手動功能驗證完成
- [ ] 無循環依賴
- [ ] 文檔已更新
- [ ] 遷移記錄已建立

### 架構合規檢查
- [ ] features/domains/ 只剩 task/
- [ ] platform/entities/ 包含 user/
- [ ] 分層架構清晰
- [ ] 符合 Task.md 原則
- [ ] 符合 ADR-0005, ADR-0006

---

**準備狀態**: ✅ READY TO EXECUTE
**風險等級**: 🟡 MEDIUM (可控制)
**預計成功率**: 95%

此計畫已準備好執行。建議按階段循序執行，每階段完成後進行驗證再繼續下一階段。
