# ADR-0015: 測試策略與品質閘門

## Status
✅ Accepted (2025-12-31)

## Context (事實)
ng-lin 專案使用多種測試工具，但缺乏統一的測試策略與品質標準：

**現有測試工具**：
- Jasmine（單元測試框架）
- Karma（測試執行器）
- @delon/testing（NG-ALAIN 測試工具）
- Playwright（E2E 測試）

**問題**：
- 沒有明確的測試覆蓋率要求
- 測試命名與組織不一致
- 缺少測試金字塔指導
- 錯誤路徑測試不足

## Decision

### 核心決策：測試金字塔 + 品質閘門 + Result 模式驅動測試

#### 1️⃣ 測試金字塔（Test Pyramid）

```
        /\
       /E2E\      10% - Playwright (關鍵流程)
      /------\
     /Integr.\   20% - Integration Tests
    /----------\
   /   Unit    \ 70% - Jasmine/Karma (Domain/Application)
  /--------------\
```

##### 單元測試（Unit Tests）- 70%
**目標**：Domain 邏輯、Application 服務、Pure Functions

```typescript
// src/app/domain/task/task.aggregate.spec.ts
describe('TaskAggregate', () => {
  describe('create', () => {
    it('should create task with valid inputs', () => {
      const result = Task.create({
        title: 'Fix bug',
        assignee: UserId.create('user-1')
      });

      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.title).toBe('Fix bug');
        expect(result.value.status).toBe('created');
      }
    });

    it('should return validation error when title is empty', () => {
      const result = Task.create({
        title: '',
        assignee: UserId.create('user-1')
      });

      expect(Result.isErr(result)).toBe(true);
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(ValidationError);
        expect(result.error.message).toContain('Title cannot be empty');
      }
    });

    it('should return validation error when title exceeds 200 chars', () => {
      const result = Task.create({
        title: 'a'.repeat(201),
        assignee: UserId.create('user-1')
      });

      expect(Result.isErr(result)).toBe(true);
    });
  });
});
```

##### 整合測試（Integration Tests）- 20%
**目標**：Adapter 與外部系統整合、Event Store、Firebase

```typescript
// src/app/infrastructure/firebase/event-store/firebase-event-store.adapter.spec.ts
describe('FirebaseEventStoreAdapter', () => {
  let adapter: FirebaseEventStoreAdapter;
  let mockFirestore: jasmine.SpyObj<Firestore>;

  beforeEach(() => {
    mockFirestore = jasmine.createSpyObj('Firestore', ['collection']);
    adapter = new FirebaseEventStoreAdapter(mockFirestore);
  });

  it('should append event successfully', async () => {
    const event = new TaskCreatedEvent({ /* ... */ });
    const mockAdd = jasmine.createSpy('add').and.returnValue(Promise.resolve());
    mockFirestore.collection.and.returnValue({ add: mockAdd } as any);

    const result = await adapter.append(event);

    expect(Result.isOk(result)).toBe(true);
    expect(mockFirestore.collection).toHaveBeenCalledWith('events');
    expect(mockAdd).toHaveBeenCalledWith(event);
  });

  it('should return error when append fails', async () => {
    const event = new TaskCreatedEvent({ /* ... */ });
    const mockAdd = jasmine.createSpy('add').and.returnValue(
      Promise.reject(new Error('Network error'))
    );
    mockFirestore.collection.and.returnValue({ add: mockAdd } as any);

    const result = await adapter.append(event);

    expect(Result.isErr(result)).toBe(true);
    if (Result.isErr(result)) {
      expect(result.error).toBeInstanceOf(InfrastructureError);
    }
  });
});
```

##### E2E 測試（End-to-End Tests）- 10%
**目標**：關鍵使用者流程

```typescript
// e2e/task-management.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Task Management Flow', () => {
  test('should create, update, and complete task', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'user@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');

    // Create Task
    await page.click('button[data-test="create-task"]');
    await page.fill('[name="title"]', 'E2E Test Task');
    await page.click('button[data-test="save-task"]');

    // Verify created
    await expect(page.locator('text=E2E Test Task')).toBeVisible();

    // Update Task
    await page.click('text=E2E Test Task');
    await page.fill('[name="title"]', 'Updated Task');
    await page.click('button[data-test="save-task"]');

    // Verify updated
    await expect(page.locator('text=Updated Task')).toBeVisible();

    // Complete Task
    await page.click('button[data-test="complete-task"]');

    // Verify status
    await expect(page.locator('[data-test="task-status"]')).toHaveText('Completed');
  });
});
```

