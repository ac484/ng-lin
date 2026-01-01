# 系統概覽 (Architecture Overview)

## 全系統鳥瞰

```
UI (Angular) → Features → Core → Infrastructure
                Infrastructure ──implements──▶ Core
```

## 分層職責

### Features 層
```
features/
├── domains/        # 業務領域（BC, DDD）
├── processes/      # 流程編排（Saga/Workflow）
└── capabilities/   # 平台能力（Auth, Search）
```

### Core 層（憲法）
```
core/
├── foundation/     # identity, context, base
├── governance/     # policy, authorization, contract
└── observability/  # events, event-store, audit
```

### Infrastructure 層
```
infrastructure/
├── abstractions/   # Core 介面定義
├── firebase/       # Firebase 實作
└── registry/       # Provider 註冊
```

## 核心設計原則

### 1. 依賴反轉
- Features **僅**依賴 Core 抽象
- Infrastructure **實作** Core 介面
- 禁止 Features → Infrastructure 直接依賴

### 2. 事件驅動
```typescript
// 發布事件
eventBus.publish(new IssueCreatedEvent({...}));

// 訂閱事件
eventBus.on('IssueCreated', (event) => {...});
```

### 3. Result Pattern
```typescript
// 所有錯誤透過 Result 返回
const result = await issueRepo.findById(id);
if (result.isErr()) {
  return Result.Err(result.error);
}
const issue = result.value;
```

## 關鍵組件

### Event System
- **EventBus**: RxJS Subject-based pub/sub
- **CausalEvent**: 帶因果元數據的事件
- **Event Store**: Firestore 持久化

### Authorization
- **RBAC**: Subject-Resource-Action 模型
- **PermissionPolicy**: 細粒度權限策略
- **IAuth**: 認證抽象層

### Identity
- **EntityId**: namespace:uuid 格式
- **Namespace**: 實體類型隔離
- **IdGenerator**: UUID 生成服務

## 資料流

### 寫入（Command → Event）
```
1. UI 命令
2. Aggregate 驗證 → 產生事件
3. Event Store 持久化
4. Event Bus 發布
5. Projection 更新
```

### 讀取（Query → Projection）
```
1. UI 查詢
2. Query Handler 讀取 Projection
3. 返回讀模型
```

## 架構約束

### 禁止
- ❌ Feature → Firebase 直接依賴
- ❌ Domain 包含 UI 邏輯
- ❌ 使用 `throw new Error`
- ❌ 單檔案超過 4000 字元

### 必須
- ✅ 所有錯誤用 Result.Err
- ✅ 所有業務操作產生事件
- ✅ 事件包含因果元數據
- ✅ 狀態從事件衍生

---

**參考**：[分層模型](./layering-model.md) | [職責邊界](./responsibility-boundaries.md) | [資料流](./data-flow.md)
