# Anti-Corruption Layer (ACL)

## 目的

**防腐層**旨在防止外部系統的數據模型、業務規則或技術實現細節污染領域模型的純粹性。

## 核心概念

ACL 位於領域邊界，作為**翻譯器**和**防護盾**：

```
外部系統 → ACL (適配器 + 映射器) → 領域模型
```

**關鍵原則**:
- 外部變更不影響領域
- 領域保持純粹和穩定
- 單向轉換（外部 → 領域）

## 在架構中的位置

```
features/
└── domains/
    └── {domain-name}/
        └── acl/                    # Anti-Corruption Layer
            ├── {external-system}.mapper.ts
            └── {external-system}.adapter.ts
```

**範例**:
```
features/
└── capabilities/
    └── notification/
        └── acl/
            ├── sendgrid.mapper.ts
            └── sendgrid.adapter.ts
```

## 職責劃分

### Mapper (映射器)

**職責**: 數據模型轉換

```typescript
// acl/sendgrid.mapper.ts
export class SendGridMapper {
  // 領域模型 → 外部格式
  toSendGridFormat(notification: Notification): SendGridEmail {
    return {
      to: notification.recipient.email,
      from: 'noreply@example.com',
      subject: notification.subject,
      html: notification.body,
      // SendGrid 特定欄位
      mail_settings: {
        sandbox_mode: { enable: false }
      }
    };
  }
  
  // 外部格式 → 領域模型 (較少使用)
  fromSendGridWebhook(event: SendGridWebhookEvent): NotificationDeliveryEvent {
    return NotificationDeliveryEvent.create({
      notificationId: event.metadata.notificationId,
      status: this.mapStatus(event.event),
      timestamp: new Date(event.timestamp * 1000)
    });
  }
  
  private mapStatus(sgStatus: string): DeliveryStatus {
    // 將 SendGrid 狀態映射到領域狀態
    switch (sgStatus) {
      case 'delivered': return DeliveryStatus.Delivered;
      case 'bounce': return DeliveryStatus.Failed;
      default: return DeliveryStatus.Unknown;
    }
  }
}
```

### Adapter (適配器)

**職責**: 協議和介面適配

```typescript
// acl/sendgrid.adapter.ts
export class SendGridAdapter implements IEmailChannel {
  constructor(
    private readonly client: SendGridClient,
    private readonly mapper: SendGridMapper
  ) {}
  
  async send(notification: Notification): Promise<Result<void, SendError>> {
    try {
      // 使用 Mapper 轉換
      const externalFormat = this.mapper.toSendGridFormat(notification);
      
      // 調用外部 API
      const response = await this.client.send(externalFormat);
      
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return Result.ok(undefined);
      } else {
        return Result.err(new SendError('SendGrid API failure', response));
      }
    } catch (error) {
      // 將外部錯誤轉換為領域錯誤
      return Result.err(this.toSendError(error));
    }
  }
  
  private toSendError(error: unknown): SendError {
    // 錯誤映射邏輯
    if (error instanceof SendGridError) {
      return new SendError(error.message, error.code);
    }
    return new SendError('Unknown error', error);
  }
}
```

## 使用場景

### 1. 第三方服務整合

**範例**: Algolia 搜尋服務

```typescript
// features/capabilities/search/acl/algolia.adapter.ts
export class AlgoliaAdapter implements ISearchIndexer {
  async indexDocument(doc: SearchableDocument): Promise<Result<void>> {
    const algoliaObject = AlgoliaMapper.toAlgoliaObject(doc);
    await this.algoliaClient.saveObject(algoliaObject);
    return Result.ok(undefined);
  }
}
```

### 2. 遺留系統整合

**範例**: 舊版 REST API

```typescript
// acl/legacy-api.adapter.ts
export class LegacyApiAdapter implements IUserRepository {
  async findById(id: EntityId): Promise<Result<User, NotFoundError>> {
    const response = await this.legacyClient.get(`/users/${id.value}`);
    const legacyUser = response.data;
    
    // 轉換遺留數據格式 → 領域模型
    const user = LegacyUserMapper.toDomain(legacyUser);
    return Result.ok(user);
  }
}
```