#### 2️⃣ 品質閘門（Quality Gates）

##### 必須通過的閘門
```typescript
// package.json
{
  "scripts": {
    "test": "ng test --code-coverage",
    "test:ci": "ng test --no-watch --code-coverage --browsers=ChromeHeadless",
    "test:e2e": "playwright test",
    "quality-gate": "npm run test:ci && npm run coverage-check && npm run test:e2e"
  }
}
```

##### 覆蓋率要求
```json
// karma.conf.js
coverageReporter: {
  type: 'html',
  dir: require('path').join(__dirname, './coverage'),
  check: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80
    },
    each: {
      statements: 70,
      branches: 65,
      functions: 70,
      lines: 70
    }
  }
}
```

##### PR 合併條件
- ✅ 所有測試通過（Unit + Integration + E2E）
- ✅ 覆蓋率達標（80% 整體，70% 單檔）
- ✅ 新增程式碼有對應測試
- ✅ 錯誤路徑有測試覆蓋
- ✅ ESLint 無錯誤

#### 3️⃣ Result 模式驅動測試

##### 成功路徑（Happy Path）
```typescript
it('should return Ok when operation succeeds', () => {
  const result = someFunction(validInput);
  expect(Result.isOk(result)).toBe(true);
});
```

##### 錯誤路徑（Error Path）- **必須測試**
```typescript
it('should return Err with ValidationError when input is invalid', () => {
  const result = someFunction(invalidInput);
  expect(Result.isErr(result)).toBe(true);
  if (Result.isErr(result)) {
    expect(result.error).toBeInstanceOf(ValidationError);
    expect(result.error.code).toBe(ErrorCode.VALIDATION_FAILED);
  }
});

it('should return Err with InfrastructureError when DB fails', async () => {
  mockDB.save.and.returnValue(Promise.reject(new Error('DB Error')));
  const result = await repository.save(entity);

  expect(Result.isErr(result)).toBe(true);
  if (Result.isErr(result)) {
    expect(result.error).toBeInstanceOf(InfrastructureError);
  }
});
```

#### 4️⃣ 測試組織與命名

##### AAA 模式（Arrange-Act-Assert）
```typescript
describe('TaskService', () => {
  describe('createTask', () => {
    it('should create task and publish TaskCreatedEvent', async () => {
      // Arrange
      const command = new CreateTaskCommand({ title: 'Test', assignee: 'user-1' });
      const mockEventStore = jasmine.createSpyObj('IEventStore', ['append']);
      mockEventStore.append.and.returnValue(Promise.resolve(ok(undefined)));
      const service = new TaskService(mockEventStore);

      // Act
      const result = await service.createTask(command);

      // Assert
      expect(Result.isOk(result)).toBe(true);
      expect(mockEventStore.append).toHaveBeenCalledOnceWith(
        jasmine.objectContaining({ type: 'TaskCreated' })
      );
    });
  });
});
```

##### 測試命名規範
```
describe('[ClassName]', () => {
  describe('[methodName]', () => {
    it('should [expected behavior] when [condition]', () => {
      // ...
    });
  });
});
```

#### 5️⃣ Mock & Spy 策略

##### Interface Mock
```typescript
// 使用 Jasmine Spy
const mockEventStore = jasmine.createSpyObj<IEventStore>('IEventStore', [
  'append',
  'getEvents',
  'subscribe'
]);

// 設定預期行為
mockEventStore.append.and.returnValue(Promise.resolve(ok(undefined)));
mockEventStore.getEvents.and.returnValue(Promise.resolve(ok([event1, event2])));
```

##### Partial Mock（只 mock 需要的部分）
```typescript
const mockContext = {
  user: { id: 'user-1', canCreateTask: () => true },
  workspace: { id: 'ws-1' }
} as ExecutionContext;
```

## Rationale (為什麼)

### 為何 70% 單元測試？

