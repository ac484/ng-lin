# 安全性與防篡改 (Security & Tamper Evidence)

## 事件不可變性保證

### 1. Cryptographic Hash
```typescript
class CausalEvent {
  hash: string; // SHA-256 hash
  
  static create(data: any): CausalEvent {
    const event = { ...data, hash: '' };
    event.hash = this.computeHash(event);
    return event;
  }
  
  static computeHash(event: any): string {
    const { hash, ...data } = event;
    return sha256(JSON.stringify(data));
  }
  
  verify(): boolean {
    const expected = CausalEvent.computeHash(this);
    return expected === this.hash;
  }
}
```

### 2. Event Chain Verification
```typescript
class EventChainVerifier {
  verify(events: CausalEvent[]): boolean {
    for (let i = 1; i < events.length; i++) {
      if (!events[i].verify()) {
        return false; // Hash 不匹配
      }
      
      if (events[i].causedBy && events[i].causedBy !== events[i - 1].id) {
        return false; // 因果鏈斷裂
      }
    }
    return true;
  }
}
```

## 授權控制

### RBAC Integration
```typescript
class AuthorizedEventBus {
  async publish(event: CausalEvent, actor: Subject) {
    const permission = await this.authz.check(actor, 'publish', event.type);
    
    if (!permission.granted) {
      throw new UnauthorizedError(`Cannot publish ${event.type}`);
    }
    
    this.eventBus.publish(event);
  }
}
```

## 審計追蹤

### Audit Log
```typescript
class AuditLogger {
  async log(event: CausalEvent, actor: Subject) {
    await auditStore.append({
      timestamp: Date.now(),
      actor: actor.id,
      action: 'event.published',
      eventId: event.id,
      eventType: event.type,
      aggregateId: event.aggregateId
    });
  }
}
```

## 敏感資料處理

### 資料加密
```typescript
class EncryptedEvent extends CausalEvent {
  encryptedData: string;
  
  static encrypt(data: any, key: string): EncryptedEvent {
    const encrypted = aes256.encrypt(JSON.stringify(data), key);
    return { ...data, encryptedData: encrypted };
  }
  
  decrypt(key: string): any {
    return JSON.parse(aes256.decrypt(this.encryptedData, key));
  }
}
```

### 資料遮罩
```typescript
class DataMasker {
  mask(event: CausalEvent): CausalEvent {
    return {
      ...event,
      email: this.maskEmail(event.email),
      phone: this.maskPhone(event.phone)
    };
  }
  
  maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    return `${local[0]}***@${domain}`;
  }
}
```

---

**參考**: [授權系統](./policy-enforcement.md) | [審計日誌](../07-operability/observability.md)
