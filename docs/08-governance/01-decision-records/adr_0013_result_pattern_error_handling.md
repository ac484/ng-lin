# ADR-0013: Result Pattern 錯誤處理策略

## Status
✅ Accepted (2025-12-31)

## Context (事實)
ng-lin 專案實施了 `Result<T, E>` 模式進行錯誤處理，並透過 ESLint 規則強制禁止使用 `throw` 和 `new Error()`。

**現有實施**：
- `src/app/core/result/` 完整的 Result 型別定義
- `src/app/core/error/error-factory.ts` 唯一的錯誤創建入口
- ESLint 規則禁止 `throw` 和 `new Error()`
- 分層錯誤：DomainError、ApplicationError、InfrastructureError

**問題**：
- 新開發者不理解為何禁止傳統 try/catch
- 可能繞過規則使用 `throw`
- 沒有明確文件說明錯誤處理哲學

## Decision

### 核心決策：使用 Result<T, E> 模式，禁止 throw/catch

#### 1️⃣ 錯誤必須顯性化（Explicit Error Handling）
```typescript
// ❌ BAD: 隱性錯誤，呼叫方不知道可能失敗
function getUser(id: string): User {
  if (!isValid(id)) {
    throw new Error('Invalid ID');  // 隱藏的錯誤路徑
  }
  return user;
}

// ✅ GOOD: 顯性錯誤，型別系統強制處理
function getUser(id: string): Result<User, DomainError> {
  if (!isValid(id)) {
    return err(ErrorFactory.domain.validation('Invalid ID'));
  }
  return ok(user);
}
```

#### 2️⃣ 唯一錯誤創建入口：ErrorFactory
```typescript
// ❌ BAD: 直接創建錯誤
throw new Error('Something failed');
return err(new Error('Failed'));

// ✅ GOOD: 透過 ErrorFactory
return err(ErrorFactory.domain.validation('Invalid input'));
return err(ErrorFactory.application.notFound('User', userId));
return err(ErrorFactory.infrastructure.databaseQuery(query, error));
```

#### 3️⃣ 分層錯誤對應
| 層級 | 錯誤類型 | ErrorFactory Namespace | 使用時機 |
|-----|---------|----------------------|---------|
| **Domain** | DomainError | `ErrorFactory.domain.*` | 業務規則違反、驗證失敗、不變量破壞 |
| **Application** | ApplicationError | `ErrorFactory.application.*` | 權限錯誤、資源未找到、Command/Query 失敗 |
| **Infrastructure** | InfrastructureError | `ErrorFactory.infrastructure.*` | DB 連線、外部服務、序列化失敗 |

#### 4️⃣ Result 操作鏈（Functional Composition）
```typescript
// 使用 map、andThen、unwrapOr 組合操作
const result = await getUserById(id)
  .then(Result.map(user => user.email))
  .then(Result.andThen(email => sendVerificationEmail(email)))
  .then(Result.unwrapOr({ sent: false }));
```

#### 5️⃣ ESLint 強制執行
```javascript
// eslint-rules/no-architecture-violations.js
rules: {
  'no-throw-statements': 'error',          // 禁止 throw
  'no-new-error': 'error',                 // 禁止 new Error()
  'must-use-error-factory': 'error'        // 必須使用 ErrorFactory
}
```

## Rationale (為什麼)

### 為何 Result 而非 try/catch？

#### Try/Catch 的問題
1. **隱性錯誤路徑**：呼叫方不知道函數可能拋出錯誤
2. **型別不安全**：`catch (error: unknown)` 無法知道錯誤型別
3. **控制流混亂**：錯誤可能跨越多層函數邊界
4. **難以組合**：無法用 map/flatMap 等函數式操作
5. **容易忘記處理**：沒有編譯時檢查

#### Result 的優勢
1. **顯性錯誤**：型別簽名明確標示可能失敗 `Result<T, E>`
2. **型別安全**：錯誤型別明確，IDE 自動提示
3. **強制處理**：必須處理 `ok` 或 `err` 分支才能取值
4. **可組合**：支援 `map`、`andThen`、`all` 等操作
5. **編譯時保證**：未處理錯誤會導致編譯錯誤

### 為何需要 ErrorFactory？

#### 直接創建錯誤的問題
```typescript
// ❌ 問題 1: 錯誤訊息不一致
throw new Error('User not found');
throw new Error('user not found');
throw new Error('找不到使用者');

// ❌ 問題 2: 缺少 context
throw new Error('Validation failed');  // 哪個欄位？什麼規則？

// ❌ 問題 3: 錯誤碼混亂
throw new Error('ERR_001');  // 誰知道 ERR_001 是什麼？
```

#### ErrorFactory 解決方案
```typescript
// ✅ 一致的錯誤結構
ErrorFactory.domain.validation('Email format invalid', {
  field: 'email',
  value: 'invalid-email',
  rule: 'email-format'
});

// ✅ 自動附加 ErrorCode 與 Severity
// ✅ 統一的錯誤追蹤與日誌
// ✅ 可擴展的錯誤 Context
```

### 對比其他方案