#### 單元測試優勢
- **快速**：毫秒級執行
- **穩定**：無外部依賴
- **精準**：錯誤定位明確
- **便宜**：維護成本低

#### 整合/E2E 測試成本
- **慢**：秒級到分鐘級
- **不穩定**：網路、環境影響
- **模糊**：錯誤定位困難
- **昂貴**：維護成本高

### 為何 80% 覆蓋率？

| 覆蓋率 | 說明 | 決策 |
|--------|------|------|
| < 60% | 風險高，品質無保證 | ❌ 不可接受 |
| 60-79% | 基本保護，仍有風險 | ⚠️ 需改善 |
| 80-89% | 良好保護，可接受 | ✅ 目標 |
| 90-100% | 過度投資，報酬遞減 | ⚠️ 不強求 |

### Result 模式對測試的影響

#### 傳統 try/catch 測試
```typescript
// ❌ 難測試：需要 try/catch
it('should throw error when invalid', () => {
  expect(() => someFunction(invalidInput)).toThrow();
});
```

#### Result 模式測試
```typescript
// ✅ 易測試：直接檢查 Result
it('should return Err when invalid', () => {
  const result = someFunction(invalidInput);
  expect(Result.isErr(result)).toBe(true);
});
```

## Consequences (後果)

### 正面影響
- **品質保證**：80% 覆蓋率提供強力保護
- **快速回饋**：70% 單元測試執行極快
- **迴歸保護**：測試防止功能退化
- **文件作用**：測試即規格文件
- **重構信心**：有測試保護的重構更安全

### 負面影響
- **初期投入**：寫測試需要時間
- **維護成本**：測試本身需要維護
- **學習曲線**：團隊需要學習測試技巧

### 對 L0/L1/L2 的影響
- **L0 (Core)**：Domain 邏輯 100% 單元測試
- **L1 (Infrastructure)**：Adapter 整合測試 + Mock
- **L2 (Features)**：Application 服務 + E2E 關鍵流程

## Follow-up / Tracking (追蹤)

### 實施檢查點
- [ ] 設定 Karma 覆蓋率閾值
- [ ] 設定 CI/CD 品質閘門
- [ ] 團隊測試培訓
- [ ] 建立測試最佳實踐文件
- [ ] Domain 層測試覆蓋率達 90%+
- [ ] Application 層測試覆蓋率達 80%+
- [ ] E2E 測試覆蓋關鍵流程

### 測試清單（按優先級）

#### P0 (Critical - 必須有測試)
- ✅ Domain 實體創建與驗證
- ✅ Domain 事件發布
- ✅ Application Command 執行
- ✅ ErrorFactory 各層級錯誤
- ✅ Result 成功與失敗路徑

#### P1 (High - 強烈建議)
- ⚠️ Projection 引擎
- ⚠️ Event Store Adapter
- ⚠️ Auth Adapter
- ⚠️ Saga 流程

#### P2 (Medium - 建議)
- ❌ UI 組件
- ❌ 路由配置
- ❌ 樣式

### 測試命名範例

```typescript
// ✅ GOOD
describe('TaskAggregate', () => {
  describe('create', () => {
    it('should create task with valid title and assignee', () => {});
    it('should return ValidationError when title is empty', () => {});
    it('should return ValidationError when title exceeds 200 chars', () => {});
    it('should return ValidationError when assignee is invalid', () => {});
  });

  describe('start', () => {
    it('should transition from created to in-progress', () => {});
    it('should publish TaskStartedEvent', () => {});
    it('should return BusinessRuleViolation when already started', () => {});
  });
});

// ❌ BAD
describe('Tests', () => {
  it('test1', () => {});
  it('test2', () => {});
});
```

### 重新檢視時機
- 每 Sprint 檢查覆蓋率趨勢
- 當覆蓋率下降超過 5% 時
- 當 CI 測試執行時間超過 10 分鐘時
- 每季度 review 測試策略有效性

### 相關 ADR
- ADR-0002: ESLint Architecture Enforcement
- ADR-0013: Result Pattern Error Handling
- ADR-0014: Firebase Infrastructure Abstraction

---

**實施程度**: 40% (工具已安裝，策略待執行)
**參考文件**: 
- `karma.conf.js`
- `playwright.config.ts`
- `package.json` (test scripts)