### 3. 外部事件處理

**範例**: Stripe Webhook

```typescript
// acl/stripe-webhook.adapter.ts
export class StripeWebhookAdapter {
  handleWebhook(stripeEvent: StripeEvent): Result<DomainEvent[]> {
    switch (stripeEvent.type) {
      case 'payment_intent.succeeded':
        return Result.ok([
          PaymentCompletedEvent.fromStripeEvent(stripeEvent)
        ]);
      
      case 'payment_intent.payment_failed':
        return Result.ok([
          PaymentFailedEvent.fromStripeEvent(stripeEvent)
        ]);
      
      default:
        // 忽略不相關事件
        return Result.ok([]);
    }
  }
}
```

## 最佳實踐

### ✅ DO (應該做)

1. **每個外部系統一個 ACL**
   - 不混合多個外部系統邏輯
   - 保持 ACL 職責單一

2. **單向轉換**
   - 優先從外部 → 領域
   - 避免雙向綁定

3. **保持 Mapper 純粹**
   - 只做數據轉換
   - 不包含業務邏輯

4. **在 ACL 中處理外部錯誤**
   - 將外部異常轉換為領域錯誤
   - 不洩漏外部實現細節

5. **隔離外部依賴**
   ```typescript
   // ✅ 好的做法
   class SendGridAdapter implements IEmailChannel {
     constructor(private readonly client: SendGridClient) {}
   }
   
   // ❌ 不好的做法
   class NotificationService {
     constructor(private readonly sendgrid: SendGridClient) {}
   }
   ```

### ❌ DON'T (不應該做)

1. **不在 ACL 中包含業務邏輯**
   ```typescript
   // ❌ 錯誤
   class SendGridAdapter {
     async send(notification: Notification) {
       // 業務邏輯應在 Domain 層
       if (notification.priority === Priority.High) {
         // 特殊處理...
       }
     }
   }
   ```

2. **不直接在 Domain 層引用外部類型**
   ```typescript
   // ❌ 錯誤
   class Notification {
     toSendGrid(): SendGridEmail { ... }  // 領域洩漏
   }
   
   // ✅ 正確
   // 在 ACL 中處理轉換
   class SendGridMapper {
     toSendGridFormat(notification: Notification): SendGridEmail { ... }
   }
   ```

3. **不讓外部模型進入領域層**
   ```typescript
   // ❌ 錯誤
   async function createUser(stripeCustomer: StripeCustomer) {
     // 外部類型污染領域
   }
   
   // ✅ 正確
   async function createUser(userData: CreateUserData) {
     // 使用領域 DTO
   }
   ```

## 測試策略

```typescript
describe('SendGridAdapter', () => {
  it('should convert domain notification to SendGrid format', () => {
    const notification = Notification.create({ ... });
    const adapter = new SendGridAdapter(mockClient, mapper);
    
    // 測試 ACL 轉換邏輯
    const result = mapper.toSendGridFormat(notification);
    
    expect(result.to).toBe(notification.recipient.email);
    expect(result.subject).toBe(notification.subject);
  });
  
  it('should handle SendGrid errors gracefully', async () => {
    // Mock 外部失敗
    mockClient.send.mockRejectedValue(new SendGridError('API Error'));
    
    const result = await adapter.send(notification);
    
    // 驗證錯誤轉換
    expect(result.isErr()).toBe(true);
    expect(result.error).toBeInstanceOf(SendError);
  });
});
```

## 效益

1. **領域穩定性**: 外部變更不影響核心業務邏輯
2. **可替換性**: 輕鬆切換第三方服務提供商
3. **可測試性**: ACL 可獨立 Mock 和測試
4. **關注點分離**: 技術細節與業務邏輯隔離

---

**參考文檔**:
- Features 架構: `docs/03-architecture/features-layer.md`
- Capabilities 模式: `docs/03-architecture/features-layer.md#3-capabilities`
- Repository 模式: `docs/03-architecture/layering-model.md`