| 方案 | 優點 | 缺點 | 決策 |
|-----|------|------|------|
| **try/catch** | JavaScript 原生 | 隱性、不型別安全 | ❌ 不採用 |
| **Promise.catch()** | 適合非同步 | 仍然隱性、難組合 | ❌ 不採用 |
| **Either<L, R>** | 函數式經典 | 學習曲線陡、TypeScript 支援弱 | ❌ 不採用 |
| **Result<T, E>** | 顯性、型別安全、可組合 | 需要適應範式 | ✅ 採用 |
| **Maybe/Option** | 簡單 | 無法表達錯誤原因 | ❌ 不適合 |

## Consequences (後果)

### 正面影響
- **編譯時安全**：未處理的錯誤在編譯時被捕獲
- **自我文件化**：函數簽名明確表達可能失敗
- **可測試性**：錯誤路徑明確，易於測試
- **可維護性**：錯誤處理邏輯集中在 ErrorFactory
- **可觀測性**：所有錯誤有統一結構，易於監控

### 負面影響
- **學習曲線**：需要團隊理解 Result 模式
- **程式碼冗長**：需要明確處理 ok/err 分支
- **範式轉換**：從命令式到函數式思維

### 對 L0/L1/L2 的影響
- **L0 (Core)**：提供 Result 型別與 ErrorFactory
- **L1 (Infrastructure)**：所有外部呼叫返回 Result
- **L2 (Features)**：所有 Domain/Application 邏輯使用 Result

### 與其他 ADR 的關係
- **ADR-0002 (ESLint Enforcement)**：強制執行 Result 模式
- **ADR-0007 (Anti-Patterns)**：禁止將技術錯誤當作 Event
- **ADR-0015 (Testing Strategy)**：錯誤路徑必須有測試覆蓋

## Follow-up / Tracking (追蹤)

### 實施檢查點
- [x] Result<T, E> 型別定義完成
- [x] ErrorFactory 實施完成
- [x] ESLint 規則強制執行
- [ ] 團隊培訓完成（Result 模式使用）
- [ ] 現有程式碼遷移至 Result 模式
- [ ] 錯誤處理最佳實踐文件

### 程式碼範例（最佳實踐）
```typescript
// Domain Layer
export function createTask(
  title: string,
  assignee: UserId
): Result<Task, DomainError> {
  // 驗證輸入
  if (title.length === 0) {
    return err(ErrorFactory.domain.validation('Title cannot be empty'));
  }

  if (title.length > 200) {
    return err(ErrorFactory.domain.validation('Title too long', {
      maxLength: 200,
      actualLength: title.length
    }));
  }

  // 創建實體
  const task = new Task({ title, assignee, status: 'created' });

  // 檢查不變量
  if (!task.isValid()) {
    return err(ErrorFactory.domain.invariantViolation('Invalid task state'));
  }

  return ok(task);
}

// Application Layer
export async function executeCreateTaskCommand(
  command: CreateTaskCommand
): Promise<Result<TaskCreatedEvent, ApplicationError>> {
  // 權限檢查
  if (!command.user.canCreateTask()) {
    return err(ErrorFactory.application.forbidden('No permission to create task'));
  }

  // 呼叫 Domain
  const taskResult = createTask(command.title, command.assignee);

  if (Result.isErr(taskResult)) {
    return err(ErrorFactory.application.commandFailed(
      'CreateTask',
      taskResult.error.message,
      taskResult.error
    ));
  }

  const task = taskResult.value;

  // 持久化
  const saveResult = await taskRepository.save(task);

  if (Result.isErr(saveResult)) {
    return err(ErrorFactory.application.commandFailed(
      'CreateTask',
      'Failed to save task',
      saveResult.error
    ));
  }

  return ok(new TaskCreatedEvent(task));
}

// Infrastructure Layer
export async function saveToFirestore(
  collection: string,
  doc: unknown
): Promise<Result<void, InfrastructureError>> {
  try {
    await firestore.collection(collection).add(doc);
    return ok(undefined);
  } catch (error) {
    return err(ErrorFactory.infrastructure.databaseQuery(
      `INSERT ${collection}`,
      error as Error
    ));
  }
}
```

### 常見錯誤與解決方案

#### ❌ 錯誤 1：混用 Result 與 throw
```typescript
// BAD
function process(): Result<Data, Error> {
  if (invalid) {
    throw new Error('Invalid');  // 破壞 Result 契約
  }
  return ok(data);
}

// GOOD
function process(): Result<Data, DomainError> {
  if (invalid) {
    return err(ErrorFactory.domain.validation('Invalid'));
  }
  return ok(data);
}
```

#### ❌ 錯誤 2：不處理錯誤直接 unwrap
```typescript
// BAD: 可能 throw
const value = Result.unwrap(result);  // 危險！

// GOOD: 安全處理
if (Result.isOk(result)) {
  const value = result.value;
} else {
  console.error(result.error);
}

// BETTER: 提供預設值
const value = Result.unwrapOr(result, defaultValue);
```

### 重新檢視時機
- 當團隊反饋 Result 模式使用困難時
- 當發現大量錯誤未被妥善處理時
- 每季度 review 錯誤處理品質

### 相關 ADR
- ADR-0002: ESLint Architecture Enforcement
- ADR-0007: Event Sourcing 不適用場景
- ADR-0015: Testing Strategy & Quality Gates (待建立)

---

**實施程度**: 100% (已實施)
**參考文件**: 
- `src/app/core/result/result.ts`
- `src/app/core/error/error-factory.ts`
- `eslint-rules/no-architecture-violations.js`
