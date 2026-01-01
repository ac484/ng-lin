# 反模式：狀態洩漏 (State Leakage)

## AP-01: State Leakage

### 定義
在 L0（事實層）包含可變狀態或流程控制邏輯。

### 為何錯誤
L0 是**事實層**，僅定義**不可變事實**。包含狀態會破壞：
- 重播確定性
- 事件不可變性
- 因果清晰性

### 錯誤範例

```typescript
// ❌ Event 包含狀態
class IssueCreatedEvent {
  private _isProcessed = false;
  markAsProcessed() { this._isProcessed = true; }
}

// ❌ Event 包含流程控制
class IssueCreatedEvent {
  async handle() {
    if (this.data.priority === 'high') await notifyAdmin();
  }
}

// ❌ Event 包含決策邏輯
class IssueCreatedEvent {
  shouldNotify(): boolean { return this.data.priority === 'critical'; }
}
```

### 正確實踐

```typescript
// ✅ Event 僅為不可變資料
interface IssueCreatedEvent extends CausalEvent {
  readonly type: 'IssueCreated';
  readonly aggregateId: string;
  readonly version: number;
  readonly timestamp: string;
  readonly data: {
    readonly title: string;
    readonly priority: Priority;
    readonly createdBy: string;
  };
  readonly causedBy: CausalMetadata;
}

// ✅ 狀態在 Aggregate 中
class IssueAggregate {
  private state: IssueState;
  apply(event: IssueCreatedEvent): void {
    this.state = {
      ...initialState,
      title: event.data.title,
      status: 'open',
      createdAt: event.timestamp
    };
  }
}

// ✅ 流程在 Saga 中
class IssueLifecycleSaga {
  async handle(event: IssueCreatedEvent): Promise<void> {
    if (event.data.priority === 'high') {
      await this.notificationService.notifyAdmin(event);
    }
  }
}
```

## 檢測方式

```typescript
// ESLint 規則
interface Event {
  readonly type: string;
  readonly data: unknown;
}

// 靜態分析
class EventValidator {
  static validate(eventClass: any): void {
    const props = Object.getOwnPropertyNames(eventClass.prototype);
    props.forEach(prop => {
      if (!prop.startsWith('readonly')) {
        throw new Error(`事件屬性必須為 readonly: ${prop}`);
      }
    });
    const methods = props.filter(p => typeof eventClass.prototype[p] === 'function');
    if (methods.length > 1) {
      throw new Error(`事件不得包含方法: ${methods.join(', ')}`);
    }
  }
}
```

### Code Review 檢查清單
- [ ] Event 所有屬性是否為 `readonly`？
- [ ] Event 是否包含任何方法？
- [ ] Event 是否包含流程或決策邏輯？

## 修復步驟

1. **識別洩漏狀態**：找出非 readonly 屬性
2. **移除可變狀態**：移除所有可變屬性和方法
3. **將狀態移至 Aggregate**
4. **將流程移至 Saga**

### 真實案例

```typescript
// ❌ 錯誤
class OrderPlacedEvent {
  private _retryCount = 0;
  async retry() {
    this._retryCount++;
    if (this._retryCount > 3) throw new Error('Max retries');
    await this.process();
  }
}

// 問題：重播時 _retryCount 累加，導致結果不一致
```

## 結論

L0 = 純粹事實，不含邏輯或狀態。

**記住**：
- Event 是**發生過的事實**，不是**待執行的指令**
- 狀態屬於 Aggregate
- 流程屬於 Saga

---

**參考**：[核心原則](../02-paradigm/core-principles.md) | [分層模型](../03-architecture/layering-model.md)
